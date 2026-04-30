/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        source: "/mosaics/:path*",
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
