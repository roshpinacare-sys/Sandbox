#!/usr/bin/env node
/**
 * state-tick.mjs — טיק-מדינת-הרשת (T-43b · Sandbox · משפחת-agent-3)
 * ═════════════════════════════════════════════════════════════════════════════
 * העורק-המודד של `sanbox-state/1`: רץ ב-cron (sovereign-state.yml, 3,18,33,48 * * * *)
 * וב-dispatch action=auto. רצף-מחייב: טעינה+תיקוף → מדידות-git (לפני-כל-כתיבה) →
 * הד-receipts → סוללת-בדיקות (a)–(f) → קידום-מרקל-מצטבר → כתיבה-אטומית → שורת-יומן אחת.
 * כותב-רק תחת state/ (network-state.json · keeper.log) · לעולם-לא-push · לעולם-לא-receipts.
 * כישלון-נתפס = מצב-כן (failed + consecutiveFailures+1 + הערה) + יציאה-1 — לעולם-לא-ירוק-מזויף.
 * אם-קובץ-המדינה-עצמו-אינו-נטען/מתוקף — אין-על-מי-לכתוב: יוצאים-1-כנה בלי-להמציא-מצב.
 */
import {
  STATE_FILE,
  SCHEMA,
  loadState,
  validateState,
  gitMeasurements,
  receiptsEcho,
  runChecks,
  merkleAdvance,
  coreOf,
  boundedNotes,
  atomicWrite,
  keeperLine,
  appendKeeperLog,
  writeHonestFailure,
  nowIso,
  truncate,
} from "./state-lib.mjs";

function main() {
  let prevState = null;
  let st = null; // מצבר-הסוללה — לרישום-כן-גם-בכישלון
  let at = null;
  let stateWritten = false;
  try {
    prevState = loadState(); // טעינה+תיקוף — זריקה-כנה אם-החוזה-מופר
    at = nowIso();
    const m = gitMeasurements(); // מדידה-לפני-כל-כתיבה
    const echo = receiptsEcho();
    const battery = runChecks("tick", m);
    st = { passed: battery.passed, total: battery.total };
    const allOk = battery.passed === battery.total;
    const status = allOk ? "ok" : "degraded";
    const n = prevState.keeper.tickCount + 1;
    const keeper = {
      tickCount: n,
      lastTick: at,
      lastHead: m.headSha,
      status,
      // degraded נמדד-ככישלון-רצוף (חוזה); ok מאפס-את-המונה
      consecutiveFailures: allOk ? 0 : prevState.keeper.consecutiveFailures + 1,
    };
    const custody = {
      source: prevState.custody.source,
      echo,
      echoedAt: at, // זמן-מדידת-ההד — גם-כשתוצאתו 'absent'
      status: echo.status === "absent" ? "absent" : "ok",
    };
    const selftest = {
      passed: battery.passed,
      total: battery.total,
      at,
      status: allOk ? "ok" : "failed",
    };
    const chain = {
      headSha: m.headSha,
      dirtyFiles: m.dirtyFiles,
      trackedFiles: m.trackedFiles,
      worklogLines: m.worklogLines,
    };
    const core = coreOf({
      keeper,
      operator: prevState.operator,
      killSwitch: prevState.killSwitch,
      custody,
      selftest,
      chain,
    });
    const { chainRoot } = merkleAdvance(prevState.merkle, core);
    const headWord = m.headSha ?? "null";
    let noteEntry = `tick#${n} ${status} ${battery.passed}/${battery.total} head=${headWord}`;
    const failedIds = battery.checks.filter((c) => !c.ok).map((c) => c.id);
    if (failedIds.length) noteEntry += ` fail:${failedIds.join(",")}`;
    const logLine = keeperLine({
      at,
      n,
      outcome: allOk ? "ok" : "fail",
      head: m.headSha,
      merkle: chainRoot,
      st,
      op: null,
    });
    if (!logLine) noteEntry += " log-הושמט:head-לא-נמדד"; // אפס-שורות-כוזבות-ביומן
    const nextState = {
      schema: SCHEMA,
      updatedAt: at,
      genesis: prevState.genesis,
      prevMerkle: prevState.merkle, // chainRoot_{n-1}
      merkle: chainRoot, // chainRoot_n
      keeper,
      operator: prevState.operator,
      killSwitch: prevState.killSwitch,
      custody,
      selftest,
      chain,
      notes: boundedNotes(prevState.notes, truncate(noteEntry, 200)),
    };
    validateState(nextState); // שער-עצמי — לא-כותבים-מצב-שאינו-עומד-בחוזה
    atomicWrite(STATE_FILE, `${JSON.stringify(nextState, null, 2)}\n`);
    stateWritten = true;
    if (logLine) appendKeeperLog(logLine);
    console.log(
      `[state-tick] ✔ tick#${n} ${status} st=${battery.passed}/${battery.total} head=${headWord} merkle=${chainRoot.slice(0, 8)}${logLine ? "" : " · שורת-יומן-הושמטה(head-לא-נמדד)"}`,
    );
  } catch (err) {
    const msg = truncate(String((err && err.message) || err), 200);
    if (stateWritten) {
      // המצב-הכן-נכתב; הכישלון-אחריו (יומן) — כתיבה-חוזרת-הייתה-סופרת-טיק-כפול
      console.error(`[state-tick] ✖ כשל-אחרי-כתיבת-המצב: ${msg}`);
      process.exit(1);
    }
    if (!prevState) {
      // אין-קודם-תקף → אין-בסיס-מדידה-לכתוב-ממנו; המצאה-אסורה — יוצאים-כן-בשגיאה
      console.error(`[state-tick] ✖ טעינת-מצב-המדינה-נכשלה — לא-נכתב-מצב-מומצא: ${msg}`);
      process.exit(1);
    }
    try {
      const r = writeHonestFailure({ prevState, at: at ?? nowIso(), error: err, st, op: null });
      console.error(`[state-tick] ✖ טיק-נכשל — נרשם-בכנות (failed): ${msg}`);
      if (r.logError) console.error(`[state-tick] ✖ שורת-יומן-לא-נכתבה: ${truncate(String(r.logError.message || r.logError), 200)}`);
      process.exit(1);
    } catch (e2) {
      console.error(`[state-tick] ✖ גם-כתיבת-מצב-הכישלון-נכשלה: ${truncate(String((e2 && e2.message) || e2), 200)}`);
      process.exit(1);
    }
  }
}

main();
