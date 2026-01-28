import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DramaDetail() {
  const router = useRouter();
  const { provider, id } = router.query;
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!id || !provider) return;

    fetch(`https://api.sansekai.my.id/api/${provider}/detail?bookId=${id}`)
      .then(res => res.json())
      .then(data => {
         // Ambil data dari field 'data', atau langsung jika tidak ada bungkusnya
         setDetail(data.data || data); 
      })
      .catch(err => console.error(err));
  }, [id, provider]);

  if (!detail) return (
    <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-gray-500">
        Sedang memuat...
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1014] text-white">
        
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
            <img src={detail.coverWap || detail.cover} className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/90 to-transparent"></div>
        </div>

        {/* Konten Utama */}
        <div className="relative z-10 px-4 pt-6 max-w-lg mx-auto flex flex-col items-center pb-20">
            
            {/* Tombol Back */}
            <button onClick={() => router.back()} className="self-start mb-6 text-gray-300 hover:text-white flex items-center gap-2">
                ◀ Kembali
            </button>

            {/* Poster */}
            <div className="w-48 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
                <img src={detail.coverWap || detail.cover} alt={detail.bookName} className="w-full" />
            </div>
            
            {/* Judul */}
            <h1 className="text-2xl font-bold mt-6 text-center">{detail.bookName || detail.title}</h1>
            
            {/* Info */}
            <div className="flex gap-2 mt-4 text-xs text-gray-400">
                <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                    {detail.chapterCount ? `${detail.chapterCount} Episode` : 'Serial'}
                </span>
                <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">HD</span>
            </div>

            {/* TOMBOL NONTON (Link ke Player) */}
            <Link href={`/watch/${provider}/${id}/1`} className="w-full">
                <button className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-transform">
                    ▶ Mulai Nonton
                </button>
            </Link>

            {/* Sinopsis */}
            <div className="mt-8 text-sm text-gray-400 leading-relaxed text-center px-2">
                {detail.introduction || "Sinopsis tidak tersedia."}
            </div>
        </div>
    </div>
  );
}