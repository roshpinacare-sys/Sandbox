# דוח-אמת (verifier) · 2026-10-11T14:48:53.225Z

**overall: FAIL** · auth: token(fed) · took: 19938ms · כללים: config.json (אפס-דעה-אישית)

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
| Sandbox | public | 100+ | 33% | ok |
| Console | public | 51 | 8% | ok |
| Domain | public | 65 | 42% | ok |
| TruthRail | public | 18 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 1 | UNMEASURED (budget) | ok |
| FleetHQ | public | 7 | UNMEASURED (budget) | ok |
| saos-runtime | public | 14 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 64 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 26% (42 commits מסווגים מתוך 320)
> שיפוט: `dev.rate` = **OK** — building: codeShare 26% over 320 commits/24h

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 3676 | 64% | 1.2h | 1.2h |
| @haran | 78 | 75% | 1.2h | 1h |
| @cashmachine | 75 | 75% | 1.2h | 1.3h |
| @wic | 33 | 75% | 0.4h | 3.2h |
| @woq | 34 | 72% | 22.4h | 3.2h |
| @tov | 31 | 77% | 22.2h | 3.4h |
| @spaminator | 69 | 0% | 57492.8h | 12894.5h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 878.5h |
| @ynet | 0 | 0% | 25158.3h | 758.4h |
| @hcsoldier4 | 3 | 99% | 91.1h | 21.4h |
| @hcsoldier6 | 3 | 99% | מעולם-לא | 3.4h |

> `steem.fleet` = **OK** — fleet posted 0.4h ago
> `steem.treasury` = **OK** — treasury headcorner at 3676 SP

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 187.8h · נמדד 2026-10-11T14:49:13.115Z
> `blurt.alive` = **FAIL** — blurt fleet silent 188h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 83 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `dev.rate` NOTICE → **OK**
- ↗ השתפר: `rot.hygiene` DEGRADED → **OK**

## 7. משימות-שנצרתו-עכשיו
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
