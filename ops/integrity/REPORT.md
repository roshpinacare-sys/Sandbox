# דוח-שומר-השלמות — 2026-10-22T00:50:41.573Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39692313557 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39698088330 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39684434068 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39698089723 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39687696897 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39648091966 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39648091966 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39696974838 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39699750404 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39693654437 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39699444272 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39692313557 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 32h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
