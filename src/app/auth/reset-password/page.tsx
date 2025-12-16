'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const passwordRequirements = [
  { label: 'Aspoň 8 znakov', test: (pwd: string) => pwd.length >= 8 },
  { label: 'Obsahuje veľké písmeno', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: 'Obsahuje malé písmeno', test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: 'Obsahuje číslo', test: (pwd: string) => /[0-9]/.test(pwd) },
];

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setError('Neplatný alebo chýbajúci token. Skúste požiadať o nový reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Heslá sa nezhodujú');
      return;
    }

    const allRequirementsMet = passwordRequirements.every((req) => req.test(formData.password));
    if (!allRequirementsMet) {
      toast.error('Heslo nespĺňa všetky požiadavky');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Heslo bolo úspešne zmenené!');
      } else {
        const data = await response.json();
        if (data.error === 'invalid_token') {
          setError('Token vypršal alebo je neplatný. Požiadajte o nový reset link.');
        } else {
          setError(data.message || 'Chyba pri zmene hesla');
        }
      }
    } catch {
      setError('Chyba pri komunikácii so serverom. Skúste to znova.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">Heslo zmenené</CardTitle>
            <CardDescription className="text-center">
              Vaše heslo bolo úspešne zmenené. Teraz sa môžete prihlásiť s novým heslom.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Prihlásiť sa</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-center">Neplatný link</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" asChild>
              <Link href="/auth/forgot-password">Požiadať o nový link</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">Späť na prihlásenie</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Nové heslo</CardTitle>
          <CardDescription className="text-center">Zadajte nové heslo pre váš účet</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Nové heslo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-1 mt-2">
                  {passwordRequirements.map((req, index) => {
                    const met = req.test(formData.password);
                    return (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <Check className={cn('h-3 w-3', met ? 'text-green-600' : 'text-muted-foreground')} />
                        <span className={cn(met ? 'text-green-600' : 'text-muted-foreground')}>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Potvrďte heslo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Heslá sa nezhodujú</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Mením heslo...' : 'Zmeniť heslo'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Späť na prihlásenie
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
