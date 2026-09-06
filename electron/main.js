"use strict";

const { app, BrowserWindow, WebContentsView, ipcMain, shell, session, screen } = require("electron");
const path = require("path");
const { execFileSync } = require("child_process");
const updater = require("./updater");

const DEFAULT_URL = "https://gemini.google.com/app";
const MAX_VIEWS = 96; // satır(8) × sütun(12) üst sınırı

const INSTALLER_LANG_REG = "Software\\All1page";
const INSTALLER_LANG_VALUE = "InstallerLang";

// NSIS'teki yerel dil kimlikleri → uygulama dil kodu
const LCID_TO_LANG = { 1033: "en", 1055: "tr", 2092: "az" };

function readRegString(root, subkey, name) {
  try {
    const out = execFileSync(
      "reg",
      ["query", root + "\\" + subkey, "/v", name],
      { encoding: "utf8", windowsHide: true, timeout: 5000 }
    );
    const m = /REG_SZ\s+([^\r\n]+)/.exec(out);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

// Kurulumda seçilen dil → "tr" / "en" / "az". Kayıt yoksa sistem diline bakar.
function installerLang() {
  const idText =
    readRegString("HKCU", INSTALLER_LANG_REG, INSTALLER_LANG_VALUE) ||
    readRegString("HKLM", INSTALLER_LANG_REG, INSTALLER_LANG_VALUE);
  if (idText && LCID_TO_LANG[idText]) return LCID_TO_LANG[idText];
  const loc = app.getLocale().toLowerCase();
  if (loc.startsWith("az")) return "az";
  if (loc.startsWith("tr")) return "tr";
  if (loc.startsWith("en")) return "en";
  return "tr";
}

// Google servisleri "Electron/…" kullanıcı ajanına kısıtlanmış içerik dönebiliyor;
// gerçek Chromium sürümünü taşıyan temiz bir Chrome UA kullan.
{
  const match = /Chrome\/([\d.]+)/.exec(app.userAgentFallback);
  const chromeVer = match ? match[1] : "142.0.0.0";
  const platform =
    process.platform === "darwin"
      ? "Macintosh; Intel Mac OS X 10_15_7"
      : process.platform === "linux"
        ? "X11; Linux x86_64"
        : "Windows NT 10.0; Win64; x64";
  app.userAgentFallback =
    "Mozilla/5.0 (" + platform + ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + chromeVer + " Safari/537.36";
}

/** @type {BrowserWindow | null} */
let win = null;
/** @type {Record<number, { id: number, view: WebContentsView }>} */
const views = {};
/** @type {Record<number, {x:number,y:number,width:number,height:number}>} */
const lastBounds = {};
/** @type {Set<number>} */
const sleeping = new Set();
let appZoom = 0; // panellerin ortak yakınlaştırma seviyesi (0 = %100)
let autoHideOn = false; // çubuk otomatik gizleniyor mu
let barRevealed = true; // çubuğun son bilinen görünürlüğü
let cursorTimer = null; // fare konumu poll'u
let settingsHidden = false; // ayarlar açıkken paneller gizli mi

// Gizle/göster eşikleri (piksel, pencere üst kenarına göre):
// fare en üstteki 6px'e gelirse çubuk görünür; 90px'in altına inerse gizlenir.
// Aradaki bant (histerezis) çırpınmayı önler.
const REVEAL_ZONE = 6;
const HIDE_THRESHOLD = 90;

function pollCursor() {
  if (!win || win.isDestroyed() || !autoHideOn) return;
  const cursor = screen.getCursorScreenPoint();
  const b = win.getBounds();
  const relX = cursor.x - b.x;
  const relY = cursor.y - b.y;
  const inWindow = relX >= 0 && relX <= b.width;
  let want = barRevealed;
  if (inWindow && relY <= REVEAL_ZONE) want = true;
  else if (!inWindow || relY >= HIDE_THRESHOLD) want = false;
  if (want !== barRevealed) {
    barRevealed = want;
    if (!win.isDestroyed()) win.webContents.send("grid:toolbar-state", want);
  }
}

function setAutoHide(on) {
  autoHideOn = !!on;
  if (cursorTimer) {
    clearInterval(cursorTimer);
    cursorTimer = null;
  }
  if (autoHideOn) {
    barRevealed = false;
    if (win && !win.isDestroyed()) win.webContents.send("grid:toolbar-state", false);
    cursorTimer = setInterval(pollCursor, 90);
  } else {
    barRevealed = true;
    if (win && !win.isDestroyed()) win.webContents.send("grid:toolbar-state", true);
  }
}

// Ctrl+= / Ctrl++ / Ctrl+- / Ctrl+0 ile tüm panelleri birlikte yakınlaştır
function zoomViews(delta) {
  appZoom = Math.max(-4, Math.min(8, appZoom + delta));
  for (const id of Object.keys(views)) views[id].view.webContents.setZoomLevel(appZoom);
}

function resetViewsZoom() {
  appZoom = 0;
  for (const id of Object.keys(views)) views[id].view.webContents.setZoomLevel(0);
}

function wireZoom(wc) {
  wc.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown" || !input.control || input.alt || input.meta) return;
    const k = input.key;
    if (k === "=" || k === "+") {
      zoomViews(0.5);
      event.preventDefault();
    } else if (k === "-") {
      zoomViews(-0.5);
      event.preventDefault();
    } else if (k === "0") {
      resetViewsZoom();
      event.preventDefault();
    }
  });
}

function partitionFor(i) {
  return "persist:gemini-" + i;
}

function sanitizeUrl(raw) {
  let s = String(raw || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function wireView(view, id) {
  const wc = view.webContents;
  wireZoom(wc);

  // Google giriş/hesap akışlarını aynı panelde tut; gerisini sistem tarayıcısında aç
  wc.setWindowOpenHandler(({ url }) => {
    try {
      const u = new URL(url);
      if (u.hostname === "accounts.google.com" || u.hostname === "gemini.google.com") {
        wc.loadURL(url);
        return { action: "deny" };
      }
    } catch {
      /* geçersiz URL */
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  const sendState = () => {
    if (!win || win.isDestroyed()) return;
    win.webContents.send("grid:state", {
      id,
      url: wc.getURL(),
      title: wc.getTitle(),
      canGoBack: wc.navigationHistory.canGoBack(),
      canGoForward: wc.navigationHistory.canGoForward(),
    });
  };

  wc.on("did-navigate", sendState);
  wc.on("did-navigate-in-page", sendState);
  wc.on("page-title-updated", sendState);
  wc.on("render-process-gone", (_e, details) => {
    if (details.reason === "clean-exit") return;
    setTimeout(() => {
      if (!wc.isDestroyed()) wc.reload();
    }, 1500);
  });
}

// Tek bir görünüm oluşturur (kendi kalıcı oturumuna sahip)
function createView(id) {
  const view = new WebContentsView({
    webPreferences: {
      partition: partitionFor(id),
      contextIsolation: true,
      sandbox: true,
    },
  });
  view.setBackgroundColor("#0d1117");
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  view.setVisible(false);
  wireView(view, id);

  // Mikrofon (sesli giriş), pano ve bildirim izinleri
  session.fromPartition(partitionFor(id)).setPermissionRequestHandler((_wc, permission, callback) => {
    callback(
      ["media", "clipboard-read", "clipboard-sanitized-write", "notifications", "fullscreen"].includes(permission)
    );
  });

  return view;
}

// Görünümü yok eder (RAM boşalır; oturum persist: partition'da kalır, tekrar oluşturulunca gelir)
function destroyView(id) {
  const entry = views[id];
  if (!entry) return;
  delete views[id];
  delete lastBounds[id];
  sleeping.delete(id);
  try {
    win.contentView.removeChildView(entry.view);
  } catch {
    /* zaten kaldırılmış */
  }
  try {
    entry.view.webContents.close();
  } catch {
    try {
      entry.view.webContents.destroy();
    } catch {
      /* yoksay */
    }
  }
}

function createWindow() {
  // Ekranın çalışma alanına otur; açılışta gerçek (OS) maximize uygulanır.
  // "maximized:true" tek başına DPI küçültmesi olan ekranlarda pencerenin
  // normal-kelepçelenmiş durumda kalmasına yol açabiliyordu.
  const wa = screen.getPrimaryDisplay().workArea;
  win = new BrowserWindow({
    width: wa.width,
    height: wa.height,
    minWidth: 900,
    minHeight: 560,
    title: "All1page",
    backgroundColor: "#0d1117",
    autoHideMenuBar: true,
    maximized: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Ana pencere yalnızca kendi içeriğine gidebilir
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (e, url) => {
    const devUrl = process.env.VITE_DEV_SERVER_URL;
    const ok = (devUrl && url.startsWith(devUrl)) || url.startsWith("file:");
    if (!ok) e.preventDefault();
  });
  wireZoom(win.webContents);

  win.on("enter-full-screen", () => {
    if (!win.isDestroyed()) win.webContents.send("grid:fullscreen-state", true);
  });
  win.on("leave-full-screen", () => {
    if (!win.isDestroyed()) win.webContents.send("grid:fullscreen-state", false);
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  // İlk boyanmadan önce maximize + göster → çerçevesiz değil, Windows'un
  // Win+Up ile yaptığı gibi gerçek kenarlıklı maximize durumunda açılır.
  win.once("ready-to-show", () => {
    if (!win || win.isDestroyed()) return;
    win.maximize();
    win.show();
  });

  win.on("closed", () => {
    if (cursorTimer) {
      clearInterval(cursorTimer);
      cursorTimer = null;
    }
    win = null;
  });
}

ipcMain.on("grid:set-autohide", (_event, on) => {
  setAutoHide(!!on);
});

ipcMain.handle("grid:get-version", () => app.getVersion());

ipcMain.handle("grid:get-installer-lang", () => installerLang());

// Ayarlar penceresi renderer içinde açılınca panellerin onu kapatmaması için
// görünümler gizlenir; kapanınca son konumlarıyla geri gösterilir.
ipcMain.on("grid:set-settings-overlay", (_event, open) => {
  settingsHidden = !!open;
  for (const id of Object.keys(views)) {
    const v = views[id].view;
    if (settingsHidden) {
      v.setVisible(false);
    } else {
      const b = lastBounds[id];
      if (!sleeping.has(Number(id)) && b) {
        v.setBounds(b);
        v.setVisible(b.width > 4 && b.height > 4);
      }
    }
  }
});

/* ------------------------- IPC ------------------------- */

ipcMain.on("grid:fullscreen", () => {
  if (!win) return;
  win.setFullScreen(!win.isFullScreen());
});

// Panel listesi tek kaynaktır: listede olmayan görünümler yok edilir,
// listede olup da oluşturulmamış olanlar URL'leriyle birlikte açılır.
ipcMain.on("grid:sync-panels", (_event, panels) => {
  if (!win || !Array.isArray(panels)) return;
  if (panels.length > MAX_VIEWS) panels = panels.slice(0, MAX_VIEWS);
  const active = new Set();
  for (const p of panels) {
    const id = Number(p && p.id);
    if (!Number.isFinite(id) || id < 0) continue;
    active.add(id);
    if (!views[id]) {
      const view = createView(id);
      win.contentView.addChildView(view);
      views[id] = { id, view };
      view.webContents.loadURL(sanitizeUrl(p.url) || DEFAULT_URL);
    }
  }
  for (const id of Object.keys(views)) {
    if (!active.has(Number(id))) destroyView(Number(id));
  }
});

ipcMain.on("grid:set-layout", (_event, rects) => {
  if (!Array.isArray(rects) || !win) return;
  for (const r of rects) {
    const v = views[r.id];
    if (!v) continue;
    const b = {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
    lastBounds[r.id] = b;
    if (sleeping.has(r.id)) continue; // uykudaki panel gizli kalır
    if (settingsHidden) {
      v.view.setVisible(false); // ayarlar açıkken panel üste çıkmaz
      continue;
    }
    v.view.setBounds(b);
    v.view.setVisible(b.width > 4 && b.height > 4);
  }
  // Yerleşimde artık olmayan görünümleri gizle (güvenlik ağı)
  for (const id of Object.keys(views)) {
    if (!rects.some((r) => r.id === Number(id))) {
      const v = views[id];
      if (v && !sleeping.has(Number(id))) v.view.setVisible(false);
    }
  }
});

ipcMain.on("grid:navigate", (_event, { id, url }) => {
  const v = views[id];
  const u = sanitizeUrl(url);
  if (v && u) v.view.webContents.loadURL(u);
});

ipcMain.on("grid:reload", (_event, id) => {
  const v = views[id];
  if (v) v.view.webContents.reload();
});

ipcMain.on("grid:back", (_event, id) => {
  const v = views[id];
  if (v && v.view.webContents.navigationHistory.canGoBack()) v.view.webContents.navigationHistory.goBack();
});

ipcMain.on("grid:forward", (_event, id) => {
  const v = views[id];
  if (v && v.view.webContents.navigationHistory.canGoForward()) v.view.webContents.navigationHistory.goForward();
});

ipcMain.on("grid:sleep", (_event, id) => {
  const v = views[id];
  if (!v) return;
  if (sleeping.has(id)) {
    sleeping.delete(id);
    if (lastBounds[id]) {
      v.view.setBounds(lastBounds[id]);
      v.view.setVisible(true);
    }
  } else {
    sleeping.add(id);
    v.view.setVisible(false);
    v.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  }
});

/* ------------------------- Yaşam döngüsü ------------------------- */

app.whenReady().then(() => {
  createWindow();
  updater.initUpdater(() => win);
  updater.checkForUpdatesSoon(() => win);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});