# דוח-שומר-השלמות — 2026-10-21T12:23:43.981Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39587403037 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39594076791 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39592316508 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39595758873 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39598681950 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39596072668 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39594324163 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39590814251 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39589226058 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39595750926 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39587403037 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
