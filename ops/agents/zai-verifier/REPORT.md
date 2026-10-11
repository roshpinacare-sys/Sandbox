# דוח-אמת (verifier) · 2026-10-11T16:29:43.814Z

**overall: FAIL** · auth: token(fed) · took: 18758ms · כללים: config.json (אפס-דעה-אישית)

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
| Sandbox | public | 100+ | 8% | ok |
| Console | public | 60 | 33% | ok |
| Domain | public | 96 | 50% | ok |
| TruthRail | public | 13 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 2 | UNMEASURED (budget) | ok |
| FleetHQ | public | 4 | UNMEASURED (budget) | ok |
| saos-runtime | public | 32 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 26 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 29% (42 commits מסווגים מתוך 333)
> שיפוט: `dev.rate` = **OK** — building: codeShare 29% over 333 commits/24h

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 2926 | 52% | 1.4h | 0.4h |
| @haran | 78 | 75% | 2.9h | 2.7h |
| @cashmachine | 75 | 75% | 2.9h | 3h |
| @wic | 33 | 76% | 0.8h | 4.9h |
| @woq | 70 | 85% | 0.8h | 4.9h |
| @tov | 31 | 78% | 23.9h | 5.1h |
| @spaminator | 69 | 0% | 57494.4h | 12896.2h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 880.1h |
| @ynet | 0 | 0% | 25160h | 760.1h |
| @hcsoldier4 | 17 | 82% | 0.7h | 23.1h |
| @hcsoldier6 | 17 | 97% | מעולם-לא | 5.1h |

> `steem.fleet` = **OK** — fleet posted 0.7h ago
> `steem.treasury` = **DEGRADED** — treasury headcorner at 2926 SP < 3000 (recovery-plan §3)

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 189.5h · נמדד 2026-10-11T16:30:02.521Z
> `blurt.alive` = **FAIL** — blurt fleet silent 190h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 94 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `dev.rate` NOTICE → **OK**
- ↘ התדרדר: `steem.treasury` OK → **DEGRADED**

## 7. משימות-שנצרתו-עכשיו
- **V-TREASURY-BALANCE** — איזון-אוצר לפי §3: לשמר ≥3,000 SP אצל-האוצר; top-up חשבונות-פעילים ל-100 SP
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
