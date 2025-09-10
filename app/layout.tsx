import './globals.css';
import { cn } from '../lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legal Document Assistant',
  description: 'AI-powered legal document simplification with RAG and web search capabilities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'min-h-screen')} suppressHydrationWarning={true}> 
        {children}
      </body>
    </html>
  );
}
