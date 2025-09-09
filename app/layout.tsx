import './globals.css';
import { cn } from '../lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Multimodal RAG Chatbot',
  description: 'A demo of a multimodal RAG chatbot with Gemini, Pinecone, Tavily, and LlamaParse.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, 'min-h-screen')} suppressHydrationWarning={true}> 
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
