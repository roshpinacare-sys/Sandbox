#!/usr/bin/env node
/* hive-probe.mjs — Stage-0 READ-ONLY probe of the Hive network (task 9-d).
 *
 * חוקי-המסילה (same laws as every Sandbox probe layer):
 *   · אפס-מפתחות, אפס-אימות, אפס-שידור — כל-קריאה כאן היא קריאה-ציבורית בלבד.
 *   · No keys, no auth, zero broadcast — every call is a public chain READ.
 *   · fail-open-honest: on failure we exit non-zero with the honest error.
 *     אף-פעם לא מזויף-הצלחה. A red probe is a fact, not a failure to hide.
 *
 * Stage-0 scope (per sovereign/EXPANSION-PLAN-2026-10-11.md):
 *   network status, price feeds, internal-market tickers, top witnesses.
 *
 * Methods used (all condenser/market read APIs, params are ARRAYS —
 * graphene condenser rejects object params with bad_cast_exception):
 *   condenser_api.get_dynamic_global_properties []
 *   condenser_api.get_order_book [10]              (internal HIVE:HBD market)
 *   market_history_api.get_ticker {}
 *   market_history_api.get_volume {}
 *   condenser_api.get_feed_history []              (witness feed price)
 *   condenser_api.get_witnesses_by_vote ["", 20]
 *
 * Usage:
 *   node probes/hive-probe.mjs            # live probe → digest file + stdout
 *   node probes/hive-probe.mjs --selftest # mocked-fetch vectors, no network
 * Exit codes: 0 = digest.ok true; 1 = honest failure (recorded in digest).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DIGEST_DIR = path.join(DIR, "hive");

export const HIVE_ENDPOINTS = [
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.deathwing.me",
];

const TIMEOUT_MS = 12000;
const RETRIES = 2; // total attempts per call

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

/** Find the first endpoint that answers get_dynamic_global_properties.
 * Returns {endpoint, attempts:[{endpoint,ok,ms,error?}]} or null. */
async function pickEndpoint(endpoints, opts) {
  const attempts = [];
  for (const endpoint of endpoints) {
    const r = await rpcCall(endpoint, "condenser_api.get_dynamic_global_properties", [], opts);
    attempts.push({ endpoint, ok: r.ok, ms: r.ms, ...(r.ok ? {} : { error: r.error }) });
    if (r.ok) return { endpoint, attempts };
  }
  return { endpoint: null, attempts };
}

function naiAmount(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "amount" in v) return String(v.amount);
  return String(v);
}

/** Trim get_dynamic_global_properties to the Stage-0 digest fields. */
export function trimDgp(d) {
  if (!d || typeof d !== "object") return null;
  return {
    head_block_number: d.head_block_number ?? null,
    head_block_id: d.head_block_id ?? null,
    time: d.time ?? null,
    current_witness: d.current_witness ?? null,
    last_irreversible_block_num: d.last_irreversible_block_num ?? null,
    current_supply: naiAmount(d.current_supply),
    current_hbd_supply: naiAmount(d.current_hbd_supply),
    virtual_supply: naiAmount(d.virtual_supply),
    hbd_print_rate: d.hbd_print_rate ?? null,
  };
}

/** Parse "0.055 HBD" / "1.000 HIVE" into a number pair. */
export function parseAsset(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/^(-?[\d.]+)\s+([A-Za-z]+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? { amount: n, symbol: m[2] } : null;
}

/** Derive the internal-market summary from get_order_book result. */
export function summarizeOrderBook(ob) {
  if (!ob || !Array.isArray(ob.bids) || !Array.isArray(ob.asks) ||
      ob.bids.length === 0 || ob.asks.length === 0) return null;
  const bb = Number(ob.bids[0]?.real_price);
  const ba = Number(ob.asks[0]?.real_price);
  if (!Number.isFinite(bb) || !Number.isFinite(ba) || ba <= 0) return null;
  const bidDepthHbd = ob.bids.reduce((s, b) => s + Number(b?.hbd ?? 0), 0);
  const askDepthHive = ob.asks.reduce((s, a) => s + Number(a?.hive ?? 0), 0);
  const mid = (bb + ba) / 2;
  return {
    best_bid: bb,
    best_ask: ba,
    mid: Math.round(mid * 1e10) / 1e10,
    spread_bps: Math.round(((ba - bb) / mid) * 1e4 * 100) / 100,
    bid_depth_hbd: Math.round(bidDepthHbd * 1000) / 1000,
    ask_depth_hive: Math.round(askDepthHive * 1000) / 1000,
    levels: ob.bids.length,
  };
}

/** Full Stage-0 probe. `opts.fetchImpl` injects a mock for selftests.
 * NEVER throws; always returns a digest. ok=true ⇔ network status read. */
export async function runHiveProbe(opts = {}) {
  const endpoints = opts.endpoints ?? HIVE_ENDPOINTS;
  const digest = {
    schema: "roshpinacare.hive-stage0-probe/1",
    task: "9-d",
    at: new Date().toISOString(),
    read_only: true,
    broadcast: false,
    keys_used: false,
    ok: false,
    degraded: false,
    endpoint_used: null,
    endpoints_tried: [],
    calls: {},
    network: null,
    feed_price: null,
    market: null,
    witnesses: null,
    errors: [],
  };

  const pick = await pickEndpoint(endpoints, opts);
  digest.endpoints_tried = pick.attempts;
  if (!pick.endpoint) {
    digest.errors.push(`no reachable endpoint: ${pick.attempts
      .map((a) => `${a.endpoint} → ${a.error ?? "ok"}`)
      .join("; ")}`);
    return digest; // honest failure — never fake success
  }
  digest.endpoint_used = pick.endpoint;

  const run = async (key, method, params) => {
    digest.calls[key] = await rpcCall(pick.endpoint, method, params, opts);
    if (!digest.calls[key].ok) {
      digest.degraded = true;
      digest.errors.push(`${key} failed: ${digest.calls[key].error}`);
    }
    return digest.calls[key];
  };

  const dgp = await run("dgp", "condenser_api.get_dynamic_global_properties", []);
  if (!dgp.ok) {
    // core call failed on the "healthy" pick (transient) — honest failure
    digest.endpoint_used = pick.endpoint;
    return digest;
  }
  digest.ok = true;
  digest.network = trimDgp(dgp.result);

  const [orderBook, ticker, volume, feed, witnesses] = await Promise.all([
    run("order_book", "condenser_api.get_order_book", [10]),
    run("ticker", "market_history_api.get_ticker", {}),
    run("volume", "market_history_api.get_volume", {}),
    run("feed_history", "condenser_api.get_feed_history", []),
    run("top_witnesses", "condenser_api.get_witnesses_by_vote", ["", 20]),
  ]);

  if (orderBook.ok) {
    const summary = summarizeOrderBook(orderBook.result);
    if (summary) {
      digest.market = digest.market ?? {};
      digest.market.order_book = summary;
    } else {
      digest.degraded = true;
      digest.errors.push("order_book: book empty/unparsable");
    }
  }
  if (ticker.ok) {
    digest.market = digest.market ?? {};
    digest.market.ticker = {
      latest: Number(ticker.result?.latest) || null,
      lowest_ask: Number(ticker.result?.lowest_ask) || null,
      highest_bid: Number(ticker.result?.highest_bid) || null,
      percent_change: Number(ticker.result?.percent_change) || null,
    };
  }
  if (volume.ok) {
    digest.market = digest.market ?? {};
    digest.market.volume = {
      hive_volume: naiAmount(volume.result?.hive_volume),
      hbd_volume: naiAmount(volume.result?.hbd_volume),
    };
  }
  if (feed.ok) {
    const med = feed.result?.current_median_history;
    const base = parseAsset(med?.base);
    const quote = parseAsset(med?.quote);
    if (base && quote && base.amount > 0 && quote.amount > 0) {
      digest.feed_price = {
        base: med.base,
        quote: med.quote,
        hbd_per_hive: Math.round((base.amount / quote.amount) * 1e8) / 1e8,
        source: "witness_median_feed",
      };
    }
  }
  if (witnesses.ok && Array.isArray(witnesses.result)) {
    digest.witnesses = witnesses.result
      .slice(0, 10)
      .map((w) => ({ owner: w.owner, votes: w.votes }));
  }

  return digest;
}

/** Honest exit: 0 only when the digest says ok. */
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
  const digest = await runHiveProbe();
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
function httpRes(status) {
  return { ok: false, status, text: async () => "mock-http-error" };
}

const FAKE_DGP = {
  head_block_number: 110683480,
  head_block_id: "0698e55822c7243b10f739f41ade1cdae0ab248e",
  time: "2026-10-11T15:05:24",
  current_witness: "ocd-witness",
  last_irreversible_block_num: 110683445,
  current_supply: { amount: "512345678.123", precision: 3, nai: "@@000000021" },
  current_hbd_supply: { amount: "23456789.456", precision: 3, nai: "@@000000013" },
  hbd_print_rate: 0,
};

export async function selftest() {
  const results = [];
  const t = (name, pass, detail) => results.push({ name, pass, detail });

  // Vector 1 — happy path: all six calls answer; digest fully populated.
  {
    const { fetchImpl } = mockRpc((_url, req) => {
      switch (req.method) {
        case "condenser_api.get_dynamic_global_properties": return jsonRes(FAKE_DGP);
        case "condenser_api.get_order_book":
          return jsonRes({
            bids: [{ real_price: "0.05581", hive: 1000, hbd: 55 }, { real_price: "0.0550", hive: 900, hbd: 49 }],
            asks: [{ real_price: "0.05592", hive: 800, hbd: 44 }, { real_price: "0.0560", hive: 700, hbd: 39 }],
          });
        case "market_history_api.get_ticker":
          return jsonRes({ latest: "0.05591", lowest_ask: "0.05592", highest_bid: "0.05581", percent_change: "1.41" });
        case "market_history_api.get_volume":
          return jsonRes({ hive_volume: { amount: "57014666" }, hbd_volume: { amount: "3179865" } });
        case "condenser_api.get_feed_history":
          return jsonRes({ current_median_history: { base: "0.055 HBD", quote: "1.000 HIVE" } });
        case "condenser_api.get_witnesses_by_vote":
          return jsonRes(Array.from({ length: 20 }, (_, i) => ({ owner: `w${i}`, votes: String(1000 - i) })));
        default: return errRes(-32601, "mock: unknown method");
      }
    });
    const d = await runHiveProbe({ fetchImpl, endpoints: ["https://mock.hive"], retries: 1 });
    t("v1-happy", d.ok === true && d.degraded === false &&
      d.feed_price?.hbd_per_hive === 0.055 &&
      d.market?.order_book?.best_bid === 0.05581 && d.market?.order_book?.best_ask === 0.05592 &&
      d.market?.order_book?.spread_bps > 0 && d.witnesses?.length === 10 &&
      d.network?.head_block_number === 110683480 &&
      d.network?.current_supply === "512345678.123" &&
      d.market?.ticker?.latest === 0.05591,
      JSON.stringify({ ok: d.ok, feed: d.feed_price, mkt: d.market, errs: d.errors }));
  }

  // Vector 2 — total outage: every endpoint down → ok:false, honest error, exit 1.
  {
    const { fetchImpl } = mockRpc(async () => {
      throw new Error("econnrefused-mock");
    });
    const d = await runHiveProbe({ fetchImpl, endpoints: ["https://down1.mock", "https://down2.mock"], retries: 1 });
    const exit = resolveExit(d);
    t("v2-honest-failure", d.ok === false && d.endpoint_used === null &&
      d.endpoints_tried.length === 2 && d.endpoints_tried[0].error === "econnrefused-mock" &&
      d.errors.length > 0 && exit === 1,
      JSON.stringify({ ok: d.ok, exit, errors: d.errors }));
  }

  // Vector 3 — degraded + retry: ticker http-500 once then ok; order_book rpc-error.
  {
    let tickerTries = 0;
    const { fetchImpl, calls } = mockRpc((_url, req) => {
      if (req.method === "condenser_api.get_dynamic_global_properties") return jsonRes(FAKE_DGP);
      if (req.method === "market_history_api.get_ticker") {
        tickerTries++;
        return tickerTries === 1 ? httpRes(500) : jsonRes({ latest: "0.05591", lowest_ask: "0.05592", highest_bid: "0.05581", percent_change: "1.41" });
      }
      if (req.method === "condenser_api.get_order_book") return errRes(-32000, "mock: empty book");
      return errRes(-32601, "mock: not tested here");
    });
    const d = await runHiveProbe({ fetchImpl, endpoints: ["https://mock.hive"], retries: 2 });
    const tickerCalls = calls.filter((c) => c.method === "market_history_api.get_ticker").length;
    t("v3-degraded-retry", d.ok === true && d.degraded === true &&
      d.calls.order_book.ok === false && d.calls.order_book.error.includes("mock: empty book") &&
      d.calls.ticker.ok === true && tickerCalls === 2 &&
      d.errors.some((e) => e.startsWith("order_book failed")),
      JSON.stringify({ ok: d.ok, degraded: d.degraded, tickerCalls, errs: d.errors }));
  }

  // Vector 4 — failover: first endpoint dead, second answers.
  {
    const { fetchImpl } = mockRpc((url, req) => {
      if (url === "https://dead.mock") throw new Error("nxdomain-mock");
      if (req.method === "condenser_api.get_dynamic_global_properties") return jsonRes(FAKE_DGP);
      return errRes(-32601, "mock: secondary minimal");
    });
    const d = await runHiveProbe({ fetchImpl, endpoints: ["https://dead.mock", "https://alive.mock"], retries: 1 });
    t("v4-failover", d.ok === true && d.endpoint_used === "https://alive.mock" &&
      d.endpoints_tried[0].ok === false && d.endpoints_tried[0].error === "nxdomain-mock" &&
      d.endpoints_tried[1].ok === true,
      JSON.stringify({ ok: d.ok, used: d.endpoint_used, tried: d.endpoints_tried }));
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
