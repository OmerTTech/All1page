import { useGridPanels } from "./hooks/useGridPanels";
import { useElectronBridge } from "./hooks/useElectronBridge";
import { useUpdateChecker } from "./hooks/useUpdateChecker";
import Toolbar from "./components/Toolbar/Toolbar";
import Panel from "./components/Panel/Panel";
import UpdateBanner from "./components/UpdateBanner/UpdateBanner";

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
    go,
    closePanel,
    reloadAll,
    toggleFullscreen,
    setDim,
    updateUrl,
  } = useGridPanels();

  const { isFullscreen } = useElectronBridge(autoHide, setBarVisible);
  const { update, installUpdate, dismiss } = useUpdateChecker();

  const wrapperClass =
    "h-full flex flex-col" +
    (autoHide && !barVisible ? " bar-hidden" : "");

  const gridClass =
    "flex-1 grid gap-1.5 p-1.5 min-h-0 min-w-0 " +
    (layout === "grid"
      ? "grid-cols-2 grid-rows-2"
      : layout === "row"
        ? "grid-cols-4 grid-rows-1"
        : "");

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
      />

      <main className={gridClass} ref={gridRef} style={gridStyle}>
        {panels.map((id) => (
          <Panel
            key={id}
            id={id}
            url={urls[id]}
            onNavigate={go}
            onChangeUrl={updateUrl}
            onClose={closePanel}
            slotRefs={slotRefs}
          />
        ))}
      </main>

      <UpdateBanner update={update} onInstall={installUpdate} onDismiss={dismiss} />
    </div>
  );
}
