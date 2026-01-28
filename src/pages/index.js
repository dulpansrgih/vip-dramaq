import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PROVIDERS } from '../utils/providers';

export default function Home() {
  const [dramas, setDramas] = useState([]);
  const [activeProvider, setActiveProvider] = useState('dramabox'); // Default pilih DramaBox

  useEffect(() => {
    setDramas([]); // Kosongkan layar saat ganti provider (loading effect)
    
    // Ambil data dari API Sansekai sesuai provider yang dipilih
    fetch(`https://api.sansekai.my.id/api/${activeProvider}/vip`)
      .then(res => res.json())
      .then(data => {
        // Logika agar data tetap tampil meski struktur API kadang beda dikit
        if (data.columnVoList && data.columnVoList[0]) {
            setDramas(data.columnVoList[0].bookList);
        } else if (data.data) {
            setDramas(data.data);
        }
      })
      .catch(err => console.error("Gagal ambil data:", err));
  }, [activeProvider]);

  return (
    <div className="min-h-screen pb-20 px-4 pt-4">
      
      {/* HEADER & MENU PROVIDER (Sticky di Atas) */}
      <div className="sticky top-0 bg-[#0f1014]/95 backdrop-blur-md z-50 pb-4 pt-2 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 uppercase italic tracking-tighter">
                VIP-DramaQ
            </h1>
        </div>

        {/* Tombol Pilihan Aplikasi (Scroll Samping) */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {PROVIDERS.map((provider) => (
                <button
                    key={provider.id}
                    onClick={() => setActiveProvider(provider.id)}
                    className={`
                        px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                        ${activeProvider === provider.id 
                            ? 'bg-white text-black shadow-lg scale-105' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
                    `}
                >
                    {provider.name}
                </button>
            ))}
        </div>
      </div>

      {/* JUDUL SEKSI */}
      <h2 className="text-lg font-bold mb-4 mt-4 text-gray-200 flex items-center gap-2">
        🔥 Sedang Tren di <span className="text-pink-500">{PROVIDERS.find(p => p.id === activeProvider)?.name}</span>
      </h2>
      
      {/* GRID POSTER DRAMA */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {dramas.map((item) => (
          // Link menuju halaman detail (kita buat nanti)
          <Link href={`/drama/${activeProvider}/${item.bookId}`} key={item.bookId}>
            <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-300">
              
              {/* Gambar Poster */}
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 relative shadow-lg">
                <img 
                  src={item.coverWap || item.cover} 
                  alt={item.bookName} 
                  className="w-full h-full object-cover"
                />
                
                {/* Badge Overlay (Opsional) */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
              </div>

              {/* Judul Film */}
              <p className="mt-2 text-xs md:text-sm font-medium line-clamp-2 text-gray-300 group-hover:text-pink-400 transition-colors">
                {item.bookName || item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Loading State */}
      {dramas.length === 0 && (
          <div className="mt-20 text-center text-gray-500 animate-pulse">
              Sedang mengambil data dari {activeProvider}...
          </div>
      )}
    </div>
  );
}