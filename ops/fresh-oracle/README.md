# fresh-oracle — שער-אימות-עומד (Standing Verification Gate)

> **zai-12b · trace 1a12cf99469635d9** — מצטרף ל-OWNER-WORD המדוגל של **zai-13**
> ("make it a standing scheduled gate") על גבי המדידה הראשונה שלהם:
> `receipts/fresh-oracle-2026-10-11.json` — V-FLEETHQ-FRESH byte-oracle, 4 בדיקות 4/4 MATCH.
> **הקבלה, לא החלפה:** הקובץ המקורי של zai-13 לא נוגע; הפנקס-המאוחד
> `receipts/fresh-oracle-latest.json` שומר את התוכן המלא שלו תחת `prior` — לנצח.

## מה השער מוכרע (מה הוא מוכיח, בפועל)

שער-בתים שבועי + על-דרישה שמודד מחדש — ולא סומך על אף טענה — שהפנים-הציבוריים של הצי
תואמים את המציאות: הדף-החי הוא בדיוק הבתים שנדחפו לריפו, ההוכחות טריות, המחקר חי,
זרימת-ה-באס נושמת, ודף-Domain מציג את מה שהצי מפרסם שהוא מציג.

**חוק-היסוד (R1 אנטי-זיופים, צ'רטר הריבונות):** אין ירוק בלי מדידה-עצמאית.
**R5 כנות-מעל-הכל:** כשל-רשת = `UNKNOWN` + סיבה מדויקת — לעולם לא "ירוק-מנוחש".

## טבלת ה-V-*

| בדיקה | מה נמדד | מקור-האמת | חוק-פסק |
|---|---|---|---|
| **V-FLEETHQ-FRESH** | sha256-16hex של בתים-חיים מול בתים-committed · 4 קבצים: `FleetHQ/` + `potential.html` (מול ענף `office-pages` — מקור-Pages החי) · `Domain/` + `Domain/office3d/` (מול `main`) | live Pages מול `raw.githubusercontent.com` ב-ref הנכון (אומת אמפירית שווה-בתים ל-`git show` על ref מזוכך) | כל-4 MATCH → GREEN · סטייה-מוכחת (במדידה-כפולה) → RED · לא-נמדד → UNKNOWN |
| **V-KEYPROOF-FRESH** | `proof/out/KEY-PROOF-LATEST.json` קיים + `generatedAt` | ה-clone המקומי (Sandbox) | ≤8d → GREEN · 8..15d → AMBER · >15d/חסר → RED · ALIVE-ALERT → RED צורח |
| **V-RESEARCH-FRESH** | `research/findings-YYYY-MM-DD.json` החדש ביותר + `at` | ה-clone המקומי (Sandbox) | ≤9d → GREEN · 9..16d → AMBER · >16d/חסר → RED |
| **V-BUS-HEALTH** | מרשם-הזרימה `Zip:sovereign/bus-registry.json` (פרטי): כל-הזנה נמדדת חיה | פורט קריאה-בלבד של שיטת `Zip/sovereign/bus-validate.mjs` (GREEN/AMBER/RED/GREY · stalenessWarningHours · חוק-צורה) | ≥80% נמדדו + 0 RED → GREEN · RED>0 → RED · <80% נמדדו → AMBER · אין-גישה-לרישם → **BUS-UNKNOWN כנה** ("private registry — validator runs in-lane") |
| **V-DOMAIN-LIVE** | Pages 200 + `<title>` מכיל "מפקדת הצי" + פאנל `#p-research` קיים | live `https://roshpinacare-sys.github.io/Domain/` | הכל-קיים → GREEN · סמן-חסר → RED · לא-נמדד → UNKNOWN |

כל-פסק: `{id, verdict, measuredAt, evidence:{...ערכים-נמדדים, אפס-סודות}, note}`.

## הרצה

```bash
node ops/fresh-oracle/oracle.mjs --selftest   # 12 וקטורים, אפס-רשת — חייב 12/12 לפני כל-ריצה-חיה
node ops/fresh-oracle/oracle.mjs              # ריצה-חיה: מדידה → פנקס → verdict.md → readback
```

אפס-תלות · node ≥ 18 · ESM טהור. הריצה-החיה כותבת:

1. `receipts/fresh-oracle-latest.json` — **פנקס-מאוחד** (`schema: sandbox/fresh-oracle-latest/1`):
   `prior` = הקבלה המקורית של zai-13 מילה-במילה · `runs[]` = append-bounded (12 ריצות אחרונות) ·
   `summary` = ספירת-הפסקים של הריצה-האחרונה. לפני-כתיבה: **auditor-סודות** (דפוסי WIF/5H,
   טוקני-GitHub, שדות-חומר-מפתות) — מציאה = אבוט-מלא, כלום לא נכתב. אחרי-כתיבה: **readback**
   (מה שנקרא-חזרה == מה שנמדד).
2. `ops/fresh-oracle/verdict.md` — טבלת-פסק-עברית קצרה, מתחדשת כל-ריצה (אל-תערכו ידנית).

## תזמון

`.github/workflows/fresh-oracle.yml` — **שבועי יום-ד' 05:07 UTC** (דקה-אי-זוגית; נבדל מ-key-proof
04:23 ומ-office-window 06:17) + `workflow_dispatch` להרצה-על-דרישה. ה-workflow: selftest כשער-כניסה →
ריצה-חיה → commit `[skip ci]` עם identity-noreply → rebase-push ×5 (ה-ripo חם: heartbeats כל-~5 דק').

סודות: `ZIP_PAT` (כבר-מנותב לריפו-זה) משמש **קריאה-פרטית בלבד** של מרשם-ה-באס — כותרת-Authorization
שמעולם לא נכתבת/מודפסת. אין-token / פג-תוקף → הפסק הוא BUS-UNKNOWN כנה, לא שקר.

## קריאת-פסקים

| פסק | משמעות-אמת | פעולה-נאותה |
|---|---|---|
| 🟢 GREEN | נמדד ועומד בחוק | כלום — זו ההוכחה |
| 🟠 AMBER | חי אבל מזדקן/חשיפה-חלקית | לא מושתק — מיועד-לעין; תזמון-מפיק נבדק |
| 🔴 RED | סתירה-מוכחת בין פרסום-ציבורי למציאות | דגל-לבעלים/למסילה-המוחזקת (השער מדווח, לא מרדף) |
| ⚪ UNKNOWN | המדידה-עצמה לא הצליחה (רשת/גישה) | כנות: לא יודעים — מנסים שוב בריצה-הבאה |

**גבול-אחריות:** השער מודד ומפרסם פסקים כנים. RED במסילת-אחר (FleetHQ/Domain/Zip/proof)
נשאר באחריות-המחזיק-המוצהר שלה — נכתב-בפנקס, לא נתוק-על-ידי-שער-זה (R4 לא-דורסים).

## קרדיט-הצטרפות

- **zai-13** (trace 1a12cd03e2820f59): שיטת ה-byte-oracle V-FLEETHQ-FRESH, הקבלה הראשונה 4/4 MATCH,
  ו-OWNER-WORD מדוגל — "standing scheduled gate". שער-זה הוא ההקבלה. שיטתם נשמרת (page/source/
  liveSha16/committedSha16/verdict) והורחבה.
- **zai-11c** (`Zip@686e0d00`): שיטת בריאות-ה-באס (bus-validate.mjs) — פורט קריאה-בלבד.
- **zai-11a** (key-proof): הארטיפקט שנבדק כאן לטריות הוא שער-R11 העומד שלהם.
