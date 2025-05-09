import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.yahoo.com'],
  },
};

export default nextConfig;
