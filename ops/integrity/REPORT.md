# דוח-שומר-השלמות — 2026-11-01T09:24:10.221Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=6 · ממצאים=14

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=41286413230 conc=failure repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=41283765129 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=41281178444 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=41192342567 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=41192342567 conc=success repo=FleetHQ
- ✅ `Sandbox:ops/integrity/verdict.json` — run=41286413230 conc=failure repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Domain:office/data.json` — conclusion-contradiction — receipt=BLOCKED run=success
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — time-sanity — 2026-11-01T08:44:30.858Z outside window 2026-11-01T09:44:03Z
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — time-sanity — 2026-11-01T08:30:58.768Z outside window 2026-11-01T09:30:47Z
- **MEDIUM** `Domain:office/data.json` — time-sanity — 2026-11-01T08:01:58.794Z outside window 2026-11-01T09:01:45Z
- **MEDIUM** `Domain:office/data.json` — time-sanity — 2026-11-01T08:02:06.146Z outside window 2026-11-01T09:01:47Z
- **MEDIUM** `Sandbox:ops/decision-truth/verdict.json` — time-sanity — 2026-11-01T08:31:00Z outside window 2026-11-01T09:30:48Z
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=326012154+roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 281h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
