import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function WatchPage() {
  const router = useRouter();
  const { provider, id, episode } = router.query;
  const [videoUrl, setVideoUrl] = useState('');
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null); // Referensi ke player video

  // 1. Ambil Semua Episode
  useEffect(() => {
    if(!id || !provider) return;

    fetch(`https://api.sansekai.my.id/api/${provider}/allepisode?bookId=${id}`)
      .then(res => res.json())
      .then(data => {
         // Data kadang dibungkus 'data', kadang langsung array. Kita handle keduanya.
         const episodes = Array.isArray(data) ? data : (data.data || []);
         setAllEpisodes(episodes);
         setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id, provider]);

  // 2. Cari Video URL (Logika Baru Bedah Struktur)
  useEffect(() => {
    if (allEpisodes.length > 0 && episode) {
        
        // Cari episode berdasarkan index (Episode 1 = Index 0)
        // Kita kurangi 1 karena array mulai dari 0
        const index = parseInt(episode) - 1;
        const currentEp = allEpisodes[index];

        if (currentEp && currentEp.cdnList && currentEp.cdnList.length > 0) {
            // AMBIL VIDEO DARI DALAM PERUT DATA
            // Kita coba ambil dari CDN pertama, lalu cari kualitas terbaik
            const videoList = currentEp.cdnList[0].videoPathList;
            
            if (videoList && videoList.length > 0) {
                // Ambil video pertama (biasanya kualitas tertinggi)
                setVideoUrl(videoList[0].videoPath);
            }
        }
    }
  }, [episode, allEpisodes]);

  // 3. Reset Player saat ganti episode
  useEffect(() => {
    if(videoRef.current) {
        videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans">
      
      {/* HEADER NAVIGASI */}
      <div className="bg-[#0f1014] p-4 flex items-center gap-4 border-b border-gray-800">
        <button 
            onClick={() => router.back()} 
            className="text-gray-400 hover:text-white font-bold"
        >
            ✕ KEMBALI
        </button>
        <h1 className="text-white font-bold truncate">Nonton Episode {episode}</h1>
      </div>

      {/* VIDEO PLAYER AREA */}
      <div className="w-full bg-black sticky top-0 z-50 shadow-2xl">
        <div className="relative w-full aspect-[9/16] md:aspect-video mx-auto max-w-4xl">
            {videoUrl ? (
                <video 
                    ref={videoRef}
                    controls 
                    autoPlay 
                    className="w-full h-full bg-black"
                    poster="https://via.placeholder.com/1280x720/000000/FFFFFF?text=Memuat+Film..."
                >
                    <source src={videoUrl} type="video/mp4" />
                    Browser Anda tidak mendukung video.
                </video>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-4"></div>
                    <p>{loading ? "Sedang mengambil data..." : "Video tidak ditemukan :("}</p>
                </div>
            )}
        </div>
      </div>

      {/* DAFTAR EPISODE (GRID) */}
      <div className="flex-1 bg-[#0f1014] p-4 pb-20">
        <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">
            Pilih Episode ({allEpisodes.length})
        </h3>
        
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {allEpisodes.map((ep, idx) => {
                const nomerEp = idx + 1; // Kita pakai urutan array + 1
                const isActive = parseInt(episode) === nomerEp;

                return (
                    <Link 
                        key={ep.chapterId || idx} 
                        href={`/watch/${provider}/${id}/${nomerEp}`}
                    >
                        <div className={`
                            aspect-square flex items-center justify-center rounded-lg text-sm font-bold cursor-pointer transition-all
                            ${isActive 
                                ? 'bg-gradient-to-br from-pink-600 to-purple-700 text-white shadow-lg scale-105 border border-white/20' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
                        `}>
                            {nomerEp}
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>
    </div>
  );
}