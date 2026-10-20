# דוח-שומר-השלמות — 2026-10-20T08:44:24.936Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39391105710 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39387769112 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39391966426 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39394289281 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39386187185 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39389402073 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39389402073 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39389106883 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39386150069 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39389109518 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39392684740 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39391105710 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=z@container — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=z@container — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=z@container — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=z@container — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 192h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
