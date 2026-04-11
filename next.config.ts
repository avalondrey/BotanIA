import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  outputFileTracingExcludes: {
    '/api/**': ['node_modules/**', '.next/**', '.cache/**'],
  },
};

export default nextConfig;
