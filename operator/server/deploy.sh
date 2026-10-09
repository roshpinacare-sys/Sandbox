#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# Sovereign Operator Gate — deploy.sh (רץ-מקומית-בלבד; אפס-סודות-לגיט)
#
# נדרש: operator/server/.env.local (gitignored) עם:
#   CLOUDFLARE_API_TOKEN=…     # טוקן-עם-Workers-permissions
#   CLOUDFLARE_ACCOUNT_ID=…
#   PASSFILE=/נתיב/מקומי/לסוד   # קובץ-הסיסמה-הראשית (לעולם-לא-מועתק-לכאן)
#
# מה-הוא-עושה:
#   1. גוזר את הקנון (אותו-חוזה-62: כל-השורות-לרצף) ומגזר PBKDF2-SHA256·650k+salt
#   2. מזריק OP_HASH כ-secret (ה-hash-חי-רק-ב-Cloudflare; לעולם-לא-בדיסק-קבוע/לוג/גיט)
#   3. יוצר SESSION_SECRET אקראי-חדש-בכל-פריסה (מבטל-סשנים-קודמים — מכוון)
#   4. wrangler deploy
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -f "$HERE/.env.local" ] || { echo "ERROR: operator/server/.env.local missing — see header"; exit 1; }
set -a; # shellcheck disable=SC1091
. "$HERE/.env.local"; set +a
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN in .env.local}"
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID in .env.local}"
: "${PASSFILE:?set PASSFILE (local path to the primary secret file) in .env.local}"
[ -f "$PASSFILE" ] || { echo "ERROR: PASSFILE does not exist (path not printed)"; exit 1; }

# wrangler: bunx אם-קיים אחרת npx
run_wrangler() { if command -v bunx >/dev/null 2>&1; then bunx wrangler "$@"; else npx --yes wrangler "$@"; fi; }

# 1) ה-hash-נגזר-בזיכרון-התהליך-ומוזרם-ישירות-ל-secret (אין-קובץ-ביניים)
echo "[deploy] deriving PBKDF2-SHA256·650k from the local passfile (canon-62 contract)…"
OP_HASH="$(node -e '
const crypto = require("crypto"), fs = require("fs");
const raw = fs.readFileSync(process.argv[1], "utf8");
if (raw.charCodeAt(0) === 0xFEFF) { console.error("ERROR: passfile opens with BOM — remove it (seal.mjs law)"); process.exit(1); }
const canon = raw.replace(/[\r\n]+/g, "");
if (Buffer.byteLength(canon, "utf8") < 16) { console.error("ERROR: canonical secret too short (<16B)"); process.exit(1); }
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(Buffer.from(canon, "utf8"), salt, 650000, 32, "sha256");
process.stdout.write("pbkdf2-sha256$650000$" + salt.toString("base64") + "$" + hash.toString("base64"));
' "$PASSFILE")"

echo "[deploy] uploading OP_HASH as worker secret (never printed)…"
printf '%s' "$OP_HASH" | CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" run_wrangler secret put OP_HASH --name sovereign-operator >/dev/null
unset OP_HASH

echo "[deploy] generating fresh SESSION_SECRET (invalidates prior sessions — by design)…"
openssl rand -base64 48 | tr -d '\n' | CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" run_wrangler secret put SESSION_SECRET --name sovereign-operator >/dev/null

echo "[deploy] deploying worker…"
CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" run_wrangler deploy

echo "[deploy] done — the gate is live. Verify: GET /healthz · wrong-password → 401 · right-password → cookie."
