/* ═══════════════════════════════════════════════════════════════════════
 * Sovereign Operator — gate.js (operator/ · טריטוריית agent-2)
 *
 * השער-המאוחד: סיסמה-אחת פותחת-בבלוק-אחד את שני-השערים-של-האחים:
 *   · כספת-הצי (docs/cockpit — vault.enc.json v2, רישום-מעטפות, PBKDF2·600k)
 *   · הקונסולה (console/ — params.json + sealed-payload.bin, PBKDF2·650k, קנון-62)
 * הקריפטו = פורט-נאמן של docs/app.js:tryUnlock + tools/seal.mjs (קנון משותף).
 * אפס-שרת · אפס-אחסון (localStorage/cookie) · נעילה-אוטומטית 15 דק' · ניקוי-זיכרון.
 * ═══════════════════════════════════════════════════════════════════════ */
"use strict";

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();

/* ── מצב-זיכרון-בלבד — נמחק-בנעילה ── */
const S = { cockpit: null, console: null, lockTimer: 0, lockAt: 0 };
const LOCK_MS = 15 * 60 * 1000;

/* ── עזרי-בייטים ── */
const b64dec = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toHex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("");

/* ── קנוניזציה — חוזה-האחים (tools/seal.mjs:51 + docs/app.js:tryUnlock):
 *     כל-השורות-נטחנות-לרצף-אחד; המועמדים: raw · ground · trim (מדוד, ללא-ניחושים) ── */
function candidatesOf(input) {
  const raw = input.replace(/^\uFEFF/, "");
  const list = [raw, raw.replace(/[\r\n]+/g, ""), raw.trim()];
  return list.filter((v, i, a) => v && a.indexOf(v) === i);
}

/* ── פענוח-כספת-הקוקפיט (רישום-מעטפות — חוק fleet-vault) — פורט-verbatim של-הלוגיקה ── */
async function openCockpit(passCandidates, meta) {
  for (const c of passCandidates) {
    for (const w of meta.wraps ?? []) {
      try {
        const base = await crypto.subtle.importKey("raw", enc.encode(c), "PBKDF2", false, ["deriveKey"]);
        const k = await crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: b64dec(w.salt), iterations: w.iter, hash: "SHA-256" },
          base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
        );
        const master = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64dec(w.iv) }, k, b64dec(w.ct));
        const mk = await crypto.subtle.importKey("raw", master, { name: "AES-GCM" }, false, ["decrypt"]);
        const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64dec(meta.body.iv) }, mk, b64dec(meta.body.ct));
        return JSON.parse(new TextDecoder().decode(pt));
      } catch {}
    }
  }
  return null;
}

/* ── פענוח-הקונסולה (קנון-62: PBKDF2·650k + AES-256-GCM על sealed-payload.bin) ── */
async function openConsole(passCandidates, params, bin) {
  for (const c of passCandidates) {
    const canon = c.replace(/[\r\n]+/g, "");
    for (const p of [c, canon]) {
      try {
        const base = await crypto.subtle.importKey("raw", enc.encode(p), "PBKDF2", false, ["deriveKey"]);
        const key = await crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: b64dec(params.saltB64), iterations: params.iterations, hash: "SHA-256" },
          base, { name: "AES-GCM", length: (params.keyLen ?? 32) * 8 }, false, ["decrypt"]
        );
        const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64dec(params.ivB64), tagLength: params.tagLenBits ?? 128 }, key, bin);
        return JSON.parse(new TextDecoder().decode(pt));
      } catch {}
    }
  }
  return null;
}

/* ── RPC ציבורי (עם-fallback — אותו-חוזה-קוקפיט) ── */
async function rpc(endpoints, method, params) {
  let lastErr;
  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if (j.error) throw new Error(j.error.message ?? "rpc error");
      return j.result;
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error("no endpoint");
}
const toNum = (s) => parseFloat(String(s ?? "0"));
const vestsToSp = (v, dgpo) => v && dgpo ? toNum(v) / (toNum(dgpo.total_vesting_shares) / toNum(dgpo.total_vesting_fund_steem)) : 0;

/* ── עורק: קבלות-מהריפו (raw.githubusercontent — פומבי, CORS:*) ── */
const REPO_RAW = "https://raw.githubusercontent.com/roshpinacare-sys/Sandbox/main/receipts/";
async function fetchArtery() {
  const latest = await (await fetch(REPO_RAW + "latest.json", { cache: "no-store" })).json();
  let ticks = [];
  try {
    const t = await (await fetch(REPO_RAW + "ticks.jsonl", { cache: "no-store" })).text();
    ticks = t.trim().split("\n").filter(Boolean).slice(-8).map((l) => JSON.parse(l));
  } catch {}
  return { latest, ticks };
}

/* ── פדרציה: קבלה-חיה מהריפו (raw — פומבי) ── */
const FED_RAW = "https://raw.githubusercontent.com/roshpinacare-sys/Sandbox/main/federation/";
async function fetchFederation() {
  const latest = await (await fetch(FED_RAW + "latest.json", { cache: "no-store" })).json();
  let recent = [];
  try {
    const t = await (await fetch(FED_RAW + "LEDGER.jsonl", { cache: "no-store" })).text();
    recent = t.trim().split("\n").filter(Boolean).slice(-6).map((l) => JSON.parse(l));
  } catch {}
  return { latest, recent };
}

/* ── איתור-משאב-בשני-פריסות: Pages (קונסולה-בשורש · קוקפיט-ב-/cockpit/) ומקומית (repo-layout) ── */
async function fetchFirst(paths) {
  let last;
  for (const p of paths) {
    try {
      const r = await fetch(p, { cache: "no-store" });
      if (r.ok) return r;
      last = new Error("HTTP " + r.status);
    } catch (e) { last = e; }
  }
  throw last ?? new Error("not found");
}

/* ═══════════════ הרנדור ═══════════════ */
function setBadge(id, ok, label) {
  const el = $(id);
  el.textContent = label;
  el.className = "badge " + (ok ? "badge-ok" : "badge-bad");
}

function renderOverview() {
  const accs = S.cockpit?.payload?.accounts ?? [];
  const A = S.cockpit?.payload?.audit ?? {};
  const cOk = !!S.console;
  $("ov-cards").innerHTML = `
    <div class="stat"><div class="k">חשבונות-בצי</div><div class="v">${accs.length}</div><div class="s">מכספת-הצי (מפוענחת)</div></div>
    <div class="stat"><div class="k">נאמנות</div><div class="v ${A.fail ? "warn" : "ok"}">${A.pass ?? "?"}✓ / ${A.fail ?? "?"}✗</div><div class="s">מול-שרשרת · ${A.verdict ?? "—"}</div></div>
    <div class="stat"><div class="k">הקונסולה</div><div class="v">${cOk ? "פתוחה" : "—"}</div><div class="s">${cOk ? "קנון-62 פוענח" : "לא-נפתחה בסיסמה-זו"}</div></div>
    <div class="stat" id="ov-artery-stat"><div class="k">העורק</div><div class="v">…</div><div class="s">בודק-קבלה-אחרונה</div></div>
    <div class="stat" id="ov-fed-stat"><div class="k">פדרציה</div><div class="v">…</div><div class="s">בודק-פנקס-הפדרציה</div></div>`;
  renderTruth();
}

function renderTruth() {
  const el = $("ov-truth");
  const A = S.cockpit?.payload?.audit ?? {};
  el.innerHTML = `
    <li><span>ביקורת-נאמנות</span><span class="val ${(A.fail ?? 0) ? "warn" : "ok"}">${A.verdict ?? "—"} · ${(A.auditedAt ?? "").slice(0, 19).replace("T", " ")}</span></li>
    <li><span>פירוט-ביקורת</span><span class="val muted" style="white-space:normal;max-width:60%">${A.detail ?? "—"}</span></li>
    <li><span>עדכון-שער-זה</span><span class="val">${document.lastModified || "—"}</span></li>`;
}

function renderFleet() {
  const P = S.cockpit?.payload ?? {};
  const A = P.audit ?? {};
  $("fleet-audit").innerHTML = `
    <li><span>נבדקו</span><span class="val">${A.pass ?? "?"} PASS / ${A.fail ?? "?"} FAIL</span></li>
    <li><span>מסקנה</span><span class="val ${A.verdict === "full-custody" ? "ok" : "warn"}">${A.verdict ?? "—"}</span></li>
    <li><span>בתאריך</span><span class="val">${(A.auditedAt ?? "").slice(0, 19).replace("T", " ")}</span></li>
    <li><span>פירוט</span><span class="val muted" style="white-space:normal">${A.detail ?? "—"}</span></li>`;
  const rows = (P.accounts ?? []).filter((a) => a.username);
  $("fleet-custody").innerHTML = rows.map((a) => {
    const c = a.custody ?? "";
    const cls = c.includes("verified") ? "ok" : c.includes("stale") ? "warn" : c.includes("not-on-chain") ? "bad" : "muted";
    return `<li><span>${a.username} <span class="mini muted">${a.tier ?? ""}</span></span><span class="val ${cls}">${c || "—"}</span></li>`;
  }).join("") || '<li><span class="muted">אין-רשומות-חשבון-בכספת</span></li>';
}

function renderConsole() {
  const el = $("console-tree");
  if (!S.console) {
    el.innerHTML = '<div class="muted">הקונסולה-לא-נפתחה-בסיסמה-זו (ייתכן-שנחתמה-מחדש-בסיסמה-אחרת).</div>';
    return;
  }
  el.innerHTML = "";
  el.appendChild(jsonTree(S.console.payload, 0));
}

function jsonTree(val, depth) {
  const isObj = val && typeof val === "object";
  if (!isObj) {
    const d = document.createElement("div");
    d.className = "leaf";
    d.textContent = String(val);
    return d;
  }
  const det = document.createElement("details");
  det.open = depth < 1;
  const sum = document.createElement("summary");
  sum.textContent = Array.isArray(val) ? `array[${val.length}]` : `object{${Object.keys(val).length}}`;
  det.appendChild(sum);
  for (const [k, v] of Object.entries(val)) {
    const line = document.createElement("div");
    line.style.marginInlineStart = "12px";
    const key = document.createElement("span");
    key.className = "k";
    key.textContent = k + ": ";
    line.appendChild(key);
    if (v && typeof v === "object") line.appendChild(jsonTree(v, depth + 1));
    else {
      const leaf = document.createElement("span");
      leaf.className = "leaf";
      leaf.textContent = JSON.stringify(v);
      line.appendChild(leaf);
    }
    det.appendChild(line);
  }
  return det;
}

function renderArtery({ latest, ticks }) {
  const el = $("artery-state");
  const ageMin = latest?.at ? Math.round((Date.now() - Date.parse(latest.at)) / 60000) : null;
  const cls = ageMin == null ? "badge-bad" : ageMin <= 30 ? "badge-ok" : ageMin <= 90 ? "badge-warn" : "badge-bad";
  const label = ageMin == null ? "אין-קבלה" : ageMin <= 30 ? "חי" : ageMin <= 90 ? "מפגר" : "מנותק";
  el.innerHTML = `
    <div class="seal-line">
      <span class="badge ${cls}">עורק: ${label} (טיק-אחרון לפני ${ageMin ?? "?"} דק')</span>
      <span class="badge">HEAD: ${latest?.head ?? "?"}</span>
      <span class="badge">קבצים: ${latest?.files ?? "?"}</span>
      <span class="badge ${latest?.keysLeaked ? "badge-bad" : "badge-ok"}">keysLeaked: ${latest?.keysLeaked ?? "?"}</span>
    </div>
    <p class="mini muted">הרץ-אפמרלי במכוון — GitHub-עצמו-המנוע; ההמשכיות-חיה-בריפו (receipts/ticks.jsonl, שרשרת-טביעות ${latest?.chain ?? "—"}).</p>`;
  $("artery-ticks").innerHTML = (ticks ?? []).slice().reverse().map((t) =>
    `<div>${t.at} · mode=${t.mode} · head=${t.head ?? "absent"} · chain=${String(t.chain ?? "").slice(0, 12)}${t.keysLeaked ? " · ⚠ keysLeaked" : ""}</div>`
  ).join("");
  const stat = document.querySelector("#ov-artery-stat");
  if (stat) stat.innerHTML = `<div class="k">העורק</div><div class="v ${ageMin != null && ageMin <= 30 ? "" : ""}" style="color:${ageMin == null ? "var(--bad)" : ageMin <= 30 ? "var(--ok)" : "var(--warn)"}">${label}</div><div class="s">טיק-אחרון לפני ${ageMin ?? "?"} דק'</div>`;
}

function renderFederation({ latest, recent }) {
  const ageMin = latest?.at ? Math.round((Date.now() - Date.parse(latest.at)) / 60000) : null;
  const cls = ageMin == null ? "badge-bad" : ageMin <= 60 ? "badge-ok" : ageMin <= 150 ? "badge-warn" : "badge-bad";
  const label = ageMin == null ? "אין-סריקה" : ageMin <= 60 ? "חי" : ageMin <= 150 ? "מפגר" : "מנותק";
  const F = latest?.flags ?? [];
  const byFlag = {};
  for (const f of F) byFlag[f.flag] = (byFlag[f.flag] ?? 0) + 1;
  const flagSummary = Object.entries(byFlag).map(([k, v]) => `${k}×${v}`).join(" · ") || "אפס";
  $("fed-state").innerHTML = `
    <div class="seal-line">
      <span class="badge ${cls}">פדרציה: ${label} (סריקה לפני ${ageMin ?? "?"} דק')</span>
      <span class="badge ${latest?.verdict === "FEDERATION-OK" ? "badge-ok" : "badge-warn"}">${latest?.verdict ?? "—"}</span>
      <span class="badge">ריפואים: ${latest?.counts?.github ?? "?"} ב-GitHub · ${latest?.counts?.manifest ?? "?"} בחוקה</span>
      <span class="badge ${F.length ? "badge-bad" : "badge-ok"}">דגלים: ${latest?.counts?.flagsTotal ?? F.length}${latest?.counts?.flagsTotal > latest?.counts?.flags ? ` (מוצגים ${F.length})` : ""}</span>
      <span class="badge">${latest?.authMode === "token" ? "auth: token" : "auth: anonymous"}</span>
    </div>
    <ul class="kv">
      <li><span>פירוט-דגלים</span><span class="val ${F.length ? "warn" : "ok"}">${flagSummary}</span></li>
      <li><span>שרשרת-מרקל</span><span class="val">${String(latest?.chain?.cur ?? "").slice(0, 16)}… · נסרקו ${latest?.counts?.records ?? "?"} ריפואים ב-${latest?.tookMs ?? "?"}ms</span></li>
    </ul>
    ${F.length ? `<div class="tablewrap"><table><thead><tr><th>ריפו</th><th>דגל</th><th>פירוט</th></tr></thead><tbody>${F.map((f) => `<tr><td>${f.repo}</td><td>${f.flag}</td><td class="muted">${f.detail ?? ""}</td></tr>`).join("")}</tbody></table></div>` : '<p class="mini muted">אפס-דגלים — הפדרציה-זהה-לחוקה.</p>'}
    <p class="mini muted">קבלות-אחרונות: ${(recent ?? []).slice().reverse().map((x) => `${String(x.at).slice(0, 16).replace("T", " ")} ${x.verdict}`).join(" · ") || "—"}</p>`;
  const rows = latest?.repos ?? [];
  $("fed-repos").innerHTML = rows.length ? `<table><thead><tr><th>ריפו</th><th>תפקיד</th><th>נראות</th><th>דחיפה</th><th>Actions</th></tr></thead><tbody>${rows.map((r) => {
    const red = (r.redWorkflows ?? []).length;
    return `<tr><td>${r.name}${r.inManifest ? "" : ' <span class="badge badge-warn">ADOPT?</span>'}</td><td class="muted">${r.role ?? "—"}</td><td>${r.visibility ?? "—"}</td><td>${r.ageHours != null ? r.ageHours + "h" : "—"}</td><td>${red ? `<span class="bad">${red} אדום</span>` : (r.actions ?? "—")}</td></tr>`;
  }).join("")}</tbody></table></div>` : '<div class="muted">אין-נתוני-ריפואים</div>';
  const stat = document.querySelector("#ov-fed-stat");
  if (stat) stat.innerHTML = `<div class="k">פדרציה</div><div class="v" style="color:${cls === "badge-ok" ? "var(--ok)" : cls === "badge-warn" ? "var(--warn)" : "var(--bad)"}">${label}</div><div class="s">${latest?.verdict ?? "—"} · ${latest?.counts?.github ?? "?"} ריפואים</div>`;
}

async function renderChain() {
  const endpoints = ["https://api.steemit.com"];
  try {
    const dgpo = await rpc(endpoints, "condenser_api.get_dynamic_global_properties", []);
    $("chain-dgpo").innerHTML = `
      <li><span>ראש-השרשרת</span><span class="val">#${dgpo.head_block_number} (${String(dgpo.head_block_id).slice(0, 10)}…)</span></li>
      <li><span>זמן-שרשרת</span><span class="val">${String(dgpo.time).replace("T", " ")}</span></li>
      <li><span>אספקה</span><span class="val">${dgpo.current_supply}</span></li>
      <li><span>קרן-הווסטים</span><span class="val">${toNum(dgpo.total_vesting_fund_steem).toFixed(0)} STEEM</span></li>
      <li><span>vestsPerSP</span><span class="val">${(toNum(dgpo.total_vesting_shares) / toNum(dgpo.total_vesting_fund_steem) / 1e6).toFixed(3)}</span></li>
      <li><span>אחרונה-בלתי-הפיכה</span><span class="val">#${dgpo.last_irreversible_block_num}</span></li>`;
    const names = [...new Set((S.cockpit?.payload?.accounts ?? []).filter((a) => a.username && !String(a.custody ?? "").includes("not-on-chain")).map((a) => a.username))];
    if (names.length) {
      const accs = await rpc(endpoints, "condenser_api.get_accounts", [names]);
      const rows = names.map((n) => {
        const a = accs.find((x) => x.name === n);
        if (!a) return `<tr><td>${n}</td><td colspan="4" class="muted">לא-נמצא</td></tr>`;
        const sp = vestsToSp(a.vesting_shares, dgpo) - vestsToSp(a.delegated_vesting_shares, dgpo) + vestsToSp(a.received_vesting_shares, dgpo);
        const vp = toNum(a.voting_manipulation_delay_count) !== undefined && a.voting_power !== undefined ? a.voting_power / 100 : 0;
        return `<tr><td>${n}</td><td>${sp.toFixed(3)}</td><td>${toNum(a.balance).toFixed(3)}</td><td>${toNum(a.sbd_balance).toFixed(3)}</td><td>≈${vp.toFixed(0)}%</td></tr>`;
      }).join("");
      $("chain-accounts").innerHTML = `<table><thead><tr><th>חשבון</th><th>SP אפקטיבי</th><th>STEEM</th><th>SBD</th><th>VP</th></tr></thead><tbody>${rows}</tbody></table>`;
    } else {
      $("chain-accounts").innerHTML = '<div class="muted">אין-חשבונות-בכספת-לבדיקה</div>';
    }
  } catch (e) {
    $("chain-dgpo").innerHTML = `<li><span class="bad">שגיאת-RPC: ${String(e.message).slice(0, 120)}</span></li>`;
  }
}

function renderServer() {
  $("server-state").innerHTML = `
    <div class="seal-line">
      <span class="badge badge-warn">מצב: מוכן-להפעלה (לא-חי — טוקן-Cloudflare בכספת מת, נבדק-מול-API בתאריך-הקמת-השער)</span>
    </div>
    <ul class="kv">
      <li><span>אימות</span><span class="val">PBKDF2-SHA256 · 650,000 · salt-אקראי לכל-פריסה</span></li>
      <li><span>השוואה</span><span class="val">constant-time (timingSafeEqual)</span></li>
      <li><span>הגבלת-ניסיונות</span><span class="val">5/15 דק' ל-IP + 429 · מגבלה-מרובת-מופעים-מתועדת-בכנות</span></li>
      <li><span>Session</span><span class="val">HttpOnly · Secure · SameSite=Strict · HMAC-SHA256 · TTL 8h</span></li>
      <li><span>פרוקסי</span><span class="val">מראה-מאומתת של console/ · cockpit/ · operator/ מאחורי-סיסמה-שרתית</span></li>
      <li><span>סודות</span><span class="val ok">אפס-בגיט — hash+session-secret כ-wrangler-secrets בלבד</span></li>
    </ul>`;
}

/* ═══════════════ נעילה-ואוטומט ═══════════════ */
function lock() {
  S.cockpit = null; S.console = null;
  clearTimeout(S.lockTimer); S.lockTimer = 0;
  $("pass").value = "";
  $("dash").hidden = true; $("gate").hidden = false;
  $("hdr-state").textContent = "סגור"; $("hdr-state").className = "badge";
  document.title = "השער-המאוחד של המפעיל — Sovereign Operator";
}
function armAutoLock() {
  clearTimeout(S.lockTimer);
  S.lockAt = Date.now() + LOCK_MS;
  S.lockTimer = setTimeout(lock, LOCK_MS);
}
setInterval(() => {
  if (!S.lockAt || !S.lockTimer) return;
  const left = Math.max(0, Math.round((S.lockAt - Date.now()) / 60000));
  $("autolock").textContent = "נעילה-אוטומטית בעוד " + left + " דק'";
}, 20000);

/* ═══════════════ פתיחה ═══════════════ */
async function tryUnlockAll(input) {
  const cands = candidatesOf(input);
  if (!cands.length) throw new Error("קלט-ריק");
  let cockpitOpen = null, consoleOpen = null;
  if (S.cockpit?.meta) cockpitOpen = await openCockpit(cands, S.cockpit.meta);
  if (S.console?.params) consoleOpen = await openConsole(cands, S.console.params, S.console.bin);
  if (!cockpitOpen && !consoleOpen) throw new Error("rejected");
  return { cockpitOpen, consoleOpen };
}

$("gate-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const err = $("gate-err");
  err.hidden = true;
  const btn = $("unlock-btn");
  btn.disabled = true; btn.textContent = "גוזר-מפתחות…";
  try {
    const t0 = performance.now();
    const { cockpitOpen, consoleOpen } = await tryUnlockAll($("pass").value);
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    if (cockpitOpen) S.cockpit.payload = cockpitOpen;
    if (consoleOpen) S.console.payload = consoleOpen;
    $("gate").hidden = true; $("dash").hidden = false;
    $("hdr-state").textContent = "פתוח"; $("hdr-state").className = "badge badge-ok";
    document.title = "לוח-המפעיל — פתוח";
    renderOverview(); renderFleet(); renderConsole(); renderServer();
    fetchArtery().then(renderArtery).catch(() => {
      $("artery-state").innerHTML = '<span class="badge badge-bad">העורק: לא-ניתן-להגיע-לקבלות</span>';
    });
    fetchFederation().then(renderFederation).catch(() => {
      $("fed-state").innerHTML = '<span class="badge badge-bad">פדרציה: לא-ניתן-להגיע-לפנקס</span>';
    });
    renderChain();
    armAutoLock();
    $("gate-err").textContent = "";
    console.info(`[operator] unlocked in ${secs}s — cockpit:${!!cockpitOpen} console:${!!consoleOpen}`);
  } catch (e) {
    err.textContent = e.message === "rejected"
      ? "נדחה — סוד-לא-מקובל (אף-מעטפה/קנון לא-נפתח)."
      : "שגיאה: " + String(e.message || e);
    err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = "פתח-הכל";
    $("pass").value = ""; // הסוד-לא-נשאר-ב-DOM
  }
});

/* ── לשוניות ── */
$("tabs").addEventListener("click", (ev) => {
  const b = ev.target.closest(".tab");
  if (!b) return;
  for (const t of document.querySelectorAll(".tab")) {
    t.classList.toggle("active", t === b);
    t.setAttribute("aria-selected", t === b ? "true" : "false");
  }
  for (const p of document.querySelectorAll(".panel")) p.hidden = p.id !== "panel-" + b.dataset.tab;
});
$("lock-btn").addEventListener("click", lock);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.lockTimer) armAutoLock(); });

/* ═══════════════ אתחול: זיהוי-החותמות (בלי-לגעת-בסוד) ═══════════════ */
(async function boot() {
  try {
    const r = await fetchFirst(["../cockpit/vault.enc.json", "../docs/vault.enc.json"]);
    S.cockpit = { meta: await r.json(), payload: null };
    const iters = (S.cockpit.meta.wraps?.[0]?.iter ?? 0).toLocaleString();
    setBadge("badge-cockpit", true, `כספת: חתומה · ${S.cockpit.meta.wraps?.length ?? "?"} מעטפות · PBKDF2 ${iters}`);
  } catch (e) {
    S.cockpit = null;
    setBadge("badge-cockpit", false, "כספת: לא-נמצאה");
  }
  try {
    const [pr, br] = await Promise.all([
      fetchFirst(["../params.json", "../console/params.json"]),
      fetchFirst(["../sealed-payload.bin", "../console/sealed-payload.bin"]),
    ]);
    if (!pr.ok || !br.ok) throw new Error("HTTP");
    S.console = { params: await pr.json(), bin: await br.arrayBuffer(), payload: null };
    setBadge("badge-console", true, `קונסולה: חתומה · PBKDF2 ${(S.console.params.iterations ?? 0).toLocaleString()}`);
  } catch {
    S.console = null;
    setBadge("badge-console", false, "קונסולה: לא-נמצאה");
  }
  $("pass").disabled = !(S.cockpit || S.console);
  $("unlock-btn").disabled = !(S.cockpit || S.console);
})();
