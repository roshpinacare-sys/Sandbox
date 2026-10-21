# דוח-שומר-השלמות — 2026-10-21T13:57:28.263Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39599214025 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39606578607 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39592316508 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39595758873 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39609905421 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39605525197 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39604899091 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39604892748 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39601234822 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39610452298 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39599214025 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
