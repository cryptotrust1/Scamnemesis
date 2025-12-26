'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface DocsUser {
  id: string;
  email: string;
  role: string;
  scopes?: string[];
}

/**
 * Docs Layout with Authentication
 *
 * Protects /docs route with admin authentication.
 * Redirects to /admin/login if not authenticated.
 * Shows 403 if user doesn't have admin access.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<DocsUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated by calling /api/v1/auth/me
        const response = await fetch('/api/v1/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          // Not authenticated - redirect to login
          router.push('/admin/login?callbackUrl=/docs');
          return;
        }

        const userData = await response.json();

        // Check if user has admin access
        // Admin users have role ADMIN or SUPER_ADMIN, or have admin:* scopes
        const isAdmin =
          userData.role === 'ADMIN' ||
          userData.role === 'SUPER_ADMIN' ||
          userData.scopes?.some(
            (s: string) => s === '*' || s.startsWith('admin:')
          );

        if (!isAdmin) {
          setError('forbidden');
          setIsLoading(false);
          return;
        }

        setUser(userData);
        setIsLoading(false);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/admin/login?callbackUrl=/docs');
      }
    };

    checkAuth();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Forbidden state
  if (error === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-gray-600 mb-4">
            Nemáte oprávnenia pre prístup k API dokumentácii.
          </p>
          <a
            href="/admin/login"
            className="text-blue-600 hover:underline"
          >
            Prihlásiť sa s admin účtom
          </a>
        </div>
      </div>
    );
  }

  // Not authenticated (shouldn't reach here, but fallback)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Authenticated admin user
  return <>{children}</>;
}
