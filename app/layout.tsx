import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BMKG Real-time Earthquake Monitor & Alert Platform',
  description: 'Platform terpadu pemantauan aktivitas gempa bumi di Indonesia terintegrasi data resmi BMKG TEWS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
