#!/usr/bin/env node
/* fleet-yield.mjs — עורק-התשואה (T-45 · agent-4 · Sandbox)
 * ═══════════════════════════════════════════════════════════════════════════
 * **התשואה-חיה-מה-git-home** — הרכיב-האחרון-שהיה-תלוי-בסנדבוקס-האפמרלי
 * (מנוע-ה-curation של ריפו-steem: חוקי-ה-crowded-pool T-35 · חלון-הגיל R289 ·
 *  דיוק-ה-VP האפקטיבי T-85) — מעכשיו רץ-כפועל-ענן-חסר-מדינה מהריפו-הזה.
 *
 * מה-הוא-עושה (בסדר-האמת):
 *   1. בודק-נוכחות-מנוע (checkout של roshpinacare-sys/steem@saos-cockpit) — חסר = יציאה-כנה 1.
 *   2. selftest-gate: מריץ את selftest.mjs של-המנוע; לא-כל-הווקטורים-ירוקים = אין-תבונה (יציאה 1).
 *   3. קריאות-שרשרת קריאה-בלבד (api.steemit.com): dgpo → vestsPerSP · get_accounts → vpEff אפקטיבי.
 *   4. זרם-מועמדים חי מהתגיות → חוקי-ה-curator (ייבוא-דינמי מהמנוע — אפס-שכפול-חוקים).
 *   5. קבלה-שרשרתית (merkle fold מול log.jsonl) — הקבלה-היא-ההוכחה.
 *
 * **חוק-המישורים:** לסוכן-אין-מפתחות-ואין-חתימות. המנוע-מתכנן — הקוקפיט-של-המפעיל
 * (Pages /operator/) חותם. runCurator (המבצע-עם-ה-keyload) לעולם-לא-נקרא-מכאן.
 *
 * אפס-תלות-חוץ (stdlib בלבד) · אפס-סודות · כישלון-כנה = יציאה 1, אף-ירוק-שקרי.
 *
 * env:
 *   FLEET_ENGINE_DIR    (ברירת-מחדל fleet-engine)      — checkout המנוע
 *   FLEET_RECEIPTS_DIR  (ברירת-מחדל receipts/fleet-yield)
 *   FLEET_VOTER         (ברירת-מחדל headcorner)        — קריאת-סוללה-בלבד (אפס-חתימה)
 *   FLEET_RPC           (ברירת-מחדל https://api.steemit.com)
 *   FLEET_FETCH_LIMIT   (ברירת-מחדל 50 — R290: קלאמפ 20..50)
 *   FLEET_LOG_MAX       (ברירת-מחדל 240 — סבוב-יומן-הקבלות)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ENGINE_ROOT = path.resolve(process.env.FLEET_ENGINE_DIR || "fleet-engine");
const ENGINE_SUB = "mini-services/saos-engine";
const REC_DIR = path.resolve(process.env.FLEET_RECEIPTS_DIR || "receipts/fleet-yield");
const VOTER = String(process.env.FLEET_VOTER || "headcorner").trim();
const RPC = String(process.env.FLEET_RPC || "https://api.steemit.com").replace(/\/+$/, "");
const LOG_MAX = Math.max(2, Math.min(2000, Number(process.env.FLEET_LOG_MAX) || 240));
const FETCH_LIMIT_DEFAULT = 50;

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const num = (s) => Number(String(s ?? "0").split(" ")[0].replace(/,/g, "")) || 0;

function writeJson(p, v) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const t = `${p}.tmp.${process.pid}`;
  fs.writeFileSync(t, JSON.stringify(v, null, 2));
  fs.renameSync(t, p); /* atomic — ה-rename הוא-נקודת-המחויבות */
}

function readJsonSafe(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}

/* הקבלה-האחרונה-ביומן — מקור-ה-chain.prev (היומן-הוא-האמת, לא-last.json שאפשר-למחוק) */
function readLastLogLine() {
  try {
    const lines = fs.readFileSync(path.join(REC_DIR, "log.jsonl"), "utf8")
      .split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.length ? JSON.parse(lines[lines.length - 1]) : null;
  } catch { return null; }
}

async function rpc(method, params) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 20000);
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
      signal: ac.signal,
    });
    if (!res.ok) return { ok: false, error: `http-${res.status}` };
    const j = await res.json();
    if (j?.error) return { ok: false, error: String(j.error?.message || "rpc-error").slice(0, 120) };
    return { ok: true, result: j?.result ?? null };
  } catch (e) {
    return { ok: false, error: String(e?.cause?.code || e?.name || e || "fetch-fail").slice(0, 120) };
  } finally { clearTimeout(timer); }
}

/* ── פנקס-הקבלות: קיפול-שרשרת + append + סבוב — משותף-לירוק-ולאדום (לקח-T-44:
 * כישלון-שלא-משאיר-קבלה-בגיט = ירוק-שקרי-במחשבה-הפוכה; האדום-הוא-ראיה) ── */
function writeLedgerReceipt(payload) {
  const prev = readLastLogLine();
  const prevChain = prev?.chain?.cur ?? null;
  const curChain = sha256(JSON.stringify({ ...payload, prevChain }));
  const { prevChain: _prev, ...body } = { ...payload, prevChain };
  const receipt = { ...body, chain: { prev: prevChain, cur: curChain } };
  writeJson(path.join(REC_DIR, "last.json"), receipt);
  fs.mkdirSync(REC_DIR, { recursive: true });
  const logPath = path.join(REC_DIR, "log.jsonl");
  fs.appendFileSync(logPath, JSON.stringify(receipt) + "\n");
  try {
    const lines = fs.readFileSync(logPath, "utf8").split("\n").filter(Boolean);
    if (lines.length > LOG_MAX) {
      const t = `${logPath}.tmp.${process.pid}`;
      fs.writeFileSync(t, lines.slice(-LOG_MAX).join("\n") + "\n");
      fs.renameSync(t, logPath);
    }
  } catch { /* סבוב-הוא-תחזוקה-בלבד; הקבלה-כבר-נכתבה */ }
  return receipt;
}

function failReceipt(verdict, extra = {}) {
  /* כנות-מלאה-בכישלון: הקבלה-האדומה-כותבת-עצמה-לפנקס (מקופלת-לשרשרת) ויוצאת-1.
   * השופט=הבייטים — השגיאה-המדויקת-יוצאת-ל-stdout (אפס-סודות-כאן-מעולם). */
  let chain = null;
  try { chain = writeLedgerReceipt({ schema: "fleet-yield/1", at: new Date().toISOString(), verdict, ...extra }).chain; } catch { /* אפילו-פנקס-מת — הכנות-ב-stdout */ }
  console.log(JSON.stringify({ schema: "fleet-yield/1", at: new Date().toISOString(), verdict, chain, ...extra }));
  process.exit(1);
}

/* ── selftest-gate: השופט=הבייטים של-המנוע ──────────────────────────────── */
function engineSelftest(engDir) {
  const r = spawnSync(process.execPath, ["selftest.mjs"], {
    cwd: engDir, encoding: "utf8", timeout: 180000,
    env: { ...process.env, NODE_ENV: "ci" },
  });
  const text = `${r.stdout || ""}\n${r.stderr || ""}`;
  const m = text.match(/SELFTEST\s+(\d+)\/(\d+)\s+(PASS|FAIL)/i);
  const parsed = m
    ? { passed: Number(m[1]), total: Number(m[2]), status: String(m[3]).toUpperCase() }
    : { passed: null, total: null, status: "UNPARSED" };
  const tail = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(-8);
  return { parsed, tail, code: r.status, timedOut: r.error?.code === "ETIMEDOUT" || r.signal === "SIGTERM" };
}

async function main() {
  const t0 = Date.now();
  const at = new Date(t0).toISOString();

  /* 1 · נוכחות-מנוע — fail-closed */
  const engDir = path.join(ENGINE_ROOT, ENGINE_SUB);
  const missing = ["curator.mjs", "selftest.mjs", "lib.mjs"]
    .filter((f) => !fs.existsSync(path.join(engDir, f)));
  if (missing.length) failReceipt("ENGINE-MISSING", { engineRoot: path.basename(ENGINE_ROOT), missing });

  /* ראש-המנוע (אם-ה-checkout הוא-git; אחרת-כנות: null) */
  const headR = spawnSync("git", ["rev-parse", "--short=12", "HEAD"], { cwd: ENGINE_ROOT, encoding: "utf8" });
  const engineHead = headR.status === 0 ? String(headR.stdout || "").trim() || null : null;

  /* 2 · selftest-gate */
  const st = engineSelftest(engDir);
  const selftest = {
    passed: st.parsed.passed, total: st.parsed.total, status: st.parsed.status,
    code: st.code, timedOut: st.timedOut,
  };
  if (st.code !== 0 || selftest.status !== "PASS" || selftest.passed !== selftest.total) {
    failReceipt("SELFTEST-GATE-RED", { engineHead, selftest, tail: st.tail });
  }

  /* 3 · ייבוא-החוקים מהמנוע עצמו — אפס-שכפול, מקור-האמת הוא-הריפו הפרטי */
  let cur;
  try {
    cur = await import(pathToFileURL(path.join(engDir, "curator.mjs")).href);
  } catch (e) {
    failReceipt("ENGINE-IMPORT-FAIL", { engineHead, error: String(e?.message || e).slice(0, 160) });
  }
  if (typeof cur.filterCandidates !== "function" || typeof cur.fetchCandidates !== "function") {
    failReceipt("ENGINE-CONTRACT-FAIL", { engineHead, note: "curator.mjs missing law exports" });
  }

  const policy = { ...cur.curatorPolicy(), fetchLimit: Math.min(Math.max(Number(process.env.FLEET_FETCH_LIMIT) || FETCH_LIMIT_DEFAULT, 20), 50) };
  const nowMs = Date.now();

  /* 4 · קריאות-שרשרת (קריאה-בלבד) */
  const dgpo = await rpc("condenser_api.get_dynamic_global_properties", []);
  if (!dgpo.ok || !dgpo.result) failReceipt("RPC-DGPO-FAIL", { engineHead, selftest, error: dgpo.error });

  const tvs = num(dgpo.result.total_vesting_shares);
  const tvf = num(dgpo.result.total_vesting_fund_steem);
  const vestsPerSP = tvf > 0 ? Math.round((tvs / tvf) * 1e6) / 1e6 : null;

  const accR = await rpc("condenser_api.get_accounts", [[VOTER]]);
  const acc = accR.ok ? accR.result?.[0] ?? null : null;
  /* כישלון-קריאת-חשבון ≠ כישלון-תבונה: גיליון-המועמדים אינו-תלוי-חשבון. כנות-בקבלה. */
  const voter = acc
    ? {
        account: VOTER, status: "read-ok",
        vestsEff: cur.effectiveVests(acc),
        vpEff: cur.vpEffPct(Number(acc.voting_manabar?.current_mana ?? 0), cur.effectiveVests(acc)),
      }
    : { account: VOTER, status: "read-failed", error: accR.error ?? "no-result", vestsEff: null, vpEff: null };

  /* 5 · זרם-חי → חוקי-ה-curator (voter=קריאה-בלבד; אפס-מדינה-יומית = תוכנית-מלאה) */
  const fetched = await cur.fetchCandidates(policy, null, nowMs);
  if (!fetched.ok) failReceipt("RPC-STREAM-FAIL", { engineHead, selftest, voter, vestsPerSP, error: "all nodes down" });
  const plan = cur.filterCandidates({
    posts: fetched.posts, voter: VOTER, policy, nowMs,
    votedPermlinks: [], votesToday: 0, authorsToday: {}, jitterSeed: null,
  });

  /* 6 · קבלה-שרשרתית */
  const payload = {
    schema: "fleet-yield/1",
    at,
    verdict: acc ? "INTEL-OK" : "INTEL-PARTIAL",
    engineHead,
    selftest: { passed: selftest.passed, total: selftest.total, status: selftest.status },
    state: {
      vestsPerSP,
      tvs, tvf,
      head: String(dgpo.result.head_block_number ?? ""),
    },
    voter,
    candidates: {
      scanned: fetched.posts.length,
      selected: plan.selected.slice(0, 12),
      rejectedTop: plan.rejected.slice(0, 14).map((r) => `${r.key}:${r.reason}`),
      rejectedCount: plan.rejected.length,
      crowded: plan.rejected.filter((r) => r.reason === "crowded").length,
      dayCapReached: plan.dayCapReached === true,
    },
    laws: {
      maxPostVotes: policy.maxPostVotes, maxPerDay: policy.maxPerDay,
      ageWindow: [policy.ageMinMinutes, policy.ageMaxMinutes],
      minVpEffPct: policy.minVpEffPct,
      weights: [policy.baseWeightPct, policy.minWeightPct],
      ref: "docs/measured/t35-probe.json — SP/G-rshares peak 0.000416 @10-30 votes · -55% @150+ (T-35, 96 chain ops)",
    },
    tookMs: Date.now() - t0,
  };
  const receipt = writeLedgerReceipt(payload);

  console.log(JSON.stringify({
    verdict: receipt.verdict, engineHead, selftest: selftest.status,
    vestsPerSP, vpEff: voter.vpEff, scanned: receipt.candidates.scanned,
    selected: receipt.candidates.selected.length, crowded: receipt.candidates.crowded,
    chain: receipt.chain.cur.slice(0, 12), tookMs: receipt.tookMs,
  }));
}

main().catch((e) => failReceipt("UNEXPECTED", { error: String(e?.stack || e).slice(0, 400) }));
