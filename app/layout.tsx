import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { GoogleAdsCapture } from '@/components/GoogleAdsCapture';
import { LazyElevenLabs } from '@/components/LazyElevenLabs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Improves FCP by showing fallback font immediately
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Trvel - Travel eSIM Plans | Stay Connected Worldwide',
    template: '%s | Trvel',
  },
  description: 'Get unlimited travel eSIM plans for 190+ destinations. Instant activation, 24/7 support via live chat & phone, and 10-minute connection guarantee. No roaming bills.',
  keywords: ['travel eSIM', 'international data', 'roaming', 'Japan eSIM', 'Thailand eSIM', 'travel data plan', 'eSIM for travel', 'unlimited data abroad'],
  authors: [{ name: 'Trvel' }],
  creator: 'Trvel',
  publisher: 'Trvel',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
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
    description: 'Get unlimited travel eSIM plans for 190+ destinations. Instant activation, 24/7 support via live chat & phone, and 10-minute connection guarantee.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        secureUrl: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Trvel - Travel eSIM Plans',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trvel - Travel eSIM Plans',
    description: 'Get unlimited travel eSIM plans for 190+ destinations. Instant activation, 24/7 support.',
    images: [`${BASE_URL}/twitter-image.png`],
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
      <head>
        {/* Preconnect to critical third-party origins for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://analytics.vertial.com" />
      </head>
      <body className={inter.className}>
        {/* Capture Google Ads gclid from URL */}
        <GoogleAdsCapture />

        {/* Google Analytics - Priority for conversion tracking */}
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

        {/* Secondary Analytics - Deferred to reduce main thread blocking */}
        <Script
          defer
          src="https://analytics.vertial.com/script.js"
          data-website-id="c6676273-d652-42da-b101-02ff592c29c1"
          strategy="lazyOnload"
        />
        <Script
          defer
          src="https://jc-dashboard-xi.vercel.app/tracker.js"
          data-website-id="c6676273-d652-42da-b101-02ff592c29c1"
          strategy="lazyOnload"
        />

        {children}

        {/* ElevenLabs ConvAI Widget - Lazy loaded on user interaction */}
        <LazyElevenLabs />
      </body>
    </html>
  );
}

