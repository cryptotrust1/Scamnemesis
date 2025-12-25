'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

// Error messages mapping
const errorMessages: Record<string, { title: string; message: string; action: string; actionUrl: string }> = {
  Configuration: {
    title: 'Configuration Error',
    message: 'There is a problem with the server configuration. Please contact support.',
    action: 'Go to Homepage',
    actionUrl: '/',
  },
  AccessDenied: {
    title: 'Access Denied',
    message: 'Your account may be inactive or you do not have permission to sign in. Please contact support if you believe this is an error.',
    action: 'Contact Support',
    actionUrl: '/contact',
  },
  Verification: {
    title: 'Verification Error',
    message: 'The verification link may have expired or already been used. Please request a new verification email.',
    action: 'Request New Link',
    actionUrl: '/auth/login',
  },
  OAuthSignin: {
    title: 'OAuth Sign-in Error',
    message: 'There was a problem signing in with your OAuth provider. Please try again.',
    action: 'Try Again',
    actionUrl: '/auth/login',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    message: 'There was a problem with the OAuth callback. Please try signing in again.',
    action: 'Try Again',
    actionUrl: '/auth/login',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    message: 'There was a problem creating your account with the OAuth provider. Please try again or use a different method.',
    action: 'Try Again',
    actionUrl: '/auth/register',
  },
  EmailCreateAccount: {
    title: 'Account Creation Error',
    message: 'There was a problem creating your account. Please try again.',
    action: 'Try Again',
    actionUrl: '/auth/register',
  },
  Callback: {
    title: 'Callback Error',
    message: 'There was a problem with the authentication callback. Please try again.',
    action: 'Try Again',
    actionUrl: '/auth/login',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    message: 'This email is already registered with a different sign-in method. Please sign in using your original method.',
    action: 'Go to Login',
    actionUrl: '/auth/login',
  },
  EmailNotVerified: {
    title: 'Email Not Verified',
    message: 'Your email address is not verified. Please verify your email before linking OAuth accounts.',
    action: 'Verify Email',
    actionUrl: '/auth/login',
  },
  AccountInactive: {
    title: 'Account Inactive',
    message: 'Your account has been deactivated. Please contact support for assistance.',
    action: 'Contact Support',
    actionUrl: '/contact',
  },
  Default: {
    title: 'Authentication Error',
    message: 'An unexpected error occurred during authentication. Please try again.',
    action: 'Go to Login',
    actionUrl: '/auth/login',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Default';

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            {errorInfo.title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 text-center mb-8">
            {errorInfo.message}
          </p>

          {/* Error Code */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-400 text-center">
              Error Code: <code className="text-red-400">{error}</code>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={errorInfo.actionUrl}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              {errorInfo.action}
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              Go to Homepage
            </Link>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Need help?{' '}
          <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
