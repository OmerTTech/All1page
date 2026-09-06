<div align="center">

[![English](https://img.shields.io/badge/English-4D5ECD?style=for-the-badge)](https://github.com/OmerTTech/All1page#english)
[![Türkçe](https://img.shields.io/badge/T%C3%BCrk%C3%A7e-BC4D3C?style=for-the-badge)](https://github.com/OmerTTech/All1page#t%C3%BCrk%C3%A7e)
[![Azərbaycanca](https://img.shields.io/badge/Az%C9%99rbaycanca-079A09?style=for-the-badge)](https://github.com/OmerTTech/All1page#az%C9%99rbaycanca)

</div>
<p align="center">
  Unlimited Tabs in One Window — Tek pencerede sınırsız sekme — Bir pəncərədə limitsiz tablar
</p>

---

<div align="center">

# All1page

### Unlimited Tabs in One Window — Desktop App

[![GitHub Release](https://img.shields.io/github/v/release/OmerTTech/All1page?style=flat-square&color=blue)](https://github.com/OmerTTech/All1page/releases/latest)
[![GitHub Downloads](https://img.shields.io/github/downloads/OmerTTech/All1page/total?style=flat-square&color=green)](https://github.com/OmerTTech/All1page/releases/latest)
[![Electron](https://img.shields.io/badge/Electron-44-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white)]()

<br/>

**[⬇ DOWNLOAD (WINDOWS)](https://github.com/OmerTTech/All1page/releases/latest)**

<br/>

</div>

---

<br/>

## English

<div align="center">

**All1page** is an Electron desktop app that runs many websites at once in a grid, where each panel keeps its own login session. Gemini or any other site — open them all in one window.

**[⬇ Download (Windows)](https://github.com/OmerTTech/All1page/releases/latest)**

</div>

### Features

- **Grid layouts:** 1×4 (default), 2×2, or custom (e.g. 1×8, 2×3, 8×4) — panels resize automatically
- **Stack mode:** In a custom grid, rows are never compressed; each row keeps screen height and the app scrolls down to reach the rest
- **Multi-account:** Each panel keeps its own persistent session — run multiple Google accounts at the same time
- **URL bar:** Open any site/URL per panel, not just Gemini
- **Settings:** Interface language (English / Türkçe / Azərbaycanca), dark & light theme, grid gap, start fullscreen, remember session
- **Zoom:** `Ctrl + =` / `Ctrl + -` / `Ctrl + 0` — all panels zoom together
- **Fullscreen:** Toggle via the ⛶ button
- **Auto-hide toolbar:** Hides the top bar; hover the top edge to reveal
- **Auto-update:** Checks GitHub Releases on launch; updates install automatically

### Installation

1. Download the latest `.exe` setup from **[Releases](https://github.com/OmerTTech/All1page/releases/latest)**.
2. Run the installer — it creates a desktop shortcut.
3. On first launch, sign in with your Google account on each panel. Sessions are persistent.

> The repo's main page shows source code. The executable lives in the **Releases** section.

### Development

Requires Node.js 18+.

```bash
npm install                # install dependencies
npm run dev                # Vite + Electron hot reload
npm run dev:ui             # UI only in the browser
npm run start              # build + run (no packaging)
npm run dir                # fast unpacked .exe (testing)
npm run dist               # build NSIS Setup (release/)
npm run dist:portable      # portable .exe (no installation)
npm run dist:publish       # build + Setup + latest.yml → publish to GitHub Release
```

### Releasing a New Version

```bash
npm version 1.2.1          # set the version
npm run dist:publish       # build + upload Setup + latest.yml to GitHub Release
git push && git push --tags # push code and the tag
```

Set `GH_TOKEN` once (persistent on Windows):

```bash
setx GH_TOKEN "github_pat_..."
```

### Version History

- **v1.2.0** — Azerbaijani installer language; the app follows the installer language; Settings panel opens above the panels; real OS-level maximize on startup; fullscreen exit-loop fix; pre-built icon (no converter needed)
- **v1.1.0** — Settings menu, themes, stack mode, design refresh
- **v1.0.0** — Initial release

---

## Türkçe

<div align="center">

**All1page**, her panelin kendi oturumunu tuttuğu, ızgarada birden fazla web sitesini aynı anda çalıştıran Electron masaüstü uygulamasıdır. Gemini olsun, herhangi bir site olsun — hepsini tek pencerede aç.

**[⬇ İndir (Windows)](https://github.com/OmerTTech/All1page/releases/latest)**

</div>

### Kurulum (2 Adım)

**1. İndir**

GitHub Releases sayfasından güncel `.exe` kurulum dosyasını indir:

> **[https://github.com/OmerTTech/All1page/releases/latest](https://github.com/OmerTTech/All1page/releases/latest)**

> Repo ana sayfasındaki dosyalar kaynak kodlarıdır — çalıştırılabilir exe **Releases** bölümündedir.

**2. Kur ve Kullan**

- `All1page Setup X.X.X.exe` → çift tıkla, sihirbazı takip et (masaüstü kısayolu oluşturur).
- İlk açılışta her panelde Google hesabınla giriş yap — oturumlar kalıcıdır.

Otomatik güncelleme açılırken kontrol eder; yeni sürüm varsa sağ altta "Yeniden Başlat" butonu belirir.

### Özellikler

| Özellik | Açıklama |
|---|---|
| **Panel Izgarası** | 1×4 (varsayılan), 2×2 veya Custom (ör. 1×8, 2×3, 8×4) — panel sayısı ızgaraya göre otomatik değişir |
| **Yığın Modu** | Custom ızgarada satırlar sıkıştırılmaz; her satır ekran yüksekliğinde kalır, alt panellere uygulama kaydırılarak ulaşılır |
| **Çoklu Hesap** | Her panel kendi kalıcı oturumuyla çalışır — 4 farklı Google hesabı, 4 ayrı sohbet |
| **URL Çubuğu** | Her panelde URL girilebilir; sadece Gemini değil her site açılır |
| **Ayarlar** | Arayüz dili (Türkçe/English/Azərbaycanca), açık & koyu tema, ızgara boşluğu, tam ekran başlangıcı, oturumu hatırlama |
| **Yakınlaştırma** | `Ctrl + =` / `Ctrl + -` / `Ctrl + 0` — tüm paneller birlikte zoomlanır |
| **Tam Ekran** | Sağ üstteki ⛶ düğmesiyle pencere tam ekran olur |
| **Otomatik Gizle** | Üst çubuk gizlenir; fareyi üst kenara getirince görünür, uzaklaşınca kaybolur |
| **Otomatik Güncelleme** | GitHub Releases üzerinden otomatik sürüm kontrolü ve kurulum |

### Geliştirme

#### Gereksinimler

- [Node.js 18+](https://nodejs.org)

#### Komutlar

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

#### Proje Yapısı

```
electron/
  main.js          ← Ana süreç: pencere, WebContentsView, IPC
  preload.js       ← contextBridge: window.grid API
  updater.js       ← Otomatik güncelleme (GitHub Releases)
  publish.js       ← Yayın sonrası draft-onay script'i
app/
  src/
    App.jsx              ← Ana bileşen
    i18n.js              ← TR/EN/AZ çeviriler
    components/
      Panel/Panel.jsx          ← Tek panel
      Toolbar/Toolbar.jsx
      Settings/Settings.jsx    ← Dil, tema, ızgara ayarları
      UpdateBanner/UpdateBanner.jsx
    hooks/
      useGridPanels.js       ← Izgara mantığı + ayarlar
      useElectronBridge.js   ← Ana süreç iletişimi
      useUpdateChecker.js    ← Güncelleme kontrolü
build/
  icon.ico         ← Uygulama ikonu (hazır dosya)
```

#### Yeni Sürüm Yayınlama

```bash
npm version 1.2.1          # sürümü belirle
npm run dist:publish       # build + Setup + latest.yml → GitHub Release'e yükle
git push && git push --tags # kodu ve etiketi GitHub'a gönder
```

Yayın öncesi bir kez `GH_TOKEN` tanımla (Windows kalıcı):

```bash
setx GH_TOKEN "github_pat_..."
```

### Neden Web Sitesi Değil?

`gemini.google.com` iframe içinde açılmıyor (`X-Frame-Options: DENY`).
Ayrıca bir sayfadaki 4 iframe aynı çerezi paylaşacağı için 4 farklı Google hesabı
kullanmak zaten imkânsız.

Bu yüzden All1page, her panelin kendi kalıcı çerez deposuna sahip olduğu **gerçek bir
tarayıcı görünümü** (Electron `WebContentsView` + `persist:` session partition) kullanır.

### Sorun Giderme

| Sorun | Çözüm |
|---|---|
| Panel boş kaldı | Başlığındaki ⟳ düğmesine bas |
| "Bir şeyler ters gitti" | URL çubuğuna `gemini.google.com/app` yazıp ▶ ile git |
| 1×4'te düğmeler gizli | 2×2'ye geç — hepsi görünür |
| npm `allow-scripts` uyarısı | `node node_modules/electron/install.js` çalıştır |

### Teknik Detaylar

- **Electron:** v44, `WebContentsView` tabanlı çoklu panel sistemi
- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Oturum:** `persist:gemini-0..n` partition — her panel bağımsız çerez deposu
- **Güncelleme:** `electron-updater` + GitHub Releases (`latest.yml`)

### Sürüm Geçmişi

- **v1.2.0** — Azərbaycanca kurulumcu dili; uygulama kurulum dilinde açılır; Ayarlar panellerin üstünde; açılışta gerçek OS düzeyinde ekranı kapla; tam ekran çıkışı tekrar döngüsü düzeltmesi; hazır ikon (dönüştürücü gerekmez)
- **v1.1.0** — Ayarlar menüsü, temalar, yığın modu, tasarım yenilemesi
- **v1.0.0** — İlk sürüm

---

## Azərbaycanca

<div align="center">

**All1page** hər paneli öz sessiyasını saxlayan, şəbəkədə birdən çox vebsaytı eyni anda işə salan Electron masaüstü tətbiqidir. Gemini olsun, istənilən sayt olsun — hamısını bir pəncərədə açın.

**[⬇ Yüklə (Windows)](https://github.com/OmerTTech/All1page/releases/latest)**

</div>

### Quraşdırma

1. **[Buradan](https://github.com/OmerTTech/All1page/releases/latest)** ən son `.exe` quraşdırma faylını yükləyin.
2. Quraşdırıcını işə salın — masaüstü qısayol yaradılır.
3. İlk açılışda hər paneldə Google hesabınızla daxil olun — sessiyalar qalıcıdır.

> Repo əsas səhifəsi mənbə kodlarını göstərir. İcra olunan fayl **Releases** bölməsindədir.

### Xüsusiyyətlər

- **Şəbəkə növləri:** 1×4 (susmaya görə), 2×2 və ya xüsusi (məs. 1×8, 2×3, 8×4)
- **Yığın rejimi:** Xüsusi şəbəkədə sətirlər sıxılmır; hər sətir ekran hündürlüyündə qalır, qalan panellər üçün tətbiq aşağı sürüşdürülür
- **Çoxlu hesab:** Hər panel öz qalıcı sessiyasını saxlayır — eyni anda bir neçə Google hesabı istifadə edin
- **URL çubuğu:** Hər paneldə istənilən saytı/URL-i açın, təkcə Gemini yox
- **Ayarlar:** İnterfeys dili (English / Türkçe / Azərbaycanca), qaranlıq & işıqlı mövzu, şəbəkə boşluğu, tam ekran başlanğıcı, sessiyanı xatırlama
- **Yaxınlaşma:** `Ctrl + =` / `Ctrl + -` / `Ctrl + 0`
- **Tam ekran:** ⛶ düyməsi ilə keçin
- **Avtomatik gizləmə:** Üst çubuğu gizləyin; yuxarı kənara gətirdikdə görünür
- **Avtomatik yeniləmə:** Açılışda GitHub Releases-ə baxır; yeniliklər avtomatik quraşdırılır

### İnkişaf

Node.js 18+ lazımdır.

```bash
npm install                # asılılıqları qurun
npm run dev                # Vite + Electron canlı yeniləmə
npm run dev:ui             # yalnız brauzerdə UI testi
npm run start              # qur + paketləmədən açın
npm run dir                # sürətli unpacked exe (test üçün)
npm run dist               # NSIS Setup hazırlayın (release/ qovluğuna)
npm run dist:portable      # quraşdırmasız portable exe
npm run dist:publish       # build + Setup + latest.yml → GitHub Release-ə yüklə
```

### Yeni Versiya Yayımlama

```bash
npm version 1.2.1          # versiyanı təyin edin
npm run dist:publish       # build + Setup + latest.yml → GitHub Release-ə yüklə
git push && git push --tags # kodu və teqi GitHub-a göndərin
```

`GH_TOKEN` bir dəfə təyin edin (Windows davamlı):

```bash
setx GH_TOKEN "github_pat_..."
```

### Versiya tarixçəsi

- **v1.2.0** — Azərbaycanca quraşdırıcı dili; tətbiq quraşdırıcı dilində açılır; Ayarlar panellərin üstündə; açılışda real OS səviyyəli tam ekran; tam ekrandan çıxanda təkrarlanma döngüsü düzəlişi; hazır ikon (çevirici tələb olunmur)
- **v1.1.0** — Ayarlar menyusu, mövzular, yığın rejimi, dizayn yeniləməsi
- **v1.0.0** — İlk buraxılış
