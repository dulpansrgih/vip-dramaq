import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function DramaDetail() {
  const router = useRouter();
  const { provider, id } = router.query;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://api.sansekai.my.id/api/${provider}/detail?bookId=${id}`)
      .then(res => res.json())
      .then(data => {
        setDetail(data.data || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, provider]);

  if (loading || !detail) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white overflow-x-hidden relative">
      <Head><title>{detail.bookName || "Detail Film"}</title></Head>

      {/* --- TOMBOL BACK (FIXED & JELAS) --- */}
      {/* Z-Index 100 biar selalu paling atas */}
      <div className="fixed top-0 left-0 w-full p-4 md:p-6 z-[100] pointer-events-none">
          <button 
            onClick={() => router.back()} 
            className="pointer-events-auto w-12 h-12 bg-black/60 hover:bg-primary backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all group"
          >
              <span className="group-hover:-translate-x-1 transition-transform text-xl font-bold">←</span>
          </button>
      </div>

      {/* --- BACKGROUND GLOW --- */}
      <div className="fixed inset-0 z-0">
          <img 
            src={detail.coverWap || detail.cover} 
            className="w-full h-full object-cover opacity-20 blur-[80px]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-[#050505]/50"></div>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center min-h-[90vh] pt-20 md:pt-12">
          
          {/* KOLOM KIRI: POSTER */}
          <div className="w-full md:w-[350px] flex-shrink-0 md:sticky md:top-10">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(229,9,20,0.2)] border border-white/10 group">
                  <img src={detail.coverWap || detail.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  
                  {/* Badge Status */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">VIP</span>
                    <span className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">HD</span>
                  </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 bg-white/5 border border-white/5 p-3 rounded-xl text-center backdrop-blur-sm">
                  <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Rating</p>
                      <p className="font-bold text-yellow-400">9.8</p>
                  </div>
                  <div className="border-l border-white/10">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Episode</p>
                      <p className="font-bold text-white">{detail.chapterCount || "?"}</p>
                  </div>
                  <div className="border-l border-white/10">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tahun</p>
                      <p className="font-bold text-white">2024</p>
                  </div>
              </div>
          </div>

          {/* KOLOM KANAN: DETAIL INFO */}
          <div className="flex-1 w-full">
              
              <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-3 mb-2 text-xs md:text-sm text-gray-400 font-medium">
                      <span className="text-primary font-bold tracking-wider">SERIES BARU</span>
                      <span>•</span>
                      <span>Romance</span>
                      <span>•</span>
                      <span>Drama</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white mb-4 drop-shadow-2xl">
                      {detail.bookName || detail.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                      {detail.tags?.map((tag, i) => (
                          <span key={i} className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-300 hover:text-white hover:border-primary transition-colors cursor-default">
                              #{tag}
                          </span>
                      )) || <span className="text-[11px] text-gray-500 italic">#DramaViral</span>}
                  </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href={`/watch/${provider}/${id}/1`} className="flex-1">
                      <button className="w-full py-4 bg-gradient-to-r from-primary to-rose-700 rounded-xl font-bold text-lg text-white shadow-[0_0_25px_rgba(229,9,20,0.4)] hover:shadow-[0_0_40px_rgba(229,9,20,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                          <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs pl-0.5">▶</span>
                          MULAI NONTON
                      </button>
                  </Link>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 justify-center">
                      <span>+</span>
                  </button>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 justify-center">
                      <span>↗</span>
                  </button>
              </div>

              {/* Sinopsis Box */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded-full"></span>
                      Sinopsis Cerita
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base text-justify">
                      {detail.introduction || "Sinopsis belum tersedia untuk drama ini. Namun jangan khawatir, drama ini telah dikurasi sebagai salah satu tontonan terbaik minggu ini. Nikmati alur cerita yang penuh kejutan dan emosi."}
                  </p>
              </div>

              {/* Info Tambahan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Pemeran Utama</h4>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full border border-white/10"></div>
                          <div className="w-10 h-10 bg-gray-700 rounded-full border border-white/10"></div>
                          <div className="w-10 h-10 bg-gray-700 rounded-full border border-white/10"></div>
                          <span className="text-xs text-gray-500 italic">+ Lainnya</span>
                      </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detail Produksi</h4>
                      <p className="text-xs text-gray-300">Studio: <span className="text-white font-bold">VIP Original</span></p>
                      <p className="text-xs text-gray-300 mt-1">Negara: <span className="text-white font-bold">China / Global</span></p>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
}