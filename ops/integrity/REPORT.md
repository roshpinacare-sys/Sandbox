# דוח-שומר-השלמות — 2026-10-20T13:00:28.042Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39414648144 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39421480834 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39414992730 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39411825067 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39425950860 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39425950860 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39420101030 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39422642587 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39418129562 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39424945777 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39414648144 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:receipts/grid/verdict.json` — conclusion-contradiction — receipt=PASS run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 196h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
