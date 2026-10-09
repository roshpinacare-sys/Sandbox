#!/usr/bin/env sh
# ═══════════════════════════════════════════════════════════════════════
# federation-check.sh — הפדרציה-בבלוק-אחד (T-46 · agent-2)
# מכל-מכונה, מכל-clone של-הריפו: selftest → סריקה-חיה → הליכת-מרקל → פסק.
# אפס-תלות-חוץ-מחוץ-ל-repo. אפס-סודות-על-הדיסק: הטוקן (אם-בכלל) זורם
# env←git-config בזיכרון-בלבד — מעולם-לא-נדפס, לא-נכתב, לא-נשמר.
# ═══════════════════════════════════════════════════════════════════════
set -eu
cd "$(dirname "$0")/.."

echo "── 1/3 selftest (שופט-המנוע) ──"
node engine/federation-selftest.mjs

echo "── 2/3 סריקה-חיה מול-GitHub ──"
if [ -z "${FED_TOKEN:-}" ]; then
  URL=$(git config --get remote.origin.url 2>/dev/null || true)
  case "$URL" in
    https://*@github.com/*) FED_TOKEN=$(printf '%s' "$URL" | sed -n 's#https://\([^@]*\)@github\.com/.*#\1#p' || true) ;;
  esac
fi
FED_TOKEN="$FED_TOKEN" node engine/federation-scan.mjs

echo "── 3/3 הליכת-מרקל ──"
node engine/federation-scan.mjs --verify-ledger --ledger federation/LEDGER.jsonl

echo "── פסק: הפדרציה-נבדקה-מקצה-לקצה ──"
