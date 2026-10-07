import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ncksfivbxsratdhybuft.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: [
        'jeffersonlopes.cl',
        'www.jeffersonlopes.cl',
        'valentes-studio.vercel.app',
        'localhost:3000',
        'localhost:3001'
      ],
    },
  },
};

export default nextConfig;
