#!/usr/bin/env node
/**
 * render-home.mjs — מרפא-הבית-השני (T-54 · trace 1a124659eb347631)
 * ═════════════════════════════════════════════════════════════════════════════
 * הדוקטרינה: בית-שני-שאף-אחד-לא-בודק = דומם. Render-מחובר-ל-GitHub (autoDeploy:
 * commit) — כל-push-מפריס-אוטומטית. התפקיד-כאן: למדוד-את-החיים, לגלות-התיישנות,
 * ולהעיר-את-הבית-כשהוא-נופל-או-מפגר-אחרי-הראש:
 *
 *   1. גילוי-עצמי: GET /v1/services → חיפוש-sovereign-cockpit (אפס-קידוד-ידני)
 *   2. מדידת-URL-החי (serviceDetails.url) → 200 = בריא
 *   3. בדיקת-התיישנות: קומיט-הפריסה-האחרונה מול-ראש-Sandbox-המקומי
 *   4. התיישן/מת → POST deploys → poll-עד-live → מדידה-חוזרת
 *   5. קבלה: receipts/render-home.jsonl (tail-256, ממוסך)
 *
 * שיעור-אמת-חי-שנטמע: PATCH-ל-publishPath-דורש-צורת-serviceDetails (rootDir
 * בשורש-בלבד) — מתועד-ב-SOVEREIGNTY-§7.4.
 * סוד: אפס. הטוקן-בסביבת-התהליך · פלט-ממוסך.
 * יציאה: 0 = בריא (או-הוחיה-בהצלחה) · 1 = כשל-כנה (fail-closed).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const R_DIR = path.join(ROOT, "receipts");
const HOME_LOG = path.join(R_DIR, "render-home.jsonl");
const TAIL = 256;
const API = "https://api.render.com/v1";
const NAME = process.env.RENDER_SERVICE || "sovereign-cockpit";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TOKEN = process.env.RENDER_TOKEN || "";
if (!TOKEN) {
  console.log("[render-home] no RENDER_TOKEN in environment (honest) — open the vault keys first");
  process.exit(1);
}
const H = () => ({ Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" });
const is2xx = (s) => s >= 200 && s < 300;

/** curl-יחידה — הטוקן-דרך-stdin-בלבד (חוק-העורקים — נמדד-חי-מול-GitLab) */
function curlOnce(method, p, body = null) {
  const cfg = [`header = "Authorization: Bearer ${TOKEN}"`, `request = ${method}`, `url = "${API}${p}"`];
  if (body) cfg.push(`data = ${JSON.stringify(JSON.stringify(body)).slice(1, -1).replace(/"/g, '\\"')}`, 'header = "Content-Type: application/json"');
  const r = spawnSync("curl", ["-sS", "--max-time", "25", "-w", "\n%{http_code}", "-K", "-"], {
    input: cfg.join("\n") + "\n",
    encoding: "utf8",
    timeout: 30000,
  });
  const out = (r.stdout || "").trim();
  const m = out.match(/(\d{3})$/);
  const http = m ? parseInt(m[1], 10) : 0;
  const jsonPart = m ? out.slice(0, m.index).trim() : out;
  let j = null;
  try { j = JSON.parse(jsonPart); } catch {}
  return { status: http, body: j };
}

/** API-ריבוני: fetch → curl-עיקש ×5 */
async function call(method, p, body = null) {
  try {
    const res = await fetch(`${API}${p}`, {
      method,
      headers: H(),
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
    let j = null;
    try { j = await res.json(); } catch {}
    if (is2xx(res.status)) return { status: res.status, body: j };
  } catch {
    // נופלים-לעורק-curl
  }
  let last = { status: 0, body: null };
  for (let k = 0; k < 5; k++) {
    if (k) await sleep(700 + k * 250);
    last = curlOnce(method, p, body);
    if (is2xx(last.status)) return last;
  }
  return last;
}

async function measureUrl(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "follow" });
    return res.status;
  } catch {
    const probe = spawnSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "-L", "--max-time", "20", url], { encoding: "utf8" });
    return parseInt(probe.stdout?.trim() || "0", 10);
  }
}

// ── 1) גילוי-עצמי ───────────────────────────────────────────────────────────
const t0 = Date.now();
const list = await call("GET", "/services?limit=20");
if (!is2xx(list.status) || !Array.isArray(list.body)) {
  console.log(`[render-home] services probe failed http=${list.status} (honest)`);
  process.exit(1);
}
const svc = (list.body || []).map((s) => s.service || s).find((s) => s.name === NAME);
if (!svc) {
  console.log(`[render-home] service "${NAME}" not found among ${list.body.length} services (honest)`);
  process.exit(1);
}
const SID = svc.id;
const HOME_URL = svc.serviceDetails?.url || null;
console.log(`[render-home] service ${NAME} (${SID.slice(-8)}) · url=${HOME_URL || "unmeasured"}`);
if (!HOME_URL) {
  console.log("[render-home] no url in serviceDetails (honest failure)");
  process.exit(1);
}

// ── 2) מדידת-חיים ───────────────────────────────────────────────────────────
const headFull = spawnSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).stdout?.trim() || null;
const head12 = headFull ? headFull.slice(0, 12) : null;
// אמת-המקור-של-Render = origin/main (לא-הראש-המקומי — האחים-דוחפים-במקביל)
const remoteFull = spawnSync("git", ["ls-remote", "origin", "refs/heads/main"], { cwd: ROOT, encoding: "utf8", timeout: 30000 }).stdout?.trim().split(/\s+/)[0] || null;
const remote12 = remoteFull ? remoteFull.slice(0, 12) : null;
let http = await measureUrl(HOME_URL);
let healthy = http === 200;

// ── 3) בדיקת-התיישנות ───────────────────────────────────────────────────────
let stale = false, lastCommit = null;
const deps = await call("GET", `/services/${SID}/deploys?limit=1`);
const dep0 = Array.isArray(deps.body) && deps.body[0]?.deploy ? deps.body[0].deploy : null;
if (dep0) {
  lastCommit = dep0.commit?.id?.slice(0, 12) || null;
  stale = !!remoteFull && dep0.status === "live" && !!lastCommit && !remoteFull.startsWith(dep0.commit?.id || "");
}
console.log(`[render-home] url http=${http} · live-deploy=${dep0?.status || "unmeasured"} · deploy-commit=${lastCommit || "?"} · origin-main=${remote12 || "?"} · local-head=${head12 || "?"} · stale=${stale}`);

// ── 4) החיה-עצמית (נפל או-התיישן → פריסה) ─────────────────────────────────
let action = healthy && !stale ? "none" : null;
if (!healthy || stale) {
  const why = !healthy ? `dead(http=${http})` : `stale(${lastCommit}≠${head12})`;
  console.log(`[render-home] waking the second home: ${why} — triggering deploy…`);
  const trig = await call("POST", `/services/${SID}/deploys`, {});
  const depId = trig.body?.id || null;
  if (!depId) {
    console.log(`[render-home] deploy trigger failed http=${trig.status} (honest)`);
    action = "trigger-failed";
  } else {
    action = "redeployed";
    let st = "unknown";
    for (let i = 0; i < 30; i++) {
      await sleep(5000);
      const d = await call("GET", `/services/${SID}/deploys/${depId}`);
      st = d.body?.status || "unknown";
      if (st === "live" || st === "build_failed" || st === "deactivated" || st === "canceled") break;
    }
    // מדידה-עיקשת: הבית-מתחיל-מחדש-אחרי-פריסה → cold-start-לא-הוא-מוות
    for (let m = 0; m < 4; m++) {
      if (m) await sleep(5000);
      http = await measureUrl(HOME_URL);
      if (http === 200) break;
    }
    healthy = http === 200;
    console.log(`[render-home] redeploy ${depId.slice(-8)} → ${st} · url http=${http} · healthy=${healthy}`);
    if (st === "build_failed") action = "build-failed";
  }
}

// ── 5) קבלה-ממוסכת ─────────────────────────────────────────────────────────
fs.mkdirSync(R_DIR, { recursive: true });
let lines = [];
try {
  lines = fs.readFileSync(HOME_LOG, "utf8").trim().split("\n").filter(Boolean);
} catch {}
lines.push(JSON.stringify({ at: new Date().toISOString(), service: SID.slice(-8), url: HOME_URL, http, healthy, stale, action, head: head12, deployCommit: lastCommit, ms: Date.now() - t0 }));
fs.writeFileSync(HOME_LOG, lines.slice(-TAIL).join("\n") + "\n");

if (healthy && !stale) console.log("[render-home] SECOND HOME ALIVE");
process.exit(healthy && action !== "trigger-failed" && action !== "build-failed" ? 0 : 1);
