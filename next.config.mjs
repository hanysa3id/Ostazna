import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  // Don't block builds on type errors during iteration. `npm run typecheck` still works.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Suppress harmless next-intl dynamic import warnings.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /next-intl\/dist/, message: /Parsing of/ },
      { module: /next-intl\/dist/, message: /Critical dependency/ },
    ];
    return config;
  },
};

export default withNextIntl(nextConfig);
