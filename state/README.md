# state/ — מדינת-הרשת החיה (טריטוריית agent-3 · T-43)

מקור-האמת המכני של המפעיל. **כאן נכתבות מדידות-בלבד** — אסור מספר שלא נמדד, אסור הצלחה-מזויפת, אסור TODO.

## בעלות (פרוטוקול-החמישה)

- **agent-3 + משפחתו (3a–3d)**: `state/**` · `engine/state-lib.mjs` · `engine/state-tick.mjs` · `engine/operator.mjs` · `.github/workflows/sovereign-state.yml` · `status/**` · הרחבה-מדויקת-מתועדת ב-pages.yml (artifact status@/status) · appends-מדויקים ב-README.md ו-worklog.md.
- **אסור-מגע**: `console/` · `engine/sovereign-tick.mjs` · `engine/leak-scan.mjs` · `engine/seal-selftest.mjs` · `tools/` · `docs/` · `boot/` · `SECURITY.md` · `docs/RUNBOOK.md` · `.github/workflows/sovereign.yml` · `.github/workflows/pages.yml` (חוץ-מההרחבה-המדויקת-המתועדת) · `.gitignore`.
- שיתוף-קריאה בלבד מותר (למשל: state-tick קורא `receipts/latest.json` של agent-1 — קריאה, לא-כתיבה).

## סכימת `network-state.json` (`sanbox-state/1`)

```json
{
  "schema": "sanbox-state/1",
  "updatedAt": "<ISO-8601 UTC, Z>",
  "genesis": "f9aeab3c481cc79cc426e5594fa5bf6ba617592267fb73859f8fd2cb7a0b65e5",
  "prevMerkle": "<hex | null בזרע>",
  "merkle": "<hex>",
  "keeper": {
    "tickCount": 0,
    "lastTick": "<ISO | null>",
    "lastHead": "<12-hex | null>",
    "status": "never-run | ok | degraded | failed",
    "consecutiveFailures": 0
  },
  "operator": {
    "lastAction": "health | selftest | snapshot | arm | disarm | null",
    "by": "<who | null>",
    "at": "<ISO | null>",
    "note": "<string | null>"
  },
  "killSwitch": {
    "mode": "dryrun | armed",
    "since": "<ISO>",
    "note": "<string | null>"
  },
  "custody": {
    "source": "receipts/latest.json",
    "echo": "<echo-מוגבל ≤10 שדות + sha256-הבייטים | null>",
    "echoedAt": "<ISO | null>",
    "status": "unmeasured | ok | absent"
  },
  "selftest": {
    "passed": 0,
    "total": 0,
    "at": "<ISO | null>",
    "status": "never-run | ok | failed"
  },
  "chain": {
    "headSha": "<12-hex | null>",
    "dirtyFiles": 0,
    "trackedFiles": 0,
    "worklogLines": 0
  },
  "notes": ["<מוגבל: אחרונות-20>"]
}
```

מילון-סטטוסים סגור: כל-שדה-סטטוס לוקח רק-ערכים-מהרשימה שלמעלה. שדה-שלא-נמדד = `null`/`unmeasured`/`never-run` — **לעולם לא המצאה**.

## חוק-השרשרת (מרקל-מצטבר)

- `genesis = sha256("sanbox-genesis-v1") = f9aeab3c481cc79cc426e5594fa5bf6ba617592267fb73859f8fd2cb7a0b65e5`
- `leaf_n = sha256( canonical-json( core_n ) )` כאשר `core_n = {keeper, operator, killSwitch, custody, selftest, chain}` של-הטיק-הנוכחי.
- `chainRoot_n = sha256( chainRoot_{n-1} + ":" + leaf_n )` — hex-lowercase.
- `canonical-json` = מיון-מפתחות-רקורסיבי · בלי-רווחים · UTF-8 · מספרים-עשרוניים-רגילים.
- אחרי-כל-טיק: `prevMerkle = chainRoot_{n-1}` · `merkle = chainRoot_n`.
- טיק-ראשון-בעולם: `prevMerkle = genesis`.

## חוקי-כתיבה

- כותבים-כאן **רק** `engine/state-tick.mjs` (טיקים) ו-`engine/operator.mjs` (פעולות-מפעיל) — בענן (Actions) או מקומית לבדיקה.
- כתיבה = atomic (tmp+rename) · זמנים = UTC ISO-8601 (Z) · יומן `keeper.log` שורה-אחת-לטיק.
- `keeper.log`: `[<ISO-Z>] tick#N <ok|fail> head=<12hex> merkle=<8hex> st=P/T` + סיומת-אופציונלית ` op=<action>` לשורות-מפעיל — שורת-הערה ראשונה מותרת (`#`).
- **סיבוב-יומן**: היומן-החי מוגבל ל-512-שורות-טיק-אחרונות (שורות-כותרת-נשמרות); ההיסטוריה-המלאה חיה-בהיסטוריית-הגיט (תקדים ticks.jsonl של agent-1).
- **סריקה-לפני-push**: leak-scan מורץ על **רשימת-קבצים** (`git ls-files -z state/ | xargs -0 node engine/leak-scan.mjs`) — לא-על-התיקייה (ארג=EISDIR fail-closed, ממצא-HIGH T-43d).
- `keeper.log` מוגן-מפני-`*.log` ב-.gitignore בכוח-מעקב-חד-פעמי (force-add של-הממזג); קובץ-עקוב אינו-מושפע-מ-ignore.
- אסור-force-push · push עם rebase-retry ×3 · אפס-התאמות ב-leak-scan לפני-push · ה-commit **רק** `git add state/` (אף-פעם לא `add -A`).

## חוזה-workflow — `.github/workflows/sovereign-state.yml`

- `name: sovereign-state`
- `on`: `schedule` cron `"3,18,33,48 * * * *"` (מוסט-3-דק' מה-tick של agent-1) + `workflow_dispatch` עם inputs:
  - `action`: choice [`auto` · `health` · `selftest` · `snapshot` · `arm` · `disarm`], default `auto`
  - `note`: string, default `""` (חובה-מדודה עבור `arm` — נאכף ב-operator.mjs, יציאה-כנה 1 בלעדיו)
- `permissions: { contents: write }` · `concurrency: { group: sovereign-state, cancel-in-progress: false }` · `timeout-minutes: 10` · **GITHUB_TOKEN-בלבד — אף-PAT-ב-CI**.
- ניתוב-ריצה: `schedule` או `action=auto` → `node engine/state-tick.mjs`; `workflow_dispatch` + `action≠auto` → `node engine/operator.mjs` עם env `SBX_ACTION`/`SBX_NOTE`.
- אחרי-הריצה: `node engine/leak-scan.mjs state/` (fail-closed) → commit `git add state/` בלבד → `pull --rebase` ×3 → push. שם-הקומיט: `[state] tick#N <action>`.

## חוזה-`status/` (הדף-הציבורי-המוכח)

- קבצים: `index.html` · `style.css` · `app.js` · `README.md`.
- קריאה-בלבד-מהענן: `https://raw.githubusercontent.com/roshpinacare-sys/Sandbox/main/state/network-state.json` + זנב-`keeper.log` (30) — cache-busting `?t=`.
- פאנלים: LED-כללי · keeper (tickCount/lastTick/גיל-אנושי) · שרשרת-מרקל (prev→cur) · מתג-ריבונות (dryrun=ירוק, armed=ענבר-פועם) · custody-echo · selftest · chain · יומן-טיקים · קישורים (קונסולה · קוקפיט · Actions · RUNBOOK).
- פאנל-מפעיל (קרוס-ברירת-מחדל): טוקן-ב-sessionStorage-בלבד (מחיקה-בנעילה/אי-פעילות-15-דק') → dispatch `sovereign-state.yml` דרך api.github.com.
- CSP-קשוח (מטא): `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://raw.githubusercontent.com https://api.github.com; base-uri 'none'; form-action 'none'`.
- אפס-inline (אף-תג-סקריפט/סטייל-מוטמע) · אפס-CDN · אפס-פונטים-חוץ · RTL עברית · רספונסיבי · ניגודיות-AA · `prefers-reduced-motion`.
- כנות: מצב-שליפה-כושל = "מצב-לא-זמין" מפורש — לעולם לא נתוני-דמה.
- **סטיית-טריות-ידועה**: raw.githubusercontent מתווך-CDN עם TTL-עד-~5-דק' — העמוד-מראה-מדידות-בנות-עד-כ-5-דק'-פלוס-גיל-הטיק-עצמו; זה-מתועד-ומקובל (ה-LED-מחשב-זקנה-לפי-זמן-הטיק, לא-לפי-זמן-השליפה).

## חוק-הכנות (מכונן)

- כל-שדה = מדידה או null. אסור: מספר-מנומונט, הצלחה-מדומיינת, הסתרת-כישלון.
- כישלון-מדידה = `status: failed` + `consecutiveFailures++` + יציאת-תהליך-כנה 1 — ולא-שקר-ירוק.
