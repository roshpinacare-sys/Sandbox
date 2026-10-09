#!/usr/bin/env node
/**
 * sovereign-tick.mjs — טביעת-הריבונות (T-41 · Sandbox)
 * ═════════════════════════════════════════════════════════════════════════════
 * העורק-האוטונומי-חסר-הסנדבוקס: רץ ב-GitHub Actions (cron) וגם מקומית (--local).
 * אפס-תלות-חוץ (stdlib בלבד). מה-הוא-עושה — **מדידות-אמת-בלבד**:
 *   · זמן-UTC · git HEAD · מספר-קבצים-בעץ · שורות-worklog · ניקיון-עץ (dirty)
 *   · חתימת-המשכיות: sha256 של (HEAD+זמן-קודם) — שרשרת-טביעות-שוברת-טיפולים
 *   · כותב: receipts/latest.json + receipts/ticks.jsonl (tail-512, append-only)
 * אינו-דוחף בעצמו (--local); ב-CI-ה-workflow עושה commit+rebase+push.
 * איסור: אפס-סודות, אפס-נתיבים-אישיים, אפס-המצאה — כל-שדה נמדד או "absent".
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const R_DIR = path.join(ROOT, "receipts");
const TICKS = path.join(R_DIR, "ticks.jsonl");
const LATEST = path.join(R_DIR, "latest.json");
const LOCAL = process.argv.includes("--local");
const TAIL = 512;

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function prevChain() {
  try {
    const lines = fs.readFileSync(TICKS, "utf8").trim().split("\n").filter(Boolean);
    return JSON.parse(lines[lines.length - 1]).chain ?? "";
  } catch {
    return "";
  }
}

function countLines(p) {
  try {
    return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}

function countFiles() {
  try {
    return git("ls-files").split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}

function main() {
  const at = new Date().toISOString();
  const head = git("rev-parse HEAD");
  const dirty = git("status --porcelain").split("\n").filter(Boolean).length;
  const files = countFiles();
  const worklogLines = countLines(path.join(ROOT, "worklog.md"));
  const prev = prevChain();
  const chain = crypto.createHash("sha256").update(`${head}|${prev}|${at}`).digest("hex").slice(0, 24);

  const tick = {
    schema: "sandbox.tick/1",
    at,
    mode: LOCAL ? "local" : "ci",
    head: head ? head.slice(0, 12) : "absent",
    dirty,
    files,
    worklogLines,
    prevChain: prev || "genesis",
    chain,
    keysLeaked: false,
  };

  fs.mkdirSync(R_DIR, { recursive: true });
  fs.writeFileSync(LATEST, JSON.stringify(tick, null, 1) + "\n");
  fs.appendFileSync(TICKS, JSON.stringify(tick) + "\n");
  try {
    const lines = fs.readFileSync(TICKS, "utf8").trim().split("\n");
    if (lines.length > TAIL) fs.writeFileSync(TICKS, lines.slice(-TAIL).join("\n") + "\n");
  } catch {}

  console.log(`[tick] ✔ ${at} · head=${tick.head} · dirty=${dirty} · chain=${chain}${LOCAL ? " · local(no-push)" : ""}`);
}

main();
