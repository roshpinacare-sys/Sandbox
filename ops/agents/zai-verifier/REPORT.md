# דוח-אמת (verifier) · 2026-10-11T18:24:12.615Z

**overall: FAIL** · auth: token(fed) · took: 15333ms · כללים: config.json (אפס-דעה-אישית)

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
| Console | public | 57 | 33% | ok |
| Domain | public | 96 | 33% | ok |
| TruthRail | public | 13 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 2 | UNMEASURED (budget) | ok |
| FleetHQ | public | 4 | UNMEASURED (budget) | ok |
| saos-runtime | public | 32 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 2 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 21% (42 commits מסווגים מתוך 306)
> שיפוט: `dev.rate` = **NOTICE** — mixed activity: codeShare 21%

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 2926 | 52% | 1h | 2.3h |
| @haran | 78 | 75% | 0.3h | 4.6h |
| @cashmachine | 75 | 75% | 0.6h | 4.9h |
| @wic | 33 | 76% | 1h | 6.8h |
| @woq | 70 | 85% | 2.7h | 6.8h |
| @tov | 31 | 78% | 1.8h | 7h |
| @spaminator | 69 | 0% | 57496.3h | 12898.1h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 882.1h |
| @ynet | 0 | 0% | 25161.9h | 762h |
| @hcsoldier4 | 17 | 98% | 2.6h | 1h |
| @hcsoldier6 | 17 | 97% | 1.4h | 7h |

> `steem.fleet` = **OK** — fleet posted 0.3h ago
> `steem.treasury` = **DEGRADED** — treasury headcorner at 2926 SP < 3000 (recovery-plan §3)

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 191.4h · נמדד 2026-10-11T18:24:27.891Z
> `blurt.alive` = **FAIL** — blurt fleet silent 191h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 95 קבצים; פגומים: 0

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
