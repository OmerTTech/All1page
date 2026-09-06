"use strict";

// electron-builder NSIS'ine Azərbaycanca dil desteği ekler.
// 1) Azerbaijani.nlf dosyasını makensis'in "Language files" klasörüne kopyalar
//    (NSIS motorunda Azərbaycanca hazır dil dosyası yoktur).
// 2) electron-builder'ın messages.yml / assistedMessages.yml dosyalarındaki
//    az_AZ çevirilerini temiz (tırnaksız, güvenli) değerlerle düzeltir.
//    messages.yml'deki hazır az değerleri tırnak içinde tırnak içerir ve
//    makensis "LangString expects 3 parameters" hatası verir.
// Her build öncesi çalıştırılır; zaten yapıldıysa değişiklik yapmaz (idempotent).

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { toLangWithRegion } = require("../node_modules/app-builder-lib/out/util/langs.js");

const ROOT = path.join(__dirname, "..");
const NLF_NAME = "Azerbaijani.nlf";
const NLF_SRC = path.join(ROOT, "build", "nsis", NLF_NAME);
const NSH_NAME = "Azerbaijani.nsh";
const NSH_SRC = path.join(ROOT, "build", "nsis", NSH_NAME);

// messages.yml (tek-tık kurulum mesajları) için temiz Azərbaycanca değerler
const AZ_MESSAGES = {
  win7Required: "Windows 7 və yuxarı tələb olunur",
  x64WinRequired: "64-bit Windows tələb olunur",
  appRunning:
    "${PRODUCT_NAME} işləyir.\nBağlamaq üçün Oldu düyməsinə klikləyin.\nBağlanmırsa, əl ilə bağlamağa çalışın.",
  appCannotBeClosed:
    "${PRODUCT_NAME} bağlana bilmir.\nZəhmət olmasa əl ilə bağlayın və davam etmək üçün Yenidən sına düyməsinə klikləyin.",
  installing: "Quraşdırılır, lütfən gözləyin...",
  areYouSureToUninstall:
    "${PRODUCT_NAME} proqramını silmək istədiyinizə əminsiniz?",
  decompressionFailed:
    "Faylların açılışı uğursuz oldu. Zəhmət olmasa quraşdırıcını yenidən işə salmağa çalışın.",
  uninstallFailed:
    "Köhnə tətbiq fayllarının silinməsi uğursuz oldu. Zəhmət olmasa quraşdırıcını yenidən işə salmağa çalışın.",
  appClosing: "${PRODUCT_NAME} bağlanır...",
};

// assistedMessages.yml (destekli/assisted kurulum sayfası) için Azərbaycanca değerler
const AZ_ASSISTED = {
  chooseInstallationOptions: "Quraşdırma Seçimlərini Seçin",
  chooseUninstallationOptions: "Silmə Seçimlərini Seçin",
  whoShouldThisApplicationBeInstalledFor: "Bu proqram kim üçün quraşdırılsın?",
  selectUserMode:
    "Lütfən, bu proqramın bütün istifadəçilər üçün, yoxsa yalnız sizin üçün quraşdırılacağını seçin",
  freshInstallForAll:
    "Bütün istifadəçilər üçün təmiz quraşdırma. (administrator məlumatları tələb ediləcək)",
  freshInstallForCurrent: "Yalnız cari istifadəçi üçün təmiz quraşdırma.",
  onlyForMe: "Yalnız &mənim üçün",
  forAll: "Bu kompüteri istifadə edən hər kəs (&bütün istifadəçilər)",
  loginWithAdminAccount:
    "Davam etmək üçün administratorlar qrupuna daxil olan hesabla daxil olmalısınız...",
  perUserInstallExists: "Artıq istifadəçi üzrə quraşdırma mövcuddur.",
  perUserInstall: "İstifadəçi üzrə quraşdırma mövcuddur.",
  perMachineInstallExists: "Artıq maşın üzrə quraşdırma mövcuddur.",
  perMachineInstall: "Maşın üzrə quraşdırma mövcuddur.",
  reinstallUpgrade: "Yenidən quraşdırılacaq/yüksəldiləcək.",
  uninstall: "Silinəcək.",
  whichInstallationShouldBeRemoved: "Hansı quraşdırma silinsin?",
  whichInstallationRemove:
    "Bu proqram həm maşın üzrə (bütün istifadəçilər), həm də istifadəçi üzrə quraşdırılıb. Hansı quraşdırmanı silmək istəyirsiniz?",
};

function findNsisLanguageDir() {
  const base = path.join(
    process.env.LOCALAPPDATA || "",
    "electron-builder",
    "Cache"
  );
  if (!fs.existsSync(base)) return null;
  const nsisDirs = fs
    .readdirSync(base)
    .filter((d) => d.startsWith("nsis-"))
    .map((d) => path.join(base, d));
  for (const dir of nsisDirs) {
    const found = [];
    const walk = (p) => {
      const entries = fs.readdirSync(p, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(p, e.name);
        if (e.isDirectory()) {
          if (e.name === "Language files" && fs.existsSync(path.join(full, "English.nlf"))) {
            found.push(full);
          } else if (e.name !== "Language files") {
            walk(full);
          }
        }
      }
    };
    try {
      walk(dir);
    } catch {
      /* kilitsiz bir klasörü atla */
    }
    if (found.length === 1) return found[0];
    if (found.length > 1) found.sort().pop();
  }
  return null;
}

function copyWithUtf8Bom(src, dest, label) {
  const raw = fs.readFileSync(src, "utf8");
  const bom = "\uFEFF";
  const content = raw.startsWith(bom) ? raw : bom + raw;
  fs.writeFileSync(dest, content, "utf8");
  console.log(label + " → " + dest);
}

function copyNlf() {
  const langDir = findNsisLanguageDir();
  if (!langDir) {
    console.log("Uyarı: NSIS cache 'Language files' klasörü bulunamadı, Azerbaycanca dosyaları atlandı.");
    return false;
  }
  copyWithUtf8Bom(NLF_SRC, path.join(langDir, NLF_NAME), "Azerbaijani.nlf");
  copyWithUtf8Bom(NSH_SRC, path.join(langDir, NSH_NAME), "Azerbaijani.nsh");
  return true;
}

function ensureAz(file, translations) {
  const abs = path.join(ROOT, "node_modules", "app-builder-lib", "templates", "nsis", file);
  const data = yaml.load(fs.readFileSync(abs, "utf8"));
  let changed = false;
  for (const key of Object.keys(translations)) {
    const block = data[key];
    if (!block || typeof block !== "object") {
      console.log("Uyarı: '" + key + "' bloğu bulunamadı: " + file);
      continue;
    }
    const azKey =
      Object.keys(block).find((k) => toLangWithRegion(k) === "az_AZ") || "az";
    if (block[azKey] !== translations[key]) {
      block[azKey] = translations[key];
      changed = true;
    }
    for (const k of Object.keys(block)) {
      if (k !== azKey && toLangWithRegion(k) === "az_AZ") {
        delete block[k];
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(
      abs,
      yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"' })
    );
    console.log(file + " için az_AZ değerleri güncellendi.");
  } else {
    console.log(file + " zaten güncel.");
  }
}

copyNlf();
ensureAz("messages.yml", AZ_MESSAGES);
ensureAz("assistedMessages.yml", AZ_ASSISTED);