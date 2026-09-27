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

// Kopya profilde hangi profil klasörlerinde GERÇEKTEN çerez dosyası var?
// v1.4.1'e kadar yazan taraf "son kullanılan profil"e uyuyordu; o bilgisayarlarda
// çerezler "Profile 2" gibi bir klasörde kalır. Kullanıcı yeniden giriş yapmak
// (veya veri taşımak) zorunda kalmaması için Default'ın yanında bu eski
// klasörler de okunur. Default her zaman ilk sırada gelir, çakışmada o kazanır.
function profileDirsWithCookies(copyDir) {
  const hasCookies = (name) => {
    try {
      const f = path.join(copyDir, name, "Network", "Cookies");
      return fs.existsSync(f) && fs.statSync(f).size > 0;
    } catch {
      return false;
    }
  };

  const out = [];
  if (hasCookies("Default")) out.push("Default");

  let entries = [];
  try {
    entries = fs.readdirSync(copyDir, { withFileTypes: true });
  } catch {
    /* okunamadı */
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name === "Default" || !/^Profile \d+$/.test(e.name)) continue;
    if (hasCookies(e.name)) out.push(e.name);
  }

  return out.length ? out : ["Default"];
}

// Tek bir profil klasörünü headless Chrome ile açar, Network.getAllCookies ile
// çözülmüş çerezleri döndürür. Chrome'u çağrı sonunda kapatır.
async function readCookiesFromProfile(exe, copyDir, profileDir, port) {
  const chrome = spawn(exe, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${copyDir}`,
    `--profile-directory=${profileDir}`,
    "--disable-features=AppBoundEncryption",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ], { stdio: "ignore", detached: true });

  let ws;
  try {
    const page = await waitForPort(port, 20000);
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

// Kopya profildeki (çerez dosyası bulunan) TÜM profilleri okur ve çerezleri
// birleştirir. Profil klasörü başına ayrı CDP portu kullanılır; bir profil
// açılamazsa diğerleri yine okunur.
async function readCookiesFromCopy(copyDir) {
  const exe = chromeExe();
  if (!exe) throw new Error("chrome.exe bulunamadi");
  if (!fs.existsSync(copyDir)) throw new Error("Kopya profil yok: " + copyDir);

  const dirs = profileDirsWithCookies(copyDir);
  if (dirs.length > 1) {
    console.log("[chrome-session] çerez olan profiller:", dirs.join(", "));
  }

  const merged = new Map();
  for (let i = 0; i < dirs.length; i++) {
    let got = [];
    try {
      got = await readCookiesFromProfile(exe, copyDir, dirs[i], CDP_PORT + i);
    } catch (e) {
      console.warn(`[chrome-session] ${dirs[i]} profili okunamadı:`, e.message);
      continue;
    }
    console.log(`[chrome-session] ${dirs[i]}: ${got.length} çerez`);
    for (const c of got) {
      const key = `${c.domain || ""}|${c.path || "/"}|${c.name || ""}`;
      if (!merged.has(key)) merged.set(key, c);
    }
  }
  return [...merged.values()];
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
        // __Host- önekli çerezler (__Host-GSID, __Host-3PSID vb.) kural gereği
        // domain içermez; domain gönderilirse Chromium reddeder ve o çerezler
        // kaybolur (oturum "yarım" görünür). Onlar için domain atlanır.
        // CDP, host-only çerezde noktasız ("google.com"), domain çerezde noktalı
        // (".google.com") döner. Noktasız olanı da domain olarak yazmak çerezi
        // tüm alt alan adlarına yayardı; host-only ise domain verilmez.
        domain: /^__Host-/.test(c.name || "") ? undefined : /^\./.test(c.domain || "") ? c.domain : undefined,
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

module.exports = { readCookiesFromCopy, injectCookies, chromeExe, CDP_PORT, profileDirsWithCookies };