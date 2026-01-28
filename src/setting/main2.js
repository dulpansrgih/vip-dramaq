// src/setting/main.js
import Link from "next/link";
import { PROVIDERS } from "../utils/providers";

export const API_BASE = "https://api.sansekai.my.id/api";

export const ENDPOINTS = {
  dramabox: ["vip", "search"],
  reelshort: ["homepage", "search"],
  netshort: ["theaters", "search"],
  melolo: ["latest", "search"],
  flickreels: ["latest", "search"],
  freereels: ["homepage", "search"],
  moviebox: ["homepage", "search"],
  komik: ["recommended?type=manhwa", "search"],
  anime: ["latest", "search"],
};

export const clampList = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []);

// ✅ FIX: normalisasi item lintas provider (termasuk ReelShort: book_pic/book_title/book_id)
export const normalizeItem = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const bookId = raw.bookId || raw.book_id || raw.t_book_id || raw.id || raw.b_id;

  // ReelShort uses: book_pic, book_title, book_id
  const coverWap = raw.coverWap || raw.cover || raw.book_pic || raw.pic || raw.video_pic;
  const title = raw.bookName || raw.title || raw.book_title || raw.bookTitle;

  if (!bookId || !coverWap) return null;

  return {
    ...raw,
    // unify keys for UI
    bookId: raw.bookId || bookId,
    book_id: raw.book_id || bookId,
    coverWap,
    cover: raw.cover || coverWap,
    bookName: raw.bookName || title,
    title: raw.title || title,
  };
};

export const normalizeList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeItem).filter(Boolean);
};

// ✅ FIX: processHomeData dukung ReelShort homepage (data.data.lists)
export const processHomeData = ({ dataMain, dataRandom, t, setHomeSections, setFeatured }) => {
  let sections = [];
  let allFeaturedCandidates = [];

  // ================= RANDOM (optional) =================
  if (Array.isArray(dataRandom) && dataRandom.length > 0) {
    const cleanRandom = normalizeList(dataRandom);
    if (cleanRandom.length > 0) {
      sections.push({ title: t.random_pick + " 🎲", items: cleanRandom });
      allFeaturedCandidates.push(...cleanRandom);
    }
  }

  // ================= DRAMABOX-like shapes =================
  if (dataMain?.columnVoList && Array.isArray(dataMain.columnVoList)) {
    dataMain.columnVoList.forEach((col) => {
      if (Array.isArray(col.bookList) && col.bookList.length > 0) {
        const items = normalizeList(col.bookList);
        if (items.length > 0) {
          sections.push({ title: col.title || col.name, items });
          allFeaturedCandidates.push(...items);
        }
      }
    });
  } else if (dataMain?.data?.moduleList && Array.isArray(dataMain.data.moduleList)) {
    dataMain.data.moduleList.forEach((m) => {
      if (Array.isArray(m.bookList) && m.bookList.length > 0) {
        const items = normalizeList(m.bookList);
        if (items.length > 0) {
          sections.push({ title: m.title || m.name, items });
          allFeaturedCandidates.push(...items);
        }
      }
    });

    // ================= REELSHORT HOMEPAGE shape =================
  } else if (dataMain?.data?.lists && Array.isArray(dataMain.data.lists)) {
    const lists = dataMain.data.lists;

    const tabMap = new Map(
      Array.isArray(dataMain.data.tab_list)
        ? dataMain.data.tab_list.map((x) => [String(x.tab_id), x.tab_name || x.name || ""])
        : []
    );

    const fromBanner = (b) => {
      const jp = b?.jump_param || b?.jumpParam || b;
      if (!jp) return null;

      // banner biasanya pakai pic + jump_param(book_id, book_title, book_pic)
      return normalizeItem({
        book_id: jp.book_id,
        book_pic: jp.book_pic || b.pic || b.image,
        book_title: jp.book_title || b.title,
        start_play: jp.start_play,
        ...jp,
      });
    };

    lists.forEach((block) => {
      const ui = block?.ui_style;

      const title =
        tabMap.get(String(block?.tab_id)) ||
        block?.name ||
        block?.title ||
        (ui === 1001 ? "Spotlight" : "ReelShort");

      let items = [];

      // ui_style 1001 umumnya banners
      if (Array.isArray(block?.banners) && block.banners.length > 0) {
        items = block.banners.map(fromBanner).filter(Boolean);
      }

      // ui_style 9 umumnya books
      if (Array.isArray(block?.books) && block.books.length > 0) {
        items = normalizeList(block.books);
      }

      if (items.length > 0) {
        sections.push({ title, items });
        allFeaturedCandidates.push(...items);
      }
    });

    // ================= GENERIC list shape =================
  } else if (Array.isArray(dataMain?.data) || Array.isArray(dataMain)) {
    const list = Array.isArray(dataMain?.data) ? dataMain.data : dataMain;
    const items = normalizeList(list);
    if (items.length > 0) {
      sections.push({ title: "Terbaru", items });
      allFeaturedCandidates.push(...items);
    }
  }

  setHomeSections(sections);

  const cleanCandidates = normalizeList(allFeaturedCandidates);
  if (cleanCandidates.length > 0) {
    setFeatured(cleanCandidates[Math.floor(Math.random() * cleanCandidates.length)]);
  } else {
    setFeatured(null);
  }
};

// Grid auto-fit: mobile minimal 3 kolom (min 110px) lalu auto nambah
export const GRID_AUTO =
  "grid gap-3 gap-y-7 " +
  "[grid-template-columns:repeat(auto-fit,minmax(110px,1fr))] " +
  "sm:[grid-template-columns:repeat(auto-fit,minmax(130px,1fr))] " +
  "md:[grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] " +
  "lg:[grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]";

// ================= UI COMPONENTS =================

export function Navbar({
  lang,
  setLang,
  activeProvider,
  setActiveProvider,
  onOpenSearch,
  onOpenSidebar,
  t,
}) {
  const activeName = PROVIDERS.find((p) => p.id === activeProvider)?.name || activeProvider;

  return (
    <div className="fixed top-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="bg-[#0c0c0c]/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Brand */}
            <button
              onClick={() => setActiveProvider("dramabox")}
              className="flex items-center gap-2"
              aria-label="Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-700 shadow-[0_0_25px_rgba(229,9,20,0.25)] flex items-center justify-center">
                <span className="text-white font-black text-xs tracking-wider">VIP</span>
              </div>
            </button>

            {/* Search trigger (icon aja konsep header) */}
            <button
              onClick={onOpenSearch}
              className="flex-1 relative text-left"
              aria-label="Open search"
            >
              <div className="absolute inset-0 rounded-full blur-md opacity-20 bg-primary/30" />
              <div className="relative w-full bg-white/5 border border-white/10 text-white text-xs md:text-sm px-10 py-2.5 rounded-full">
                <span className="absolute left-4 top-2.5">🔍</span>
                <span className="text-gray-400">{t.search_placeholder}</span>
                <span className="absolute right-4 top-2.5 text-[10px] text-gray-500 hidden md:inline">
                  {activeName}
                </span>
              </div>
            </button>

            {/* Lang */}
            <button
              onClick={() => setLang((p) => (p === "id" ? "en" : "id"))}
              className="px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-black tracking-wider"
              aria-label="Language"
              title="Language"
            >
              {lang === "id" ? "ID" : "EN"}
            </button>

            {/* Menu */}
            <button
              onClick={onOpenSidebar}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
              aria-label="Menu"
              title="Menu"
            >
              ☰
            </button>
          </div>

          {/* Provider pills (horizontal) */}
          <div className="px-3 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {PROVIDERS.filter((p) => p.id !== "komik" && p.id !== "anime").map((p) => {
                const active = p.id === activeProvider;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProvider(p.id)}
                    className={
                      "px-4 py-2 rounded-full text-xs font-black border transition whitespace-nowrap " +
                      (active
                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.18)]"
                        : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10")
                    }
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar (tanpa useEffect)
export function Sidebar({
  open,
  onClose,
  router,
  isLoggedIn,
  setIsLoggedIn,
  setShowLoginModal,
  t,
  activeProvider,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* panel */}
      <div className="absolute top-0 right-0 h-full w-[88%] max-w-[360px] bg-[#0b0b0b]/90 border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-black text-lg">VIP DRAMAQ</div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Profile/VIP card */}
          <div className="bg-gradient-to-r from-primary to-rose-800 p-4 rounded-2xl mb-5 border border-white/10 shadow-[0_0_28px_rgba(229,9,20,0.25)]">
            <p className="text-[11px] text-white/80 mb-1">{isLoggedIn ? t.status_vip : t.status_free}</p>
            <h3 className="text-xl font-black text-white">{isLoggedIn ? t.member : t.guest}</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-black/30 border border-white/10">
                Provider: {PROVIDERS.find((p) => p.id === activeProvider)?.name || activeProvider}
              </span>
            </div>
          </div>

          {/* Menu links */}
          <div className="grid gap-2 mb-5">
            <button
              onClick={() => {
                onClose();
                router.push("/");
              }}
              className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="font-black">🏠 {t.menu_home}</div>
              <div className="text-[11px] text-gray-500 mt-1">Beranda utama</div>
            </button>

            <button
              onClick={() => {
                onClose();
                router.push("/info?page=terms");
              }}
              className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="font-black">📜 {t.menu_terms}</div>
              <div className="text-[11px] text-gray-500 mt-1">Syarat & ketentuan</div>
            </button>

            <button
              onClick={() => {
                onClose();
                router.push("/info?page=about");
              }}
              className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="font-black">ℹ️ {t.menu_about}</div>
              <div className="text-[11px] text-gray-500 mt-1">Tentang aplikasi</div>
            </button>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-black text-gray-300 mb-1">{t.tips}</div>
            <div className="text-[11px] text-gray-500">
              Klik area gelap untuk menutup.
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="absolute bottom-0 left-0 w-full p-5 border-t border-white/10 bg-[#0b0b0b]/70 backdrop-blur">
          {!isLoggedIn ? (
            <button
              onClick={() => {
                onClose();
                router.push("/login-email");
              }}
              className="w-full bg-gradient-to-r from-primary to-rose-700 text-white font-black py-3.5 rounded-2xl shadow-[0_0_25px_rgba(229,9,20,0.25)] hover:scale-[1.02] transition-transform"
            >
              Masuk
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("vip_user");
                setIsLoggedIn(false);
                onClose();
              }}
              className="w-full bg-white/10 border border-white/10 text-white font-black py-3.5 rounded-2xl hover:bg-white/15"
            >
              Keluar
            </button>
          )}

          <div className="mt-3 text-[10px] text-gray-600 text-center">2026 • VIP DRAMAQ</div>
        </div>
      </div>
    </div>
  );
}

// Background glow helper
export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-primary/25 blur-[120px]" />
      <div className="absolute top-40 -right-24 w-[520px] h-[520px] rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-fuchsia-500/15 blur-[160px]" />
      <div className="absolute inset-0 bg-[#050505]" />
    </div>
  );
}

// (SpotlightCarousel dll tetap sesuai file kamu - tidak aku ubah di sini)
export function Spotlight({ items, activeProvider, title }) {
  const ref = require("react").useRef(null);
  return null;
}

export function SpotlightCarousel({ items, activeProvider, title }) {
  const ref = require("react").useRef(null);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('[data-spotcard="1"]');
    const step = card ? card.getBoundingClientRect().width + 12 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-black text-lg flex items-center gap-3">
          <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-fuchsia-500 rounded-full" />
          {title}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          >
            ‹
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={`/drama/${activeProvider}/${item.bookId || item.book_id}`}
            className="snap-start"
          >
            <div data-spotcard="1" className="min-w-[260px] sm:min-w-[320px] md:min-w-[380px] group cursor-pointer">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                <img
                  src={item.coverWap || item.cover}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  alt=""
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
  );
}
