import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function safeText(v) {
  return typeof v === "string" ? v : "";
}

function pickCover(detail) {
  return detail?.coverWap || detail?.cover || "";
}

export default function DramaDetail() {
  const router = useRouter();
  const { provider, id } = router.query;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [synExpanded, setSynExpanded] = useState(false);

  // Fetch Data
  useEffect(() => {
    if (!id || !provider) return;
    setLoading(true);

    fetch(`https://api.sansekai.my.id/api/${provider}/detail?bookId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDetail(data?.data || data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setDetail(null);
        setLoading(false);
      });
  }, [id, provider]);

  const title = useMemo(() => {
    if (!detail) return "Detail Film";
    return detail.bookName || detail.title || "Detail Film";
  }, [detail]);

  const cover = useMemo(() => pickCover(detail), [detail]);

  const tags = useMemo(() => {
    const t = detail?.tags;
    if (Array.isArray(t) && t.length) return t.slice(0, 12);
    return [];
  }, [detail]);

  const intro = useMemo(() => {
    const raw = safeText(detail?.introduction).trim();
    return raw || "Sinopsis belum tersedia untuk drama ini. Namun drama ini telah dikurasi sebagai salah satu tontonan terbaik minggu ini. Nikmati alur cerita yang penuh kejutan dan emosi.";
  }, [detail]);

  const chapterCount = detail?.chapterCount ?? detail?.chapterNum ?? detail?.chapterTotal ?? null;

  const watchHref = useMemo(() => {
    if (!provider || !id) return "#";
    return `/watch/${provider}/${id}/1`;
  }, [provider, id]);

  if (loading || !detail) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white overflow-x-hidden relative">
      <Head>
        <title>{title}</title>
      </Head>

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {cover ? (
          <>
            <img
              src={cover}
              className="w-full h-full object-cover opacity-20 blur-[90px] scale-110"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#050505]/85 to-[#050505]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/70 to-[#050505]" />
        )}
      </div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full z-[120]">
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-white/10 bg-[#0b0b0b]/70 backdrop-blur-xl shadow-[0_14px_60px_rgba(0,0,0,0.55)]">
              <div className="px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                  aria-label="Back"
                  title="Back"
                >
                  <span className="text-lg font-black">←</span>
                </button>

                <div className="min-w-0">
                  <div className="text-sm font-black truncate">{title}</div>
                  <div className="text-[10px] text-gray-500 truncate">
                    Provider: {String(provider || "").toUpperCase()}
                    {chapterCount ? ` • ${chapterCount} episode` : ""}
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <span className="hidden sm:inline-flex text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-black">
                    VIP
                  </span>

                  <button
                    onClick={() => {
                      try {
                        const url = typeof window !== "undefined" ? window.location.href : "";
                        if (navigator?.share) {
                          navigator.share({ title, url });
                        } else if (navigator?.clipboard?.writeText) {
                          navigator.clipboard.writeText(url);
                          alert("Link disalin!");
                        }
                      } catch (e) {}
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                    aria-label="Share"
                    title="Share"
                  >
                    ↗
                  </button>
                </div>
              </div>

              {/* small divider glow */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="pt-[92px] md:pt-[104px] pb-24 md:pb-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 md:gap-10 items-start">
            {/* Poster Column */}
            <div className="md:sticky md:top-[120px]">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
                <div className="relative aspect-[3/4]">
                  {cover ? (
                    <img
                      src={cover}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt={title}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5" />
                  )}

                  {/* gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white text-black">
                      VIP
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-black/50 border border-white/15">
                      HD
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        EP
                      </div>
                      <div className="text-base font-black text-white mt-1">
                        {chapterCount || "?"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        GENRE
                      </div>
                      <div className="text-[12px] font-black text-white mt-1 truncate">
                        {tags?.[0] || "Drama"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        TYPE
                      </div>
                      <div className="text-[12px] font-black text-white mt-1">
                        Short
                      </div>
                    </div>
                  </div>

                  {/* Desktop CTA */}
                  <div className="hidden md:flex gap-2 mt-4">
                    <Link href={watchHref} legacyBehavior>
                      <a className="flex-1">
                        <button className="w-full py-3 rounded-2xl font-black bg-gradient-to-r from-primary to-rose-700 shadow-[0_0_28px_rgba(229,9,20,0.28)] hover:opacity-95 transition flex items-center justify-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center text-xs font-black">
                            ▶
                          </span>
                          Mulai Nonton
                        </button>
                      </a>
                    </Link>

                    <button
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                      title="Tambah ke daftar"
                      aria-label="Add"
                    >
                      +
                    </button>
                    <button
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                      title="Bagikan"
                      aria-label="Share"
                      onClick={() => {
                        try {
                          const url = typeof window !== "undefined" ? window.location.href : "";
                          if (navigator?.share) navigator.share({ title, url });
                          else if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(url);
                            alert("Link disalin!");
                          }
                        } catch (e) {}
                      }}
                    >
                      ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div>
              {/* Title + tags */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden">
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 font-bold">
                    <span className="text-primary font-black tracking-wider">SERIES</span>
                    <span className="text-gray-600">•</span>
                    <span className="uppercase">{String(provider || "")}</span>
                    {chapterCount ? (
                      <>
                        <span className="text-gray-600">•</span>
                        <span>{chapterCount} Episode</span>
                      </>
                    ) : null}
                  </div>

                  <h1 className="mt-2 text-2xl md:text-4xl lg:text-5xl font-black leading-tight">
                    {title}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.length ? (
                      tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:border-primary/60 hover:text-white transition"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 italic">
                        #DramaViral
                      </span>
                    )}
                  </div>

                  {/* Mobile actions (under title) */}
                  <div className="md:hidden mt-5 grid grid-cols-3 gap-2">
                    <button
                      className="rounded-2xl bg-white/5 border border-white/10 py-3 font-black text-sm hover:bg-white/10 transition"
                      onClick={() => alert("Fitur daftar segera hadir")}
                    >
                      + List
                    </button>
                    <button
                      className="rounded-2xl bg-white/5 border border-white/10 py-3 font-black text-sm hover:bg-white/10 transition"
                      onClick={() => {
                        try {
                          const url = typeof window !== "undefined" ? window.location.href : "";
                          if (navigator?.share) navigator.share({ title, url });
                          else if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(url);
                            alert("Link disalin!");
                          }
                        } catch (e) {}
                      }}
                    >
                      Share
                    </button>
                    <button
                      className="rounded-2xl bg-white/5 border border-white/10 py-3 font-black text-sm hover:bg-white/10 transition"
                      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                    >
                      Info
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Synopsis */}
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-primary rounded-full" />
                      <h3 className="text-base md:text-lg font-black">Sinopsis</h3>
                    </div>

                    <button
                      onClick={() => setSynExpanded((s) => !s)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition font-black"
                    >
                      {synExpanded ? "Ringkas" : "Lihat semua"}
                    </button>
                  </div>

                  <p
                    className={cn(
                      "mt-3 text-gray-300 leading-relaxed text-sm md:text-base",
                      synExpanded ? "" : "line-clamp-4"
                    )}
                    style={{ textAlign: "justify" }}
                  >
                    {intro}
                  </p>

                  <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        PROVIDER
                      </div>
                      <div className="mt-1 text-sm font-black text-white uppercase truncate">
                        {String(provider || "")}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        EPISODE
                      </div>
                      <div className="mt-1 text-sm font-black text-white">
                        {chapterCount || "?"}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        QUALITY
                      </div>
                      <div className="mt-1 text-sm font-black text-white">
                        HD
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="text-[10px] text-gray-500 font-black tracking-widest">
                        TYPE
                      </div>
                      <div className="mt-1 text-sm font-black text-white">
                        Short
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra cards */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[11px] text-gray-500 font-black tracking-widest">
                    PEMERAN UTAMA
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full border border-white/10" />
                    <div className="w-10 h-10 bg-white/10 rounded-full border border-white/10" />
                    <div className="w-10 h-10 bg-white/10 rounded-full border border-white/10" />
                    <span className="text-xs text-gray-500 italic">+ lainnya</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[11px] text-gray-500 font-black tracking-widest">
                    PRODUKSI
                  </div>
                  <div className="mt-3 text-sm text-gray-300">
                    Studio: <span className="text-white font-black">VIP Original</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-300">
                    Region: <span className="text-white font-black">Global</span>
                  </div>
                </div>
              </div>

              {/* Spacer for mobile sticky CTA */}
              <div className="h-6 md:hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-[130]">
        <div className="px-4 pb-4">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-white/10 bg-[#0b0b0b]/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.55)] p-3 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-black truncate">{title}</div>
                <div className="text-[10px] text-gray-500 truncate">
                  {chapterCount ? `${chapterCount} Episode` : "Short Drama"} • {String(provider || "").toUpperCase()}
                </div>
              </div>

              <Link href={watchHref} legacyBehavior>
                <a>
                  <button className="px-5 py-3 rounded-2xl font-black bg-gradient-to-r from-primary to-rose-700 shadow-[0_0_26px_rgba(229,9,20,0.28)] hover:opacity-95 transition flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center text-[10px] font-black">
                      ▶
                    </span>
                    Nonton
                  </button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
