#!/usr/bin/env node
/**
 * sovereign-tick.mjs — טביעת-הריבונות (T-41 · Sandbox · v2-רצף T-42)
 * ═════════════════════════════════════════════════════════════════════════════
 * העורק-האוטונומי-חסר-הסנדבוקס: רץ ב-GitHub Actions (cron+push+dispatch+שרשרת-עצמית) וגם מקומית (--local).
 * אפס-תלות-חוץ (stdlib בלבד). מה-הוא-עושה — **מדידות-אמת-בלבד**:
 *   · זמן-UTC · git HEAD · מספר-קבצים-בעץ · שורות-worklog · ניקיון-עץ (dirty)
 *   · חתימת-המשכיות: sha256 של (HEAD+זמן-קודם) — שרשרת-טביעות-שוברת-טיפולים
 *   · כותב: receipts/latest.json + receipts/ticks.jsonl (tail-512, append-only)
 * אינו-דוחף בעצמו (--local); ב-CI-ה-workflow עושה commit+rebase+push.
 * **מצערת (v2 · T-42)**: לקח-חי-2026-10-09 — ה-scheduler-של-GitHub-החסיר-11-משבצות-cron-רצופות
 * (0-הרצות-מתוזמנות-מתוך-11; העורק-התגלה-שקט-ללא-כל-שגיאה). לכן-ה-workflow-מופעל-מארבעה-גורמים
 * (cron · push-ל-main · dispatch-ידני · repository_dispatch-מהטביעה-הקודמת), והסקריפט-מצער-עצמו:
 * ב-CI, אם-הקבלה-האחרונה-טרייה-מ-< MIN_INTERVAL — יציאה-0-ללא-קבלה (מניעת-טביעות-כפולות;
 * --force-עוקף-לאימות-בלבד). השרשרת-העצמית-ב-workflow: sleep-עד-המשבצת-הבאה → dispatch.
 * אות-התנובה-ל-workflow: בעת-מצערת-הסקריפט כותב `ticked=0` אל-$GITHUB_OUTPUT —
 * הרצה-מדולגת-אינה-מולידה-יורשת (צמצום-אוכלוסיית-שרשרות-לאחת; רק-טביעה-אמתית-או-כישלון-מולידים).
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
const FORCE = process.argv.includes("--force");
const TAIL = 512;
const MIN_INTERVAL_MS = 12 * 60 * 1000; // מצערת-CI: מתחת-למשבצת-ה-15-דק' — מרווח-להתנגשויות-בין-גורמי-המכניסה

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

function lastTickAt() {
  try {
    const j = JSON.parse(fs.readFileSync(LATEST, "utf8"));
    const t = Date.parse(j.at);
    return Number.isFinite(t) ? t : 0;
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

function signalOutput(kv) {
  // אות-ל-workflow (רק-ב-CI): ticked=1 (נכתבה-קבלה) / ticked=0 (מוצערת — לא-מולידה-יורשת).
  try {
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, kv);
  } catch {}
}

function main() {
  // מצערת (v2 · T-42): ב-CI-בלבד — אפס-קבלה-כפולה-בתוך-חלון-המצערת (--local/--force-עוקפים).
  if (!LOCAL && !FORCE) {
    const last = lastTickAt();
    if (last > 0) {
      const sinceMs = Date.now() - last;
      if (sinceMs >= 0 && sinceMs < MIN_INTERVAL_MS) {
        console.log(`[tick] ⏸ throttled · last=${new Date(last).toISOString()} · ${Math.round(sinceMs / 1000)}s < ${MIN_INTERVAL_MS / 1000}s — אין-קבלה (השרשרת-ממשיכה-דרך-ה-workflow)`);
        signalOutput("ticked=0\n");
        return;
      }
    }
  }
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
  signalOutput("ticked=1\n");
  try {
    const lines = fs.readFileSync(TICKS, "utf8").trim().split("\n");
    if (lines.length > TAIL) fs.writeFileSync(TICKS, lines.slice(-TAIL).join("\n") + "\n");
  } catch {}

  console.log(`[tick] ✔ ${at} · head=${tick.head} · dirty=${dirty} · chain=${chain}${LOCAL ? " · local(no-push)" : ""}`);
}

main();
