# דוח-אמת (verifier) · 2026-10-11T13:02:45.732Z

**overall: DEGRADED** · auth: token(gh) · took: 34604ms · כללים: config.json (אפס-דעה-אישית)

> המערכת חיה אך לא בריאה-כולה: יש עורקים/לולאות שאינם מתפקדים — עם ראיות.

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
| Console | public | 48 | 8% | ok |
| Domain | public | 50 | 0% | ok |
| TruthRail | public | 20 | 0% | ok |
| saos-dex | private | 26 | UNMEASURED (budget) | ok |
| saos-control-center | private | 28 | UNMEASURED (budget) | ok |
| saos-agents | public | 0 | — | ok |
| FleetHQ | public | 7 | UNMEASURED (budget) | ok |
| saos-runtime | public | 2 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 88 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | private | 0 | — | ok |
| steem | private | 100+ | UNMEASURED (budget) | ok |

**מדד-מסכם:** codeShare = 2% (42 commits מסווגים מתוך 469)
> שיפוט: `dev.rate` = **DEGRADED** — heartbeat-without-building: codeShare 2% < 10% over 469 commits/24h

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 3676 | 66% | 19.3h | 0.6h |
| @haran | 78 | 73% | 71.5h | 1.8h |
| @cashmachine | 75 | 74% | 45.3h | 1.7h |
| @wic | 33 | 75% | 20.4h | 1.5h |
| @woq | 34 | 72% | 20.7h | 1.5h |
| @tov | 31 | 77% | 20.4h | 1.7h |
| @spaminator | 69 | 0% | 57491h | 12892.8h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 876.7h |
| @ynet | 0 | 0% | 25156.6h | 756.6h |
| @hcsoldier4 | 3 | 99% | 89.4h | 19.7h |
| @hcsoldier6 | 3 | 99% | מעולם-לא | 1.6h |

> `steem.fleet` = **OK** — fleet posted 19.3h ago
> `steem.treasury` = **OK** — treasury headcorner at 3676 SP

## 4. Blurt (UNREACHABLE)
RPC בלתי-נגיש מהרץ: https://rpc.beblurt.com: rpc https://rpc.beblurt.com unreachable: HTTP 406 · https://rpc.blurt.world: rpc https://rpc.blurt.world unreachable: fetch failed
> `blurt.alive` = **NOTICE** — blurt RPC unreachable from runner (2 hosts tried) — UNREACHABLE, לא "מת" עד-שיימד

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 62 קבצים; פגומים: 0

## 6. דלתא-מול-הריצה-הקודמת
- ↗ השתפר: `sbx.wf-fleet-heal` FAIL → **OK**
- ↗ השתפר: `steem.fleet` DEGRADED → **OK**

## 7. משימות-שנצרתו-עכשיו
- **V-DEV-FOCUS** — דופק-בלי-בנייה: להפנות-משאב-סוכנים מטביעות-מצב לבניית-מוצר/תיקונים אמתיים

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
