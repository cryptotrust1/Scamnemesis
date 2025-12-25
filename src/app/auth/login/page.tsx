'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { TurnstileCaptcha, TurnstileRef } from '@/components/ui/turnstile';

// Check if OAuth providers are enabled via environment variables
const isGoogleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true';
const isGithubEnabled = process.env.NEXT_PUBLIC_GITHUB_ENABLED === 'true';
const hasOAuthProviders = isGoogleEnabled || isGithubEnabled;

interface EmailVerificationState {
  needsVerification: boolean;
  email: string;
  isResending: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileRef>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [emailVerification, setEmailVerification] = useState<EmailVerificationState>({
    needsVerification: false,
    email: '',
    isResending: false,
  });

  const handleResendVerification = async () => {
    if (!emailVerification.email) return;

    setEmailVerification((prev) => ({ ...prev, isResending: true }));

    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVerification.email }),
      });

      if (response.ok) {
        toast.success('Overovací email bol odoslaný. Skontrolujte svoju schránku.');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Nepodarilo sa odoslať overovací email.');
      }
    } catch {
      toast.error('Nepodarilo sa odoslať overovací email.');
    } finally {
      setEmailVerification((prev) => ({ ...prev, isResending: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailVerification({ needsVerification: false, email: '', isResending: false });

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        captchaToken: captchaToken,
        redirect: false,
      });

      if (result?.error) {
        const response = await fetch('/api/v1/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            grant_type: 'password',
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          toast.success('Prihlásenie úspešné!');
          router.push(callbackUrl);
        } else {
          const error = await response.json();

          // Handle email not verified error
          if (error.error === 'email_not_verified') {
            setEmailVerification({
              needsVerification: true,
              email: error.email || formData.email,
              isResending: false,
            });
          } else {
            toast.error(error.message || 'Nesprávne prihlasovacie údaje');
          }

          captchaRef.current?.reset();
          setCaptchaToken(null);
        }
      } else if (result?.ok) {
        toast.success('Prihlásenie úspešné!');
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      toast.error('Chyba pri prihlasovaní. Skúste to znova.');
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error(`[Login] ${provider} OAuth error:`, error);
      toast.error(`Chyba pri prihlasovaní cez ${provider}`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Vitajte späť</h1>
            <p className="text-blue-100 text-sm">
              Prihláste sa do svojho účtu
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Email Verification Warning */}
            {emailVerification.needsVerification && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-1">
                      Email nie je overený
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                      Pred prihlásením musíte overiť svoju emailovú adresu.
                      Skontrolujte svoju schránku ({emailVerification.email}) a kliknite na overovací odkaz.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={emailVerification.isResending}
                      className="text-sm font-medium text-amber-700 hover:text-amber-800 underline disabled:opacity-50"
                    >
                      {emailVerification.isResending ? 'Odosielam...' : 'Odoslať overovací email znova'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Emailová adresa
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="vas@email.sk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Heslo
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Zabudli ste heslo?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="flex justify-center">
                <TurnstileCaptcha
                  ref={captchaRef}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Prihlasovanie...</span>
                  </>
                ) : (
                  <>
                    <span>Prihlásiť sa</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider - only show if OAuth providers are enabled */}
            {hasOAuthProviders && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-slate-500">alebo pokračujte cez</span>
                </div>
              </div>
            )}

            {/* OAuth Buttons - only show enabled providers */}
            {hasOAuthProviders && (
              <div className="space-y-3">
                {isGoogleEnabled && (
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={oauthLoading !== null}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {oauthLoading === 'google' ? (
                      <span className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>
                )}

                {isGithubEnabled && (
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={oauthLoading !== null}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {oauthLoading === 'github' ? (
                      <span className="h-5 w-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )}
                    <span>GitHub</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-slate-600">
              Nemáte ešte účet?{' '}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Zaregistrujte sa
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield className="h-4 w-4" />
          <span>Zabezpečené SSL šifrovaním</span>
        </div>
      </div>
    </div>
  );
}
