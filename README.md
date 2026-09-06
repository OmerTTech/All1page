<div align="center">

# All1page

### Tek Pencerede Sınırsız Sekme — Masaüstü Uygulaması

Electron tabanlı, her paneli kendi oturumunu tutan, ızgarada birden fazla web sitesini
aynı anda çalıştıran masaüstü uygulaması. Gemini olsun, herhangi bir site olsun —
hepsini tek pencerede aç.

[![GitHub Release](https://img.shields.io/github/v/release/OmerTTech/All1page?style=flat-square&color=blue)](https://github.com/OmerTTech/All1page/releases/latest)
[![GitHub Downloads](https://img.shields.io/github/downloads/OmerTTech/All1page/total?style=flat-square&color=green)](https://github.com/OmerTTech/All1page/releases/latest)
[![Electron](https://img.shields.io/badge/Electron-44-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white)]()

<br/>

**[ İndir (Windows) ](https://github.com/OmerTTech/All1page/releases/latest)** · **[ English (İngilizce) ](#english)** · **[ Azərbaycanca ](#azərbaycanca)**

</div>

---

## Kurulum (2 Adım)

**1. İndir**

GitHub Releases sayfasından güncel `.exe` kurulum dosyasını indir:

> **[https://github.com/OmerTTech/All1page/releases/latest](https://github.com/OmerTTech/All1page/releases/latest)**

> Repo ana sayfasındaki dosyalar kaynak kodlarıdır — çalıştırılabilir exe **Releases** bölümündedir.

**2. Kur ve Kullan**

- `All1page Setup X.X.X.exe` → çift tıkla, sihirbazı takip et (masaüstü kısayolu oluşturur).
- İlk açılışta her panelde Google hesabınla giriş yap — oturumlar kalıcıdır.

Otomatik güncelleme açılırken kontrol eder; yeni sürüm varsa arka planda indirilir ve sağ altta "Yeniden Başlat" butonu belirir.

---

## Özellikler

| Özellik | Açıklama |
|---|---|
| **Panel Izgarası** | 1×4 (varsayılan), 2×2 veya Custom (ör. 1×8, 2×3) — panel sayısı ızgaraya göre otomatik değişir |
| **Çoklu Hesap** | Her panel kendi kalıcı oturumuyla çalışır — 4 farklı Google hesabı, 4 ayrı sohbet |
| **URL Çubuğu** | Her panelde URL girilebilir; `gemini.google.com/app`, `/u/0`, `?hl=tr` desteklenir |
| **Yakınlaştırma** | `Ctrl + =` / `Ctrl + -` / `Ctrl + 0` — tüm paneller birlikte zoomlanır |
| **Tam Ekran** | Sağ üstteki ⛶ düğmesiyle pencere tam ekran olur |
| **Otomatik Gizle** | Üst çubuk gizlenir; fareyi üst kenara getirince görünür, uzaklaşınca kaybolur |
| **Otomatik Güncelleme** | GitHub Releases üzerinden otomatik sürüm kontrolü ve kurulum |

---

## Geliştirme

### Gereksinimler

- [Node.js 18+](https://nodejs.org)

### Komutlar

```bash
npm install                # bağımlılıkları kur
npm run dev                # Vite + Electron canlı yenileme
npm run dev:ui             # sadece tarayıcıda UI testi
npm run start              # derle + paketlemeden aç
npm run dir                # hızlı unpacked exe (test için)
npm run dist               # NSIS Setup üret (release/ klasörüne)
npm run dist:portable      # kurulumsuz portable exe
npm run dist:publish       # build + Setup + latest.yml → GitHub Release'e yükle
```

### Proje Yapısı

```
electron/
  main.js          ← Ana süreç: pencere, WebContentsView, IPC
  preload.js       ← contextBridge: window.grid API
  updater.js       ← Otomatik güncelleme (GitHub Releases)
app/
  src/
    App.jsx              ← Ana bileşen
    components/
      Panel/Panel.jsx    ← Tek Gemini paneli
      Toolbar/Toolbar.jsx
      UpdateBanner/UpdateBanner.jsx
    hooks/
      useGridPanels.js       ← Izgara mantığı
      useElectronBridge.js   ← Ana süreç iletişimi
      useUpdateChecker.js    ← Güncelleme kontrolü
build/
  icon.png         ← Uygulama ikonu
```

### Yeni Sürüm Yayınlama

```bash
npm version patch       # sürümü artır (1.0.0 → 1.0.1)
npm run dist:publish    # her şeyi tek komutta yap
```

Yayın öncesi bir kez `GH_TOKEN` tanımla:
```bash
setx GH_TOKEN "github_pat_..."
```

---

## Neden Web Sitesi Değil?

`gemini.google.com` iframe içinde açılmıyor (`X-Frame-Options: DENY`).
Ayrıca bir sayfadaki 4 iframe aynı çerezi paylaşacağı için 4 farklı Google hesabı
kullanmak zaten imkânsız.

Bu yüzden All1page, her panelin kendi kalıcı çerez deposuna sahip olduğu **gerçek bir
tarayıcı görünümü** (Electron `WebContentsView` + `persist:` session partition) kullanır.

---

## Sorun Giderme

| Sorun | Çözüm |
|---|---|
| Panel boş kaldı | Başlığındaki ⟳ düğmesine bas |
| "Bir şeyler ters gitti" | URL çubuğuna `gemini.google.com/app` yazıp ▶ ile git |
| 1×4'te düğmeler gizli | 2×2'ye geç — hepsi görünür |
| npm `allow-scripts` uyarısı | `node node_modules/electron/install.js` çalıştır |

---

## Teknik Detaylar

- **Electron:** v44, `WebContentsView` tabanlı çoklu panel sistemi
- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Oturum:** `persist:gemini-0..3` partition — her panel bağımsız çerez deposu
- **Güncelleme:** `electron-updater` + GitHub Releases (`latest.yml`)

---

<div align="center">

## English

### All1page — Unlimited Tabs in One Window (Desktop)

An Electron desktop app that runs multiple websites simultaneously in a grid layout, where each panel holds its own session. Gemini, or any other site — open them all in one window.

[![GitHub Release](https://img.shields.io/github/v/release/OmerTTech/All1page?style=flat-square&color=blue)](https://github.com/OmerTTech/All1page/releases/latest)

**[ Download (Windows) ](https://github.com/OmerTTech/All1page/releases/latest)**

</div>

### Installation

1. Go to **[Releases](https://github.com/OmerTTech/All1page/releases/latest)** and download the latest `.exe` setup file.
2. Run the installer — it creates a desktop shortcut.
3. On first launch, sign in with your Google account on each panel. Sessions are persistent.

> The repo's main page shows source code files. The executable is in the **Releases** section.

### Features

- **Grid layouts:** 1×4 (default), 2×2, or custom (e.g. 1×8, 2×3)
- **Multi-account:** Each panel has its own persistent session — use 4 different Google accounts simultaneously
- **URL bar:** Navigate to any Gemini URL per panel
- **Zoom:** `Ctrl + =` / `Ctrl + -` / `Ctrl + 0` — all panels zoom together
- **Fullscreen:** Toggle via the ⛶ button
- **Auto-hide toolbar:** Hide the top bar; hover over the top edge to reveal
- **Auto-update:** Checks GitHub Releases on launch; updates install automatically

### Development

```bash
npm install
npm run dev              # Vite + Electron with hot reload
npm run dist             # Build NSIS Setup
npm run dist:publish     # Build + publish to GitHub Releases
```

Requires Node.js 18+.

---

<div align="center">

## Azərbaycanca

### All1page — Bir Pəncərədə Sınırsız Vərəq (Masaüstü)

Hər panel öz sessiyasını saxlayan, şəbəkədə birdən çox vebsaytı eyni anda işə salan Electron masaüstü tətbiqi. Gemini olsun, istənilən sayt olsun — hamısını bir pəncərədə açın.

[![GitHub Release](https://img.shields.io/github/v/release/OmerTTech/All1page?style=flat-square&color=blue)](https://github.com/OmerTTech/All1page/releases/latest)

**[ Yüklə (Windows) ](https://github.com/OmerTTech/All1page/releases/latest)**

</div>

### Quraşdırma

1. **[Buradan](https://github.com/OmerTTech/All1page/releases/latest)** ən son `.exe` quraşdırma faylını yükləyin.
2. Quraşdırıcını işə salın — masaüstü qısayol yaradılır.
3. İlk açılışda hər paneldə Google hesabınızla daxil olun — sessiyalar qalıcıdır.

> Repo əsas səhifəsi mənbə kodlarını göstərir. İcra olunan fayl **Releases** bölməsindədir.

### Xüsusiyyətlər

- **Şəbəkə növləri:** 1×4 (susmaya görə), 2×2 və ya xüsusi (məs. 1×8, 2×3)
- **Çoxlu hesab:** Hər panel öz qalıcı sessiyasını saxlayır — eyni anda 4 fərqli Google hesabı istifadə edin
- **URL çubuğu:** Hər paneldə istənilən Gemini URL-inə daxil olun
- **Yaxınlaşma:** `Ctrl + =` / `Ctrl + -` / `Ctrl + 0`
- **Tam ekran:** ⛶ düyməsi ilə keçin
- **Avtomatik gizləmə:** Üst çubuğu gizləyin; yuxarı kənara gətirin görünür
- **Avtomatik yeniləmə:** Açılışda GitHub Releases-yə baxır; yeniliklər avtomatik quraşdırılır

### İnkişaf

```bash
npm install
npm run dev              # Vite + Electron canlı yeniləmə ilə
npm run dist             # NSIS Setup yaradın
npm run dist:publish     # Build + GitHub Releases-ə yüklə
```