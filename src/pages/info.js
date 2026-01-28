import { useRouter } from "next/router";
import Head from "next/head";

const CONTENT = {
  terms: {
    title: "Syarat & Ketentuan",
    body: `
1. **Penggunaan**: Layanan ini hanya untuk hiburan pribadi.
2. **Akun**: Dilarang membagikan akun VIP kepada orang lain.
3. **Konten**: Hak cipta konten sepenuhnya milik provider penyedia.
4. **Larangan**: Dilarang keras mengunduh dan menyebarluaskan video.
    `,
  },
  privacy: {
    title: "Kebijakan Privasi",
    body: `
Kami menghargai privasi Anda. Data login hanya disimpan di browser Anda (LocalStorage) 
dan tidak dikirim ke server manapun dalam versi demo ini. Kami tidak melacak lokasi Anda.
    `,
  },
  about: {
    title: "Tentang VIP DramaQ",
    body: `
VIP DramaQ adalah platform streaming drama pendek vertikal (Short Drama) nomor 1 di Indonesia.
Kami menyajikan ribuan judul dari berbagai provider seperti DramaBox, ReelShort, dan lainnya
dalam satu aplikasi yang ringan dan cepat.

**Versi:** 2.5.0 (Premium Build)  
**Developer:** Dulpan Adi Saragih
    `,
  },
};

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Minimal markdown: **bold**, line breaks, numbered list
function mdToHtml(md) {
  const raw = (md || "").trim().replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  const out = [];
  let inOl = false;

  const flushOl = () => {
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  const bold = (txt) =>
    txt.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  for (const l of lines) {
    const line = l.trimEnd();

    // empty line
    if (!line.trim()) {
      flushOl();
      out.push(`<div class="h-3"></div>`);
      continue;
    }

    const m = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (m) {
      if (!inOl) {
        inOl = true;
        out.push(`<ol class="list-decimal pl-6 space-y-2">`);
      }
      const item = bold(escapeHtml(m[2]));
      out.push(`<li>${item}</li>`);
      continue;
    }

    flushOl();

    // convert explicit double-space linebreak (markdown)
    const safe = escapeHtml(line).replace(/  $/, "<br/>");
    out.push(`<p>${bold(safe)}</p>`);
  }

  flushOl();
  return out.join("\n");
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[11px] font-black border transition shrink-0 ${
        active
          ? "bg-white text-black border-white shadow-[0_0_18px_rgba(255,255,255,0.18)]"
          : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

export default function InfoPage() {
  const router = useRouter();
  const page = (router.query.page || "about").toString();
  const key = CONTENT[page] ? page : "about";
  const data = CONTENT[key];

  const go = (next) => {
    router.push(
      { pathname: "/info", query: { page: next } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden">
      <Head>
        <title>{data.title}</title>
      </Head>

      {/* Background (match app vibe) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[120px] opacity-35 bg-purple-700" />
        <div className="absolute top-24 left-16 w-[520px] h-[520px] rounded-full blur-[120px] opacity-25 bg-fuchsia-600" />
        <div className="absolute bottom-0 right-0 w-[720px] h-[720px] rounded-full blur-[140px] opacity-20 bg-indigo-700" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black" />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="bg-[#0c0c0c]/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                aria-label="Back"
                title="Back"
              >
                ✕
              </button>

              <div className="min-w-0">
                <div className="text-white font-black tracking-widest text-sm truncate">
                  {data.title}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  VIP DRAMAQ • Information
                </div>
              </div>

              <div className="flex-1" />

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-black">
                {key.toUpperCase()}
              </span>
            </div>

            {/* Tabs */}
            <div className="px-4 pb-3">
              <div className="overflow-x-auto scrollbar-hide flex gap-2 whitespace-nowrap">
                <TabButton active={key === "about"} onClick={() => go("about")}>
                  About
                </TabButton>
                <TabButton active={key === "terms"} onClick={() => go("terms")}>
                  Terms
                </TabButton>
                <TabButton active={key === "privacy"} onClick={() => go("privacy")}>
                  Privacy
                </TabButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-[132px] md:pt-[140px] pb-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl bg-white/[0.04] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-6 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-7 bg-gradient-to-b from-primary to-fuchsia-500 rounded-full" />
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  {data.title}
                </h1>
              </div>
              <div className="text-[11px] text-gray-500 mt-2">
                Bacaan singkat, jelas, dan rapi.
              </div>
            </div>

            <div className="px-6 py-6">
              <div
                className="prose prose-invert max-w-none text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mdToHtml(data.body) }}
              />
            </div>

            <div className="px-6 py-5 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] text-gray-600">
                © {new Date().getFullYear()} VIP DramaQ
              </div>
              <button
                onClick={() => router.push("/")}
                className="text-[11px] font-black px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Kembali ke Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
