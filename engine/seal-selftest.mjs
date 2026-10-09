#!/usr/bin/env node
/**
 * seal-selftest.mjs — מבחן-זהות-הדפדפן (T-41 · Sandbox)
 * ═════════════════════════════════════════════════════════════════════════════
 * מוכיח-זהות-מלאה-בין-חתימת-Node (seal.mjs) לפענוח-הדפדפן (index.html):
 * קורא-את-הארטיפקטים-החתומים-בפועל ומפענח-דרך **WebCrypto (crypto.subtle)**
 * — אותו-קוד-נתיב-בדיוק-כמו-הדפדפן. מריץ-שני-מבחנים:
 *   1) סיסמה-נכונה → פענוח-מלא + JSON-תקין + שדות-צפויים
 *   2) סיסמה-שגויה → GCM-זורק (הגנת-האימות-עובדת)
 * הסיסמה-בזיכרון-בלבד · אפס-הדפסה · אפס-כתיבה.
 *
 * שימוש:  node engine/seal-selftest.mjs --passfile <path>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FLAG = process.argv.indexOf("--passfile");
if (FLAG < 0) {
  console.error("[selftest] דרוש --passfile <path>");
  process.exit(2);
}
const passPath = process.argv[FLAG + 1];
if (!fs.existsSync(passPath)) {
  console.error("[selftest] קובץ-סיסמה-לא-נמצא (שם-בסיס-בלבד-מוצג)");
  process.exit(2);
}

const params = JSON.parse(fs.readFileSync(path.join(ROOT, "console", "params.json"), "utf8"));
const blob = new Uint8Array(fs.readFileSync(path.join(ROOT, "console", "sealed-payload.bin")));
const ciphertext = blob.subarray(0, blob.length - 16);
const tag = blob.subarray(blob.length - 16);
const enc = new TextEncoder();
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(pass) {
  const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: b64(params.saltB64), iterations: params.iterations },
    base,
    256,
  );
  return crypto.subtle.importKey("raw", bits, { name: "AES-GCM" }, false, ["decrypt"]);
}

async function attempt(pass) {
  const key = await derive(pass);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64(params.ivB64), tagLength: params.tagLenBits },
    key,
    blob, // הדפדפן-מקבל-צופן+תג-מחוברים — בדיוק-כמו-בקובץ
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

async function main() {
  const raw = fs.readFileSync(passPath, "utf8").replace(/[\r\n]+/g, ""); // קנוניזציה-זהה-לסיל/לקונסולה
  let ok = false;
  try {
    const payload = await attempt(raw);
    const shape = payload && Array.isArray(payload.sections) && payload.title ? "תקין" : "מבנה-חריג";
    console.log(`[selftest] ✔ מבחן-1 (סיסמה-נכונה · WebCrypto-נתיב-דפדפן): פענוח-${shape} · sections=${payload.sections.length}`);
    ok = shape === "תקין";
  } catch (e) {
    console.error("[selftest] ✖ מבחן-1 נכשל: הסיסמה-הנכונה-לא-פענחה — אסור-לדחוף");
    process.exit(1);
  }
  try {
    await attempt(raw.slice(0, -1) + (raw.endsWith("x") ? "y" : "x")); // סטייה-בתו-אחד
    console.error("[selftest] ✖ מבחן-2 נכשל: סיסמה-שגויה-פענחה?! GCM-שבור");
    process.exit(1);
  } catch {
    console.log("[selftest] ✔ מבחן-2 (סיסמה-שגויה): GCM-זרק-כנדרש — שער-אטום");
  }
  console.log(ok ? "[selftest] PASS — זהות-דפדפן-מוכחת" : "[selftest] FAIL");
  process.exit(ok ? 0 : 1);
}

main();
