import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_URL,
  STORAGE_LAYOUT,
  STORAGE_DIMS,
  STORAGE_AUTOHIDE,
  STORAGE_LANG,
  STORAGE_LANG_MANUAL,
  STORAGE_GAP,
  STORAGE_START_FULLSCREEN,
  STORAGE_REMEMBER,
  STORAGE_THEME,
  STORAGE_PANELS,
  STORAGE_STACK,
  STORAGE_DEFAULT_URL,
  loadJson,
  normalizeUrl,
  clampDim,
  panelCountFor,
  rowsColsFor,
  cellKey,
  reflowCells,
  initialCellsFor,
  parseSavedPanels,
} from "../utils/helpers";

function guessSystemLang() {
  const n = (navigator.language || "").toLowerCase();
  if (n.startsWith("az")) return "az";
  if (n.startsWith("tr")) return "tr";
  if (n.startsWith("en")) return "en";
  return null;
}

function initLang() {
  const saved = loadJson(STORAGE_LANG, null);
  if (["tr", "en", "az"].includes(saved)) return saved;
  return guessSystemLang() || "tr";
}

export function useGridPanels() {
  const savedState = parseSavedPanels();

  const [layout, setLayout] = useState(() => {
    const l = loadJson(STORAGE_LAYOUT, "row");
    return ["grid", "row", "custom"].includes(l) ? l : "row";
  });

  const [customDims, setCustomDims] = useState(() => {
    const d = loadJson(STORAGE_DIMS, { rows: 1, cols: 3 });
    return { rows: clampDim(d && d.rows, 8), cols: clampDim(d && d.cols, 12) };
  });

  const [rememberSession, setRememberSession] = useState(
    () => loadJson(STORAGE_REMEMBER, true) !== false
  );

  // Hücre→panel eşlemesi: "row:col" → panel id. Boş hücrede kayıt yok.
  const [cells, setCells] = useState(() => {
    if (rememberSession && savedState) return savedState.cells;
    return initialCellsFor(layout, customDims);
  });
  const [urlsById, setUrlsById] = useState(() =>
    rememberSession && savedState ? savedState.urls : {}
  );
  const [titlesById, setTitlesById] = useState({});

  const [autoHide, setAutoHide] = useState(
    () => loadJson(STORAGE_AUTOHIDE, false) === true
  );
  const [barVisible, setBarVisible] = useState(true);

  const [lang, setLang] = useState(initLang);
  const langManualRef = useRef(localStorage.getItem(STORAGE_LANG_MANUAL) === "true");

  useEffect(() => {
    // Kullanıcı ayarlardan elle dil seçmemişse, kurulumda seçilen dili (registry) uygula
    if (langManualRef.current) return;
    let mounted = true;
    window.grid?.getInstallerLang?.().then((l) => {
      if (mounted && ["tr", "en", "az"].includes(l) && l !== lang) setLang(l);
    });
    return () => {
      mounted = false;
    };
  }, [lang]);

  // Ayarlar ekranının kullandığı seçici: elle seçim yapınca kurulum dili bir daha geçersiz kalır
  const setLangManual = (l) => {
    langManualRef.current = true;
    localStorage.setItem(STORAGE_LANG_MANUAL, "true");
    setLang(l);
  };

  const [gap, setGap] = useState(() => {
    const g = loadJson(STORAGE_GAP, 6);
    return Number.isFinite(g) ? Math.max(2, Math.min(20, g)) : 6;
  });

  const [startFullscreen, setStartFullscreen] = useState(
    () => loadJson(STORAGE_START_FULLSCREEN, false) === true
  );

  const [theme, setTheme] = useState(() => {
    const t = loadJson(STORAGE_THEME, "dark");
    return ["dark", "light"].includes(t) ? t : "dark";
  });

  // Boş hücreler / "Hepsini Yenile" için varsayılan açılış URL'si; başlangıçta her zaman gemini
  const [defaultUrl, setDefaultUrl] = useState(() => {
    const v = loadJson(STORAGE_DEFAULT_URL, null);
    return typeof v === "string" && v.trim() ? v.trim() : DEFAULT_URL;
  });

  const [stack, setStack] = useState(
    () => loadJson(STORAGE_STACK, false) === true
  );

  const gridRef = useRef(null);
  const slotRefs = useRef({});
  const cellsRef = useRef(cells);
  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);

  const defaultUrlRef = useRef(defaultUrl);
  useEffect(() => {
    defaultUrlRef.current = defaultUrl;
  }, [defaultUrl]);

  // Ölçüm her render'da güncellenir; mount edilen listener'lar en güncel ölçümü çalıştırır.
  const measureRef = useRef(() => {});
  useEffect(() => {
    measureRef.current = measure;
  });

  // Açılan her yeni panel için benzersiz oturum id'si üret
  const idCounterRef = useRef(null);
  if (idCounterRef.current === null) {
    idCounterRef.current =
      Object.values(cells).reduce((a, b) => Math.max(a, b), -1) + 1;
  }

  const panelCount = panelCountFor(layout, customDims);
  const { rows, cols } = rowsColsFor(layout, customDims);

  // aktif paneller: id + url listesi
  const activePanels = Object.entries(cells).map(([, id]) => ({
    id,
    url: urlsById[id] || defaultUrl,
  }));

  // Layout düğmesine (2×2 / 1×4 / Custom) basınca:
  //  1) Sığmayan panelleri boş hücrelere taşı (reflow)
  //  2) Boş kalan tüm hücreleri varsayılan siteyle doldur
  // Refresh atılmaz. İlk açılışta kayıtlı düzene dokunulmaz.
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    const prev = cellsRef.current;
    const next = reflowCells(prev, rows, cols);
    const newIds = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = cellKey(r, c);
        if (next[key] == null) {
          const id = idCounterRef.current++;
          next[key] = id;
          newIds.push(id);
        }
      }
    }
    if (newIds.length) {
      setUrlsById((u) => {
        const nu = { ...u };
        newIds.forEach((id) => {
          nu[id] = normalizeUrl(defaultUrlRef.current);
        });
        return nu;
      });
    }
    setCells(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Custom satır/sütun değişince yalnızca sığmayan panelleri boş hücrelere taşı;
  // doldurma/yenileme yapılmaz.
  const didInitCustomRef = useRef(false);
  useEffect(() => {
    if (!didInitCustomRef.current) {
      didInitCustomRef.current = true;
      return;
    }
    setCells((prev) => reflowCells(prev, rows, cols));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDims]);

  useEffect(() => {
    if (rememberSession) {
      localStorage.setItem(
        STORAGE_PANELS,
        JSON.stringify({ v: 2, cells, urls: urlsById })
      );
    }
  }, [cells, urlsById, rememberSession]);

  const measure = () => {
    const api = window.grid;
    if (!api || !gridRef.current) return;
    // Görünümler native katmanda DOM'un üstüne çizilir; toolbar'ın (üst çubuğun)
    // üzerine taşmasını önlemek için her hücreyi main'in üst kenarına kırp.
    const clipTop = gridRef.current.getBoundingClientRect().top;
    const rects = activePanels.map(({ id }) => {
      const el = slotRefs.current[id];
      if (!el) return { id, x: 0, y: 0, width: 0, height: 0 };
      const r = el.getBoundingClientRect();
      let y = r.top;
      let height = r.height;
      if (y < clipTop) {
        const bottom = r.top + r.height;
        y = clipTop;
        height = Math.max(0, bottom - clipTop);
      }
      return { id, x: r.left, y, width: r.width, height };
    });
    api.setLayout(rects);
  };

  const syncPanels = () => {
    const api = window.grid;
    if (api?.syncPanels) {
      api.syncPanels(
        activePanels.map(({ id, url }) => ({ id, url: normalizeUrl(url) }))
      );
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    return () => cancelAnimationFrame(raf);
  };

  useEffect(() => {
    const cleanup = syncPanels();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, layout, customDims, gap, stack]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onResize = () => measureRef.current();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    window.addEventListener("resize", onResize);
    el.addEventListener("scroll", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      el.removeEventListener("scroll", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = window.grid;
    if (!api?.onState) return;
    return api.onState((s) => {
      setTitlesById((prev) => ({ ...prev, [s.id]: s.title }));
      setUrlsById((prev) => {
        if (!s.url) return prev;
        const next = { ...prev };
        next[s.id] = s.url;
        return next;
      });
    });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barVisible, autoHide]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(layout));
    localStorage.setItem(STORAGE_DIMS, JSON.stringify(customDims));
    localStorage.setItem(STORAGE_AUTOHIDE, JSON.stringify(autoHide));
    localStorage.setItem(STORAGE_LANG, JSON.stringify(lang));
    localStorage.setItem(STORAGE_GAP, JSON.stringify(gap));
    localStorage.setItem(STORAGE_START_FULLSCREEN, JSON.stringify(startFullscreen));
    localStorage.setItem(STORAGE_REMEMBER, JSON.stringify(rememberSession));
    localStorage.setItem(STORAGE_THEME, JSON.stringify(theme));
    localStorage.setItem(STORAGE_STACK, JSON.stringify(stack));
    localStorage.setItem(STORAGE_DEFAULT_URL, JSON.stringify(defaultUrl));
  }, [layout, customDims, autoHide, lang, gap, startFullscreen, rememberSession, theme, stack, defaultUrl]);

  const go = (id) => {
    window.grid?.navigate(id, normalizeUrl(urlsById[id] || defaultUrl));
  };

  // Boş bir hücreye yeni panel açar (yeni oturum id'si + WebContentsView)
  const openPanel = (row, col, url) => {
    const key = cellKey(row, col);
    if (cellsRef.current[key] != null) return;
    const id = idCounterRef.current++;
    setUrlsById((prev) => ({ ...prev, [id]: normalizeUrl(url || defaultUrl) }));
    setCells((prev) => ({ ...prev, [key]: id }));
  };

  const updateUrl = (id, value) => {
    setUrlsById((prev) => ({ ...prev, [id]: value }));
  };

  const closePanel = (id) => {
    setCells((prev) => {
      const next = {};
      for (const [k, v] of Object.entries(prev)) {
        if (v !== id) next[k] = v;
      }
      return next;
    });
    setUrlsById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // İki hücrenin panel içeriklerini takas eder; hedef boşsa olduğu yere taşır.
  const swapCells = (keyA, keyB) => {
    if (!keyA || !keyB || keyA === keyB) return;
    setCells((prev) => {
      const idA = prev[keyA];
      const idB = prev[keyB];
      if (idA == null && idB == null) return prev;
      const next = {};
      for (const [k, v] of Object.entries(prev)) {
        if (k === keyA || k === keyB) continue;
        next[k] = v;
      }
      if (idA != null) next[keyB] = idA;
      if (idB != null) next[keyA] = idB;
      return next;
    });
  };

  const reloadAll = () => {
    // Boş hücreleri default siteyle doldur (hepsini tek tek açmaktan kurtarır)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = cellKey(r, c);
        if (cellsRef.current[key] == null) openPanel(r, c, defaultUrl);
      }
    }
    // Açık olan panelleri yenile
    activePanels.forEach(({ id }) => window.grid?.reload(id));
  };

  const toggleFullscreen = () => {
    window.grid?.fullscreen();
  };

  const setDim = (key, raw) => {
    const max = key === "rows" ? 8 : 12;
    setCustomDims((d) => ({ ...d, [key]: clampDim(raw, max) }));
  };

  const gridStyle =
    layout === "custom"
      ? {
          gridTemplateColumns: "repeat(" + customDims.cols + ", 1fr)",
          gridTemplateRows: stack
            ? "repeat(" + customDims.rows + ", minmax(calc(100vh - 48px), auto))"
            : "repeat(" + customDims.rows + ", 1fr)",
        }
      : layout === "grid"
        ? {
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
          }
        : {
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(1, 1fr)",
          };

  return {
    urls: urlsById,
    titles: titlesById,
    cells,
    layout,
    setLayout,
    customDims,
    autoHide,
    setAutoHide,
    barVisible,
    setBarVisible,
    gridRef,
    slotRefs,
    panelCount,
    rows,
    cols,
    activeCount: Object.keys(cells).length,
    gridStyle,
    go,
    openPanel,
    closePanel,
    swapCells,
    reloadAll,
    toggleFullscreen,
    setDim,
    updateUrl,
    lang,
    setLang: setLangManual,
    gap,
    setGap,
    startFullscreen,
    setStartFullscreen,
    rememberSession,
    setRememberSession,
    theme,
    setTheme,
    stack,
    setStack,
    defaultUrl,
    setDefaultUrl,
  };
}