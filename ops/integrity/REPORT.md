# דוח-שומר-השלמות — 2026-10-26T16:02:23.351Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=10 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=40338637958 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=40354975995 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=40341026665 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=40351666473 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40350020074 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=40349525205 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=40350969610 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=40350979294 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=40350404331 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=40338637958 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/wallet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-wallet
- **FLAG** `Sandbox:receipts/fleet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-fleet
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 144h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
