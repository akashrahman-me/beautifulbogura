import type { Metadata, Viewport } from 'next';
import { Anek_Bangla, Noto_Sans_Bengali } from 'next/font/google';
import { env } from '@/lib/env';
import { themeScript } from '@/lib/theme';
import { Providers } from '@/providers/Providers';
import './globals.css';

const anek = Anek_Bangla({ subsets: ['bengali', 'latin'], weight: 'variable', variable: '--font-anek', display: 'swap' });
const noto = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], weight: 'variable', variable: '--font-noto', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: { default: 'কনসোল · বিউটিফুল বগুড়া', template: '%s · কনসোল' },
  // Staff-only tool: never indexed.
  robots: { index: false, follow: false },
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
