# דוח-שומר-השלמות — 2026-10-20T06:15:15.648Z

**פסק-דין: PASS_WITH_ALERTS** · מקורות=9 · טענות-שאומתו=0 · ממצאים=21

## טענות-שאומתו מול Actions API
- (אין)

## ממצאים (מדורג — כשל-רשת-שלנו לעולם לא מדווח כזיוף)
- **MEDIUM** `self:ops/integrity/verdict.json` — api-unreachable — HTTP לא-אמין עבור run 38238019604 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `Sandbox` — tree-unreachable — HTTP 401 — גילוי-דינמי דולג (לא-זיוף)
- **MEDIUM** `FleetHQ` — tree-unreachable — HTTP 401 — גילוי-דינמי דולג (לא-זיוף)
- **MEDIUM** `Domain` — tree-unreachable — HTTP 401 — גילוי-דינמי דולג (לא-זיוף)
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — api-unreachable — HTTP לא-אמין עבור run 38983667757 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `FleetHQ:receipts/office-ci/verdict.json` — api-unreachable — HTTP לא-אמין עבור run 39379041024 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `Domain:office/data.json` — api-unreachable — HTTP לא-אמין עבור run 39378102339 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `Domain:office/data.json` — api-unreachable — HTTP לא-אמין עבור run 39375845281 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `Domain:office/data.json` — api-unreachable — HTTP לא-אמין עבור run 39378215262 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `Domain:office/data.json` — api-unreachable — HTTP לא-אמין עבור run 39372771841 — לא-ניתן-לאימות, לא-זיוף
- **MEDIUM** `Sandbox:ops/flow/receipt.json` — agent-authored-receipt — committer=roshpinacare-sys@users.noreply.github.com — קבלה-הטוענת-הרצת-Actions שנכתבה-מחוץ-ל-Actions
- **FLAG** `Sandbox:receipts/wallet/verdict.json` — stale — 159h > 26h — artery-wallet
- **FLAG** `Sandbox:receipts/wallet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-wallet
- **FLAG** `Sandbox:receipts/fleet/verdict.json` — stale — 160h > 26h — artery-fleet
- **FLAG** `Sandbox:receipts/fleet/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-fleet
- **FLAG** `Sandbox:receipts/grid/verdict.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: artery-grid
- **FLAG** `Sandbox:receipts/latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: sovereign.yml
- **FLAG** `Sandbox:ops/flow/receipt.json` — stale — 78h > 26h — artery-flow
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — stale — 190h > 26h — verifier.yml
- **FLAG** `Sandbox:state/verifier/verdict-latest.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: verifier.yml
- **FLAG** `Domain:agents/office-live.json` — unprovenanced — אין-טענת-run — שדרוג-מתוכנן ל-lane: office lane

[owner-directive]
