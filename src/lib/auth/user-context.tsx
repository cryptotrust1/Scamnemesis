'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  role: string;
  image?: string;
  emailVerified?: boolean;
}

interface UserAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

// Store non-sensitive user info in localStorage
const USER_CACHE_KEY = 'user_cache';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user from API
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        displayName: data.displayName || data.display_name,
        role: data.role,
        image: data.image,
        emailVerified: data.emailVerified || data.email_verified,
      };
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First, try to load from cache for faster initial render
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        try {
          const cachedUser = JSON.parse(cached);
          setUser(cachedUser);
        } catch {
          localStorage.removeItem(USER_CACHE_KEY);
        }
      }

      // Then verify with server (cookies are sent automatically)
      const serverUser = await fetchUser();

      if (serverUser) {
        setUser(serverUser);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(serverUser));
      } else {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    try {
      const response = await fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

      // Get user info from response
      if (!data.user || !data.user.id || !data.user.email) {
        return { success: false, error: 'Neplatná odpoveď servera' };
      }

      const newUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        displayName: data.user.displayName || data.user.display_name,
        role: data.user.role || 'BASIC',
        image: data.user.image,
        emailVerified: data.user.emailVerified,
      };

      setUser(newUser);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Chyba pripojenia k serveru' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, captchaToken?: string) => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Registrácia zlyhala' };
      }

      // After successful registration, user is automatically logged in
      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          displayName: data.user.displayName || data.user.display_name,
          role: data.user.role || 'BASIC',
          image: data.user.image,
          emailVerified: false,
        };

        setUser(newUser);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Chyba pripojenia k serveru' };
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear local state first for immediate UI update
    setUser(null);
    localStorage.removeItem(USER_CACHE_KEY);

    // Then call logout API to clear HttpOnly cookies
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Redirect to home
    router.push('/');
  }, [router]);

  const refreshUser = useCallback(async () => {
    const serverUser = await fetchUser();
    if (serverUser) {
      setUser(serverUser);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(serverUser));
    } else {
      setUser(null);
      localStorage.removeItem(USER_CACHE_KEY);
    }
  }, [fetchUser]);

  const value: UserAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserAuthProvider');
  }
  return context;
}

// Helper hook for protected pages
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated };
}
