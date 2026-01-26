import './globals.css';
import { cn } from '@/lib/utils';

import type { Metadata, Viewport } from 'next';
import { Caudex } from 'next/font/google';
import { ClientWrapper } from '@/components/global';

const caudex = Caudex ({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://vrdct.vercel.app'),
  title: 'VRDCT',
  description: 'Simplify complex legal documents with AI, RAG, and web search. Get clear, concise summaries and comparisons for better understanding.',
  keywords: ['legal documents', 'AI legal simplification', 'RAG', 'web search', 'document comparison', 'legal tech'],
  authors: [{ name: 'Prateek Mohapatra' }],
  creator: 'VRDCT',
  publisher: 'VRDCT',
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
  openGraph: {
    title: 'VRDCT - AI-Powered Legal Document Simplification',
    description: 'Simplify complex legal documents with AI, RAG, and web search. Get clear, concise summaries and comparisons for better understanding.',
    url: 'https://vrdct.vercel.app',
    siteName: 'VRDCT',
    images: [
      {
        url: '/logo/black-no-text.svg',
        width: 1200,
        height: 630,
        alt: 'VRDCT Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VRDCT - AI-Powered Legal Document Simplification',
    description: 'Simplify complex legal documents with AI, RAG, and web search. Get clear, concise summaries and comparisons for better understanding.',
    images: ['/logo/black-no-text.svg'],
  },
  icons: {
    icon: '/logo/black-no-text.svg',
    shortcut: '/logo/black-no-text.svg',
    apple: '/logo/black-no-text.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(caudex.className, 'min-h-screen select-none')} suppressHydrationWarning={true}> 
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
