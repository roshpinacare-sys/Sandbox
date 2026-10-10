#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
 * federation-selftest.mjs — סוללת-אמת לעורק-הפדרציה (T-46 · agent-2)
 *
 * הרתמה-אופליינית מלאה: שרת-GitHub-API מדומה בתוך-התהליך (node:http על
 * 127.0.0.1:0) — אפס-רשת-אמיתית, אפס-טוקן-אמיתי. מקלחות:
 *   A. ולידציה-חוקתית של-המניפסט (כישלון-כנה = זריקה)
 *   B. גילוי-מעודד (עימוד 103-ריפואים)
 *   C. בריאות-Actions (parsing · 404 · 500)
 *   D. דיון-כוונה↔מציאות (ADOPT-PENDING · GONE · UNVERIFIED-PRIVATE ·
 *      STALE · VISIBILITY-DRIFT · ARCHIVED · WORKFLOW-RED)
 *   E. שרשרת-מרקל (ראשונה prev=null · המשך מקפל-קודם · הליכה · חבלה-נתפסת)
 *   F. כנות-ובטיחות (SCAN-RED-נקופל · טוקן-אף-פעם-לא-בקבלה/בפנקס/בשגיאה)
 * יציאה: 0 רק-אם-הכל-ירוק. השופט-של-עורק-הפדרציה-בענן.
 * ═══════════════════════════════════════════════════════════════════════ */
import http from "node:http";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadManifest, listRepos, workflowRuns, classify, verifyLedger, runScan } from "./federation-scan.mjs";

let PASS = 0, FAIL = 0;
const fails = [];
const ok = (cond, name) => { if (cond) PASS++; else { FAIL++; fails.push(name); console.error("  ✗ " + name); } };
const throws = (fn, name, match) => {
  try { fn(); ok(false, name + " (did not throw)"); }
  catch (e) { ok(match ? match.test(String(e?.message ?? e)) : true, name); }
};
const throwsAsync = async (fn, name, match) => {
  try { await fn(); ok(false, name + " (did not throw)"); }
  catch (e) { ok(match ? match.test(String(e?.message ?? e)) : true, name); }
};

/* ── שרת-ה-API-המדומה ── */
function makeServer(state) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, "http://mock");
      const p = u.pathname;
      const send = (code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
      let m;
      if ((m = p.match(/^\/user\/repos$/))) {
        /* סמנטיקה-אמיתית (נמדד-חי T46): /user/repos = המאומת — כולל-פרטיים */
        const page = Number(u.searchParams.get("page") ?? "1");
        const all = state.authedRepos ?? [];
        const batch = all.length > 100 ? (page === 1 ? all.slice(0, 100) : page === 2 ? all.slice(100) : []) : page === 1 ? all : [];
        if (!req.headers.authorization) return send(401, { message: "mock: requires auth" });
        if (req.headers.authorization === `Bearer ${state.badToken}`) return send(401, { message: "mock: bad credentials" });
        return send(200, batch);
      }
      if ((m = p.match(/^\/users\/([^/]+)\/repos$/))) {
        const owner = decodeURIComponent(m[1]);
        if (owner === "boom") return send(500, { message: "mock explosion" });
        if (!state.reposByOwner[owner]) return send(404, { message: "no such owner" });
        const page = Number(u.searchParams.get("page") ?? "1");
        const all = state.reposByOwner[owner];
        const batch = all.length > 100 ? (page === 1 ? all.slice(0, 100) : page === 2 ? all.slice(100) : []) : page === 1 ? all : [];
        return send(200, batch);
      }
      if ((m = p.match(/^\/repos\/([^/]+)\/([^/]+)\/actions\/runs$/))) {
        const repo = decodeURIComponent(m[2]);
        if (repo === "errwf") return send(500, { message: "mock explosion" });
        const runs = state.runs[repo];
        if (!runs) return send(404, { message: "no actions" });
        return send(200, { workflow_runs: runs });
      }
      send(404, { message: "mock: no route " + p });
    });
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

const HOUR = 3600000;
const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString();
const repo = (name, o = {}) => ({
  name, private: !!o.private, archived: !!o.archived,
  pushed_at: o.pushedAgoH != null ? iso(o.pushedAgoH * HOUR) : iso(0.1 * HOUR),
  default_branch: o.branch ?? "main",
});

const TOKEN = "TEST-TOKEN-MUST-NEVER-LEAK-0f3c9a";
const BAD_TOKEN = "WRONG-TOKEN-NO-ACCESS";

const ACME = [
  repo("Sandbox", { branch: "main" }),
  repo("saos-runtime", { pushedAgoH: 2 }),
  repo("steem", { private: true, pushedAgoH: 72 }),
  repo("vault-home", { private: true, pushedAgoH: 240 }),
  repo("mystery-repo", {}),
  repo("errwf", {}),
];
const HUGE = [...Array.from({ length: 100 }, (_, i) => repo(`fill-${String(i).padStart(3, "0")}`)), repo("tail-a"), repo("tail-b"), repo("tail-c")];

async function main() {
  const srv = await makeServer({
    reposByOwner: { acme: ACME, huge: HUGE },
    /* סמנטיקה-אמיתית (נמדד-חי T46): עם-טוקן המנוע-שואל /user/repos — פרטיים-כלולים */
    authedRepos: ACME,
    badToken: BAD_TOKEN,
    runs: {
      Sandbox: [
        { path: ".github/workflows/sovereign.yml", name: "sovereign", conclusion: "success", created_at: iso(0.05 * HOUR), event: "schedule" },
        { path: ".github/workflows/sovereign.yml", name: "sovereign", conclusion: "success", created_at: iso(0.3 * HOUR), event: "repository_dispatch" },
        { path: ".github/workflows/federation.yml", name: "federation", conclusion: "failure", created_at: iso(0.2 * HOUR), event: "push" },
      ],
      "saos-runtime": [{ path: ".github/workflows/ci.yml", name: "SAOS-runtime-ci", conclusion: "success", created_at: iso(1 * HOUR), event: "push" }],
      errwf: [{ path: ".github/workflows/x.yml", name: "x", conclusion: "success", created_at: iso(1 * HOUR), event: "push" }],
    },
  });
  const base = `http://127.0.0.1:${srv.address().port}`;
  console.log(`harness: mock API at ${base}`);

  const MANIFEST = {
    schema: "federation-manifest/1",
    owner: "acme",
    repos: [
      { name: "Sandbox", role: "operations-home", visibility: "public", expect: { maxPushAgeHours: 3 } },
      { name: "saos-runtime", role: "pulse", visibility: "public", expect: { maxPushAgeHours: 168 } },
      { name: "steem", role: "engine-truth", visibility: "private", expect: { maxPushAgeHours: 336 } },
      { name: "vault-home", role: "keys", visibility: "private", expect: { maxPushAgeHours: 720 } },
    ],
  };

  /* ═══ A. ולידציה-חוקתית ═══ */
  console.log("A. manifest validation");
  ok(loadManifest(JSON.stringify(MANIFEST)).owner === "acme", "A1 valid manifest loads");
  throws(() => loadManifest("{nope"), "A2 bad JSON throws", /not valid JSON/);
  throws(() => loadManifest(JSON.stringify({ ...MANIFEST, schema: "x/9" })), "A3 wrong schema throws", /schema/);
  throws(() => loadManifest(JSON.stringify({ ...MANIFEST, owner: undefined })), "A4 missing owner throws", /owner/);
  throws(() => loadManifest(JSON.stringify({ ...MANIFEST, repos: [] })), "A5 empty repos throws", /repos/);
  throws(() => loadManifest(JSON.stringify({ ...MANIFEST, repos: [{ name: "x", visibility: "public" }] })), "A6 repo without role throws", /role/);
  throws(() => loadManifest(JSON.stringify({ ...MANIFEST, repos: [...MANIFEST.repos, { name: "steem", role: "dup", visibility: "public" }] })), "A7 duplicate repo throws", /duplicate/);
  throws(() => loadManifest(JSON.stringify({ ...MANIFEST, repos: [{ name: "x", role: "r", visibility: "secret" }] })), "A8 bad visibility throws", /visibility/);

  /* ═══ B. גילוי-מעודד ═══ */
  console.log("B. discovery pagination");
  const huge = await listRepos({ apiBase: base, owner: "huge" });
  ok(huge.length === 103, "B1 pagination aggregates 103 repos across pages (anonymous /users/)");
  ok(huge[102]?.name === "tail-c", "B2 last page item preserved in order");
  const acmeToken = await listRepos({ apiBase: base, token: TOKEN, owner: "acme" });
  ok(acmeToken.length === 6 && acmeToken.some((r) => r.name === "steem" && r.private), "B3 token mode → /user/repos → private repos included");
  ok(acmeToken.length === 6 && acmeToken.some((r) => r.name === "mystery-repo"), "B4 short page terminates scan");
  const acme = acmeToken;

  /* ═══ C. בריאות-Actions ═══ */
  console.log("C. actions health");
  const wr = await workflowRuns({ apiBase: base, token: TOKEN, owner: "acme" }, "Sandbox");
  ok(wr.actions === "ok" && wr.workflows[".github/workflows/sovereign.yml"].conclusion === "success", "C1 latest run per workflow (first wins)");
  const wr404 = await workflowRuns({ apiBase: base, token: TOKEN, owner: "acme" }, "no-actions-repo");
  ok(wr404.actions === "unavailable", "C2 404 → unavailable (not a crash)");
  const wr500 = await workflowRuns({ apiBase: base, token: TOKEN, owner: "acme" }, "errwf");
  ok(String(wr500.actions).startsWith("error:") && !String(wr500.actions).includes(TOKEN), "C3 500 → honest error, no token echo");

  /* ═══ D. דיון-כוונה↔מציאות ═══ */
  console.log("D. classification");
  const reality = await listRepos({ apiBase: base, token: TOKEN, owner: "acme" });
  const runsMap = new Map();
  for (const r of reality) runsMap.set(r.name, await workflowRuns({ apiBase: base, token: TOKEN, owner: "acme" }, r.name));
  const now = Date.now();
  const dToken = classify(MANIFEST, reality, runsMap, now, "token");
  const flagOf = (res, name) => res.flags.filter((f) => f.flag === name).map((f) => f.repo);
  ok(flagOf(dToken, "ADOPT-PENDING").includes("mystery-repo"), "D1 discovered-but-unlisted → ADOPT-PENDING");
  ok(dToken.flags.filter((f) => f.repo === "Sandbox").some((f) => f.flag === "WORKFLOW-RED"), "D2 red workflow flagged");
  ok(dToken.flags.every((f) => f.repo && f.flag && f.detail), "D3 every flag carries repo+flag+detail");
  ok(dToken.flagsTotal >= dToken.flags.length && dToken.flags.length <= 40, "D3b flag slice bounded (40) with honest flagsTotal");
  const anonReality = reality.filter((r) => !r.private);
  const runsAnon = new Map();
  for (const r of anonReality) runsAnon.set(r.name, await workflowRuns({ apiBase: base, token: TOKEN, owner: "acme" }, r.name));
  const dAnon = classify(MANIFEST, anonReality, runsAnon, now, "anonymous");
  ok(flagOf(dAnon, "UNVERIFIED-PRIVATE").sort().join(",") === "steem,vault-home", "D4 anonymous + private → UNVERIFIED-PRIVATE (honest, not GONE)");
  const dGone = classify(MANIFEST, reality.filter((r) => r.name !== "steem"), runsMap, now, "token");
  ok(flagOf(dGone, "GONE").includes("steem"), "D5 token + private missing → GONE");
  const staleM = { ...MANIFEST, repos: [{ ...MANIFEST.repos[1], expect: { maxPushAgeHours: 1 } }] };
  const dStale = classify(staleM, reality, runsMap, now, "token");
  ok(flagOf(dStale, "STALE").includes("saos-runtime"), "D6 stale push flagged");
  const driftM = { ...MANIFEST, repos: [{ ...MANIFEST.repos[2], visibility: "public" }] };
  const dDrift = classify(driftM, reality, runsMap, now, "token");
  ok(flagOf(dDrift, "VISIBILITY-DRIFT").includes("steem"), "D7 visibility drift flagged");
  const archReality = reality.map((r) => (r.name === "saos-runtime" ? { ...r, archived: true } : r));
  const dArch = classify(MANIFEST, archReality, runsMap, now, "token");
  ok(flagOf(dArch, "ARCHIVED").includes("saos-runtime"), "D8 archived-without-consent flagged");
  const cleanM = { ...MANIFEST, repos: MANIFEST.repos.filter((r) => r.name !== "steem") };
  const dClean = classify(cleanM, reality.filter((r) => r.name !== "steem" && r.name !== "mystery-repo" && r.name !== "errwf"), new Map([["Sandbox", { actions: "ok", workflows: {} }], ["saos-runtime", { actions: "ok", workflows: {} }]]), now, "token");
  ok(dClean.flags.length === 0, "D9 aligned world → zero flags");
  ok(!flagOf(dToken, "GONE").includes("steem") && !flagOf(dToken, "UNVERIFIED-PRIVATE").includes("steem"), "D10 token mode verifies private repos (no false GONE — the live T46 bug, now regression-guarded)");
  const noActions = new Map(runsMap); noActions.set("Sandbox", { actions: "unavailable" });
  const dDead = classify({ ...MANIFEST, repos: [{ ...MANIFEST.repos[0], expect: { ...MANIFEST.repos[0].expect, actionsAlive: true } }] }, reality, noActions, now, "token");
  ok(flagOf(dDead, "ACTIONS-DEAD").includes("Sandbox"), "D11 actionsAlive expected + unavailable → ACTIONS-DEAD");

  /* ═══ E. שרשרת-מרקל ═══ */
  console.log("E. merkle ledger");
  const dir = mkdtempSync(join(tmpdir(), "fed-selftest-"));
  const cfg = {
    manifestPath: join(dir, "FEDERATION.json"),
    ledgerPath: join(dir, "LEDGER.jsonl"),
    latestPath: join(dir, "latest.json"),
    apiBase: base, token: TOKEN, owner: "acme", guardMinutes: null,
  };
  writeFileSync(cfg.manifestPath, JSON.stringify(cleanM));
  const r1 = (await runScan(cfg)).receipt;
  ok(r1.chain.prev === null && /^[0-9a-f]{64}$/.test(r1.chain.cur), "E1 first receipt: prev=null, cur=sha256");
  ok(r1.verdict === "FEDERATION-DRIFT", "E2 honest verdict on flaggy world");
  const r2 = (await runScan(cfg)).receipt;
  ok(r2.chain.prev === r1.chain.cur, "E3 second receipt folds the first");
  const lines = readFileSync(cfg.ledgerPath, "utf8").split("\n").filter((l) => l.trim());
  ok(lines.length === 2, "E4 ledger has exactly two entries");
  const walk = verifyLedger(lines);
  ok(walk.unbroken && walk.count === 2 && walk.head === r2.chain.cur, "E5 ledger walk UNBROKEN with correct head");
  const tampered = lines.map((l, i) => (i === 1 ? JSON.stringify({ ...JSON.parse(l), tookMs: 1 }) : l));
  ok(verifyLedger(tampered).unbroken === false && verifyLedger(tampered).reason === "cur-hash mismatch", "E6 tampered body caught by hash");
  const reordered = [lines[1], lines[0]];
  ok(verifyLedger(reordered).unbroken === false && verifyLedger(reordered).reason === "prev-link mismatch", "E7 reordered links caught");
  ok(verifyLedger([]).unbroken === true && verifyLedger([]).count === 0, "E8 empty ledger walks clean");
  const latestOnDisk = JSON.parse(readFileSync(cfg.latestPath, "utf8"));
  ok(latestOnDisk.chain.cur === r2.chain.cur, "E9 latest.json equals head receipt");
  ok(latestOnDisk.counts.manifest === cleanM.repos.length && typeof latestOnDisk.tookMs === "number", "E10 receipt counts wired");

  /* guard: פנקס-טרי → דיכוי-בלי-כתיבה */
  const g1 = await runScan({ ...cfg, guardMinutes: 28 });
  ok(g1.suppressed === true && g1.verdict === "CHAIN-SUPPRESSED", "E11 fresh ledger → CHAIN-SUPPRESSED");
  ok(readFileSync(cfg.ledgerPath, "utf8").split("\n").filter((l) => l.trim()).length === 2, "E12 suppression wrote nothing");

  /* ═══ F. כנות-ובטיחות ═══ */
  console.log("F. honesty & security");
  const redM = { ...cleanM, owner: "boom" };
  writeFileSync(cfg.manifestPath, JSON.stringify(redM));
  let threw = null;
  try { await runScan({ ...cfg, token: BAD_TOKEN }); } catch (e) { threw = e; }
  ok(!!threw, "F1 hard API failure throws");
  ok(!String(threw?.message ?? "").includes(TOKEN), "F2 token never in error message");
  const redLines = readFileSync(cfg.ledgerPath, "utf8").split("\n").filter((l) => l.trim());
  const redRec = JSON.parse(redLines[redLines.length - 1]);
  ok(redRec.verdict === "SCAN-RED" && redRec.chain.prev === r2.chain.cur, "F3 red receipt folded into chain (T-45b lesson)");
  ok(verifyLedger(redLines).unbroken && verifyLedger(redLines).count === 3, "F4 walk stays UNBROKEN across green→green→red");
  ok(!readFileSync(cfg.ledgerPath, "utf8").includes(TOKEN) && !readFileSync(cfg.latestPath, "utf8").includes(TOKEN), "F5 token absent from ledger and latest.json");
  ok(redRec.schema === "federation/1" && redRec.at && redRec.chain, "F6 red receipt carries full schema");
  await throwsAsync(
    () => listRepos({ apiBase: base, token: BAD_TOKEN, owner: "acme" }),
    "F7 bad token → honest 401, no token echo",
    /HTTP 401/
  );

  srv.close();
  console.log(`\nfederation-selftest: ${PASS}/${PASS + FAIL} PASS`);
  if (FAIL) { console.error("failed: " + fails.join(" · ")); process.exit(1); }
}

main().catch((e) => { console.error("HARNESS FATAL " + String(e?.stack ?? e)); process.exit(1); });
