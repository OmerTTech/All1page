import { useState } from "react";
import { t } from "../../i18n";

const headerInputClass =
  "flex-1 min-w-[60px] bg-[var(--c-elev)] border border-[var(--c-border)] rounded-[7px] px-2.5 py-1 text-[var(--c-text)] text-xs outline-none focus:border-[#4a7dfc] font-mono";
const startBtnClass =
  "px-2.5 py-0.5 text-[11px] rounded-md text-white bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-default";
const closeBtnClass =
  "px-2.5 py-0.5 text-[11px] rounded-md text-[#f87171] bg-transparent border border-transparent cursor-pointer hover:bg-[#ef4444]/15 hover:border-[#ef4444]/40 disabled:opacity-40 disabled:cursor-default";

function swapSectionClass(base, swapActive, selected) {
  let cls = base;
  if (swapActive) {
    cls += " cursor-pointer select-none";
    if (selected) {
      cls += " ring-2 ring-[#4a7dfc] border-[#4a7dfc]";
    } else {
      cls += " hover:border-[#4a7dfc]/70 hover:ring-1 hover:ring-[#4a7dfc]/40";
    }
  }
  return cls;
}

function swapBadge(selected) {
  return (
    <span
      className={
        "flex-none w-[18px] h-[18px] rounded-full bg-[#4a7dfc] text-white text-[10px] font-bold grid place-items-center " +
        (selected ? "" : "invisible")
      }
    >
      1
    </span>
  );
}

export default function Panel({
  id,
  url,
  defaultUrl,
  onNavigate,
  onChangeUrl,
  onClose,
  slotRefs,
  lang,
  style,
  swapActive,
  selected,
  onSwapClick,
}) {
  return (
    <section
      className={swapSectionClass(
        "flex flex-col min-h-0 min-w-0 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[10px] overflow-hidden",
        swapActive,
        selected
      )}
      style={style}
      onClick={swapActive ? onSwapClick : undefined}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--c-surface-h)] border-b border-[var(--c-border-soft)] shrink-0 min-w-0">
        {swapActive ? swapBadge(selected) : null}
        <input
          className={headerInputClass}
          value={url || ""}
          spellCheck={false}
          disabled={!!swapActive}
          onChange={(e) => onChangeUrl(id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onNavigate(id);
          }}
          placeholder={defaultUrl || "gemini.google.com/app"}
        />
        <button
          className={startBtnClass}
          disabled={!!swapActive}
          onClick={() => onNavigate(id)}
          title={t(lang, "start")}
        >
          ▶
        </button>
        <button
          className={closeBtnClass}
          disabled={!!swapActive}
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

// Boş hücre: görünüm (WebContentsView) yok; normal modda URL girilip ▶ ile yeni oturum açılır,
// swap modunda ise hedef/başlangıç hücresi olarak seçilebilir.
export function EmptyCell({
  style,
  onOpen,
  defaultUrl,
  lang,
  swapActive,
  selected,
  onSwapClick,
}) {
  const [value, setValue] = useState("");
  const start = () => {
    const v = value.trim();
    setValue("");
    onOpen(v);
  };
  return (
    <section
      className={swapSectionClass(
        "flex flex-col min-h-0 min-w-0 bg-[var(--c-surface)] border border-dashed border-[var(--c-border)] rounded-[10px] overflow-hidden",
        swapActive,
        selected
      )}
      style={style}
      onClick={swapActive ? onSwapClick : undefined}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--c-surface-h)] border-b border-dashed border-[var(--c-border-soft)] shrink-0 min-w-0">
        {swapActive ? swapBadge(selected) : null}
        <input
          className={headerInputClass}
          value={value}
          spellCheck={false}
          disabled={!!swapActive}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") start();
          }}
          placeholder={defaultUrl || "gemini.google.com/app"}
        />
        <button className={startBtnClass} disabled={!!swapActive} onClick={start} title={t(lang, "start")}>
          ▶
        </button>
      </div>
      <div className="flex-1 min-h-0 grid place-items-center px-3 text-center text-[11px] text-[var(--c-text-mute)] select-none">
        {t(lang, "emptyCell")}
      </div>
    </section>
  );
}