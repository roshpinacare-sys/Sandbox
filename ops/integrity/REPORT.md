# דוח-שומר-השלמות — 2026-11-06T18:17:46.021Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=42254398566 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=42258710522 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=42249346838 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=42267283827 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=42242959653 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=42214385960 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=42214385960 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=42265286128 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=42260736123 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=42260752053 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=42263030493 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=42254398566 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 410h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
