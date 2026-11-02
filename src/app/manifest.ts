import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rulio — Prava testlari',
    short_name: 'Rulio',
    description: 'Prava imtihoniga tayyorgarlik: 1250+ savol, 63 bilet, xatolar tahlili.',
    start_url: '/home',
    display: 'standalone',
    background_color: '#F3F5F9',
    theme_color: '#14123A',
    lang: 'uz',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
