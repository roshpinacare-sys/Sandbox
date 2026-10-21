# דוח-שומר-השלמות — 2026-10-21T23:17:02.102Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39681033048 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39687694538 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39684434068 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39687696897 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39648091966 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39648091966 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39688692403 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39689474328 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=39689476786 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39687698546 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39681033048 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:receipts/grid/verdict.json` — conclusion-contradiction — receipt=FAIL run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 31h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
