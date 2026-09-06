import { t } from "../../i18n";

export default function Panel({ id, url, onNavigate, onChangeUrl, onClose, slotRefs, lang }) {
  return (
    <section className="flex flex-col min-h-0 min-w-0 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[10px] overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--c-surface-h)] border-b border-[var(--c-border-soft)] shrink-0 min-w-0">
        <input
          className="flex-1 min-w-[60px] bg-[var(--c-elev)] border border-[var(--c-border)] rounded-[7px] px-2.5 py-1 text-[var(--c-text)] text-xs outline-none focus:border-[#4a7dfc] font-mono"
          value={url || ""}
          spellCheck={false}
          onChange={(e) => onChangeUrl(id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onNavigate(id);
          }}
          placeholder="gemini.google.com/app"
        />
        <button
          className="px-2.5 py-0.5 text-[11px] rounded-md text-white bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] cursor-pointer hover:brightness-110"
          onClick={() => onNavigate(id)}
          title={t(lang, "start")}
        >
          ▶
        </button>
        <button
          className="px-2.5 py-0.5 text-[11px] rounded-md text-[#f87171] bg-transparent border border-transparent cursor-pointer hover:bg-[#ef4444]/15 hover:border-[#ef4444]/40"
          onClick={() => onClose(id)}
          title={t(lang, "closePanel")}
        >
          ✕
        </button>
      </div>
      <div
        className="flex-1 min-h-0 bg-[var(--c-app)]"
        ref={(el) => {
          slotRefs.current[id] = el;
        }}
      />
    </section>
  );
}