# דוח-שומר-השלמות — 2026-10-23T10:17:44.899Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39926555627 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39929799945 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39929803962 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39937947675 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39914433699 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39930897821 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39930897821 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39930186246 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39934299895 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39930188507 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39933024565 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39926555627 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 66h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
