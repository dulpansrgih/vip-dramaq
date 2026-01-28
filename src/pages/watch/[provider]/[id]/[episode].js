import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

export default function WatchPage() {
  const router = useRouter();
  const { provider, id, episode } = router.query;
  
  // --- STATE DATA ---
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  
  // --- STATE UI ---
  const [showDrawer, setShowDrawer] = useState(false); // Menu Episode
  const [showUI, setShowUI] = useState(true); // Overlay Kontrol
  const [isLocked, setIsLocked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoNextTimer, setAutoNextTimer] = useState(null); // Timer untuk Autoplay UI (Opsional)

  const videoRef = useRef(null);
  const uiTimer = useRef(null);

  // 1. Cek Login User
  useEffect(() => {
    const userStatus = localStorage.getItem('vip_user');
    setIsLoggedIn(userStatus === 'active');
  }, []);

  // 2. Fetch Data Episode
  useEffect(() => {
    if(!id) return;
    fetch(`https://api.sansekai.my.id/api/${provider}/allepisode?bookId=${id}`)
      .then(res => res.json())
      .then(data => setAllEpisodes(Array.isArray(data) ? data : (data.data || [])));
  }, [id, provider]);

  // 3. Logika Utama (Ganti Episode)
  useEffect(() => {
    if (allEpisodes.length > 0 && episode) {
        const epNum = parseInt(episode);
        
        // Cek Apakah Episode Terkunci?
        if (epNum > 3 && !isLoggedIn) {
            setIsLocked(true);
            setVideoUrl(''); 
            setShowLoginModal(true);
            return;
        }

        // Kalau Aman, Siapkan Video
        setIsLocked(false);
        const curr = allEpisodes[epNum - 1];
        if (curr) {
            if (curr.cdnList?.[0]?.videoPathList) {
                const qList = curr.cdnList[0].videoPathList;
                setQualities(qList);
                setVideoUrl(qList[0].videoPath);
                setCurrentQuality(qList[0].quality || 'HD');
            } else {
                setQualities([]);
                setVideoUrl(curr.videoUrl);
                setCurrentQuality('SD');
            }
        }
    }
  }, [episode, allEpisodes, isLoggedIn]);

  // --- LOGIKA AUTOPLAY (LANGSUNG LANJUT) ---
  const handleVideoEnd = () => {
    const currentEpNum = parseInt(episode);
    const nextEpNum = currentEpNum + 1;

    // Cek apakah masih ada episode selanjutnya?
    if (nextEpNum <= allEpisodes.length) {
        console.log("Lanjut ke Episode", nextEpNum);
        
        // Cek dulu apakah episode depan terkunci?
        if (nextEpNum > 3 && !isLoggedIn) {
             setShowLoginModal(true); // Munculin modal login jangan pindah dulu
             return;
        }

        // Kalau aman, langsung pindah!
        router.push(`/watch/${provider}/${id}/${nextEpNum}`);
    } else {
        console.log("Sudah episode terakhir");
    }
  };

  // --- KONTROL UI ---
  const activateUI = () => {
      setShowUI(true);
      if (uiTimer.current) clearTimeout(uiTimer.current);
      uiTimer.current = setTimeout(() => {
          if (isPlaying && !showDrawer) setShowUI(false); // Jangan hide kalau drawer buka
      }, 3000);
  };

  useEffect(() => {
      window.addEventListener('mousemove', activateUI);
      window.addEventListener('click', activateUI);
      return () => {
          window.removeEventListener('mousemove', activateUI);
          window.removeEventListener('click', activateUI);
          if (uiTimer.current) clearTimeout(uiTimer.current);
      };
  }, [isPlaying, showDrawer]);

  // Player Controls
  const togglePlay = () => {
      if (videoRef.current) {
          if (videoRef.current.paused) {
              videoRef.current.play();
              setIsPlaying(true);
          } else {
              videoRef.current.pause();
              setIsPlaying(false);
              setShowUI(true);
          }
      }
  };

  const skip = (sec) => {
      if (videoRef.current) {
          videoRef.current.currentTime += sec;
          activateUI();
      }
  };

  const changeSpeed = (rate) => {
      if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  return (
    <div className="bg-black h-screen w-screen overflow-hidden relative font-sans select-none">
      <Head><title>Nonton Ep {episode}</title></Head>

      {/* --- LAYER VIDEO --- */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-black" onClick={togglePlay}>
         {isLocked ? (
             <div className="text-center z-10 animate-fade-in">
                 <h2 className="text-3xl font-black text-red-600 mb-2">TERKUNCI 🔒</h2>
                 <p className="text-gray-400 mb-4">Eksklusif Member VIP</p>
                 <button onClick={()=>setShowLoginModal(true)} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Buka Akses</button>
             </div>
         ) : videoUrl ? (
            <video 
                ref={videoRef} 
                src={videoUrl} 
                autoPlay 
                onEnded={handleVideoEnd} // <--- INI PEMICU AUTOPLAY-NYA
                className="w-full h-full object-contain"
                onPlay={()=>setIsPlaying(true)}
                onPause={()=>setIsPlaying(false)}
            />
         ) : <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      {/* --- LAYER UI (OVERLAY) --- */}
      {!isLocked && (
        <div className={`absolute inset-0 z-40 transition-opacity duration-300 ${showUI ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            
            {/* GRADIENT SHADOW (Agar teks terbaca) */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 to-transparent"></div>

            {/* HEADER ATAS */}
            <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-start">
                <button onClick={() => router.back()} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-bold transition-all border border-white/10">
                    ✕
                </button>

                {/* AREA KANAN ATAS: TOMBOL LIST & KUALITAS */}
                <div className="flex flex-col gap-3 items-end">
                    <button 
                        onClick={() => setShowDrawer(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all border border-red-500"
                    >
                        <span>📚</span> DAFTAR EPISODE
                    </button>
                    
                    {/* Quality Selector */}
                    {qualities.length > 0 && (
                        <div className="group relative">
                            <button className="bg-black/60 backdrop-blur border border-white/20 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all">
                                {currentQuality} ▼
                            </button>
                            <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-col bg-black/90 border border-white/20 rounded-lg overflow-hidden min-w-[80px]">
                                {qualities.map((q, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => { setVideoUrl(q.videoPath); setCurrentQuality(q.quality); }}
                                        className="px-3 py-2 text-[10px] text-left hover:bg-red-600 text-white border-b border-white/5 last:border-0"
                                    >
                                        {q.quality}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TOMBOL PLAY TENGAH (Hanya muncul pas Pause) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlaying && (
                    <div className="w-20 h-20 bg-black/40 backdrop-blur rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                        <span className="text-3xl ml-1 text-white">▶</span>
                    </div>
                )}
            </div>

            {/* KONTROL BAWAH */}
            <div className="absolute bottom-0 w-full p-6 pb-10 flex flex-col items-center gap-6">
                
                {/* 1. Tombol Navigasi Utama */}
                <div className="flex items-center gap-8 md:gap-12">
                    <button onClick={()=>skip(-10)} className="group flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors">
                        <span className="text-2xl rotate-180">↺</span>
                        <span className="text-[10px] font-bold">-10s</span>
                    </button>

                    <button onClick={togglePlay} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <span className="text-2xl font-black ml-1">{isPlaying ? '⏸' : '▶'}</span>
                    </button>

                    <button onClick={()=>skip(10)} className="group flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors">
                        <span className="text-2xl">↻</span>
                        <span className="text-[10px] font-bold">+10s</span>
                    </button>
                </div>

                {/* 2. Speed Control (Pill Shape) */}
                <div className="flex gap-1 bg-black/60 backdrop-blur rounded-full p-1 border border-white/10">
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map(rate => (
                        <button 
                            key={rate}
                            onClick={() => changeSpeed(rate)}
                            className="px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 hover:bg-white/20 hover:text-white transition-all focus:bg-white focus:text-black outline-none"
                        >
                            {rate}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* --- DRAWER DAFTAR EPISODE (SLIDE IN) --- */}
      {/* Tetap ada di DOM, cuma di-hide pakai CSS transform biar ringan */}
      <div className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-[#111]/95 backdrop-blur-2xl border-l border-white/10 z-[60] transform transition-transform duration-300 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]/50">
              <div>
                  <h3 className="font-bold text-base text-white">Daftar Episode</h3>
                  <p className="text-[10px] text-gray-500 tracking-wider uppercase mt-0.5">{allEpisodes.length} Episode • {isLoggedIn ? 'VIP ACCESS' : 'FREE MODE'}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="w-8 h-8 flex items-center justify-center bg-[#222] rounded-full text-gray-400 hover:bg-white hover:text-black transition-all">✕</button>
          </div>
          
          <div className="p-3 grid grid-cols-5 gap-3 overflow-y-auto h-full pb-24 content-start custom-scrollbar">
              {allEpisodes.map((ep, idx) => {
                  const num = idx + 1;
                  const isActive = parseInt(episode) === num;
                  const isEpLocked = num > 3 && !isLoggedIn;
                  
                  return (
                    <button 
                        key={idx} 
                        onClick={() => {
                            if(isEpLocked) { setShowLoginModal(true); setShowDrawer(false); }
                            else { 
                                // APPLY LANGSUNG (TANPA RELOAD PAGE YANG BERAT)
                                router.push(`/watch/${provider}/${id}/${num}`); 
                                // Opsional: setShowDrawer(false); // Kalau mau nutup drawer pas diklik, uncomment ini
                            }
                        }}
                        className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative border group
                            ${isActive 
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)] scale-105 z-10' 
                                : isEpLocked 
                                    ? 'bg-[#151515] border-transparent text-gray-600 cursor-not-allowed' 
                                    : 'bg-[#222] border-transparent text-gray-400 hover:bg-[#333] hover:text-white hover:border-white/20'}
                        `}
                    >
                        {isEpLocked ? (
                            <span className="text-lg">🔒</span>
                        ) : (
                            <>
                                <span className="z-10">{num}</span>
                                {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>}
                            </>
                        )}
                    </button>
                  )
              })}
          </div>
      </div>

      {/* --- MODAL LOGIN (POPUP) --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#161616] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl transform scale-100 transition-all">
                <div className="text-5xl mb-4 animate-bounce">💎</div>
                <h2 className="text-2xl font-black text-white mb-2">Akses VIP Diperlukan</h2>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    Episode 4 ke atas dikunci khusus untuk member VIP. <br/>
                    <span className="text-red-500 font-bold">Login Gratis</span> sekarang juga!
                </p>
                <button 
                    onClick={() => {
                        localStorage.setItem('vip_user', 'active');
                        setIsLoggedIn(true);
                        setShowLoginModal(false);
                        // Refresh halaman biar gemboknya hilang
                        window.location.reload(); 
                    }} 
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 py-4 rounded-xl font-bold text-white mb-4 hover:scale-105 transition-transform shadow-lg"
                >
                    MASUK SEKARANG (GRATIS)
                </button>
                <button onClick={()=>setShowLoginModal(false)} className="text-gray-500 text-xs hover:text-white tracking-widest uppercase font-bold">Nanti Saja</button>
            </div>
        </div>
      )}

    </div>
  );
}