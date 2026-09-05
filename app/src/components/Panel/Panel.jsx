export default function Panel({ id, url, onNavigate, onChangeUrl, onClose, slotRefs }) {
  return (
    <section className="flex flex-col min-h-0 min-w-0 bg-[#141821] border border-[#262c3a] rounded-[10px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#10141d] border-b border-[#232a3a] shrink-0 min-w-0">
        <input
          className="flex-1 min-w-[60px] bg-[#0e1119] border border-[#2c3344] rounded-[7px] px-2 py-1 text-[#dfe4ee] text-xs outline-none focus:border-[#4a7dfc] font-mono"
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
          title="Başlat"
        >
          ▶
        </button>
        <button
          className="px-2.5 py-0.5 text-[11px] rounded-md text-[#f87171] bg-transparent border border-transparent cursor-pointer hover:bg-[#ef4444]/15 hover:border-[#ef4444]/40"
          onClick={() => onClose(id)}
          title="Bu paneli kapat (ızgarayı büyütünce oturumuyla geri gelir)"
        >
          ✕
        </button>
      </div>
      <div
        className="flex-1 min-h-0 bg-[#0d1117]"
        ref={(el) => {
          slotRefs.current[id] = el;
        }}
      />
    </section>
  );
}
