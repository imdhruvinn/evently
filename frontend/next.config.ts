import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Netlify deployment with server-side rendering
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ignore ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Proxy /api requests to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*/',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
