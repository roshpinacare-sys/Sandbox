# דוח-אמת (verifier) · 2026-10-11T22:23:35.965Z

**overall: FAIL** · auth: token(fed) · took: 15370ms · כללים: config.json (אפס-דעה-אישית)

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
| Sandbox | public | 100+ | 17% | ok |
| Console | public | 57 | 0% | ok |
| Domain | public | 100+ | 50% | ok |
| TruthRail | public | 18 | 0% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 4 | UNMEASURED (budget) | ok |
| FleetHQ | public | 100+ | UNMEASURED (budget) | ok |
| saos-runtime | public | 34 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 6 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 19% (42 commits מסווגים מתוך 419)
> שיפוט: `dev.rate` = **NOTICE** — mixed activity: codeShare 19%

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 2926 | 50% | 3.9h | 0.2h |
| @haran | 78 | 78% | 4.3h | 3.6h |
| @cashmachine | 75 | 78% | 4.6h | 3.6h |
| @wic | 33 | 81% | 3.2h | 3.5h |
| @woq | 70 | 90% | 3.1h | 3.2h |
| @tov | 31 | 83% | 3.2h | 3.5h |
| @spaminator | 69 | 0% | 57500.3h | 12902.1h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 886h |
| @ynet | 0 | 0% | 25165.9h | 766h |
| @hcsoldier4 | 17 | 98% | 2.8h | 3.2h |
| @hcsoldier6 | 17 | 99% | 1.7h | 3.4h |

> `steem.fleet` = **OK** — fleet posted 1.7h ago
> `steem.treasury` = **DEGRADED** — treasury headcorner at 2926 SP < 3000 (recovery-plan §3)

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 195.4h · נמדד 2026-10-11T22:23:51.283Z
> `blurt.alive` = **FAIL** — blurt fleet silent 195h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 139 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↘ התדרדר: `dev.rate` OK → **NOTICE**

## 7. משימות-שנצרתו-עכשיו
- **V-TREASURY-BALANCE** — איזון-אוצר לפי §3: לשמר ≥3,000 SP אצל-האוצר; top-up חשבונות-פעילים ל-100 SP
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
