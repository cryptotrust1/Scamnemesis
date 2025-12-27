'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { TurnstileCaptcha, TurnstileRef } from '@/components/ui/turnstile';
import { useTranslation } from '@/lib/i18n/context';

interface TwoFactorState {
  required: boolean;
  tempToken: string;
  code: string;
  useBackupCode: boolean;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileRef>(null);
  const [twoFactor, setTwoFactor] = useState<TwoFactorState>({
    required: false,
    tempToken: '',
    code: '',
    useBackupCode: false,
  });

  const { login, verify2FA, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password, captchaToken || undefined);

    if (result.success) {
      // Note: useEffect will handle redirect when isAuthenticated changes
      // Don't call router.push here to avoid duplicate navigation
    } else if (result.twoFactorRequired) {
      // 2FA is required - show the 2FA input
      setTwoFactor({
        required: true,
        tempToken: result.twoFactorRequired.tempToken,
        code: '',
        useBackupCode: false,
      });
      setIsSubmitting(false);
    } else {
      setError(result.error || t('admin.login.error'));
      setIsSubmitting(false);
      // Reset CAPTCHA on error
      captchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await verify2FA(
      twoFactor.tempToken,
      twoFactor.code,
      twoFactor.useBackupCode
    );

    if (result.success) {
      // Note: useEffect will handle redirect when isAuthenticated changes
    } else {
      setError(result.error || 'Neplatný overovací kód');
      setTwoFactor(prev => ({ ...prev, code: '' }));
      setIsSubmitting(false);
    }
  };

  const handleCancelTwoFactor = () => {
    setTwoFactor({
      required: false,
      tempToken: '',
      code: '',
      useBackupCode: false,
    });
    setError('');
    // Reset CAPTCHA when going back
    captchaRef.current?.reset();
    setCaptchaToken(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {twoFactor.required ? 'Dvojfaktorové overenie' : t('admin.login.title')}
          </CardTitle>
          <CardDescription>
            {twoFactor.required
              ? twoFactor.useBackupCode
                ? 'Zadajte jeden z vašich záložných kódov'
                : 'Zadajte 6-ciferný kód z aplikácie autentifikátora'
              : t('admin.login.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {twoFactor.required ? (
            // 2FA Form
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">
                  {twoFactor.useBackupCode ? 'Záložný kód' : 'Overovací kód'}
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder={twoFactor.useBackupCode ? 'XXXX-XXXX' : '000000'}
                  value={twoFactor.code}
                  onChange={(e) => {
                    const value = twoFactor.useBackupCode
                      ? e.target.value.toUpperCase()
                      : e.target.value.replace(/\D/g, '');
                    setTwoFactor(prev => ({ ...prev, code: value }));
                  }}
                  maxLength={twoFactor.useBackupCode ? 9 : 6}
                  required
                  disabled={isSubmitting}
                  autoComplete="one-time-code"
                  className="text-center text-xl font-mono tracking-widest"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || twoFactor.code.length < 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Overujem...
                  </>
                ) : (
                  'Overiť'
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTwoFactor(prev => ({
                    ...prev,
                    useBackupCode: !prev.useBackupCode,
                    code: ''
                  }))}
                  className="text-sm text-primary hover:underline"
                >
                  {twoFactor.useBackupCode
                    ? 'Použiť autentifikátor namiesto toho'
                    : 'Použiť záložný kód namiesto toho'}
                </button>

                <button
                  type="button"
                  onClick={handleCancelTwoFactor}
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Späť na prihlásenie
                </button>
              </div>
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('admin.login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('admin.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('admin.login.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('admin.login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CAPTCHA */}
              <TurnstileCaptcha
                ref={captchaRef}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('admin.login.submitting')}
                  </>
                ) : (
                  t('admin.login.submit')
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t('admin.login.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
