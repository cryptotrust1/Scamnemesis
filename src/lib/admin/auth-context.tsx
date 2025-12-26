'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  scopes: string[];
}

interface TwoFactorRequired {
  requires2FA: true;
  tempToken: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
  twoFactorRequired?: TwoFactorRequired;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<LoginResult>;
  verify2FA: (tempToken: string, code: string, isBackupCode?: boolean) => Promise<LoginResult>;
  logout: () => void;
  hasScope: (scope: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Only store non-sensitive user info in localStorage (not tokens!)
// Tokens are now stored in HttpOnly cookies for security
const USER_KEY = 'admin_user';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  // Note: Tokens are now in HttpOnly cookies, so we verify by making an API call
  useEffect(() => {
    const checkAuth = async () => {
      // First check cached user in localStorage
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verify user has admin privileges from cached data
          if (parsedUser.scopes?.some((s: string) => s === '*' || s.startsWith('admin:'))) {
            // CRITICAL: Verify session is still valid with server before trusting cached data
            // This prevents redirect loops when session has expired but localStorage has stale data
            try {
              const response = await fetch('/api/v1/auth/me', {
                credentials: 'include',
              });

              if (response.ok) {
                // Session is valid, use cached user
                setUser(parsedUser);
              } else {
                // Session expired or invalid - clear cached data
                console.log('Admin session expired, clearing cached data');
                localStorage.removeItem(USER_KEY);
                setUser(null);
              }
            } catch {
              // Network error - clear cached data to be safe
              localStorage.removeItem(USER_KEY);
              setUser(null);
            }
          } else {
            localStorage.removeItem(USER_KEY);
          }
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, captchaToken?: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in request/response
        body: JSON.stringify({
          grant_type: 'password',
          email,
          password,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Prihlásenie zlyhalo' };
      }

      // Check if 2FA is required
      if (data.requires_2fa && data.temp_token) {
        return {
          success: false,
          twoFactorRequired: {
            requires2FA: true,
            tempToken: data.temp_token,
          },
        };
      }

      // Check if user has admin privileges
      const hasAdminAccess = data.scopes?.some(
        (s: string) => s === '*' || s.startsWith('admin:')
      );

      if (!hasAdminAccess) {
        // Logout to clear the cookies since this user doesn't have admin access
        await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
        return { success: false, error: 'Nemáte oprávnenia pre admin prístup' };
      }

      // Validate that user info is present in response
      // SECURITY: Use server-provided user info instead of decoding JWT on client
      // This prevents potential tampering with JWT payload on client side
      if (!data.user || !data.user.id || !data.user.email) {
        console.error('Server response missing user info');
        return { success: false, error: 'Neplatná odpoveď servera' };
      }

      const adminUser: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || 'BASIC',
        scopes: data.scopes,
      };

      // Store user info in state and localStorage (NOT tokens - those are in HttpOnly cookies)
      setUser(adminUser);
      localStorage.setItem(USER_KEY, JSON.stringify(adminUser));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Chyba pripojenia k serveru' };
    }
  }, []);

  const verify2FA = useCallback(async (tempToken: string, code: string, isBackupCode = false): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/v1/auth/2fa/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          temp_token: tempToken,
          code,
          is_backup_code: isBackupCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Overenie zlyhalo' };
      }

      // Check if user has admin privileges
      const hasAdminAccess = data.user?.scopes?.some(
        (s: string) => s === '*' || s.startsWith('admin:')
      );

      if (!hasAdminAccess) {
        // Logout to clear the cookies since this user doesn't have admin access
        await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
        return { success: false, error: 'Nemáte oprávnenia pre admin prístup' };
      }

      const adminUser: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role?.toUpperCase() || 'BASIC',
        scopes: data.user.scopes,
      };

      // Store user info in state and localStorage
      setUser(adminUser);
      localStorage.setItem(USER_KEY, JSON.stringify(adminUser));

      return { success: true };
    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, error: 'Chyba pripojenia k serveru' };
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear local state
    setUser(null);
    localStorage.removeItem(USER_KEY);

    // Call logout API to clear HttpOnly cookies and invalidate refresh token
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    }

    router.push('/admin/login');
  }, [router]);

  const hasScope = useCallback((scope: string) => {
    if (!user?.scopes) return false;
    if (user.scopes.includes('*')) return true;
    return user.scopes.includes(scope);
  }, [user]);

  const value = {
    user,
    isLoading,
    // User is authenticated if we have user info (tokens are in HttpOnly cookies)
    isAuthenticated: !!user,
    login,
    verify2FA,
    logout,
    hasScope,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// HOC for protecting admin pages
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAdminAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/admin/login');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
