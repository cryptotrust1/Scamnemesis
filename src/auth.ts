/**
 * Auth.js (NextAuth v5) Configuration
 * Supports: Email/Password + Google + GitHub OAuth
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/jwt';
import { UserRole } from '@prisma/client';

// Extend session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
}

// Note: JWT module augmentation moved inline due to module resolution issues

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt', // Use JWT for sessions (works better with existing setup)
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    // Note: newUser page removed - OAuth users redirect to callbackUrl directly
    // The /auth/welcome page was never created, causing 404 errors
  },
  providers: [
    // Email/Password authentication
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user || !user.passwordHash || !user.isActive) {
            return null;
          }

          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }).catch((err) => {
            // Don't fail login if lastLoginAt update fails
            console.error('[Auth] Failed to update lastLoginAt:', err);
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.displayName,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error('[Auth] authorize() error:', error);
          // Return null on any error - treated as invalid credentials
          return null;
        }
      },
    }),

    // Google OAuth - only register if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // SECURITY: Do NOT use allowDangerousEmailAccountLinking as it allows
            // account takeover. Account linking is handled in signIn callback below.
          }),
        ]
      : []),

    // GitHub OAuth - only register if credentials are configured
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            // SECURITY: Do NOT use allowDangerousEmailAccountLinking as it allows
            // account takeover. Account linking is handled in signIn callback below.
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        // For credentials provider or no account, just return true
        if (!account || account.provider === 'credentials') {
          return true;
        }

        // For OAuth providers, handle account linking and check user status
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            accounts: true,
          },
        });

        if (existingUser) {
          // Block inactive users with proper error redirect
          if (!existingUser.isActive) {
            return '/auth/error?error=AccountInactive';
          }

          // Check if this OAuth account is already linked
          const isAccountLinked = existingUser.accounts.some(
            (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
          );

          if (!isAccountLinked) {
            // User exists but OAuth account is not linked
            // Only allow linking if the user's email is verified (proves ownership)
            if (!existingUser.emailVerified) {
              console.warn(
                `[Auth] Blocked OAuth linking: User ${user.email} exists but email not verified`
              );
              return '/auth/error?error=EmailNotVerified';
            }

            // Link the OAuth account to existing user
            // This is safe because email is verified (user owns the account)
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token ?? undefined,
                expires_at: account.expires_at ?? undefined,
                token_type: account.token_type ?? undefined,
                scope: account.scope ?? undefined,
                id_token: account.id_token ?? undefined,
                refresh_token: account.refresh_token ?? undefined,
              },
            });

            // Update user object with existing user data for session
            user.id = existingUser.id;
            user.role = existingUser.role;
          }

          return true;
        }

        // New user - will be created by adapter
        return true;
      } catch (error) {
        console.error('[Auth] signIn() callback error:', error);
        // Return error page on database failures
        return '/auth/error?error=DatabaseError';
      }
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id!;
        token.role = user.role || 'BASIC';
      }

      // Session update
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.role = session.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || 'BASIC';
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        // Set default role for new OAuth users
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'BASIC',
            emailVerified: new Date(), // OAuth users are verified
          },
        });
      } catch (error) {
        console.error('[Auth] createUser event error:', error);
        // Don't throw - user is already created, just role/verified not set
      }
    },
    async signIn({ user, isNewUser }) {
      try {
        if (!isNewUser) {
          // Update last login for existing users
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        }
      } catch (error) {
        console.error('[Auth] signIn event error:', error);
        // Don't throw - sign in should still succeed
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
