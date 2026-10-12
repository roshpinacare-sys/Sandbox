# דוח-אמת (verifier) · 2026-10-12T00:43:43.410Z

**overall: FAIL** · auth: token(fed) · took: 14727ms · כללים: config.json (אפס-דעה-אישית)

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
| Console | public | 64 | 8% | ok |
| Domain | public | 100+ | 33% | ok |
| TruthRail | public | 21 | 0% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 4 | UNMEASURED (budget) | ok |
| FleetHQ | public | 100+ | UNMEASURED (budget) | ok |
| saos-runtime | public | 42 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 9 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 17% (42 commits מסווגים מתוך 440)
> שיפוט: `dev.rate` = **NOTICE** — mixed activity: codeShare 17%

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 2926 | 50% | 6.3h | 2.6h |
| @haran | 78 | 78% | 6.6h | 5.9h |
| @cashmachine | 75 | 78% | 7h | 5.9h |
| @wic | 33 | 81% | 5.5h | 5.8h |
| @woq | 70 | 90% | 5.4h | 5.5h |
| @tov | 31 | 83% | 5.5h | 5.8h |
| @spaminator | 69 | 0% | 57502.7h | 12904.4h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 888.4h |
| @ynet | 0 | 0% | 25168.2h | 768.3h |
| @hcsoldier4 | 17 | 98% | 5.1h | 5.5h |
| @hcsoldier6 | 17 | 99% | 4h | 5.7h |

> `steem.fleet` = **OK** — fleet posted 4h ago
> `steem.treasury` = **DEGRADED** — treasury headcorner at 2926 SP < 3000 (recovery-plan §3)

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 197.7h · נמדד 2026-10-12T00:43:58.071Z
> `blurt.alive` = **FAIL** — blurt fleet silent 198h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 151 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ריצה-ראשונה או אפס-שינויים-בדירוגים

## 7. משימות-שנצרתו-עכשיו
- **V-TREASURY-BALANCE** — איזון-אוצר לפי §3: לשמר ≥3,000 SP אצל-האוצר; top-up חשבונות-פעילים ל-100 SP
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
