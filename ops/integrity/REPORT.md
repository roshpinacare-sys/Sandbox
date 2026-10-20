# דוח-שומר-השלמות — 2026-10-20T16:08:37.031Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=10 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39440442223 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39448716142 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39436366729 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39450789878 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39440439844 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=39444652408 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39445818592 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39445825950 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39448722699 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39440442223 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 199h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `FleetHQ:receipts/office-ci/verdict.json` — source-unreachable — raw 404 — דגל-כנה, לא-מילוי
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
