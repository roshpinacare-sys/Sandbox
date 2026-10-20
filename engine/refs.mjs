/**
 * refs.mjs — שכבת-הפסבדונים של האוטונומיה (wave-2 · FLEET_ROSTER_MAP).
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY (חוק-השטח-הפומבי): העץ-הפומבי לעולם לא נושא את מפת-חשבונות-הצי (מי
 * מחזיק/מפעיל איזה חשבון-שרשרת). ספרים, קבלות, רוסטרים וקוד מדברים ב-refs
 * יציבים ("acct-00"…) בלבד. המיפוי האמיתי חי רק ב:
 *   1. סוד-הריפו FLEET_ROSTER_MAP (JSON: {refs:{ref:name,…}} או flat {ref:name}) — Actions בלבד;
 *   2. קובץ-פיתוח לא-עקוב engine/.roster-map.local.json (אותה-צורה) — מקומי בלבד.
 * אף-ערך-מפה לא נכתב לעולם לקוד, לפנקס, ללוג-מחויב או להדפסה.
 *
 * חוזה (fail-honest, לעולם fail-fake):
 *   R(ref)              → שם-השרשרת האמיתי, או null כשלא-נפתר (הקורא מדלג בכנות)
 *   refOf(name)         → ref, או הקלט ללא-שינוי כשלא-מוכר (רק שמות-אחוזה הם סוד)
 *   scrub(text)         → החלפת שמות-אחוזה מוכרים ב-refs (רגישות-הקשר — עמיד-לשגיאות)
 *   scrubAll(text)      → החלפה אגרסיבית לפי גבולות-מילה (חגורה-ורתמות בזמן-כתיבה)
 *   fleetNames(refs)    → מערך-שמות; זורק בכנות כש-ref לא נפתר
 *   resolved()          → true כשהמפה זמינה בתהליך-זה
 *
 * אפס-תלות (stdlib בלבד) · אפס-שמות-אחוזה בקובץ-זה (המפה היא נתון, לא קוד).
 * אותו-חוזה כמו Domain/agents/refs.mjs (19-d) — מקור-האמת של הצורה.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

let REF_TO_NAME = new Map();
let NAME_TO_REF = new Map();
let loaded = false;

function loadPair(obj) {
  if (!obj || typeof obj !== "object") return false;
  // צורות-מקובלות: {refs:{ref:name}} / {names:{name:ref}} / flat {ref:name | name:ref}
  const flat = {};
  if (obj.refs && typeof obj.refs === "object") Object.assign(flat, obj.refs);
  if (obj.names && typeof obj.names === "object") Object.assign(flat, obj.names);
  for (const [k, v] of Object.entries(obj)) if (typeof v === "string") flat[k] = v;
  let used = false;
  for (const [k, v] of Object.entries(flat)) {
    if (typeof k !== "string" || typeof v !== "string") continue;
    if (k.startsWith("acct-")) { REF_TO_NAME.set(k, v); NAME_TO_REF.set(v, k); used = true; }
    else { NAME_TO_REF.set(k, v); REF_TO_NAME.set(v, k); used = true; }
  }
  return used;
}

function load() {
  // resolved-once caching; an UNRESOLVED process keeps retrying (cheap) so a map
  // seeded later into process.env (selftest fixture roster) is picked up honestly.
  if (loaded && REF_TO_NAME.size) return;
  loaded = true;
  try {
    const env = process.env.FLEET_ROSTER_MAP;
    if (env && env.trim().startsWith("{")) { loadPair(JSON.parse(env)); if (REF_TO_NAME.size) return; }
  } catch { /* fall through to local file */ }
  try {
    const local = join(HERE, ".roster-map.local.json");
    if (existsSync(local)) loadPair(JSON.parse(readFileSync(local, "utf8")));
  } catch { /* remain unresolved — fail-honest */ }
}

export function resolved() { load(); return REF_TO_NAME.size > 0; }

/** ref → שם-שרשרת אמיתי (null כשלא-נפתר). */
export function R(ref) {
  load();
  return REF_TO_NAME.get(String(ref)) ?? null;
}

/** שם-שרשרת → ref (שמות-לא-מוכרים עוברים ללא-שינוי — רק שמות-אחוזה הם סוד). */
export function refOf(name) {
  load();
  const n = String(name || "");
  return NAME_TO_REF.get(n) ?? n;
}

/** רשימת-refs → רשימת-שמות-חיה. זורק בכנות כש-ref לא נפתר (הקורא מדווח UNAVAILABLE). */
export function fleetNames(refs) {
  load();
  const out = [];
  for (const ref of refs || []) {
    const n = REF_TO_NAME.get(String(ref));
    if (!n) throw new Error(`roster-unresolved: ${ref} — FLEET_ROSTER_MAP missing or incomplete`);
    out.push(n);
  }
  return out;
}

/**
 * scrub — החלפה רגישות-הקשר (החוזה-המקורי מ-Domain): @שם, מחרוזות-מצוטטות,
 * מפתחות-JSON, תאי-טבלה. פרוזה-חופשית לא נוגעת — עמיד-לשגיאות-חיוביות.
 */
export function scrub(text) {
  load();
  if (!NAME_TO_REF.size || typeof text !== "string") return text;
  const names = [...NAME_TO_REF.keys()].sort((a, b) => b.length - a.length);
  let out = text;
  for (const n of names) {
    const r = NAME_TO_REF.get(n);
    const e = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp("([@\"'|])" + e + "([\"'|:,\\s\\])}])", "g"), "$1" + r + "$2");
  }
  return out;
}

/**
 * scrubAll — חגורה-ורתמות לזמן-כתיבה (wave-2): כל-שם-אחוזה מוכר מוחלף ב-ref
 * שלו בכל-הקשר (גבולות-מילה; הארוך-קודם). זה-החוק שמגן על ארטיפקטים שמועדים
 * לעץ-הפומבי — פרוזה, טבלאות, JSON חופשי. כבד-מעט, נכון-הרבה.
 */
export function scrubAll(text) {
  load();
  if (!NAME_TO_REF.size || typeof text !== "string") return text;
  const names = [...NAME_TO_REF.keys()].sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp("\\b(" + names.join("|") + ")\\b", "g");
  return text.replace(re, (m) => NAME_TO_REF.get(m) ?? m);
}

export default { R, refOf, scrub, scrubAll, fleetNames, resolved };
