# דוח-שומר-השלמות — 2026-10-26T14:20:40.104Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40325116079 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=40328668320 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=40336532249 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=40311536956 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40338300611 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40304242383 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40334784851 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40334771041 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=40330841562 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40332533119 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40325116079 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 142h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
