# דוח-שומר-השלמות — 2026-10-11T21:06:55.622Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=9 · טענות-שאומתו=5 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — אין-קבלה-קודמת — ריצה-ראשונה
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=38170823364 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=38174549702 conc=failure repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38168008222 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38163792454 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=z@container — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/fleet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-fleet
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:ops/flow/receipt.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-flow
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

_חוקי-L0..L7 · דרישת-בעלים: אין-זיופים · גם-השומר-עצמו נבדק (L0) · fail-closed_
