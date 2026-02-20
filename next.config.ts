import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Required for @sparticuz/chromium in serverless
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
  
  // Increase serverless function timeout
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
