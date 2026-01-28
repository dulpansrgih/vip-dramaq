import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PROVIDERS } from '../utils/providers';

// --- CONFIG API ---
const API_BASE = 'https://api.sansekai.my.id/api';

const ENDPOINTS = {
  // Format: [Homepage Endpoint, Search Endpoint]
  dramabox: ['vip', 'search'],
  reelshort: ['homepage', 'search'],
  netshort: ['theaters', 'search'],
  melolo: ['latest', 'search'],
  flickreels: ['latest', 'search'],
  freereels: ['homepage', 'search'],
  moviebox: ['homepage', 'search'],
  komik: ['recommended?type=manhwa', 'search'],
  anime: ['latest', 'search'] 
};

// --- KAMUS BAHASA ---
const TRANSLATIONS = {
  id: {
    home: "Beranda", film: "Film (Movie)", terms: "Syarat & Ketentuan", privacy: "Kebijakan Privasi",
    about: "Tentang Kami", contact: "Hubungi Kami", login: "Masuk / Daftar", logout: "Keluar",
    search: "Cari judul...", trending: "SEDANG HANGAT", latest: "Terbaru di", result: "Hasil Pencarian:",
    member: "Member VIP", guest: "Tamu", status_vip: "Premium Aktif", status_free: "Gratis (Terbatas)",
    welcome_login: "Login Berhasil! Nikmati akses penuh.", welcome_logout: "Anda berhasil keluar.",
    menu: "MENU UTAMA", not_found: "Tidak ada hasil ditemukan untuk"
  },
  en: {
    home: "Home", film: "Movies", terms: "Terms & Conditions", privacy: "Privacy Policy",
    about: "About Us", contact: "Contact Us", login: "Login / Register", logout: "Logout",
    search: "Search title...", trending: "TRENDING NOW", latest: "Latest on", result: "Search Result:",
    member: "VIP Member", guest: "Guest", status_vip: "Premium Active", status_free: "Free (Limited)",
    welcome_login: "Login Success! Enjoy full access.", welcome_logout: "You have logged out.",
    menu: "MAIN MENU", not_found: "No results found for"
  }
};

export default function Home() {
  const router = useRouter();
  
  // --- STATE ---
  const [dramas, setDramas] = useState([]); // List Drama (Bisa isi Homepage atau Hasil Search)
  const [activeProvider, setActiveProvider] = useState('dramabox');
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState(''); // Apa yang diketik user
  const [isSearching, setIsSearching] = useState(false); // Mode Pencarian Aktif?
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState('id');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const t = TRANSLATIONS[lang];

  // Cek Login
  useEffect(() => {
    const userStatus = localStorage.getItem('vip_user');
    if (userStatus === 'active') setIsLoggedIn(true);
  }, []);

  // --- FUNGSI PENGOLAH DATA (NORMALIZER) ---
  const normalizeData = (data) => {
    let allBooks = [];
    if (Array.isArray(data.data)) allBooks = data.data;
    else if (data.data?.moduleList) data.data.moduleList.forEach(m => { if (m.bookList) allBooks.push(...m.bookList); });
    else if (data.data?.bookList) allBooks = data.data.bookList;
    else if (data.columnVoList?.[0]?.bookList) allBooks = data.columnVoList[0].bookList;
    else if (Array.isArray(data)) allBooks = data;

    // Filter data sampah & Pastikan ada ID
    return allBooks.filter(i => (i.cover || i.coverWap) && (i.bookId || i.book_id));
  };

  // --- FETCH DATA (HOMEPAGE) ---
  const fetchHomepage = () => {
    setLoading(true);
    setIsSearching(false); // Matikan mode cari
    const endpoint = ENDPOINTS[activeProvider][0] || 'vip'; // Ambil endpoint homepage

    fetch(`${API_BASE}/${activeProvider}/${endpoint}`)
      .then(res => res.json())
      .then(data => {
        const cleanList = normalizeData(data);
        setDramas(cleanList);
        if(cleanList.length > 0) setFeatured(cleanList[Math.floor(Math.random() * cleanList.length)]);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  // --- FETCH DATA (PENCARIAN REAL) ---
  const handleSearch = (e) => {
    if (e) e.preventDefault(); // Mencegah reload form
    if (!searchTerm.trim()) {
        fetchHomepage(); // Kalau kosong, balik ke homepage
        return;
    }

    setLoading(true);
    setIsSearching(true); // Nyalakan mode cari
    setFeatured(null); // Sembunyikan banner saat mencari

    // API CALL KE SEARCH ENDPOINT
    // Pola umum: /search?keyword=katakunci
    const searchPath = ENDPOINTS[activeProvider][1] || 'search';
    
    fetch(`${API_BASE}/${activeProvider}/${searchPath}?keyword=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(data => {
        const cleanList = normalizeData(data);
        setDramas(cleanList);
        setLoading(false);
      })
      .catch(err => {
          console.error("Search Error:", err);
          setDramas([]);
          setLoading(false);
      });
  };

  // Panggil Homepage saat pertama buka / ganti provider
  useEffect(() => {
    setSearchTerm(''); // Reset kotak cari
    fetchHomepage();
  }, [activeProvider]);

  // Handle Login
  const confirmLogin = () => {
      localStorage.setItem('vip_user', 'active');
      setIsLoggedIn(true);
      setShowLoginModal(false);
      alert(t.welcome_login);
  };
  const handleAuth = () => {
    if (isLoggedIn) { localStorage.removeItem('vip_user'); setIsLoggedIn(false); alert(t.welcome_logout); } 
    else { setShowLoginModal(true); }
    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-white pb-24 transition-all duration-300 font-sans ${isSidebarOpen ? '-ml-64' : 'ml-0'}`}>
      <Head><title>VIP DramaQ - {activeProvider.toUpperCase()}</title></Head>

      {/* --- SIDEBAR --- */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-[#111] border-l border-white/10 z-[60] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-primary">{t.menu}</h2>
                  <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                      <button onClick={()=>setLang('id')} className={`px-2 py-1 text-xs font-bold rounded ${lang==='id'?'bg-white text-black':'text-gray-500'}`}>ID</button>
                      <button onClick={()=>setLang('en')} className={`px-2 py-1 text-xs font-bold rounded ${lang==='en'?'bg-white text-black':'text-gray-500'}`}>EN</button>
                  </div>
              </div>
              <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-rose-600 shadow-lg"></div>
                  <div>
                      <p className="text-sm font-bold text-white">{isLoggedIn ? t.member : t.guest}</p>
                      <p className="text-[10px] text-gray-400">{isLoggedIn ? t.status_vip : t.status_free}</p>
                  </div>
              </div>
              <ul className="space-y-4 text-sm font-medium text-gray-400 flex-1">
                  <li onClick={()=>{setIsSidebarOpen(false); fetchHomepage();}} className="hover:text-white cursor-pointer flex gap-3 p-2 rounded hover:bg-white/5">🏠 {t.home}</li>
                  <li onClick={()=>router.push('/info?page=terms')} className="hover:text-white cursor-pointer flex gap-3 p-2 rounded hover:bg-white/5">📜 {t.terms}</li>
                  <li onClick={()=>router.push('/info?page=about')} className="hover:text-white cursor-pointer flex gap-3 p-2 rounded hover:bg-white/5">ℹ️ {t.about}</li>
              </ul>
              <button onClick={handleAuth} className={`mt-4 w-full py-3 rounded-lg font-bold text-white ${isLoggedIn ? 'bg-red-900 border border-red-600' : 'bg-primary'}`}>{isLoggedIn ? t.logout : t.login}</button>
          </div>
      </div>
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-[55] backdrop-blur-sm"></div>}

      {/* --- NAVBAR --- */}
      <div className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-lg border-b border-white/5 pt-4 pb-2 shadow-sm">
        <div className="px-4 flex items-center justify-between mb-3 gap-4">
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-1 cursor-pointer" onClick={()=>{setActiveProvider('dramabox');fetchHomepage()}}>
                <span className="text-primary text-2xl">▶</span>VIP<span className="text-white">DRAMA</span>
            </h1>

            {/* SEARCH BAR AKTIF (FORM) */}
            <div className="flex items-center gap-3 flex-1 justify-end">
                <form onSubmit={handleSearch} className={`transition-all duration-300 overflow-hidden ${isSearchVisible ? 'w-full max-w-[200px] opacity-100' : 'w-0 opacity-0'}`}>
                    <input 
                        type="text" 
                        placeholder={t.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#222] border border-white/10 text-white text-xs px-3 py-1.5 rounded-full w-full focus:outline-none focus:border-primary placeholder-gray-600"
                    />
                </form>
                <button onClick={() => { 
                    if(isSearchVisible && searchTerm) handleSearch(); // Kalau tombol diklik & ada teks, cari
                    else setIsSearchVisible(!isSearchVisible); // Kalau kosong, toggle buka/tutup
                }} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isSearchVisible ? 'bg-primary text-white shadow-lg' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}>🔍</button>
                <button onClick={() => setIsSidebarOpen(true)} className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1a1a1a] text-white">☰</button>
            </div>
        </div>

        <div className="px-4 overflow-x-auto scrollbar-hide flex gap-2 pb-2">
            {PROVIDERS.map(p => (
                <button 
                    key={p.id} onClick={() => setActiveProvider(p.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeProvider === p.id 
                        ? 'bg-primary border-primary text-white shadow-lg scale-105' 
                        : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                >
                    {p.name}
                </button>
            ))}
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="pt-36 px-4">
        
        {/* HERO BANNER (Hilang kalau sedang Searching) */}
        {!loading && featured && !isSearching && (
            <Link href={`/drama/${activeProvider}/${featured.bookId || featured.book_id}`}>
                <div className="relative w-full aspect-[21/10] md:aspect-[21/8] rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl group cursor-pointer">
                    <img src={featured.coverWap || featured.cover} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                    <div className="absolute bottom-5 left-5 max-w-[85%] z-10">
                        <span className="bg-primary text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">{t.trending}</span>
                        <h2 className="text-2xl md:text-4xl font-black leading-tight text-white drop-shadow-lg mb-2 line-clamp-2">{featured.bookName || featured.title}</h2>
                    </div>
                </div>
            </Link>
        )}

        {/* HEADER LIST */}
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span className={`w-1 h-5 rounded-full ${isSearching ? 'bg-blue-500' : 'bg-primary'}`}></span>
            {isSearching ? `${t.result} "${searchTerm}"` : `${t.latest} ${PROVIDERS.find(p=>p.id===activeProvider)?.name}`}
        </h3>

        {/* LOADING STATE */}
        {loading && (
            <div className="grid grid-cols-3 gap-3 animate-pulse">
                {[...Array(9)].map((_,i) => <div key={i} className="aspect-[3/4.2] bg-[#1a1a1a] rounded-xl border border-white/5"></div>)}
            </div>
        )}

        {/* DATA GRID */}
        {!loading && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 gap-y-6">
                {dramas.map((item, idx) => (
                    <Link href={`/drama/${activeProvider}/${item.bookId || item.book_id}`} key={idx}>
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-[#161616] mb-2 shadow-lg border border-white/5 group-hover:border-primary/50 transition-all duration-300">
                                <img src={item.coverWap || item.cover} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>
                                {/* Label Top hanya di Homepage */}
                                {idx < 3 && !isSearching && <div className="absolute top-0 right-0 bg-primary text-[9px] font-bold px-2 py-1 rounded-bl-lg shadow-lg">TOP {idx+1}</div>}
                            </div>
                            <h4 className="text-[11px] font-medium text-gray-300 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                                {item.bookName || item.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>
        )}
        
        {/* EMPTY STATE (Hasil Pencarian Kosong) */}
        {!loading && dramas.length === 0 && (
            <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl mt-4">
                <div className="text-4xl mb-2">🤔</div>
                <p className="mb-2">{isSearching ? `${t.not_found} "${searchTerm}"` : "Tidak ada konten."}</p>
                {isSearching && <button onClick={fetchHomepage} className="text-primary text-xs underline font-bold">Kembali ke Beranda</button>}
            </div>
        )}
      </div>

      {/* --- MODAL LOGIN --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={()=>setShowLoginModal(false)}></div>
            <div className="relative bg-[#161616] border border-white/10 w-full max-w-sm p-6 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-black text-white text-center mb-6">VIP ACCESS</h2>
                <input type="email" placeholder="Email" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-3" />
                <input type="password" placeholder="Password" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-6" />
                <button onClick={confirmLogin} className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-lg">MASUK SEKARANG</button>
            </div>
        </div>
      )}
    </div>
  );
}