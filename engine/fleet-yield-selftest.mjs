#!/usr/bin/env node
/* fleet-yield-selftest.mjs — עורק-התשואה · מקלחת-אופליינית (T-45 · agent-4)
 * ═══════════════════════════════════════════════════════════════════════════
 * אפס-רשת-חוץ (שרת-RPC מדומה בתוך-התהליך) · אפס-שעון-אמת (מנוע-מדומה) ·
 * אפס-מפתחות. הנבדק=הדבק שלי (engine/fleet-yield.mjs) — חוקי-ה-curator עצמם
 * נבדקים ב-selftest של-המנוע (1218 וקטורים, השער-חי-בעורק).
 *
 * הניסויים:
 *   1. מנוע-חסר → ENGINE-MISSING · יציאה 1 (fail-closed)
 *   2. selftest-אדום של-המנוע → SELFTEST-GATE-RED · יציאה 1
 *   3. selftest-לא-ניתן-לפענוח → SELFTEST-GATE-RED (UNPARSED) · יציאה 1
 *   4. RPC-מת → RPC-DGPO-FAIL · יציאה 1 (אף-נתון-מזויף)
 *   5. דרך-מאושרת מלאה → INTEL-OK · vestsPerSP=2000 · vpEff=50 · מתוזמן-מדויק
 *   6. קיפול-שרשרת: ריצה-שנייה → chain.prev = chain.cur-הקודם · יומן=2-שורות
 *   7. סבוב-יומן: FLEET_LOG_MAX=3 → אחרי-4-ריצות ≤3-שורות · הקבלה-טרייה
 *   8. אטומיות: אפס-שאריות .tmp בתיקיית-הקבלות
 *   9. קריאת-חשבון-נכשלת → INTEL-PARTIAL · יציאה 0 · התבונה-ממשיכה (כנות)
 *  10. ניקיון-סודות במקורותיי — אפס-דפוסי-טוקן/WIF/cred-url
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_MJS = path.join(HERE, "fleet-yield.mjs");

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra = "") {
  if (cond) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; failures.push(name); console.log(`  FAIL ${name}${extra ? " — " + extra : ""}`); }
}

/* ── מנוע-מדומה: fixture עם חוזה-הייצוא של curator.mjs ──────────────────── */
const FIXTURE_POLICY = {
  enabled: true, maxPerDay: 30, maxVotesPerCycle: 3, maxPostVotes: 100,
  minVpEffPct: 35, baseWeightPct: 70, minWeightPct: 35,
  ageMinMinutes: 10, ageMaxMinutes: 240, minBodyChars: 600,
  maxPendingSbd: 30, fetchLimit: 50,
  tags: ["steem", "ai"], excludeAccounts: ["headcorner", "hcsoldier1"],
};
const FIXTURE_POSTS = [
  { author: "alice", permlink: "fresh-a", tag: "steem", voteCount: 20, tooYoung: false },
  { author: "bob", permlink: "fresh-b", tag: "ai", voteCount: 45, tooYoung: false },
  { author: "whale-bait", permlink: "crowded-c", tag: "steem", voteCount: 160, tooYoung: false },
  { author: "carol", permlink: "young-d", tag: "ai", voteCount: 3, tooYoung: true },
];
function writeFixture(root, selftestMode) {
  fs.mkdirSync(path.join(root, "mini-services/saos-engine"), { recursive: true });
  fs.writeFileSync(path.join(root, "mini-services/saos-engine/lib.mjs"), "/* fixture presence */\n");
  fs.writeFileSync(path.join(root, "mini-services/saos-engine/curator.mjs"), `
export function curatorPolicy() { return ${JSON.stringify(FIXTURE_POLICY)}; }
export function effectiveVests(acc) {
  const n = (s) => Number(String(s ?? "0").split(" ")[0].replace(/,/g, "")) || 0;
  return Math.max(0, n(acc.vesting_shares) + n(acc.received_vesting_shares) - n(acc.delegated_vesting_shares));
}
export function vpEffPct(mana, vests) {
  if (!(vests > 0) || !(mana >= 0)) return null;
  return Math.round((mana / (vests * 1e6)) * 1000) / 10;
}
export async function fetchCandidates(policy, voter, nowMs) {
  return { ok: true, posts: ${JSON.stringify(FIXTURE_POSTS)}.map((p, i) => ({
    author: p.author, permlink: p.permlink, tag: p.tag, createdMs: nowMs - 30 * 60000,
    title: "fixture " + i, bodyLen: 900, voteCount: p.voteCount, pendingSbd: 5,
    archived: false, votedByUs: false, tooYoung: p.tooYoung === true,
  })) };
}
export function filterCandidates({ posts, policy }) {
  const selected = []; const rejected = [];
  for (const post of posts) {
    const key = post.author + "/" + post.permlink;
    if (Number.isFinite(policy.maxPostVotes) && (post.voteCount ?? 0) > policy.maxPostVotes) { rejected.push({ key, reason: "crowded" }); continue; }
    if (post.tooYoung) { rejected.push({ key, reason: "too-young" }); continue; }
    selected.push({ author: post.author, permlink: post.permlink, weight: 7000, ageMinutes: 30, tag: post.tag ?? null });
  }
  return { selected, rejected, dayCapReached: false };
}
`);
  fs.writeFileSync(path.join(root, "mini-services/saos-engine/selftest.mjs"), `
const mode = process.env.FIX_SELFTEST_MODE || "pass";
if (mode === "unparsed") { console.log("nothing to see here"); process.exit(0); }
if (mode === "fail") { console.log("SELFTEST 8/9 FAIL"); process.exit(1); }
console.log("SELFTEST 9/9 PASS"); process.exit(0);
`);
}

/* ── שרת-RPC מדומה (תוך-התהליך) ─────────────────────────────────────────── */
function startRpcServer({ accountOk = true } = {}) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let body = "";
      req.on("data", (c) => { body += c; });
      req.on("end", () => {
        let method = "";
        try { method = String(JSON.parse(body).method || ""); } catch {}
        const reply = (j) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(j)); };
        if (method === "condenser_api.get_dynamic_global_properties") {
          reply({ jsonrpc: "2.0", id: 1, result: { total_vesting_shares: "200000000000 VESTS", total_vesting_fund_steem: "100000000 STEEM", head_block_number: 4242 } });
        } else if (method === "condenser_api.get_accounts") {
          if (!accountOk) { reply({ jsonrpc: "2.0", id: 1, error: { message: "fixture-account-down" } }); return; }
          reply({ jsonrpc: "2.0", id: 1, result: [{ vesting_shares: "1000 VESTS", received_vesting_shares: "0 VESTS", delegated_vesting_shares: "0 VESTS", voting_manabar: { current_mana: "500000000" } }] });
        } else {
          reply({ jsonrpc: "2.0", id: 1, error: { message: "unknown-method" } });
        }
      });
    });
    srv.listen(0, "127.0.0.1", () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/* אסינכרוני-חובה: spawnSync-היה-חוסם-את-לולאת-האב — ושרת-ה-RPC-המדומה-חי-באב.
 * הילד-שולח-בקשה, האב-חסום → הבקשה-תמיד-נחתכת. spawn משאיר-את-הלולאה-חיה. */
function runEngine(env, timeoutMs = 60000) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [ENGINE_MJS], { env: { ...process.env, ...env } });
    let out = "", err = "";
    const t = setTimeout(() => { try { p.kill("SIGKILL"); } catch {} }, timeoutMs);
    p.stdout.on("data", (c) => { out += c; });
    p.stderr.on("data", (c) => { err += c; });
    p.on("close", (code) => { clearTimeout(t); resolve({ status: code, stdout: out, stderr: err }); });
    p.on("error", (e) => { clearTimeout(t); resolve({ status: null, stdout: out, stderr: String(e) }); });
  });
}

async function main() {
  console.log("fleet-yield-selftest — offline drills (fixture engine, in-process rpc)\n");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fleet-yield-st-"));

  /* ── ניסוי 1: מנוע-חסר (+ קבלה-אדומה-מקופלת-לפנקס, לקח-T-44) ── */
  {
    const rcM = path.join(root, "rc-missing");
    const r = await runEngine({ FLEET_ENGINE_DIR: path.join(root, "no-such-engine"), FLEET_RECEIPTS_DIR: rcM });
    check("1 engine-missing exits 1", r.status === 1, `status=${r.status}`);
    check("1 verdict=ENGINE-MISSING", /ENGINE-MISSING/.test(r.stdout || ""), (r.stdout || "").slice(0, 120));
    const red = JSON.parse(fs.readFileSync(path.join(rcM, "last.json"), "utf8"));
    check("1 red receipt lands in ledger", red.verdict === "ENGINE-MISSING" && /^[0-9a-f]{64}$/.test(red.chain?.cur || ""), JSON.stringify(red).slice(0, 160));
  }

  /* ── ניסוי 2: selftest-אדום של-המנוע ── */
  {
    const fx = path.join(root, "fx-red");
    writeFixture(fx, "fail");
    const r = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-red"), FLEET_RPC: "http://127.0.0.1:9", FIX_SELFTEST_MODE: "fail" });
    check("2 red-selftest exits 1", r.status === 1, `status=${r.status}`);
    check("2 verdict=SELFTEST-GATE-RED", /SELFTEST-GATE-RED/.test(r.stdout || ""), (r.stdout || "").slice(0, 120));
    const red2 = JSON.parse(fs.readFileSync(path.join(root, "rc-red", "last.json"), "utf8"));
    check("2 red receipt lands in ledger", red2.verdict === "SELFTEST-GATE-RED" && red2.selftest?.status === "FAIL", JSON.stringify(red2).slice(0, 160));
  }

  /* ── ניסוי 3: selftest-לא-ניתן-לפענוח ── */
  {
    const fx = path.join(root, "fx-unparsed");
    writeFixture(fx, "unparsed");
    const r = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-unparsed"), FLEET_RPC: "http://127.0.0.1:9", FIX_SELFTEST_MODE: "unparsed" });
    check("3 unparsed-selftest exits 1", r.status === 1, `status=${r.status}`);
    check("3 verdict=SELFTEST-GATE-RED(UNPARSED)", /SELFTEST-GATE-RED/.test(r.stdout || "") && /UNPARSED/.test(r.stdout || ""), (r.stdout || "").slice(0, 160));
  }

  /* ── ניסוי 4: RPC-מת — fail-closed, אף-נתון-מזויף ── */
  {
    const fx = path.join(root, "fx-deadrpc");
    writeFixture(fx, "pass");
    const r = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-deadrpc"), FLEET_RPC: "http://127.0.0.1:9" });
    check("4 dead-rpc exits 1", r.status === 1, `status=${r.status}`);
    check("4 verdict=RPC-DGPO-FAIL", /RPC-DGPO-FAIL/.test(r.stdout || ""), (r.stdout || "").slice(0, 120));
  }

  /* ── ניסוי 5: דרך-מאושרת מלאה (שרת-מדומה חי) ── */
  const { srv, url: rpcUrl } = await startRpcServer({ accountOk: true });
  try {
    const fx = path.join(root, "fx-happy");
    writeFixture(fx, "pass");
    const rc = path.join(root, "rc-happy");
    const r = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: rc, FLEET_RPC: rpcUrl });
    check("5 happy-path exits 0", r.status === 0, `status=${r.status} out=${(r.stdout || "").slice(0, 240)} err=${(r.stderr || "").slice(0, 200)}`);
    if (r.status !== 0) {
      console.log("  skip 5-9 dependent drills (honest — happy path fell)");
    } else {
    const last = JSON.parse(fs.readFileSync(path.join(rc, "last.json"), "utf8"));
    check("5 verdict=INTEL-OK", last.verdict === "INTEL-OK", last.verdict);
    check("5 vestsPerSP=2000", last.state.vestsPerSP === 2000, String(last.state.vestsPerSP));
    check("5 vpEff=50", last.voter.vpEff === 50, String(last.voter.vpEff));
    check("5 selftest 9/9 PASS in receipt", last.selftest.passed === 9 && last.selftest.total === 9 && last.selftest.status === "PASS", JSON.stringify(last.selftest));
    check("5 scanned=4", last.candidates.scanned === 4, String(last.candidates.scanned));
    check("5 selected=2", last.candidates.selected.length === 2, String(last.candidates.selected.length));
    check("5 crowded rejection present", last.candidates.crowded >= 1 && last.candidates.rejectedTop.some((s) => s.endsWith(":crowded")), JSON.stringify(last.candidates.rejectedTop));
    check("5 engineHead=null (non-git fixture, honest)", last.engineHead === null, String(last.engineHead));
    check("5 chain.cur 64-hex", /^[0-9a-f]{64}$/.test(last.chain.cur || ""));
    check("5 chain.prev=null (genesis)", last.chain.prev === null);
    check("5 laws recorded (maxPostVotes=100)", last.laws.maxPostVotes === 100, JSON.stringify(last.laws));

    /* ── ניסוי 6: קיפול-שרשרת ── */
    const first = JSON.parse(JSON.stringify(last));
    const r2 = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: rc, FLEET_RPC: rpcUrl });
    const last2 = JSON.parse(fs.readFileSync(path.join(rc, "last.json"), "utf8"));
    check("6 second run exits 0", r2.status === 0);
    check("6 chain.prev = first chain.cur", last2.chain.prev === first.chain.cur, `${last2.chain.prev} vs ${first.chain.cur}`);
    const logLines = fs.readFileSync(path.join(rc, "log.jsonl"), "utf8").split("\n").filter(Boolean);
    check("6 log has 2 lines", logLines.length === 2, String(logLines.length));

    /* ── ניסוי 7: סבוב-יומן ── */
    const rcRot = path.join(root, "rc-rot");
    for (let i = 0; i < 4; i++) {
      await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: rcRot, FLEET_RPC: rpcUrl, FLEET_LOG_MAX: "3" });
    }
    const rotLines = fs.readFileSync(path.join(rcRot, "log.jsonl"), "utf8").split("\n").filter(Boolean);
    check("7 rotation keeps <=3 lines", rotLines.length <= 3, String(rotLines.length));
    const rotLast = JSON.parse(fs.readFileSync(path.join(rcRot, "last.json"), "utf8"));
    const rotTail = JSON.parse(rotLines[rotLines.length - 1]);
    check("7 last.json matches log tail", rotTail.chain.cur === rotLast.chain.cur, "log tail != last.json");

    /* ── ניסוי 8: אטומיות — אפס-שאריות .tmp ── */
    const leftovers = fs.readdirSync(rc).filter((f) => f.includes(".tmp."));
    check("8 no .tmp leftovers", leftovers.length === 0, leftovers.join(","));

    /* ── ניסוי 9: קריאת-חשבון-נכשלת → INTEL-PARTIAL · יציאה 0 ── */
    const { srv: srv2, url: rpcUrl2 } = await startRpcServer({ accountOk: false });
    try {
      const r9 = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-partial"), FLEET_RPC: rpcUrl2 });
      check("9 account-read-failed exits 0", r9.status === 0, `status=${r9.status} out=${(r9.stdout || "").slice(0, 160)} err=${(r9.stderr || "").slice(0, 160)}`);
      const last9 = JSON.parse(fs.readFileSync(path.join(root, "rc-partial/last.json"), "utf8"));
      check("9 verdict=INTEL-PARTIAL", last9.verdict === "INTEL-PARTIAL", last9.verdict);
      check("9 voter.status=read-failed", last9.voter.status === "read-failed", JSON.stringify(last9.voter));
      check("9 candidate sheet still full", last9.candidates.scanned === 4 && last9.candidates.selected.length === 2, JSON.stringify({ s: last9.candidates.scanned, sel: last9.candidates.selected.length }));
    } finally { srv2.close(); }
    } /* סגירת-else-של-דרך-מאושרת */
  } finally { srv.close(); }

  /* ── ניסוי 10: ניקיון-סודות במקורותיי ── */
  {
    const secretRe = [
      /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/, /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
      /\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b/, /https?:\/\/[^\s:@/]+:[^\s@/]*@/,
    ];
    const src = fs.readFileSync(ENGINE_MJS, "utf8") + fs.readFileSync(path.join(HERE, "fleet-yield-selftest.mjs"), "utf8");
    check("10 zero secret patterns in my sources", !secretRe.some((re) => re.test(src)));
  }

  fs.rmSync(root, { recursive: true, force: true });

  const total = passed + failed;
  console.log(`\nFLEET-YIELD-SELFTEST ${passed}/${total} ${failed === 0 ? "PASS" : "FAIL"}`);
  if (failed > 0) { console.log("failures: " + failures.join(" · ")); process.exit(1); }
  process.exit(0);
}

main().catch((e) => { console.error("SELFTEST-CRASH", e); process.exit(1); });
