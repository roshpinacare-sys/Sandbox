# דוח-שומר-השלמות — 2026-10-22T15:23:23.763Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39790129904 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39794197478 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39794197626 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39804275191 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39782340630 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39802281875 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39796207200 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39792681069 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39797122412 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39788425788 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39798079448 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39790129904 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 47h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
