import { t } from "../../i18n";

export default function Toolbar({
  layout,
  setLayout,
  customDims,
  setDim,
  panels,
  reloadAll,
  autoHide,
  setAutoHide,
  toggleFullscreen,
  isFullscreen,
  lang,
  version,
  stack,
  setStack,
  onOpenSettings,
}) {
  return (
    <header
      data-toolbar
      className="flex flex-wrap items-center gap-2.5 px-4 py-1.5 shrink-0 bg-[var(--c-toolbar)] border-b border-[var(--c-border-soft)]"
    >
      <div className="flex items-center gap-2.5 mr-1.5">
        <h1 className="text-[15px] font-bold whitespace-nowrap bg-gradient-to-r from-[#7ab3ff] to-[#b08cff] bg-clip-text text-transparent">
          {t(lang, "appName")}
        </h1>
        {version && (
          <span className="text-[10px] font-medium text-[var(--c-text-mute)] select-none">
            v{version}
          </span>
        )}
      </div>

      <div
        className="flex border border-[var(--c-border)] rounded-xl overflow-hidden shadow-sm"
        role="group"
        aria-label={t(lang, "layout")}
      >
        {[
          { k: "grid", label: "2×2" },
          { k: "row", label: "1×4" },
          { k: "custom", label: "Custom" },
        ].map(({ k, label }) => (
          <button
            key={k}
            className={
              "seg-btn transition-colors" +
              (layout === k
                ? " bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] text-white"
                : " bg-[var(--c-chip)] text-[var(--c-text-dim)] hover:bg-[var(--c-border-soft)] hover:text-[var(--c-text)]")
            }
            onClick={() => setLayout(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {layout === "custom" && (
        <div className="flex items-center gap-2.5 text-xs text-[var(--c-text-faint)]">
          <label className="flex items-center gap-1.5">
            {t(lang, "rows")}
            <input
              type="number"
              min="1"
              max="8"
              value={customDims.rows}
              onChange={(e) => setDim("rows", e.target.value)}
              className="w-[52px] bg-[var(--c-elev)] border border-[var(--c-border)] rounded-md px-1.5 py-0.5 text-[var(--c-text)] outline-none focus:border-[#4a7dfc]"
            />
          </label>
          <label className="flex items-center gap-1.5">
            {t(lang, "cols")}
            <input
              type="number"
              min="1"
              max="12"
              value={customDims.cols}
              onChange={(e) => setDim("cols", e.target.value)}
              className="w-[52px] bg-[var(--c-elev)] border border-[var(--c-border)] rounded-md px-1.5 py-0.5 text-[var(--c-text)] outline-none focus:border-[#4a7dfc]"
            />
          </label>
          <span className="text-[11px] text-[var(--c-text-mute)]">
            {panels.length} {t(lang, "panel")}
          </span>
          <label
            className="flex items-center gap-1.5 cursor-pointer select-none"
            title={t(lang, "stackModeHint")}
          >
            <button
              role="switch"
              aria-checked={stack}
              onClick={() => setStack((v) => !v)}
              className={`relative h-[18px] w-[34px] shrink-0 rounded-full transition-colors ${
                stack ? "bg-[#4a7dfc]" : "bg-[var(--c-border)]"
              }`}
            >
              <span
                className={`absolute top-[3px] h-[12px] w-[12px] rounded-full bg-white shadow transition-all ${
                  stack ? "left-[19px]" : "left-[3px]"
                }`}
              ></span>
            </button>
            {t(lang, "stackMode")}
          </label>
        </div>
      )}

      <button className="btn-ghost" onClick={reloadAll}>
        ⟳ {t(lang, "reloadAll")}
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className={
            "btn-ghost" +
            (autoHide
              ? " border-[#4a7dfc] text-[#9ec1ff] bg-[#4a7dfc]/15 shadow-[inset_0_0_0_1px_rgba(74,125,252,0.25)]"
              : "")
          }
          onClick={() => setAutoHide((v) => !v)}
          title={
            autoHide
              ? "Fareyi pencerenin üst kenarına getirince çubuk görünür"
              : "Çubuğu gizler; fare üst kenara gelince gösterir"
          }
        >
          {autoHide ? t(lang, "autoHideOn") : t(lang, "autoHide")}
        </button>
        <button
          className="btn-ghost"
          onClick={toggleFullscreen}
          title={t(lang, "fullscreen")}
        >
          {isFullscreen ? t(lang, "exitFullscreen") : t(lang, "fullscreen")}
        </button>
        <button
          className="btn-ghost"
          onClick={onOpenSettings}
          title={t(lang, "settingsTitle")}
        >
          {t(lang, "settings")}
        </button>
      </div>
    </header>
  );
}