# דוח-שומר-השלמות — 2026-10-22T10:41:36.104Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39753042539 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39756441752 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39751278239 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39754723345 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39764341073 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39761845815 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39753177975 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39760018161 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39756621566 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39761579619 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39753042539 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 42h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
