# דוח-שומר-השלמות — 2026-10-12T03:51:10.590Z

**פסק-דין: FAIL** · מקורות=11 · טענות-שאומתו=11 · ממצאים=4

## טענות-שאומתו מול Actions API
- ✅ `self:ops/integrity/verdict.json` — run=38195222558 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/wallet/verdict.json` — run=38199615206 conc=success repo=Sandbox
- ✅ `Sandbox:receipts/fleet/verdict.json` — run=38196099179 conc=success repo=Sandbox
- ✅ `Sandbox:ops/flow/receipt.json` — run=38188544606 conc=success repo=Sandbox
- ✅ `FleetHQ:receipts/office-ci/verdict.json` — run=38195742752 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38194599903 conc=success repo=FleetHQ
- ✅ `Domain:office/data.json` — run=38193035917 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=38194366888 conc=success repo=Sandbox
- ✅ `Domain:office/data.json` — run=38185874949 conc=success repo=Sandbox
- ✅ `Sandbox:ops/decision-truth/verdict.json` — run=38200493094 conc=success repo=Sandbox
- ✅ `Sandbox:ops/integrity/verdict.json` — run=38195222558 conc=success repo=Sandbox

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **CRITICAL** `Sandbox:receipts/grid/verdict.json` — conclusion-contradiction — receipt=FAIL run=null
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

_חוקי-L0..L7 · דרישת-בעלים: אין-זיופים · גם-השומר-עצמו נבדק (L0) · fail-closed_
