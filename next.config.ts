import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',  // MinIO
        pathname: '/farmconnect-products/**',
      },
      {
        protocol: 'https',
        hostname: '**',  // For production S3/CloudFront
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',  // Disable optimization in dev
  },
};

export default withNextIntl(nextConfig);