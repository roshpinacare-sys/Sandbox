#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sovereign-invariants checker — D1..D7
=====================================
מנוע-האכיפה הסטטי של חוקי-הריבונות (תבנית structure-audit של נימבוס, מחודדת לריבונות):
בודק את הריפו-החי מול 7 חוקים מבניים. fail-loud: exit 0 = ירוק, exit 1 = הפרות,
exit 2 = תקלה-פנימית (לעולם לא שקט).

Usage:
  python3 check_invariants.py [REPO_ROOT] [--json OUT.json] [--rule D4]

כללים:
  D1  פורמט-הפנקס — רשומות-פרוטוקול (מ-2026-10-11) = שורה-אחת, 5 שדות מופרדי " | "
  D2  קיום-קבלות — כל נתיב-קונקרטי שרשומת-פנקס של Sandbox טוענת, חייב להתקיים ב-HEAD
  D3  תקרת-תקציב — כל workflow מתוזמן חייב "# budget: max=N" או רשומה ב-budgets.json;
      פורמט=חוק (budgets.json שבור/ריק/במבנה-שגוי אדום גם-בלי-קרונות) + סחרור-הפוך
      (רשומה-ל-workflow שאינו-קיים = כיסוי-רפאים = אדום) — מוגרים-הביתה מ-check_i38.py של
      רושפינה (0348a40b) שם-נולדו; הדיסציפלינה: לא להעתיק — לחדד
  D4  אין-דחיפה-שקטה — כישלון-git-push חייב להצטעק (לא || true, לא /dev/null,
      ולולאת-ניסיונות חייבת שער-נחיתה מצטעק אחריה)
  D5  זהות-אחת — כל user.email בהקשר-חתימה חייב להתאים ל-ALLOWED של identity-guard
      (הרשימה נגזרת-מהחוק-עצמו בזמן-ריצה — אי-אפשר לסטות ממנו)
  D6  שלמות-המסמך-העצמי — המסמך S-table חייב להיות מונוטוני מלא, וכל D-rule בקוד
      חייב להיות מתועד במסמך ולהפך (דריפת-מסמך = exit 1)
  D7  צורות-סודות — אפס מחרוזות בצורת טוקן-חי (ghp_/github_pat_/sk-/WIF) בקבצי-טקסט

גבולות-מוצהרים: D2 מאמת רק טוקנים-דמויי-נתיב (טקסט-תיאורי נספר-כבלתי-ניתן-לאימות);
D4 הוא היוריסטיקת-שורה — לולאות-מורכבות עשויות לדרוש עין-אנושית; D5 סורק הקשרי-חתימה
בלבד (אזכורי-חוק-בטקסט אינם הפרה); D7 סורק טקסט-גלוי (קבצי .enc/.png מחוץ-לטווח
מטבעם) ומדלג על תיקיית-המכונה עצמה (החוק אינו נסרק-על-ידי-חוק-הסודות שלו).
"""
import json
import os
import re
import sys
from datetime import date

D_RULES = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"]

LEDGER_REL = "ops/AGENT-LEDGER.md"
DOC_REL = "ops/sovereign-invariants/SECURITY-INVARIANTS.md"
BUDGETS_REL = "ops/sovereign-invariants/budgets.json"
ALLOWLIST_REL = "ops/sovereign-invariants/allowlist.json"
IDENTITY_GUARD_REL = ".github/workflows/identity-guard.yml"
MACHINE_DIR = "ops/sovereign-invariants"
PROTOCOL_ERA = "2026-10-11"  # רשומות-קודמות הן-פרוזה-חופשית; D1 נאכף מהעידן-הזה

SKIP_DIRS = {".git", "__pycache__", "node_modules"}

TEXT_SUFFIX = (".md", ".json", ".yml", ".yaml", ".py", ".mjs", ".cjs", ".js", ".ts",
               ".sh", ".txt", ".html", ".css", ".toml", ".cfg", ".ini")

SECRET_SHAPES = [
    ("github-pat-classic", re.compile(r"ghp_[0-9A-Za-z]{36}")),
    ("github-pat-fine", re.compile(r"github_pat_[0-9A-Za-z_]{22,255}")),
    ("openai-key", re.compile(r"(?<![A-Za-z0-9])sk-(?:proj-)?[A-Za-z0-9_-]{20,}")),
    ("wif", re.compile(r"(?<![1-9A-HJ-NP-Za-km-z])5[KJH][1-9A-HJ-NP-Za-km-z]{49}(?![1-9A-HJ-NP-Za-km-z])")),
]


def load_text(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except OSError:
        return None


def iter_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            yield os.path.join(dirpath, fn)


class Report:
    def __init__(self):
        self.findings = []
        self.unverifiable = []

    def fail(self, rule, detail):
        self.findings.append({"rule": rule, "status": "FAIL", "detail": detail})

    def ok(self, rule, detail):
        self.findings.append({"rule": rule, "status": "OK", "detail": detail})

    def skipped(self, detail):
        self.unverifiable.append(detail)

    def rule_status(self, rule):
        rows = [f for f in self.findings if f["rule"] == rule]
        if any(f["status"] == "FAIL" for f in rows):
            return "FAIL"
        if not rows:
            return "NOT-RUN"
        return "OK"


# ---------------- D1: ledger format ----------------
def d1_ledger_format(root, rep):
    text = load_text(os.path.join(root, LEDGER_REL))
    if text is None:
        rep.fail("D1", f"{LEDGER_REL} חסר")
        return
    checked = 0
    bad = []
    for i, line in enumerate(text.splitlines(), 1):
        if not re.match(r"^\d{4}-\d{2}-\d{2} \| ", line):
            continue
        if line[:10] < PROTOCOL_ERA:
            continue
        checked += 1
        fields = line.split(" | ")
        if len(fields) != 5:
            bad.append((i, len(fields)))
    if bad:
        sample = ", ".join(f"line {i} has {n} fields" for i, n in bad[:5])
        rep.fail("D1", f"{len(bad)} רשומות-פרוטוקול בפורמט-שגוי (נדרש 5 שדות): {sample}")
    else:
        rep.ok("D1", f"{checked} רשומות-פרוטוקול מאז {PROTOCOL_ERA} — כולן שורה-אחת, 5 שדות")


# ---------------- D2: receipt existence ----------------
PATH_TOKEN = re.compile(
    r"(?<![\w./-])((?:\.github|ops|receipts|proof|audit|agents|engine|boot|console|docs|federation|fleet|heal|network|operator|state|status|tools|research|retro|build)/[\w./-]+\.(?:md|json|ya?ml|py|mjs|cjs|js|ts|sh|txt|html|enc))"
)


def d2_receipt_existence(root, rep, fileset):
    text = load_text(os.path.join(root, LEDGER_REL))
    if text is None:
        rep.fail("D2", f"{LEDGER_REL} חסר")
        return
    checked = 0
    missing = []
    for line in text.splitlines():
        if not re.match(r"^\d{4}-\d{2}-\d{2} \| ", line):
            continue
        parts = line.split(" | ")
        if len(parts) != 5:
            continue
        repo_field, files_field = parts[3], parts[4]
        if "Sandbox@" not in repo_field.replace(" ", ""):
            continue
        tokens = PATH_TOKEN.findall(files_field)
        if not tokens:
            rep.skipped(f"רשומה-ללא-נתיב-קונקרטי: {files_field.strip()[:60]}")
            continue
        for tok in tokens:
            if tok in fileset:
                checked += 1
            else:
                missing.append(tok)
    if missing:
        uniq = sorted(set(missing))
        rep.fail("D2", f"{len(uniq)} נתיבים שרשומות-פנקס של Sandbox טוענות ואינם ב-HEAD: {', '.join(uniq[:8])}")
    else:
        rep.ok("D2", f"{checked} נתיבי-קבלה אומתו מול עץ-HEAD; {len(rep.unverifiable)} רשומות-תיאוריות (בלתי-ניתנות-לאימות-מבני)")


# ---------------- D3: budget ceilings (sharpened: format-is-law + reverse drift) ----------------
def d3_budgets(root, rep):
    wf_dir = os.path.join(root, ".github", "workflows")
    budgets = {}
    btxt = load_text(os.path.join(root, BUDGETS_REL))
    if btxt is not None:
        # FORMAT IS LAW — migrated from roshpina check_i38.py (0348a40b): a malformed
        # budgets.json is RED even when no cron exists. File exists but empty/whitespace
        # → JSONDecodeError → RED (the old code silently treated "" as "no ledger").
        try:
            parsed = json.loads(btxt)
        except json.JSONDecodeError as e:
            rep.fail("D3", f"{BUDGETS_REL} אינו JSON תקין: {e}")
            return
        if not isinstance(parsed, dict) or not isinstance(parsed.get("workflows"), dict):
            rep.fail("D3", f"{BUDGETS_REL} — מבנה שגוי (נדרש {{\"workflows\": {{…}}}}; מפתח-חסר/שורש-שאינו-מילון = אין-ספר-חוק)")
            return
        budgets = parsed["workflows"]
        for fn, entry in budgets.items():
            if not (isinstance(entry, dict) and isinstance(entry.get("max"), int) and not isinstance(entry.get("max"), bool) and entry["max"] >= 0):
                rep.fail("D3", f"{BUDGETS_REL} — {fn}: תקרה שאינה מספר-שלם ≥0")
                return
    scheduled = []
    missing = []
    if os.path.isdir(wf_dir):
        for fn in sorted(os.listdir(wf_dir)):
            if not fn.endswith((".yml", ".yaml")):
                continue
            txt = load_text(os.path.join(wf_dir, fn))
            if txt is None or "schedule:" not in txt:
                continue
            scheduled.append(fn)
            if re.search(r"#\s*budget:\s*max=(\d+)", txt):
                continue
            entry = budgets.get(fn)
            if isinstance(entry, dict) and isinstance(entry.get("max"), int) and entry["max"] >= 0:
                continue
            missing.append(fn)
    # REVERSE DRIFT — migrated from roshpina check_i38.py: a budget entry naming a
    # workflow file that does not exist is RED (ghost coverage lies). The old code
    # checked only the forward direction.
    ghosts = [fn for fn in budgets if not os.path.isfile(os.path.join(wf_dir, fn))]
    if missing:
        rep.fail("D3", f"{len(missing)} workflows מתוזמנים בלי תקרת-תקציב מוצהרת: {', '.join(missing[:6])}")
    elif ghosts:
        rep.fail("D3", f"{len(ghosts)} רשומות-תקציב ל-workflows שאינם קיימים (כיסוי-רפאים משקר): {', '.join(ghosts[:6])}")
    else:
        rep.ok("D3", f"{len(scheduled)} workflows מתוזמנים — לכולם תקרת-תקציב (inline או budgets.json); {len(budgets)} רשומות-תקציב, 0 רפאים")


# ---------------- D4: no silent push ----------------
def d4_silent_push(root, rep):
    scan_files = []
    wf_dir = os.path.join(root, ".github", "workflows")
    if os.path.isdir(wf_dir):
        scan_files += [os.path.join(wf_dir, fn) for fn in sorted(os.listdir(wf_dir)) if fn.endswith((".yml", ".yaml"))]
    for sub in ("agents", "scripts"):
        d = os.path.join(root, sub)
        if os.path.isdir(d):
            for dirpath, dirnames, filenames in os.walk(d):
                dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS]
                scan_files += [os.path.join(dirpath, fn) for fn in filenames
                               if fn.endswith((".mjs", ".cjs", ".js", ".sh", ".py"))]
    violations = []
    for p in scan_files:
        txt = load_text(p)
        if not txt or "git push" not in txt:
            continue
        rel = os.path.relpath(p, root)
        for i, line in enumerate(txt.splitlines(), 1):
            if "git push" not in line:
                continue
            toks = re.split(r"(\|\||&&|;)", line)
            for j, seg in enumerate(toks):
                if "git push" not in seg:
                    continue
                if "/dev/null" in seg:
                    violations.append(f"{rel}:{i} — git-push מוסתר-ל-/dev/null")
                    break
                if j + 2 < len(toks) and toks[j + 1] == "||" and toks[j + 2].strip() == "true":
                    violations.append(f"{rel}:{i} — git-push עם ||-true (כישלון-נבלע)")
                    break
        has_loop = re.search(r"git push[^\n]*break \|\|", txt) is not None
        has_loud = (re.search(r"git push[^\n]*\|\|\s*\{[^\n]*exit 1", txt) is not None) or ("ls-remote" in txt)
        if has_loop and not has_loud:
            violations.append(f"{rel} — לולאת-ניסיונות-push בלי שער-נחיתה מצטעק (כישלון-כל-הניסיונות = ירוק-שקט)")
    if violations:
        tail = f" (+{len(violations)-5} נוספים)" if len(violations) > 5 else ""
        rep.fail("D4", "; ".join(violations[:5]) + tail)
    else:
        rep.ok("D4", f"{len(scan_files)} קבצים נסרקו — אפס דחיפה-שקטה")


# ---------------- D5: one-face identity ----------------
def d5_identity(root, rep):
    law = load_text(os.path.join(root, IDENTITY_GUARD_REL))
    if law is None:
        rep.fail("D5", f"{IDENTITY_GUARD_REL} חסר — אין מקור-אמת לרשימת-הזהויות")
        return
    m = re.search(r"ALLOWED='(.*?)'", law)
    if not m:
        rep.fail("D5", "identity-guard.yml — רשימת ALLOWED לא נמצאה (החוק עצמו סוטה)")
        return
    try:
        allowed = re.compile("^" + m.group(1).replace("\\.", ".") + "$")
    except re.error:
        rep.fail("D5", "ALLOWED regex לא-ניתן-לקימוט")
        return
    AUTHOR_CTX = re.compile(r"user\.email|GIT_AUTHOR_EMAIL|GIT_COMMITTER_EMAIL")
    EMAIL = re.compile(r"[\w.+\-]+@users\.noreply\.github\.com")
    scan_paths = []
    wf_dir = os.path.join(root, ".github", "workflows")
    if os.path.isdir(wf_dir):
        scan_paths += [os.path.join(wf_dir, fn) for fn in sorted(os.listdir(wf_dir)) if fn.endswith((".yml", ".yaml"))]
    for sub in ("agents", "scripts", "boot", "engine"):
        d = os.path.join(root, sub)
        if os.path.isdir(d):
            for dirpath, dirnames, filenames in os.walk(d):
                dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS]
                scan_paths += [os.path.join(dirpath, fn) for fn in filenames if fn.endswith(TEXT_SUFFIX)]
    violations = []
    checked = 0
    for p in scan_paths:
        if os.path.relpath(p, root).replace(os.sep, "/") == IDENTITY_GUARD_REL:
            continue
        txt = load_text(p)
        if not txt or "@users.noreply.github.com" not in txt:
            continue
        for i, line in enumerate(txt.splitlines(), 1):
            if not AUTHOR_CTX.search(line) or "@users.noreply.github.com" not in line:
                continue
            for email in EMAIL.findall(line):
                checked += 1
                if not allowed.match(email):
                    violations.append(f"{os.path.relpath(p, root)}:{i} — זהות-חתימה-זרה {email}")
    if violations:
        tail = f" (+{len(violations)-5} נוספים)" if len(violations) > 5 else ""
        rep.fail("D5", "; ".join(violations[:5]) + tail)
    else:
        rep.ok("D5", f"{checked} הקשרי-חתימה נבדקו מול ה-ALLOWED שנגזר-מ-identity-guard — הכל ריבוני")


# ---------------- D6: doc self-integrity ----------------
def d6_doc_integrity(root, rep):
    doc = load_text(os.path.join(root, DOC_REL))
    if doc is None:
        rep.fail("D6", f"{DOC_REL} חסר — מכונה בלי מסמך-חוק")
        return
    ids = [int(x) for x in re.findall(r"^## S(\d+) —", doc, re.M)]
    problems = []
    if ids != list(range(1, len(ids) + 1)):
        problems.append(f"רצף-S אינו מונוטוני-מלא: {ids}")
    for sec in re.split(r"(?=^## S\d+ —)", doc, flags=re.M):
        m = re.match(r"^## S(\d+) —", sec)
        if not m:
            continue
        for req in ("**Statement**", "**Wired at**", "**Enforcement**", "**Known limits**"):
            if req not in sec:
                problems.append(f"S{m.group(1)} חסר {req}")
    try:
        src = load_text(os.path.abspath(__file__)) or ""
        mm = re.search(r"D_RULES = \[(.*?)\]", src, re.S)
        code_rules = set(re.findall(r'"(D\d)"', mm.group(1))) if mm else set()
    except Exception:
        code_rules = set()
    doc_rules = set(re.findall(r"^\| (D\d) \|", doc, re.M))
    only_code = sorted(code_rules - doc_rules)
    only_doc = sorted(doc_rules - code_rules)
    if only_code:
        problems.append(f"חוקים-ממומשים-בקוד וחסרים-במסמך: {','.join(only_code)}")
    if only_doc:
        problems.append(f"חוקים-מתועדים-במסמך וחסרים-בקוד: {','.join(only_doc)}")
    if problems:
        rep.fail("D6", "; ".join(problems[:6]))
    else:
        rep.ok("D6", f"S1–S{len(ids)} מונוטוני-מלא, כל-סעיף עם ארבעת-הסעיפים; רישום-D מסונכרן דו-כיווני ({len(code_rules)} חוקים)")


# ---------------- D7: secret shapes ----------------
def d7_secrets(root, rep):
    allow = set()
    atxt = load_text(os.path.join(root, ALLOWLIST_REL))
    if atxt:
        try:
            with open(os.path.join(root, ALLOWLIST_REL)) as f:
                data = json.load(f) or {}
                allow = set(data.get("paths", []))
        except json.JSONDecodeError:
            rep.fail("D7", f"{ALLOWLIST_REL} אינו JSON תקין")
            return
    hits = []
    scanned = 0
    for p in iter_files(root):
        rel = os.path.relpath(p, root).replace(os.sep, "/")
        if rel.startswith(MACHINE_DIR + "/") or rel.startswith(".git/"):
            continue
        if not rel.endswith(TEXT_SUFFIX):
            continue
        if rel in allow:
            continue
        txt = load_text(p)
        if not txt:
            continue
        scanned += 1
        for name, rx in SECRET_SHAPES:
            m = rx.search(txt)
            if m:
                line_no = txt.count("\n", 0, m.start()) + 1
                hits.append(f"{rel}:{line_no} [{name}]")
    if hits:
        tail = f" (+{len(hits)-5})" if len(hits) > 5 else ""
        rep.fail("D7", f"{len(hits)} פגיעות צורת-סוד: {'; '.join(hits[:5])}" + tail)
    else:
        rep.ok("D7", f"{scanned} קבצי-טקסט נסרקו מול 4 צורות-סוד — אפס פגיעות")


# ---------------- main ----------------
def main():
    args = sys.argv[1:]
    root = "."
    json_out = None
    only = None
    i = 0
    while i < len(args):
        if args[i] == "--json":
            json_out = args[i + 1]; i += 2
        elif args[i] == "--rule":
            only = args[i + 1]; i += 2
        else:
            root = args[i]; i += 1
    root = os.path.abspath(root)
    rep = Report()
    fileset = {os.path.relpath(p, root).replace(os.sep, "/") for p in iter_files(root)}
    RULES = {
        "D1": lambda: d1_ledger_format(root, rep),
        "D2": lambda: d2_receipt_existence(root, rep, fileset),
        "D3": lambda: d3_budgets(root, rep),
        "D4": lambda: d4_silent_push(root, rep),
        "D5": lambda: d5_identity(root, rep),
        "D6": lambda: d6_doc_integrity(root, rep),
        "D7": lambda: d7_secrets(root, rep),
    }
    import datetime
    try:
        for rule in D_RULES:
            if only and rule != only:
                continue
            RULES[rule]()
    except Exception as e:
        print(f"INTERNAL-ERROR: {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(2)
    results = {r: rep.rule_status(r) for r in D_RULES if not only or r == only}
    receipt = {
        "schema": "sovereign.invariants.receipt/1",
        "generatedAt": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "root": os.path.basename(root),
        "rules": results,
        "findings": rep.findings,
        "unverifiableCount": len(rep.unverifiable),
        "verdict": "GREEN" if all(v != "FAIL" for v in results.values()) else "RED",
    }
    human = "\n".join(f"{f['status']:4} {f['rule']}  {f['detail']}" for f in rep.findings)
    print(human if human else "no rules ran")
    print(f"\nVERDICT: {receipt['verdict']}  ({', '.join(f'{k}={v}' for k, v in results.items())})")
    if json_out:
        os.makedirs(os.path.dirname(os.path.abspath(json_out)), exist_ok=True)
        with open(json_out, "w", encoding="utf-8") as f:
            json.dump(receipt, f, ensure_ascii=False, indent=1)
    sys.exit(0 if receipt["verdict"] == "GREEN" else 1)


if __name__ == "__main__":
    main()
