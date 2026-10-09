#!/usr/bin/env node
/**
 * network-probe.mjs — סוקר-הרשת של Sandbox (T-42-b · agent-3b)
 * ═════════════════════════════════════════════════════════════════════════════
 * אספן-הרשת שה-CI-tick מפעיל: מראה-נתונים **ציבוריים-מטבעם** מהריפו FleetHQ
 * (ריפו-פומבי · אפס-אימות · GET-פשוט · אפס-טוקנים) אל receipts/ של-הריפו-הזה,
 * כדי-שלוח-המפעיל תראה-את-הרשת-כולה-כחלק-אחד. רץ-גם-עצמאית: node engine/network-probe.mjs
 *   · guard       ← FleetHQ receipts/lineage-guard.json       → {at,head,origin,behind,ahead,last_event,last_push{at,from,to}}
 *   · status      ← FleetHQ sovereign-stack/health/status.json → {ts,all_ok,results[≤12]{name,verdict,latency_ms}}
 *   · witness_row ← FleetHQ sovereign-stack/health/history.jsonl → השורה-האחרונה-בלבד; שדות-עד: ts|at · nonce · balance_eth|balance · address (כתובת-שרשרת-ציבורית-שפורסמה-שם-ממילא — נשמרת-במלואה)
 *   · self        ← receipts/latest.json מקומי (טביעת-ה-tick שלנו) → tick_at
 * כללי-ברזל: stdlib-בלבד (Node-20+, fetch-גלובלי) · timeout-10s-לכל-מקור (AbortController)
 *   · fail-soft-פר-מקור: מקור-מת-לא-הורג-את-האחרים · אפס-סודות · אפס-נתיבי-מכונה
 *   · אפס-המצאה — כל-שדה נמדד או null/absent.
 * יציאה: 0-תמיד — חוץ-מכשלת-כתיבה-של-קבצי-הפלט-עצמם (אז-1+הודעה-עברית).
 * כותב: receipts/network.json (atomic tmp+rename) + receipts/network-log.jsonl (tail-128, append-only).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const R_DIR = path.join(ROOT, "receipts");
const NETWORK = path.join(R_DIR, "network.json");
const NETWORK_LOG = path.join(R_DIR, "network-log.jsonl");
const LATEST = path.join(R_DIR, "latest.json");
const TAIL = 128;          // זיכרון-זנב-של-יומן-הרשת (אותה-טכניקה כמו tail-512 ב-ticks)
const TIMEOUT_MS = 10_000; // חסם-זמן-לכל-מקור
const RESULTS_CAP = 12;    // תקרת-תוצאות-הסטטוס-בקבלה

// מקורות-ציבוריים-בלבד · ריפו-פומבי · אפס-אימות · אפס-סודות
const FLEETHQ = "https://raw.githubusercontent.com/roshpinacare-sys/FleetHQ/main";
const SRC = {
  guard: `${FLEETHQ}/receipts/lineage-guard.json`,
  status: `${FLEETHQ}/sovereign-stack/health/status.json`,
  history: `${FLEETHQ}/sovereign-stack/health/history.jsonl`,
};

/* ── עזרים — כל-שדה נמדד או null ──────────────────────────────────────────── */
const orNull = (v) => (v === undefined || v === null ? null : v);

// GET-פשוט-ללא-אימות · timeout-10s · מחזיר-text או null (רשת/HTTP/timeout → null)
async function fetchText(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { "user-agent": "sandbox-network-probe/1" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null; // מקור-מת — fail-soft, האחרים-ממשיכים
  } finally {
    clearTimeout(timer);
  }
}

function pickGuard(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const lp =
    raw.last_push && typeof raw.last_push === "object" && !Array.isArray(raw.last_push)
      ? raw.last_push
      : null;
  return {
    at: orNull(raw.at),
    head: orNull(raw.head),
    origin: orNull(raw.origin),
    behind: orNull(raw.behind),
    ahead: orNull(raw.ahead),
    last_event: orNull(raw.last_event),
    last_push: lp ? { at: orNull(lp.at), from: orNull(lp.from), to: orNull(lp.to) } : null,
  };
}

function pickStatus(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  let results = null;
  let total = 0;
  if (Array.isArray(raw.results)) {
    total = raw.results.length;
    results = raw.results.slice(0, RESULTS_CAP).map((r) => ({
      name: orNull(r?.name),
      verdict: orNull(r?.verdict),
      latency_ms: orNull(r?.latency_ms),
    }));
  }
  return { picked: { ts: orNull(raw.ts), all_ok: orNull(raw.all_ok), results }, total };
}

// השורה-האחרונה-של-history.jsonl — שדות-העד-בלבד · חסר-בשורה → null-פר-שדה
function pickWitness(text) {
  const lines = String(text ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const last = lines[lines.length - 1];
  if (!last) return null;
  let row;
  try {
    row = JSON.parse(last);
  } catch {
    return null;
  }
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  return {
    ts: orNull(row.ts) ?? orNull(row.at),
    nonce: orNull(row.nonce),
    balance_eth: orNull(row.balance_eth) ?? orNull(row.balance),
    address: orNull(row.address), // כתובת-ציבורית-מפורסמת-ממילא ב-FleetHQ — נשמרת-במלואה
  };
}

function selfTickAt() {
  try {
    return orNull(JSON.parse(fs.readFileSync(LATEST, "utf8"))?.at);
  } catch {
    return null;
  }
}

/* ── מרכז-המדידה ──────────────────────────────────────────────────────────── */
async function main() {
  const at = new Date().toISOString();
  const fetchAt = new Date().toISOString(); // חותמת-סבב-המשיכה (null-אם-אף-מקור-לא-ענה)
  const notes = [];
  let guard = null;
  let status = null;
  let witnessRow = null;
  let statusTotal = null;

  // 1) guard — fail-soft
  try {
    const text = await fetchText(SRC.guard);
    if (text === null) notes.push("guard: absent (fetch failed)");
    else {
      let raw;
      try {
        raw = JSON.parse(text);
      } catch {}
      if (raw === undefined) notes.push("guard: absent (unparseable json)");
      else {
        const g = pickGuard(raw);
        if (!g) notes.push("guard: absent (unexpected shape)");
        else guard = g;
      }
    }
  } catch {
    notes.push("guard: absent (unexpected error)");
  }

  // 2) status — fail-soft · תוצאות-חתוכות-ל-12
  try {
    const text = await fetchText(SRC.status);
    if (text === null) notes.push("status: absent (fetch failed)");
    else {
      let raw;
      try {
        raw = JSON.parse(text);
      } catch {}
      if (raw === undefined) notes.push("status: absent (unparseable json)");
      else {
        const s = pickStatus(raw);
        if (!s) notes.push("status: absent (unexpected shape)");
        else {
          status = s.picked;
          statusTotal = s.total;
          if (s.total > RESULTS_CAP) notes.push(`status.results: capped to ${RESULTS_CAP} of ${s.total}`);
        }
      }
    }
  } catch {
    notes.push("status: absent (unexpected error)");
  }

  // 3) witness_row — fail-soft · השורה-האחרונה-בלבד
  try {
    const text = await fetchText(SRC.history);
    if (text === null) notes.push("witness_row: absent (fetch failed)");
    else {
      const w = pickWitness(text);
      if (!w) notes.push("witness_row: absent (empty/unparseable last line)");
      else {
        witnessRow = w;
        if (w.nonce === null && w.balance_eth === null && w.address === null)
          notes.push("witness_row: last row carries no witness fields (nonce/balance_eth/address absent)");
      }
    }
  } catch {
    notes.push("witness_row: absent (unexpected error)");
  }

  // 4) self — קריאה-מקומית-שקטה
  const selfTick = selfTickAt();

  const receipt = {
    schema: "sandbox.network/1",
    at,
    sources: {
      fleethq: {
        guard,
        status,
        witness_row: witnessRow,
        fetched: guard || status || witnessRow ? fetchAt : null,
      },
      self: { tick_at: selfTick },
    },
    notes,
  };

  const logLine = {
    schema: "sandbox.network.log/1",
    at,
    guard: guard ? "fetched" : "absent",
    status: status ? "fetched" : "absent",
    status_results: status?.results ? status.results.length : null,
    witness_row: witnessRow ? "fetched" : "absent",
    self_tick_at: selfTick,
    notes,
  };

  // כתיבה — atomic tmp+rename · כשל-כתיבה=היציאה-היחידה-שאינה-0
  try {
    fs.mkdirSync(R_DIR, { recursive: true });
    const tmp = `${NETWORK}.tmp`;
    try {
      fs.writeFileSync(tmp, JSON.stringify(receipt, null, 1) + "\n");
      fs.renameSync(tmp, NETWORK);
    } catch (e) {
      try { fs.rmSync(tmp, { force: true }); } catch {}
      throw e;
    }
    fs.appendFileSync(NETWORK_LOG, JSON.stringify(logLine) + "\n");
    try {
      const lines = fs.readFileSync(NETWORK_LOG, "utf8").trim().split("\n");
      if (lines.length > TAIL) fs.writeFileSync(NETWORK_LOG, lines.slice(-TAIL).join("\n") + "\n");
    } catch {}
  } catch (e) {
    console.error(
      `[network] ✖ כתיבת-קבצי-הפלט-נכשלה (${e?.code ?? e?.name ?? "unknown"}) — ` +
        `בדוק-הרשאות/דיסק עבור receipts/ · מסיים-1`,
    );
    process.exit(1);
  }

  // סיכום-עברי-חד-שורתי: מה-נאסף · מה-חסר
  const got = [];
  const missing = [];
  (guard ? got : missing).push("guard");
  (status ? got : missing).push("status");
  (witnessRow ? got : missing).push("witness_row");
  (selfTick ? got : missing).push("self");
  console.log(
    `[network] ✔ ${at} · נאספו: ${got.join(",") || "אין"} · חסרים: ${missing.join(",") || "אין"}` +
      ` · תוצאות-סטטוס: ${status?.results ? `${status.results.length}/${statusTotal ?? "?"}` : "absent"}` +
      ` · notes=${notes.length} → receipts/network.json`,
  );
}

main().catch(() => {
  // fail-soft: כשל-בלתי-צפוי-מחוץ-לנתיבי-הכתיבה — מסיים-0; סבב-ה-CI-הבא-ינסה-שוב
  console.error("[network] ✖ שגיאה-בלתי-צפויה-בסבב-הזה — מסיים-0 (fail-soft)");
  process.exit(0);
});
