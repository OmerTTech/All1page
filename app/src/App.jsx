import { useEffect, useState } from "react";
import { useGridPanels } from "./hooks/useGridPanels";
import { useElectronBridge } from "./hooks/useElectronBridge";
import { useUpdateChecker } from "./hooks/useUpdateChecker";
import Toolbar from "./components/Toolbar/Toolbar";
import Panel, { EmptyCell } from "./components/Panel/Panel";
import UpdateBanner from "./components/UpdateBanner/UpdateBanner";
import Settings from "./components/Settings/Settings";
import { cellKey } from "./utils/helpers";

export default function App() {
  const {
    urls,
    layout,
    setLayout,
    customDims,
    cells,
    autoHide,
    setAutoHide,
    barVisible,
    setBarVisible,
    gridRef,
    slotRefs,
    gridStyle,
    gap,
    setGap,
    lang,
    setLang,
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
    go,
    openPanel,
    closePanel,
    swapCells,
    reloadAll,
    toggleFullscreen,
    setDim,
    updateUrl,
    rows,
    cols,
    activeCount,
    panelCount,
  } = useGridPanels();

  const [swapMode, setSwapMode] = useState(false);
  const [swapSel, setSwapSel] = useState(null);

  useEffect(() => {
    if (!swapMode) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSwapMode(false);
        setSwapSel(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swapMode]);

  const toggleSwap = () => {
    setSwapMode((v) => {
      if (v) setSwapSel(null);
      return !v;
    });
  };

  const handleCellClick = (key) => {
    if (!swapMode) return;
    if (swapSel === null) {
      setSwapSel(key);
      return;
    }
    if (swapSel === key) {
      setSwapSel(null);
      return;
    }
    swapCells(swapSel, key);
    setSwapMode(false);
    setSwapSel(null);
  };

  const { isFullscreen } = useElectronBridge(autoHide, setBarVisible);
  const { update, installUpdate, dismiss } = useUpdateChecker();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [version, setVersion] = useState("");

  useEffect(() => {
    let mounted = true;
    window.grid?.getVersion?.().then((v) => {
      if (mounted) setVersion(v || "");
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.grid?.setSettingsOverlay?.(settingsOpen);
  }, [settingsOpen]);

  useEffect(() => {
    // "Tam Ekranla Başla" yalnız açılışta bir kez uygulanır; daha sonra
    // kullanıcı tam ekrandan çıkınca yeniden fullscreen'e dönmez.
    if (!startFullscreen) return;
    const t = setTimeout(() => {
      if (!isFullscreen) window.grid?.fullscreen();
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapperClass =
    "h-full flex flex-col" + (autoHide && !barVisible ? " bar-hidden" : "");

  const gridClass =
    "flex-1 grid min-h-0 min-w-0 " +
    (stack && layout === "custom" ? "stacked-scroll " : "");

  const gridStyleFinal = {
    ...gridStyle,
    gap: gap + "px",
    padding: gap + "px",
  };

  const cellsGrid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c);
      const id = cells[key];
      const cellStyle = { gridColumn: c + 1, gridRow: r + 1 };
      const commonSwap = {
        swapActive: swapMode,
        selected: swapSel === key,
        onSwapClick: () => handleCellClick(key),
      };
      if (id == null) {
        cellsGrid.push(
          <EmptyCell
            key={key}
            style={cellStyle}
            onOpen={(url) => openPanel(r, c, url)}
            defaultUrl={defaultUrl}
            lang={lang}
            {...commonSwap}
          />
        );
      } else {
        cellsGrid.push(
          <Panel
            key={key}
            id={id}
            style={cellStyle}
            url={urls[id] || defaultUrl}
            defaultUrl={defaultUrl}
            onNavigate={go}
            onChangeUrl={updateUrl}
            onClose={closePanel}
            slotRefs={slotRefs}
            lang={lang}
            {...commonSwap}
          />
        );
      }
    }
  }

  return (
    <div className={wrapperClass}>
      <Toolbar
        layout={layout}
        setLayout={setLayout}
        customDims={customDims}
        setDim={setDim}
        activeCount={activeCount}
        panelCount={panelCount}
        reloadAll={reloadAll}
        autoHide={autoHide}
        setAutoHide={setAutoHide}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        lang={lang}
        version={version}
        stack={stack}
        setStack={setStack}
        swapMode={swapMode}
        onToggleSwap={toggleSwap}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className={gridClass} ref={gridRef} style={gridStyleFinal}>
        {cellsGrid}
      </main>

      <UpdateBanner update={update} onInstall={installUpdate} onDismiss={dismiss} lang={lang} />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
        gap={gap}
        setGap={setGap}
        startFullscreen={startFullscreen}
        setStartFullscreen={setStartFullscreen}
        rememberSession={rememberSession}
        setRememberSession={setRememberSession}
        theme={theme}
        setTheme={setTheme}
        defaultUrl={defaultUrl}
        setDefaultUrl={setDefaultUrl}
      />
    </div>
  );
}