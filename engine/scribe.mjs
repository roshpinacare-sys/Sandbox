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

// 6) CROSS-REPO: FleetHQ office receipts (raw, public, zero secrets) - the learning loop spans the whole organism
try {
  const r = await fetch("https://raw.githubusercontent.com/roshpinacare-sys/FleetHQ/main/receipts/office-ci/verdict.json");
  if (r.ok) {
    const v = await r.json();
    const ageMin = Math.round((Date.now() - Date.parse(v.at || v.generatedAt)) / 60000);
    observations.push(`office-ci (FleetHQ) verdict: ${v.overall || "?"} · ${ageMin}min ago`);
    if (v.overall && v.overall !== "PASS") proposals.push(`office-ci (FleetHQ) is ${v.overall} — the office build artery is red; measure before touching the office`);
  } else observations.push("office-ci (FleetHQ) verdict unreadable (raw 404)");
} catch (e) { observations.push(`office-ci cross-repo: ${String(e.message).slice(0, 100)}`); }

// 7) CROSS-REPO: Domain office books freshness (the page the world sees)
try {
  const books = [
    ["office/data.json", 60],
    ["agents/office-live.json", 180],
    ["dex/office-feed.json", 1560],
  ];
  for (const [p, maxMin] of books) {
    const r = await fetch(`https://raw.githubusercontent.com/roshpinacare-sys/Domain/main/${p}`);
    if (!r.ok) { observations.push(`Domain book ${p}: MISSING (raw ${r.status})`); proposals.push(`Domain book ${p} is 404 - a page feed is dead; fix the producer, do not silence the panel`); continue; }
    const j = await r.json();
    const ts = j.generatedAt || j.capturedAt || j.publishedAt;
    if (!ts) { observations.push(`Domain book ${p}: no timestamp field`); continue; }
    const ageMin = Math.round((Date.now() - Date.parse(ts)) / 60000);
    observations.push(`Domain book ${p}: ${ageMin}min old (law <=${maxMin}min)`);
    if (ageMin > maxMin) proposals.push(`Domain book ${p} stale (${ageMin}min > ${maxMin}min) - its producer workflow may be stalled`);
  }
} catch (e) { observations.push(`Domain books cross-repo: ${String(e.message).slice(0, 100)}`); }

// 8) FLOW MAP: the everything-uses-everything census (F-series)
try {
  if (existsSync("ops/flow/flow-map.json")) {
    const fm = JSON.parse(readFileSync("ops/flow/flow-map.json", "utf8"));
    const s = fm.summary || {};
    observations.push(`flow map: nodes=${s.nodes} edges=${s.edges} page-integrated=${s.integrated} plane-internal=${s.planeInternal} orphans=${s.orphans} ghosts=${s.ghosts} density=${s.flowDensity}`);
    if (s.orphans > 0) proposals.push(`${s.orphans} orphan producers (nobody consumes) - refinement targets: wire a consumer or honestly retire with documentation (fix-don-lock)`);
    if (s.ghosts > 0) proposals.push(`${s.ghosts} ghost consumers (page reads a dead producer) - the marketing page shows a fallback where live data should be`);
    if (s.stale > 0) proposals.push(`${s.stale} feed(s) past their freshness law while being read by live code`);
  } else observations.push("flow map: not yet generated (artery-flow first run pending)");
} catch (e) { observations.push(`flow map read: ${String(e.message).slice(0, 100)}`); }

// 9) INTEGRITY GUARD: the anti-forgery verdict (owner law: "verify there are no forgeries")
try {
  if (existsSync("ops/integrity/verdict.json")) {
    const ig = JSON.parse(readFileSync("ops/integrity/verdict.json", "utf8"));
    const s = ig.summary || {};
    observations.push(`integrity guard: overall=${ig.overall} sources=${s.sources} claims-verified=${s.verified} findings=${s.findings} (receipts provenance cross-checked vs Actions API)`);
    if (ig.overall === "FAIL") proposals.push(`integrity guard FAIL (${JSON.stringify(s.counts)}) - suspected forged receipts; freeze trust in flagged receipts and investigate before further lane work`);
    if (s.counts && s.counts.MEDIUM) proposals.push(`integrity guard ${s.counts.MEDIUM} MEDIUM alerts (unverifiable/unprovenanced receipts) - upgrade those producers to full provenance (fix-dont-lock)`);
  } else observations.push("integrity guard: no verdict yet (artery-integrity first run pending)");
} catch (e) { observations.push(`integrity read: ${String(e.message).slice(0, 100)}`); }

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
