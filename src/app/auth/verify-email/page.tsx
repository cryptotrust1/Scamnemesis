'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, CheckCircle, AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type VerificationState = 'verifying' | 'success' | 'error' | 'already_verified' | 'request_new';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [state, setState] = useState<VerificationState>(token ? 'verifying' : 'request_new');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.already_verified) {
          setState('already_verified');
        } else {
          setState('success');
        }
      } else {
        setError(data.message || 'Invalid or expired token');
        setState('error');
      }
    } catch {
      setError('Error communicating with the server');
      setState('error');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('If an unverified account with this email exists, you will receive a verification email.');
      } else if (response.status === 429) {
        const data = await response.json();
        toast.error(data.message || 'Too many attempts. Please try again later.');
      } else {
        toast.success('If an unverified account with this email exists, you will receive a verification email.');
      }
    } catch {
      toast.error('Error sending email');
    } finally {
      setIsResending(false);
    }
  };

  // Verifying state
  if (state === 'verifying') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl text-center">Verifying email...</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your email</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">Email Verified</CardTitle>
            <CardDescription className="text-center">
              Your email has been successfully verified. You now have access to all features.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already verified state
  if (state === 'already_verified') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">Email Already Verified</CardTitle>
            <CardDescription className="text-center">
              Your email has already been verified. You can sign in now.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              The link may have expired. You can request a new verification email.
            </p>
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isResending}>
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send New Verification Email'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Request new verification state (no token provided)
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Enter your email and we will send you a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isResending}>
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Email'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
