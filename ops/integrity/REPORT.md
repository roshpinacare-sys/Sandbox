# דוח-שומר-השלמות — 2026-10-25T11:28:28.844Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40182599622 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=40184453280 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=40187149949 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=40188976056 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=40181630861 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40179274786 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40179274786 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40183695092 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40186765251 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=40184971716 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40187151108 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40182599622 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 115h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
