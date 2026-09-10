"use strict";

// CDP Köprüsü: kopya profildeki Google oturum çerezlerini gerçek Chrome'un
// kendisine çözdürüp (App-Bound v20 / lokal v10 fark etmez) Electron session'una
// cookies.set ile aktarır.
//
// Neden: Chrome 136+ gerçek profilin veri dizininde --remote-debugging-port'u
// engelliyor (güvenlik). Kopya profil (standard dışı --user-data-dir) üzerinde
// ise CDP tamamen açıktır. Çerez verisi Chrome'un çözülmüş hali (düz metin)
// döndüğünden, Electron'un şifre çözme mekanizmasına (Local State / os_crypt)
// HİÇ ihtiyaç kalmaz — Electron enjekte edileni kendi anahtarıyla yazar ve silmez.

const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const CDP_PORT = 9333;

function chromeExe() {
  if (process.platform === "win32") {
    const cands = [
      path.join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(process.env["ProgramFiles(x86)"], "Google", "Chrome", "Application", "chrome.exe"),
    ];
    return cands.find((c) => fs.existsSync(c));
  }
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  return "/usr/bin/google-chrome";
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function waitForPort(port, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const list = await httpGet(`http://127.0.0.1:${port}/json/list`);
      const page = list.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      /* henüz açılmadı */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Chrome CDP port acilmadi");
}

// Kopya profil dizinindeki headless Chrome'u açar ve Network.getAllCookies ile
// çözülmüş tüm çerezleri döndürür. Chrome'u açılışta kapatır.
async function readCookiesFromCopy(copyDir) {
  const exe = chromeExe();
  if (!exe) throw new Error("chrome.exe bulunamadi");
  if (!fs.existsSync(copyDir)) throw new Error("Kopya profil yok: " + copyDir);

  const chrome = spawn(exe, [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${copyDir}`,
    "--profile-directory=Default",
    "--disable-features=AppBoundEncryption",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ], { stdio: "ignore", detached: true });

  let ws;
  try {
    const page = await waitForPort(CDP_PORT, 20000);
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++send._id;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener("message", handler);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
    send._id = 0;

    const { cookies } = await send("Network.getAllCookies");
    return cookies || [];
  } finally {
    try { ws && ws.close(); } catch { /* yoksay */ }
    chrome.kill();
  }
}

const SAME_SITE_MAP = {
  NONE: "no_restriction",
  LAX: "lax",
  STRICT: "strict",
  UNSPECIFIED: "unspecified",
};

// CDP çerez listesini Electron session'ına yazar. HttpOnly/Secure dahil tüm
// öznitelikler korunur; aynı ada sahip eski değer üzerine yazılır.
async function injectCookies(session, cookies) {
  let loaded = 0;
  let failed = 0;
  for (const c of cookies) {
    const host = String(c.domain || "").replace(/^\./, "");
    if (!host || !/^[a-z0-9.-]+$/i.test(host)) continue;
    await session
      .cookies
      .set({
        url: "https://" + host + (c.path || "/"),
        name: c.name,
        value: c.value,
        domain: c.domain || undefined,
        path: c.path || "/",
        secure: !!c.secure,
        httpOnly: !!c.httpOnly,
        sameSite: SAME_SITE_MAP[(c.sameSite || "unspecified").toUpperCase()] || "unspecified",
        ...(c.expires > 0 ? { expirationDate: c.expires } : {}),
      })
      .then(() => loaded++)
      .catch(() => failed++);
  }
  console.log(`[chrome-session] ${loaded} çerez yüklendi, ${failed} hatalı`);
  return { loaded, failed };
}

module.exports = { readCookiesFromCopy, injectCookies, chromeExe, CDP_PORT };