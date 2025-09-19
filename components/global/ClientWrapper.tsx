'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis } from 'lenis/react';
import { ClerkProvider } from '@clerk/nextjs';
import { shadesOfPurple } from '@clerk/themes';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ClerkProvider
      clerkJSVersion="5.56.0-snapshot.v20250312225817"
      appearance={{
        baseTheme: shadesOfPurple,
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <ReactLenis
        root
        options={{
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        }}
      >
        {children}
      </ReactLenis>
    </ClerkProvider>
  );
}