import './globals.css';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Caudex } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { shadesOfPurple } from '@clerk/themes'


const caudex = Caudex ({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legal Document Assistant',
  description: 'AI-powered legal document simplification with RAG and web search capabilities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
    clerkJSVersion="5.56.0-snapshot.v20250312225817"

      appearance={{
            baseTheme: shadesOfPurple,
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
      }}>
      <html lang="en">
        <body className={cn(caudex.className, 'min-h-screen')} suppressHydrationWarning={true}> 
            {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
