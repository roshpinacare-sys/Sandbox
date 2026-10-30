# דוח-שומר-השלמות — 2026-10-30T05:37:31.801Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=41007459909 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=41007457564 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=41000063532 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=41005007281 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=41003798764 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40900904236 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40900904236 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=41004724114 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=41007138672 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=41005009061 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=41007459909 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Domain:office/data.json` — conclusion-contradiction — receipt=BLOCKED run=success
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 229h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
