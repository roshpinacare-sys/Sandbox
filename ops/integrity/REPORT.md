# דוח-שומר-השלמות — 2026-10-21T07:43:33.164Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=11 · טענות-שאומתו=12 · ממצאים=7

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=39553505024 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=39559039198 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=39553502826 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/grid/verdict.json` — run=39563864891 conc=failure repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=39545945082 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=39563536822 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39561758021 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=39560899203 conc=success repo=Autonomy
- ✅ `Domain:office/data.json` — run=39557992648 conc=failure repo=Autonomy
- ✅ `Domain:office/data.json` — run=39560901798 conc=success repo=Autonomy
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=39562095225 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=39553505024 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/fleet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/grid/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **MEDIUM** `Sandbox:receipts/wallet/verdict.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
