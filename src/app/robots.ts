import type { MetadataRoute } from 'next';
import { BRANDING } from '@/constants/branding.constant';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/onboarding/',
          '/verify-payment/',
          '/api/',
          '/oauth/',
          '/verify-email/',
        ],
      },
    ],
    sitemap: `${BRANDING.APP_URL}/sitemap.xml`,
    host: BRANDING.APP_URL,
  };
}
