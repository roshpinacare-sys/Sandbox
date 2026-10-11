# דוח-אמת (verifier) · 2026-10-11T15:14:32.301Z

**overall: FAIL** · auth: token(fed) · took: 17435ms · כללים: config.json (אפס-דעה-אישית)

> יש-דברים-שבורים-ממש — זה הדוח-הכן, בלי-קישוטים.

## 1. בריאות-עורקי-הסנדבוקס
| בדיקה | דרגה | ראיה |
|---|---|---|
| `sbx.wf-sovereign-tick` | **FAIL** | no success in last 8 runs of sovereign.yml |
| `sbx.wf-sovereign-state` | **OK** | success recent |
| `sbx.wf-artery-watch` | **OK** | success recent |
| `sbx.wf-federation` | **OK** | success recent |
| `sbx.wf-fleet-yield` | **DEGRADED** | last success 154min ago > slot |
| `sbx.wf-fleet-heal` | **OK** | success recent |

## 2. קצב-בנייה-אמת (24h · code = infra/engine/src/scripts, churn = state/receipts/ops)
| ריפו | נראות | commits-24h | code-חלק | הערה |
|---|---|---|---|---|
| Sandbox | public | 100+ | 33% | ok |
| Console | public | 54 | 8% | ok |
| Domain | public | 83 | 42% | ok |
| TruthRail | public | 17 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 1 | UNMEASURED (budget) | ok |
| FleetHQ | public | 7 | UNMEASURED (budget) | ok |
| saos-runtime | public | 28 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 55 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 26% (42 commits מסווגים מתוך 345)
> שיפוט: `dev.rate` = **OK** — building: codeShare 26% over 345 commits/24h

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 3444 | 61% | 0.1h | 0.1h |
| @haran | 25 | 23% | 1.6h | 1.4h |
| @cashmachine | 25 | 28% | 1.6h | 1.8h |
| @wic | 70 | 87% | 0.8h | 3.7h |
| @woq | 70 | 85% | 0h | 3.7h |
| @tov | 70 | 88% | 22.6h | 3.9h |
| @spaminator | 69 | 0% | 57493.2h | 12895h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 878.9h |
| @ynet | 0 | 0% | 25158.7h | 758.8h |
| @hcsoldier4 | 17 | 82% | 91.6h | 21.9h |
| @hcsoldier6 | 17 | 97% | מעולם-לא | 3.8h |

> `steem.fleet` = **OK** — fleet posted 0h ago
> `steem.treasury` = **OK** — treasury headcorner at 3444 SP

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 188.2h · נמדד 2026-10-11T15:14:49.678Z
> `blurt.alive` = **FAIL** — blurt fleet silent 188h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 87 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↘ התדרדר: `sbx.wf-sovereign-tick` OK → **FAIL**
- ↘ התדרדר: `sbx.wf-fleet-yield` OK → **DEGRADED**

## 7. משימות-שנצרתו-עכשיו
- **V-LOOP-SOVEREIGN-TICK** — עורק-סנדבוקס סטלה/אדום — בדיקת-שורש + רה-הצתה (workflow_dispatch / תיקון-ה-workflow)
- **V-LOOP-FLEET-YIELD** — עורק-סנדבוקס סטלה/אדום — בדיקת-שורש + רה-הצתה (workflow_dispatch / תיקון-ה-workflow)
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
