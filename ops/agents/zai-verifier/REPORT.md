# דוח-אמת (verifier) · 2026-10-11T13:08:39.648Z

**overall: DEGRADED** · auth: token(fed) · took: 17645ms · כללים: config.json (אפס-דעה-אישית)

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
| Sandbox | public | 100+ | 8% | ok |
| Console | public | 47 | 8% | ok |
| Domain | public | 50 | 0% | ok |
| TruthRail | public | 20 | 0% | ok |
| saos-dex | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-control-center | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| saos-agents | public | 0 | — | ok |
| FleetHQ | public | 7 | UNMEASURED (budget) | ok |
| saos-runtime | public | 2 | UNMEASURED (budget) | ok |
| sovereign-lighthouse | public | 87 | UNMEASURED (budget) | ok |
| saos-sovereign-foundry | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |
| steem | ? | 0 | — | UNVERIFIED-PRIVATE-OR-GONE |

**מדד-מסכם:** codeShare = 5% (42 commits מסווגים מתוך 313)
> שיפוט: `dev.rate` = **DEGRADED** — heartbeat-without-building: codeShare 5% < 10% over 313 commits/24h

## 3. אמת-על-השרשרת · Steem (https://api.steemit.com)
| חשבון | SP אפקטיבי | VP% | פוסט-אחרון | הצבעה-אחרונה |
|---|---|---|---|---|
| @headcorner | 3676 | 66% | 19.3h | 0.7h |
| @haran | 78 | 73% | 71.6h | 1.9h |
| @cashmachine | 75 | 74% | 45.4h | 1.8h |
| @wic | 33 | 75% | 20.5h | 1.6h |
| @woq | 34 | 72% | 20.7h | 1.6h |
| @tov | 31 | 77% | 20.5h | 1.8h |
| @spaminator | 69 | 0% | 57491.1h | 12892.9h |
| @saos | 5 | 0% | מעולם-לא | — |
| @powerspan | 0 | 0% | מעולם-לא | 876.8h |
| @ynet | 0 | 0% | 25156.6h | 756.7h |
| @hcsoldier4 | 3 | 99% | 89.5h | 19.8h |
| @hcsoldier6 | 3 | 99% | מעולם-לא | 1.7h |

> `steem.fleet` = **OK** — fleet posted 19.3h ago
> `steem.treasury` = **OK** — treasury headcorner at 3676 SP

## 4. Blurt (UNREACHABLE)
RPC בלתי-נגיש מהרץ: https://rpc.beblurt.com: rpc https://rpc.beblurt.com unreachable: HTTP 406 · https://rpc.blurt.world: rpc https://rpc.blurt.world unreachable: fetch failed
> `blurt.alive` = **NOTICE** — blurt RPC unreachable from runner (2 hosts tried) — UNREACHABLE, לא "מת" עד-שיימד

## 5. שלמות-עץ (ריקבון-מצבות)
נסרקו 68 קבצים; פגומים: 1 · דוגמאות: ops/agents/zai-verifier/README.md

## 6. דלתא-מול-הריצה-הקודמת
- ריצה-ראשונה או אפס-שינויים-בדירוגים

## 7. משימות-שנצרתו-עכשיו
- **V-DEV-FOCUS** — דופק-בלי-בנייה: להפנות-משאב-סוכנים מטביעות-מצב לבניית-מוצר/תיקונים אמתיים
- **V-ROT-HYGIENE** — ניקוי-מצבות-מקולקלות (sha256: undefined) + תיקון-מנוע-הדידופליקציה שיוצר-אותן

## 8. שיטה-וראיות
- GitHub API: repos/commits/actions של roshpinacare-sys (read-only)
- RPC ציבורי keyless: https://api.steemit.com
- פנקס: state/verifier/history.jsonl (מרקל) · אימות-עצמי: node engine/verifier.mjs --verify-ledger
- קוד-הבדיקה: engine/verifier.mjs · כללים: ops/agents/zai-verifier/config.json
