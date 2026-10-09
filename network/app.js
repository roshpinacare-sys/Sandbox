"use strict";
/* לוח-הרשת הריבוני — Sandbox/network/app.js
 * טלמטריה-פומבית בלבד: receipts-מקומיים + GitHub-API פומבי. אפס-סודות.
 * ביטחון: אפס-innerHTML · אפס-eval · אפס-document.write — ה-DOM נבנה
 * ב-textContent/createElement בלבד. כל-מקור fail-soft: שגיאה → 'לא-זמין'.
 * אסור-להמציא-ערכים: מה-שנמדד מוצג, מה-שחסר מסומן. */

(() => {
  /* נתיב-בסיס דינמי: עובד-גם-ב-Pages (תת-נתיב /Sandbox/network/) וגם-בשרת-מקומי מהשורש */
  const base = (location.pathname.replace(/\/network(?:\/index\.html)?\/?$/, "") || "").replace(/\/$/, "");

  const NA = "לא-זמין";
  const MAX_TICK_LINES = 512;   /* מעל-זה — סירוב-פריסה (fail-soft) */
  const SHOWN = 6;              /* פעימות/ריצות להצגה */
  const GH_RUNS_URL = "https://api.github.com/repos/roshpinacare-sys/Sandbox/actions/runs?per_page=6";
  const CLOCK_MS = 15000;       /* עדכון-שעון-הגיל (ללא-רשת) */
  const REFRESH_MS = 120000;    /* משיכה-מחדש של-הקבלות-המקומיות */
  const GH_REFRESH_MS = 300000; /* GitHub-API — מוגבל-מכסה-פומבית, מוזלים-בו */

  const state = { tickAt: null, witnessAt: null, lastHbKey: null, lastWitnessKey: null };
  const $ = (id) => document.getElementById(id);

  /* ── בוני-DOM בטוחים ── */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function ltr(text) { return el("span", "ltr", text); }
  function naSpan() { return el("span", "na", NA); }
  function setNA(node) { node.replaceChildren(naSpan()); }
  function naCell(colspan, text) {
    const td = el("td", "na", text || NA);
    if (colspan) td.colSpan = colspan;
    return td;
  }

  /* ── זמן ── */
  function fmtUTC(iso) {
    if (typeof iso !== "string" || !iso) return NA;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso; /* לא-נותח — מוצג-גולמי-כפי-שנמדד */
    const p = (x) => String(x).padStart(2, "0");
    return d.getUTCFullYear() + "-" + p(d.getUTCMonth() + 1) + "-" + p(d.getUTCDate()) +
      " " + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + ":" + p(d.getUTCSeconds()) + " UTC";
  }
  function ageMinutes(iso) {
    if (typeof iso !== "string" || !iso) return null;
    const t = Date.parse(iso);
    if (isNaN(t)) return null;
    return Math.max(0, (Date.now() - t) / 60000); /* שעון-מקומי-מוקדם → 0, לא-שלילי */
  }

  /* ── fetch עם-חותם-אנטי-מטמון ── */
  async function fetchText(url) {
    const res = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
    return { ok: res.ok, status: res.status, text: await res.text() };
  }

  /* ══ 1 · דופק-הריבונות ═══════════════════════════════════════════════ */
  function hbStatus(mins) {
    if (mins === null) return { cls: "st-na", pill: "pill-na", label: NA };
    if (mins < 30) return { cls: "st-ok",   pill: "pill-ok",   label: "דופק-תקין" };
    if (mins < 90) return { cls: "st-warn", pill: "pill-warn", label: "מאחר" };
    return { cls: "st-bad", pill: "pill-bad", label: "דופק-חסר — דרוש-תחקיר" };
  }

  function clockTick() {
    const wrap = $("hb-wrap"), age = $("hb-age"), pill = $("hb-pill");
    const mins = ageMinutes(state.tickAt);
    const st = hbStatus(mins);
    const m = mins === null ? null : Math.floor(mins);
    const key = st.pill + "|" + (m === null ? "na" : String(m));
    if (key === state.lastHbKey) return; /* שינוי-אפס — אין-רעש-לקוראי-מסך */
    state.lastHbKey = key;
    wrap.className = "hb-wrap " + st.cls;
    age.className = "hb-age " + st.cls;
    pill.className = "hb-pill " + st.pill;
    if (m === null) {
      age.replaceChildren(el("span", "num", NA));
      pill.textContent = NA;
    } else {
      age.replaceChildren(
        el("span", "num", String(m)),
        el("span", "unit", " דק' מאז-הטביעה"),
      );
      pill.textContent = st.label;
    }
    renderWitnessAge();
  }

  function putMeta(id, value) {
    const node = $(id);
    node.replaceChildren();
    if (value === undefined || value === null || value === "") node.appendChild(naSpan());
    else node.appendChild(ltr(String(value)));
  }

  async function loadHeartbeat() {
    state.tickAt = null;
    try {
      const { ok, status, text } = await fetchText(base + "/receipts/latest.json");
      if (!ok) throw new Error("HTTP " + status);
      const d = JSON.parse(text);
      if (!d || d.schema !== "sandbox.tick/1" || typeof d.at !== "string") throw new Error("schema");
      state.tickAt = d.at;
      putMeta("hb-head", d.head);
      putMeta("hb-mode", d.mode);
      putMeta("hb-files", d.files);
      putMeta("hb-dirty", d.dirty);
      putMeta("hb-wll", d.worklogLines);
      putMeta("hb-chain", d.chain);
      $("hb-at").textContent = "טביעה-אחרונה: " + fmtUTC(d.at) + " · מקור: receipts/latest.json";
    } catch (e) {
      for (const id of ["hb-head", "hb-mode", "hb-files", "hb-dirty", "hb-wll", "hb-chain"]) putMeta(id, null);
      $("hb-at").textContent = "טביעה-אחרונה: " + NA + " · מקור: receipts/latest.json";
    }
    state.lastHbKey = null; /* כפה-רינדור */
    clockTick();
  }

  /* ══ 2 · פעימות-אחרונות ══════════════════════════════════════════════ */
  async function loadTicks() {
    const tbody = $("ticks-body");
    try {
      const { ok, status, text } = await fetchText(base + "/receipts/ticks.jsonl");
      if (!ok) throw new Error("HTTP " + status);
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > MAX_TICK_LINES) throw Object.assign(new Error("too-many"), { many: true });
      const ticks = [];
      for (const line of lines) {
        try {
          const t = JSON.parse(line);
          if (t && typeof t === "object" && t.schema === "sandbox.tick/1" && typeof t.at === "string") ticks.push(t);
        } catch { /* שורה-פגומה — מדלגים (fail-soft) */ }
      }
      if (!ticks.length) throw new Error("no-valid-ticks");
      tbody.replaceChildren();
      for (const t of ticks.slice(-SHOWN).reverse()) {
        const tr = el("tr");
        const tdTime = el("td"); tdTime.appendChild(el("span", "ltr", fmtUTC(t.at)));
        const tdHead = el("td"); tdHead.appendChild(t.head !== undefined && t.head !== null ? ltr(String(t.head)) : naSpan());
        const tdMode = el("td"); tdMode.appendChild(t.mode !== undefined && t.mode !== null ? ltr(String(t.mode)) : naSpan());
        tr.append(tdTime, tdHead, tdMode);
        tbody.appendChild(tr);
      }
    } catch (e) {
      tbody.replaceChildren();
      tbody.appendChild(naCell(3, e && e.many ? NA + " — מעל-" + MAX_TICK_LINES + "-שורות" : NA));
    }
  }

  /* ══ 3 · מבט-הרשת ════════════════════════════════════════════════════ */
  function renderGuard(node, g) {
    node.replaceChildren();
    if (!g || typeof g !== "object") { setNA(node); return; }
    const comparable = typeof g.head === "string" && typeof g.origin === "string";
    const linear = comparable ? g.head === g.origin : null;
    node.appendChild(el("span", "pill " + (linear === null ? "pill-na" : linear ? "pill-ok" : "pill-bad"),
      linear === null ? NA : linear ? "ישר" : "סטה"));
    node.appendChild(el("span", "k", " head "));
    node.appendChild(g.head !== undefined && g.head !== null ? ltr(String(g.head)) : naSpan());
    node.appendChild(el("span", "k", " · origin "));
    node.appendChild(g.origin !== undefined && g.origin !== null ? ltr(String(g.origin)) : naSpan());
    if (typeof g.behind === "number") { node.appendChild(el("span", "k", " · behind ")); node.appendChild(ltr(String(g.behind))); }
    if (typeof g.ahead === "number") { node.appendChild(el("span", "k", " · ahead ")); node.appendChild(ltr(String(g.ahead))); }
    node.appendChild(el("span", "k", " · "));
    node.appendChild(el("span", "ltr", fmtUTC(g.at)));
  }

  function renderStatus(node, s) {
    node.replaceChildren();
    if (!s || typeof s !== "object") { setNA(node); return; }
    const flag = s.all_ok;
    node.appendChild(el("span", "pill " + (flag === true ? "pill-ok" : flag === false ? "pill-bad" : "pill-na"),
      flag === true ? "תקין" : flag === false ? "בעייה" : NA));
    node.appendChild(el("span", "k", " · "));
    node.appendChild(el("span", "ltr", "ts " + fmtUTC(s.ts)));
  }

  function renderWitnessAge() {
    const dd = $("net-witness");
    const ageSpan = dd ? dd.querySelector(".w-age") : null;
    if (!ageSpan) return;
    const mins = ageMinutes(state.witnessAt);
    const m = mins === null ? null : Math.floor(mins);
    if (String(m) === state.lastWitnessKey) return;
    state.lastWitnessKey = String(m);
    if (m === null) { ageSpan.textContent = ""; ageSpan.className = "w-age"; return; }
    const st = hbStatus(mins); /* סרגל-זהה-לדופק: <30 ירוק · <90 צהוב · מעלה אדום */
    ageSpan.textContent = m + " דק'";
    ageSpan.className = "w-age " + st.cls;
  }

  function renderWitness(node, w) {
    state.witnessAt = null;
    state.lastWitnessKey = null;
    node.replaceChildren();
    if (!w || typeof w !== "object") { setNA(node); return; }
    /* שני-דורות-סכימה: {at, source} (החוזה) ו-{ts, address} (כפי-שפורסם-בפועל) */
    const at = typeof w.at === "string" ? w.at : (typeof w.ts === "string" ? w.ts : null);
    state.witnessAt = at;
    node.appendChild(el("span", "w-age")); /* גיל-הקנרית — מתעדכן-חי */
    node.appendChild(el("span", "k", " nonce "));
    node.appendChild(w.nonce !== undefined && w.nonce !== null ? ltr(String(w.nonce)) : naSpan());
    node.appendChild(el("span", "k", " · balance_eth "));
    node.appendChild(w.balance_eth !== undefined && w.balance_eth !== null ? ltr(String(w.balance_eth)) : naSpan());
    node.appendChild(el("span", "k", " · source "));
    const src = (w.source !== undefined) ? w.source : w.address;
    node.appendChild(src !== undefined && src !== null ? ltr(String(src)) : naSpan());
    node.appendChild(el("span", "k", " · "));
    node.appendChild(el("span", "ltr", fmtUTC(at)));
    renderWitnessAge();
  }

  async function loadNetwork() {
    state.witnessAt = null;
    const noteEl = $("net-note");
    try {
      const { ok, status, text } = await fetchText(base + "/receipts/network.json");
      if (status === 404) throw Object.assign(new Error("not-published"), { notPublished: true });
      if (!ok) throw new Error("HTTP " + status);
      const d = JSON.parse(text);
      if (!d || d.schema !== "sandbox.network/1") throw new Error("schema");
      const f = (d.sources && d.sources.fleethq) || {};
      renderGuard($("net-guard"), f.guard || null);
      renderStatus($("net-status"), f.status || null);
      renderWitness($("net-witness"), f.witness || f.witness_row || null);
      const atNode = $("net-at");
      atNode.replaceChildren(el("span", "ltr", d.at ? fmtUTC(d.at) : NA));
      /* הערות: {note} (החוזה) או {notes:[…]} (כפי-שפורסם-בפועל) — textContent-בלבד */
      let noteTxt = "";
      const sNote = d.sources && d.sources.note;
      if (typeof sNote === "string" && sNote) noteTxt = "הערה: " + sNote;
      else if (typeof d.note === "string" && d.note) noteTxt = "הערה: " + d.note;
      else if (Array.isArray(d.notes) && d.notes.length) noteTxt = d.notes.map(String).join(" · ");
      noteEl.textContent = noteTxt;
    } catch (e) {
      renderGuard($("net-guard"), null);
      renderStatus($("net-status"), null);
      renderWitness($("net-witness"), null);
      $("net-at").replaceChildren(naSpan());
      noteEl.textContent = e && e.notPublished
        ? "receipts/network.json עדיין-לא-פורסם — אין-נתוני-רשת-להציג."
        : "";
    }
  }

  /* ══ 4 · ריצות-Actions (GitHub-API פומבי) ════════════════════════════ */
  function conclusionCell(c) {
    const td = el("td");
    const cls = c === "success" ? "c-ok" : c === "failure" ? "c-bad" : "c-warn";
    td.appendChild(el("span", "ltr " + cls, c ? String(c) : "—"));
    return td;
  }

  async function loadGitHub() {
    const tbody = $("gh-body"), msg = $("gh-msg");
    msg.textContent = "";
    try {
      const res = await fetch(GH_RUNS_URL + "&t=" + Date.now(), { cache: "no-store" });
      if (res.status === 403 || res.status === 429) throw Object.assign(new Error("rate"), { rate: true });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      const runs = d && Array.isArray(d.workflow_runs) ? d.workflow_runs.slice(0, SHOWN) : [];
      if (!runs.length) throw new Error("empty");
      tbody.replaceChildren();
      for (const r of runs) {
        const tr = el("tr");
        const tdAt = el("td"); tdAt.appendChild(el("span", "ltr", fmtUTC(r.created_at)));
        const tdName = el("td", "name", typeof r.name === "string" && r.name ? r.name : NA);
        const tdEvent = el("td"); tdEvent.appendChild(el("span", "ltr", r.event ? String(r.event) : NA));
        const tdStatus = el("td"); tdStatus.appendChild(el("span", "ltr", r.status ? String(r.status) : NA));
        tr.append(tdAt, tdName, tdEvent, tdStatus, conclusionCell(r.conclusion));
        tbody.appendChild(tr);
      }
    } catch (e) {
      tbody.replaceChildren();
      tbody.appendChild(naCell(5));
      if (e && e.rate) msg.textContent = "חסם-קצב-GitHub — נסה-שוב-מאוחר";
    }
  }

  /* ── תזמון ── */
  let refreshing = false;
  async function refreshAll() {
    if (refreshing) return;
    refreshing = true;
    const btn = $("refresh");
    if (btn) btn.disabled = true;
    try {
      await Promise.allSettled([loadHeartbeat(), loadTicks(), loadNetwork(), loadGitHub()]);
    } finally {
      refreshing = false;
      if (btn) btn.disabled = false;
    }
  }

  function init() {
    $("refresh").addEventListener("click", () => { refreshAll(); });
    refreshAll();
    setInterval(clockTick, CLOCK_MS);
    setInterval(() => { loadHeartbeat(); loadTicks(); loadNetwork(); }, REFRESH_MS);
    setInterval(loadGitHub, GH_REFRESH_MS);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
