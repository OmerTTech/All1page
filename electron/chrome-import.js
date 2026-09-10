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

// Ağırlık yapan / gereksiz önbellek dizinleri kopyalanmaz
const SKIP_DIRS = new Set([
  "Cache",
  "Code Cache",
  "CachedData",
  "GPUCache",
  "DawnGraphiteCache",
  "DawnWebGPUCache",
  "ShaderCache",
  "GrShaderCache",
  "Media Cache",
  "Media Capabilities",
  "Storage",
  "CacheStorage",
  "component_crx_cache",
  "OptimizationHints",
  "download_cache",
]);

function chromeUserDataDir() {
  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "User Data");
  }
  if (process.platform === "darwin") {
    return path.join(
      process.env.HOME,
      "Library",
      "Application Support",
      "Google",
      "Chrome"
    );
  }
  return path.join(process.env.HOME, ".config", "google-chrome");
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

function recursiveCopy(src, dest, skip = new Set()) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      recursiveCopy(from, to, skip);
    } else if (entry.isFile()) {
      try {
        fs.copyFileSync(from, to);
      } catch {
        // Chrome açıkken kilitli bir dosya da olabilir; sessizce atla.
      }
    }
  }
}

// Chrome "Default" profilini hedef dizine aktarır. Varsa en güncelini
// korur, sadece yoksa oluşturur.
function importProfile() {
  const base = chromeUserDataDir();
  if (!base || !fs.existsSync(base)) return { ok: false, reason: "chrome-missing" };

  const target = destDir();
  const hadExisting =
    fs.existsSync(path.join(target, "Local State")) ||
    fs.existsSync(path.join(target, "Network")) ||
    fs.existsSync(path.join(target, "Default", "Network"));

  if (!hadExisting) {
    fs.mkdirSync(target, { recursive: true });

    // Şifreleme anahtarlarını taşıyan Local State, User Data kökünde durur
    try {
      fs.copyFileSync(path.join(base, "Local State"), path.join(target, "Local State"));
    } catch {
      // bazı sürümlerde kökte olmayabilir
    }

    // Chrome'un "Default" profilinin içeriği "Default" klasörüne gider
    const def = path.join(base, "Default");
    if (fs.existsSync(def)) {
      recursiveCopy(def, path.join(target, "Default"), SKIP_DIRS);
    }
  }

  // Electron userData'sı "Default" klasörüne işaret edilir; Chromium oradan
  // "Local State" arar. Chrome'un anahtarı olmadan v10 çerezler çözülemez.
  ensureSessionKey(target);

  const ok =
    fs.existsSync(path.join(target, "Local State")) ||
    fs.existsSync(path.join(target, "Default", "Network", "Cookies"));
  return ok ? { ok: true, updated: !hadExisting } : { ok: false, reason: "incomplete" };
}

// Electron, userData kökünde (yani kopyanın "Default" klasöründe) "Local State"
// arar; Chrome'un anahtarı kökteki "Local State"te olduğundan oraya taşınması
// gerekir ki şifre çözme (v10) eşleşsin.
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

// CDP köprüsü öncesi: kopya profilin hazır olduğundan emin olur.
// Kopya zaten varsa korunur (kullanıcı orada giriş yapmıştır); yoksa gerçek
// Chrome profilinden oluşturulur.
function ensureCopyForImport() {
  const base = chromeUserDataDir();
  const target = destDir();
  const hadExisting =
    fs.existsSync(path.join(target, "Local State")) ||
    fs.existsSync(path.join(target, "Network")) ||
    fs.existsSync(path.join(target, "Default", "Network"));

  if (!hadExisting) {
    if (!fs.existsSync(base)) return { ok: false, reason: "chrome-missing" };
    fs.mkdirSync(target, { recursive: true });
    try {
      fs.copyFileSync(path.join(base, "Local State"), path.join(target, "Local State"));
    } catch {
      // yok
    }
    const def = path.join(base, "Default");
    if (fs.existsSync(def)) recursiveCopy(def, path.join(target, "Default"), SKIP_DIRS);
  }

  ensureSessionKey(target);

  const ok =
    fs.existsSync(path.join(target, "Local State")) ||
    fs.existsSync(path.join(target, "Default", "Network", "Cookies"));
  return ok ? { ok: true, updated: !hadExisting } : { ok: false, reason: "incomplete" };
}

module.exports = { importProfile, isEnabled, setEnabled, destDir, sessionDir, chromeUserDataDir, ensureCopyForImport };