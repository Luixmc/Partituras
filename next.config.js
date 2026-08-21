/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite compilar en OTRA carpeta sin pisar el `.next` que está usando el
  // servidor de desarrollo. Compilar encima de él lo deja roto ("Cannot find
  // module ./vendor-chunks/..."), y ya ha pasado tres veces. `npm run verificar`
  // define esta variable; `npm run build` no, así que Vercel no cambia.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async headers() {
    const corsHeaders = [
      {
        key: "Access-Control-Allow-Origin",
        value: "https://partituras-blush.vercel.app",
      },
      {
        key: "Access-Control-Allow-Methods",
        value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      },
      {
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, Authorization, X-Requested-With",
      },
      {
        key: "Access-Control-Allow-Credentials",
        value: "true",
      },
    ];

    return [
      {
        source: "/api/:path*",
        headers: corsHeaders,
      },
      {
        source: "/catalog/:path*",
        headers: corsHeaders,
      },
      {
        source: "/sheets/:path*",
        headers: corsHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

module.exports = nextConfig;
