export const DEFAULT_URL = "https://gemini.google.com/app";
export const MAX_CELLS = 8 * 12;

export const STORAGE_URLS = "all1page-urls-v1";
export const STORAGE_LAYOUT = "all1page-layout-v2";
export const STORAGE_DIMS = "all1page-dims-v1";
export const STORAGE_AUTOHIDE = "all1page-autohide-v1";
export const STORAGE_LANG = "all1page-lang-v1";
export const STORAGE_LANG_MANUAL = "all1page-lang-manual-v1";
export const STORAGE_GAP = "all1page-gap-v1";
export const STORAGE_START_FULLSCREEN = "all1page-startfs-v1";
export const STORAGE_REMEMBER = "all1page-remember-v1";
export const STORAGE_THEME = "all1page-theme-v1";
export const STORAGE_PANELS = "all1page-panels-v1";
export const STORAGE_STACK = "all1page-stack-v1";
export const STORAGE_DEFAULT_URL = "all1page-default-url-v1";

export const REVEAL_ZONE = 6;
export const HIDE_THRESHOLD = 90;

export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* bozuk kayit */
  }
  return fallback;
}

export function normalizeUrl(raw) {
  let u = String(raw || "").trim();
  if (!u) return DEFAULT_URL;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

export function clampDim(n, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(max, Math.round(v)));
}

export function panelCountFor(layout, dims) {
  if (layout === "custom") {
    return Math.max(1, Math.min(MAX_CELLS, dims.rows * dims.cols));
  }
  return 4;
}

export function rowsColsFor(layout, dims) {
  if (layout === "custom") {
    return {
      rows: clampDim(dims && dims.rows, 8),
      cols: clampDim(dims && dims.cols, 12),
    };
  }
  if (layout === "grid") return { rows: 2, cols: 2 };
  return { rows: 1, cols: 4 };
}

export function cellKey(row, col) {
  return Number(row) + ":" + Number(col);
}

export function keyToCell(key) {
  const p = String(key).split(":");
  return { row: Number(p[0]), col: Number(p[1]) };
}

// Panelleri, önceki hücre konumlarının satır sırasına göre (üst-sol → sağ,
// sonra alt satır → sağ) toplayıp yeni gridin satır-satır hücrelerine dizler.
// Böylece layout değişince panel sırası korunur; kapatılan hücrenin boşluğunu
// alttaki değil soldaki komşu doldurur, boşluklar en sağa/sona kayar.
// ÖNEMLİ: Her çağrıda YENİ bir nesne döndürülür. Aynı referans dönerse React
// setCells ile re-render etmez, syncPanels çalışmaz ve yeni paneller ana
// sürece hiç gitmez (boş/çalışmayan paneller ortaya çıkar).
export function reflowCells(cells, rows, cols) {
  const ordered = Object.entries(cells || {}).sort(([ka], [kb]) => {
    const a = keyToCell(ka);
    const b = keyToCell(kb);
    return a.row - b.row || a.col - b.col;
  });
  const next = {};
  let r = 0;
  let c = 0;
  for (const [, id] of ordered) {
    if (r >= rows) break;
    next[cellKey(r, c)] = id;
    c++;
    if (c >= cols) {
      c = 0;
      r++;
    }
  }
  return next;
}

// İlk açılış: layout'a göre ilk 4 hücreye 0,1,2,3 yerleştirir.
export function initialCellsFor(layout, dims) {
  const { rows, cols } = rowsColsFor(layout, dims);
  const total = rows * cols;
  const cells = {};
  for (let i = 0; i < Math.min(4, total); i++) {
    cells[cellKey(Math.floor(i / cols), i % cols)] = i;
  }
  return cells;
}

export const PANELS_V2 = 2;

// Kayıtlı panel durumunu okur; yeni {v:2,cells,urls} formatı varsa döndürür,
// eski number[] formatını da mevcut layout/dims ile "row:col" haritasına çevirir.
export function parseSavedPanels() {
  const raw = loadJson(STORAGE_PANELS, null);
  if (!raw) return null;

  if (raw.v === PANELS_V2 && raw.cells && typeof raw.cells === "object") {
    const cells = {};
    for (const k of Object.keys(raw.cells)) {
      const id = Number(raw.cells[k]);
      if (Number.isFinite(id) && id >= 0) cells[k] = id;
    }
    if (!Object.keys(cells).length) return null;
    const urls = {};
    if (raw.urls && typeof raw.urls === "object") {
      for (const k of Object.keys(raw.urls)) urls[k] = normalizeUrl(raw.urls[k]);
    }
    return { cells, urls };
  }

  if (Array.isArray(raw)) {
    const savedLayout = loadJson(STORAGE_LAYOUT, "row");
    const layout = ["grid", "row", "custom"].includes(savedLayout) ? savedLayout : "row";
    const dims = loadJson(STORAGE_DIMS, { rows: 1, cols: 3 });
    const { rows, cols } = rowsColsFor(layout, dims);
    const legacyUrls = loadJson(STORAGE_URLS, null);
    const cells = {};
    const urls = {};
    raw.forEach((idVal, i) => {
      const id = Number(idVal);
      if (!Number.isFinite(id) || id < 0) return;
      cells[cellKey(Math.floor(i / cols), i % cols)] = id;
      const u = Array.isArray(legacyUrls) ? legacyUrls[id] : null;
      if (typeof u === "string" && u.trim()) urls[id] = normalizeUrl(u);
    });
    return Object.keys(cells).length ? { cells, urls } : null;
  }

  return null;
}
