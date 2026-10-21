# דוח-שומר-השלמות — 2026-10-21T17:04:20.688Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39626225198 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39634348133 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39638329557 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39640341245 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39626225452 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39639128912 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39638948699 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39627151379 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39632661657 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39636549331 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39634354603 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39626225198 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
