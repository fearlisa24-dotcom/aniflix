import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Aniflix — Stream Your Favorite Anime',
  description:
    'Watch the latest anime episodes, simulcasts, and classic series on Aniflix. Subtitled and dubbed.',
};

import { KeyExpirationWatcher } from '@/components/unlock/KeyExpirationWatcher';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>
          <TopNav />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <KeyExpirationWatcher />
        </TooltipProvider>
      </body>
    </html>
  );
}
