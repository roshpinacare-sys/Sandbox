# דוח-שומר-השלמות — 2026-10-22T02:24:27.453Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=10 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39702104348 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39707353739 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39702104919 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39709942740 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=39709167301 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39707979840 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39706456683 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39702396709 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39709943785 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39702104348 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 34h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `FleetHQ:receipts/office-ci/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office-ci
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
