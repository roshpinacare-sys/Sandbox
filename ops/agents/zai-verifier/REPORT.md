# דוח-אמת (verifier) · 2026-10-20T16:28:25.675Z

**overall: FAIL** · auth: token(fed) · took: 22149ms · כללים: config.json (אפס-דעה-אישית)

> יש-דברים-שבורים-ממש — זה הדוח-הכן, בלי-קישוטים.

## 1. בריאות-עורקי-הסנדבוקס
| בדיקה | דרגה | ראיה |
|---|---|---|
| `sbx.wf-sovereign-tick` | **NOTICE** | latest completed=failure |
| `sbx.wf-sovereign-state` | **OK** | success recent |
| `sbx.wf-artery-watch` | **OK** | success recent |
| `sbx.wf-federation` | **OK** | success recent |
| `sbx.wf-fleet-yield` | **OK** | success recent |
| `sbx.wf-fleet-heal` | **OK** | success recent |

## 2. קצב-בנייה-אמת (24h · code = infra/engine/src/scripts, churn = state/receipts/ops)
| ריפו | נראות | commits-24h | code-חלק | הערה |
|---|---|---|---|---|
| Sandbox | public | 100+ | 8% | ok |
| Console | public | 100+ | 0% | ok |
| Domain | public | 100+ | 0% | ok |
| TruthRail | public | 0 | — | ok |
| saos-dex | public | 100+ | 50% | ok |
| saos-control-center | public | 14 | UNMEASURED (budget) | ok |
| saos-agents | public | 0 | — | ok |
| FleetHQ | public | 100+ | UNMEASURED (budget) | ok |
| saos-runtime | public | 91 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 37 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | public | 1 | UNMEASURED (budget) | ok |
| steem | public | 100+ | UNMEASURED (budget) | ok |

**מדד-מסכם:** codeShare = 10% (42 commits מסווגים מתוך 743)
> שיפוט: `dev.rate` = **NOTICE** — mixed activity: codeShare 10%

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @spaminator | 69 | 0% | 57710.4h | 13112.2h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 1096.1h |
| @acct-19 | 0 | 0% | 25376h | 976h |

> `steem.fleet` = **FAIL** — fleet silent 25376h > 168h
> `steem.treasury` = **NOTICE** — treasury account absent

## 4. Blurt (https://rpc.blurt.blog)
פוסט-צי-הכי-חדש: מעולם-לא · נמדד 2026-10-20T16:28:47.750Z
> `blurt.alive` = **FAIL** — blurt fleet never posted

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 171 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `sbx.wf-fleet-yield` DEGRADED → **OK**
- ↗ השתפר: `dev.rate` DEGRADED → **NOTICE**
- ↘ התדרדר: `steem.fleet` OK → **FAIL**
- ↗ השתפר: `steem.treasury` DEGRADED → **NOTICE**

## 7. משימות-שנצרתו-עכשיו
- **V-GRID-REVIVE** — החייאת-מסלול-פרסום-הצי לפי-מדיניות §4 (2-3 פוסטים/שבוע/חשבון, ייחודיות, גילוי-נאות)
- **V-BLURT-REVIVE** — החייאת-לופ-בלורט דרך gated blurt-connector (תנאי: P0 מפתחות-חדשים; workflow_dispatch בלבד + reviewer)

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com · https://rpc.blurt.blog
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
- עמוד-האמת-הציבורי: status/truth.html (נאפה-בכל-ריצה; Pages-מעלה-אותו ל-roshpinacare-sys.github.io/Sandbox/status/truth.html)
