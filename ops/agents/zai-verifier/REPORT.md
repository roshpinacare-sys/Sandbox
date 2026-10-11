# דוח-אמת (verifier) · 2026-10-11T20:16:27.722Z

**overall: FAIL** · auth: token(fed) · took: 17394ms · כללים: config.json (אפס-דעה-אישית)

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
| Console | public | 49 | 25% | ok |
| Domain | public | 100+ | 50% | ok |
| TruthRail | public | 14 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 4 | UNMEASURED (budget) | ok |
| FleetHQ | public | 23 | UNMEASURED (budget) | ok |
| saos-runtime | public | 33 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 6 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 29% (42 commits מסווגים מתוך 329)
> שיפוט: `dev.rate` = **OK** — building: codeShare 29% over 329 commits/24h

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 2926 | 51% | 1.8h | 0h |
| @haran | 78 | 78% | 2.1h | 1.4h |
| @cashmachine | 75 | 78% | 2.5h | 1.4h |
| @wic | 33 | 81% | 1.1h | 1.4h |
| @woq | 70 | 90% | 1h | 1.1h |
| @tov | 31 | 83% | 1.1h | 1.4h |
| @spaminator | 69 | 0% | 57498.2h | 12900h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 883.9h |
| @ynet | 0 | 0% | 25163.8h | 763.8h |
| @hcsoldier4 | 17 | 98% | 0.6h | 1.1h |
| @hcsoldier6 | 17 | 99% | 3.2h | 1.3h |

> `steem.fleet` = **OK** — fleet posted 0.6h ago
> `steem.treasury` = **DEGRADED** — treasury headcorner at 2926 SP < 3000 (recovery-plan §3)

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 193.3h · נמדד 2026-10-11T20:16:45.075Z
> `blurt.alive` = **FAIL** — blurt fleet silent 193h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 108 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `dev.rate` NOTICE → **OK**

## 7. משימות-שנצרתו-עכשיו
- **V-TREASURY-BALANCE** — איזון-אוצר לפי §3: לשמר ≥3,000 SP אצל-האוצר; top-up חשבונות-פעילים ל-100 SP
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
