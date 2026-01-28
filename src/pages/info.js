import { useRouter } from 'next/router';
import Head from 'next/head';

const CONTENT = {
  terms: {
    title: "Syarat & Ketentuan",
    body: `
      1. **Penggunaan**: Layanan ini hanya untuk hiburan pribadi.
      2. **Akun**: Dilarang membagikan akun VIP kepada orang lain.
      3. **Konten**: Hak cipta konten sepenuhnya milik provider penyedia.
      4. **Larangan**: Dilarang keras mengunduh dan menyebarluaskan video.
    `
  },
  privacy: {
    title: "Kebijakan Privasi",
    body: `
      Kami menghargai privasi Anda. Data login hanya disimpan di browser Anda (LocalStorage) 
      dan tidak dikirim ke server manapun dalam versi demo ini. Kami tidak melacak lokasi Anda.
    `
  },
  about: {
    title: "Tentang VIP DramaQ",
    body: `
      VIP DramaQ adalah platform streaming drama pendek vertikal (Short Drama) nomor 1 di Indonesia.
      Kami menyajikan ribuan judul dari berbagai provider seperti DramaBox, ReelShort, dan lainnya
      dalam satu aplikasi yang ringan dan cepat.
      
      **Versi:** 2.5.0 (Premium Build)
      **Developer:** Dulpan Adi Saragih
    `
  }
};

export default function InfoPage() {
  const router = useRouter();
  const { page } = router.query;
  const data = CONTENT[page] || CONTENT['about'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 px-6 font-sans">
      <Head><title>{data.title}</title></Head>

      <div className="fixed top-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md p-4 border-b border-white/10 z-50 flex items-center gap-4">
          <button onClick={()=>router.back()} className="text-xl font-bold text-gray-400 hover:text-white">✕ Tutup</button>
      </div>

      <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-red-600 mb-6">{data.title}</h1>
          <div className="prose prose-invert text-gray-300 leading-relaxed whitespace-pre-line">
              {data.body}
          </div>
          
          <div className="mt-10 pt-10 border-t border-white/10 text-center text-xs text-gray-600">
              © 2024 VIP DramaQ Inc. All rights reserved.
          </div>
      </div>
    </div>
  );
}