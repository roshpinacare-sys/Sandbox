# דוח-שומר-השלמות — 2026-10-26T00:07:39.905Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40240641859 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=40242684415 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=40236427690 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=40243721166 conc=failure repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40219202644 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40219202644 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40245174491 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40246502065 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=40246504427 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40244779271 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40240641859 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:ops/flow/receipt.json` — conclusion-contradiction — receipt=PASS run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 128h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
