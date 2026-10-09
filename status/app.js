/* =====================================================================
   status/app.js — דף-המצב הציבורי של Sandbox הריבוני
   חוק-הכנות: כאן מוצג רק מה שנשלף מהגיט. כישלון-שליפה = "מצב-לא-זמין" מפורש.
   אין-נתוני-דמה, אין-ערכים-מנומונטים.
   אבטחה: כל-נתון-נשלף מוזרק דרך textContent בלבד — אף-innerHTML.
   הטוקן חי ב-sessionStorage בלבד, לעולם לא נרנדר ולא נרשם.
   אפס-תלות-חוץ, אפס-CDN, אפס-מעקב.
   ===================================================================== */
'use strict';
(function () {

  var OWNER = 'roshpinacare-sys';
  var REPO = 'Sandbox';
  var RAW_BASE = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/main/state/';
  var STATE_URL = RAW_BASE + 'network-state.json';
  var LOG_URL = RAW_BASE + 'keeper.log';
  var DISPATCH_URL = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/actions/workflows/sovereign-state.yml/dispatches';
  var TOKEN_KEY = 'sbx.op.token';
  var REFRESH_MS = 60000;            /* רענון-אוטומטי: 60 שניות */
  var IDLE_MS = 15 * 60 * 1000;      /* נעילת-מפעיל: 15 דקות אי-פעילות */
  var FRESH_MS = 45 * 60 * 1000;     /* טיק-רענן עד 45 דק' = ירוק */
  var DAY_MS = 24 * 60 * 60 * 1000;  /* מעבר ליום = אדום */
  var UNAVAIL = 'מצב-לא-זמין';

  var VALUE_IDS = [
    'v-updated', 'v-updated-age', 'v-schema',
    'v-keeper-ticks', 'v-keeper-lasttick', 'v-keeper-age', 'v-keeper-head', 'v-keeper-fails',
    'v-merkle-prev', 'v-merkle-cur', 'v-merkle-genesis', 'v-merkle-note',
    'v-switch-mode', 'v-switch-since', 'v-switch-note',
    'v-custody-src', 'v-custody-status', 'v-custody-at', 'v-custody-head', 'v-custody-files',
    'v-custody-dirty', 'v-custody-keys', 'v-custody-echoedat', 'v-custody-bytes',
    'v-selftest-score', 'v-selftest-status', 'v-selftest-at',
    'v-chain-head', 'v-chain-tracked', 'v-chain-dirty', 'v-chain-worklog',
    'v-footer-merkle'
  ];

  var LED_IDS = ['overall', 'led-overall', 'led-keeper', 'led-switch', 'led-selftest', 'led-custody'];

  /* מילון-סטטוסים סגור (state/README.md · sanbox-state/1) */
  var KEEPER_LED = { 'ok': ['green', 'תקין'], 'degraded': ['amber', 'מדורדר'], 'failed': ['red', 'כשל'], 'never-run': ['gray', 'טרם-רץ'] };
  var SELFTEST_LED = { 'ok': ['green', 'עבר'], 'failed': ['red', 'נכשל'], 'never-run': ['gray', 'טרם-רץ'] };
  var CUSTODY_LED = { 'ok': ['green', 'תקין'], 'unmeasured': ['gray', 'לא-נמדד'], 'absent': ['red', 'נעדר'] };
  var STATUS_HE = { 'ok': 'תקין', 'degraded': 'מדורדר', 'failed': 'כשל', 'never-run': 'טרם-רץ', 'unmeasured': 'לא-נמדד', 'absent': 'נעדר' };

  var fmtJlmFull = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'medium', timeStyle: 'medium' });
  var fmtJlmClock = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  var fmtUtcClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  /* ---- עזרי-DOM (textContent בלבד) ---- */
  function $(id) { return document.getElementById(id); }
  function set(id, text) { var el = $(id); if (el) el.textContent = text; }

  /* ---- עזרי-זמן ---- */
  function safeDate(iso) {
    if (typeof iso !== 'string') return null;
    var t = Date.parse(iso);
    return Number.isNaN(t) ? null : t;
  }
  function jlmFull(iso) { var t = safeDate(iso); return t === null ? '—' : fmtJlmFull.format(t); }
  function ageText(iso, now) {
    var t = safeDate(iso);
    if (t === null) return null;
    var s = Math.round((now.getTime() - t) / 1000);
    if (s < 0) s = 0;
    if (s < 60) return 'לפני ' + s + ' שנ׳';
    var m = Math.floor(s / 60);
    if (m < 60) return 'לפני ' + m + ' דק׳';
    var h = Math.floor(m / 60);
    if (h < 48) return 'לפני ' + h + ' שע׳';
    return 'לפני ' + Math.floor(h / 24) + ' ימ׳';
  }

  function num(v) { return (v === undefined || v === null || v === '') ? '—' : String(v); }
  function hexN(v, n) { return (typeof v === 'string' && v.length > 0) ? v.slice(0, n) : null; }

  function setLed(id, color, text, pulse) {
    var el = $(id);
    if (el) { el.dataset.state = color; el.dataset.pulse = pulse ? '1' : '0'; }
    set(id + '-text', text);
  }
  function ledFor(map, status) { return map[status] || ['gray', num(status)]; }

  /* ---- שעון-חי: ירושלים + UTC ---- */
  function tickClock() {
    var now = new Date();
    set('v-clock-jlm', fmtJlmClock.format(now));
    set('v-clock-utc', 'UTC ' + fmtUtcClock.format(now));
  }

  /* ---- מצב-כללי: ירוק עד-45-דק', ענבר בתוך-24-שע', אדום מעבר/כשל/טרם-רץ ---- */
  function overallOf(state, now) {
    var k = state.keeper || {};
    if (k.status === 'failed') return ['red', 'כשל', true];
    var t = safeDate(k.lastTick);
    if (k.status === 'never-run' || t === null) return ['red', 'טרם-רץ', true];
    var age = now.getTime() - t;
    if (k.status === 'ok' && age < FRESH_MS) return ['green', 'תקין', false];
    if (age < DAY_MS) return ['amber', 'מיושן', false];
    return ['red', 'מחוץ-לקשר', true];
  }

  /* ---- רינדור-מלא של מדינת-הרשת (רק-מדידות) ---- */
  function renderState(state, now) {
    set('v-schema', num(state.schema));
    set('v-updated', jlmFull(state.updatedAt));
    set('v-updated-age', ageText(state.updatedAt, now) || '—');

    var ov = overallOf(state, now);
    setLed('overall', ov[0], ov[1], ov[2]);
    setLed('led-overall', ov[0], ov[1], ov[2]);

    /* keeper */
    var k = state.keeper || {};
    set('v-keeper-ticks', num(k.tickCount));
    set('v-keeper-lasttick', k.lastTick ? jlmFull(k.lastTick) : '—');
    set('v-keeper-age', ageText(k.lastTick, now) || '—');
    set('v-keeper-head', hexN(k.lastHead, 12) || '—');
    set('v-keeper-fails', num(k.consecutiveFailures));
    var failsEl = $('v-keeper-fails');
    if (failsEl) failsEl.classList.toggle('bad', Number(k.consecutiveFailures) > 0);
    var kl = ledFor(KEEPER_LED, k.status);
    setLed('led-keeper', kl[0], kl[1], false);

    /* מרקל */
    set('v-merkle-prev', hexN(state.prevMerkle, 16) || '—');
    set('v-merkle-cur', hexN(state.merkle, 16) || '—');
    set('v-merkle-genesis', hexN(state.genesis, 16) || '—');
    var mnote;
    if (state.prevMerkle === null || state.prevMerkle === undefined) mnote = 'זרע-היווסד — עוד-אין-טיק בעולם';
    else if (state.prevMerkle === state.genesis) mnote = 'טיק-ראשון בעולם — prevMerkle = genesis';
    else mnote = 'שרשרת-מצטברת — כל-טיק נארג מעל-קודמו';
    set('v-merkle-note', mnote);

    /* מתג-ריבונות */
    var ks = state.killSwitch || {};
    set('v-switch-mode', ks.mode === 'dryrun' ? 'יבש (dryrun)' : (ks.mode === 'armed' ? 'חמוש (armed)' : num(ks.mode)));
    set('v-switch-since', ks.since ? (jlmFull(ks.since) + ' · ' + (ageText(ks.since, now) || '')) : '—');
    set('v-switch-note', num(ks.note));
    if (ks.mode === 'dryrun') setLed('led-switch', 'green', 'יבש', false);
    else if (ks.mode === 'armed') setLed('led-switch', 'amber', 'חמוש', true);
    else setLed('led-switch', 'gray', num(ks.mode), false);

    /* custody-echo */
    var c = state.custody || {};
    var e = (c.echo && typeof c.echo === 'object') ? c.echo : null;
    set('v-custody-src', num(c.source));
    set('v-custody-status', STATUS_HE[c.status] || num(c.status));
    set('v-custody-at', e ? jlmFull(e.at) : '—');
    set('v-custody-head', e ? (hexN(e.head, 8) || '—') : '—');
    set('v-custody-files', e ? num(e.files) : '—');
    set('v-custody-dirty', e ? num(e.dirty) : '—');
    set('v-custody-bytes', e ? (hexN(e.bytesSha256, 12) || '—') : '—');
    set('v-custody-echoedat', c.echoedAt ? jlmFull(c.echoedAt) : '—');
    var keysEl = $('v-custody-keys');
    if (keysEl) {
      keysEl.classList.remove('bad', 'good');
      if (e && e.keysLeaked === true) { keysEl.textContent = 'אמת'; keysEl.classList.add('bad'); }
      else if (e && e.keysLeaked === false) { keysEl.textContent = 'שקר'; keysEl.classList.add('good'); }
      else keysEl.textContent = e ? 'לא-נמדד' : '—';
    }
    var cl = ledFor(CUSTODY_LED, c.status);
    setLed('led-custody', cl[0], cl[1], false);

    /* selftest */
    var st = state.selftest || {};
    set('v-selftest-score', num(st.passed) + '/' + num(st.total));
    set('v-selftest-status', STATUS_HE[st.status] || num(st.status));
    set('v-selftest-at', st.at ? jlmFull(st.at) : '—');
    var sl = ledFor(SELFTEST_LED, st.status);
    setLed('led-selftest', sl[0], sl[1], false);

    /* chain */
    var ch = state.chain || {};
    set('v-chain-head', hexN(ch.headSha, 12) || '—');
    set('v-chain-tracked', num(ch.trackedFiles));
    set('v-chain-dirty', num(ch.dirtyFiles));
    set('v-chain-worklog', num(ch.worklogLines));

    /* תחתית */
    set('v-footer-merkle', hexN(state.merkle, 16) || '—');
  }

  /* ---- מצב-לא-זמין מפורש בכל-פאנל (כישלון-שליפה) ---- */
  function setUnavailable() {
    VALUE_IDS.forEach(function (id) { set(id, UNAVAIL); });
    var failsEl = $('v-keeper-fails');
    if (failsEl) failsEl.classList.remove('bad');
    var keysEl = $('v-custody-keys');
    if (keysEl) keysEl.classList.remove('bad', 'good');
    LED_IDS.forEach(function (id) { setLed(id, 'gray', UNAVAIL, false); });
    renderLog(null);
  }

  /* ---- יומן-טיקים: 30 שורות לא-הערה, textContent בלבד ---- */
  function renderLog(text) {
    var el = $('v-log');
    if (!el) return;
    if (text === null) {
      el.textContent = '— ' + UNAVAIL + ': keeper.log לא-נשלף —';
      el.classList.add('unavail');
      return;
    }
    var lines = String(text).split(/\r?\n/).filter(function (l) {
      var s = l.trim();
      return s !== '' && s.charAt(0) !== '#';
    });
    var tail = lines.slice(-30);
    el.classList.remove('unavail');
    el.textContent = tail.length > 0 ? tail.join('\n') : '— היומן-נשלף ואין-בו שורות-טיק עדיין —';
  }

  /* ---- שליפה (cache-busting + no-store) ---- */
  function fetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) return null;
      return r.text();
    }).catch(function () { return null; });
  }

  function announce(msg) { set('live', msg); }

  var refreshSeq = 0;
  var inFlight = false;
  function refresh() {
    if (inFlight) return;
    inFlight = true;
    var seq = ++refreshSeq;
    var stamp = Date.now();
    return Promise.all([
      fetchText(STATE_URL + '?t=' + stamp),
      fetchText(LOG_URL + '?t=' + stamp)
    ]).then(function (res) {
      if (seq !== refreshSeq) return null;
      var stateText = res[0];
      var logText = res[1];
      var state = null;
      if (stateText !== null) {
        try { state = JSON.parse(stateText); } catch (err) { state = null; }
      }
      renderLog(logText);
      if (state && typeof state === 'object') renderState(state, new Date());
      else setUnavailable();
      announce(state ? 'המצב-עודכן — נקרא חי מהגיט' : 'השליפה-נכשלה — מצב-לא-זמין');
      return null;
    }).catch(function () {
      if (seq === refreshSeq) setUnavailable();
      return null;
    }).then(function (v) {
      inFlight = false;
      return v;
    });
  }

  /* =====================================================================
     פאנל-מפעיל — טוקן-ב-sessionStorage בלבד · נעילת-עצלות 15 דק'
     לעולם לא נרנדר, לא נרשם, לא נשלח פרט ל-api.github.com
     ===================================================================== */
  var opBody = $('op-body');
  var opToggle = $('op-toggle');
  var opToken = $('op-token');
  var opResult = $('op-result');
  var opAction = $('op-action');
  var opNote = $('op-note');
  var opNoteHint = $('op-note-hint');

  function opOpen() { return !!opBody && !opBody.hidden; }

  function setOpOpen(open) {
    if (!opBody || !opToggle) return;
    opBody.hidden = !open;
    opToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    set('op-hint', open ? 'פתוח ▴' : 'סגור ▾');
  }

  function readToken() {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch (err) { return null; }
  }
  function updateTokenState() {
    set('op-token-state', readToken() ? 'טוקן-שמור — בלשונית-זו בלבד' : 'אין-טוקן-שמור');
  }
  function setOpResult(msg, ok) {
    if (!opResult) return;
    opResult.textContent = msg;
    opResult.classList.toggle('ok', !!ok);
    opResult.classList.toggle('err', !ok);
  }

  if (opToggle) opToggle.addEventListener('click', function () { setOpOpen(!opOpen()); });

  var btnSave = $('op-save');
  if (btnSave) btnSave.addEventListener('click', function () {
    var v = opToken ? opToken.value : '';
    if (!v) { setOpResult('אין-מה-לשמור — הזן-טוקן תחילה', false); return; }
    try { sessionStorage.setItem(TOKEN_KEY, v); }
    catch (err) { setOpResult('השמירה-נכשלה — sessionStorage חסום בלשונית-זו', false); return; }
    if (opToken) opToken.value = '';
    updateTokenState();
    setOpResult('הטוקן-נשמר בזיכרון-הלשונית — לא נשלח לשום-מקום עד לחיצה על שגר-פעולה', true);
  });

  var btnClear = $('op-clear');
  if (btnClear) btnClear.addEventListener('click', function () {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (err) { /* כבר-נקי */ }
    if (opToken) opToken.value = '';
    updateTokenState();
    setOpResult('הטוקן-נמחק מהלשונית', true);
  });

  function syncNoteHint() {
    var need = !!opAction && opAction.value === 'arm';
    if (opNoteHint) opNoteHint.hidden = !need;
    if (opNote) opNote.required = need;
  }
  if (opAction) opAction.addEventListener('change', syncNoteHint);

  var btnDispatch = $('op-dispatch');
  if (btnDispatch) btnDispatch.addEventListener('click', function () {
    var token = readToken();
    if (!token) { setOpResult('אין-טוקן-שמור — שמור-טוקן תחילה', false); return; }
    var action = opAction ? opAction.value : 'auto';
    var note = opNote ? opNote.value.trim() : '';
    if (action === 'arm' && !note) { setOpResult('arm מחייב נימוק — מלא את שדה הנימוק', false); return; }
    btnDispatch.disabled = true;
    setOpResult('שולח אל GitHub…', true);
    fetch(DISPATCH_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main', inputs: { action: action, note: note } })
    }).then(function (r) {
      if (r.status === 204) setOpResult('הפעולה-נקלטה ב-GitHub — בדוק את טאב ה-Actions', true);
      else if (r.status === 403) setOpResult('לטוקן אין הרשאת actions', false);
      else if (r.status === 401) setOpResult('GitHub דחה את-הטוקן (401) — נקה-טוקן והזן-טוקן תקף', false);
      else setOpResult('GitHub השיב ' + r.status + (r.statusText ? ' — ' + r.statusText : '') + ' — הפעולה-לא-נקלטה', false);
    }).catch(function () {
      setOpResult('השליחה-נכשלה ברשת — הפעולה-לא-נקלטה', false);
    }).then(function () {
      btnDispatch.disabled = false;
    });
  });

  /* נעילת-עצלות: מחיקת-טוקן + קיפול-הפאנל אחרי 15 דק' בלי-אינטראקציה */
  var idleHandle = null;
  function lockOperator() {
    var had = readToken() !== null;
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (err) { /* כבר-נקי */ }
    if (opToken) opToken.value = '';
    updateTokenState();
    setOpOpen(false);
    if (had) setOpResult('ננעל לאחר 15 דקות-אי-פעילות — הטוקן-נמחק', false);
  }
  function armIdleLock() {
    if (idleHandle !== null) clearTimeout(idleHandle);
    idleHandle = setTimeout(lockOperator, IDLE_MS);
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
    document.addEventListener(t, armIdleLock, { passive: true, capture: true });
  });

  /* ---- אתחול ---- */
  function init() {
    updateTokenState();
    syncNoteHint();
    tickClock();
    setInterval(tickClock, 1000);
    setInterval(refresh, REFRESH_MS);
    armIdleLock();
    var refreshBtn = $('btn-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', function () {
      announce('מרענן מהגיט…');
      refresh();
    });
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
