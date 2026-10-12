# דוח-שומר-השלמות — 2026-10-12T07:33:43.356Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=38215078781 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=38212844567 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=38211632006 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=38217459094 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=38203174832 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=38195742752 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38194599903 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38193035917 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=38194366888 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=38185874949 conc=success repo=Sandbox
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=38216253843 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=38215078781 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:office/data.json` — stale — 5h > 2h — office-pulse
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

_חוקי-L0..L7 · דרישת-בעלים: אין-זיופים · גם-השומר-עצמו נבדק (L0) · fail-closed_
