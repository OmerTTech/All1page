"use strict";

// Chrome'un profilinin kopyasını uygulamanın kendi userData dizinine alır.
// Orijinal profile asla dokunulmaz; kopya uygulamanın oturum deposu olur.
// Böylece Chrome'da oturumu açık olan tüm Google hesapları uygulamada da
// görünür. Chrome kapalıyken çalıştırılmalıdır (Cookie DB kilitli olabilir).

const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const ENV_FLAG = "ALL1PAGE_CHROME_PROFILE";

// Kalıcı mod anahtarı: %APPDATA%\All1page\chrome-mode
// Değer "0" değilse AÇIK. Dosya yoksa varsayılan AÇIK (arkadaşlar için sıfır ayar).
function modeFile() {
  return path.join(app.getPath("appData"), "All1page", "chrome-mode");
}

function isEnabled() {
  const env = process.env[ENV_FLAG];
  if (env === "1" || env === "true") return true;
  if (env === "0" || env === "false") return false;
  try {
    if (fs.existsSync(modeFile())) {
      return fs.readFileSync(modeFile(), "utf8").trim() !== "0";
    }
  } catch {
    /* yok say */
  }
  return true; // varsayılan: kendi Chrome hesabı modu açık
}

function setEnabled(on) {
  try {
    fs.mkdirSync(path.dirname(modeFile()), { recursive: true });
    fs.writeFileSync(modeFile(), on ? "1" : "0", "utf8");
  } catch {
    /* yok say */
  }
}

// Kopyanın kökü: Chrome'un "User Data" yerleşimi birebir korunur.
// dev/paket farkı olmadan sabit: kökte "Local State" + "Default" klasörü.
function destDir() {
  return path.join(app.getPath("appData"), "All1page", "chrome-profile");
}

// Electron'un userData'sı olarak kullanılacak klasör. Chrome "--user-data-dir"
// kökünü kullanır ve içindeki "Default" profilini yazar; Electron da aynı
// dosyaları görmesi için userData'yı "Default" klasörüne yönlendiririz.
function sessionDir() {
  return path.join(destDir(), "Default");
}

// Electron, userData kökünde (yani kopyanın "Default" klasöründe) "Local State"
// arar; anahtar kökteki "Local State"te olduğundan oraya taşınması gerekir ki
// şifre çözme (v10) eşleşsin.
function ensureSessionKey(target) {
  const src = path.join(target, "Local State");
  const dest = path.join(target, "Default", "Local State");
  if (!fs.existsSync(src)) return;
  if (fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  try {
    fs.copyFileSync(src, dest);
  } catch {
    // kilitli olabilir; sessizce geç
  }
}

// UYGULAMANIN KENDİ PROFİLİ — boş (hesapsız) oluşturulur.
// DİKKAT: gerçek Chrome profili (%LOCALAPPDATA%\Google\Chrome) BURAYA
// KOPYALANMAZ. Önceden sessizce kopyalanıyordu; bu yüzden kullanıcının kendi
// Google hesapları "Hesap ekle"de kendi hesaplarıymış gibi görünüyordu.
// Hesaplar artık yalnızca "Hesap ekle" ile bu profile eklenir; profil klasörü
// hiçbir zaman silinmediği için eklenen hesaplar her açılışta kalıcıdır.
// (Klasörü silmek hesapları silmek demektir.)
function ensureCopyForImport() {
  const target = destDir();
  const hadCookies = fs.existsSync(path.join(target, "Default", "Network", "Cookies"));
  try {
    fs.mkdirSync(path.join(target, "Default"), { recursive: true });
  } catch {
    /* yok say */
  }
  // Chrome ilk açılışta kök "Local State"i kendisi yazar; anahtar "Default"
  // içinde de bulunmalı ki CDP köprüsü v10 çerezleri çözebilsin.
  ensureSessionKey(target);
  return { ok: true, updated: !hadCookies };
}

module.exports = { isEnabled, setEnabled, destDir, sessionDir, ensureCopyForImport };
