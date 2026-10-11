// RETRO — רטרוספקטיבה שבועית ארגונית (zai-audit 2026-10-11 · owner mandate
// "בחינה של ההיסטוריה לשיפור העתידי תמידי למידה אימון")
// =============================================================================
// עקרון: לא מערכת-למידה חדשה-במקביל (זה-המחלה שהאודיט איבחן) — אלא הרחבה
// של פנקס-הלקחים הקיים (ops/lessons/ledger.md, הסופר החי): פעם-בשבוע קוראים
// את כל ההיסטוריה הנמדדת — ריצות-Actions של כל-הריפואים (7 ימים), פנקס-הלקחים,
// ספר-הפדרציה ויומן-הריפוי — ומזקקים: מה-נשבר / מה-הורפא / דפוסים-חוזרים /
// שלוש-הנחיות-מספריות לשבוע-הבא. כל-טענה = מספר-ממקור. אפס-סודות.
//
// שימוש: node retro/retro.mjs [--weeks N]   (ברירת-מחדל: שבוע-אחד אחורה)
// פלט: ops/lessons/retro-<ISO-week>.json + נספח-שבועי ל-ledger.md (append-only)

import { appendFileSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const LEDGER = join(ROOT, "ops", "lessons", "ledger.md");
const FED_LEDGER = join(ROOT, "federation", "LEDGER.jsonl");
const HEAL_LEDGER = join(ROOT, "heal", "ledger.jsonl");
const TOKEN = process.env.FED_TOKEN || process.env.GITHUB_TOKEN || "";
const ORG = "roshpinacare-sys";
const WEEKS = Math.max(1, Math.min(8, parseInt(process.argv[process.argv.indexOf("--weeks") + 1] || "1", 10) || 1));

const gh = async (path) => {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `token ${TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "sandbox-retro" },
  });
  if (!r.ok) throw new Error(`gh ${path} -> ${r.status}`);
  return r.json();
};
const ghList = async (path) => {
  const out = [];
  for (let p = 1; p <= 4; p++) {
    const page = await gh(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${p}`);
    if (!Array.isArray(page) || page.length === 0) break;
    out.push(...page);
    if (page.length < 100) break;
  }
  return out;
};

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, "0")}`;
}

const since = new Date(Date.now() - WEEKS * 7 * 86400000).toISOString();

/* 1) מלאי-הפדרציה — כל-הריפואים והמצב שלהם
 * דפוס-T46 (נמדד-חי): עם-טוקן /user/repos?affiliation=owner — היחיד שמחזיר
 * גם-פרטיים; אנונימי /users/{owner}/repos — פומביים-בלבד (כנות-מדוגלת). */
const repoEndpoint = TOKEN ? `/user/repos?affiliation=owner&sort=pushed` : `/users/${ORG}/repos?sort=pushed`;
const repos = await gh(repoEndpoint);
const perRepo = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const r of repos) {
  let runs = null;
  try { runs = await gh(`/repos/${ORG}/${r.name}/actions/runs?per_page=100`); } catch { runs = null; }
  await sleep(300); // מגבלת-קצב משנית — קריאה-אחת-לריפו בקצב-מנומס
  if (!runs || !Array.isArray(runs.workflow_runs)) {
    perRepo.push({ repo: r.name, visibility: r.visibility, pushed: (r.pushed_at || "").slice(0, 10), unreadable: true, runs: 0, ok: 0, fail: 0, instantFail: 0 });
    continue;
  }
  /* דגימה: 100 הריצות האחרונות בלבד (הסיגנל-האמיתי; ריפו-פעיל יכול 900+/שבוע) */
  const rs = runs.workflow_runs.filter((x) => x.created_at >= since);
  const ok = rs.filter((x) => x.conclusion === "success").length;
  const fail = rs.filter((x) => x.conclusion === "failure").length;
  const instantFail = rs.filter((x) => x.conclusion === "failure" && (new Date(x.run_started_at) - new Date(x.created_at)) < 5000).length;
  perRepo.push({ repo: r.name, visibility: r.visibility, pushed: (r.pushed_at || "").slice(0, 10), sampled: rs.length, runs: rs.length, ok, fail, instantFail });
}
perRepo.sort((a, b) => b.fail - a.fail);

/* 2) פנקס-הלקחים — הצעות-החוק הפתוחות של הסופר */
const ledgerText = existsSync(LEDGER) ? readFileSync(LEDGER, "utf8") : "";
const proposals = [...ledgerText.matchAll(/PROPOSAL\(law\): (.*)/g)].map((m) => m[1].trim()).slice(-10);

/* 3) יומני-ריפוי ופדרציה — הדפוסים החוזרים */
const healLines = existsSync(HEAL_LEDGER) ? readFileSync(HEAL_LEDGER, "utf8").trim().split("\n").filter(Boolean) : [];
const fedLines = existsSync(FED_LEDGER) ? readFileSync(FED_LEDGER, "utf8").trim().split("\n").filter(Boolean) : [];
let lastHeal = null, lastFed = null;
try { lastHeal = JSON.parse(healLines[healLines.length - 1]); } catch {}
try { lastFed = JSON.parse(fedLines[fedLines.length - 1]); } catch {}

/* 4) הזיקוק — מספרים-בלבד, בלי-סודות */
const totals = perRepo.reduce((a, r) => ({ runs: a.runs + r.runs, ok: a.ok + r.ok, fail: a.fail + r.fail, instantFail: a.instantFail + r.instantFail }), { runs: 0, ok: 0, fail: 0, instantFail: 0 });
const redRepos = perRepo.filter((r) => r.fail > 0 && r.ok === 0 && r.runs > 0);
const healthy = perRepo.filter((r) => r.runs > 0 && r.fail === 0);
const silent = perRepo.filter((r) => r.runs === 0 && !r.unreadable);
const unreadable = perRepo.filter((r) => r.unreadable);
const billingSuspect = totals.instantFail > 0;

const directives = [];
if (billingSuspect) directives.push(`billing-wall signature detected: ${totals.instantFail} instant-fail runs (<5s) across the org this week — lift the Actions spending limit or migrate the affected engines' cadence to public homes; fleet-heal will re-probe within 24h of release`);
if (redRepos.length) directives.push(`red engines (${redRepos.map((r) => r.repo).join(", ")}): zero success vs ${redRepos.reduce((a, r) => a + r.fail, 0)} failures — fix root cause before adding features; red CI is not a state, it is a debt`);
if (silent.length) directives.push(`silent repos (${silent.length}): ${silent.map((r) => r.repo).join(", ")} ran nothing in ${WEEKS} week(s) — either wire a real trigger or archive honestly; a repo that never runs is a claim, not a system`);
if (proposals.length) directives.push(`open scribe law-proposals: ${proposals.length} — review, adopt or refute each with a measured verdict; a proposal older than 2 retro cycles with no verdict becomes a doctrine violation itself`);

const retro = {
  protocol: "SAOS-WEEKLY-RETRO/1",
  at: new Date().toISOString(),
  window: { since, weeks: WEEKS },
  measured: {
    reposScanned: perRepo.length,
    totals,
    redRepos: redRepos.map((r) => ({ repo: r.repo, fail: r.fail, instantFail: r.instantFail })),
    healthy: healthy.map((r) => ({ repo: r.repo, ok: r.ok })),
    silent: silent.map((r) => r.repo),
    billingSuspect,
    healLast: lastHeal ? { at: lastHeal.at ?? "?", summary: String(JSON.stringify(lastHeal)).slice(0, 240) } : null,
    federationLast: lastFed ? { at: lastFed.at ?? "?", summary: String(JSON.stringify(lastFed)).slice(0, 240) } : null,
    openProposals: proposals,
  },
  directives,
};
const retroPath = join(ROOT, "ops", "lessons", `retro-${isoWeek()}.json`);
writeFileSync(retroPath, JSON.stringify(retro, null, 2) + "\n");

/* 5) נספח-שבועי לפנקס (append-only — אותו-חוק של הסופר) */
const section = `\n## weekly-retro ${isoWeek()} · ${retro.at}\n- org runs ${WEEKS}w: ${totals.runs} · ok=${totals.ok} · fail=${totals.fail} · instant-fail(billing-signature)=${totals.instantFail}\n- red engines: ${redRepos.map((r) => `${r.repo}(×${r.fail})`).join(", ") || "none"} · healthy: ${healthy.length} · silent: ${silent.length}\n- open law-proposals: ${proposals.length}\n${directives.map((d, i) => `- DIRECTIVE(${i + 1}): ${d}`).join("\n")}\n`;
appendFileSync(LEDGER, section);

console.log(`retro: ${retroPath} written · directives=${directives.length}`);
for (const d of directives) console.log(`  - ${d.slice(0, 160)}`);
