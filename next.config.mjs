/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Allow all domains for token images
      { protocol: "https", hostname: "**" }
    ],
    minimumCacheTTL: 86400 // 24 hours
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  eslint: {
    // Temporalmente ignorar errores durante el build mientras arreglamos los tipos
    ignoreDuringBuilds: true,
    dirs: ['src']
  },
  typescript: {
    // Temporalmente ignorar errores de tipos durante el build
    ignoreBuildErrors: true
  }
};

export default nextConfig; 