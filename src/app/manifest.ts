import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fornix Link',
    short_name: 'Fornix',
    description: 'A secure digital healthcare platform connecting patients with verified doctors.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#08af85',
    background_color: '#ffffff',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
