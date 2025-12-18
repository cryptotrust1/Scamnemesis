'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper.
 * Includes ErrorBoundary, SessionProvider (Auth.js), and can be extended
 * with other providers like ThemeProvider, etc.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default Providers;
