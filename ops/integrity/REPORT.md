# דוח-שומר-השלמות — 2026-11-01T17:11:04.027Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=8

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=41322108743 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=41324321878 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=41319843173 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=41326628705 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=41312104621 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=41329725027 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=41300907087 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=41324007979 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=41328564984 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=41328567865 conc=failure repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=41326629533 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=41322108743 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 289h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
