import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://trvel.co';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Trvel - Travel eSIM Plans | Stay Connected Worldwide',
    template: '%s | Trvel',
  },
  description: 'Get unlimited travel eSIM plans for 30+ destinations. Instant activation, human WhatsApp support, and 10-minute connection guarantee. No roaming bills.',
  keywords: ['travel eSIM', 'international data', 'roaming', 'Japan eSIM', 'Thailand eSIM', 'travel data plan', 'eSIM for travel', 'unlimited data abroad'],
  authors: [{ name: 'Trvel' }],
  creator: 'Trvel',
  publisher: 'Trvel',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: BASE_URL,
    siteName: 'Trvel',
    title: 'Trvel - Travel eSIM Plans | Stay Connected Worldwide',
    description: 'Get unlimited travel eSIM plans for 30+ destinations. Instant activation, human WhatsApp support, and 10-minute connection guarantee.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trvel - Travel eSIM Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trvel - Travel eSIM Plans',
    description: 'Get unlimited travel eSIM plans for 30+ destinations. Instant activation, human support.',
    images: ['/twitter-image.png'],
    creator: '@trvelco',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#5ebfc1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="trvel">
      <body className={inter.className}>
        {/* Umami Analytics */}
        <Script
          defer
          src="https://analytics.vertial.com/script.js"
          data-website-id="c6676273-d652-42da-b101-02ff592c29c1"
          strategy="afterInteractive"
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LQP0KHTXLH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LQP0KHTXLH');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

