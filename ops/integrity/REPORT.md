# דוח-שומר-השלמות — 2026-10-11T22:59:06.821Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=8 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=38176261296 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=38180404704 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=38180410722 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=38182218205 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38181845184 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38180404704 conc=success repo=Sandbox
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=38180507057 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=38176261296 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare@gmail.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare@gmail.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/fleet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-fleet
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

_חוקי-L0..L7 · דרישת-בעלים: אין-זיופים · גם-השומר-עצמו נבדק (L0) · fail-closed_
