# דוח-שומר-השלמות — 2026-11-07T13:18:10.611Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=42369199648 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=42371081372 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=42376185740 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=42376186415 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=42375114867 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=42366245529 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=42366245529 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=42369932844 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=42373865041 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=42369934347 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=42373201865 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=42369199648 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 429h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
