// ═══════════════════════════════════════════════════════════════════════════
// ARTERY-FLEET · מכונת-האמת של הצי — אימות-ריפואים-קריטיות מהגיט (T-53).
// ───────────────────────────────────────────────────────────────────────────
// הבעיה-שנמדדה (2026-10-11): כל-ה-Actions של הריפואים-הפרטיות מתים-בחומת-מכסה
// מאז 10-05 — אימות-המוח (steem engine), ה-dex והספרייה (saos-agents) נעשה
// במכונות-מקומיות בלבד = לא-ניתן-לאימות-מהגיט. והמנוע בכלל לא רץ מ-checkout
// נקי בלי משמעת-התקנה (selftest: ERR_MODULE_NOT_FOUND — נמדד-חי).
// התיקון: מדידה-קבועה מ-Sandbox (Actions ציבורי = דקות-חינם) + חוקי-צי אחידים.
// כשל ⇒ exit 1 (אדום) + קבלה-כנה בגיט (כולל FAIL). אפס-סודות-בפלט.
// ═══════════════════════════════════════════════════════════════════════════
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORG = "roshpinacare-sys";
const TOKEN = process.env.ECO_WALLET_TOKEN || "";
const out = (...a) => console.log(...a);

if (!TOKEN) { out("BLOCKED: ECO_WALLET_TOKEN absent — nothing measured, nothing claimed"); process.exit(2); }

// הצי-הקריטי: מוח (steem engine selftest) · dex (typecheck) · ספרייה (agents selftest)
const FLEET = [
  {
    name: "steem-cockpit",
    slug: `${ORG}/steem`,
    checks: [
      { id: "install", cmd: "bun", args: ["install", "--frozen-lockfile"] },
      { id: "engineInstall", cmd: "bun", args: ["install"], cwd: "mini-services/saos-engine" },
      { id: "engineSelftest", cmd: "bun", args: ["selftest.mjs"], cwd: "mini-services/saos-engine", timeout: 600000, expect: "SELFTEST" },
    ],
  },
  {
    name: "saos-dex",
    slug: `${ORG}/saos-dex`,
    checks: [
      { id: "install", cmd: "bun", args: ["install", "--frozen-lockfile"] },
      { id: "typecheck", cmd: "bun", args: ["run", "typecheck"], timeout: 600000 },
    ],
  },
  {
    name: "saos-agents",
    slug: `${ORG}/saos-agents`,
    checks: [
      { id: "agentsSelftest", cmd: "bun", args: ["test/selftest.mjs"], timeout: 300000, expect: "SELFTEST" },
    ],
  },
  {
    name: "saos-wallet",
    slug: `${ORG}/Saosmartwallet`,
    checks: [], // הבנייה נמדדת שעתית ב-artery-wallet (T-52) — כאן רק חוקי-הארנק (חוזה-צי, מדידה-כפולה)
    walletLaws: true,
  },
  {
    // I-סדרה (2026-10-11): זרוע-השיווק החיה (E-סדרה החייאה) — תוכן סטטי (fact-sheet מגובה-txids,
    // kits EN/HE, claims-guard) שהתחייב לעורקי-אמת ולא סיפק. מעתה: gitleaks-HEAD + חוקי-צי
    // רצים עליו כאן מדקות-ציבוריות (ה-Actions-שלו-עצמו מתים-בחומת-המכסה-הפרטית — נמדד).
    // מדידה-מקומית לפני-חיווט (2026-10-11): gitleaks-HEAD --no-git = 0 ממצאים.
    name: "adsmarket",
    slug: `${ORG}/Adsmarket`,
    checks: [],
  },
];

// חוקי-צי אחידים — כל-ריפו-קריטי נבדק מולם (החוזה של הסקירות, הופך-מכונה)
function fleetLaws(wdir) {
  const laws = [];
  // 1) תיאטרון-CI אסור: אין דפוס skipped-עובר באף-workflow
  const wfDir = join(wdir, ".github/workflows");
  let theater = 0, scanned = 0;
  if (existsSync(wfDir)) {
    for (const f of execFileSync("ls", [wfDir]).toString().trim().split("\n").filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))) {
      scanned++;
      const txt = readFileSync(join(wfDir, f), "utf8");
      if (txt.includes('!= "fail"')) theater++;
    }
  }
  laws.push({ id: "law-no-skipped-pass", verdict: theater === 0 ? "pass" : "fail", detail: `workflows scanned: ${scanned}, theater patterns: ${theater}` });
  // 2) סריקת-סודות על-push (אם-gitleaks.yml קיים — חייב push trigger)
  const glPath = join(wfDir, "gitleaks.yml");
  if (existsSync(glPath)) {
    const ok = readFileSync(glPath, "utf8").includes("push:");
    laws.push({ id: "law-gitleaks-push", verdict: ok ? "pass" : "fail", detail: ok ? "gitleaks scans every push" : "gitleaks.yml exists but PR-only — pushes unscanned" });
  } else laws.push({ id: "law-gitleaks-push", verdict: "flag", detail: "no gitleaks.yml in repo — no in-repo secret scan" });
  // 3) R11 חייב להישאר מחוץ-לHEAD
  const r11 = existsSync(join(wdir, "agent/vault/recovery-meta-2026-09-12.json"));
  laws.push({ id: "law-r11-head-absent", verdict: r11 ? "fail" : "pass", detail: r11 ? "R11 key-material metadata REAPPEARED at HEAD" : "absent at HEAD" });
  return laws;
}

/* חוקי-הארנק כחוזה-צי (T-64): חמשת-החוקים של wallet-verify נאכפים גם כאן —
 * מדידה-כפולה בלתי-תלויה. אם מישהו יחליש את עורק-הארנק או את קוד-השער,
 * העורק-הזה יצעק. severity זהה למקור (provenance = flag, השאר fail). */
function walletFleetLaws(wdir) {
  const laws = [];
  const read = (p) => (existsSync(join(wdir, p)) ? readFileSync(join(wdir, p), "utf8") : null);
  const push = (id, ok, detail, severity = "fail") => laws.push({ id, verdict: ok ? "pass" : severity, detail });
  const unlock = read("src/app/api/gate/unlock/route.ts") || "";
  push("law-unlock-ratelimit", unlock.includes("rateLimit("), "unlock endpoint must gate online passphrase guessing");
  const wv = read(".github/workflows/wallet-verify.yml") || "";
  push("law-no-skipped-pass", !wv.includes('!= "fail"') && wv.includes("push:"), "CI verdict law: skipped is never pass + push trigger present");
  const gl = read(".github/workflows/gitleaks.yml") || "";
  push("law-gitleaks-push", gl.includes("push:"), "secret scan must run on every push, not only PRs");
  push("law-r11-head-absent", !existsSync(join(wdir, "agent/vault/recovery-meta-2026-09-12.json")), "R11 key-material metadata file must stay absent at HEAD");
  const status = read("agent/status.json");
  if (status) {
    try {
      const s = JSON.parse(status);
      if (s.verdict === "PASS") {
        const prov = s.provenance || {};
        const ok = typeof prov.runUrl === "string" && prov.runUrl.includes("/actions/runs/");
        push("law-pass-provenance", ok, ok ? `receipt provenance: ${prov.runUrl}` : "PASS receipt minted out-of-band — flagged; artery measurement is the authoritative verdict", "flag");
      }
    } catch { laws.push({ id: "law-pass-provenance", verdict: "flag", detail: "agent/status.json unparseable" }); }
  }
  return laws;
}

const tmp = mkdtempSync(join(tmpdir(), "fleet-verify-"));
const results = [];
const overall = { at: new Date().toISOString(), repos: {}, alerts: [], overall: "FAIL", reason: "" };
const askpass = join(tmp, "askpass.sh");
writeFileSync(askpass, "#!/bin/sh\ncase \"$1\" in Username*) echo x-access-token ;; Password*) echo \"$ECO_WALLET_TOKEN\" ;; esac\n", { mode: 0o700 });

// סריקת-סודות על HEAD — הבינארי-המקובע (הקנון: Domain/Defi gitleaks.yml). מתה-אורג-wide מאז 09-20; חוזרת דרך דקות-חינם.
let GLBIN = null;
try {
  const tgz = join(tmp, "gl.tgz");
  const res = await fetch("https://github.com/gitleaks/gitleaks/releases/download/v8.24.3/gitleaks_8.24.3_linux_x64.tar.gz");
  if (res.ok) {
    writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
    execFileSync("tar", ["-xzf", tgz, "-C", tmp, "gitleaks"]);
    GLBIN = join(tmp, "gitleaks");
    out("gitleaks binary ready (v8.24.3, HEAD-only scan)");
  } else out(`gitleaks download skipped: http=${res.status} — scan law degrades to flag`);
} catch (e) { out(`gitleaks download failed: ${String(e.message).slice(0, 120)} — scan law degrades to flag`); }

function gitleaksHeadScan(wdir, repName) {
  if (!GLBIN) return { id: "law-no-secrets-at-head", verdict: "flag", detail: "scanner unavailable this run (download failed) — no HEAD secret scan" };
  const rep = join(tmp, `gl-${repName}.json`);
  // LAW-C (wave-19.39): המוֹת-חוק מכבד את פנקס-השקרים-השליליים הרשמי .gitleaksignore (בבעלות-הריפו).
  // ממצא-מנוטרל-בפנקס = פסק-דין מתועד (עוגן-שלמות/עיצוב-כספת), לא סוד-פתוח. ממצא-חי-שאינו-בפנקס נשאר אדום.
  let ledger = new Set();
  try {
    ledger = new Set(readFileSync(join(wdir, ".gitleaksignore"), "utf8").split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#")));
  } catch { /* no ledger — every finding is live */ }
  const isLedgered = (f) => {
    // gitleaks emits File relative to the INVOCATION cwd (may carry the source-dir prefix) —
    // normalize to repo-root-relative so ledger pins (repo-root) match regardless of how the
    // scanner was invoked. Measured 19.39: `--source steem` ⇒ File="steem/agent/…".
    const files = new Set([String(f.File || "")]);
    const base = String(wdir).replace(/\/+$/, "");
    for (const p of [...files]) { if (base) { const i = p.indexOf(`${base}/`); if (i >= 0) files.add(p.slice(i + base.length + 1)); } }
    for (const file of files) {
      if (ledger.has(`${file}:${f.RuleID}:${f.StartLine}`) || ledger.has(`${file}:${f.RuleID}`) || ledger.has(`${file}:${f.StartLine}:${f.RuleID}`)) return true;
      if (f.Fingerprint && ledger.has(String(f.Fingerprint))) return true;
    }
    return false;
  };
  try {
    execFileSync(GLBIN, ["detect", "--source", wdir, "--no-git", "--report-format", "json", "--report-path", rep, "--redact", "--no-banner", "--log-level", "error"], { timeout: 300000, stdio: ["ignore", "pipe", "pipe"] });
    return { id: "law-no-secrets-at-head", verdict: "pass", detail: ledger.size ? `gitleaks HEAD scan: 0 findings (${ledger.size} ledger pin(s) armed)` : "gitleaks HEAD scan: 0 findings" };
  } catch (e) {
    // exit 1 = findings; פרס-מטא-דאטה בלבד (--redact — אפס-ערכים)
    let count = 0; const top = []; let ignored = 0;
    try {
      const all = JSON.parse(readFileSync(rep, "utf8"));
      const live = all.filter((f) => !isLedgered(f));
      ignored = all.length - live.length;
      count = live.length;
      const uniq = [...new Set(live.map((f) => `${f.RuleID}@${f.File || ""}`))];
      top.push(...uniq);
    } catch { /* report unreadable */ }
    const ledgerNote = ignored ? ` — ${ignored} ledgered false-positive(s) honored (.gitleaksignore)` : (ledger.size ? " — ledger pins armed, none matched" : "");
    return { id: "law-no-secrets-at-head", verdict: count > 0 ? "flag" : "pass", detail: count > 0 ? `gitleaks HEAD scan: ${count} live finding(s)${ledgerNote} — redacted metadata: ${top.join(", ")}` : `gitleaks HEAD scan: 0 live findings${ledgerNote}` };
  }
}

for (const repo of FLEET) {
  const r = { at: overall.at, slug: repo.slug, head: null, checks: {}, laws: [], alerts: [], overall: "FAIL", reason: "" };
  const wdir = join(tmp, repo.name);
  try {
    execFileSync("git", ["clone", "--depth", "1", "--quiet", `https://github.com/${repo.slug}.git`, wdir], {
      stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, GIT_ASKPASS: askpass, GIT_TERMINAL_PROMPT: "0" }, timeout: 300000,
    });
    r.head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: wdir }).toString().trim();
    const scanLaw = gitleaksHeadScan(wdir, repo.name);
    r.laws.push(scanLaw);
    out(`${repo.name}/${scanLaw.id}: ${scanLaw.verdict} — ${scanLaw.detail}`);
    for (const c of repo.checks) {
      const cwdAbs = c.cwd ? join(wdir, c.cwd) : wdir;
      try {
        const o = execFileSync(c.cmd, c.args, { cwd: cwdAbs, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: c.timeout || 600000 });
        if (c.expect && !o.includes(c.expect)) throw new Error(`expected marker "${c.expect}" missing in output`);
        r.checks[c.id] = "pass";
        out(`${repo.name}/${c.id}=pass`);
      } catch (e) {
        r.checks[c.id] = "fail";
        r.reason = `${c.id} failed: ${String(e.stdout || e.stderr || e.message).split("\n").slice(-4).join(" | ").slice(-240)}`;
        out(`${repo.name}/${c.id}=FAIL — ${r.reason}`);
      }
    }
    r.laws.push(...fleetLaws(wdir));
    if (repo.walletLaws) r.laws.push(...walletFleetLaws(wdir));
    for (const l of r.laws) {
      if (l.verdict === "flag") r.alerts.push(`${l.id}: ${l.detail}`);
      out(`${repo.name}/${l.id}: ${l.verdict} — ${l.detail}`);
    }
    const checkFail = Object.values(r.checks).some((v) => v === "fail");
    const lawFail = r.laws.some((l) => l.verdict === "fail");
    r.overall = checkFail || lawFail ? "FAIL" : "PASS";
    if (r.overall === "PASS" && !r.reason) r.reason = "all checks and fleet laws pass";
  } catch (e) {
    r.overall = "ERROR";
    r.reason = String(e.message || e).slice(0, 240);
    out(`${repo.name}: ERROR — ${r.reason}`);
  }
  results.push(r);
  overall.repos[repo.name] = { head: r.head, overall: r.overall, checks: r.checks, reason: r.reason };
  if (r.alerts.length) overall.alerts.push(...r.alerts.map((a) => `${repo.name}: ${a}`));
}

overall.overall = results.every((r) => r.overall === "PASS") ? "PASS" : "FAIL";
overall.reason = results.map((r) => `${r.slug.split("/")[1]}=${r.overall}`).join(" · ");

// provenance (G-series law, closes the unprovenanced FLAG on receipts/fleet): the receipt
// carries its own Actions run identity - the integrity guard verifies it against the API.
overall.provenance = {
  runId: process.env.GITHUB_RUN_ID || null,
  runUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null,
  sha: process.env.GITHUB_SHA || null,
};

// קבלות-כנות תמיד (כולל FAIL)
try {
  mkdirSync("receipts/fleet", { recursive: true });
  writeFileSync("receipts/fleet/verdict.json", JSON.stringify({ ...overall, details: results }, null, 2) + "\n");
  appendFileSync("receipts/fleet/log.jsonl", JSON.stringify(overall) + "\n");
  for (const r of results) {
    writeFileSync(`receipts/fleet/${r.slug.split("/")[1]}.json`, JSON.stringify(r, null, 2) + "\n");
  }
} catch (e) { out("receipt-write error:", String(e.message || e).slice(0, 200)); }

if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
out(`VERDICT: ${overall.overall} — ${overall.reason}`);
process.exit(overall.overall === "PASS" ? 0 : 1);
