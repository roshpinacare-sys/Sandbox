#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// SEAL-DOMAIN · Task 7 (2026-10-16) — אוטם את שרשרת-הכלכלה הקנונית.
// ───────────────────────────────────────────────────────────────────────────
// ה-econ-engine (תת-המודול Domain ב-sandbox) מטביע ~40k tx/שעה (~20MB/שעה).
// בלי איטום-בתוך-תת-המודול ה-ledger צומח לא-חתום — וקטור GH001 (מגבלת ה-100MB
// שהרגה pushes בעבר) חוזר דרך הדלת האחורית. החוק: כל 15 דקות (lane sbx-seal
// ב-local-beats) השרשרת נאטמת ל-origin/Domain.
// כשל-דחיפה = exit 1 כנה; ה-engine ממשיך לכתוב מקומית (ה-cursor שלו הוא האמת),
// הסלוט הבא מדביק. אפס-סודות-בפלט.
// ═══════════════════════════════════════════════════════════════════════════
import { execFileSync } from "node:child_process";

// 33 (2026-10-22, cycle-26 live measurement): the lane errored "spawnSync git
// ENOENT" every slot — the real cause was the DEAD target: /home/z/my-project/
// t19b/Domain was dismantled (t55s removed the zombie gitlinks) and execFileSync
// throws ENOENT when the CWD is gone. The canonical chain now lives in the
// estate clone (/home/z/estate/Domain — same repo the vault-sealer serves).
// Lane law unchanged: pull --rebase --autostash, commit ONLY the econ chain
// files when dirty, push, fail-honest otherwise.
const D = "/home/z/estate/Domain";
const ECON_PATHS = [
  "agents/econ-ledger.jsonl",
  "agents/econ-engine-state.json",
  "agents/econ-book.json",
  "agents/econ-book.md",
];
const out = (...a) => console.log(...a);
const sh = (args) =>
  execFileSync("git", args, { cwd: D, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).toString();

const steps = [];

// 1. sync (autostash — the engine appends to the ledger while we rebase)
try {
  sh(["pull", "--rebase", "--autostash", "-q", "origin", "main"]);
  steps.push("pull-rebase: ok");
} catch (e) {
  out("seal-domain: pull failed:", String((e && e.stderr) || e.message).slice(-200));
  process.exit(1);
}

// 2. what changed? (econ chain files + any new rotation archives — nothing else;
//    unrelated dirty paths belong to their own writers and laws)
let dirty = [];
try {
  const st = sh(["status", "--porcelain", "--", "agents/"]);
  dirty = st
    .split("\n")
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    .filter((p) => ECON_PATHS.includes(p) || /^agents\/econ-ledger-archive-.*\.gz$/.test(p));
} catch {
  /* status never fails here */
}

if (dirty.length === 0) {
  out("seal-domain: chain already sealed — nothing to commit");
  process.exit(0);
}

// 3. commit
try {
  sh(["add", ...dirty]);
  sh(["commit", "-q", "-m", "econ: seal lane — canonical chain commit (4x/h law, GH001) [skip ci]"]);
  steps.push(`commit: ${dirty.length} file(s)`);
} catch {
  out("seal-domain: nothing staged after sync (a raced seal won) — CLEAN");
  process.exit(0);
}

// 4. push with race retries. NO -X theirs on the ledger — an append-only
// sha16 chain must never lose local rows; on a real conflict we abort and
// let the next slot retry (the engine's cursor is the truth meanwhile).
let ok = false;
for (let i = 1; i <= 5 && !ok; i++) {
  try {
    sh(["push", "-q", "origin", "main"]);
    ok = true;
    steps.push(`push: ok (attempt ${i})`);
  } catch {
    out(`seal-domain: push attempt ${i} rejected — rebasing on fresher main`);
    try {
      sh(["pull", "--rebase", "--autostash", "-q", "origin", "main"]);
    } catch (e2) {
      out("seal-domain: rebase conflict on chain — aborting honestly (next slot re-fires):", String((e2 && e2.stderr) || e2.message).slice(-160));
      try { sh(["rebase", "--abort"]); } catch { /* not rebasing */ }
      process.exit(1);
    }
  }
}

out(`seal-domain: ${ok ? "SEALED" : "FAIL"} — ${steps.join(" · ")}`);
process.exit(ok ? 0 : 1);
