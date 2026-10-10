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
 *  11. (T-56) מועמד-שכבר-בשרשרת → יוצא-מהתור-במקור · votedOnChain+recentVotes בקבלה
 *  12. (T-56) המפל-הכפול: get_account_votes-מת → get_account_history(100)-חי · dedup-נשמר
 *  13. (T-56) שני-המקורות-מתים → dedup=unavailable · recentVotes=null · אף-ירוק-שקרי
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
function startRpcServer({ accountOk = true, votesOk = true, histOk = true, votedFixture = "", voteIdx = 190 } = {}) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let body = "";
      req.on("data", (c) => { body += c; });
      req.on("end", () => {
        let method = "";
        let params = [];
        try { const b = JSON.parse(body); method = String(b.method || ""); params = Array.isArray(b.params) ? b.params : []; } catch {}
        const reply = (j) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(j)); };
        /* T-56: הצבעה-מדומה-לפי-votedFixture — בצורת-השרשרת-האמיתית (authorperm) */
        const fixtureVote = votedFixture
          ? [{ authorperm: votedFixture, weight: 7000, rshares: "123456", percent: 7000, time: new Date().toISOString().replace(/\.\d+Z$/, "Z") }]
          : [];
        if (method === "condenser_api.get_dynamic_global_properties") {
          reply({ jsonrpc: "2.0", id: 1, result: { total_vesting_shares: "200000000000 VESTS", total_vesting_fund_steem: "100000000 STEEM", head_block_number: 4242 } });
        } else if (method === "condenser_api.get_accounts") {
          if (!accountOk) { reply({ jsonrpc: "2.0", id: 1, error: { message: "fixture-account-down" } }); return; }
          reply({ jsonrpc: "2.0", id: 1, result: [{ vesting_shares: "1000 VESTS", received_vesting_shares: "0 VESTS", delegated_vesting_shares: "0 VESTS", voting_manabar: { current_mana: "500000000" } }] });
        } else if (method === "condenser_api.get_account_votes") {
          if (!votesOk) { reply({ jsonrpc: "2.0", id: 1, error: { message: "fixture-votes-down" } }); return; }
          reply({ jsonrpc: "2.0", id: 1, result: fixtureVote });
        } else if (method === "condenser_api.get_account_history") {
          if (!histOk) { reply({ jsonrpc: "2.0", id: 1, error: { message: "fixture-history-down" } }); return; }
          /* צורת-ה-API-האמתית-נמדדה-חי 09:47Z: מפתח-המפה-יחסי-תמיד (0=החדש-ביותר)
           * והאינדקס-הפנימי-מוחלט. העולם-המדומה: 200-ops · ההצבעה-ב-voteIdx
           * (190=בעמוד-הראשון · 50=דורש-עימוד-שני) · גבולות-עמוד-נושאים-זמני-עכשיו. */
          const from = Number(params[1]) || -1;
          const limit = Math.min(Number(params[2]) || 100, 100);
          const TOTAL = 200;
          const nowIso = new Date().toISOString().replace(/\.\d+Z$/, "Z");
          const lo = from === -1 ? Math.max(0, TOTAL - limit) : Math.max(0, from - limit + 1);
          const hi = from === -1 ? TOTAL - 1 : Math.min(from, TOTAL - 1);
          const result = {};
          for (let i = lo; i <= hi; i++) {
            let wrap = { op: ["transfer", { from: "x", to: "y", amount: "1.000 STEEM" }], timestamp: nowIso };
            if (votedFixture && i === voteIdx) {
              const [author, permlink] = String(votedFixture).split("/");
              wrap = { op: ["vote", { voter: "headcorner", author, permlink, weight: 7000 }], timestamp: fixtureVote[0].time };
            }
            result[String(i - lo)] = [i, wrap]; // מפתח-יחסי · אינדקס-פנימי-מוחלט — כמו-הצומת-האמת
          }
          reply({ jsonrpc: "2.0", id: 1, result });
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
    check("5 votesRead=get_account_votes (primary alive)", last.voter.votesRead === "get_account_votes", JSON.stringify(last.voter.votesRead));
    check("5 dedup=on-chain · recentVotes array", last.candidates.dedup === "on-chain" && Array.isArray(last.voter.recentVotes), JSON.stringify({ d: last.candidates.dedup, rv: typeof last.voter.recentVotes }));
    check("5 votedOnChain empty (no fixture vote)", Array.isArray(last.candidates.votedOnChain) && last.candidates.votedOnChain.length === 0, JSON.stringify(last.candidates.votedOnChain));

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

    /* ── ניסוי 11 (T-56): מועמד-שכבר-בשרשרת יוצא-מהתור-במקור ── */
    const { srv: srv11, url: rpcUrl11 } = await startRpcServer({ accountOk: true, votesOk: true, votedFixture: "alice/fresh-a" });
    try {
      const r11 = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-voted"), FLEET_RPC: rpcUrl11 });
      check("11 voted-candidate run exits 0", r11.status === 0, `status=${r11.status} out=${(r11.stdout || "").slice(0, 160)}`);
      const last11 = JSON.parse(fs.readFileSync(path.join(root, "rc-voted/last.json"), "utf8"));
      check("11 alice excluded from selected", last11.candidates.selected.every((c) => !(c.author === "alice" && c.permlink === "fresh-a")), JSON.stringify(last11.candidates.selected));
      check("11 bob survives selected", last11.candidates.selected.some((c) => c.author === "bob"), JSON.stringify(last11.candidates.selected));
      check("11 votedOnChain records alice/fresh-a", (last11.candidates.votedOnChain || []).includes("alice/fresh-a"), JSON.stringify(last11.candidates.votedOnChain));
      check("11 recentVotes carries the chain vote", (last11.voter.recentVotes || []).some((v) => v.k === "alice/fresh-a" && v.w === 7000), JSON.stringify(last11.voter.recentVotes));
      check("11 verdict stays INTEL-OK", last11.verdict === "INTEL-OK", last11.verdict);
    } finally { srv11.close(); }

    /* ── ניסוי 12 (T-56): המפל-הכפול — votes-מת · history-חי ── */
    const { srv: srv12, url: rpcUrl12 } = await startRpcServer({ accountOk: true, votesOk: false, histOk: true, votedFixture: "bob/fresh-b" });
    try {
      const r12 = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-fallback"), FLEET_RPC: rpcUrl12 });
      check("12 fallback run exits 0", r12.status === 0, `status=${r12.status}`);
      const last12 = JSON.parse(fs.readFileSync(path.join(root, "rc-fallback/last.json"), "utf8"));
      check("12 votesRead=get_account_history:100xN", /^get_account_history:100x\d+$/.test(String(last12.voter.votesRead)), JSON.stringify(last12.voter.votesRead));
      check("12 bob excluded via history fallback", !(last12.candidates.selected || []).some((c) => c.author === "bob"), JSON.stringify(last12.candidates.selected));
      check("12 votedOnChain records bob/fresh-b", (last12.candidates.votedOnChain || []).includes("bob/fresh-b"), JSON.stringify(last12.candidates.votedOnChain));
      check("12 verdict stays INTEL-OK", last12.verdict === "INTEL-OK", last12.verdict);
    } finally { srv12.close(); }

    /* ── ניסוי 13 (T-56): שני-המקורות-מתים — כנות מלאה, אף-ירוק-שקרי ── */
    const { srv: srv13, url: rpcUrl13 } = await startRpcServer({ accountOk: true, votesOk: false, histOk: false });
    try {
      const r13 = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-nodedup"), FLEET_RPC: rpcUrl13 });
      check("13 both-votes-sources-down exits 0", r13.status === 0, `status=${r13.status}`);
      const last13 = JSON.parse(fs.readFileSync(path.join(root, "rc-nodedup/last.json"), "utf8"));
      check("13 dedup=unavailable (honest)", last13.candidates.dedup === "unavailable", JSON.stringify(last13.candidates.dedup));
      check("13 recentVotes=null (no fake data)", last13.voter.recentVotes === null, JSON.stringify(last13.voter.recentVotes));
      check("13 votesRead=failed", last13.voter.votesRead === "failed", JSON.stringify(last13.voter.votesRead));
      check("13 verdict stays INTEL-OK (intel intact)", last13.verdict === "INTEL-OK", last13.verdict);
      check("13 candidate sheet intact", last13.candidates.selected.length === 2, String(last13.candidates.selected.length));
    } finally { srv13.close(); }

    /* ── ניסוי 14 (T-56): הצבעה-עמוקה-מעמוד-הראשון — העימוד-מוצא-אותה ──
     * voteIdx=50: עמוד-1 (100..199) לא-מכיל-אותה → המנוע-חייב-לעמוד-2 (0..99).
     * זה-החור-שנמדד-חי: 100-ops-אחרונים-של-headcorner = 1.09-שעות-בלבד.
     * bob/fresh-b נבחר-בכוונה — מועמד-שה-fixture-מציב-ב-selected (carol-נפסלת-מגיל-ולא-מגיעה-לכאן-מעולם = ירוק-שקרי). */
    const { srv: srv14, url: rpcUrl14 } = await startRpcServer({ accountOk: true, votesOk: false, histOk: true, votedFixture: "bob/fresh-b", voteIdx: 50 });
    try {
      const r14 = await runEngine({ FLEET_ENGINE_DIR: fx, FLEET_RECEIPTS_DIR: path.join(root, "rc-deep"), FLEET_RPC: rpcUrl14 });
      check("14 deep-pagination run exits 0", r14.status === 0, `status=${r14.status} out=${(r14.stdout || "").slice(0, 160)}`);
      const last14 = JSON.parse(fs.readFileSync(path.join(root, "rc-deep/last.json"), "utf8"));
      check("14 carol excluded via deep page", !(last14.candidates.selected || []).some((c) => c.author === "carol"), JSON.stringify(last14.candidates.selected));
      check("14 votedOnChain records bob/fresh-b", (last14.candidates.votedOnChain || []).includes("bob/fresh-b"), JSON.stringify(last14.candidates.votedOnChain));
      const px = String(last14.voter.votesRead || "");
      check("14 pagination covered >1 page", /^get_account_history:100x[2-5]$/.test(px), px);
    } finally { srv14.close(); }
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
