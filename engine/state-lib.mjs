/**
 * state-lib.mjs — ספריית-מדינה-טהורה (T-43b · Sandbox · משפחת-agent-3)
 * ═════════════════════════════════════════════════════════════════════════════
 * התשתית-המכנית של `sanbox-state/1` (החוזה-המחייב: state/README.md):
 *   · canonicalJson — מיון-מפתחות-רקורסיבי · בלי-רווחים · UTF-8 · מספרים-עשרוניים
 *   · sha256hex/sha256bytes · merkleAdvance — שרשרת-מרקל-מצטבר מעל genesis-מקובע
 *   · loadState/validateState — טעינה+תיקוף-קפדני (מילון-סטטוסים-סגור, טיפוסים)
 *   · atomicWrite — tmp+rename בלבד · boundedNotes — אחרונות-20
 *   · gitMeasurements — מדידות-git כנות (null כשלא-נמדד)
 *   · receiptsEcho — הד-מוגבל (≤10 שדות-מדידה + sha256-הבייטים) של receipts/latest.json
 *   · runChecks — סוללת-בדיקות-עצמיות (טיק: (a)–(f) · selftest-מלא: (a)–(i))
 * אפס-אפקטים-בזמן-import · אפס-תלות-חוץ (stdlib בלבד) · אפס-סודות · אפס-המצאה:
 * כל-שדה = מדידה או null — לעולם-לא-ירוק-מזויף.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const STATE_DIR = path.join(ROOT, "state");
export const STATE_FILE = path.join(STATE_DIR, "network-state.json");
export const KEEPER_LOG = path.join(STATE_DIR, "keeper.log");

/** היווסד-המקובע: sha256("sanbox-genesis-v1") — אין-לשנותו-לעולם */
export const GENESIS = "f9aeab3c481cc79cc426e5594fa5bf6ba617592267fb73859f8fd2cb7a0b65e5";
export const SCHEMA = "sanbox-state/1";
export const ACTIONS = ["health", "selftest", "snapshot", "arm", "disarm"];

const RE_HEX64 = /^[0-9a-f]{64}$/;
const RE_HEX12 = /^[0-9a-f]{12}$/;
const RE_ISO_Z = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
/**
 * פורמט-keeper.log — כולל-סיומת-מפעיל-אופציונלית `op=<action>`.
 * (חוזה-operator מחייב-סיומת-זו; בלעדיה-כל-טיק-אחרי-פעולת-מפעיל-היה-נופל-בבדיקה-(d).)
 */
export const LOG_RE =
  /^\[[^\]]+\] tick#\d+ (ok|fail) head=[0-9a-f]{12} merkle=[0-9a-f]{8} st=\d+\/\d+( op=(health|selftest|snapshot|arm|disarm))?$/;

/** מילון-הסטטוסים-הסגור (חוזה sanbox-state/1) */
export const VOCAB = {
  keeper: ["never-run", "ok", "degraded", "failed"],
  custody: ["unmeasured", "ok", "absent"],
  selftest: ["never-run", "ok", "failed"],
  killSwitch: ["dryrun", "armed"],
};

/* ── קנון-וגיבוב ────────────────────────────────────────────────────────────── */

/** קנון-JSON: מיון-מפתחות-רקורסיבי · בלי-רווחים · בסיס-העלה-של-שרשרת-המרקל */
export function canonicalJson(obj) {
  if (obj === undefined) return "null";
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

export function sha256hex(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

export function sha256bytes(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * חוק-השרשרת (מרקל-מצטבר): leaf=sha256(canonical(core)) ·
 * chainRoot=sha256(prevMerkle+":"+leaf) — hex-lowercase.
 */
export function merkleAdvance(prevMerkle, core) {
  const leaf = sha256hex(canonicalJson(core));
  const chainRoot = sha256hex(`${prevMerkle}:${leaf}`);
  return { leaf, chainRoot };
}

/** ליבת-המדידה של-טיק — שש-הבלוקים-החתומים-בשרשרת (בדיוק, לא-יותר) */
export function coreOf(parts) {
  return {
    keeper: parts.keeper,
    operator: parts.operator,
    killSwitch: parts.killSwitch,
    custody: parts.custody,
    selftest: parts.selftest,
    chain: parts.chain,
  };
}

/* ── טעינה ותיקוף ───────────────────────────────────────────────────────────── */

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);
const isStrOrNull = (v) => v === null || typeof v === "string";
const isIsoOrNull = (v) => v === null || (typeof v === "string" && RE_ISO_Z.test(v));

/** טעינה+תיקוף — זורק-שגיאה-כנה על-כל-הפרה-של-החוזה */
export function loadState() {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  validateState(state);
  return state;
}

export function validateState(state) {
  const fail = (m) => {
    throw new Error(`validateState: ${m}`);
  };
  if (!isObj(state)) fail("המצב-אינו-אובייקט");
  if (state.schema !== SCHEMA) fail(`schema לא-תואם: ${JSON.stringify(state.schema) ?? "undefined"}`);
  if (state.genesis !== GENESIS) fail("genesis אינו-תואם-לחוזה-המקובע");
  if (!(state.prevMerkle === null || (typeof state.prevMerkle === "string" && RE_HEX64.test(state.prevMerkle)))) {
    fail("prevMerkle אינו null או 64-hex");
  }
  if (typeof state.merkle !== "string" || !RE_HEX64.test(state.merkle)) fail("merkle אינו 64-hex");
  if (typeof state.updatedAt !== "string" || !RE_ISO_Z.test(state.updatedAt)) fail("updatedAt אינו ISO-Z");
  const k = state.keeper;
  if (!isObj(k)) fail("keeper חסר");
  if (!isInt(k.tickCount) || k.tickCount < 0) fail("keeper.tickCount אינו מספר-שלם ≥0");
  if (!isIsoOrNull(k.lastTick)) fail("keeper.lastTick אינו ISO/null");
  if (!(k.lastHead === null || (typeof k.lastHead === "string" && RE_HEX12.test(k.lastHead)))) {
    fail("keeper.lastHead אינו 12-hex/null");
  }
  if (!VOCAB.keeper.includes(k.status)) fail(`keeper.status מחוץ-למילון: ${JSON.stringify(k.status)}`);
  if (!isInt(k.consecutiveFailures) || k.consecutiveFailures < 0) fail("keeper.consecutiveFailures אינו שלם ≥0");
  const o = state.operator;
  if (!isObj(o)) fail("operator חסר");
  if (!(o.lastAction === null || ACTIONS.includes(o.lastAction))) {
    fail(`operator.lastAction מחוץ-למילון: ${JSON.stringify(o.lastAction)}`);
  }
  if (!isStrOrNull(o.by) || !isIsoOrNull(o.at) || !isStrOrNull(o.note)) fail("operator שדות-טיפוס");
  const ks = state.killSwitch;
  if (!isObj(ks)) fail("killSwitch חסר");
  if (!VOCAB.killSwitch.includes(ks.mode)) fail(`killSwitch.mode מחוץ-למילון: ${JSON.stringify(ks.mode)}`);
  if (typeof ks.since !== "string" || !RE_ISO_Z.test(ks.since)) fail("killSwitch.since אינו ISO-Z");
  if (!isStrOrNull(ks.note)) fail("killSwitch.note אינו string/null");
  const c = state.custody;
  if (!isObj(c)) fail("custody חסר");
  if (typeof c.source !== "string") fail("custody.source אינו string");
  if (!(c.echo === null || isObj(c.echo))) fail("custody.echo אינו אובייקט/null");
  if (!isIsoOrNull(c.echoedAt)) fail("custody.echoedAt אינו ISO/null");
  if (!VOCAB.custody.includes(c.status)) fail(`custody.status מחוץ-למילון: ${JSON.stringify(c.status)}`);
  const s = state.selftest;
  if (!isObj(s)) fail("selftest חסר");
  if (!isInt(s.passed) || s.passed < 0 || !isInt(s.total) || s.total < 0) fail("selftest.passed/total אינם שלמים ≥0");
  if (!isIsoOrNull(s.at)) fail("selftest.at אינו ISO/null");
  if (!VOCAB.selftest.includes(s.status)) fail(`selftest.status מחוץ-למילון: ${JSON.stringify(s.status)}`);
  const ch = state.chain;
  if (!isObj(ch)) fail("chain חסר");
  if (!(ch.headSha === null || (typeof ch.headSha === "string" && RE_HEX12.test(ch.headSha)))) {
    fail("chain.headSha אינו 12-hex/null");
  }
  for (const f of ["dirtyFiles", "trackedFiles", "worklogLines"]) {
    if (!isInt(ch[f]) || ch[f] < 0) fail(`chain.${f} אינו שלם ≥0`);
  }
  if (!Array.isArray(state.notes) || state.notes.length > 20 || !state.notes.every(isStrOrNull)) {
    fail("notes אינו מערך-מיתרים ≤20");
  }
}

/* ── כתיבה אטומית ───────────────────────────────────────────────────────────── */

/** כתיבה-אטומית: tmp-עם-pid ואז rename — אף-קורא-לא-רואה-חצי-קובץ */
export function atomicWrite(filePath, data) {
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

/** פנקס-הערות-חסום: דחיפה + השארת-האחרונות-20 (טהור — לא-מוטמע-בקלט) */
export function boundedNotes(notes, entry) {
  const next = Array.isArray(notes) ? [...notes, entry] : [entry];
  return next.slice(-20);
}

export function truncate(s, n) {
  return typeof s === "string" && s.length > n ? s.slice(0, n) : s;
}

export const nowIso = () => new Date().toISOString();

/* ── מדידות ─────────────────────────────────────────────────────────────────── */

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return ""; // git-שבור = headSha-null ובדיקה-(e)-נופלת — הכנות-נשמרת
  }
}

/**
 * מדידות-git של-העץ: headSha(12-hex|null) · dirtyFiles (שורות-porcelain שאינן-תחת-state/ —
 * תוצרי-הטיק-עצמו אינם-מזהמים-את-המדידה) · trackedFiles · worklogLines (שורות-לא-ריקות).
 */
export function gitMeasurements() {
  const headFull = git("rev-parse HEAD");
  const headSha = /^[0-9a-f]{40}$/.test(headFull) ? headFull.slice(0, 12) : null;
  let dirtyFiles = 0;
  const porcelain = git("status --porcelain");
  if (porcelain) {
    for (const line of porcelain.split("\n")) {
      if (!line.trim()) continue;
      const p = line.slice(3); // porcelain-v1: XY+רווח → הנתיב-מתחיל-ב-3
      if (/(^|\s)state\//.test(p)) continue; // תחת-state/ — לא-נספר
      dirtyFiles += 1;
    }
  }
  const trackedFiles = git("ls-files").split("\n").filter(Boolean).length;
  let worklogLines = 0;
  try {
    worklogLines = fs
      .readFileSync(path.join(ROOT, "worklog.md"), "utf8")
      .split("\n")
      .filter((l) => l.trim()).length;
  } catch {
    worklogLines = 0; // אין-קובץ = אפס-שורות-נמדדו
  }
  return { headSha, dirtyFiles, trackedFiles, worklogLines };
}

/**
 * הד-חד-כיווני-מוגבל של receipts/latest.json (קריאה-בלבד — לעולם-לא-כתיבה-שם):
 * עשרה-שדות-מדידה + sha256-הבייטים (חוזה: "≤10 שדות + sha256-הבייטים").
 * קובץ-חסר/לא-נותח = {status:'absent'} כנה (+note) — לעולם-לא-המצאה.
 */
export function receiptsEcho() {
  const p = path.join(ROOT, "receipts", "latest.json");
  let buf;
  try {
    buf = fs.readFileSync(p);
  } catch {
    return { status: "absent" }; // אין-קובץ — כנה
  }
  let t;
  try {
    t = JSON.parse(buf.toString("utf8"));
  } catch (e) {
    return { status: "absent", note: `receipts/latest.json לא-נותח: ${truncate(String((e && e.message) || e), 160)}` };
  }
  if (!isObj(t)) return { status: "absent", note: "receipts/latest.json אינו-אובייקט-JSON" };
  const str = (v) => (typeof v === "string" ? v : null);
  const int = (v) => (Number.isInteger(v) ? v : null);
  return {
    schema: str(t.schema),
    at: str(t.at),
    mode: str(t.mode),
    head: str(t.head),
    dirty: int(t.dirty),
    files: int(t.files),
    worklogLines: int(t.worklogLines),
    keysLeaked: typeof t.keysLeaked === "boolean" ? t.keysLeaked : null,
    chain: str(t.chain)?.slice(0, 16) ?? null, // 16-hex-ראשונים בלבד (הגבלת-הד)
    prevChain: str(t.prevChain)?.slice(0, 16) ?? null,
    bytesSha256: sha256bytes(buf), // חתימת-הבייטים — מחוץ-למניין-העשרה
  };
}

/**
 * ביקורת-עצמית-של-צעד-השרשרת-הנוכחי-בקובץ: prevMerkle=null → merkle חייב-genesis;
 * אחרת chainRoot מחושב-מחדש מהליבה-הנוכחית חייב-להשתוות-ל-merkle הרשום.
 */
export function verifyChainIntegrity(state) {
  try {
    if (state.prevMerkle === null) {
      const ok = state.merkle === state.genesis;
      return {
        ok,
        detail: ok ? "genesis-תקין: merkle===genesis" : `genesis-שבור: merkle=${state.merkle.slice(0, 8)} ≠ genesis`,
      };
    }
    const { chainRoot } = merkleAdvance(state.prevMerkle, coreOf(state));
    const ok = chainRoot === state.merkle;
    return {
      ok,
      detail: ok
        ? "שרשרת-מאומתת: sha256(prevMerkle:leaf(core))===merkle"
        : `שרשרת-שבורה: מחושב=${chainRoot.slice(0, 8)} רשום=${state.merkle.slice(0, 8)}`,
    };
  } catch (e) {
    return { ok: false, detail: `שגיאת-אימות: ${truncate(String((e && e.message) || e), 200)}` };
  }
}

/* ── סוללת-הבדיקות ──────────────────────────────────────────────────────────── */

/** רשימת-קבצים-תחת-תיקייה (רקורסיבי, נתיבים-יחסיים-ל-ROOT) — ל-leak-scan-שאינו-תומך-תיקיות */
function listFilesUnder(dir, relBase) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${relBase}/${e.name}`;
    if (e.isDirectory()) out.push(...listFilesUnder(path.join(dir, e.name), rel));
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

/**
 * סוללת-הבדיקות-הנמדדות — scope "tick"=(a)…(f) · "full"=(a)…(i) (ל-selftest-של-מפעיל).
 * כל-בדיקה זורקת-כדי-ליפול — אפס-בליעה. מוחזרות-גם-המזהים-הנכשלים לרישום-כן.
 */
export function runChecks(scope, m) {
  const checks = [];
  const run = (id, name, fn) => {
    try {
      fn();
      checks.push({ id, name, ok: true, detail: "" });
    } catch (e) {
      checks.push({ id, name, ok: false, detail: truncate(String((e && e.message) || e), 160) });
    }
  };
  // (a) טעינה+תיקוף של-קובץ-המדינה
  run("a", "load+validate", () => {
    loadState();
  });
  // (b) שלמות-צעד-השרשרת-הנוכחי
  run("b", "chain-integrity", () => {
    const v = verifyChainIntegrity(loadState());
    if (!v.ok) throw new Error(v.detail);
  });
  // (c) leak-scan על-תכולת-state/ — תהליך-בן, exit-0 נדרש.
  //     leak-scan אינו-תומך-תיקיות (readFileSync על-תיקייה=EISDIR) — מרחיבים-לרשימת-קבצים.
  run("c", "leak-scan-state", () => {
    const files = listFilesUnder(STATE_DIR, "state").sort();
    const r = spawnSync(process.execPath, [path.join(ROOT, "engine", "leak-scan.mjs"), ...files], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 60000,
    });
    if (r.error) throw new Error(truncate(String(r.error.message || r.error), 160));
    if (r.status !== 0) {
      const tail = truncate((r.stderr || "").trim().split("\n").slice(-1)[0], 160);
      throw new Error(`leak-scan exit=${r.status}${tail ? ` · ${tail}` : ""}`);
    }
  });
  // (d) פורמט-keeper.log — כל-שורה-שאינה-כותרת-חייבת-התאמה; קובץ-חסר = אפס-שורות-להפר
  run("d", "keeper-log-format", () => {
    let content = null;
    try {
      content = fs.readFileSync(KEEPER_LOG, "utf8");
    } catch {
      content = null;
    }
    if (content === null) return; // עדיין-לא-נוצר — אפס-שורות
    for (const line of content.split("\n")) {
      if (!line || line.startsWith("#")) continue;
      if (!LOG_RE.test(line)) throw new Error(`שורה-לא-בפורמט: ${truncate(line, 60)}`);
    }
  });
  // (e) git ניתן-לפתרון
  run("e", "git-head", () => {
    if (!m.headSha) throw new Error("headSha לא-נמדד — git אינו-ניתן-לפתרון");
  });
  // (f) state/ ניתן-לכתיבה (כתיבת-בדיקה ומחיקתה)
  run("f", "state-writable", () => {
    const probe = path.join(STATE_DIR, `.rw-probe-${process.pid}`);
    let ok = false;
    try {
      atomicWrite(probe, "probe\n");
      ok = fs.readFileSync(probe, "utf8") === "probe\n";
    } finally {
      try { fs.unlinkSync(probe); } catch {}
      try { fs.unlinkSync(`${probe}.tmp-${process.pid}`); } catch {}
    }
    if (!ok) throw new Error("כתיבת-הבדיקה-לא-נקראה-חזרה");
  });
  if (scope === "full") {
    // (g) חוזה-ה-workflow של-מדינת-הרשת
    run("g", "workflow-contract", () => {
      const t = fs.readFileSync(path.join(ROOT, ".github", "workflows", "sovereign-state.yml"), "utf8");
      if (!t.includes("sovereign-state")) throw new Error("חסר-מזהה sovereign-state");
      if (!t.includes("workflow_dispatch")) throw new Error("חסר workflow_dispatch");
    });
    // (h) חוזה-האם state/README.md
    run("h", "state-readme-contract", () => {
      const t = fs.readFileSync(path.join(STATE_DIR, "README.md"), "utf8");
      if (!t.includes("sanbox-state/1")) throw new Error("חסר sanbox-state/1 בחוזה");
    });
    // (i) קבצי-המדינה-קיימים
    run("i", "state-files-exist", () => {
      fs.accessSync(STATE_FILE);
      fs.accessSync(KEEPER_LOG);
    });
  }
  const passed = checks.filter((c) => c.ok).length;
  return { checks, passed, total: checks.length };
}

/* ── יומן-השומר ─────────────────────────────────────────────────────────────── */

/**
 * בניית-שורת-keeper.log לפי-הפורמט-המחייב. head/merkle שאינם-מדידה-תקינה → null
 * (הקורא-מדלג-על-השורה-ורושם-זאת-בפנקס — אפס-שורות-כוזבות-שמזהמות-את-הפורמט).
 */
export function keeperLine({ at, n, outcome, head, merkle, st, op = null }) {
  if (!at || !isInt(n) || n < 0) return null;
  if (outcome !== "ok" && outcome !== "fail") return null;
  if (typeof head !== "string" || !RE_HEX12.test(head)) return null;
  if (typeof merkle !== "string" || !RE_HEX64.test(merkle)) return null;
  if (!st || !isInt(st.passed) || !isInt(st.total)) return null;
  let line = `[${at}] tick#${n} ${outcome} head=${head} merkle=${merkle.slice(0, 8)} st=${st.passed}/${st.total}`;
  if (op) line += ` op=${op}`;
  return `${line}\n`;
}

/** הוספת-שורה-ליומן — באטומית (קריאה-מלאה → tmp+rename), לעולם-לא-append ישיר */
export function appendKeeperLog(line) {
  let prev = "";
  try {
    prev = fs.readFileSync(KEEPER_LOG, "utf8");
  } catch {
    prev = ""; // יומן-חדש
  }
  const sep = prev && !prev.endsWith("\n") ? "\n" : "";
  // סיבוב-גבול (תיקון-ממזג agent-3, נרשם-בחוזה): היומן-חי-ב-512-שורות-אחרונות.
  // שורות-כותרת (#) נשמרות-תמיד; ההיסטוריה-המלאה חיה-בהיסטוריית-הגיט (תקדים ticks.jsonl TAIL-512 של agent-1).
  const allLines = (prev + sep + line).split("\n");
  const headers = allLines.filter((l) => l.startsWith("#"));
  const ticks = allLines.filter((l) => l && !l.startsWith("#"));
  const trimmed = ticks.length > 512 ? ticks.slice(ticks.length - 512) : ticks;
  const content = [...headers, ...trimmed].join("\n") + "\n";
  atomicWrite(KEEPER_LOG, content);
}

/**
 * כתיבת-מצב-כישלון-כן (משותף-לטיק-ולמפעיל): keeper.status='failed' ·
 * consecutiveFailures+1 · הערה-עם-השגיאה (קטועה-200) · שרשרת-מתקדמת-גם-כך
 * (המצב-הכוזב-אינו-נכתב, המצב-הכן-כן) · שורת-יומן fail.
 * מחזיר {state, logError} — logError≠null = השורה-הושמטה (head-לא-נמדד/כתיבת-יומן-נכשלה).
 */
export function writeHonestFailure({ prevState, at, error, st = null, op = null }) {
  const msg = truncate(String((error && error.message) || error), 200);
  const m = gitMeasurements(); // מדידה-חוזרת-כנה ברגע-הכישלון
  const n = prevState.keeper.tickCount + 1;
  const selftest = st
    ? { passed: st.passed, total: st.total, at, status: "failed" }
    : { ...prevState.selftest }; // הסוללה-לא-רצה — נשמרת-המדידה-הקודמת, לא-מומצאת-חדשה
  const echo = receiptsEcho();
  const custody = {
    source: prevState.custody.source,
    echo,
    echoedAt: at,
    status: echo.status === "absent" ? "absent" : "ok",
  };
  const keeper = {
    tickCount: n,
    lastTick: at,
    lastHead: m.headSha ?? prevState.keeper.lastHead,
    status: "failed",
    consecutiveFailures: prevState.keeper.consecutiveFailures + 1,
  };
  const chain = {
    headSha: m.headSha,
    dirtyFiles: m.dirtyFiles,
    trackedFiles: m.trackedFiles,
    worklogLines: m.worklogLines,
  };
  const core = coreOf({ keeper, operator: prevState.operator, killSwitch: prevState.killSwitch, custody, selftest, chain });
  const { chainRoot } = merkleAdvance(prevState.merkle, core);
  let noteEntry = `tick#${n} fail st=${selftest.passed}/${selftest.total}`;
  if (op) noteEntry += ` op=${op}`;
  noteEntry += ` err=${msg}`;
  const nextState = {
    schema: SCHEMA,
    updatedAt: at,
    genesis: prevState.genesis,
    prevMerkle: prevState.merkle,
    merkle: chainRoot,
    keeper,
    operator: prevState.operator,
    killSwitch: prevState.killSwitch,
    custody,
    selftest,
    chain,
    notes: boundedNotes(prevState.notes, truncate(noteEntry, 200)),
  };
  validateState(nextState); // שער-עצמי — גם-כישלון-חייב-לעמוד-בחוזה
  atomicWrite(STATE_FILE, `${JSON.stringify(nextState, null, 2)}\n`);
  let logError = null;
  const line = keeperLine({
    at,
    n,
    outcome: "fail",
    head: m.headSha,
    merkle: chainRoot,
    st: { passed: selftest.passed, total: selftest.total },
    op,
  });
  if (line) {
    try {
      appendKeeperLog(line);
    } catch (e) {
      logError = e; // המצב-נכתב-כן; כשל-יומן-מדווח-למעלה — לא-נכפה-שקר
    }
  } else {
    logError = new Error("head לא-נמדד — שורת-היומן-הושמטה (אפס-זיוף-פורמט)");
  }
  return { state: nextState, logError };
}
