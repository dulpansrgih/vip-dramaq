import Link from "next/link";

export default function SearchModal({
  open,
  onClose,
  providerName,
  keyword,
  onChange,
  results = [],
  loading,
  t,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* modal body */}
      <div className="absolute inset-0 flex justify-center p-0 sm:p-6">
        <div className="w-full max-w-5xl h-full sm:h-[92vh] bg-[#0b0b0b]/90 backdrop-blur-xl border border-white/10 sm:rounded-2xl shadow-[0_25px_90px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col">
          {/* TOP SEARCH BAR */}
          <div className="p-3 sm:p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                <input
                  autoFocus
                  value={keyword}
                  onChange={onChange}
                  onKeyDown={(e) => e.key === "Escape" && onClose()}
                  placeholder={t.search_placeholder}
                  className="w-full h-11 bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* provider line */}
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
              <span className="text-gray-500">{t.searching_in}:</span>
              <span className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-600/30 text-purple-300 text-xs font-bold">
                {providerName}
              </span>
            </div>
          </div>

          {/* RESULTS LIST */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {loading && (
              <div className="mt-10 space-y-3 animate-pulse">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/10" />
                      <div className="flex-1">
                        <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-full bg-white/10 rounded mb-3" />
                        <div className="flex gap-2">
                          <div className="h-6 w-20 bg-white/10 rounded-full" />
                          <div className="h-6 w-16 bg-white/10 rounded-full" />
                          <div className="h-6 w-24 bg-white/10 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && keyword?.trim() && results.length === 0 && (
              <div className="text-center text-gray-500 mt-20 text-sm">
                <div className="text-3xl mb-3">😕</div>
                <div className="font-bold text-gray-300">Tidak ada hasil</div>
                <div className="text-xs text-gray-500 mt-1">Coba kata kunci lain.</div>
              </div>
            )}

            {!loading && !keyword?.trim() && (
              <div className="text-center text-gray-600 mt-20 text-sm">
                <div className="text-3xl mb-3">✨</div>
                <div className="font-bold text-gray-300">Ketik untuk mencari</div>
                <div className="text-xs text-gray-500 mt-1">
                  Judul / genre / kata kunci.
                </div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-3">
                {results.map((item, i) => (
                  <Link
                    key={i}
                    href={`/drama/${item.provider}/${item.bookId || item.book_id}`}
                    onClick={onClose}
                  >
                    <div className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition p-4 cursor-pointer">
                      <div className="flex gap-4">
                        <img
                          src={item.coverWap || item.cover}
                          className="w-14 h-14 rounded-2xl object-cover"
                          alt=""
                          loading="lazy"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="text-white font-black text-sm sm:text-base line-clamp-1">
                            {item.bookName || item.title}
                          </div>

                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {item.introduction || "Deskripsi belum tersedia"}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(item.tags || []).slice(0, 4).map((tag, j) => (
                              <span
                                key={j}
                                className="text-[11px] px-3 py-1 rounded-full bg-black/30 border border-white/10 text-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-3 border-t border-white/10 text-[11px] text-gray-500 text-center">
            ESC untuk menutup
          </div>
        </div>
      </div>
    </div>
  );
}
