import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getT } from "../setting/bahasa";
import {
  API_BASE,
  ENDPOINTS,
  GRID_AUTO,
  BackgroundGlow,
  Navbar,
  Sidebar,
  clampList,
  normalizeList,
  processHomeData,
} from "../setting/main";
import { PROVIDERS } from "../utils/providers";

export default function Home() {
  const router = useRouter();

  // HOME DATA
  const [homeSections, setHomeSections] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  // PROVIDER
  const [activeProvider, setActiveProvider] = useState("dramabox");

  // SIDEBAR + AUTH + LANG
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lang, setLang] = useState("id");
  const t = getT(lang);

  useEffect(() => {
    const userStatus = localStorage.getItem("vip_user");
    setIsLoggedIn(userStatus === "active");
  }, []);

  // lock scroll for sidebar
  useEffect(() => {
    if (!isSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setIsSidebarOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isSidebarOpen]);

  const providerName =
    PROVIDERS.find((p) => p.id === activeProvider)?.name || activeProvider;

  const fetchHomepage = async () => {
    setLoading(true);

    const endpoint = ENDPOINTS[activeProvider]?.[0] || "vip";
    try {
      const resMain = await fetch(`${API_BASE}/${activeProvider}/${endpoint}`);
      const dataMain = await resMain.json();

      let dataRandom = [];
      try {
        if (activeProvider === "dramabox") {
          const resRand = await fetch(`${API_BASE}/${activeProvider}/randomdrama`);
          const jsonRand = await resRand.json();
          if (Array.isArray(jsonRand)) dataRandom = jsonRand;
          else if (Array.isArray(jsonRand.data)) dataRandom = jsonRand.data;
        }
      } catch {}

      processHomeData({
        dataMain,
        dataRandom,
        t,
        setHomeSections,
        setFeatured,
      });

      setLoading(false);
    } catch (e) {
      console.error(e);
      setHomeSections([]);
      setFeatured(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProvider]);

  // Spotlight 4 item (ambil dari section pertama kalau ada)
  const spotlightItems = useMemo(() => {
    if (loading) return [];
    const first = homeSections?.[0]?.items || [];
    return clampList(normalizeList(first), 4);
  }, [homeSections, loading]);

  return (
    <div className="min-h-screen text-white font-sans pb-24 overflow-x-hidden">
      <Head>
        <title>VIP DramaQ</title>
      </Head>

      <BackgroundGlow />

      <Navbar
        lang={lang}
        setLang={setLang}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        t={t}
      />

      <Sidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        router={router}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowLoginModal={setShowLoginModal}
        t={t}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
      />

      <div className="pt-[132px] md:pt-[140px]">
        <div className="mx-auto max-w-7xl px-4">
          {/* FEATURED HERO */}
          {!loading && featured && (
            <div className="mb-10">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.60)]">
                <div className="absolute inset-0">
                  <img
                    src={featured.coverWap || featured.cover}
                    className="w-full h-full object-cover opacity-90 scale-[1.03]"
                    loading="lazy"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />
                </div>

                <div className="relative p-6 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col justify-end">
                  <div className="inline-flex items-center gap-2 bg-black/45 border border-white/10 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    FEATURED TODAY
                  </div>

                  <h1 className="mt-3 text-2xl sm:text-3xl font-black leading-tight max-w-2xl line-clamp-2 drop-shadow">
                    {featured.bookName || featured.title}
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-2xl line-clamp-2">
                    {featured.introduction || "Klik untuk mulai menonton."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/drama/${activeProvider}/${featured.bookId || featured.book_id}`}
                      className="inline-flex items-center gap-2 bg-white text-black font-black px-5 py-3 rounded-2xl hover:bg-gray-100 transition"
                    >
                      ▶ Play Now
                    </Link>

                    <span className="text-[10px] text-gray-400">
                      Provider: <span className="text-gray-200 font-bold">{providerName}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spotlight */}
          {!loading && spotlightItems.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-fuchsia-500 rounded-full" />
                <h3 className="text-white font-black text-lg">{t.trending}</h3>
              </div>

              <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
                {spotlightItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/drama/${activeProvider}/${item.bookId || item.book_id}`}
                    className="snap-start"
                  >
                    <div className="min-w-[260px] sm:min-w-[320px] md:min-w-[380px] group cursor-pointer">
                      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                        <img
                          src={item.coverWap || item.cover || item.bookCover}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          alt={item.bookName || item.title || "poster"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="inline-flex items-center gap-2 bg-black/50 border border-white/10 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            SPOTLIGHT
                          </div>
                          <h4 className="text-white font-black text-base md:text-lg leading-tight line-clamp-2 drop-shadow">
                            {item.bookName || item.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-8 animate-pulse">
              <div className="h-6 w-36 bg-white/10 rounded mb-4"></div>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(110px,1fr))]">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4.2] bg-white/5 rounded-2xl border border-white/10"
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {!loading &&
            homeSections.map((section, secIdx) => (
              <div key={secIdx} className="mb-12 animate-[fadeUp_0.45s_ease-out]">
                <h3 className="text-white font-black text-lg flex items-center gap-3 mb-4">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                  {section.title}
                </h3>

                <div className={GRID_AUTO}>
                  {section.items.map((item, idx) => (
                    <Link
                      href={`/drama/${activeProvider}/${item.bookId || item.book_id}`}
                      key={idx}
                    >
                      <div className="group cursor-pointer">
                        <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.45)]">
                          <img
                            src={item.coverWap || item.cover || item.bookCover}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            alt={item.bookName || item.title || "poster"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-90" />

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-black/55 border border-white/15 backdrop-blur flex items-center justify-center">
                              <span className="text-white text-xl ml-0.5">▶</span>
                            </div>
                          </div>
                        </div>

                        <h4 className="mt-3 text-[11px] md:text-xs font-extrabold text-gray-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                          {item.bookName || item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Keyframes global */}
      <style jsx global>{`
        @keyframes fadeUp {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* VIP Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowLoginModal(false)}
          ></div>
          <div className="relative bg-[#121212]/90 border border-white/10 w-full max-w-sm p-7 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <h2 className="text-2xl font-black text-white text-center mb-2">{t.login_title}</h2>
            <p className="text-gray-400 text-center text-xs mb-6">{t.login_desc}</p>

            <button
              onClick={() => {
                localStorage.setItem("vip_user", "active");
                setIsLoggedIn(true);
                setShowLoginModal(false);
              }}
              className="w-full bg-gradient-to-r from-primary to-rose-700 text-white font-black py-3.5 rounded-2xl shadow-[0_0_25px_rgba(229,9,20,0.25)] hover:scale-[1.02] transition-transform"
            >
              {t.login_btn}
            </button>

            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full mt-3 text-gray-500 text-xs hover:text-white"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
