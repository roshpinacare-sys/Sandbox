# דוח-שומר-השלמות — 2026-10-22T13:48:39.706Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=10 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39776710433 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39771610860 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39782340630 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39788943753 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39783957221 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39775904698 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39780706170 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39775925729 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39782345159 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39776710433 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/wallet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-wallet
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 45h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
