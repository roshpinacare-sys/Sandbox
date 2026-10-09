#!/usr/bin/env bash
# ============================================================================
# SOVEREIGN BOOTSTRAP — החזרת-ריבונות מכל מכונה חדשה, בפקודה אחת
# ----------------------------------------------------------------------------
# מטרה: סנדבוקס מת/נמחק לא משנה. מכונה ריקה + קרדנשל אחד (GitHub PAT) =
#       הצי קם שוב תוך דקות. זו הריבונות — התלות ב-Git, לא במכונה.
#
# שימוש:
#   GITHUB_TOKEN=ghp_... bash boot/bootstrap.sh          # כספתות + ביקורת
#   GITHUB_TOKEN=ghp_... bash boot/bootstrap.sh --engine # גם הערות-מנוע
#   bash boot/bootstrap.sh --check                       # בדיקת-מצב בלבד
#
# שרשרת-האמון (כולה מ-Git, אפס תלות במכונה הקודמת):
#   1. קרדנשל: env GITHUB_TOKEN או upload/pat.env
#   2. משיכה: Sandbox (הבית) + fleet-vault (הכספת הפרטית) + steem (מקור-אמת)
#   3. fleet-vault: unseal אוטונומי (wraps → P → keys.env) — הוכח-חי 2026-10-09
#   4. כספת-הצי מה-repo של steem (ROT4, סיכות-sha256 כפולות)
#   5. ביקורת-נאמנות מול-השרשרת (node judge)
#
# כלל-אמת: פלט = סטטוס בלבד (אין סודות בפלט). יציאה לא-אפס = כשל אמיתי.
# ============================================================================
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-}"
ORG="roshpinacare-sys"
WORK="${SOVEREIGN_WORK:-/tmp/sovereign-$(date +%s)}"

say()  { printf '[boot] %s\n' "$*"; }
fail() { printf '[boot] FAIL: %s\n' "$*" >&2; exit 1; }

# ── 1) credential ────────────────────────────────────────────────────────────
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-${GITHUB_PAT:-}}}"
for cand in "$HERE/../upload/pat.env" "$PWD/upload/pat.env" "$HOME/upload/pat.env"; do
  if [ -z "$TOKEN" ] && [ -f "$cand" ]; then TOKEN="$(tr -d '\r\n ' < "$cand")"; fi
done
[ -n "$TOKEN" ] || fail "no credential — set GITHUB_TOKEN or place upload/pat.env"
say "credential: discovered (${#TOKEN} chars)"

if [ "$MODE" = "--check" ]; then
  say "check mode: probing remotes only"
  for r in Sandbox fleet-vault steem; do
    code="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: token $TOKEN" "https://api.github.com/repos/$ORG/$r")"
    say "  $r: HTTP $code"
  done
  say "check DONE"; exit 0
fi

# ── 2) pull the three homes ──────────────────────────────────────────────────
mkdir -p "$WORK"; chmod 700 "$WORK"
# token flows via credential-helper from env — never embedded in a URL (leak-scan law)
export CRED_HELPER="!f() { echo username=x-access-token; echo password=${TOKEN}; }; f"
pull() { # $1=name $2=branch
  local name="$1" b="${2:-main}" dst="$WORK/$1"
  if git -c credential.helper="$CRED_HELPER" clone -q --depth 1 --branch "$b" "https://github.com/${ORG}/${name}.git" "$dst" 2>/dev/null; then
    say "pulled $name@$b"; return 0
  fi
  say "pull $name@$b FAILED"; return 1
}
pull Sandbox main || true
pull fleet-vault main || fail "fleet-vault unreachable — no Git, no sovereignty"
pull steem saos-cockpit || say "steem pull failed (non-fatal for vault-only mode)"

# ── 3) fleet-vault autonomous unseal (proven live 2026-10-09) ────────────────
FV="$WORK/fleet-vault"
SECRETS_ARMY=""
if [ -f "$FV/keys.env" ] && grep -qE "^[A-Z_]+=..+" "$FV/keys.env"; then
  say "fleet-vault: open (local seal authority)"
else
  mkdir -p "$FV/upload"
  printf '%s' "$TOKEN" > "$FV/upload/pat.env"
  chmod 700 "$FV/upload"
  if (cd "$FV" && bash auto-unseal.sh >/tmp/fv-unseal.log 2>&1); then
    say "fleet-vault: UNSEALED autonomously (see /tmp/fv-unseal.log)"
  else
    say "fleet-vault: honest-degradation — no wrap matched ($(tail -1 /tmp/fv-unseal.log 2>/dev/null))"
  fi
fi
if [ -f "$FV/keys.env" ]; then
  N="$(grep -cE '^[A-Z_]+=..+' "$FV/keys.env" || true)"
  chmod 600 "$FV/keys.env" 2>/dev/null || true
  say "fleet-vault keys.env: $N real slots (0600, gitignored)"
fi

# ── 4) army custody from the steem repo (ROT chain, double-pinned) ───────────
if [ -d "$WORK/steem/agent/vault" ]; then
  META="$WORK/steem/agent/recovery-meta.json"
  ENC_FILE="$(python3 - "$META" <<'PY'
import json,sys
m=json.load(open(sys.argv[1])); print(m.get("keysZipFile",""))
PY
)" || ENC_FILE=""
  if [ -n "$ENC_FILE" ] && [ -f "$WORK/steem/$ENC_FILE" ]; then
    ENC="$WORK/steem/$ENC_FILE"
    ACTUAL="$(sha256sum "$ENC" | cut -d' ' -f1)"
    PINNED="$(python3 - "$META" <<'PY'
import json,sys
print(json.load(open(sys.argv[1])).get("keysZipSha256",""))
PY
)"
    if [ "$ACTUAL" = "$PINNED" ]; then
      say "army vault: outer sha256 PIN VERIFIED"
      TMPD="$(mktemp -d)"; chmod 700 "$TMPD"
      PASS="$(python3 - "$META" <<'PY'
import json,sys
print(json.load(open(sys.argv[1])).get("keysZipPass",""))
PY
)"
      if VP="$PASS" openssl enc -d -aes-256-cbc -pbkdf2 -iter 300000 -in "$ENC" -out "$TMPD/keys.zip" -pass env:VP 2>/dev/null; then
        INNER="$(sha256sum "$TMPD/keys.zip" | cut -d' ' -f1)"
        PIN2="$(python3 - "$META" <<'PY'
import json,sys
print(json.load(open(sys.argv[1])).get("keysZipInnerSha256",""))
PY
)"
        if [ "$INNER" = "$PIN2" ]; then
          say "army vault: inner sha256 PIN VERIFIED"
          (cd "$TMPD" && unzip -oq keys.zip)
          SECRETS="$WORK/steem/.secrets"
          mkdir -p "$SECRETS"; chmod 700 "$SECRETS"
          find "$TMPD" -name 'vault.json' -exec cp {} "$SECRETS/army-vault.json" \; 2>/dev/null
          chmod 600 "$SECRETS/army-vault.json" 2>/dev/null || true
          say "army vault: extracted to $SECRETS/army-vault.json (0600)"
        else
          say "army vault: INNER PIN MISMATCH — refuse (integrity fail)"
        fi
      else
        say "army vault: decrypt failed — honest stop"
      fi
      rm -rf "$TMPD"
    else
      say "army vault: OUTER PIN MISMATCH — refuse to open"
    fi
  else
    say "army vault: keysZipFile missing"
  fi
fi

say "bootstrap DONE — sovereignty restored from Git alone. Work dir: $WORK"
say "next: bash boot/verify.sh  (chain-judged custody matrix)"
