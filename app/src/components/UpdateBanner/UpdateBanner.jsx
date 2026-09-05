export default function UpdateBanner({ update, onInstall, onDismiss }) {
  if (!update) return null;

  if (update.status === "downloading") {
    return (
      <div className="fixed bottom-3 right-3 z-[100] w-64 rounded-xl border border-[#2c3344] bg-[#0a0e14]/95 px-4 py-3 shadow-xl">
        <div className="text-xs font-semibold text-[#9ec1ff]">
          ⬇️ Güncelleme indiriliyor…
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1a2230]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2f6bff] to-[#7a4dff] transition-all"
            style={{ width: update.percent + "%" }}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-[#8b93a5]">
          %{update.percent}
        </div>
      </div>
    );
  }

  if (update.status === "ready") {
    return (
      <div className="fixed bottom-3 right-3 z-[100] w-72 rounded-xl border border-[#3a9d5d]/50 bg-[#0c1512]/95 px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-xs font-semibold text-[#7fdca7]">
              🚀 Yeni sürüm hazır
            </div>
            <div className="mt-0.5 text-[11px] text-[#8b93a5]">
              {update.version ? "v" + update.version : ""} indirildi. Şimdi
              kurup yeniden başlat.
            </div>
          </div>
          <button
            className="shrink-0 rounded-lg bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] px-3 py-2 text-[11px] font-semibold text-white cursor-pointer hover:brightness-110"
            onClick={onInstall}
          >
            Yeniden Başlat
          </button>
        </div>
      </div>
    );
  }

  if (update.status === "error") {
    return (
      <div className="fixed bottom-3 right-3 z-[100] w-64 rounded-xl border border-[#5a3a3a] bg-[#140c0c]/95 px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs font-semibold text-[#f87171]">
            ⚠️ Güncelleme kontrol edilemedi
          </div>
          <button
            className="text-[#8b93a5] cursor-pointer hover:text-[#dfe4ee]"
            onClick={onDismiss}
            title="Kapat"
          >
            ✕
          </button>
        </div>
        <div className="mt-1 text-[11px] leading-snug text-[#8b93a5]">
          {update.message}
        </div>
      </div>
    );
  }

  return null;
}