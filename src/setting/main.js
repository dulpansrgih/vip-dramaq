// src/setting/main.js
import { useEffect, useRef } from "react";
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

export const normalizeList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((i) => (i.cover || i.coverWap) && (i.bookId || i.book_id));
};

export const processHomeData = ({ dataMain, dataRandom, t, setHomeSections, setFeatured }) => {
  let sections = [];
  let allFeaturedCandidates = [];

  // Random pick (optional)
  if (dataRandom && dataRandom.length > 0) {
    const cleanRandom = normalizeList(dataRandom);
    if (cleanRandom.length > 0) {
      sections.push({ title: t.random_pick + " 🎲", items: cleanRandom });
      allFeaturedCandidates.push(...cleanRandom);
    }
  }

  // Dramabox style
  if (dataMain?.columnVoList && Array.isArray(dataMain.columnVoList)) {
    dataMain.columnVoList.forEach((col) => {
      if (col.bookList && col.bookList.length > 0) {
        const norm = normalizeList(col.bookList);
        if (norm.length > 0) {
          sections.push({ title: col.title || col.name, items: norm });
          allFeaturedCandidates.push(...norm);
        }
      }
    });
  }
  // Other providers style
  else if (dataMain?.data?.moduleList) {
    dataMain.data.moduleList.forEach((m) => {
      if (m.bookList && m.bookList.length > 0) {
        const norm = normalizeList(m.bookList);
        if (norm.length > 0) {
          sections.push({ title: m.title || m.name, items: norm });
          allFeaturedCandidates.push(...norm);
        }
      }
    });
  }
  // Fallback list
  else if (Array.isArray(dataMain?.data) || Array.isArray(dataMain)) {
    const list = Array.isArray(dataMain?.data) ? dataMain.data : dataMain;
    const norm = normalizeList(list);
    if (norm.length > 0) {
      sections.push({ title: "Terbaru", items: norm });
      allFeaturedCandidates.push(...norm);
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

// Grid auto-fit
export const GRID_AUTO =
  "grid gap-3 gap-y-7 " +
  "[grid-template-columns:repeat(auto-fit,minmax(110px,1fr))] " +
  "sm:[grid-template-columns:repeat(auto-fit,minmax(130px,1fr))] " +
  "md:[grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] " +
  "lg:[grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]";

// ================= UI =================

export function Navbar({ lang, setLang, activeProvider, setActiveProvider, onOpenSidebar }) {
  const activeName = PROVIDERS.find((p) => p.id === activeProvider)?.name || activeProvider;

  return (
    <div className="fixed top-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="bg-[#0c0c0c]/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            {/* BRAND */}
            <button
              onClick={() => setActiveProvider("dramabox")}
              className="flex items-center gap-3"
              aria-label="Home"
              title="Home"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-rose-700 shadow-[0_0_25px_rgba(229,9,20,0.25)] flex items-center justify-center">
                <span className="text-white font-black text-[10px] tracking-wider">VIP</span>
              </div>

              <div className="hidden sm:block leading-tight">
                <div className="text-white font-black tracking-widest text-sm">VIP DRAMAQ</div>
                <div className="text-[10px] text-gray-500 -mt-0.5">{activeName}</div>
              </div>
            </button>

            <div className="flex-1" />

            {/* LANG */}
            <button
              onClick={() => setLang((p) => (p === "id" ? "en" : "id"))}
              className="px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-black tracking-wider"
              aria-label="Language"
              title="Language"
            >
              {lang.toUpperCase()}
            </button>

            {/* MENU */}
            <button
              onClick={onOpenSidebar}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              aria-label="Open menu"
              title="Menu"
            >
              ☰
            </button>
          </div>

          {/* Provider pills */}
          <div className="px-4 pb-3">
            <div className="overflow-x-auto scrollbar-hide flex gap-2 whitespace-nowrap">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProvider(p.id)}
                  className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-black transition-all border shrink-0
                    ${
                      activeProvider === p.id
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-white/25 hover:bg-white/10"
                    }
                  `}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const providerLabel =
    PROVIDERS.find((p) => p.id === activeProvider)?.name || activeProvider;

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[9999] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        className={`
          absolute top-0 right-0 h-full w-[86%] max-w-[360px]
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="h-full bg-[#0b0b0b]/92 backdrop-blur-2xl border-l border-white/10 shadow-[-18px_0_60px_rgba(0,0,0,0.65)] flex flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white font-black text-[10px] tracking-widest">VIP</span>
                </div>
                <div className="leading-tight">
                  <div className="text-white font-black tracking-widest text-sm">
                    VIP DRAMAQ
                  </div>
                  <div className="text-[10px] text-gray-500">{providerLabel}</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Small profile/status card */}
            <div className="mt-4 rounded-2xl p-4 bg-white/5 border border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 font-black tracking-widest">
                    ACCOUNT
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isLoggedIn ? "bg-emerald-400" : "bg-gray-500"
                      }`}
                    />
                    <div className="text-sm font-black text-white">
                      {isLoggedIn ? t.member : t.guest}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {isLoggedIn ? t.status_vip : t.status_free}
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full border font-black ${
                    isLoggedIn
                      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
                      : "bg-white/5 text-gray-300 border-white/10"
                  }`}
                >
                  {isLoggedIn ? "VIP" : "FREE"}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-4 flex-1 overflow-y-auto">
            <div className="px-2 text-[10px] text-gray-600 font-black tracking-widest mb-2">
              MENU
            </div>

            <div className="space-y-1">
              <SidebarItem
                icon="🏠"
                title={t.menu_home}
                desc="Beranda utama"
                onClick={() => {
                  onClose();
                  router.push("/");
                }}
              />
              <SidebarItem
                icon="📜"
                title={t.menu_terms}
                desc="Syarat & ketentuan"
                onClick={() => {
                  onClose();
                  router.push("/info?page=terms");
                }}
              />
              <SidebarItem
                icon="ℹ️"
                title={t.menu_about}
                desc="Tentang aplikasi"
                onClick={() => {
                  onClose();
                  router.push("/info?page=about");
                }}
              />

              <div className="my-3 border-t border-white/10" />

              <div className="px-2 text-[10px] text-gray-600 font-black tracking-widest mb-2">
                INFO
              </div>

              <div className="px-3 py-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-gray-300 font-black">Tips</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Klik area gelap untuk menutup, atau tekan{" "}
                  <span className="text-gray-200 font-black">ESC</span>.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom sticky button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => {
                if (isLoggedIn) {
                    localStorage.removeItem("vip_user");
                    setIsLoggedIn(false);
                    onClose();
                } else {
                    onClose();
                    router.push("/login-email");
                }
                }}
              className={`w-full py-3.5 rounded-2xl font-black transition ${
                isLoggedIn
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-gradient-to-r from-primary to-rose-700 text-white hover:opacity-95 shadow-[0_0_25px_rgba(229,9,20,0.22)]"
              }`}
            >
              {isLoggedIn ? t.logout : t.login}
            </button>

            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600">
              <span>{new Date().getFullYear()} • VIP DRAMAQ</span>
              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                {providerLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-3 rounded-2xl hover:bg-white/10 transition border border-transparent hover:border-white/10 flex items-center gap-3"
    >
      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <span className="text-lg">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-white font-black text-sm truncate">{title}</div>
        <div className="text-[11px] text-gray-500 truncate">{desc}</div>
      </div>

      <div className="text-gray-600">›</div>
    </button>
  );
}


export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[120px] opacity-40 bg-purple-700" />
      <div className="absolute top-24 left-16 w-[520px] h-[520px] rounded-full blur-[120px] opacity-30 bg-fuchsia-600" />
      <div className="absolute bottom-0 right-0 w-[720px] h-[720px] rounded-full blur-[140px] opacity-25 bg-indigo-700" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black" />
    </div>
  );
}
