# דוח-שומר-השלמות — 2026-11-01T10:57:16.691Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=10 · ממצאים=10

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=41292964624 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=41294848912 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=41296790390 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=41295781157 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=41298578576 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=41192342567 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=41296582075 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=41296583502 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=41296794725 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=41292964624 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Domain:office/data.json` — conclusion-contradiction — receipt=BLOCKED run=success
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — time-sanity — 2026-11-01T08:44:30.858Z outside window 2026-11-01T09:44:03Z
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 282h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
