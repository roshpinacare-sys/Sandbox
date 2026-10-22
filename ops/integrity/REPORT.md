# דוח-שומר-השלמות — 2026-10-22T09:08:48.915Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39749571041 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39744523267 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39751278239 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39753004289 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39729929127 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39752818815 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39750559369 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39744073234 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39749753774 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39746410543 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39747897525 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39749571041 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 41h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
