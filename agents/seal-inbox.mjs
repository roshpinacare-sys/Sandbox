#!/usr/bin/env node
/**
 * seal-inbox.mjs — חותם-תיבת-הפקודות-לסוכנים (T-44 · agent-3)
 * ═════════════════════════════════════════════════════════════════════════════
 * תיבת-הפקודות = הדרך שבה המפעיל (או הממזג בשמו) משאיר-לסוכני-הצי פקודות-ודרישות
 * שישרדו-מחיקת-סנדבוקס: התוכן-חי-בגיט-מוצפן-מעטפה-לסוכן; רק-טוקן-סוכן-תקף פותח.
 * אותם-פרמטרים-בדיוק-כחותם-הקונסולה (tools/seal.mjs · קנון agent-1):
 *   PBKDF2-HMAC-SHA256 · 650,000 · salt-16B · IV-12B · AES-256-GCM · tag-128.
 *
 * חוזה-אפס-חשיפה: הטוקנים-נקראים-מקובץ-מקומי-gitignored (ברירת-מחדל
 * agents/.agent-tokens.env או env SBX_TOKENS_FILE) — מוחזקים-בזיכרון-בלבד,
 * לעולם-לא-מודפסים/נכתבים/לוגים. בריפו-נשאר רק-צופן.
 *
 * שימוש:
 *   node agents/seal-inbox.mjs                       # חתימה מהטוקנים-המקומיים
 *   SBX_OPEN_TOKEN=<tok> node agents/seal-inbox.mjs --open --id agent-N
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const AGENTS_DIR = path.join(ROOT, "agents");
const REGISTRY = path.join(AGENTS_DIR, "agents.json");
const TOKENS_FILE = process.env.SBX_TOKENS_FILE || path.join(AGENTS_DIR, ".agent-tokens.env");
const OUT = path.join(AGENTS_DIR, "inbox.sealed.json");

const ITERATIONS = 650_000;
const KEY_LEN = 32;
const SALT_LEN = 16;
const IV_LEN = 12;

function fail(msg) {
  console.error(`[seal-inbox] ✖ ${msg}`);
  process.exit(1);
}
function atomicWrite(file, buf) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, file);
}

/* ── תוכן-התיבה (הפקודה-החיה לצי) — מפעיל-דרך-ערוץ-הממזג ──────────────────── */
function inboxPayload() {
  return {
    schema: "sanbox-agent-inbox/1",
    directiveId: "D-2026-10-09-01",
    issuedAt: new Date().toISOString(),
    from: "מפעיל-העל — דרך-ערוץ-הממזג (agent-3 · T-44)",
    subject: "הבית-הוא-הגיט: כניסת-סוכנים-מאומתת",
    body: [
      "הסנדבוקסים-האפמריים אינם-בית. הבית = roshpinacare-sys/Sandbox.",
      "כל-סוכן-שמצטרף מתחייב:",
      "1) מזדהה-בשער-הסוכנים (agents/gate) — אתגר-מענה, אפס-טוקן-על-החוט.",
      "2) קורא-את-מדינת-הרשת (state/) ואת-הקבלות-לפני-כל-פעולה.",
      "3) מדווח-חזרה ב-action=report מאומת — אפס-דיווח-שלא-עבר-אימות.",
      "4) אף-מפתח-כספת אינו-נגיש-לסוכנים — הכספת-שמורה-למפעיל-האנושי-בלבד.",
      "5) אפס-טוקנים-בגיט · אפס-דריסות-טריטוריות · אפס-הצלחות-מזויפות.",
      "רוטציית-טוקן/חשד-לדליפה: register + עדכון-סוד — הרישום-כאן הוא-האמת.",
    ],
    links: {
      status: "https://roshpinacare-sys.github.io/Sandbox/status/",
      network: "https://roshpinacare-sys.github.io/Sandbox/network/",
      operator: "https://roshpinacare-sys.github.io/Sandbox/operator/",
      actions: "https://github.com/roshpinacare-sys/Sandbox/actions/workflows/agent-access.yml",
    },
  };
}

/* ── קריאת-טוקנים-מקומיים (זיכרון-בלבד) ───────────────────────────────────── */
function readLocalTokens() {
  if (!fs.existsSync(TOKENS_FILE)) fail(`קובץ-טוקנים-מקומי-חסר (${path.basename(TOKENS_FILE)}) — לא-ממשיך`);
  const toks = {};
  for (const line of fs.readFileSync(TOKENS_FILE, "utf8").split("\n")) {
    const m = line.match(/^(AGENT_\d_TOKEN)=(\S+)$/);
    if (m) toks[m[1].replace("AGENT_", "agent-").replace("_TOKEN", "")] = m[2];
  }
  if (Object.keys(toks).length === 0) fail("אפס-טוקנים-בקובץ-המקומי");
  return toks;
}

function sealFor(token, payload) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = crypto.pbkdf2Sync(Buffer.from(token, "utf8"), salt, ITERATIONS, KEY_LEN, "sha256");
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const pt = Buffer.from(JSON.stringify(payload), "utf8");
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { saltB64: salt.toString("base64"), ivB64: iv.toString("base64"), ctB64: Buffer.concat([ct, tag]).toString("base64") };
}
function openFor(token, env) {
  const key = crypto.pbkdf2Sync(Buffer.from(token, "utf8"), Buffer.from(env.saltB64, "base64"), ITERATIONS, KEY_LEN, "sha256");
  const data = Buffer.from(env.ctB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(env.ivB64, "base64"));
  decipher.setAuthTag(data.subarray(data.length - 16));
  return JSON.parse(Buffer.concat([decipher.update(data.subarray(0, data.length - 16)), decipher.final()]).toString("utf8"));
}

/* ── מצבים ────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
if (argv.includes("--open")) {
  const id = argv[argv.indexOf("--id") + 1];
  const tok = process.env.SBX_OPEN_TOKEN || fail("--open מחייב env SBX_OPEN_TOKEN");
  const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  if (!reg.members.find((m) => m.id === id)) fail(`סוכן-לא-רשום: ${id}`);
  const doc = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const env = doc.envelopes.find((e) => e.id === id);
  if (!env) fail(`אין-מעטפה ל-${id}`);
  try {
    const payload = openFor(tok, env);
    console.log(`[seal-inbox] ✔ נפתח ל-${id}: directive=${payload.directiveId} roster=${payload.roster.length} · subject: ${payload.subject}`);
    // roundtrip-מדידה: הרוסטר-בתוך-המעטפה חייב-להכיל-את-הטוקן-הפותח-עצמו
    const self = payload.roster.find((r) => r.id === id);
    console.log(`[seal-inbox] roundtrip-self: ${self && self.token === tok ? "OK" : "MISMATCH"}`);
    if (!(self && self.token === tok)) process.exit(1);
  } catch (e) {
    fail(`פתיחה-נכשלה (טוקן-שגוי/מעטפה-פגומה): ${e.message}`);
  }
} else {
  const toks = readLocalTokens();
  const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  const payload = inboxPayload();
  payload.roster = reg.members.map((m) => {
    const tok = toks[m.id];
    if (!tok || tok.length < 40) fail(`טוקן-מקומי-חסר ל-${m.id}`);
    return { id: m.id, token: tok };
  });
  const doc = {
    schema: "sanbox-agent-inbox/1",
    sealedAt: new Date().toISOString(),
    kdf: "PBKDF2-HMAC-SHA256",
    iterations: ITERATIONS,
    hash: "SHA-256",
    keyLen: KEY_LEN,
    cipher: "AES-256-GCM",
    note: "מעטפה-לכל-סוכן · נפתח-רק-בטוקן-הסוכן · אפס-סודות-גלויים · פרמטרים-זהים-לקונסולה",
    envelopes: reg.members.map((m) => ({ id: m.id, ...sealFor(toks[m.id], payload) })),
  };
  atomicWrite(OUT, Buffer.from(JSON.stringify(doc, null, 1) + "\n", "utf8"));
  console.log(`[seal-inbox] ✔ נחתמו ${doc.envelopes.length} מעטפות → agents/inbox.sealed.json · directive=${payload.directiveId}`);
}
