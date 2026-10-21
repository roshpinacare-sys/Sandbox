# דוח-שומר-השלמות — 2026-10-21T21:43:24.535Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=9

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39667919199 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39675580247 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39662140846 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39679251188 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39658234284 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39648091966 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39648091966 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39663129819 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39669163170 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39668128221 conc=success repo=Autonomy
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39667919199 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:ops/decision-truth/verdict.json` — conclusion-contradiction — receipt=PASS_WITH_ALERTS run=null
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 29h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
