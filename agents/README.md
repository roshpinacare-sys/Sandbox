# agents/ — מישור-הסוכנים (טריטוריית agent-3 · T-44)

**הרעיון:** אתמול נבנה נתיב-אנושי אחד (סיסמת-המפעיל → קונסולה + כספת-צי). הבעלים קבע: הסוכנים והרשת צריכים **גם-כן להיכנס** — לא רק האדם. מישור-זה נותן לצי-הסוכנים כניסה-מאומתת, תיבת-פקודות-חתומה, ודיווח-מבוקר — **בלי** לתת לסוכנים אף-מפתח-כספת, **בלי** שאף-טוקן יופיע בגיט, ו**בלי** לגעת בטריטוריות-האחים.

## הפרדת-המישורים (חוק-מכונן)

| מישור | מי | מה נפתח | איפה |
|---|---|---|---|
| אנושי | המפעיל-הבעלים | קונסולה (קנון-62) + כספת-הצי (מפתחות) | `operator/` · `console/` · `docs/` |
| **סוכנים** | agent-1..agent-5 | **זהות · תיבת-פקודות · מדינה · קבלות · דיווח** | **מישור-זה** |
| ציבורי | כולם | status · network · קבלות-מעוצבות-לפרסום | `status/` · `network/` |

**אסור-ונאכף:** לסוכן אין מפתחות-כספת, אין חתימת-עסקאות, אין arm/disarm (אלה פעולות-מפעיל-אנושי). שער-זה מזהה, קורא, ומדווח — לא מפעיל-כוחות.

## סכימת `agents.json` (`sanbox-agents/1`)

```json
{
  "schema": "sanbox-agents/1",
  "kdf": "PBKDF2-HMAC-SHA256",
  "iterations": 650000,
  "hash": "SHA-256",
  "keyLen": 32,
  "members": [
    { "id": "agent-N", "scope": "act", "saltB64": "…16B", "verifierB64": "…32B",
      "createdAt": "<ISO-Z>", "rotatedAt": "<ISO-Z|null>", "note": "<תפקיד>" }
  ]
}
```

- `verifier = PBKDF2(טוקן, salt, 650000, 32B)` — פומבי-מטבעו כמו salt/iv בקונסולה; **הטוקן-עצמו לעולם-לא-נכתב-לשום-קובץ-נעקב** (רק: קובץ-מקומי-gitignored + GitHub repo-secret `SBX_AGENT_TOKEN_<ID>`).
- הטוקנים: 43-תווים base64url (256-bit) — כוח-גס-מול-PBKDF2×650k = בלתי-אפשרי-מעשי.
- אותם-פרמטרים-בדיוק כחותם-הקונסולה (agent-1) — קנון-אחד לכל-העץ.

## סכימת `inbox.sealed.json` (`sanbox-agent-inbox/1`)

מעטפה-לכל-סוכן: `{id, saltB64, ivB64, ctB64}` — AES-256-GCM (ct‖tag) תחת מפתח=PBKDF2(טוקן-הסוכן). תוכן-המעטפה: הפקודה-החיה (`directiveId`, `subject`, `body`), קישורים, ורוסטר-הטוקנים — כך-שהצי-משחזר-את-כל-הזהויות-מהגיט-בלי-לתלות-בזיכרון-של-סנדבוקס-כלשהו. עדכון-התיבה: `node agents/seal-inbox.mjs` (קורא-מקומי-gitignored-בלבד).

## פרוטוקול-האתגר-מענה (השער-השרתי — `.github/workflows/agent-access.yml`)

```
1. challenge: agent → workflow_dispatch{agent_id, action=challenge}
   runner → אתגר-טרי 32-hex → agents/challenges/<id>.txt → commit [agents]
2. proof:    agent → proof = sha256(טוקן + ":" + אתגר)   (הטוקן-מעולם-לא-עובר-על-החוט)
3. verify:   agent → workflow_dispatch{agent_id, action=verify, proof}
   runner → timingSafeEqual(proof, sha256(סוד:אתגר-מהקומיט))
   ok → קבלה ok + שריפת-אתגר (אוטו-רוטציה) + commit
   fail → קבלה failed + יציאה 1 (אף-ירוק-שקרי)
4. report:   כמו-verify + text (≤500) → agents/reports/<id>.jsonl (רוטציה 200 שורות)
```

- **proof-פומבי = חסר-ערך**: האתגר-נשרף-בהצלחה; כל-verify דורש-אתגר-טרי.
- **concurrency: agent-access** מסדרת-ריצות-מקבילות; **קומיט-רק `git add agents/`** (אף-פעם לא -A) · rebase-retry ×3 · כישלון-כנה.
- **leak-scan fail-closed** על `agents/**` + `engine/agent-gate.mjs` לפני-כל-קומיט.
- הסוד-נקרא רק-ב-runner-env (GitHub ממסך-אותו-בלוגים); מיפוי-מפורש של 5-סודות (secrets-אינו-מאפשר-אינדוקס-דינמי).

## שער-הדפדפן — `/agents/` (artifact: gate + registry + inbox)

- אימות-מקומי-גרידא ב-WebCrypto: PBKDF2×650k מול-verifier — הטוקן-עצמו לעולם-לא-נשלח-לשום-שרת.
- פתיחת-תיבת-הפקודות: פענוח-המעטפה-האישית.
- קריאה-חיה: מדינת-הרשת (state/) · קבלת-העורק (receipts/latest.json) · קבלות-השער (agents/receipts/log.jsonl) — מ-raw.githubusercontent.
- 3-ניסיונות → נעילה-זמנית 30 שניות · sessionStorage-בלבד · נעילה-אוטומטית 15 דק' · CSP-מטא-מחמיר · אפס-inline · אפס-innerHTML (textContent בלבד) · כישלון = כנות, לעולם לא נתוני-דמה.

## מנוע-השער — `engine/agent-gate.mjs`

- CLI: `challenge` · `verify` · `report` · `selftest` · `register` (SBX_ADMIN_CONFIRM=1 חובה).
- הטוקן-נקרא-רק מ-env `SBX_AGENT_TOKEN_<ID>` — לעולם-לא-argv/לוג/קבלה.
- השוואות-קבועות-זמן · כתיבה-אטומית (tmp+rename) · רוטציות-גבול (קבלות 100 · דיווחים 200 · שורות-כותרת-נשמרות).
- `selftest` = 12-בדיקות-קצה-בתהליכי-ילד-על-עץ-זמני: עגול-verifier · אתגר→הוכחה→אימות · שריפת-אתגר · דחיית-replay · דחיית-סוכן-מזויף · דחיית-לא-רשום · report-וקבלת-כישלון-כנה · רוטציה-מבטלת-טוקן-ישן · שער-אדמין.

## רוטציה ושחזור

- **רוטציה** (חשד/שגרה): טוקן-חדש → `SBX_ADMIN_CONFIRM=1 node engine/agent-gate.mjs register --id <id> --token …` → עדכון-סוד-ב-GitHub → `node agents/seal-inbox.mjs` → push. ה-verifier-הישן-מת-מייד; מעטפות-ישנות-מוחלפות.
- **מחיקת-סנדבוקס:** הטוקנים-שורדים בשלושה-מקומות: (1) GitHub repo-secrets (אינם-קריאים-חזרה — ניתנים-לעדכון), (2) מעטפות-התיבה-בגיט (נפתחות-בטוקן-קיים), (3) קובץ-מקומי-gitignored. סוכן-חדש-שמצטרף מקבל-טוקן-מהבעלים, פותח-את-מעטפתו, ומוצא-שם-את-כל-הרוסטר.

## בעלות (פרוטוקול-החמישה)

- **agent-3 (T-44)**: `agents/**` · `engine/agent-gate.mjs` · `.github/workflows/agent-access.yml` · הרחבה-מדויקת-ב-pages.yml (paths+assemble-המתועד) · appends-מדויקים ב-README.md ו-worklog.md.
- **אסור-מגע**: `console/` · `docs/` · `operator/` · `network/` · `boot/` · `tools/` · `state/` · `receipts/` · `engine/` (פרט-לקובץ-החדש-שלי) · `sovereign.yml` · `sovereign-state.yml` · `.gitignore`-שורש · SECURITY.md.
- שיתוף-קריאה בלבד מ-state/ ו-receipts/ (השער-קורא-בפומבי-מהגיט — בדיוק-כמו-כל-אזרח).
