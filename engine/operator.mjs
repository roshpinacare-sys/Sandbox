#!/usr/bin/env node
/**
 * operator.mjs — פעולות-מפעיל-מהענן (T-43b · Sandbox · משפחת-agent-3)
 * ═════════════════════════════════════════════════════════════════════════════
 * נועד-workflow_dispatch (sovereign-state.yml) עם env בלבד:
 *   SBX_ACTION ∈ {health · selftest · snapshot · arm · disarm} · SBX_NOTE — נימוק-חופשי.
 * כל-פעולה = טיק-מדידה (tickCount+1): מדידות → מרקל-מצטבר מתקדם → כתיבה-אטומית →
 * שורת-keeper.log עם-סיומת `op=<action>`.
 *   · health   — מדידות-טיק-מלאות + סוללת (a)–(f) + הד-custody
 *   · selftest — סוללה-מורחבת (a)–(i) (כולל-חוזה-workflow · חוזה-README · קיום-קבצי-מדינה)
 *   · snapshot — מדידות + הד-custody + הערת-פנקס
 *   · arm      — חייב-נימוק (SBX_NOTE לא-ריק) אחרת-סירוב-כן-בלי-כתיבה
 *   · disarm   — חזרה-ל-dryrun
 * פעולה-לא-מוכרת = יציאה-1-כנה בלי-כתיבה. כישלון-נתפס = מצב-כן (failed) + יציאה-1.
 */
import {
  ACTIONS,
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
  STATE_FILE,
} from "./state-lib.mjs";

const action = (process.env.SBX_ACTION || "").trim();
const rawNote = process.env.SBX_NOTE;
const note = typeof rawNote === "string" ? rawNote.trim() : null;

if (!ACTIONS.includes(action)) {
  console.error(
    `[operator] ✖ פעולה-חסרה-או-לא-מוכרת ("${action || "ריק"}") — המותר: ${ACTIONS.join(" · ")}`,
  );
  process.exit(1);
}
if (action === "arm" && !note) {
  console.error("[operator] ✖ arm-מחייב-נימוק");
  process.exit(1);
}

function main() {
  let prevState = null;
  let st = null; // מצבר-הסוללה — לרישום-כן-גם-בכישלון
  let at = null;
  let stateWritten = false;
  try {
    prevState = loadState();
    at = nowIso();
    const m = gitMeasurements(); // מדידה-לפני-כל-כתיבה
    // health/selftest רצות-סוללה; snapshot/arm/disarm אינן-טוענות-סוללה (אפס-המצאת-P/T)
    const scope = action === "health" ? "tick" : action === "selftest" ? "full" : null;
    let battery = null;
    if (scope) {
      battery = runChecks(scope, m);
      st = { passed: battery.passed, total: battery.total };
    }
    const allOk = battery ? battery.passed === battery.total : null;
    let echo = null;
    let custody = prevState.custody;
    if (action === "health" || action === "snapshot") {
      echo = receiptsEcho();
      custody = {
        source: prevState.custody.source,
        echo,
        echoedAt: at,
        status: echo.status === "absent" ? "absent" : "ok",
      };
    }
    const operator = { lastAction: action, by: "operator-dispatch", at, note: note ?? null };
    let keeperStatus = prevState.keeper.status; // ללא-סוללה — נשמר-המדד-האחרון, לא-מומצא
    let cf = prevState.keeper.consecutiveFailures;
    let selftest = prevState.selftest;
    if (battery) {
      keeperStatus = allOk ? "ok" : "degraded";
      cf = allOk ? 0 : prevState.keeper.consecutiveFailures + 1;
      selftest = {
        passed: battery.passed,
        total: battery.total,
        at,
        status: allOk ? "ok" : "failed",
      };
    }
    const keeper = {
      tickCount: prevState.keeper.tickCount + 1, // כל-פעולה = טיק-מדידה
      lastTick: at,
      lastHead: m.headSha,
      status: keeperStatus,
      consecutiveFailures: cf,
    };
    let killSwitch = prevState.killSwitch;
    const noteEntries = [];
    switch (action) {
      case "health":
        noteEntries.push(`op#health ${keeperStatus} ${st.passed}/${st.total} head=${m.headSha ?? "null"}`);
        break;
      case "selftest":
        noteEntries.push(`op#selftest ${keeperStatus} ${st.passed}/${st.total} head=${m.headSha ?? "null"}`);
        break;
      case "snapshot":
        noteEntries.push("snapshot by operator");
        break;
      case "arm":
        killSwitch = { mode: "armed", since: at, note };
        noteEntries.push(`ARMED: ${note}`);
        break;
      case "disarm":
        killSwitch = { mode: "dryrun", since: at, note: "disarmed by operator" };
        noteEntries.push("disarmed by operator");
        break;
    }
    const chain = {
      headSha: m.headSha,
      dirtyFiles: m.dirtyFiles,
      trackedFiles: m.trackedFiles,
      worklogLines: m.worklogLines,
    };
    const core = coreOf({ keeper, operator, killSwitch, custody, selftest, chain });
    const { chainRoot } = merkleAdvance(prevState.merkle, core);
    // ללא-סוללה — שורת-היומן-נושאת-את-P/T-המדוד-האחרון-הרשום (כנות: לא-מדידה-חדשה)
    const logSt = st ?? { passed: selftest.passed, total: selftest.total };
    const logLine = keeperLine({
      at,
      n: keeper.tickCount,
      outcome: battery ? (allOk ? "ok" : "fail") : "ok",
      head: m.headSha,
      merkle: chainRoot,
      st: logSt,
      op: action,
    });
    if (!logLine) noteEntries.push("log-הושמט: head-לא-נמדד (אפס-זיוף-פורמט)");
    let notes = [...prevState.notes];
    for (const e of noteEntries) notes = boundedNotes(notes, truncate(e, 200));
    const nextState = {
      schema: SCHEMA,
      updatedAt: at,
      genesis: prevState.genesis,
      prevMerkle: prevState.merkle,
      merkle: chainRoot,
      keeper,
      operator,
      killSwitch,
      custody,
      selftest,
      chain,
      notes,
    };
    validateState(nextState); // שער-עצמי — לא-כותבים-מצב-שאינו-עומד-בחוזה
    atomicWrite(STATE_FILE, `${JSON.stringify(nextState, null, 2)}\n`);
    stateWritten = true;
    if (logLine) appendKeeperLog(logLine);
    const p = logSt.passed;
    const t = logSt.total;
    console.log(
      `[operator] ✔ ${action} · tick#${keeper.tickCount} · head=${m.headSha ?? "null"} · merkle=${chainRoot.slice(0, 8)}${battery ? ` · st=${p}/${t}` : " · ללא-סוללה"}`,
    );
  } catch (err) {
    const msg = truncate(String((err && err.message) || err), 200);
    if (stateWritten) {
      console.error(`[operator] ✖ כשל-אחרי-כתיבת-המצב: ${msg}`);
      process.exit(1);
    }
    if (!prevState) {
      console.error(`[operator] ✖ טעינת-מצב-המדינה-נכשלה — לא-נכתב-מצב-מומצא: ${msg}`);
      process.exit(1);
    }
    try {
      const r = writeHonestFailure({ prevState, at: at ?? nowIso(), error: err, st, op: action });
      console.error(`[operator] ✖ ${action}-נכשל — נרשם-בכנות (failed): ${msg}`);
      if (r.logError) console.error(`[operator] ✖ שורת-יומן-לא-נכתבה: ${truncate(String(r.logError.message || r.logError), 200)}`);
      process.exit(1);
    } catch (e2) {
      console.error(`[operator] ✖ גם-כתיבת-מצב-הכישלון-נכשלה: ${truncate(String((e2 && e2.message) || e2), 200)}`);
      process.exit(1);
    }
  }
}

main();
