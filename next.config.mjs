import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vusercontent.net",
      },
      {
        protocol: "https",
        hostname: "v0.app",
      },
      {
        protocol: "https",
        hostname: "blob.v0.app",
      },
      {
        protocol: "https",
        hostname: "**.loca.lt",
      },
      {
        protocol: "https",
        hostname: "**.ngrok.io",
      },
      {
        protocol: "https",
        hostname: "**.ngrok-free.app",
      },
    ],
  },
  async headers() {
    return [
      {
        // 为所有 API 路由设置 CORS 头
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
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
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

// 修复 withBundleAnalyzer 的调用方式
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
