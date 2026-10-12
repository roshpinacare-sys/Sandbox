# דוח-שומר-השלמות — 2026-10-12T05:24:09.794Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=38201376667 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=38205868221 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=38206806096 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=38204977268 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=38203174832 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=38195742752 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38194599903 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38193035917 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=38194366888 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=38185874949 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=38201376667 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:ops/decision-truth/verdict.json` — conclusion-contradiction — receipt=PASS_WITH_ALERTS run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=sandbox-sovereign@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:office/data.json` — stale — 3h > 2h — office-pulse
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

_חוקי-L0..L7 · דרישת-בעלים: אין-זיופים · גם-השומר-עצמו נבדק (L0) · fail-closed_
