# AUDIT-T43d — ביקורת-אדומה עצמאית (יד-3d · משפחת agent-3)

בודק: יד-3d, עצמאי-מלא (לא-כתב אף-שורה-מהעץ הנבדק). היקף: כל-העץ · כל-ההיסטוריה (5 קומיטים) · חוזה-המשפחה (`state/README.md`). שיטה: הרצות-ממשיות בלבד — כל-ממצא עם קובץ:שורה ובייטים-מצוטטים.

---

## 1) פסק-דין-פר-תחום

| תחום | פסק | סיכום-מדידה |
|---|---|---|
| secrets | **נקי** | leak-scan `--staged` על 25 קבצים: 0 התאמות · היסטוריה-מלאה: 0 טוקנים/PEM/JWT · אין-קבצים-רגישים-מטופלים |
| workflows | **נקי+הערות** | הרשאות-מזעריות · אין-pull_request_target · אין-`${{` ב-`run:` · GITHUB_TOKEN-בלבד · cron-תקין; חסר-timeout ב-sovereign.yml |
| console | **תקין, CSP-רך** | params.json-פומבי-מטבעם · אפס-CDN · אפס-innerHTML · זרימת-סיסמה-זיכרון-בלבד; אבל `script-src 'unsafe-inline'` |
| cockpit | **תקין** | אפס-משאבי-חוץ · CSP-script `'self'` קשוח · נעילה-15דק' קיימת-בקוד · כספת-מעטפות-בלי-חומר-גלוי · gate-crypto-ללא-רשת |
| boot | **תקין-עם-ליקויים-קלים** | אין-curl|bash · טוקן-לא-מודפס · סודות-ב-tmp-ב-0600; `set -uo` בלי `-e` · בלוק-מת-ב-verify.sh · URL-שגוי-מודפס |
| claims | **עקבי-ברובו** | 650k ✓ · genesis-sha256 ✓ · פורמט-[tick] ✓ · append-only ✓ · נעילה-15דק' ✓ · 600k-כספת ✓; נאמנות-צי = מיוחס-למדידה-חוץ |
| contract (`state/README.md`) | **תקין-בעיקרו, 2-תקלות-חוזה** | חוק-הכנות-מעולה; אבל keeper.log-מנוגד-.gitignore · קריאת-leak-scan-על-תיקייה-תיכשל-תמיד |

---

## 2) ממצאים

### [HIGH] H-1 · keeper.log חסום-ע"י `.gitignore` — החוזה-מבטיח-קובץ-שלא-יוכל-להיכנס-לגיט
- ראיה 1: `.gitignore:3` = `*.log`
- ראיה 2: `state/README.md:75` = `keeper.log: [<ISO-Z>] tick#N ...` (חוקי-פורמט) ו-`:76` = `ה-commit **רק** git add state/`
- ראיה 3: `state/README.md:91` = status/-דף-קורא-זנב-`keeper.log` (30) מה-CDN
- ראיה 4 (מדידה): `git check-ignore -v state/keeper.log` → `.gitignore:3:*.log	state/keeper.log` · `git ls-files` = אין-state/keeper.log
- משמעות: `git add state/` מדלג-בשקט-על-קבצים-מנוטרלים → keeper.log **לעולם-לא**-יחדר-להיסטוריה-בדרך-החוזית; פאנל-יומן-הטיקים-ב-status/-יקבל-404-קבוע. סוכן-3-אסור-לו-לגעת-ב-.gitignore (state/README.md:8) → נדרש-החלטת-מנהל: `git add -f` מתועד-בחוזה, או-תיקון-.gitignore-ע"י-agent-1/מנהל.
- **agent-3-should-fix** (בתיאום-מנהל)

### [HIGH] H-2 · חוזה-ה-workflow-מצווה-קריאת-leak-scan-שתיכשל-בכל-ריצה
- ראיה 1: `state/README.md:86` = `node engine/leak-scan.mjs state/` (fail-closed)
- ראיה 2: `engine/leak-scan.mjs:13` = שימוש-חוקי `node engine/leak-scan.mjs [--passfile <path>] <file...>` — קבצים-בלבד
- ראיה 3 (מדידה): `node engine/leak-scan.mjs console` → stderr: `[leak-scan] ✖ קובץ-מטרה-לא-נקרא: console — fail-closed` · exit=1 (readFileSync-על-תיקייה=EISDIR)
- משמעות: עורק-המדינה-המתוכנן-ייכשל-בכל-ריצה-בשלב-הסריקה → אף-טיק-לא-יידחף-מעולם. תיקון: מעבר-רשימת-קבצים (`state/network-state.json state/keeper.log ...`) או `--staged`. דפוס-הקיים-הנכון: `.github/workflows/sovereign.yml:34` (`receipts/latest.json receipts/ticks.jsonl`).
- **agent-3-should-fix**

### [MED] M-1 · CSP-הקונסולה: `script-src 'unsafe-inline'`
- ראיה: `console/index.html:7` = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'none'; connect-src 'self'">`
- משמעות: מקטין-הגנת-XSS למרות-אפס-innerHTML-נמדד; אפשר `'self' 'sha256-<hash>'` על-הסקריפט-המוטמע-היחיד (קובץ-סטטי — hash-יציב).
- **שייך-ל-agent-1 — לא-מתוקן-כאן**

### [MED] M-2 · "הוכחה-תמיד-זמינה" מול-CDN-TTL-שלא-מתועד
- ראיה 1: `README.md:55` = "ההוכחה-שלא-תלויה-בטענות — כל-מה-שמוצג נמדד בענן ונקרא מהגיט"
- ראיה 2: `state/README.md:91` = קריאה-מ-`raw.githubusercontent.com/...` + cache-busting `?t=` — **אין-תיעוד** ש-TTL-ה-CDN-עד-~5-דק'-ומדידת-גיל-הטיק-היא-הפיצוי
- משמעות: עדכון-טיק-לא-מופיע-מיד-בדף; נורת-זקנת-טיק (עבודת-המשפחה) פותרת-את-הרושם-אך-החוזה-עצמו-צריך-לומר-זאת-במפורש.
- **agent-3-should-fix** (שורת-כנות-בחוזה)

### [MED] M-3 · keeper.log ללא-סיבוב — צמיחה-בלתי-מוגבלת
- ראיה 1: `state/README.md:74` = "יומן `keeper.log` שורה-אחת-לטיק" — אין-TAIL/סיבוב
- ראיה 2 (תקדים-קיים): `engine/sovereign-tick.mjs:24,86` = `TAIL=512` עם-קיצוץ-מדוד ל-receipts/ticks.jsonl
- משמעות: ~96-שורות/יום → קובץ-והיסטוריה-צומחים-ללא-תקרה; יש-לקבוע-TAIL-מדוד (כמו-512) או-סיבוב-חודשי-מתועד.
- **agent-3-should-fix** (החוזה-שלכם)

### [LOW] L-1 · sovereign.yml ללא `timeout-minutes`
- ראיה: `.github/workflows/sovereign.yml:16-19` — אין-timeout (ברירת-מחדל-עד-360-דק') עם `concurrency: { group: sovereign-tick, cancel-in-progress: false }` → ריצה-תקועה-חוסמת-את-הקבוצה-שעות. (החוזה-החדש כבר-מתחייב-10-דק' — `state/README.md:84` ✓)
- **שייך-ל-agent-1 — לא-מתוקן-כאן**

### [LOW] L-2 · boot-סקריפטים: `set -uo pipefail` בלי `-e`
- ראיה: `boot/bootstrap.sh:22` = `set -uo pipefail` · `boot/verify.sh:6` = `set -uo pipefail`
- ניחום: נתיבים-קריטיים-מטופלים-ב-`|| fail` (bootstrap.sh:30,37,61) ו-כישלונות-יורדים-בכנות; עדיין-שגיאה-בלתי-צפויה-ממשיכה-לרוץ.
- **שייך-ל-agent-2 — לא-מתוקן-כאן**

### [LOW] L-3 · verify.sh: בלוק-node-מת-שמזהם-stderr-בכל-ריצה
- ראיה: `boot/verify.sh:24-28` — heredoc שקורא `require("file:///tmp/gate-crypto-verify.mjs")`; הקובץ-אינו-נוצר-בשום-מקום (bootstrap.sh-אינו-מזכיר-gate-crypto) → `require`-זורק, node-יוצא-שגיאה-כל-ריצה (לא-קטלני — אין `-e`), ו-GC-שלו-בכל-מקרה-לא-מועבר-לסקריפט-האמיתי (שורות 31-71).
- **שייך-ל-agent-2 — לא-מתוקן-כאן**

### [LOW] L-4 · verify.sh: מדפיס-URL-שגוי לקוקפיט
- ראיה 1: `boot/verify.sh:82` = `cockpit: live URL = https://roshpinacare-sys.github.io/Sandbox/`
- ראיה 2: `.github/workflows/pages.yml:35-36` = `cp -r docs/. _site/cockpit/` → הקוקפיט-ב-`/cockpit/`
- **שייך-ל-agent-2 — לא-מתוקן-כאן**

### [LOW] L-5 · bootstrap.sh: PAT-בפרמטרי-תהליך + כתיבת-PAT-לתוך-עץ-עבודה-משוכפל
- ראיה 1: `boot/bootstrap.sh:52` = `export CRED_HELPER="!f() { echo username=x-access-token; echo password=${TOKEN}; }; f"` — הטוקן-גלוי-ב-`ps` למשך-ה-clone (מקומי-בלבד; אין-טוקן-ב-URL ✓ שורה-51)
- ראיה 2: `boot/bootstrap.sh:71` = `printf '%s' "$TOKEN" > "$FV/upload/pat.env"` — כתיבת-הטוקן-לתוך-עץ-ה-clone-של-ריפו-אחר-ב-tmp (chmod-700-שורה-72 ✓; הריפו-ההוא-מחוץ-להיקף-כאן)
- **שייך-ל-agent-2 — לא-מתוקן-כאן**

### [LOW] L-6 · receipts: שדה `keysLeaked:false` קבוע-בקוד — לא-מדידה
- ראיה 1: `engine/sovereign-tick.mjs:78` = `keysLeaked: false` (מוקשה)
- ראיה 2: `sovereign.yml:33-34` — הסריקה-רצה-בנפרד אחרי-הטיק; אם-נכשלת-ה-commit-לא-יוצא → השדה-נכון-בפועל-רק-בעקיפין. ברוח-חוק-הכנות: שדה-שלא-נמדד-ע"י-הכותב.
- **שייך-ל-agent-1 — לא-מתוקן-כאן**

### [LOW] L-7 · cockpit: `innerHTML` על-נתוני-שרשרת
- ראיה: `docs/app.js:351,356` — תבניות-מחרוזת-עם-`${dgpo.*}` מ-RPC-ציבורי מוזרקות-ל-innerHTML.
- ניחום: CSP `script-src 'self'` (docs/index.html:6) חוסם-ביצוע-סקריפט; נותר-הזרקת-HTML/דפינג-בלבד.
- **שייך-ל-agent-2 — לא-מתוקן-כאן**

### [INFO] I-1 · שם-הסכמה `sanbox-state/1` (בלי-d)
- ראיה: `state/README.md:15` · `state/network-state.json:3` — עקבי-בשניהם; כנראה-אות-מכוון-בעקבות-סיפור-השם (worklog-T-41). מומלץ-לאשר-כוונה-פעם-אחת.
- **agent-3-should-confirm**

### [INFO] I-2 · pages-ארטיפקט מפרסם גם docs/RUNBOOK.md
- ראיה: `pages.yml:36` (`cp -r docs/. _site/cockpit/`) — RUNBOOK-הוא-מסמך-פומבי-גם-בריפו; אין-דליפה. רישום-לשקיפות-בלבד.
- **שייך-ל-agent-2 — לא-מתוקן-כאן (אין-צורך-ממשי)**

### [INFO] I-3 · checkout@v4 משאיר-GITHUB_TOKEN-ב-git-config-הראנר
- ראיה: `sovereign.yml:21-23` · `pages.yml:27` — ברירת-מחדל `persist-credentials: true`; כל-הצעדים-הבאים-רצים-קוד-ראשון-party בלבד → סיכון-מקובל; הצמדת-SHA-כבר-רשומה-כסבב-עתידי (SECURITY.md:27).

---

## 3) רשימת-אישור (נבדק-וירוק)

- **סריקת-דליפות**: `node engine/leak-scan.mjs --staged` → `[leak-scan] ✔ נקי — אפס-התאמות` exit=0 (על כל 25 הקבצים-המטופלים+untracked).
- **היסטוריה-מלאה** (`git log --all -p`, 5 קומיטים): 0 התאמות ל-`github_pat_` · `ghp_` · `AKIA…` · `xox[bap]-` · `sk-…` · JWT (`eyJ…`) · `-----BEGIN` (0). התאמה-יחידה-ל-regex-WIF-נאיבי = שקר-חיובי-בתוך-base64-של-`docs/vault.enc.json` (`5Dr72Vin8ZeSgUzBNmOE28…`) — דפוס-base58-הקנוני-ב-leak-scan-עצמו-לא-דגל אותה.
- **git ls-files**: אין-קבצים-התואמים `\.env|\.pass|secret|token|key|\.asc|\.pem|credential` (0).
- **.gitignore** מכסה: `upload/` · `*.pass` · `seal-tmp/` · `.passfile` · `tools/payload-template.json` ✓.
- **params.json** (`console/params.json:1-12`): שדות-פומביים-בלבד (v/kdf/iterations=650000/hash/keyLen=32/saltB64/ivB64/cipher/tagLenBits=128/note) — אפס-חומר-סוד.
- **console/index.html**: אין-src/href-חוץ (יחיד: עוגן-`<a href="https://github.com/…SECURITY.md">` שורה-87 — ניווט-בלבד, לא-משאב); אפס-innerHTML (0 התאמות); סיסמה-נמחקת-מהקלט (`passEl.value=""`); fetch-רק-`./params.json`+`./sealed-payload.bin` (same-origin, תואם-`connect-src 'self'`).
- **sealed-payload.bin**: 2944 בייטים, `file` → `data` (בינארי-אמיתי).
- **tools/seal.mjs**: הסיסמה-נקראת-לזיכרון (`seal.mjs:44`), מודפס-רק-מספר-בייטים (`:54` "תוכן-לא-מודפס"), באפרים-מאופסים (`:57,105`), כתיבה-יחידה = צופן+params (`:78-97`); תבנית-הפליינטקסט gitignored-ולא-מטופלת ✓.
- **engine/seal-selftest.mjs**: אפס-סיסמאות-מוצקות-בקוד; מבחן-2 = סטיית-תו-אחד (`:70`) — GCM-חייב-לזרוק.
- **docs/**: אפס-src/href-חוץ; `<script src="vendor/gate-crypto.js">`+`<script src="app.js">` מקומיים (`docs/index.html:225-226`); CSP-קשוח `script-src 'self'` (`docs/index.html:6`); **נעילה-אוטומטית-15-דק'-קיימת** — `docs/app.js:160` `LOCK_MS = 15*60*1000` + `bumpIdle()` (`:694-699`) → `lock("auto — 15 דקות חוסר-פעילות")`; חשיפת-מפתח-30-שנ' (`:652-653`); אפס-localStorage/cookie/IndexedDB (0 התאמות-קוד).
- **docs/vault.enc.json**: מבנה-מעטפות-בלבד — body.iv + body.ct(26,276-תווים) + wraps[3] (primary-52/canon-62/word, `iter:600000` ✓ לטענת-README:46) + gate.hint; אין-שדה-שנראה-כחומר-מפתח-גלוי.
- **docs/vendor/gate-crypto.js**: 381 שורות; 0 התאמות ל-`fetch(|XMLHttpRequest|WebSocket|https?://` — קריפטו-אפס-רשת ✓.
- **boot/**: אין-`curl … | bash` (curl-יחיד: `bootstrap.sh:43` עם `-o /dev/null` — בדיקת-HTTP-code-בלבד); טוקן-לא-מודפס-מעולם (רק `(${#TOKEN} chars` שורה-38); סודות-חיים-ב-`$WORK`-תחת-/tmp עם 700/600 (שורות 50,72,81,120-122); סיכות-sha256-כפולות-נאכפות לפני-פענוח (`bootstrap.sh:101,116` — אי-התאמה = סירוב).
- **workflows**: הרשאות-מזעריות (sovereign: `contents: write` · pages: `read+pages:write+id-token:write`); 0×`pull_request_target`; 0×`${{` בתוך-`run:` (יחיד: `pages.yml:24` ב-`environment:` — מותר); 0×`secrets.*` — GITHUB_TOKEN-בלבד; cron `*/15 * * * *` תקין (והמתוכנן `3,18,33,48 * * * *` תחבירית-תקין); קבוצות-concurrency נפרדות-וסבירות; **ארטיפקט-pages = `cp -r console/.` + `cp -r docs/.` בלבד** (`pages.yml:35-36`) — אף-לא-מילה-מ-receipts/ · state/ · boot/ · engine/ לא-מתפרסמת.
- **claims-שאומתו-בהרצה**: PBKDF2×650000 (`params.json:4` = `seal.mjs:31` = SECURITY.md:13) ✓ · genesis: `printf 'sanbox-genesis-v1' | sha256sum` = `f9aeab3c481cc79cc426e5594fa5bf6ba617592267fb73859f8fd2cb7a0b65e5` — שווה-בדיוק ל-state/README.md:64 ול-network-state.json ✓ · פורמט-הקומיט `[tick] sovereign heartbeat: <ISO>` (sovereign.yml:44) = קומיט-אמיתי 607380d ✓ · worklog-אכן-append-only: `git log --all -p -- worklog.md` → 0 שורות-נמחקות ✓ · network-state.json-זרע-כנה: keeper/status=never-run, custody=unmeasured, operator=null — אפס-מנומנט ✓ · prevMerkle=null-בזרע לפי-החוזה (state/README.md:18) ו-merkle=genesis ✓.

---

## 4) כנות-הבודק: מה-לא-ניתן-לאימות-מבפנים

1. **README.md:30 "כל-15-דק' GitHub-עצמו מריץ את עורק-הריבונות"** — התנהגות-cron-בצד-GitHub אינה-נמדדת-מהריפו; עבודת-agent-3 (worklog-T-43) מדדה-דרך-API: 0 ריצות-מתוכננות. הטענה-ב-README-נותרה-לא-מתוקננת-במקומה (שייך-ל-agent-3 — אפשר-הערת-מדידה).
2. **README.md:41,55 — חיות-דפי-Pages** (הקונסולה/קוקפיט/status-באוויר) — לא-ניתן-לבדיקה-מהריפו.
3. **README.md:51 מספרי-נאמנות (headcorner 4/4 · 61 מיושנים) ו-worklog-T-37 "verify_authority = TRUE"** — מדידות-מוצפנות-בכספת/מול-שרשרת-חיה; מיוחסות-במפורש למדידה-חוץ-2026-10-09 — לא-ניתנות-לחזרה-מהריפו (הערכת-הייחוס: תקין).
4. **SECURITY.md:16 "נמדד: 64-תווים…"** — קובץ-הסיסמה-מחוץ-לריפו-בעיצומו; לא-ניתן-לאימות (וזה-נכון-בעיצובו — אף-חומר-סיסמה-לא-חי-כאן; אימות-היעדר-שרידים עבר: אין-.passfile/תבנית/סימן-קנון-62-מטופלים ✓).
5. **worklog-T-41 מבחני-חותם-חיים (seal-roundtrip/selftest)** — דורשים-passfile-מקומי; לא-ניתנים-לחזרה-כאן. (הקוד-הנדון-נקרא-ונמצא-עקבי.)
6. **worklog-T-43 "state/keeper.log (כותרת-בלבד)"** — **הפרה-נמדדה**: הקובץ-אינו-קיים-בקומיט b7bd18e — כנראה-בגלל-`.gitignore:3` (ראה-H-1). זו-הטענה-היחידה-בפנקס-שנפלה-בבדיקה.
7. **README.md:53-58 (סעיף-agent-3) מתאר status/ · sovereign-state.yml כקיימים** — בעץ-זה-עדיין-אינם-קיימים (הכרזה-מקדימה-לביצוע); ייחשב-כנה-רק-אחרי-המיזוג.
8. **כתיבה-מחדש-של-היסטוריה / force-push** — לא-ניתן-למדידה-מעבודת-מקומית (אין-גישה-לרפו-המרוחק); מה-נמדד: 5 קומיטים, קו-היסטוריה-ליניארי.
9. **tools/seal.mjs:13 "ודריסת-התבנית-בזמן-חתימה"** — בקוד-אין-כתיבה/מחיקה-של-התבנית; ה-RUNBOOK-מתאר-עריכה-ידנית. ניסוח-התג-מטעה-קלות (שייך-ל-agent-1).

---
*סוף-ביקורת. הבודק לא-שינה-דבר-מלבד-קובץ-זה.*
