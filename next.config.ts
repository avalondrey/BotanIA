import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  outputFileTracingExcludes: {
    '/api/**': [
      'node_modules/**',
      '.next/**',
      '.cache/**',
      '**/*.png',
      '**/*.webp',
      '**/*.jpg',
      '**/*.md',
      '**/*.txt',
      '**/*.py',
      '**/*.ps1',
      '**/*.sh',
      '**/*.bat',
      '**/*.gd',
      '**/*.html',
      '.git/**',
      'assets/**',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.open-meteo.com' },
      { protocol: 'https', hostname: '**.plant.id' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
