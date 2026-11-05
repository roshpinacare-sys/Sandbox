# דוח-שומר-השלמות — 2026-11-05T15:29:08.667Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=10 · ממצאים=10

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=42039889862 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=42044263885 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=42033924896 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=42044271694 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=42025350436 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=42025350436 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=42031242757 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=42043209453 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=42039081007 conc=success repo=Autonomy
- ✅ `Sandbox:ops/integrity/verdict.json` — run=42039889862 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:receipts/grid/verdict.json` — conclusion-contradiction — receipt=PASS run=null
- **CRITICAL** `Sandbox:ops/decision-truth/verdict.json` — conclusion-contradiction — receipt=PASS_WITH_ALERTS run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 383h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
