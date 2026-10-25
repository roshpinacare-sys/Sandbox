# דוח-שומר-השלמות — 2026-10-25T16:13:49.975Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=11 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40203080812 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=40205152338 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=40198883906 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=40196804623 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40210441113 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40179274786 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40202822614 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40206871699 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=40206876791 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40207273472 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40203080812 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 120h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
