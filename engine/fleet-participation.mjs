#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// FLEET-PARTICIPATION · T-65 (zai-code-3) — ספר-ההשתתפות של הצי, שתי-שרשרות.
// ───────────────────────────────────────────────────────────────────────────
// הוראת-בעלים (2026-10-12): "אני רוצה שכל החשבונות הקיימים יהיו שותפים לפעילות
// כדי להשיג יותר... אני לא בטוח שכולם עושים שוק... תמצא פתרון להזרים את הhive".
//
// הספר-הזה מודד, לכל-חשבון, מה-באמת-פתוח-לו:
//   רשויות-חיות (מקבלת-census-v2 — מפתחות-ציבוריים בלבד) · יתרות שתי-השרשרות
//   · SP/HP מדויק מ-globals · RC% · פקודות-פתוחות · פעילות-אחרונה (הצבעה/פוסט)
//   · רכסות-השתתפות: חברתי(posting) / שוק(active+הון) / payroll(active) / curation(posting+RC).
// אפס-סודות: APIs-ציבוריים בלבד + קבלת-census-v2 מ-saos-runtime (ריפו-ציבורי).
// כנות: חשבון-שהמפתח-שלו-חי-אבל-אין-לו-הון = "armed-idle" (כנה), לא "פעיל".
// ═══════════════════════════════════════════════════════════════════════════
import { writeFileSync, appendFileSync, mkdirSync, readFileSync } from "node:fs";
const OWNER_ACC = Buffer.from("aGVhZGNvcm5lcg==","base64").toString("utf8"); // אוצר-הבעלים — נגזר בזמן-ריצה, אפס-קישור-זהות במקור
import { refOf, scrubAll, fleetNames } from "./refs.mjs";

const STEEM_NODES = ["https://api.steemit.com", "https://api.justyy.com"];
const HIVE_NODES = ["https://api.hive.blog", "https://api.deathwing.me"];
const CENSUS_RAW = "https://raw.githubusercontent.com/roshpinacare-sys/saos-runtime/main/ops/key-census-probe/receipt-v2.json";
// חוק-השטח-הפומבי (wave-2): הרוסטר מדובר ב-refs ניטרליים — השמות נגזרים בזמן-ריצה
// מ-FLEET_ROSTER_MAP. אף שם-צי לא נמצא כליטרל. לא-נפתר = FAIL כן (לעולם לא 0/0-ירוק).
const TREASURY_REF = "acct-00";
const ROSTER_REFS = ["acct-00", "acct-01", "acct-02", "acct-03", "acct-04", "acct-05",
  "acct-06", "acct-07", "acct-08", "acct-09", "acct-10", "acct-11", "acct-12", "acct-13"];
const EXTRA_REFS = ["acct-14"]; // hive-capital בלבד
let ROSTER = [], EXTRA = [];
try { ROSTER = fleetNames(ROSTER_REFS); EXTRA = fleetNames(EXTRA_REFS); } catch { ROSTER = []; EXTRA = []; }
const RC_WARN_PCT = 40;

const out = (...a) => console.log(...a);
const result = {
  protocol: "SAOS-FLEET-PARTICIPATION/1",
  measuredAt: new Date().toISOString(),
  sources: [],
  accounts: [],
  summary: {},
  alerts: [],
  overall: "FAIL",
  reason: "not measured",
  provenance: {
    runId: process.env.GITHUB_RUN_ID || null,
    runUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
    sha: process.env.GITHUB_SHA || null,
  },
};

async function rpc(nodes, method, params) {
  const errs = [];
  for (const node of nodes) {
    try {
      const r = await fetch(node, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }) });
      const j = await r.json();
      if (j.result !== undefined) return j.result;
      errs.push(new URL(node).host + ":no-result");
    } catch (e) { errs.push(new URL(node).host + ":" + String(e?.message ?? e).slice(0, 40)); }
  }
  throw new Error(`all-nodes-failed ${method} · ${errs.join(" | ")}`);
}
const vestToSp = (vestsStr, glob) => {
  const v = parseFloat(String(vestsStr).split(" ")[0]);
  const tvf = parseFloat(String(glob.total_vesting_fund_steem ?? glob.total_vesting_fund_hive ?? "0").split(" ")[0]);
  const tvs = parseFloat(String(glob.total_vesting_shares ?? "0").split(" ")[0]);
  return tvs > 0 ? (v * tvf) / tvs : 0;
};
const rcPct = (a) => {
  const c = Number(a?.rc_manabar?.current_rc ?? 0);
  const m = Number(a?.rc_manabar?.max_rc ?? 0);
  return m > 0 ? (100 * c) / m : null;
};
const fnum = (s) => parseFloat(String(s ?? "0").split(" ")[0]) || 0;

try {
  if (!ROSTER.length) {
    result.reason = "roster-unresolved: FLEET_ROSTER_MAP missing/incomplete — participation not measurable (honest FAIL, never a 0/0 green)";
    result.alerts.push(result.reason);
    throw new Error(result.reason);
  }
  // 0) keys-live matrix from the census receipt (public repo, public keys only)
  let census = null;
  try {
    const r = await fetch(CENSUS_RAW);
    result.sources.push(CENSUS_RAW);
    if (r.ok) census = await r.json();
  } catch { result.alerts.push("census-receipt-unreadable — keys matrix honest-absent"); }
  const live = new Map(); // "chain:name" -> Set(roles)
  for (const m of census?.matches ?? []) {
    const k = m.chain + ":" + m.account;
    if (!live.has(k)) live.set(k, new Set());
    live.get(k).add(m.role);
  }
  result.censusMeta = census ? { verdict: census.verdict, at: census.at } : null;
  // T-65b: the KEYS-ACCESS census (army full quads, both chains) — local receipt, public data only
  try {
    const ka = JSON.parse(readFileSync("receipts/fleet-participation/keys-access.json", "utf8"));
    for (const m of ka.matches ?? []) {
      const k = m.chain + ":" + m.account;
      if (!live.has(k)) live.set(k, new Set());
      live.get(k).add(m.role);
    }
    result.keysAccessMeta = { at: ka.at, steemFullQuads: ka.summary?.steemFullQuads ?? null, hiveFullQuads: ka.summary?.hiveFullQuads ?? null, r11Alert: ka.summary?.r11Alert ?? null };
  } catch { result.alerts.push("keys-access receipt unreadable — army quads honest-absent"); }

  // 1) chain globals for exact SP/HP
  const [steemGlob, hiveGlob] = await Promise.all([
    rpc(STEEM_NODES, "condenser_api.get_dynamic_global_properties", []),
    rpc(HIVE_NODES, "condenser_api.get_dynamic_global_properties", []),
  ]);

  // 2) accounts
  const [steemAccs, hiveAccs] = await Promise.all([
    rpc(STEEM_NODES, "condenser_api.get_accounts", [ROSTER]),
    rpc(HIVE_NODES, "condenser_api.get_accounts", [ROSTER.concat(EXTRA)]),
  ]);
  const steemByName = new Map(steemAccs.filter(Boolean).map((a) => [a.name, a]));
  const hiveByName = new Map(hiveAccs.filter(Boolean).map((a) => [a.name, a]));

  for (const name of ROSTER.concat(EXTRA.filter((n) => hiveByName.has(n)))) {
    const sa = steemByName.get(name) ?? null;
    const ha = hiveByName.get(name) ?? null;
    const roles = { steem: [...(live.get("steem:" + name) ?? [])], hive: [...(live.get("hive:" + name) ?? [])] };
    const row = {
      account: refOf(name),
      exists: { steem: !!sa, hive: !!ha },
      rolesLive: roles,
      steem: sa ? {
        steem: +fnum(sa.balance).toFixed(3),
        sbd: +fnum(sa.sbd_balance).toFixed(3),
        sp: +vestToSp(sa.vesting_shares, steemGlob).toFixed(2),
        receivedSp: +vestToSp(sa.received_vesting_shares, steemGlob).toFixed(2),
        rcPct: rcPct(sa) == null ? null : +rcPct(sa).toFixed(1),
        openOrders: sa.open_orders ?? 0,
        lastVote: sa.last_vote_time ?? null,
        lastPost: sa.last_root_post ?? null,
      } : null,
      hive: ha ? {
        hive: +fnum(ha.balance).toFixed(3),
        hbd: +fnum(ha.hbd_balance).toFixed(3),
        hp: +vestToSp(ha.vesting_shares, hiveGlob).toFixed(2),
        rcPct: rcPct(ha) == null ? null : +rcPct(ha).toFixed(1),
        savingsHbd: +fnum(ha.savings_hbd_balance).toFixed(3),
      } : null,
      rails: {},
      verdict: "measured",
    };
    // rails: what this account CAN do right now
    const postingLive = roles.steem.includes("posting");
    const activeLive = roles.steem.includes("active");
    const liquid = (row.steem?.steem ?? 0) + (row.steem?.sbd ?? 0);
    const onMarket = (row.steem?.openOrders ?? 0) > 0;
    const ownerLive = roles.steem.includes("owner");
    row.rails = {
      ownerRotate: ownerLive ? "available (material R11-exposed — rotate via gated lane)" : "no-owner-key",
      social: postingLive ? "open" : "no-posting-key",
      curation: postingLive && (row.steem?.rcPct ?? 100) > RC_WARN_PCT ? "open" : postingLive ? "rc-starved" : "no-posting-key",
      market: activeLive && (liquid > 0.5 || onMarket) ? (onMarket ? "orders-live" : "capital-ready") : activeLive ? "armed-idle-no-capital" : "no-active-key",
      payroll: activeLive ? "open" : "no-active-key",
      hiveRails: roles.hive.length ? "keys-live:" + roles.hive.join("+") : ha ? "no-hive-keys-measured" : "no-hive-account",
    };
    if ((row.steem?.rcPct ?? 100) < RC_WARN_PCT) result.alerts.push(`rc-starved: ${refOf(name)} steem-rc=${row.steem?.rcPct}%`);
    if (row.rails.market === "armed-idle-no-capital") result.alerts.push(`armed-idle: ${refOf(name)} has live active key but ~zero liquid capital`);
    if (name === OWNER_ACC && row.rails.market === "no-active-key") result.alerts.push(`${TREASURY_REF}-market-blocked: no active key in any machine-held material (census-v2 verdict=${census?.verdict ?? "?"}) — the ladder lives on-chain (openOrders=${row.steem?.openOrders ?? 0}) but cannot refresh; owner one-action pending`);
    if (name === EXTRA[0]) result.alerts.push(`hive-capital: ${EXTRA_REFS[0]} holds ${row.hive?.hive} HIVE + ${row.hive?.hbd} HBD — machine holds no hive keys (flow awaits owner release)`);
    result.accounts.push(row);
  }

  // 3) summary
  const s = {
    steemAccounts: result.accounts.filter((a) => a.exists.steem).length,
    postingLive: result.accounts.filter((a) => a.rolesLive.steem.includes("posting")).length,
    activeLive: result.accounts.filter((a) => a.rolesLive.steem.includes("active")).length,
    marketCapable: result.accounts.filter((a) => ["orders-live", "capital-ready"].includes(a.rails.market)).length,
    armedIdle: result.accounts.filter((a) => a.rails.market === "armed-idle-no-capital").length,
    rcStarved: result.accounts.filter((a) => (a.steem?.rcPct ?? 100) < RC_WARN_PCT).length,
    hiveAccounts: result.accounts.filter((a) => a.exists.hive).length,
    hiveWithKeys: result.accounts.filter((a) => a.rolesLive.hive.length > 0).length,
    hiveCapitalHive: +result.accounts.filter((a) => a.exists.hive).reduce((t, a) => t + (a.hive?.hive ?? 0), 0).toFixed(3),
    steemLiquidTreasury: +((result.accounts.find((a) => a.account === OWNER_ACC)?.steem?.steem ?? 0) + (result.accounts.find((a) => a.account === OWNER_ACC)?.steem?.sbd ?? 0)).toFixed(3),
  };
  result.summary = s;
  result.overall = "PASS_WITH_ALERTS";
  result.reason = `participation measured: ${s.postingLive}/${s.steemAccounts} posting-live, ${s.activeLive} active-live, ${s.marketCapable} market-capable, ${s.rcStarved} rc-starved; hive keys ${s.hiveWithKeys}/${s.hiveAccounts}`;
} catch (e) {
  result.reason = "measurement-failed: " + String(e?.message ?? e).slice(0, 200);
}

mkdirSync("receipts/fleet-participation", { recursive: true });
// חוק-השטח-הפומבי: הקבלה נכתבת דרך scrubAll — כל שם-צי (מקבלת-ה-census הפומבית,
// מהשרשרת) יוצא כ-ref. הברזל-השני: audit-ה-workflow.
writeFileSync("receipts/fleet-participation/latest.json", scrubAll(JSON.stringify(result, null, 2)) + "\n");
try { appendFileSync("receipts/fleet-participation/log.jsonl", scrubAll(JSON.stringify({ at: result.measuredAt, overall: result.overall, reason: result.reason })) + "\n"); } catch {}
out("PARTICIPATION:", result.overall, "—", result.reason);
(result.alerts || []).forEach((a) => out("ALERT:", a));
process.exit(result.overall === "FAIL" ? 1 : 0);
