# All1page — Gemini Görsel Üretici

`gemini-3.1-flash-image` (Nano Banana 2) modeliyle **4 paralel görsel üretimi** yapan,
tek dosyalık bir web uygulaması. 4 ayrı prompt yazıp 4 farklı görseli aynı anda
üretebilirsin — sanki 4 tane Gemini sekmesi açmışsın gibi.

## Kullanım

1. `index.html` dosyasına çift tıkla (internet bağlantısı gerekli).
2. Her sekme kartına bir prompt yaz (veya boş bırak).
3. İstersen oran / çözünürlük seç.
4. **Görsel Üret** (tek kart) veya **Tümünü Üret** (4 kart birden).
5. Çıkan görselin altındaki **İndir** butonuyla kaydet.

Sunucu yok, kurulum yok — her şey tarayıcıda çalışır.

## Failover (Anahtar Yedekleme) Sistemi

Sayfanın içinde 14 API anahtarı var (en baştaki `AQ.…` anahtarı en yüksek öncelikli).
Dizi sırası = öncelik sırasıdır: her istek her zaman listenin ilk anahtarından başlar.
Bir üretim isteği şöyle işler:

- Anahtarlar **dizi sırasıyla** denenir; ilk anahtar her istekte ilk denenir. Çalışan
  bir anahtarı en başa taşımak yeterlidir — bütün sekmeler önce onu dener.
- Bir anahtar hata verirse sıradaki anahtara geçilir:
  - **429 (limit)** → anahtar geçici olarak engellenir (5s → 10s → 20s … üstel geri
    çekilme, tavan 60s) ve sıradaki anahtara geçilir.
  - **403 / geçersiz anahtar** → aynı şekilde atlanır.
  - **Ağ hatası / 5xx** → atlanır.
  - **400 (güvenlik engeli vb.)** → anahtar sorunu değildir, failover yapılmaz;
    hata doğrudan gösterilir.
- Başarılı istek o anahtarın hata sayacını sıfırlar.
- Her kartın altındaki **iz alanı** hangi anahtarın denendiğini ve sonucunu gösterir
  (`#1 AIzaSyBH…ZKGo → 429 (limit)` … `#7 → ✓ başarılı`).

## Anahtarları Değiştirme

Sayfadaki **🔑 Anahtarlar** butonuyla havuzu görüntüleyip düzenleyebilirsin
(her satıra bir anahtar). Kaydedilen liste tarayıcının `localStorage`'ında saklanır;
kodla uğraşmana gerek yok. **Varsayılana dön** butonu dosyadaki listeye geri döner.

## Relay ile Gerçek Nano Banana 2 (laozhang.ai)

Google'ın resmi API'sinde görsel üretimi için billing şartı var. Üçüncü taraf
relay servisleri (örn. **laozhang.ai**) aynı modeli (`gemini-3.1-flash-image` =
Nano Banana 2) kendi uç noktalarından sunar: $0.055/görsel (Lite: $0.025),
kayıtta deneme kredisi verilir.

**Kurulum (5 dakika):**

1. laozhang.ai'ye kaydol → Token Management'dan API anahtarını al.
2. Anahtarı terminalde test et:
   ```bash
   curl -X POST "https://api2.laozhang.ai/v1beta/models/gemini-3.1-flash-image:generateContent" \
     -H "Authorization: Bearer SENIN_ANAHTARIN" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"role":"user","parts":[{"text":"a tiny red square"}]}],"generationConfig":{"responseModalities":["IMAGE","TEXT"]}}'
   ```
3. Uygulamada **🔑 Anahtarlar** → **Uç Nokta Modu: Relay (generateContent)** seç.
4. **Relay Adresi** boş kalsın (varsayılan `https://api2.laozhang.ai`).
5. Anahtarlar kutusuna laozhang anahtarını yaz → **Kaydet**.
6. Model seçicide `gemini-3.1-flash-image` seçiliyken üret — rozet **"Nano Banana 2"**
   yazacak, görsel gerçek NB2 olacak.

## Billing Rehberi (Resmi Google Yolu — Garanti)

1. [AI Studio](https://aistudio.google.com) → sol menü **Projects**.
2. Yeni `AQ.…` anahtarının bağlı olduğu projede **Set up billing** → ödeme yöntemi
   ekle (minimum ~₺ yükleme yeterli).
3. Uygulamada **Uç Nokta Modu: Google API** seçiliyken üret — yeni anahtar #1
   sırada, model `gemini-3.1-flash-image`; görsel ~$0.045–0.15.

Alternatif relay: OpenRouter (`google/gemini-3.1-flash-image`, kredi gerektirir).

## Önemli Notlar

- **Anahtarlar sayfa kaynağında açıkça görünür.** Bu dosyayı başkalarıyla
  paylaşma; paylaşacaksan Anahtarlar panelinden silip kaydet.
- Görsel üretimi ücretli/limitli bir işlemdir: anahtarın kotası dolarsa (HTTP 429)
  diğer anahtarlara geçilir; hepsi dolarsa kartta toplu hata gösterilir.
- **Önemli:** 2026 itibarıyla Gemini görsel üretim modellerinin (`gemini-3.1-flash-image`
  dahil) ücretsiz API kotası yok — anahtarın bağlı olduğu projede **billing (faturalama)**
  açık değilse her anahtar `429 (limit)` hatası verir. Çözüm: AI Studio › Projects
  sayfasından projeye **Set up billing** eklemek (minimum ~₺ tutarında yükleme yeterli).
  Billing açılınca yeni `AQ.…` anahtarı doğrudan çalışır. Ücretsiz yol arıyorsan: relay
  servisleri (ücretsiz test kotası olanlar) veya AI Studio web arayüzü (API değil, ücretsiz).

## Teknik

- Uç nokta: `POST https://generativelanguage.googleapis.com/v1beta/interactions`
  (Interactions API), başlık: `x-goog-api-key`
- Model: `gemini-3.1-flash-image` (alternatif: `gemini-3-pro-image`,
  `gemini-3.1-flash-lite-image`)
- İstek formatı: `response_format = { type: "image", aspect_ratio, image_size }`
  (boyut: `512` | `1K` | `2K` | `4K`)
- Görsel, yanıtın `steps[].content[]` bölümündeki base64 `data` alanından alınır
  ve `data:` URI olarak gösterilir.

---

# All1page — Tek Pencerede 4 Gemini (Masaüstü)

Görsel üreticiden farklı bir araç: **tek pencerede 4 gerçek Gemini sekmesi.**
Eskiden 4 ayrı Gemini sekmesini 2 Chrome uygulamasına bölüp kullanıyordun; bu uygulama
yerine tek pencerede 2×2 (veya 1×4) ızgara sunar. Her panel **kendi Google oturumunu**
tutar — 4 farklı hesap ile 4 ayrı sohbet aynı anda, limitler birbirine karışmadan.

> Neden web sitesi değil? `gemini.google.com` iframe içinde açılmıyor — sunucu
> `X-Frame-Options: DENY` gönderiyor (bizzat ölçtük) ve bir sayfadaki 4 iframe aynı
> çerezi paylaşacağı için 4 farklı Google hesabı zaten imkânsız. Bu yüzden masaüstü
> sürümünde her panel, kendi kalıcı çerez deposuna sahip gerçek bir tarayıcı görünümü
> (Electron `WebContentsView` + `persist:` session partition).

## Gereksinimler

- Node.js 18+ (https://nodejs.org)

## Hazır .exe

```bash
npm run dist          # NSIS Setup üretir (release/ klasöründe) — arkadaşlara bunu gönder
npm run dist:portable # isteğe bağlı: kurulumsuz portable exe (otomatik güncelleme çalışmaz)
```

- **`All1page Setup <sürüm>.exe`** — kurulum sihirbazı (başlat menüsü + masaüstü
  kısayolu oluşturur). **Otomatik güncelleme bununla çalışır.**
- **`All1page.exe`** — *portable* (yalnızca `dist:portable`): çift tıklayınca açılır,
  kurulum gerekmez ama güncelleme almaz.

İlk açılışta her panele ayrı Google hesabıyla giriş yapın; oturumlar kalıcıdır.

## Otomatik Güncelleme (GitHub Releases)

Uygulama açıldıktan birkaç saniye sonra zorla (varsa) **otomatik güncelleme kontrolü
yapar**: GitHub'daki en son sürümden `latest.yml` okunur, yeni sürüm varsa arka planda
indirilir ve sağ altta **"🚀 Yeni sürüm hazır — Yeniden Başlat"** çipi çıkar. Yeniden
başlatınca kurulur. Kullanıcıya elle dosya göndermek gerekmez.

### Yeni sürüm yayınlama (tek komut)

```bash
npm version patch     # sürümü 1.0.0 → 1.0.1 yapar (her yayında şart)
npm run dist:publish  # build + Setup exe + latest.yml → GitHub Release'e yükler
```

İlk koşudan önce bir kez `GH_TOKEN` (repo'ya release atma izinli) tanımla:
`setx GH_TOKEN "github_pat_..."` (kalıcı) veya komut öncesi `set GH_TOKEN=...`.

- GitHub provider'ı `package.json ▸ build.publish` içinde tanımlıdır
  (`owner: OmerTTech`, `repo: All1page`). Repo **public** olmalı (kullanıcıların
  inebilmesi için).
- İmzalı Setup süratle "Bilinmeyen yayımcı" kaldırır; imzasız da güncelleme çalışır,
  yalnızca ilk kurulumda SmartScreen uyarısı çıkar ("Yine de çalıştır").
- Geliştirmede senaryoyu test etmek için `dev-app-update.yml` kullanılır
  (`npm run dev`).

## Geliştirme Döngüsü (hızlı)

```bash
npm run dev      # vite canlı yenileme + Electron (kod anında yansır)
npm run dev:ui   # sadece tarayıcıda UI testi (Electron panelleri burada açılmaz)
npm run start    # derle + paketlemesiz aç (~5 sn)
npm run dir      # hızlı unpacked exe (paketleme öncesi test için)
```

"exe eski kalıyor" sorunu: derlenmiş exe kodu içine gömer, bu yüzden yerel test için
`npm run dist` (paketleme) gerekmez; arkadaşlara dağıtım ise artık `dist:publish`
ile tek komutta hallolur.

## İlk Açılış — Hesap Girişi

1. Uygulama açılınca her panelde Gemini oturum açma sayfası görünür.
2. **Hesap 1** panelinden ilk Google hesabınla giriş yap, **Hesap 2** panelinden ikinci
   hesabınla, vb. İstersen aynı hesabı birden fazla panele de girebilirsin.
3. Girişler kalıcıdır — bir daha sormaz. Oturumları sıfırlamak için paneldeki avatar →
   çıkış yap, ya da `%APPDATA%` içindeki uygulama klasörünü sil.

## Özellikler

- **Yerleşim:** varsayılan **1×4** (yan yana); **2×2** ızgara ve **Custom** — istediğin
  boyutu yazarsın (ör. 1×8, 2×8, 1×3). **Panel sayısı ızgaraya göre değişir**: satır ×
  sütun kadar gerçek Gemini penceresi oluşturulur (1×8 → 8 panel, 2×3 → 6 panel vb.),
  her biri kendi kalıcı oturumuyla.
- **✕ kapat** düğmesi (▶ yanında): paneli kapatır — kalan paneller ızgarada yeniden
  dizilir. Izgara boyutunu (Custom) artırınca kapattığın panel oturumuyla birlikte
  otomatik yeniden açılır; küçültünce fazlalar kapanır (arka planda kalmaz).
- Her panelde yalnızca **URL çubuğu + ▶ başlat** düğmesi: `gemini.google.com/app`,
  `/u/0`, `/a/...`, `?hl=tr` gibi adresler girilir; panel gezindikçe güncel URL kutuya
  yansır. URL'ler kaydedilir (localStorage).
- Sağ üstte **⛶ Tam Ekran** düğmesi (pencereyi tam ekran yapar) ve yanında
  **🖱️ Otomatik Gizle**: açıkken üst araç çubuğu gizlenir, paneller tüm pencereyi
  kaplar; fareyi pencerenin **üst kenarına** getirince çubuk görünür, uzaklaşınca
  (ilk ~90px'in altına inince) tekrar gizlenir. Tam ekranda özellikle kullanışlı —
  panelleri kapatmadan çubuğa anlık erişim.
- **Yakınlaştırma:** `Ctrl + =` / `Ctrl + +` yakınlaştırır, `Ctrl + -` uzaklaştırır,
  `Ctrl + 0` %100'e döner — tüm paneller birlikte zoomlanır.
- Sesli giriş (mikrofon) çalışır; Google giriş ve hesap seçme akışları aynı panel
  içinde açılır; diğer yeni sekmeler sistem tarayıcısına düşer.

## Sorun Giderme

- Bir panel boş kalırsa: başlığındaki ⟳ düğmesine bas.
- "Bir şeyler ters gitti" vb. görürsen URL çubuğuna `gemini.google.com/app` yazıp ▶ ile git.
- 1×4 görünümünde başlık daralır, ikincil düğmeler otomatik gizlenir — 2×2'de hepsi görünür.
- Yeni npm (11+) `allow-scripts` uyarısı verir ve Electron'un ikilisini indirmeyebilir:
  uyarı çıkarsa `node node_modules/electron/install.js` komutunu bir kez çalıştır.

## Teknik

- `electron/main.js` — pencere, 4 `WebContentsView` (partition `persist:gemini-0..3`), IPC
- `electron/preload.js` — `window.grid` API (contextBridge)
- `app/` — React (Vite) arayüzü: panel yuvalarını ölçüp dikdörtgenleri ana sürece gönderir,
  ana süreç de native görünümleri o noktalara yerleştirir.
