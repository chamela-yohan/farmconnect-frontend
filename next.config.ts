import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

// Point to the request configuration we just created
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);