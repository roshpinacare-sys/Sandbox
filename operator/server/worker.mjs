/* ═══════════════════════════════════════════════════════════════════════
 * Sovereign Operator Gate — השער-השרתי (operator/server · Cloudflare-Worker)
 *
 * מה-זה: התחברות-סיסמה אמיתית בשרת — מה שהקונסולות-הסטטיות (Pages) אינן:
 *   · POST /login — PBKDF2-SHA256·650k מול-hash-secret · constant-time
 *   · rate-limit ל-IP (5/15 דק' → 429) — בתוך-מופע; כתב-הוויתור-ב-README-של-הטריטוריה
 *   · Session: HMAC-SHA256-signed token · HttpOnly · Secure · SameSite=Strict · TTL 8h
 *   · מראת-פרוקסי מאומתת לכל-הפתחים (console/ · cockpit/ · operator/) — הכל-מאחורי-סיסמה
 *
 * חוקי-סודות: אפס-סודות-בקוד/גיט. נדרשים:
 *   secret OP_HASH        = "pbkdf2-sha256$650000$<saltB64>$<hashB64>"  (נוצר-מקומית-ב-deploy.sh)
 *   secret SESSION_SECRET = אקראי ≥48 בייטים                            (נוצר-מקומית-ב-deploy.sh)
 *   var    UPSTREAM       = "https://roshpinacare-sys.github.io/Sandbox"
 * ═══════════════════════════════════════════════════════════════════════ */
"use strict";

const ITER = 650000;
const SESSION_TTL_S = 8 * 3600; // 8h — הגיוני-למפעיל; אין-התמדה-בצד-הלקוח-מעבר-לקוקי-מאובטח
const RATE_MAX = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const COOKIE = "sfp";

/* ── rate-limit בתוך-מופע (honest: multi-isolate מוגבל — ראה README) ── */
const hits = new Map();
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, arr] of hits) {
    const kept = arr.filter((t) => t > cutoff);
    if (kept.length) hits.set(ip, kept); else hits.delete(ip);
  }
}, 60_000).unref?.();

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => t > now - RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_MAX;
}

/* ── עזרים ── */
const b64dec = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64enc = (u8) => btoa(String.fromCharCode(...u8));
const b64url = (u8) => b64enc(u8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlDec = (s) => b64dec(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
const ground = (s) => String(s).replace(/^\uFEFF/, "").replace(/[\r\n]+/g, "");

/* ── constant-time compare (Workers-native כשקיים; fallback ידני-זהה-זמן) ── */
function timingSafeEq(a, b) {
  if (a.length !== b.length) return false;
  if (crypto.subtle.timingSafeEqual) return crypto.subtle.timingSafeEqual(a, b);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/* ── גזירת-מפתח: PBKDF2-SHA256·650k · 32B (הקנון-של-השערים-הסטטיים) ── */
async function deriveBits(password, saltB64) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: b64dec(saltB64), iterations: ITER, hash: "SHA-256" },
    base, 256
  );
  return new Uint8Array(bits);
}

async function parseOpHash(env) {
  const parts = String(env.OP_HASH ?? "").split("$"); // pbkdf2-sha256$650000$salt$hash
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") throw new Error("OP_HASH malformed");
  return { iter: parseInt(parts[1], 10), saltB64: parts[2], hash: b64dec(parts[3]) };
}

/* ── session: payload.sig — HMAC-SHA256, stateless, exp כרוך ── */
async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function sessionSign(env, payload) {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(env.SESSION_SECRET);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return body + "." + b64url(new Uint8Array(sig));
}
async function sessionVerify(env, token) {
  if (!token || !token.includes(".")) return null;
  const [body, sigB64] = token.split(".");
  try {
    const key = await hmacKey(env.SESSION_SECRET);
    const ok = await crypto.subtle.verify("HMAC", key, b64urlDec(sigB64), new TextEncoder().encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDec(body)));
    if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch { return null; }
}
const cookieFrom = (req) => (req.headers.get("Cookie") ?? "")
  .split(/;\s*/).find((c) => c.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1) ?? "";

/* ── HTML: עמוד-ההתחברות (עצמאי-לגמרי, אפס-נכסים-חיצוניים) ── */
function loginPage(msg) {
  return new Response(`<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>שער-המפעיל — התחברות</title><style>
body{background:#0b0e13;color:#e8ecf3;font:14px/1.6 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#10141c;border:1px solid #232b3a;border-radius:12px;padding:24px;max-width:420px;width:calc(100% - 32px)}
h1{font-size:18px;color:#d4a24e;margin:0 0 8px}p{color:#8b94a7;font-size:12px}
input{width:100%;box-sizing:border-box;background:#0b0e13;color:#e8ecf3;border:1px solid #232b3a;border-radius:8px;padding:10px;font-size:14px}
button{width:100%;margin-top:10px;background:#d4a24e;color:#14100a;border:0;border-radius:8px;padding:10px;font-weight:700;cursor:pointer}
.msg{color:#e26d5a;margin-top:8px;font-size:12px;min-height:16px}</style></head><body>
<div class="card"><h1>שער-המפעיל</h1>
<p>התחברות-שרת אמיתית — PBKDF2·650k · constant-time · rate-limit · session-HttpOnly.
הסיסמה-מושווה-מול-hash-בלבד; אינה-נשמרת-ולא-נרשמת.</p>
<form method="post" action="/login"><input type="password" name="password" autocomplete="current-password" required>
<button type="submit">כניסה</button></form><div class="msg">${msg ?? ""}</div></div></body></html>`,
    { status: 401, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

/* ═══════════════ ה-worker ═══════════════ */
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const ip = req.headers.get("CF-Connecting-IP") ?? "0.0.0.0";

    if (!env.OP_HASH || !env.SESSION_SECRET) {
      return json({ error: "gate not provisioned (missing secrets) — run deploy.sh" }, 503);
    }

    /* התחברות */
    if (url.pathname === "/login" && req.method === "POST") {
      if (rateLimited(ip)) {
        return json({ error: "too many attempts" }, 429, { "retry-after": String(Math.ceil(RATE_WINDOW_MS / 1000)) });
      }
      let password = "";
      const ct = req.headers.get("content-type") ?? "";
      try {
        if (ct.includes("application/json")) {
          const body = await req.json();
          password = String(body?.password ?? "");
        } else {
          const form = await req.formData();
          password = String(form.get("password") ?? "");
        }
      } catch {
        return json({ error: "bad request" }, 400);
      }
      const { saltB64, hash } = await parseOpHash(env);
      const derived = await deriveBits(ground(password), saltB64);
      if (!timingSafeEq(derived, hash)) {
        return json({ error: "rejected" }, 401);
      }
      const nowS = Math.floor(Date.now() / 1000);
      const payload = { v: 1, iat: nowS, exp: nowS + SESSION_TTL_S, jti: b64url(crypto.getRandomValues(new Uint8Array(12))) };
      const token = await sessionSign(env, payload);
      hits.delete(ip);
      return json(
        { ok: true, expires: payload.exp },
        200,
        {
          "set-cookie": `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_S}`,
        }
      );
    }

    /* יציאה */
    if (url.pathname === "/logout" && req.method === "POST") {
      return new Response(null, {
        status: 204,
        headers: { "set-cookie": `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` },
      });
    }

    /* בדיקת-סטטוס (פומבי, ללא-פרטים) */
    if (url.pathname === "/healthz") {
      return json({ ok: true, gate: "sovereign-operator", time: new Date().toISOString() });
    }

    /* כל-השאר: חייב-session, ואז-מראת-פרוקסי לפתחים-הריבוניים */
    const sess = await sessionVerify(env, cookieFrom(req));
    if (!sess) {
      if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        return loginPage();
      }
      return loginPage("נדרשת-התחברות");
    }

    const upstream = String(env.UPSTREAM ?? "https://roshpinacare-sys.github.io/Sandbox").replace(/\/$/, "");
    const target = upstream + url.pathname + url.search;
    const r = await fetch(target, { redirect: "manual", headers: { "accept-encoding": req.headers.get("accept-encoding") ?? "identity" } });
    const headers = new Headers(r.headers);
    headers.delete("set-cookie");
    headers.set("cache-control", "no-store");
    headers.set("x-gate", "sovereign-operator");
    return new Response(r.body, { status: r.status, headers });
  },
};
