# דוח-שומר-השלמות — 2026-10-22T18:31:02.077Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39818350371 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39818347225 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39828116492 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39814606901 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39805328199 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39805328199 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39828381023 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39828368875 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39822108971 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39830024871 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39818350371 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:receipts/wallet/verdict.json` — conclusion-contradiction — receipt=PASS run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 50h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
