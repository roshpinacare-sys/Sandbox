#!/usr/bin/env node
/**
 * seal.mjs — חותם-הקונסולה (T-41 · Sandbox)
 * ═════════════════════════════════════════════════════════════════════════════
 * חוזה-אפס-חשיפה:
 *   · הסיסמה-הראשית נקראת-מקובץ-מקומי (ברירת-מחדל: ./.passfile gitignored · או SANDBOX_PASSFILE)
 *     ומוחזקת **בזיכרון-בלבד** — לעולם-לא-נכתבת-לדיסק/לוג/גיט/סטאטוס.
 *   · בריפו-נשארים רק: salt+iv+פרמטרים (פומביים-מטבעם) וצופן-AES-256-GCM.
 *   · KDF: PBKDF2-HMAC-SHA256 · 650,000 איטרציות · SHA-256 · מפתח-32B (SECURITY.md).
 *   · ההצפנה-ב-Node-crypto-מבוקר; הפענוח-בדפדפן-ב-WebCrypto — אותם-פרמטרים בדיוק.
 *
 * שימוש:  node tools/seal.mjs [--passfile <path>]
 * פלט:    console/sealed-payload.bin · console/params.json   (ודריסת-התבנית-בזמן-חתימה)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, "console");
const TEMPLATE = path.join(ROOT, "tools", "payload-template.json");
/* קובץ-הסיסמה: נתיב-יחסי/משתנה-סביבה בלבד — אסור-נתיב-מכונה-אישי בקוד (SECURITY.md).
 * ברירת-מחדל: ./.passfile (gitignored). אפשר: SANDBOX_PASSFILE=<path>. */
const PASS_FILE_FLAG = process.argv.indexOf("--passfile");
const PASS_FILE =
  PASS_FILE_FLAG > -1
    ? process.argv[PASS_FILE_FLAG + 1]
    : process.env.SANDBOX_PASSFILE || path.join(ROOT, ".passfile");

const ITERATIONS = 650_000;
const KEY_LEN = 32;
const SALT_LEN = 16;
const IV_LEN = 12;

function fail(msg) {
  console.error(`[seal] ✖ ${msg}`);
  process.exit(1);
}

/* ── סיסמה: קריאה-לזיכרון-בלבד · אפס-הדפסה ─────────────────────────────────── */
function readPassphrase() {
  if (!fs.existsSync(PASS_FILE)) fail(`קובץ-סיסמה לא-נמצא: ${path.basename(PASS_FILE)} (נתיב-מלא לא-נחשף)`);
  const raw = fs.readFileSync(PASS_FILE); // Buffer מדויק-בייטים — בלי-נירמול
  try {
    let text = raw.toString("utf8");
    // BOM-מוביל משנה-בייטים-מול-הדפדפן (קלט-ידני-אינו-מכיל-BOM) — נשלול, לא-ננחש
    if (text.charCodeAt(0) === 0xfeff) fail("קובץ-הסיסמה פותח-ב-BOM — הסר-אותו (הוא-משבש-את-גזירת-המפתח-מול-הדפדפן)");
    // קנוניזציה-סימטרית (זהה-בקונסולה-וב-selftest): כל-השורות-נטחנות-לרצף-אחד.
    // חוזה-הפתיחה: הדבקת-תוכן-הקובץ-המלא — הדפדפן-מחבר-שורות-אוטומטית בדיוק-כך.
    const canon = text.replace(/[\r\n]+/g, "");
    if (canon.length < 16) fail("סיסמה-קצרה-מדי לחתימה-ריבונית (≥16 תווים-קנוניים)");
    const bytes = Buffer.byteLength(canon, "utf8");
    console.log(`[seal] סיסמה-נטענת: ${bytes} בייטים-קנוניים (תוכן-לא-מודפס)`);
    return Buffer.from(canon, "utf8"); // אותם-בייטים שהדפדפן יקבל מ-TextEncoder על-הקלט-המקנונז
  } finally {
    raw.fill(0); // ניקוי-הבאפר-הגולמי (סקירה-L1) — שאריות-מחרוזת-ב-JS-מתועדות-כמקובל
  }
}

function main() {
  const pass = readPassphrase();
  try {
    if (!fs.existsSync(TEMPLATE)) fail("תבנית-התוכן חסרה (tools/payload-template.json)");
    const payload = JSON.parse(fs.readFileSync(TEMPLATE, "utf8"));
    payload.sealedAt = new Date().toISOString(); // רק-זמן-חתימה — אפס-מידע-סביבתי

    const salt = crypto.randomBytes(SALT_LEN);
    const iv = crypto.randomBytes(IV_LEN);
    const key = crypto.pbkdf2Sync(pass, salt, ITERATIONS, KEY_LEN, "sha256");

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
    const sealed = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag(); // 16B — מצורף-בסוף-הצופן

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, "sealed-payload.bin"), Buffer.concat([sealed, tag]));
    fs.writeFileSync(
      path.join(OUT_DIR, "params.json"),
      JSON.stringify(
        {
          v: 1,
          kdf: "PBKDF2-HMAC-SHA256",
          iterations: ITERATIONS,
          hash: "SHA-256",
          keyLen: KEY_LEN,
          saltB64: salt.toString("base64"),
          ivB64: iv.toString("base64"),
          cipher: "AES-256-GCM",
          tagLenBits: 128,
          note: "salt/iv פומביים-מטבעם · הסיסמה-אינה-שמורה-בשום-צורה · פענוח-WebCrypto-זהה",
        },
        null,
        1,
      ),
    );

    const roundtrip = crypto.createDecipheriv("aes-256-gcm", key, iv);
    roundtrip.setAuthTag(tag);
    const check = Buffer.concat([roundtrip.update(Buffer.concat([sealed, tag]).subarray(0, sealed.length)), roundtrip.final()]);
    if (!check.equals(plaintext)) fail("roundtrip-פנימי-נכשל — לא-נדחף כלום");
    console.log(`[seal] ✔ נחתם: ${plaintext.length}B → צופן ${sealed.length + 16}B · PBKDF2×${ITERATIONS} · salt/iv-טריים · roundtrip-OK`);
  } finally {
    pass.fill(0); // ניקוי-זיכרון-הסיסמה
  }
}

main();
