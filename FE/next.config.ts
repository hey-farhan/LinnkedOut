import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
        {
          protocol: 'https',
          hostname: 'external-preview.redd.it',
        },
        {
          protocol: 'https',
          hostname: 'i.redd.it',
        },
        {
          protocol: 'https',
          hostname: 'preview.redd.it',
        },
        {
          protocol: 'https',
          hostname: 'i.ytimg.com',
        },
        {
          protocol: 'https',
          hostname: 'example.com',
        },
      ],
    unoptimized: true, // Fallback for invalid images
  },
};

export default nextConfig;
