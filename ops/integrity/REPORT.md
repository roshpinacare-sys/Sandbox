# דוח-שומר-השלמות — 2026-10-28T15:26:44.287Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=9 · ממצאים=10

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40699874272 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=40704136077 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=40708532375 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=40706322840 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=40695757962 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=40705533412 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40709987762 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40706326786 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40699874272 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Domain:office/data.json` — conclusion-contradiction — receipt=BLOCKED run=success
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 191h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `FleetHQ:receipts/office-ci/verdict.json` — source-unreachable — raw 404 — דגל-כנה, לא-מילוי
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
