'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { UserAuthProvider } from '@/lib/auth/user-context';
import { I18nProvider } from '@/lib/i18n/context';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper.
 * Includes ErrorBoundary, SessionProvider (Auth.js), UserAuthProvider, I18nProvider, and can be extended
 * with other providers like ThemeProvider, etc.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <I18nProvider>
          <UserAuthProvider>
            {children}
          </UserAuthProvider>
        </I18nProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default Providers;
