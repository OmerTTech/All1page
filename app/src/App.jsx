import { useEffect, useState } from "react";
import { useGridPanels } from "./hooks/useGridPanels";
import { useElectronBridge } from "./hooks/useElectronBridge";
import { useUpdateChecker } from "./hooks/useUpdateChecker";
import Toolbar from "./components/Toolbar/Toolbar";
import Panel from "./components/Panel/Panel";
import UpdateBanner from "./components/UpdateBanner/UpdateBanner";
import Settings from "./components/Settings/Settings";

export default function App() {
  const {
    urls,
    layout,
    setLayout,
    customDims,
    panels,
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
    go,
    closePanel,
    reloadAll,
    toggleFullscreen,
    setDim,
    updateUrl,
  } = useGridPanels();

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
    (stack && layout === "custom" ? "stacked-scroll " : "") +
    (layout === "grid"
      ? "grid-cols-2 grid-rows-2"
      : layout === "row"
        ? "grid-cols-4 grid-rows-1"
        : "");

  const gridStyleFinal = {
    ...gridStyle,
    gap: gap + "px",
    padding: gap + "px",
  };

  return (
    <div className={wrapperClass}>
      <Toolbar
        layout={layout}
        setLayout={setLayout}
        customDims={customDims}
        setDim={setDim}
        panels={panels}
        reloadAll={reloadAll}
        autoHide={autoHide}
        setAutoHide={setAutoHide}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        lang={lang}
        version={version}
        stack={stack}
        setStack={setStack}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className={gridClass} ref={gridRef} style={gridStyleFinal}>
        {panels.map((id) => (
          <Panel
            key={id}
            id={id}
            url={urls[id]}
            onNavigate={go}
            onChangeUrl={updateUrl}
            onClose={closePanel}
            slotRefs={slotRefs}
            lang={lang}
          />
        ))}
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
      />
    </div>
  );
}