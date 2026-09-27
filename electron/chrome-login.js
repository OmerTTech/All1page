"use strict";

// Kopya profili gerçek Chrome'da App-Bound Encryption KAPALI olarak açar.
// Böylece Google girişi engellemez (gerçek tarayıcı) ve yazılan çerezler
// v10/v11 (headless Chrome CDP ile çözebildiği) biçimde olur.

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const APPDATA = process.env.APPDATA || "";
const DEST = path.join(APPDATA, "All1page", "chrome-profile");

function destDir() {
  return DEST;
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

function ensureSessionKey(target) {
  const src = path.join(target, "Local State");
  const dest = path.join(target, "Default", "Local State");
  if (!fs.existsSync(src) || fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try { fs.copyFileSync(src, dest); } catch { /* kilitli */ }
}

// UYGULAMANIN KENDİ PROFİLİ — boş (hesapsız) oluşturulur.
// DİKKAT: gerçek Chrome profili (%LOCALAPPDATA%\Google\Chrome) BURAYA
// KOPYALANMAZ. Önceden sessizce kopyalanıyordu; bu yüzden "Hesap ekle"de
// kullanıcının kendi Google hesapları çıkıyordu. Artık Chrome, verilen boş
// klasörde kendi profilini (Default + Local State) kendisi oluşturur.
// Hesaplar yalnızca burada, "Hesap ekle" ile eklenir ve klasör silinmediği
// için her açılışta kalıcıdır.
function ensureCopy() {
  const target = destDir();
  try {
    fs.mkdirSync(path.join(target, "Default"), { recursive: true });
  } catch { /* yoksay */ }
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
    // Profil bayrağı ZORUNLU: verilmezse Chrome, kopya profilin "Local State"
    // içindeki "son kullanılan profil" bilgisine uyar (profile.last_used). O
    // "Profile 2" ise çerezler Profile 2'ye yazılır, ama chrome-session.js
    // her zaman Default'ı okuyordu -> Chrome'da hesap görünür, uygulamada
    // görünmez. Burada da Default'a sabitliyoruz; iki taraf hep aynı profil.
    "--profile-directory=Default",
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