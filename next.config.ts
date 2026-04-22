import type { NextConfig } from 'next';

const isProduction = process.env.APP_ENV === 'production';

const wwwRedirect: NextConfig['redirects'] = async () => {
  if (!isProduction) return [];

  return [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.fornixlink.com',
        },
      ],
      destination: 'https://fornixlink.com/:path*',
      permanent: true, // 301 redirect for SEO
    },
  ];
};

const nextConfig: NextConfig = {
  redirects: wwwRedirect,
  //TODO: Remove once mock data is removed and the modify the domains once the data is consistent and ready
  images: {
    remotePatterns: [
      {
        hostname: '**',
        protocol: 'https',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
