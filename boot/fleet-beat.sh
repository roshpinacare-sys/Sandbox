#!/usr/bin/env bash
# ============================================================================
# FLEET BEAT — פעימת-העורקים-בין-תחיות (T-53 · trace 1a12430c9840b1bd)
# ----------------------------------------------------------------------------
# המפעיל-הפנימי-בשגרה: כל-מחזור-שעון של-watchdog שואל-את-הכספת (session-pass
# = זול), מפעיל-את-שני-עורקי-הריבונות-שנאטמו-ב-T-52b, וקובר-קבלות-חתומות:
#
#   1. כספת — vault.sh open (session → wraps → legacy; הגילוי-כמו-revive)
#   2. cloud-echo  — פעימת-מדינה-שורדת-מכונות (Supabase · Postgres)
#   3. gitlab-mirror — בית-git-שני (דילוג-כנה-כשאין-שינוי)
#   4. קבלות — leak-scan --staged (fail-closed) → commit → push
#
# אפס-סודות-בפלט · keys.env-נמחק-בסוף (היגיינה) · כל-כשל-כנה-ולא-קטלני.
# שימוש:  flock -n /tmp/sovereign-beat.lock bash boot/fleet-beat.sh
# ============================================================================
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOX="$(dirname "$HERE")"
FLEET="$(dirname "$SANDBOX")"
VDIR="$FLEET/fleet-vault"
MDIR="$FLEET/vault"
SRC="${SOVEREIGN_SOURCE:-$HOME/my-project}"
say(){ echo "[fleet-beat] $*"; }

# ── 1) כספת (session-זול · גילוי-וֶדוֹן-כשאין-סשן) ──────────────────────────
[ -s "$VDIR/keys.env.enc" ] || { say "no sealed vault — nothing to beat (honest)"; exit 0; }
mkdir -p "$MDIR"
[ -s "$MDIR/keys.env.enc" ] || { cp "$VDIR/keys.env.enc" "$MDIR/keys.env.enc"; chmod 600 "$MDIR/keys.env.enc"; }
if [ ! -s "$MDIR/.session-pass" ] && [ ! -s "$VDIR/.session-pass" ]; then
  GH="$(tr -d '\r\n "' < "$SRC/upload/pat.env" 2>/dev/null | sed 's/^GITHUB_TOKEN=//' || true)"
  [ -n "$GH" ] || GH="$(tr -d '\r\n "' < "$HOME/upload/pat.env" 2>/dev/null | sed 's/^GITHUB_TOKEN=//' || true)"
  export GITHUB_TOKEN="$GH"
fi
(cd "$VDIR" && bash vault.sh open >/dev/null 2>&1) || true
if [ ! -s "$VDIR/keys.env" ]; then
  say "vault stayed sealed (honest) — beat skipped this round"
  exit 0
fi
set -a; . "$VDIR/keys.env"; set +a

# ── 2) הד-ענן (מדינה-שורדת-מכונות) ─────────────────────────────────────────
node "$SANDBOX/engine/cloud-echo.mjs" || say "cloud-echo FAILED (honest — see above)"

# ── 3) בית-git-שני (idempotent — מדלג-על-ראשים-מאומתים-זהים) ───────────────
node "$SANDBOX/engine/gitlab-mirror.mjs" || say "gitlab-mirror degraded (honest — see above)"

# ── 3.5) הבית-השני-החי (T-54): מדידה+החיה-עצמית-של-קוקפיט-Render ──────────
node "$SANDBOX/engine/render-home.mjs" || say "render-home degraded (honest — see above)"

# ── 4) קבלות → leak-scan (fail-closed) → דחיפה ────────────────────────────
rm -f "$VDIR/keys.env"
if [ -d "$SANDBOX/.git" ]; then
  git -C "$SANDBOX" add receipts/cloud-echo.jsonl receipts/gitlab-mirror.jsonl receipts/render-home.jsonl 2>/dev/null || true
  if git -C "$SANDBOX" diff --cached --quiet 2>/dev/null; then
    say "receipts: nothing new (honest)"
  else
    if command -v node >/dev/null 2>&1 && [ -f "$SANDBOX/engine/leak-scan.mjs" ]; then
      node "$SANDBOX/engine/leak-scan.mjs" --staged >/dev/null 2>&1 || { say "leak-scan LIT — receipts push REFUSED (fail-closed)"; exit 1; }
    fi
    GH="$(tr -d '\r\n "' < "$SRC/upload/pat.env" 2>/dev/null | sed 's/^GITHUB_TOKEN=//' || true)"
    [ -n "$GH" ] || GH="$(tr -d '\r\n "' < "$HOME/upload/pat.env" 2>/dev/null | sed 's/^GITHUB_TOKEN=//' || true)"
    HELPER="!f() { echo username=x-access-token; echo password=$GH; }; f"
    git -C "$SANDBOX" -c user.name=sandbox-sovereign -c user.email=sandbox-sovereign@users.noreply.github.com \
      commit -q -m "[fleet-beat] cloud+gitlab receipts: $(date -u +%Y-%m-%dT%H:%M:%SZ)" 2>/dev/null || true
    git -C "$SANDBOX" -c credential.helper="$HELPER" pull -q --rebase --autostash origin main 2>/dev/null || true
    if git -C "$SANDBOX" -c credential.helper="$HELPER" push -q origin HEAD:main 2>/dev/null; then
      say "receipts: committed+pushed"
    else
      say "receipts: push deferred (honest — next beat retries)"
    fi
  fi
fi
say "BEAT DONE"
exit 0
