import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Kita pasang Font Inter disini biar Global CSS bersih */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased bg-[#050505] text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}