'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper.
 * Includes ErrorBoundary and can be extended with other providers
 * like ThemeProvider, AuthProvider, etc.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

export default Providers;
