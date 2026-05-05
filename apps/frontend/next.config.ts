import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:  'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname:  '*.onrender.com',
        pathname:  '/uploads/**',
      },
      {
        protocol: 'http',
        hostname:  'localhost',
        port:      '5000',
        pathname:  '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
