import { t } from "../../i18n";

function EyeIcon({ hidden }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hidden ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

export default function Toolbar({
  layout,
  setLayout,
  customDims,
  setDim,
  activeCount,
  panelCount,
  reloadAll,
  autoHide,
  setAutoHide,
  toggleFullscreen,
  isFullscreen,
  lang,
  version,
  stack,
  setStack,
  swapMode,
  onToggleSwap,
  onOpenSettings,
  onInjectPrompt,
  chromeMode,
  onOpenChromeLogin,
}) {
  return (
    <header
      data-toolbar
      className="flex flex-nowrap items-center gap-2 px-4 py-1.5 shrink-0 overflow-x-auto bg-[var(--c-toolbar)] border-b border-[var(--c-border-soft)]"
    >
      <div className="flex items-center gap-2 mr-1.5">
        <h1 className="text-[15px] font-bold whitespace-nowrap bg-gradient-to-r from-[#7ab3ff] to-[#b08cff] bg-clip-text text-transparent">
          {t(lang, "appName")}
        </h1>
        {version && (
          <span className="hidden md:inline text-[10px] font-medium text-[var(--c-text-mute)] select-none">
            v{version}
          </span>
        )}
        {/* TEST rozeti — yayın için gizlendi */}
      </div>

      <div
        className="flex border border-[var(--c-border)] rounded-xl overflow-hidden shadow-sm"
        role="group"
        aria-label={t(lang, "layout")}
      >
        {[
          { k: "row", label: "1×4" },
          { k: "grid", label: "2×2" },
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
        <div className="flex items-center gap-2 text-xs text-[var(--c-text-faint)]">
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
            {activeCount}/{panelCount}
          </span>
        </div>
      )}

      {layout !== "row" && (
        <label
          className="flex items-center gap-1.5 text-xs text-[var(--c-text-faint)] cursor-pointer select-none whitespace-nowrap"
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
      )}

      <div className="flex items-center gap-1.5">
        <button className="btn-icon" onClick={reloadAll} title={t(lang, "reloadAllHint")}>
          ⟳
        </button>
        <button
          className={
            "btn-icon" +
            (swapMode
              ? " border-[#4a7dfc] text-[#9ec1ff] bg-[#4a7dfc]/15 ring-2 ring-[#4a7dfc]/60"
              : "")
          }
          onClick={onToggleSwap}
          title={t(lang, "swapHint")}
        >
          ⇄
        </button>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {chromeMode && (
          <button
            className="btn-icon"
            onClick={onOpenChromeLogin}
            title="Hesap ekle/giriş yap (Chrome açılır)"
            aria-label="Hesap ekle"
          >
            <AccountIcon />
          </button>
        )}
        <button
          className="btn-icon"
          onClick={onInjectPrompt}
          title={t(lang, "promptTemplatesSoon")}
          disabled
          aria-disabled="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="13" y2="13" />
          </svg>
        </button>
        <button
          className={
            "btn-icon" +
            (autoHide
              ? " border-[#4a7dfc] text-[#9ec1ff] bg-[#4a7dfc]/15 ring-2 ring-[#4a7dfc]/60"
              : "")
          }
          onClick={() => setAutoHide((v) => !v)}
          title={
            autoHide
              ? "Fareyi pencerenin üst kenarına getirince çubuk görünür"
              : "Çubuğu gizler; fare üst kenara gelince gösterir"
          }
        >
          <EyeIcon hidden={autoHide} />
        </button>
        <button
          className="btn-icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? t(lang, "exitFullscreen") : t(lang, "fullscreen")}
        >
          {isFullscreen ? "⤢" : "⛶"}
        </button>
        <button className="btn-icon" onClick={onOpenSettings} title={t(lang, "settingsTitle")}>
          ⚙️
        </button>
      </div>
    </header>
  );
}