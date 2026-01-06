import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: [
    '@nillion/secretvaults', 
    '@nillion/nuc',
  ],
  
  turbopack: {
    // This is equivalent to webpack's resolve.fallback
    resolveAlias: {
      // Alias Node.js built-in modules to empty module for browser builds only
      // Server-side code can still use these modules normally
      fs: {
        browser: './src/utils/empty-module.ts',
      },
      worker_threads: {
        browser: './src/utils/empty-module.ts',
      },
    },
  },
};

export default nextConfig;
