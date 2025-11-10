/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
  // 可选：使用 rewrites 将请求重写到后端（替代代理路由）
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/backend/:path*",
  //       destination: "http://106.52.76.120:8080/api/v1/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;
