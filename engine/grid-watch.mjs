#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// GRID-WATCH · artery-7 (T-63) — השעון של הטיק שמת בשקט.
// ───────────────────────────────────────────────────────────────────────────
// נמדד 2026-10-11: לולאת הטיק של ה-hyper-grid מתה עם ה-substrate שלה
// (lastTickAt קפוא 2026-10-10T16:49:38Z כש-conf.enabled=true — שקט של 22 שעות+
// שאף-אחד-בגיט לא שם-לב אליו). התיקון-חי: T-62 חיבור burst תחום לדופק של
// saos-runtime. העורק-הזה = המדידה הבלתי-תלויה: כל 30 דקות הוא קורא את
// hyper-grid.json מ-HEAD של steem@saos-cockpit (contents API — קל, בלי clone)
// ואוכף חוקים:
//   law-grid-state-present  (fail) — קובץ-המצב קיים ותקין ב-HEAD
//   law-grid-fresh          (fail) — enabled=true ⇒ lastTickAt ≤ 90 דקות
//                             (paused-by-operator ⇒ דגל כנה, לא אדום)
//   law-grid-revival-wired  (flag) — הדופק של saos-runtime חייב לחבר את ה-burst
// כשל ⇒ exit 1 (אדום) + קבלה-כנה בגיט (כולל FAIL). אפס-סודות-בפלט.
// ═══════════════════════════════════════════════════════════════════════════
import { writeFileSync, appendFileSync, mkdirSync } from "node:fs";

const ORG = "roshpinacare-sys";
const TOKEN = process.env.ECO_WALLET_TOKEN || "";
const out = (...a) => console.log(...a);
const FRESH_MAX_MIN = 90; // דופק saos-runtime ~19 דק' ⇒ 90 דק' = סבלנות כנה

const result = {
  artery: "grid-watch",
  measuredAt: new Date().toISOString(),
  sources: [],
  asserts: [],
  alerts: [],
  overall: "FAIL",
  reason: "not measured",
};
const assertLaw = (id, ok, detail, severity = "fail") => {
  result.asserts.push({ id, ok: !!ok, detail: String(detail).slice(0, 200), severity, verdict: ok ? "pass" : severity });
};
const gh = async (path) => {
  const url = `https://api.github.com/repos/${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "saos-grid-watch" },
  });
  return { url, res };
};

try {
  if (!TOKEN) throw new Error("ECO_WALLET_TOKEN absent — nothing measured, nothing claimed");

  // 1) מדידה: מצב-ה-grid ב-HEAD
  const { url: stateUrl, res: stateRes } = await gh(
    `${ORG}/steem/contents/mini-services/saos-engine/state/hyper-grid.json?ref=saos-cockpit`
  );
  result.sources.push(stateUrl);
  let st = null, blobSha = null;
  if (stateRes.ok) {
    const j = await stateRes.json();
    blobSha = j.sha;
    try { st = JSON.parse(Buffer.from(j.content, "base64").toString("utf8")); } catch { st = null; }
  } else {
    out(`grid state fetch http=${stateRes.status}`);
  }
  result.provenance = { stateBlobSha: blobSha, stateUrl };
// Actions-run identity (closes the integrity-guard unprovenanced FLAG at source — same contract as fleet/flow)
result.provenance.runId = process.env.GITHUB_RUN_ID || null;
result.provenance.runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : null;
result.provenance.sha = process.env.GITHUB_SHA || null;
  assertLaw("law-grid-state-present", !!st, "hyper-grid.json must exist and parse at steem@saos-cockpit HEAD");

  if (st) {
    const last = st.lastTickAt ? Date.parse(st.lastTickAt) : NaN;
    const ageMin = Number.isFinite(last) ? (Date.now() - last) / 60000 : NaN;
    result.measured = {
      enabled: st.conf?.enabled ?? null,
      lastTickAt: st.lastTickAt ?? null,
      ageMin: Number.isFinite(ageMin) ? Math.round(ageMin) : null,
      ticks: st.ticks ?? null,
      lastVerdict: st.lastVerdict ?? null,
    };
    if (st.conf?.enabled === true) {
      assertLaw(
        "law-grid-fresh",
        Number.isFinite(ageMin) && ageMin <= FRESH_MAX_MIN,
        `grid enabled=true: lastTickAt must be ≤ ${FRESH_MAX_MIN}min old (measured ${result.measured.ageMin ?? "NaN"}min)`
      );
    } else {
      result.alerts.push("grid-paused-by-operator: conf.enabled !== true — watchdog honest-idle, no red (the operator switch decides)");
    }
  }

  // 2) הוכחת-חיבור: דופק saos-runtime חייב לחבר את ה-burst (נתיב-החייאה מהגיט)
  const { url: wfUrl, res: wfRes } = await gh(`${ORG}/saos-runtime/contents/.github/workflows/sovereign-runtime.yml`);
  result.sources.push(wfUrl);
  if (wfRes.ok) {
    const wf = Buffer.from((await wfRes.json()).content, "base64").toString("utf8");
    assertLaw("law-grid-revival-wired", wf.includes("hypergrid-burst.mjs"), "saos-runtime heartbeat must wire the bounded burst (T-62)", "flag");
  } else {
    result.alerts.push("grid-revival-unprovable: saos-runtime workflow unreadable — revival path unverified");
  }

  const vals = result.asserts.map((a) => a.verdict);
  result.overall = vals.includes("fail") ? "FAIL" : "PASS";
  result.reason = vals.includes("fail")
    ? `grid-law failed: ${result.asserts.filter((a) => a.verdict === "fail").map((a) => a.id).join(",")}`
    : `grid state measured from git; laws pass${result.alerts.length ? ` — ${result.alerts.length} flag(s)` : ""}`;
} catch (e) {
  result.overall = "ERROR";
  result.reason = String(e.message || e).slice(0, 300);
  out("ERROR:", result.reason);
}

// קבלה-כנה תמיד נכתבת (כולל FAIL) — הכנות קודמת לירוק
mkdirSync("receipts/grid", { recursive: true });
writeFileSync("receipts/grid/verdict.json", JSON.stringify(result, null, 2) + "\n");
appendFileSync("receipts/grid/log.jsonl", JSON.stringify(result) + "\n");
out(`VERDICT: ${result.overall} — ${result.reason}`);
process.exit(result.overall === "PASS" ? 0 : 1);
