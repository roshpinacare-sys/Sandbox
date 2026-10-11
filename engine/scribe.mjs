// ═══════════════════════════════════════════════════════════════════════════
// ARTERY-SCRIBE · רישומת-הלמידה — בחינת-היסטוריה לשיפור-עתידי, מהגיט.
// ───────────────────────────────────────────────────────────────────────────
// הבעיה-שנמדדה (2026-10-11): המערכת מייצרת היסטוריה עשירה (קבלות, טיקים, קומיטים)
// אבל אף-אחד לא מפיק ממנה לקחים באופן-שוטף — הלקחים נתגלו רק בסקירות-ידניות.
// התיקון: סוכן-רישומה קבוע: קורא את קבלות-24h השעון, מפיק מספרים ודפוסים,
// ומציע חוקים. deterministic לחלוטין — אפס-LLM, אפס-סודות, מדידה-בלבד.
// ═══════════════════════════════════════════════════════════════════════════
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, appendFileSync, mkdirSync } from "node:fs";

const API = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}`;
const H = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" };
const since = Date.now() - 24 * 3600 * 1000;
const out = (...a) => console.log(...a);
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", ...opts });
const jf = async (url) => (await fetch(url, { headers: H })).json();

const observations = [];
const proposals = [];

// 1) קבלות-הארנק — פס-24h
const walletLine = (() => {
  if (!existsSync("receipts/wallet/log.jsonl")) return "wallet: no receipts yet (artery young)";
  const lines = readFileSync("receipts/wallet/log.jsonl", "utf8").trim().split("\n").slice(-50);
  const day = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).filter((r) => Date.parse(r.at) >= since);
  if (day.length === 0) return "wallet: 0 verdicts in 24h — artery suspect";
  const by = {}; const laws = {};
  let flags = 0;
  for (const r of day) { by[r.overall] = (by[r.overall] || 0) + 1; flags += (r.alerts || []).length; for (const a of r.asserts || []) if (a.verdict === "fail") laws[a.id] = (laws[a.id] || 0) + 1; }
  if (flags) proposals.push(`wallet carried ${flags} trust-flag(s)/24h (out-of-band PASS mints) — owner P0: make wallet CI the only minter`);
  if (day.slice(-3).every((r) => r.overall !== "PASS")) proposals.push("wallet FAIL/BLOCKED streak ≥3 — escalate to owner issue; do not mint green");
  for (const [id, n] of Object.entries(laws)) proposals.push(`wallet law ${id} failed ${n}×/24h — regression or theater attempt; verify immediately`);
  return `wallet 24h verdicts: ${JSON.stringify(by)} · failing laws: ${JSON.stringify(laws)}`;
})();
observations.push(walletLine);

// 1b) קבלות-הצי (fleet) — פס-24h
try {
  if (existsSync("receipts/fleet/log.jsonl")) {
    const flines = readFileSync("receipts/fleet/log.jsonl", "utf8").trim().split("\n").slice(-30);
    const fday = flines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).filter((r) => Date.parse(r.at) >= since);
    if (fday.length) {
      const by = {};
      let fa = 0;
      for (const r of fday) { by[r.overall] = (by[r.overall] || 0) + 1; fa += (r.alerts || []).length; }
      observations.push(`fleet 24h verdicts: ${JSON.stringify(by)} · alerts: ${fa}`);
      if (fday.slice(-2).every((r) => r.overall !== "PASS")) proposals.push("fleet verify FAIL/BLOCKED streak ≥2 — a critical repo is regressing; measure before touching anything");
    }
  }
} catch { observations.push("fleet log unreadable"); }

// 2) ריצות-Actions של הצי — פס-24h
try {
  const runs = await jf(`${API}/actions/runs?per_page=100`);
  const day = (runs.workflow_runs || []).filter((r) => Date.parse(r.created_at) >= since);
  const by = {};
  for (const r of day) { const k = `${r.name}:${r.conclusion}`; by[k] = (by[k] || 0) + 1; }
  const fails = Object.entries(by).filter(([k]) => k.endsWith("failure")).map(([k, n]) => `${k}×${n}`);
  observations.push(`fleet actions 24h: ${day.length} runs · failures: ${fails.length ? fails.join(", ") : "none"}`);
  if (day.length === 0) proposals.push("0 Actions runs in 24h — the whole chain is stalled; check billing wall / dispatch chain");
} catch (e) { observations.push(`actions API: ${String(e.message).slice(0, 120)}`); }

// 3) דופק-הטיק — מתוך receipts/latest.json
try {
  if (existsSync("receipts/latest.json")) {
    const latest = JSON.parse(readFileSync("receipts/latest.json", "utf8"));
    const ageMin = Math.round((Date.now() - Date.parse(latest.at || latest.generatedAt || latest.time)) / 60000);
    observations.push(`sovereign tick last pulse: ${ageMin}min ago`);
    if (ageMin > 90) proposals.push(`sovereign tick stale (${ageMin}min) — chain may be dead; artery-watch should ignite`);
  }
} catch { observations.push("receipts/latest.json unreadable"); }

// 4) היסטוריית-הגיט של הצי — פס-24h (דרך-API — לא-תלויה בעומק-checkout; לקח truth-gate)
try {
  const sinceISO = new Date(since).toISOString();
  const commits = await jf(`${API}/commits?since=${sinceISO}&per_page=100`);
  const rows = Array.isArray(commits) ? commits : [];
  const authors = {};
  for (const r of rows) { const a = (r.commit && r.commit.author && r.commit.author.name) || "unknown"; authors[a] = (authors[a] || 0) + 1; }
  observations.push(`sandbox commits 24h: ${rows.length}${rows.length >= 100 ? "+ (page cap)" : ""} · authors: ${JSON.stringify(authors)}`);
  if (rows.length === 0) proposals.push("0 commits in 24h — silence is a symptom, not peace");
} catch { observations.push("commits API unavailable"); }

// 5) קבלות-האיכות של הארנק — סטייה מהחוק
try {
  if (existsSync("receipts/latest.json")) {
    const latest = JSON.parse(readFileSync("receipts/latest.json", "utf8"));
    if (latest && latest.tick && typeof latest.tick.head === "string") observations.push(`tick head: ${latest.tick.head.slice(0, 12)}`);
  }
} catch { /* non-fatal */ }

const at = new Date().toISOString();
const n = (() => { try { return readFileSync("ops/lessons/ledger.md", "utf8").split("## ").length - 1 + 1; } catch { return 1; } })();

const body = [];
body.push(`\n## scribe #${n} · ${at}`);
body.push(...observations.map((o) => `- ${o}`));
body.push(...(proposals.length ? proposals.map((p) => `- PROPOSAL(law): ${p}`) : ["- no law proposals — everything measured healthy"]));
body.push("");

mkdirSync("ops/lessons", { recursive: true });
if (!existsSync("ops/lessons/ledger.md"))
  appendFileSync("ops/lessons/ledger.md", "# LESSONS LEDGER · append-only · deterministic distillation of measured history\n");
appendFileSync("ops/lessons/ledger.md", body.join("\n") + "\n");

out(body.join("\n"));
out("scribe entry appended");
