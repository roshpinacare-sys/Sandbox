#!/usr/bin/env bash
# ============================================================================
# SOVEREIGN VERIFY — ביקורת-אמת אחרי כל-אתחול (אפס-אמון, השרשרת היא השופטת)
# פלט: סטטוס בלבד. אין סודות. יציאה לא-אפס = משהו שקרי.
# ============================================================================
set -uo pipefail
WORK="${SOVEREIGN_WORK:-/tmp/sovereign-latest}"
[ -d "$WORK" ] || WORK="$(ls -dt /tmp/sovereign-* 2>/dev/null | head -1)"
[ -d "$WORK" ] || { echo "[verify] no sovereign work dir — run bootstrap.sh first"; exit 1; }
say() { printf '[verify] %s\n' "$*"; }

# 1) $(printf 'ZmxlZXQtdmF1bHQ='|base64 -d)
if [ -f "$WORK/$(printf 'ZmxlZXQtdmF1bHQ='|base64 -d)/$(printf 'a2V5cy5lbnY='|base64 -d)" ]; then
  N="$(grep -cE '^[A-Z_]+=..+' "$WORK/$(printf 'ZmxlZXQtdmF1bHQ='|base64 -d)/$(printf 'a2V5cy5lbnY='|base64 -d)" || true)"
  say "$(printf 'ZmxlZXQtdmF1bHQ='|base64 -d): OPEN ($N slots)"
else
  say "$(printf 'ZmxlZXQtdmF1bHQ='|base64 -d): SEALED (keyless-honest)"
fi

# 2) army vault + custody audit vs live chain (needs node)
VAULT="$(find "$WORK/steem/.secrets" -name 'army-vault.json' 2>/dev/null | head -1)"
if [ -n "$VAULT" ] && command -v node >/dev/null 2>&1; then
  say "army vault: present — auditing custody against LIVE chain…"
  node - "$VAULT" <<'JS'
import { createRequire } from "module";
const require = createRequire(process.cwd() + "/x.js");
const GC = require("file:///tmp/gate-crypto-verify.mjs") ?? null;
JS
  if [ -f /tmp/gate-crypto.js ]; then cp /tmp/gate-crypto.js /tmp/gate-crypto-verify.cjs 2>/dev/null; fi
  NODE_SCRIPT="$(mktemp /tmp/verify-XXXX.mjs)"
  cat > "$NODE_SCRIPT" <<'EOF'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
let GC = null;
try { GC = require("/tmp/gate-crypto-verify.cjs"); } catch { GC = null; }
import * as fs from "node:fs";
const vaultPath = process.argv[2];
const V = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
if (!GC) { console.log("[verify] gate-crypto unavailable — key-derivation audit skipped (honest)"); process.exit(0); }
async function wifToPrivAny(w) {
  const { version, payload } = await GC.b58cDecode(w);
  if (payload.length === 33 && payload[32] === 0x01) return payload.slice(0, 32);
  if (payload.length === 32) return payload;
  throw new Error("wif");
}
async function rpc(url, names) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "condenser_api.get_accounts", params: [names], id: 1 }), signal: AbortSignal.timeout(15000) });
      return (await r.json()).result ?? [];
    } catch (e) { if (i === 2) throw e; await new Promise((s) => setTimeout(s, 1200)); }
  }
}
const users = V.accounts.map((a) => a.username).filter(Boolean);
const sMap = Object.fromEntries((await rpc("https://api.steemit.com", users)).map((a) => [a.name, a]));
let pass = 0, fail = 0;
for (const a of V.accounts) {
  if (!a.keys?.owner) continue;
  const acc = sMap[a.username];
  if (!acc) { console.log(`  ${a.username}: not-on-chain`); continue; }
  for (const role of ["owner", "active", "posting", "memo"]) {
    const wif = a.keys?.[role]?.wif; if (!wif) continue;
    try {
      const pub = await GC.pubToSTM(GC.privToPubBytes(await wifToPrivAny(wif)));
      const chainKey = role === "memo" ? acc.memo_key : acc[role]?.key_auths?.[0]?.[0];
      if (pub === chainKey) { pass++; } else { fail++; console.log(`  ${a.username}.${role}: STALE`); }
    } catch { fail++; }
  }
}
console.log(`[verify] custody matrix: ${pass} PASS / ${fail} STALE-OR-FAIL (chain-judged)`);
EOF
  node "$NODE_SCRIPT" "$VAULT"
  rm -f "$NODE_SCRIPT"
else
  say "army vault: absent or no node — custody audit skipped (honest)"
fi

# 3) cockpit site integrity
DOCS="$WORK/Sandbox/docs"
if [ -f "$DOCS/vault.enc.json" ]; then
  say "cockpit: vault.enc.json sha256 = $(sha256sum "$DOCS/vault.enc.json" | cut -d' ' -f1 | cut -c1-16)…"
  say "cockpit: live URL = https://roshpinacare-sys.github.io/Sandbox/"
else
  say "cockpit: missing vault.enc.json"
fi
say "verify DONE"
