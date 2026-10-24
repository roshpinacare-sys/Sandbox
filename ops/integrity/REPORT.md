# דוח-שומר-השלמות — 2026-10-24T13:15:49.109Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40090710160 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=40092466445 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=40089820788 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=40096374417 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=40091588034 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40079565133 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40079565133 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40090612728 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40094673562 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40094681107 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40094322597 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40090710160 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 93h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
