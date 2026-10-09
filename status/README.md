# status/ — דף-המצב הציבורי (agent-3a · T-43a)

הדף-הציבורי, התמידי, ללא-אימות: לוח-ההוכחה של הרשת. נטען-תמיד, פתוח-לכולם, ומציג **רק-מדידות** שנשלפות חי מהגיט.

## למה-הוא-קיים

המפעיל נשקר בעבר בטענות "האוטונומיה-עובדת" שלא עמדו-במבחן. הדף-הזה נבנה על-עיקרון-אחד: **הכנות מכנית** — הוא לא מציג טענות אלא ערכים-מדודים בלבד, נקראים-חי מהריפו. מה שלא נמדד — לא מוצג; כישלון-שליפה — מוצג כ"מצב-לא-זמין" מפורש בכל-פאנל. אין-נתוני-דמה, אין-ערכי-ברירת-מחדל מרשימים.

## מקור-הנתונים

- `https://raw.githubusercontent.com/roshpinacare-sys/Sandbox/main/state/network-state.json` (סכימה `sanbox-state/1` — החוזה המלא: `state/README.md`) + cache-busting `?t=` ו-`cache: 'no-store'`.
- `https://raw.githubusercontent.com/roshpinacare-sys/Sandbox/main/state/keeper.log` — זנב 30-השורות-הלא-הערה.
- רענון-אוטומטי כל-60 שניות + כפתור "רענון"; כל-רענון מוכרז באזור `aria-live` מנומס.
- כל-נתון-נשלף מוזרק דרך `textContent` בלבד — אף-`innerHTML` (חסין-XSS מיטבי).

## פאנלים

נורות-חיות (מצב-כללי · keeper · מתג-ריבונות · selftest · custody-echo) · keeper (tickCount/lastTick/גיל/lastHead/consecutiveFailures) · שרשרת-מרקל (prev→cur 16-hex · genesis) · מתג-ריבונות (יבש=ירוק, חמוש=ענבר-פועם) · custody-echo (at/head/files/dirty/keysLeaked=אמת-שקר/bytesSha256) · selftest (passed/total) · chain (headSha/tracked/dirty/worklog) · יומן-טיקים (LTR, גלילה) · קישורים (קונסולה · קוקפיט · Actions · RUNBOOK · הריפו).

## מודל-האיום של פאנל-המפעיל

- הדף-עצמו **אפס-סודות**: כל-נתוניו פומביים מהריפו.
- הטוקן מוקלד-ידנית, נשמר **רק ב-sessionStorage** (`sbx.op.token`) אחרי-לחיצת-שמור מפורשת; אין-localStorage/cookie.
- נשלח **רק** ל-`https://api.github.com/.../sovereign-state.yml/dispatches` (workflow-dispatch, Bearer) — לשום-יעד אחר.
- לעולם לא נרנדר, לא נוצק ללוג, לא נכתב בשום-קובץ.
- **נעילת-עצלות**: 15 דקות בלי-אינטראקציה (pointerdown/keydown/wheel/touchstart מאפסים-את-הטיימר) → מחיקת-הטוקן + קיפול-הפאנל.
- הפאנל קפוץ כברירת-מחדל (`aria-expanded="false"`) ומסומן-אדום — לא-חלק מההוכחה-הציבורית, אלא שכבת-פעולה.

## אבטחת-הדף

- CSP מחמיר במטא: `default-src 'none'` · `connect-src` רק raw.githubusercontent.com + api.github.com · `base-uri 'none'` · `form-action 'none'`.
- אפס-inline: אף-script מוטמע, אף-תג-סטייל, אף-מאפיין-`style=`.
- אפס-CDN, אפס-פונטים-חוץ, אפס-עוקבים/אנליטיקה — רק `style.css` ו-`app.js` מקומיים.
- נגישות: RTL עברית · יעדי-מגע 44px · `focus-visible` · `prefers-reduced-motion` · ניגודיות-AA.

## פריסה

סטטי לחלוטין (HTML/CSS/JS, אפס-בנייה) — רוכב על artifact ה-Pages הקיים: הרחבת-`pages.yml` לכלול `status@/status` לצד `console@/console`. אין-שרת, אין-מסד, אין-תלות.

## קבצים

- `index.html` — המבנה (RTL עברית, מטא-CSP, שלדי-טעינה).
- `style.css` — לוח-הפיקוד (כהה · נורות-זוהרות · רספונסיבי 1→2→4 עמודות).
- `app.js` — שליפה, רינדור-כנה, שעון-ירושלים/UTC, פאנל-מפעיל, נעילת-עצלות.
