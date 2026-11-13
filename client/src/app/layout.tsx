import type { Metadata, Viewport } from 'next';
import { Anek_Bangla, Noto_Sans_Bengali } from 'next/font/google';
import { Suspense } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { env } from '@/lib/env';
import { themeScript } from '@/lib/theme';
import { Providers } from '@/providers/Providers';
import './globals.css';

const anek = Anek_Bangla({ subsets: ['bengali', 'latin'], weight: 'variable', variable: '--font-anek', display: 'swap' });
const noto = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], weight: 'variable', variable: '--font-noto', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: { default: 'বিউটিফুল বগুড়া — বগুড়ার সব সেবা, এক জায়গায়', template: '%s · বিউটিফুল বগুড়া' },
  description: 'ডাক্তার, রক্তদাতা, পুলিশ, ফায়ার সার্ভিস, স্কুল, চাকরি, বাসা ভাড়া — বগুড়ার সব সেবা আর ফোন নম্বর এক জায়গায়।',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ee' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1312' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${anek.variable} ${noto.variable}`}>
      <head>
        {/* Applies the saved theme before first paint. Static, so it never changes between renders. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <Suspense fallback={<div className="bb-header" style={{ height: 61 }} />}>
            <AppHeader />
          </Suspense>
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
