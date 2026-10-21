# דוח-שומר-השלמות — 2026-10-21T06:07:39.381Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39544739876 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39549665527 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39538684232 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39545945082 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39553190942 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39553190942 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39548753068 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39551378831 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39552511241 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39550920762 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39544739876 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
