# דוח-שומר-השלמות — 2026-10-12T00:39:15.817Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=9 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=38185922815 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=38186675114 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=38185874949 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=38188544606 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=38188653692 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38182218205 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38180404704 conc=success repo=Sandbox
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=38187501208 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=38185922815 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare@gmail.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare@gmail.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare@gmail.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

_חוקי-L0..L7 · דרישת-בעלים: אין-זיופים · גם-השומר-עצמו נבדק (L0) · fail-closed_
