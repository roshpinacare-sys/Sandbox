# דוח-אמת (verifier) · 2026-10-11T15:47:03.723Z

**overall: FAIL** · auth: token(fed) · took: 16719ms · כללים: config.json (אפס-דעה-אישית)

> יש-דברים-שבורים-ממש — זה הדוח-הכן, בלי-קישוטים.

## 1. בריאות-עורקי-הסנדבוקס
| בדיקה | דרגה | ראיה |
|---|---|---|
| `sbx.wf-sovereign-tick` | **OK** | success recent |
| `sbx.wf-sovereign-state` | **OK** | success recent |
| `sbx.wf-artery-watch` | **OK** | success recent |
| `sbx.wf-federation` | **OK** | success recent |
| `sbx.wf-fleet-yield` | **OK** | success recent |
| `sbx.wf-fleet-heal` | **OK** | success recent |

## 2. קצב-בנייה-אמת (24h · code = infra/engine/src/scripts, churn = state/receipts/ops)
| ריפו | נראות | commits-24h | code-חלק | הערה |
|---|---|---|---|---|
| Sandbox | public | 100+ | 0% | ok |
| Console | public | 55 | 8% | ok |
| Domain | public | 92 | 58% | ok |
| TruthRail | public | 16 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 1 | UNMEASURED (budget) | ok |
| FleetHQ | public | 6 | UNMEASURED (budget) | ok |
| saos-runtime | public | 30 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 40 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 21% (42 commits מסווגים מתוך 340)
> שיפוט: `dev.rate` = **NOTICE** — mixed activity: codeShare 21%

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 3166 | 56% | 0.6h | 0.2h |
| @haran | 78 | 75% | 2.2h | 2h |
| @cashmachine | 75 | 75% | 2.2h | 2.3h |
| @wic | 33 | 76% | 0.1h | 4.2h |
| @woq | 34 | 72% | 0.1h | 4.2h |
| @tov | 31 | 78% | 23.2h | 4.4h |
| @spaminator | 69 | 0% | 57493.7h | 12895.5h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 879.4h |
| @ynet | 0 | 0% | 25159.3h | 759.3h |
| @hcsoldier4 | 17 | 82% | 0.5h | 22.4h |
| @hcsoldier6 | 17 | 97% | מעולם-לא | 4.4h |

> `steem.fleet` = **OK** — fleet posted 0.1h ago
> `steem.treasury` = **OK** — treasury headcorner at 3166 SP

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 188.8h · נמדד 2026-10-11T15:47:20.400Z
> `blurt.alive` = **FAIL** — blurt fleet silent 189h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 90 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `sbx.wf-sovereign-tick` FAIL → **OK**
- ↗ השתפר: `sbx.wf-fleet-yield` DEGRADED → **OK**
- ↘ התדרדר: `dev.rate` OK → **NOTICE**

## 7. משימות-שנצרתו-עכשיו
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
