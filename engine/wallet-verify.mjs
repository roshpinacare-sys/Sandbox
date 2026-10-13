// ═══════════════════════════════════════════════════════════════════════════
// ARTERY-WALLET · מכונת-האמת של הארנק — רצה מהגיט (Actions ציבוריים = דקות-חינם).
// ───────────────────────────────────────────────────────────────────────────
// הבעיה-שנמדדה (2026-10-11): קבלות PASS של Saosmartwallet הוטבעו ממנוע-מקומי
// מחוץ-לגיט — בלא-ראיה, בלא-run, בלא-אפשרות-אימות. כל-מאמת-עצמי הוא סימולציה.
// התיקון: מדידה-אמיתית של HEAD הארנק מתוך הגיט — clone → install → prisma →
// tsc → build → חוקי-ארנק (asserts) → קבלה-כנה. כשל ⇒ exit 1 (אדום).
// המנוע כותב קבלות בלבד; ה-workflow עושה commit+rebase (הדפוס-המוכח-חי).
// אפס-סודות-בפלט: הטוקן חי ב-askpass בלבד, לא ב-URL/argv/לוג.
// ═══════════════════════════════════════════════════════════════════════════
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO = process.env.WALLET_SLUG || "roshpinacare-sys/Saosmartwallet";
const TOKEN = process.env.ECO_WALLET_TOKEN || "";
const out = (...a) => console.log(...a);

if (!TOKEN) { out("BLOCKED: ECO_WALLET_TOKEN absent — nothing measured, nothing claimed"); process.exit(2); }

const tmp = mkdtempSync(join(tmpdir(), "wallet-verify-"));
const result = {
  at: new Date().toISOString(),
  slug: REPO,
  walletHead: null,
  checks: {},
  asserts: [],
  warns: [],
  alerts: [],
  overall: "FAIL",
  reason: "",
  provenance: {
    runId: process.env.GITHUB_RUN_ID || null,
    runUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null,
    sha: process.env.GITHUB_SHA || null,
  },
};

const sh = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: 600000, ...opts });

try {
  const askpass = join(tmp, "askpass.sh");
  writeFileSync(
    askpass,
    "#!/bin/sh\ncase \"$1\" in Username*) echo x-access-token ;; Password*) echo \"$ECO_WALLET_TOKEN\" ;; esac\n",
    { mode: 0o700 },
  );
  const wdir = join(tmp, "wallet");
  sh("git", ["clone", "--depth", "1", "--quiet", `https://github.com/${REPO}.git`, wdir], {
    env: { ...process.env, GIT_ASKPASS: askpass, GIT_TERMINAL_PROMPT: "0" },
  });
  result.walletHead = sh("git", ["rev-parse", "HEAD"], { cwd: wdir }).trim();
  out("wallet HEAD:", result.walletHead);

  const check = (name, cmd, args, timeoutMs = 600000) => {
    try {
      sh(cmd, args, { cwd: wdir, timeout: timeoutMs });
      result.checks[name] = "pass";
      out(`${name}=pass`);
    } catch (e) {
      result.checks[name] = "fail";
      const tail = String(e.stdout || "").split("\n").slice(-6).join(" | ").slice(-280);
      result.reason = `${name} failed: ${tail || e.message}`;
      out(`${name}=FAIL — ${result.reason}`);
    }
  };

  check("install", "bun", ["install"]);
  if (result.checks.install === "pass") {
    if (existsSync(join(wdir, "prisma", "schema.prisma"))) check("prismaGenerate", "bunx", ["prisma", "generate"]);
    else { result.checks.prismaGenerate = "skip"; result.warns.push("no prisma schema"); }

    if (existsSync(join(wdir, "tsconfig.json"))) check("typecheck", "bunx", ["tsc", "--noEmit"], 900000);
    else { result.checks.typecheck = "skip"; result.warns.push("no tsconfig"); }

    if (existsSync(join(wdir, "package.json")) && readFileSync(join(wdir, "package.json"), "utf8").includes('"build"')) {
      const cfg = ["next.config.ts", "next.config.mjs", "next.config.js"].map((f) => join(wdir, f)).filter(existsSync);
      const useWebpack = cfg.some((f) => readFileSync(f, "utf8").includes("webpack"));
      // the probe decides its own bundler; an ambient TURBOPACK=1 exported by a
      // parent shell collides with the explicit --webpack flag and Next refuses
      // to run at all (measured 12:40Z: "Multiple bundler flags set") — strip
      // the ambient flag so the probe tests the build, not the parent's env.
      delete process.env.TURBOPACK;
      check("productionBuild", "bunx", useWebpack ? ["next", "build", "--webpack"] : ["next", "build"], 1500000);
    } else { result.checks.productionBuild = "skip"; result.warns.push("no build script"); }
  }

  // ── חוקי-ארנק: הסקירה הפכה לחוק-מכונה — כל-טענה שנמדדה = בדיקה שרצה תמיד ──
  const read = (p) => (existsSync(join(wdir, p)) ? readFileSync(join(wdir, p), "utf8") : null);
  const assertLaw = (id, ok, detail, severity = "fail") => {
    const verdict = ok ? "pass" : severity;
    result.asserts.push({ id, verdict, detail });
    out(`law ${id}: ${ok ? "pass" : verdict.toUpperCase() + " — " + detail}`);
  };

  const unlock = read("src/app/api/gate/unlock/route.ts") || "";
  assertLaw("law-unlock-ratelimit", unlock.includes("rateLimit("), "unlock endpoint must gate online passphrase guessing");

  const wv = read(".github/workflows/wallet-verify.yml") || "";
  assertLaw("law-no-skipped-pass", !wv.includes('!= "fail"') && wv.includes("push:"), "CI verdict law: skipped is never pass + push trigger present");

  const gl = read(".github/workflows/gitleaks.yml") || "";
  assertLaw("law-gitleaks-push", gl.includes("push:"), "secret scan must run on every push, not only PRs");

  assertLaw("law-r11-head-absent", !existsSync(join(wdir, "agent/vault/recovery-meta-2026-09-12.json")), "R11 key-material metadata file must stay absent at HEAD");

  // קבלת-PASS נטענת? רק עם provenance של ריצת-Actions אמיתית — קבלות-חוץ-לגיט מסומנות
  const status = read("agent/status.json");
  if (status) {
    try {
      const s = JSON.parse(status);
      if (s.verdict === "PASS") {
        const prov = s.provenance || {};
        const ok = typeof prov.runUrl === "string" && prov.runUrl.includes("/actions/runs/");
        const ageH = s.generatedAt ? Math.round((Date.now() - Date.parse(s.generatedAt)) / 3600000) : null;
        assertLaw(
          "law-pass-provenance",
          ok,
          ok
            ? `receipt provenance: ${prov.runUrl}`
            : `PASS receipt minted out-of-band (unverified-local-engine) — flagged; artery measurement is the authoritative verdict; mint age: ${ageH === null ? "unknown" : ageH + "h"} at ${result.walletHead.slice(0, 12)}`,
          "flag",
        );
      }
    } catch { result.warns.push("agent/status.json unparseable"); }
  } else result.warns.push("no agent/status.json at wallet HEAD");

  if (existsSync(join(wdir, "db/custom.db"))) result.warns.push("db/custom.db committed at HEAD (owner decision pending — never auto-touched)");

  const vals = Object.values(result.checks);
  const flags = result.asserts.filter((a) => a.verdict === "flag").map((a) => `${a.id}: ${a.detail}`);
  if (flags.length) result.alerts = flags;
  if (result.asserts.some((a) => a.verdict === "fail")) {
    result.overall = "FAIL";
    if (!result.reason) result.reason = "wallet-law assert failed";
  } else if (vals.some((v) => v === "fail")) result.overall = "FAIL";
  else if (vals.some((v) => v === "skip")) { result.overall = "BLOCKED"; if (!result.reason) result.reason = "incomplete measurement — skip is never pass"; }
  else {
    result.overall = "PASS";
    result.reason = flags.length
      ? `install, prisma, typecheck, build and all wallet laws pass — with ${flags.length} persistent trust-flag(s) (see alerts)`
      : "install, prisma, typecheck, build and all wallet laws pass";
  }
} catch (e) {
  result.overall = "ERROR";
  result.reason = String(e.message || e).slice(0, 300);
  out("ERROR:", result.reason);
}

// קבלה-כנה תמיד נכתבת (כולל FAIL) — הכנות קודמת לירוק
try {
  mkdirSync("receipts/wallet", { recursive: true });
  writeFileSync("receipts/wallet/verdict.json", JSON.stringify(result, null, 2) + "\n");
  appendFileSync("receipts/wallet/log.jsonl", JSON.stringify(result) + "\n");
} catch (e) {
  out("receipt-write error:", String(e.message || e).slice(0, 200));
}

if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
out(`VERDICT: ${result.overall} — ${result.reason}`);
process.exit(result.overall === "PASS" ? 0 : 1);
