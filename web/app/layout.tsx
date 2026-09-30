import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: 'MONSOON-SENSE | Hyperlocal Monsoon Intelligence for Smarter Agricultural Decisions',
  description:
    'Hyperlocal 7–30 day probabilistic monsoon onset, break, revival, and heavy rainfall prediction at Block and Panchayat scale with agronomic crop decision support.',
  keywords: [
    'monsoon prediction',
    'hyperlocal monsoon',
    'block level monsoon forecast',
    'break monsoon',
    'monsoon onset',
    'crop advisory',
    'agricultural intelligence',
    'climate downscaling',
  ],
  authors: [{ name: 'MONSOON-SENSE Meteorological & Agronomic Intelligence' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased bg-monsoon-dark text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
