import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_URL,
  STORAGE_URLS,
  STORAGE_LAYOUT,
  STORAGE_DIMS,
  STORAGE_AUTOHIDE,
  loadJson,
  normalizeUrl,
  clampDim,
  panelCountFor,
} from "../utils/helpers";

export function useGridPanels() {
  const [urls, setUrls] = useState(() => {
    const saved = loadJson(STORAGE_URLS, null);
    return Array.isArray(saved) && saved.length > 0
      ? saved.map((u) => normalizeUrl(u))
      : [DEFAULT_URL, DEFAULT_URL, DEFAULT_URL, DEFAULT_URL];
  });

  const [layout, setLayout] = useState(() => {
    const l = loadJson(STORAGE_LAYOUT, "row");
    return ["grid", "row", "custom"].includes(l) ? l : "row";
  });

  const [customDims, setCustomDims] = useState(() => {
    const d = loadJson(STORAGE_DIMS, { rows: 1, cols: 3 });
    return { rows: clampDim(d && d.rows, 8), cols: clampDim(d && d.cols, 12) };
  });

  const [panels, setPanels] = useState(() => [0, 1, 2, 3]);
  const [titles, setTitles] = useState([]);
  const [autoHide, setAutoHide] = useState(
    () => loadJson(STORAGE_AUTOHIDE, false) === true
  );
  const [barVisible, setBarVisible] = useState(true);

  const gridRef = useRef(null);
  const slotRefs = useRef({});

  const panelCount = panelCountFor(layout, customDims);

  useEffect(() => {
    setPanels(Array.from({ length: panelCount }, (_, i) => i));
  }, [panelCount]);

  useEffect(() => {
    setUrls((prev) => {
      if (prev.length >= panelCount) return prev;
      return prev.concat(Array(panelCount - prev.length).fill(DEFAULT_URL));
    });
  }, [panelCount]);

  const measure = () => {
    const api = window.grid;
    if (!api || !gridRef.current) return;
    const rects = panels.map((id) => {
      const el = slotRefs.current[id];
      if (!el) return { id, x: 0, y: 0, width: 0, height: 0 };
      const r = el.getBoundingClientRect();
      return { id, x: r.left, y: r.top, width: r.width, height: r.height };
    });
    api.setLayout(rects);
  };

  const syncPanels = () => {
    const api = window.grid;
    if (api?.syncPanels) {
      api.syncPanels(panels.map((id) => ({ id, url: normalizeUrl(urls[id]) })));
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    return () => cancelAnimationFrame(raf);
  };

  useEffect(() => {
    const cleanup = syncPanels();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panels, layout, customDims, panelCount]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const api = window.grid;
    if (!api?.onState) return;
    return api.onState((s) => {
      setTitles((prev) => {
        const next = prev.slice();
        while (next.length <= s.id) next.push("");
        next[s.id] = s.title;
        return next;
      });
      setUrls((prev) => {
        const next = prev.slice();
        while (next.length <= s.id) next.push(DEFAULT_URL);
        if (s.url) next[s.id] = s.url;
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
    localStorage.setItem(STORAGE_URLS, JSON.stringify(urls));
    localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(layout));
    localStorage.setItem(STORAGE_DIMS, JSON.stringify(customDims));
    localStorage.setItem(STORAGE_AUTOHIDE, JSON.stringify(autoHide));
  }, [urls, layout, customDims, autoHide]);

  const go = (id) => {
    window.grid?.navigate(id, normalizeUrl(urls[id]));
  };

  const closePanel = (id) => {
    setPanels((prev) => prev.filter((p) => p !== id));
  };

  const reloadAll = () => {
    panels.forEach((id) => window.grid?.reload(id));
  };

  const toggleFullscreen = () => {
    window.grid?.fullscreen();
  };

  const setDim = (key, raw) => {
    const max = key === "rows" ? 8 : 12;
    setCustomDims((d) => ({ ...d, [key]: clampDim(raw, max) }));
  };

  const updateUrl = (id, value) => {
    setUrls((prev) => {
      const next = prev.slice();
      while (next.length <= id) next.push(DEFAULT_URL);
      next[id] = value;
      return next;
    });
  };

  const gridStyle =
    layout === "custom"
      ? {
          gridTemplateColumns: "repeat(" + customDims.cols + ", 1fr)",
          gridTemplateRows: "repeat(" + customDims.rows + ", 1fr)",
        }
      : undefined;

  return {
    urls,
    layout,
    setLayout,
    customDims,
    panels,
    titles,
    autoHide,
    setAutoHide,
    barVisible,
    setBarVisible,
    gridRef,
    slotRefs,
    panelCount,
    gridStyle,
    go,
    closePanel,
    reloadAll,
    toggleFullscreen,
    setDim,
    updateUrl,
  };
}
