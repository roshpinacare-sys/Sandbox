Task ID: T-42-b
Agent: agent-3b (Z.ai Code · network probe engine)

Task: בניית-סוקר-הרשת של Sandbox — `engine/network-probe.mjs`: אספן-אחד-קובץ שמראה-נתונים **ציבוריים-מטבעם** מהריפו FleetHQ (ריפו-פומבי, אפס-אימות) אל receipts/ של-הריפו-הזה, כדי-שלוח-המפעיל תראה-את-הרשת-כולה-כחלק-אחד. נקרא-עתידית-מה-CI-tick; רץ-גם-עצמאית (`node engine/network-probe.mjs`).

Work Log:
- **הכרזת-טריטוריה (agent-3b)**: `engine/network-probe.mjs` (חדש) + `receipts/network.json` + `receipts/network-log.jsonl` (תוצרי-ריצה). לא-נגעתי ב-sovereign-tick · leak-scan · workflows · console/ · docs/ · tools/ · worklog.md.
- **קריאת-הקנון-קודם-כל**: נלמדו-המוסכמות מ-worklog.md ומ-sovereign-tick.mjs (חוק-מדוד-או-absent · stdlib-בלבד · ROOT מ-import.meta.url · tail-cap · JSON-indent-1) ודפוסי-leak-scan.mjs (workpath · wif · טוקנים · cred-url) — כדי-שהפלט-יעבור-את-החסם-מהרגע-הראשון.
- **סיור-חי-לפני-קוד**: שלושת-מקורות-FleetHQ נבדקו-חי (HTTP-200-כולם) והצורות-נמדדו: lineage-guard.json (at/head/origin/behind/ahead/last_event/last_push) · status.json (ts/all_ok/results) · history.jsonl (52 שורות; **השורה-האחרונה-כרגע היא-תמונת-סטטוס-ולא-שורת-עד** — ראו-למטה-בכנות).
- **ארבעת-המקורות**: guard (חוזה-מדויק: שדות-העד-בלבד, last_push-כבלוק) · status (results-חתוכות-ל-12, כל-תוצאה=name/verdict/latency_ms-בלבד — כתובות-הבדיקה-אינן-מועתקות) · witness_row (השורה-האחרונה-בלבד; ts|at · nonce · balance_eth|balance · address-ציבורי-במלואו; חסר→null-פר-שדה) · self (tick_at מ-receipts/latest.json-המקומי).
- **חוקי-ברזל-שנשמרו**: Node-stdlib-בלבד (fs/path/url; fetch+AbortController-גלובליים) · timeout-10s-לכל-מקור · fail-soft-פר-מקור (מקור-מת→null+הערה, השאר-ממשיכים) · אפס-סודות · אפס-טוקנים · אפס-נתיבי-מכונה · אפס-המצאה · כתיבה-אטומית tmp+rename · יומן-jsonl-append עם-tail-128 · יציאה-0-תמיד-חוץ-מכשלת-כתיבת-קבצי-הפלט-עצמם (אז-1+הודעה-עברית).
- **מבחנים-חיים**: `node --check` ✔ · ריצה-חיה-מלאה ✔ — guard נאסף (head 48096dc, last_event clean) · status נאסף (4/4 תוצאות, all_ok true) · witness_row נפרסה-עם-null-פר-שדה (nonce/balance_eth/address לא-קיימים-בשורה-האחרונה-כרגע — נרשם-הערה-מדודה) · self tick_at נאסף · יציאה-0.
- **מבחן-fail-soft-מבודד** (סביבת-בדיקה-זמנית-מחוץ-לריפו, DNS-מת): יציאה-0 · כל-הסעיפים-null · fetched=null · הערות "absent (fetch failed)" ✔ · מבחן-tail-cap: 131-שורות→128, הזנב-נשמר ✔ · סביבת-הבדיקה-נמחקה-אחרי-האימות.
- **חסם-הדחיפה**: `node engine/leak-scan.mjs receipts/network.json receipts/network-log.jsonl` → **✔ נקי — אפס-התאמות (יציאה-0)**, גם-אחרי-הרצות-חוזרות.
- **לא-בוצע-commit** — הקבצים-מושארים-מקומית-נקיים; ה-push/השילוב-ב-workflow הם-החלטת-המתאם (טריטוריית-workflows=agent-1).

החלטות-שנתקבלו (לשקיפות):
- `sources.fleethq.fetched` = חותמת-סבב-המשיכה אם-לפחות-מקור-אחד-ענה; **null**-אם-אף-אחד-לא-ענה (מדוד, לא-מנוחש).
- הערת-מדידה-נוספת-כאשר-השורה-האחרונה-ב-history.jsonl חסרת-שדות-עד-כולם — הריקון-עצמו-הוא-עובדה-נמדדת-שראוי-להציג-בלוח.
- status.results-כתובות-אינן-מועתקות-לקבלה (מזעור-שטח-סריקה; name/verdict/latency_ms-בלבד).

Stage Summary:
- `engine/network-probe.mjs` — סוקר-הרשת-המלא: 4-מקורות · fail-soft-מוכח · timeout-10s · קבלה-`sandbox.network/1` · יומן-`sandbox.network.log/1` (tail-128) · יציאה-0-תמיד-חוץ-מכשלת-כתיבה.
- רשת-האמת-כרגע: FleetHQ-חי-ונגיש (guard+status נאספו) · שדות-העד-טרם-מופיעים-ב-history.jsonl (תמונות-סטטוס-בינתיים) — החוזה-מוכן-לרגע-שיופיעו.
- פתוח: חיבור-הקריאה-ל-workflow-של-ה-tick (agent-1) · לוח-המפעיל-שיציג-את-network.json · שקילת-SHA-pinning-עתידי-לפי-החלטת-T-41.
