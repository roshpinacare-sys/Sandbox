#!/usr/bin/env node
/* blurt-probe.mjs — Stage-0 READ-ONLY multi-node health probe of the Blurt
 * network (task 9-d). Companion to probes/hive-probe.mjs.
 *
 * חוקי-המסילה:
 *   · אפס-מפתחות, אפס-אימות, אפס-שידור — קריאות-ציבוריות בלבד.
 *   · No keys, no auth, zero broadcast — public chain READs only.
 *   · fail-open-honest: failures exit non-zero with the honest error.
 *     אף-פעם לא מזויף-הצלחה.
 *
 * AUDIENCE / INTEL NOTE: the per-node health table below is exactly the
 * intel the R294 agent asked for when the fleet measured rpc.blurt.blog 403
 * from the sandbox (their failover chain lives in
 * steem@saos-cockpit · mini-services/saos-engine/blurt.mjs · BLURT_NODES).
 * THIS PROBE IS ADVISORY ONLY — it NEVER touches blurt.mjs, the
 * requiresArmFile ceremony, or state/blurt-arm.json. טקס-החימוש של R294
 * נשאר כפי-שהוא.
 *
 * Methods (all public condenser reads; graphene wants ARRAY params):
 *   condenser_api.get_dynamic_global_properties []
 *   condenser_api.get_block [head]               (staleness cross-check)
 *   condenser_api.get_witnesses_by_vote ["",10]
 *   condenser_api.get_account_count []
 *   condenser_api.get_witness_count []
 * Measured absent on Blurt (2026-10-11, saboin node): get_feed_history,
 * get_order_book — Blurt carries no debt asset / no exposed internal-market
 * API on public nodes. Recorded honestly as a Stage-1 limitation.
 *
 * Usage:
 *   node probes/blurt-probe.mjs             # live → digest file + stdout
 *   node probes/blurt-probe.mjs --selftest  # mocked-fetch vectors
 * Exit codes: 0 = digest.ok (≥1 node healthy); 1 = honest failure.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DIGEST_DIR = path.join(DIR, "blurt");

/** Probe candidates — ALIVE-FIRST, dead endpoints kept as canaries so the
 * fleet learns the moment one revives. Order mirrors the R294 failover
 * chain (saboin, then blurt.blog); canaries after.
 * Measured 2026-10-11 from sandbox: saboin 200 OK, blurt.blog 200 OK,
 * blurt.world NXDOMAIN, blurtlatam TLS-eof. */
export const BLURT_ENDPOINTS = [
  "https://blurt-rpc.saboin.com",
  "https://rpc.blurt.blog",
  "https://rpc.blurt.world",
  "https://blurt-rpc.blurtlatam.com",
];

const TIMEOUT_MS = 10000;
const RETRIES = 2;
const BLOCK_TIME_TOLERANCE_S = 30;

/** One JSON-RPC call against one endpoint. Retries idempotent reads.
 * Returns {ok:true,ms,result} or {ok:false,ms,error} — never throws. */
export async function rpcCall(endpoint, method, params, opts = {}) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_MS;
  const retries = Math.max(1, opts.retries ?? RETRIES);
  const t0 = Date.now();
  let lastErr = "unknown";
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`http_${res.status}`);
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("non_json_response");
      }
      if (json && json.error) {
        const msg =
          json.error.message ?? JSON.stringify(json.error).slice(0, 140);
        throw new Error(`rpc_error: ${msg}`);
      }
      if (!json || !("result" in json)) throw new Error("missing_result");
      return { ok: true, ms: Date.now() - t0, result: json.result };
    } catch (e) {
      lastErr = e && e.message ? e.message : String(e);
    }
  }
  return { ok: false, ms: Date.now() - t0, error: lastErr };
}

function naiAmount(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "amount" in v) return String(v.amount);
  return String(v);
}

function trimDgp(d) {
  if (!d || typeof d !== "object") return null;
  return {
    head_block_number: d.head_block_number ?? null,
    head_block_id: d.head_block_id ?? null,
    time: d.time ?? null,
    current_witness: d.current_witness ?? null,
    current_supply: naiAmount(d.current_supply),
    total_vesting_fund_blurt: naiAmount(d.total_vesting_fund_blurt),
    total_vesting_shares: naiAmount(d.total_vesting_shares),
  };
}

/** Seconds between the head-block timestamp and dgp.time (node-lag check). */
export function blockTimeSkew(dgp, block) {
  if (!dgp?.time || !block?.timestamp) return null;
  const a = Date.parse(dgp.time + "Z");
  const b = Date.parse(block.timestamp + "Z");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.abs(a - b) / 1000;
}

/** Health-check ONE node through the full read ladder. Never throws. */
export async function probeNode(node, opts = {}) {
  const entry = {
    node,
    alive: false,
    ms: null,
    head_block_number: null,
    block_time_match: null,
    calls: {},
    error: null,
  };
  const t0 = Date.now();
  const dgp = await rpcCall(node, "condenser_api.get_dynamic_global_properties", [], opts);
  entry.calls.dgp = dgp.ok ? { ok: true, ms: dgp.ms } : { ok: false, error: dgp.error };
  if (!dgp.ok) {
    entry.error = dgp.error;
    entry.ms = Date.now() - t0;
    return entry;
  }
  entry.alive = true;
  entry.ms = Date.now() - t0;
  const d = dgp.result;
  entry.head_block_number = d?.head_block_number ?? null;
  entry.head_block_time = d?.time ?? null;
  entry.network = trimDgp(d);

  const [block, witnesses, accounts, witnessCount] = await Promise.all([
    rpcCall(node, "condenser_api.get_block", [entry.head_block_number], opts),
    rpcCall(node, "condenser_api.get_witnesses_by_vote", ["", 10], opts),
    rpcCall(node, "condenser_api.get_account_count", [], opts),
    rpcCall(node, "condenser_api.get_witness_count", [], opts),
  ]);
  entry.calls.block = block.ok ? { ok: true, ms: block.ms } : { ok: false, error: block.error };
  entry.calls.top_witnesses = witnesses.ok
    ? { ok: true, ms: witnesses.ms, count: Array.isArray(witnesses.result) ? witnesses.result.length : 0 }
    : { ok: false, error: witnesses.error };
  entry.calls.account_count = accounts.ok ? { ok: true, ms: accounts.ms } : { ok: false, error: accounts.error };
  entry.calls.witness_count = witnessCount.ok ? { ok: true, ms: witnessCount.ms } : { ok: false, error: witnessCount.error };

  if (block.ok) {
    const skew = blockTimeSkew(d, block.result);
    entry.block_time_match = skew != null && skew <= BLOCK_TIME_TOLERANCE_S;
    entry.block_skew_s = skew == null ? null : Math.round(skew * 1000) / 1000;
  }
  if (witnesses.ok && Array.isArray(witnesses.result)) {
    entry.top_witness = witnesses.result[0]?.owner ?? null;
  }
  if (accounts.ok) entry.account_count = accounts.result ?? null;
  if (witnessCount.ok) entry.witness_count = witnessCount.result ?? null;

  return entry;
}

/** Full multi-node probe. `opts.fetchImpl` injects a mock for selftests.
 * NEVER throws; always returns a digest. ok ⇔ at least one node alive. */
export async function runBlurtProbe(opts = {}) {
  const endpoints = opts.endpoints ?? BLURT_ENDPOINTS;
  const digest = {
    schema: "roshpinacare.blurt-node-health-probe/1",
    task: "9-d",
    at: new Date().toISOString(),
    read_only: true,
    broadcast: false,
    keys_used: false,
    ok: false,
    node_used: null,
    nodes: [],
    network: null,
    witnesses: null,
    errors: [],
    advisory_note:
      "intel for the R294 blurt agent — advisory only; never touches blurt.mjs / blurt-arm.json ceremony",
    scope_note:
      "blurt public nodes expose no internal-market/feed API (get_order_book, get_feed_history measured absent 2026-10-11) — market intel on blurt must come from external sources",
  };

  for (const node of endpoints) {
    const entry = await probeNode(node, opts);
    digest.nodes.push(entry);
    if (entry.alive && !digest.node_used) {
      digest.node_used = node;
      digest.ok = true;
      digest.network = entry.network;
      if (entry.top_witness) digest.witnesses = entry.top_witness;
    }
    if (!entry.alive) digest.errors.push(`${node} → ${entry.error}`);
  }
  return digest;
}

/** Honest exit: 0 only when at least one node is healthy. */
export function resolveExit(digest) {
  return digest && digest.ok ? 0 : 1;
}

function utcDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function writeDigest(digest) {
  fs.mkdirSync(DIGEST_DIR, { recursive: true });
  const file = path.join(DIGEST_DIR, `${utcDateStamp()}.json`);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(digest, null, 2) + "\n");
  fs.renameSync(tmp, file);
  return file;
}

async function main() {
  const digest = await runBlurtProbe();
  const file = writeDigest(digest);
  console.log(JSON.stringify(digest, null, 2));
  console.error(`digest written: ${file} (ok=${digest.ok})`);
  process.exit(resolveExit(digest));
}

/* ------------------------------- selftests ------------------------------- */

function mockRpc(handler) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const req = JSON.parse(init.body);
    calls.push({ url, method: req.method });
    return handler(url, req);
  };
  return { fetchImpl, calls };
}

function jsonRes(result) {
  return { ok: true, status: 200, text: async () => JSON.stringify({ jsonrpc: "2.0", result, id: 1 }) };
}
function errRes(code, message) {
  return { ok: true, status: 200, text: async () => JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: 1 }) };
}

const FAKE_DGP = {
  head_block_number: 64395434,
  head_block_id: "03d698aa1c04339ce2f5eab18565d34c4a2491e3",
  time: "2026-10-11T15:05:12",
  current_witness: "agorise-witness",
  current_supply: { amount: "608014900.749", precision: 6, nai: "@@000000021" },
  total_vesting_fund_blurt: { amount: "393607155.556", precision: 6, nai: "@@000000037" },
  total_vesting_shares: { amount: "342647250000.000", precision: 6, nai: "@@000000037" },
};
const FAKE_BLOCK = { timestamp: "2026-10-11T15:05:12", witness: "agorise-witness" };

export async function selftest() {
  const results = [];
  const t = (name, pass, detail) => results.push({ name, pass, detail });

  // Vector 1 — happy path: both primary nodes healthy, block time matches.
  {
    const { fetchImpl } = mockRpc((_url, req) => {
      switch (req.method) {
        case "condenser_api.get_dynamic_global_properties": return jsonRes(FAKE_DGP);
        case "condenser_api.get_block": return jsonRes(FAKE_BLOCK);
        case "condenser_api.get_witnesses_by_vote":
          return jsonRes([{ owner: "khrom" }, { owner: "agorise-witness" }]);
        case "condenser_api.get_account_count": return jsonRes(1399414);
        case "condenser_api.get_witness_count": return jsonRes(245);
        default: return errRes(-32601, "mock: unknown method");
      }
    });
    const d = await runBlurtProbe({ fetchImpl, endpoints: ["https://a.mock", "https://b.mock"], retries: 1 });
    t("v1-happy", d.ok === true && d.node_used === "https://a.mock" &&
      d.nodes.length === 2 && d.nodes[0].alive && d.nodes[1].alive &&
      d.nodes[0].block_time_match === true &&
      d.network?.head_block_number === 64395434 &&
      d.network?.current_supply === "608014900.749" &&
      d.witnesses === "khrom" && d.nodes[0].account_count === 1399414,
      JSON.stringify({ ok: d.ok, nodes: d.nodes.map((n) => n.node + ":" + n.alive) }));
  }

  // Vector 2 — failover: first node NXDOMAIN, second answers; intel recorded.
  {
    const { fetchImpl } = mockRpc((url, req) => {
      if (url === "https://dead.mock") throw new Error("nxdomain-mock");
      if (req.method === "condenser_api.get_dynamic_global_properties") return jsonRes(FAKE_DGP);
      if (req.method === "condenser_api.get_block") return jsonRes(FAKE_BLOCK);
      return errRes(-32601, "mock: minimal secondary");
    });
    const d = await runBlurtProbe({ fetchImpl, endpoints: ["https://dead.mock", "https://alive.mock"], retries: 1 });
    t("v2-failover", d.ok === true && d.node_used === "https://alive.mock" &&
      d.nodes[0].alive === false && d.nodes[0].error === "nxdomain-mock" &&
      d.nodes[1].alive === true && d.errors.length === 1 &&
      d.errors[0].includes("dead.mock"),
      JSON.stringify({ ok: d.ok, used: d.node_used, errs: d.errors }));
  }

  // Vector 3 — total outage: every node down → ok:false, honest exit 1.
  {
    const { fetchImpl } = mockRpc(async () => {
      throw new Error("econnrefused-mock");
    });
    const d = await runBlurtProbe({ fetchImpl, endpoints: ["https://d1.mock", "https://d2.mock"], retries: 1 });
    const exit = resolveExit(d);
    t("v3-honest-failure", d.ok === false && d.node_used === null &&
      d.nodes.length === 2 && d.nodes.every((n) => !n.alive) &&
      d.errors.length === 2 && exit === 1 && d.network === null,
      JSON.stringify({ ok: d.ok, exit, errs: d.errors }));
  }

  // Vector 4 — stale head + partial call failure: flags stay honest, node alive.
  {
    const { fetchImpl } = mockRpc((_url, req) => {
      switch (req.method) {
        case "condenser_api.get_dynamic_global_properties": return jsonRes(FAKE_DGP);
        case "condenser_api.get_block":
          return jsonRes({ timestamp: "2026-10-11T15:02:02" }); // 190s stale
        case "condenser_api.get_witnesses_by_vote": return jsonRes([]);
        case "condenser_api.get_witness_count": return errRes(-32000, "mock: witness_count exploded");
        default: return errRes(-32601, "mock: not tested here");
      }
    });
    const d = await runBlurtProbe({ fetchImpl, endpoints: ["https://stale.mock"], retries: 1 });
    const n = d.nodes[0];
    t("v4-stale-honest", d.ok === true && n.alive === true &&
      n.block_time_match === false && n.block_skew_s === 190 &&
      n.calls.witness_count.ok === false &&
      n.calls.witness_count.error.includes("witness_count exploded") &&
      n.calls.top_witnesses.ok === true && n.calls.top_witnesses.count === 0,
      JSON.stringify({ match: n.block_time_match, skew: n.block_skew_s, wc: n.calls.witness_count }));
  }

  return results;
}

/* --------------------------------- CLI ----------------------------------- */

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--selftest")) {
    const results = await selftest();
    console.log(JSON.stringify(results, null, 2));
    const failed = results.filter((r) => !r.pass);
    console.error(failed.length === 0
      ? `selftest PASS (${results.length}/${results.length})`
      : `selftest FAIL ${failed.length}/${results.length}: ${failed.map((f) => f.name).join(",")}`);
    process.exit(failed.length === 0 ? 0 : 1);
  } else {
    await main();
  }
}
