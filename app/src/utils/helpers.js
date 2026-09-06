export const DEFAULT_URL = "https://gemini.google.com/app";
export const MAX_CELLS = 8 * 12;

export const STORAGE_URLS = "gemini-grid-urls-v1";
export const STORAGE_LAYOUT = "gemini-grid-layout-v2";
export const STORAGE_DIMS = "gemini-grid-dims-v1";
export const STORAGE_AUTOHIDE = "gemini-grid-autohide-v1";
export const STORAGE_LANG = "gemini-grid-lang-v1";
export const STORAGE_LANG_MANUAL = "gemini-grid-lang-manual-v1";
export const STORAGE_GAP = "gemini-grid-gap-v1";
export const STORAGE_START_FULLSCREEN = "gemini-grid-startfs-v1";
export const STORAGE_REMEMBER = "gemini-grid-remember-v1";
export const STORAGE_THEME = "gemini-grid-theme-v1";
export const STORAGE_PANELS = "gemini-grid-panels-v1";
export const STORAGE_STACK = "gemini-grid-stack-v1";

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
