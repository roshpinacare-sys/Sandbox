# zai-fix · משבצת-תיקונים · 2026-10-11

משבצת-התיקונים של מפגש-הביקורת המקצועי (בלי-רחמים). ארבעה-תיקונים + שני-גילויים:

## תיקונים (קומיטים-מקומיים-מוכנים-להחלה)
- **7-a foundry** (4590814): loopback×5 mini-services + ניטרול `/keys/backup` (410 + גייט-env + tokenOk + אפס-חומר-מפתח-בתשובה) + סגירת fallback `metaJson.pass` (R11). tsc 0-errors · lint נקי · build-5-שירותים-OK.
- **7-b vault-guardian** (34d1d2a): shell-RCE → argv-exec (execFile) + `--` separators + validateRepoPath (containment + אנטי-option-injection). E2E: וקטור-הזרקה-הישן-אכן-רץ, החדש-לא-מריץ-כלום.
- **7-c טריגרים** (`branches: ain]`): **לא-קיימים** — אשליית-תצוגה (בייטים `[m` נבלעים-בפלט; `[main]` מוצג-`ain]`). הוכחת-בייטים: sha256+length-אורקל על 1,186-קבצים, 0-פגיעות. 0-קומיטים — אף-תיקון-פנטום-לא-נרשם-להיסטוריה.
- **7-d verifier** (fd19e10): rot-scan הדגיש-את-קבצי-ה-verifier-עצמם (false-positive). חוק-חדש: שורת-טבלה-עם-`שהיה-כאן` + תא-`undefined` ממש + מחוץ-ל-fence + מחוץ-לטריטוריה. `--scan-rot` dry-run: 0-היטים. פנקס-מרקל-שלם.

## גילויים
1. **7-ריפואים ארכוב (read-only) בגל-10-08**: saos-sovereign-foundry · anchor-baseline · saos-sovereign-platform · Defi · roshpina · Sdk · Project-files. משמעות: התיקונים-ל-foundry **לא-יכולים-להידחף** — מחכים-ל-patches שכאן (`patches/foundry/*.patch` — `git am` אחרי-הסרת-ארכוב) או-השתלה-ליורש.
2. **ייחוס-מתוקן**: vault-guardian נמצא ב-foundry `mini-services/` (לא-ב-control-center כפי-שנרשם-בעבודה-3-b).
