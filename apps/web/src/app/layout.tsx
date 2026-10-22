import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LifeOS — AI-powered Life Management',
  description: 'Manage tasks, habits, time, finance, study, and health in one place with AI insights',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: [
    'productivity',
    'habits',
    'goals',
    'time management',
    'life optimization',
    'AI',
  ],
  authors: [
    {
      name: 'LifeOS Team',
    },
  ],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LifeOS" />
      </head>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}