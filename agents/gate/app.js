/* =====================================================================
   agents/gate/app.js — שער-הסוכנים (T-44)
   חוקי-אפס: אפס-innerHTML (textContent בלבד) · אפס-טוקן-על-החוט ·
   אפס-מפתחות-כספת · sessionStorage בלבד · נעילה-אוטומטית 15 דק' ·
   כישלון = הודעה-כנה, לעולם לא נתוני-דמה.
   ===================================================================== */
"use strict";

const RAW = "https://raw.githubusercontent.com/roshpinacare-sys/Sandbox/main/";
const LOCK_MS = 15 * 60 * 1000;
const MAX_TRIES = 3;
const LOCKOUT_MS = 30 * 1000;

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();

/* ── קריפטו — זהה לקנון-62 של הקונסולה (PBKDF2-HMAC-SHA256 · 650k) ────────── */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesEq(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
async function pbkdf2(token, saltB64) {
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(token), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: b64ToBytes(saltB64), iterations: 650000 },
    keyMat,
    256,
  );
  return new Uint8Array(bits);
}
async function inboxKey(token, saltB64) {
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(token), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: b64ToBytes(saltB64), iterations: 650000 },
    keyMat,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}
async function openEnvelope(token, env) {
  /* ctB64 = ciphertext||tag (בדיוק-כחותם-הקונסולה) — WebCrypto מצפה לפורמט זה */
  const data = b64ToBytes(env.ctB64);
  const key = await inboxKey(token, env.saltB64);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(env.ivB64), tagLength: 128 }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}

/* ── עזרי-DOM (אפס-innerHTML) ─────────────────────────────────────────────── */
function setText(id, v) {
  $(id).textContent = v === null || v === undefined || v === "" ? "—" : String(v);
}
function setBadge(id, state, label) {
  const el = $(id);
  el.className = "badge " + (state || "");
  el.textContent = label;
}
function overall(state, title, sub, pulse) {
  const el = $("overall");
  el.dataset.state = state;
  el.dataset.pulse = pulse ? "1" : "0";
  $("overall-title").textContent = title;
  $("overall-sub").textContent = sub;
}

/* ── נעילה ────────────────────────────────────────────────────────────────── */
let lockTimer = null;
let lockDeadline = 0;
let tries = 0;
let lockoutUntil = 0;
let lockoutTimer = null;

function lock(reason) {
  sessionStorage.removeItem("sbx-agent");
  $("panel").hidden = true;
  $("gate-card").hidden = false;
  $("in-token").value = "";
  if (lockTimer) clearInterval(lockTimer);
  overall("gray", "נעול", reason || "הזדהות-נדרשת", false);
}
function armLock() {
  lockDeadline = Date.now() + LOCK_MS;
  if (lockTimer) clearInterval(lockTimer);
  lockTimer = setInterval(() => {
    const left = lockDeadline - Date.now();
    if (left <= 0) return lock("ננעל-אוטומטית (אי-פעילות)");
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    $("lock-in").textContent = `ננעל-אוטומטית בעוד ${m}:${String(s).padStart(2, "0")}`;
  }, 1000);
}

/* ── שליפות (כישלון = כנות) ───────────────────────────────────────────────── */
async function fetchJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function fetchText(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

function fillState(st) {
  setText("v-ticks", st.keeper && st.keeper.tickCount);
  setText("v-lasttick", st.keeper && st.keeper.lastTick);
  setText("v-merkle", st.merkle ? String(st.merkle).slice(0, 16) + "…" : null);
  const ks = st.killSwitch ? `${st.killSwitch.mode}${st.killSwitch.since ? " · מ-" + st.killSwitch.since.slice(0, 10) : ""}` : null;
  setText("v-switch", ks);
  const cd = st.custody ? `${st.custody.status}${st.custody.echoedAt ? " · " + st.custody.echoedAt.slice(0, 16) + "Z" : ""}` : null;
  setText("v-custody", cd);
  const sf = st.selftest ? `${st.selftest.status} ${st.selftest.passed}/${st.selftest.total}` : null;
  setText("v-selftest", sf);
  setBadge("state-badge", "ok", "חי");
}
function fillArtery(rc) {
  setText("v-artery-at", rc.at || rc.timestamp || null);
  setText("v-artery-chain", rc.chainRoot ? String(rc.chainRoot).slice(0, 16) + "…" : rc.merkle ? String(rc.merkle).slice(0, 16) + "…" : null);
  setText("v-artery-leak", rc.keysLeaked === false ? "false (נקי)" : String(rc.keysLeaked ?? "—"));
  setBadge("artery-badge", "ok", "חי");
}
function fillReceipts(text) {
  const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("#")).slice(-12).reverse();
  const ul = $("receipts-list");
  ul.textContent = "";
  if (lines.length === 0) {
    const li = document.createElement("li");
    li.textContent = "אין-קבלות-עדיין (היומן-ריק) — כנה.";
    ul.appendChild(li);
    setBadge("receipts-badge", "warn", "ריק");
    return;
  }
  for (const line of lines) {
    const li = document.createElement("li");
    li.textContent = line;
    try {
      if (JSON.parse(line).verdict === "failed") li.classList.add("failed");
    } catch { /* שורה-לא-JSON — מוצגת-כמו-שהיא */ }
    ul.appendChild(li);
  }
  setBadge("receipts-badge", "ok", "חי");
}

async function loadLive() {
  setBadge("state-badge", "", "טוען");
  setBadge("artery-badge", "", "טוען");
  setBadge("receipts-badge", "", "טוען");
  try { fillState(await fetchJSON(RAW + "state/network-state.json?t=" + Date.now())); }
  catch { setBadge("state-badge", "bad", "מצב-לא-זמין"); setText("v-ticks", null); }
  try { fillArtery(await fetchJSON(RAW + "receipts/latest.json?t=" + Date.now())); }
  catch { setBadge("artery-badge", "bad", "לא-זמין"); }
  try { fillReceipts(await fetchText(RAW + "agents/receipts/log.jsonl?t=" + Date.now())); }
  catch { setBadge("receipts-badge", "bad", "לא-זמין"); }
}

/* ── בניית-הלוח אחרי-אימות ────────────────────────────────────────────────── */
function fillIdentity(mem) {
  setText("v-id", mem.id);
  setText("v-scope", mem.scope);
  setText("v-created", mem.createdAt);
  setText("v-rotated", mem.rotatedAt || "לעולם-לא");
  setText("v-note", mem.note || null);
}
function fillInbox(payload) {
  setText("v-directive", `${payload.directiveId} · מ-${payload.from} · ${payload.issuedAt}`);
  setText("v-subject", payload.subject);
  const ul = $("inbox-body");
  ul.textContent = "";
  for (const line of payload.body || []) {
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
  }
  const links = $("inbox-links");
  links.textContent = "";
  const entries = Object.entries(payload.links || {});
  entries.forEach(([k, v], i) => {
    if (i > 0) links.appendChild(document.createTextNode(" · "));
    const a = document.createElement("a");
    a.href = v; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.textContent = k;
    links.appendChild(a);
  });
  setBadge("inbox-badge", "ok", "פענוח-OK");
}

async function unlock(id, token, reg) {
  const mem = reg.members.find((m) => m.id === id);
  if (!mem) throw new Error("זהות-לא-רשומה-ברישום");
  const verifier = b64ToBytes(mem.verifierB64);
  const derived = await pbkdf2(token, mem.saltB64);
  if (!bytesEq(derived, verifier)) throw new Error("טוקן-נדחה-קריפטוגרפית");

  sessionStorage.setItem("sbx-agent", JSON.stringify({ id, token, at: Date.now() }));
  $("gate-card").hidden = true;
  $("panel").hidden = false;
  overall("green", "פתוח", `${id} · אומת-מקומית`, false);
  armLock();
  fillIdentity(mem);

  /* תיבת-פקודות: מעטפה-משלה */
  try {
    const doc = await fetchJSON("inbox.sealed.json");
    const env = (doc.envelopes || []).find((e) => e.id === id);
    if (!env) throw new Error("אין-מעטפה");
    const payload = await openEnvelope(token, env);
    fillInbox(payload);
    /* עדכון-פקודות-ההעתקה עם-המזהה-האמיתי */
    for (const n of [1, 3, 4]) $(`cmd-${n}`).textContent = $(`cmd-${n}`).textContent.replaceAll("ID", id);
  } catch {
    setBadge("inbox-badge", "bad", "נדחה");
    setText("v-subject", "תיבה-לא-נפתחה — טוקן-לא-תואם-מעטפה/רישום-ישן");
  }
  await loadLive();
}

/* ── אירועים ──────────────────────────────────────────────────────────────── */
async function tryOpen(ev) {
  ev.preventDefault();
  const errEl = $("gate-err");
  errEl.hidden = true;
  if (Date.now() < lockoutUntil) {
    errEl.textContent = `ננעל-זמנית אחרי-ניסיונות-כושלים — ${Math.ceil((lockoutUntil - Date.now()) / 1000)} שניות`;
    errEl.hidden = false;
    return;
  }
  const id = $("in-id").value;
  const token = $("in-token").value;
  $("btn-open").disabled = true;
  try {
    const reg = await fetchJSON("agents.json");
    await unlock(id, token, reg);
    tries = 0;
  } catch (e) {
    tries++;
    $("in-token").value = "";
    if (tries >= MAX_TRIES) {
      lockoutUntil = Date.now() + LOCKOUT_MS;
      errEl.textContent = `${MAX_TRIES} ניסיונות-כושלים — נעילה-זמנית 30 שניות. ${e.message}`;
      let left = Math.ceil(LOCKOUT_MS / 1000);
      lockoutTimer = setInterval(() => {
        left--;
        if (left <= 0) { clearInterval(lockoutTimer); tries = 0; errEl.hidden = true; }
      }, 1000);
    } else {
      errEl.textContent = `נדחה (${e.message}) · ניסיון ${tries}/${MAX_TRIES}`;
    }
    errEl.hidden = false;
    overall("red", "נדחה", "טוקן/זהות-לא-תואמים", false);
  } finally {
    $("btn-open").disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("gate-form").addEventListener("submit", tryOpen);
  $("btn-lock").addEventListener("click", () => lock("ננעל-ידנית"));
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-copy]");
    if (!btn) return;
    const txt = $(btn.dataset.copy).textContent;
    navigator.clipboard && navigator.clipboard.writeText(txt);
    const old = btn.textContent;
    btn.textContent = "הועתק";
    setTimeout(() => { btn.textContent = old; }, 1200);
  });
  /* שחזור-סשן-באותו-טאב (ללא-טוקן-בשרת-לעולם) */
  const saved = sessionStorage.getItem("sbx-agent");
  if (saved) {
    try {
      const s = JSON.parse(saved);
      if (Date.now() - s.at > LOCK_MS) { sessionStorage.removeItem("sbx-agent"); return; }
      fetchJSON("agents.json").then((reg) => unlock(s.id, s.token, reg)).catch(() => sessionStorage.removeItem("sbx-agent"));
    } catch { sessionStorage.removeItem("sbx-agent"); }
  }
});
