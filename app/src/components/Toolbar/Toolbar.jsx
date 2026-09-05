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
}) {
  return (
    <header
      data-toolbar
      className="flex flex-wrap items-center gap-2.5 px-3 py-2 shrink-0 bg-[#0a0e14]/90 border-b border-[#232a3a]"
    >
      <h1 className="text-[15px] font-bold mr-1 whitespace-nowrap bg-gradient-to-r from-[#7ab3ff] to-[#b08cff] bg-clip-text text-transparent">
        All1page
      </h1>

      <div
        className="flex border border-[#2c3344] rounded-lg overflow-hidden"
        role="group"
        aria-label="Yerleşim"
      >
        {[
          { k: "grid", label: "2×2" },
          { k: "row", label: "1×4" },
          { k: "custom", label: "Custom" },
        ].map(({ k, label }) => (
          <button
            key={k}
            className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              k !== "grid" ? "border-l border-[#2c3344]" : ""
            } ${
              layout === k
                ? "bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] text-white"
                : "bg-[#10131b] text-[#9aa2b1]"
            }`}
            onClick={() => setLayout(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {layout === "custom" && (
        <div className="flex items-center gap-2.5 text-xs text-[#8b93a5]">
          <label className="flex items-center gap-1.5">
            Satır
            <input
              type="number"
              min="1"
              max="8"
              value={customDims.rows}
              onChange={(e) => setDim("rows", e.target.value)}
              className="w-[52px] bg-[#0e1119] border border-[#2c3344] rounded-md px-1.5 py-0.5 text-[#dfe4ee] outline-none focus:border-[#4a7dfc]"
            />
          </label>
          <label className="flex items-center gap-1.5">
            Sütun
            <input
              type="number"
              min="1"
              max="12"
              value={customDims.cols}
              onChange={(e) => setDim("cols", e.target.value)}
              className="w-[52px] bg-[#0e1119] border border-[#2c3344] rounded-md px-1.5 py-0.5 text-[#dfe4ee] outline-none focus:border-[#4a7dfc]"
            />
          </label>
          <span className="text-[11px] text-[#5c6472]">{panels.length} panel</span>
        </div>
      )}

      <button className="btn-ghost" onClick={reloadAll}>
        ⟳ Hepsini Yenile
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className={"btn-ghost" + (autoHide ? " border-[#4a7dfc] text-[#9ec1ff] bg-[#4a7dfc]/15 shadow-[inset_0_0_0_1px_rgba(74,125,252,0.25)]" : "")}
          onClick={() => setAutoHide((v) => !v)}
          title={
            autoHide
              ? "Otomatik gizleme açık — fareyi pencerenin üst kenarına getirince çubuk görünür"
              : "Otomatik gizleme — çubuğu gizler; fare üst kenara gelince gösterir, uzaklaşınca gizler"
          }
        >
          {autoHide ? "🖱️ Otomatik Gizle: Açık" : "🖱️ Otomatik Gizle"}
        </button>
        <button
          className="btn-ghost"
          onClick={toggleFullscreen}
          title="Tam ekran"
        >
          {isFullscreen ? "⤢ Ekrandan Çık" : "⛶ Tam Ekran"}
        </button>
      </div>
    </header>
  );
}
