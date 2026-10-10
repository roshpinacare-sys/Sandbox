# operator/ — השער-המאוחד של המפעיל (טריטוריית agent-2, T-38-operator)

> **ההצהרה:** טריטוריה-זו = `operator/` בלבד (+ הרחבות-מדויקות ל-pages.yml ול-worklog-זה לפי-פרוטוקול-החמישה).
> לא-נגעתי ב-console/ · docs/ · engine/ · tools/ · boot/ · workflows-קיימים · README (חוץ-מהצהרת-טריטוריה).

## מה-זה

**השער-המאוחד** — סיסמה-אחת פותחת-בבלוק-אחד את-כל-מה-המפעיל-צריך:

| רכיב | תפקיד | מצב |
|---|---|---|
| `index.html + gate.js + style.css` | שער-מאוחד: הדבקת-הסוד-המלא פותחת **גם** כספת-הצי (מעטפות-קוקפיט) **גם** הקונסולה (קנון-62) → לוח-מפעיל: כספת · קונסולה · עורק · שרשרת · שער-שרתי | **חי-על-Pages** `/operator/` |
| `server/worker.mjs + wrangler.toml + deploy.sh` | **שער-שרתי אמיתי**: PBKDF2·650k · constant-time · rate-limit 5/15 דק'/IP · session-HttpOnly·Secure·SameSite=Strict·TTL-8h · פרוקסי-מאומת לכל-הפתחים | **מוכן-לפריסה** (פקודה-אחת) |

## הקריפטו — אפס-הסתעפות-מהאחים

- **כספת-הצי**: פורט-verbatim של-`docs/app.js:tryUnlock` — מעטפות PBKDF2·600k, מועמדים `[raw, ground, trim]`.
- **הקונסולה**: קנון-62 של-`tools/seal.mjs:51` — `replace(/[\r\n]+/g,"")`, PBKDF2·650k, AES-256-GCM על-`sealed-payload.bin`.
- **הסיסמה-מעולם-לא-נשמרת**: אין-localStorage/cookie/שליחה-לשרת; לאחר-הפתיחה שדה-הקלט-מתרוקן; נעילה-אוטומטית 15 דק' מנקה-את-הזיכרון.
- CSP-קשוח: `default-src 'none'`; connect-src ל-`api.steemit.com` · `api.hive.blog` · `raw.githubusercontent.com` בלבד.

## השער-השרתי — למה-ואיך

הקונסולות-הסטטיות חזקות-קריפטוגרפית אך-חסרות-שרת: אין-session, אין-rate-limit, אין-גישה-שרתית.
ה-worker משלים-בלי-להחליף:

- **אימות**: PBKDF2-SHA256·650k מול-hash (salt אקראי לכל-פריסה); השוואה-constant-time (`crypto.subtle.timingSafeEqual` + fallback).
- **קצב**: 5-ניסיונות/15 דק' ל-IP → 429+Retry-After. **כתב-ויתור-כנה**: מונה-בתוך-מופע-isolate; תחת-עומס-רב-מופעי-החסם-מתרכך — הרובד-הבא (Cloudflare-rate-limit-binding / Durable-Object) מתועד-כהמשך.
- **Session**: HMAC-SHA256-stateless (`payload.sig`), HttpOnly·Secure·SameSite=Strict·TTL-8h; SESSION_SECRET-חדש-בכל-פריסה = כל-הסשנים-מתים (מכוון).
- **פרוקסי**: אחרי-אימות — מראה-מלאה של-Pages (`console/ · cockpit/ · operator/`) עם-strip-cookies ו-no-store.
- **אפס-סודות-בגיט**: `OP_HASH` ו-`SESSION_SECRET` = wrangler-secrets בלבד; `deploy.sh` גוזר-את-הקנון-מקובץ-סוד-מקומי-בזיכרון-התהליך-ומזרים-ישירות-ל-secret (אין-קובץ-ביניים, אין-הדפסה); `.env.local`-gitignored-ב-`operator/.gitignore`.

### הפעלה-בפקודה-אחת (כשטוקן-Cloudflare-רענן-ינחת-בכספת)

```bash
# פעם-אחת מקומית:
cat > operator/server/.env.local <<'EOF'
CLOUDFLARE_API_TOKEN=…      # Workers-Permissions: Edit
CLOUDFLARE_ACCOUNT_ID=…
PASSFILE=/נתיב/מקומי/לסוד-הראשי
EOF
bash operator/server/deploy.sh
```

**מצב-אמת (נמדד):** טוקן-ה-Cloudflare בכספת-הצי (`כספת-מוצפנת` slot `CLOUDFLARE_API_TOKEN`) **מת** —
`GET /user/tokens/verify` → `Invalid API Token` (נבדק-מול-API-חי בעת-הקמת-השער). ה-`rails.env.enc` נפתח-ולא-מכיל-Cloudflare.
**ההצעה-הקונקרטית (חוק-③):** סבב-ROT5 — טוקן-Workers-חדש → `vault.sh seal` → `deploy.sh` → השער-השרתי-חי.

## פאנל-העורק-והשרשרת

- **עורק**: קבלות-חיות מ-`receipts/latest.json` + `ticks.jsonl` (raw.githubusercontent, CORS:* · no-store) — טיק-אחרון, HEAD, שרשרת-טביעות, `keysLeaked`, סיווג חי/מפגר/מנותק.
- **שרשרת**: `condenser_api.get_dynamic_global_properties` + `get_accounts` מול-`api.steemit.com` (fallback-אפס — נקודה-אחת) — SP-אפקטיבי · נזיל · SBD · VP לחשבונות-הצי-החיים.

## הרצה-מקומית (אופציונלי-בלבד)

```bash
cd <root-of-repo> && python3 -m http.server 8080
# פתח http://localhost:8080/operator/ — אותו-שער, אותו-קריפטו, אפס-בנייה
```

> **T-39 · חוק-הכנות**: זוהי-אפשרות-תצוגה-מקומית-בלבד — **אינה-תלות**. הכניסה-הקנונית-והחיה:
> **https://roshpinacare-sys.github.io/Sandbox/operator/** — עובדת-מכל-דפדפן-בעולם, אפס-מכונה-נדרשת.
> הריפו-כולו (נבדק-בסריקת-תלות T-39) אינו-מפנה-לשום-שירות-מקומי/סנדבוקס-חי.

## גבולות-כנים

- השער-המאוחד פותח-**לקריאה**; חתימת-עסקאות-נשארת-בקוקפיט-המבודד (הדבק-שוב-שם — בידוד-מכוון של-משטח-החתימה).
- הקונסולה-לא-תיפתח-אם-agent-1-יחתום-מחדש-בסיסמה-אחרת — זהו-התנהגות-נכונה, לא-באג.
- אין-מבחני-עומס; ה-rate-limit-מתועד-ביושר-למעלה.
