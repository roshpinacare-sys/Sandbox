# דוח-אמת (verifier) · 2026-10-11T13:48:44.565Z

**overall: FAIL** · auth: token(fed) · took: 15399ms · כללים: config.json (אפס-דעה-אישית)

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
| Sandbox | public | 100+ | 25% | ok |
| Console | public | 51 | 8% | ok |
| Domain | public | 55 | 25% | ok |
| TruthRail | public | 20 | 17% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 0 | — | ok |
| FleetHQ | public | 7 | UNMEASURED (budget) | ok |
| saos-runtime | public | 5 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 78 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 19% (42 commits מסווגים מתוך 316)
> שיפוט: `dev.rate` = **NOTICE** — mixed activity: codeShare 19%

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 3676 | 64% | 0.2h | 0.2h |
| @haran | 78 | 75% | 0.2h | 0h |
| @cashmachine | 75 | 75% | 0.2h | 0.3h |
| @wic | 33 | 75% | 21.2h | 2.2h |
| @woq | 34 | 72% | 21.4h | 2.2h |
| @tov | 31 | 77% | 21.2h | 2.4h |
| @spaminator | 69 | 0% | 57491.8h | 12893.5h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 877.5h |
| @ynet | 0 | 0% | 25157.3h | 757.4h |
| @hcsoldier4 | 3 | 99% | 90.1h | 20.4h |
| @hcsoldier6 | 3 | 99% | מעולם-לא | 2.4h |

> `steem.fleet` = **OK** — fleet posted 0.2h ago
> `steem.treasury` = **OK** — treasury headcorner at 3676 SP

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: 186.8h · נמדד 2026-10-11T13:48:59.915Z
> `blurt.alive` = **FAIL** — blurt fleet silent 187h > 168h — loop dead until proven otherwise

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 76 קבצים; פגומים: 3 · דוגמאות: ops/agents/zai-verifier/README.md, ops/agents/zai-verifier/REPORT.md, ops/agents/zai-verifier/TASKS.md

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `dev.rate` DEGRADED → **NOTICE**

## 7. משימות-שנצרתו-עכשיו
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)
- **V-ROT-HYGIENE** — ניקוי-מצבות-מקולקלות (sha256: undefined) + תיקון-מנוע-הדידופליקציה שיוצר-אותן

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
