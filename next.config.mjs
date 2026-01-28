/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ini biar Vercel GAK BANYAK PROTES soal warning
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;