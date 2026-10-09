/**
 * fleet-heal.mjs — מרפא-הצי (T-47 · territory: heal/): הרופא-האוטונומי של כלל-הגיט.
 *
 * למה: נמדד-חי (09/10, קבלות-API) — מאז-06/10 כל-ריצות-Actions-בריפואים-הפרטיים
 * נכשלות-בחתימה-אחת: 0-צעדים · ~2 שניות · לוגים-ריקים = חסימת-חיוב/מגבלת-הוצאה.
 * הציבוריים-ממשיכים-לעבוד (חינם). המרפא: (א) מאבחן-את-החתימה-בכנות-ולא-מבלבל-אותה
 * עם-אדום-אמתי (ב) מרפא-אדומים-אמתיים-בהתעוררות: dispatch→המתנה→אימות-ירוק
 * (ג) חוק-ההתעוררות: פרובה-לכל-ריפו-אדום-לכל-היותר-פעם/24h — כך-ברגע-שהבעלים
 * משחרר-את-החיוב, הריפוי-קורה-מעצמו-בתוך-24h-לכל-הריפואים-האדומים.
 *
 * חוקים: stdlib-בלבד · אפס-טוקן-בקבלות/פנקס/שגיאות (מקלחת-סוף) · כישלון-כנה
 * (שגיאה=exit-1-עם-קבלה) · fail-closed · הפנקס-append-only-עם-זנב-מוגבל.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const LATEST = path.join(HERE, 'latest.json');
const STATE = path.join(HERE, 'state.json');
const LEDGER = path.join(HERE, 'ledger.jsonl');
const RECEIPTS = path.join(HERE, 'receipts');
const LEDGER_TAIL = 400;
const PROBE_TTL_MS = 24 * 60 * 60 * 1000; // פרובה-לכל-היותר-פעם/יום-לריפו
const INSTANT_FAIL_S = 120;               // חתימת-חסימת-חיוב: כישלון-≤120ש
const OWNER = 'roshpinacare-sys';
const FORCE = /^(1|true|yes)$/i.test(String(process.env.HEAL_FORCE || ''));
const TOKEN = (process.env.HEAL_TOKEN || '').trim() || null;
const API = 'https://api.github.com';
// מודעות-מכסה: ה-PAT-משותף-לכל-העורקים (פדרציה · תשואה · HQ) — המרפא-אורח-מנומס
const RATE_SOFT = 300;  // מתחת: סריקת-חצאית-בלבד (round-robin) + אפס-פרובות
const RATE_HARD = 100;  // מתחת: SKIP-כנה (אפס-קריאות — קבלה-בלבד)
const CANARY = 'sanbox'; // קנרית-ההתעוררות: ריפו-זול-ובטוח-לבדיקת-שחרור-החיוב

const at = new Date().toISOString();
let rateRemaining = null; // מתעדכן-מכל-תגובה

function gh(pathname, init = {}) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'fleet-heal/1',
    ...(init.headers || {}),
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  return fetch(API + pathname, { ...init, headers }).then(r => {
    const rem = r.headers?.get?.('x-ratelimit-remaining');
    if (rem !== null && rem !== undefined && !Number.isNaN(Number(rem))) rateRemaining = Number(rem);
    return r;
  });
}

async function jf(pathname, init) {
  const r = await gh(pathname, init);
  let body = null;
  try { body = await r.json(); } catch { /* 204 או גוף-ריק */ }
  return { status: r.status, body };
}

// עמידות-למגבלות-משנה (403-רגעי — העורקים-בענן-חולקים-את-אותו-PAT): 3 ניסיונות
async function jfRetry(pathname, init) {
  let last = { status: 0, body: null };
  for (let i = 1; i <= 3; i++) {
    last = await jf(pathname, init);
    if (last.status !== 403 && last.status !== 429) return last;
    await new Promise(res => setTimeout(res, 4000 * i));
  }
  return last;
}

/* ---------- מדינה ---------- */
function loadState() {
  try { return JSON.parse(readFileSync(STATE, 'utf8')); } catch { return { probes: {} }; }
}
function saveState(s) {
  // גיזום-פרובות-ישנות — המדינה-לא-גדלה-ללא-גבול
  const now = Date.now();
  for (const k of Object.keys(s.probes || {})) {
    if (now - (s.probes[k]?.ts || 0) > 7 * PROBE_TTL_MS) delete s.probes[k];
  }
  writeFileSync(STATE, JSON.stringify(s, null, 1) + '\n');
}

/* ---------- סריקה ---------- */
async function listRepos() {
  // /user/repos עם-affiliation=owner — היחיד-שמחזיר-פרטיים (לקח-T46-חי).
  // אנונימי: /users/{owner}/repos — פומביים-בלבד (באג-ידוע) — עדיין-ערך-אמת.
  // fail-closed: דף-ראשון-כושל = זריקה (קבלת-fatal — אסור-שקר-של-FLEET-GREEN-ריק).
  const out = [];
  const listPath = (p) => TOKEN
    ? `/user/repos?per_page=100&page=${p}&affiliation=owner&sort=updated`
    : `/users/${OWNER}/repos?per_page=100&page=${p}&sort=updated`;
  for (let page = 1; page <= 5; page++) {
    const { status, body } = await jfRetry(listPath(page));
    if (status !== 200 || !Array.isArray(body)) {
      if (page === 1) throw new Error(`listRepos-fail-closed(http-${status}) — דף-ראשון-כושל`);
      break;
    }
    out.push(...body);
    if (body.length < 100) break;
  }
  return out;
}

async function latestRuns(name) {
  const { status, body } = await jfRetry(`/repos/${OWNER}/${name}/actions/runs?per_page=30`);
  if (status !== 200 || !Array.isArray(body?.workflow_runs)) return { status, runs: [] };
  // ריצה-אחרונה-לכל-workflow (לפי-שם) — מצב-אמת-של-כל-עורק
  const byWf = new Map();
  for (const r of body.workflow_runs) {
    const key = r.name || r.workflow_id || 'unknown';
    if (!byWf.has(key)) byWf.set(key, r); // הרשימה-ממוינת-לפי-created-desc
  }
  return { status, runs: [...byWf.values()] };
}

function classify(run, visibility) {
  if (!run) return { verdict: 'NO-RUNS' };
  // API-אמת: run_started_at (פועל) + updated_at (≈סיום) — completed_at-לא-קיים-בריצות
  const endT = run.completed_at || run.updated_at;
  const startT = run.run_started_at || run.created_at;
  const durS = endT && startT
    ? Math.round((Date.parse(endT) - Date.parse(startT)) / 1000) : null;
  if (run.status !== 'completed') return { verdict: 'RUNNING', durS };
  if (run.conclusion === 'success') return { verdict: 'GREEN', durS };
  if (run.conclusion === 'cancelled' || run.conclusion === 'skipped') return { verdict: 'CANCELLED', durS };
  // כישלון:
  const blockedSignature = visibility === 'private' && durS !== null && durS <= INSTANT_FAIL_S;
  return {
    verdict: blockedSignature ? 'MINUTES-BLOCKED' : 'GENUINE-RED',
    durS,
  };
}

/* ---------- פרובת-התעוררות (ריפוי-עצמי) ----------
 * עיצוב-ללא-שינה: dispatch-בלבד-כאן; האימות-הירוק-קורה-בסריקה-הבאה-מעצמה
 * (הריצה-החדשה-מתגלה-כירוקה-במיון-הרגיל — המדינה-מתעדת-שאנחנו-יזמנו).
 */
async function tryHeal(repoName, run, state, nowMs) {
  const rec = state.probes[repoName];
  if (!FORCE && rec && nowMs - rec.ts < PROBE_TTL_MS) {
    return { probed: false, reason: 'guard-24h', lastTs: rec.ts, lastResult: rec.result || null };
  }
  // זיהוי-נתיב-ה-workflow: מ-API-הריצה-מכילה-workflow_id; נדרש-path-ל-dispatch.
  const wf = await jfRetry(`/repos/${OWNER}/${repoName}/actions/workflows/${run.workflow_id}`);
  if (wf.status !== 200 || !wf.body?.path) {
    const result = `probe-skip(workflow-${wf.status})`;
    state.probes[repoName] = { ts: nowMs, result };
    return { probed: false, reason: result };
  }
  const wfFile = wf.body.path.replace(/^\.github\/workflows\//, '');
  const d = await gh(`/repos/${OWNER}/${repoName}/actions/workflows/${encodeURIComponent(wfFile)}/dispatches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: run.head_branch || 'main' }),
  });
  if (d.status !== 204) {
    const result = `probe-fail(http-${d.status})`; // למשל-422=אין-טריגר-dispatch-ב-workflow
    state.probes[repoName] = { ts: nowMs, result };
    return { probed: true, dispatched: false, reason: result };
  }
  const result = 'probe-dispatched — הסריקה-הבאה-מאמתת-ירוק-מעצמה';
  state.probes[repoName] = { ts: nowMs, result };
  return { probed: true, dispatched: true, reason: result };
}

/* ---------- מקלחת-אנטי-טוקן ---------- */
function scrub(obj) {
  const s = JSON.stringify(obj);
  if (!TOKEN) return obj;
  const safe = s.split(TOKEN).join('***');
  return JSON.parse(safe);
}

/* ---------- ראשי ---------- */
const result = {
  schema: 'fleet-heal/1',
  at,
  owner: OWNER,
  tokenMode: TOKEN ? 'token' : 'anonymous-honest',
  force: FORCE,
  rateRemaining: null,
  mode: 'full',
  repos: [],
  counts: { repos: 0, green: 0, blocked: 0, genuineRed: 0, healed: 0, probed: 0, other: 0 },
};

try {
  const state = loadState();
  const nowMs = Date.now();

  // שלב-0: בדיקת-מכסה (ה-PAT-משותף — אורח-מנומס). SKIP-כנה-תחת-סף-קשה.
  {
    const { status, body } = await jfRetry('/rate_limit');
    if (status !== 200 || !body?.resources?.core) throw new Error(`rate_limit-unreachable(http-${status})`);
    // הנתון-האמת-בגוף-התגובה (הכותרות-חסרות-ב-endpoint-זה)
    const core = body.resources.core;
    rateRemaining = typeof core.remaining === 'number' ? core.remaining : rateRemaining;
    result.rateRemaining = rateRemaining;
    if (rateRemaining !== null && rateRemaining < RATE_HARD) {
      result.mode = 'SKIP-RATE-HARD';
      result.verdict = 'HEAL-SKIPPED-RATE';
      writeFileSync(LATEST, JSON.stringify(scrub(result), null, 1) + '\n');
      mkdirSync(path.dirname(LEDGER), { recursive: true });
      appendFileSync(LEDGER, JSON.stringify({ at, verdict: 'HEAL-SKIPPED-RATE', rateRemaining }) + '\n');
      console.log(`[heal] ⏸ SKIP-כנה — מכסה-משותפת-נמוכה (${rateRemaining}) — אפס-קריאות`);
      process.exit(0);
    }
  }

  const repos = await listRepos();
  // סריקת-חצאית-מסתגלת: מכסה-רכה → round-robin-לפי-חצי-השעה (כיסוי-מלא-כל-30דק')
  let shard = -1;
  if (!FORCE && rateRemaining !== null && rateRemaining < RATE_SOFT) {
    shard = (new Date().getUTCMinutes() < 30) ? 0 : 1;
    result.mode = 'shard-' + shard;
  }
  const scanned = shard < 0 ? repos : repos.filter((_, i) => i % 2 === shard);
  result.counts.repos = repos.length;
  result.rateRemaining = rateRemaining;

  for (const repo of scanned) {
    const name = repo.name;
    const visibility = repo.private ? 'private' : 'public';
    try {
      const { runs } = await latestRuns(name);
      // סטטוס-ריפו = הגרוע-מבין-העורקים (אדום-אמתי > חסום > ירוק)
      const perWf = runs.map(r => ({ workflow: r.name, run: r }));
      const verdicts = perWf.map(w => ({ ...w, c: classify(w.run, visibility) }));
      const has = v => verdicts.some(x => x.c.verdict === v);
      let repoVerdict = 'GREEN';
      if (has('GENUINE-RED')) repoVerdict = 'GENUINE-RED';
      else if (has('MINUTES-BLOCKED')) repoVerdict = 'MINUTES-BLOCKED';
      else if (has('RUNNING')) repoVerdict = 'RUNNING';
      else if (!verdicts.length) repoVerdict = 'NO-RUNS';

      const entry = {
        name, visibility, verdict: repoVerdict,
        workflows: verdicts.map(w => ({
          workflow: w.workflow, verdict: w.c.verdict, durationS: w.c.durS,
          conclusion: w.run?.conclusion || null, createdAt: w.run?.created_at || null,
          url: w.run?.html_url || null,
        })),
      };

      if (repoVerdict === 'GREEN' && state.probes[name]?.result?.startsWith('probe-dispatched')) {
        // סגירת-הלולאה: היה-אדום → פרובה-שלנו → כעת-ירוק = קבלת-HEALED
        entry.probe = 'HEALED — הפרובה-שלנו-הניבה-ירוק';
        state.probes[name] = { ts: nowMs, result: 'HEALED' };
        entry.verdict = 'HEALED'; repoVerdict = 'HEALED';
        result.counts.healed++;
      }

      if (repoVerdict === 'GENUINE-RED' || repoVerdict === 'MINUTES-BLOCKED') {
        // מדיניות-פרובה:
        // · ציבורי-אדום-אמתי → פרובת-ריפוי (דקות-חינם — בטוח)
        // · פרטי-חסום → קנרית-יחידה (CANARY) פעם/יום — גלאי-שחרור-החיוב;
        //   בלי-פרובות-המוניות (הן-מציתות-workflows-כבדים-ששורפים-את-המכסה-המשותפת!)
        // · חצאית (מכסה-רכה) → אפס-פרובות
        const red = verdicts.find(x => x.c.verdict === 'GENUINE-RED' || x.c.verdict === 'MINUTES-BLOCKED');
        const isBlockedPrivate = repoVerdict === 'MINUTES-BLOCKED';
        const rateOk = rateRemaining === null || rateRemaining >= RATE_SOFT;
        if (shard >= 0) {
          entry.probe = 'probe-skip(shard-mode)';
        } else if (isBlockedPrivate && name !== CANARY && !FORCE) {
          entry.probe = 'probe-skip(canary-only) — גלאי-ההתעוררות: ' + CANARY;
        } else if (isBlockedPrivate && name === CANARY && !rateOk && !FORCE) {
          entry.probe = 'probe-skip(rate-low)';
        } else {
          const heal = await tryHeal(name, red.run, state, nowMs);
          entry.probe = heal.reason;
          if (heal.probed) result.counts.probed++;
        }
      }

      result.repos.push(scrub(entry));
      if (entry.verdict === 'MINUTES-BLOCKED') result.counts.blocked++;
      else if (entry.verdict === 'GENUINE-RED') result.counts.genuineRed++;
      else if (entry.verdict === 'HEALED') result.counts.other++;
      else result.counts.other++;
    } catch (e) {
      result.repos.push(scrub({ name, visibility, verdict: 'SCAN-ERROR', error: String(e?.message || e).slice(0, 200) }));
      result.counts.other++;
    }
  }

  result.rateRemaining = rateRemaining;
  result.verdict = result.counts.genuineRed > 0 ? 'FLEET-RED'
    : result.counts.blocked > 0 ? 'FLEET-BILLING-BLOCKED'
    : 'FLEET-GREEN';
  saveState(state);

  writeFileSync(LATEST, JSON.stringify(result, null, 1) + '\n');
  mkdirSync(RECEIPTS, { recursive: true });
  const stamp = at.replace(/[:.]/g, '-');
  writeFileSync(path.join(RECEIPTS, `scan-${stamp}.json`), JSON.stringify(scrub(result), null, 1) + '\n');
  mkdirSync(path.dirname(LEDGER), { recursive: true });
  const line = JSON.stringify({
    at, verdict: result.verdict,
    chain: createHash('sha256').update(`${at}|${result.verdict}|${result.counts.repos}`).digest('hex').slice(0, 24),
    counts: result.counts,
    blocked: result.repos.filter(r => r.verdict === 'MINUTES-BLOCKED').map(r => r.name),
    reds: result.repos.filter(r => r.verdict === 'GENUINE-RED').map(r => r.name),
    healed: result.repos.filter(r => r.verdict === 'HEALED').map(r => r.name),
  }) + '\n';
  let lines = [];
  if (existsSync(LEDGER)) lines = readFileSync(LEDGER, 'utf8').trim().split('\n').filter(Boolean);
  lines.push(line);
  if (lines.length > LEDGER_TAIL) lines = lines.slice(-LEDGER_TAIL);
  writeFileSync(LEDGER, lines.join('\n') + '\n');

  console.log(`[heal] ✔ ${at} · verdict=${result.verdict} · repos=${result.counts.repos} · green=${result.counts.green} · blocked=${result.counts.blocked} · red=${result.counts.genuineRed} · healed=${result.counts.healed} · probed=${result.counts.probed}`);
} catch (err) {
  // כישלון-כנה: קבלה-אדומה-נקופלת-וגם-יציאה-1
  const errReceipt = { schema: 'fleet-heal/1', at, fatal: String(err?.message || err).slice(0, 400) };
  try {
    mkdirSync(RECEIPTS, { recursive: true });
    writeFileSync(path.join(RECEIPTS, `fatal-${at.replace(/[:.]/g, '-')}.json`), JSON.stringify(errReceipt, null, 1) + '\n');
    if (!existsSync(LEDGER)) mkdirSync(path.dirname(LEDGER), { recursive: true });
    appendFileSync(LEDGER, JSON.stringify({ at, verdict: 'HEAL-FATAL', fatal: errReceipt.fatal }) + '\n');
  } catch { /* דיסק-אבסורב */ }
  console.error('[heal] ✖ כישלון-כנה:', errReceipt.fatal);
  process.exit(1);
}
