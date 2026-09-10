"use strict";

// Kopya profili gerçek Chrome'da App-Bound Encryption KAPALI olarak açar.
// Böylece Google girişi engellemez (gerçek tarayıcı) ve yazılan çerezler
// v10/v11 (headless Chrome CDP ile çözebildiği) biçimde olur.

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const APPDATA = process.env.APPDATA || "";
const DEST = path.join(APPDATA, "All1page", "chrome-profile");

const SKIP_DIRS = new Set([
  "Cache", "Code Cache", "CachedData", "GPUCache",
  "DawnGraphiteCache", "DawnWebGPUCache", "ShaderCache", "GrShaderCache",
  "Media Cache", "Media Capabilities", "Storage", "CacheStorage",
  "component_crx_cache", "OptimizationHints", "download_cache",
]);

function destDir() {
  return DEST;
}

function chromeUserDataDir() {
  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "User Data");
  }
  if (process.platform === "darwin") {
    return path.join(process.env.HOME, "Library", "Application Support", "Google", "Chrome");
  }
  return path.join(process.env.HOME, ".config", "google-chrome");
}

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

function recursiveCopy(src, dest, skip) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) recursiveCopy(from, to, skip);
    else if (entry.isFile()) {
      try { fs.copyFileSync(from, to); } catch { /* kilitli dosya */ }
    }
  }
}

function ensureSessionKey(target) {
  const src = path.join(target, "Local State");
  const dest = path.join(target, "Default", "Local State");
  if (!fs.existsSync(src) || fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try { fs.copyFileSync(src, dest); } catch { /* kilitli */ }
}

function ensureCopy() {
  const base = chromeUserDataDir();
  const target = destDir();
  const hadExisting =
    fs.existsSync(path.join(target, "Local State")) ||
    fs.existsSync(path.join(target, "Network")) ||
    fs.existsSync(path.join(target, "Default", "Network"));
  if (!hadExisting) {
    if (!fs.existsSync(base)) throw new Error("Chrome profili bulunamadı: " + base);
    console.log("[chrome-login] Kopya oluşturuluyor (", base, "→", target, ")");
    fs.mkdirSync(target, { recursive: true });
    try { fs.copyFileSync(path.join(base, "Local State"), path.join(target, "Local State")); } catch { /* yok */ }
    const def = path.join(base, "Default");
    if (fs.existsSync(def)) recursiveCopy(def, path.join(target, "Default"), SKIP_DIRS);
  }
  ensureSessionKey(target);
  return target;
}

// Gerçek Chrome'u kopya profil üzerinde açar. Tarayıcı bu profili (ve
// çerezlerini) kendi yönetir; uygulama başlarken CDP köprüsü ile okur.
// Çağıran: hem CLI (node chrome-login.js) hem IPC (grid:open-chrome-login).
// Varsayılan hedef: Google hesap seçici (AccountChooser). Çoklu hesap
// varken TÜM oturum açmış hesapların listesini verir; altta "Use another
// account" ile yeni hesap girişi açılır. Yeni hesap girişinden sonra yine
// bu sayfaya dönülür ki eklenen hesap da dahil tüm hesaplar görünsün.
// (www.google.com kullanmıyoruz — orada koca arama sayfası açılıyordu;
// authuser parametresi bu aktif hesap seçici sayfasında sorun değildir.)
const ACCOUNTS_URL =
  "https://accounts.google.com/AccountChooser" +
  "?continue=" + encodeURIComponent("https://accounts.google.com/AccountChooser");

function openLoginChrome(url, opts) {
  opts = opts || {};
  const exe = chromeExe();
  if (!exe) return { ok: false, reason: "chrome-missing" };

  let target;
  try {
    target = ensureCopy();
  } catch (e) {
    return { ok: false, reason: e.message };
  }

  console.log("[chrome-login] Kopya profil:", target);
  const args = [
    `--user-data-dir=${target}`,
    "--disable-features=AppBoundEncryption",
    "--no-first-run",
    "--no-default-browser-check",
    String(url || ACCOUNTS_URL),
  ];
  const child = spawn(exe, args, { detached: true, stdio: "ignore" });
  if (!opts.keepChild) child.unref();
  return { ok: true, target, child };
}

function main() {
  if (process.platform !== "win32") {
    console.error("Şimdilik yalnızca Windows");
    process.exit(1);
  }
  const res = openLoginChrome();
  if (!res.ok) {
    console.error("Chrome açılamadı:", res.reason);
    process.exit(1);
  }
  console.log("");
  console.log("1) Açılan Chrome'da hesap listesi gelir (tüm hesaplar görünür).");
  console.log("2) 'Use another account' ile yeni hesap ekle; girişten sonra");
  console.log("   tekrar aynı hesap listesine dönersin.");
  console.log("3) Chrome'u KAPAT. Uygulama çerezleri devralır.");
  console.log("   (Hesabı görmek için paneli yenile veya uygulamayı yeniden başlat.)");
}

module.exports = { openLoginChrome, destDir, chromeExe };

if (require.main === module) main();