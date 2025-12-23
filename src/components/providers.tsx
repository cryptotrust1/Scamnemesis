'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { UserAuthProvider } from '@/lib/auth/user-context';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper.
 * Includes ErrorBoundary, SessionProvider (Auth.js), UserAuthProvider, and can be extended
 * with other providers like ThemeProvider, etc.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <UserAuthProvider>
          {children}
        </UserAuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default Providers;
