# דוח-שומר-השלמות — 2026-10-22T12:15:00.836Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39764951776 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39768282494 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39771610860 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39754723345 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39775650044 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39773092658 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39763390743 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39773465838 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39770046703 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39774977124 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39764951776 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 44h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
