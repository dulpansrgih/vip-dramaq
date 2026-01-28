import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FilmPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pt-20">
      <Head><title>Koleksi Film</title></Head>
      
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md p-4 border-b border-white/10 z-50 flex items-center gap-4">
          <button onClick={()=>router.back()} className="text-2xl">←</button>
          <h1 className="text-xl font-bold">Koleksi Film Layar Lebar</h1>
      </div>

      <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">Segera Hadir!</h2>
          <p className="text-gray-400 max-w-xs mx-auto mb-6">
              Kami sedang menyiapkan ribuan koleksi film box office terbaru untuk Anda.
          </p>
          <button onClick={()=>router.push('/')} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold">
              Kembali ke Drama
          </button>
      </div>
    </div>
  );
}