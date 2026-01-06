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
  
  // Fallback webpack config for when not using Turbopack
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false,
  //     net: false,
  //     tls: false,
  //     worker_threads: false,
  //     pino: require.resolve('./src/utils/empty-module.ts'),
  //     'pino-pretty': require.resolve('./src/utils/empty-module.ts'),
  //   };
  //   return config;
  // },
};

export default nextConfig;
