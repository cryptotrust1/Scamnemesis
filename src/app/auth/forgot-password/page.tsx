'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Ak existuje účet s týmto emailom, dostanete link na reset hesla.');
      } else if (response.status === 429) {
        const error = await response.json();
        toast.error(error.message || 'Príliš veľa pokusov. Skúste to neskôr.');
      } else {
        // Always show success to prevent email enumeration
        setIsSubmitted(true);
      }
    } catch {
      toast.error('Chyba pri odosielaní. Skúste to znova.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">Email odoslaný</CardTitle>
            <CardDescription className="text-center">
              Ak existuje účet s emailom <strong>{email}</strong>, dostanete email s inštrukciami na reset hesla.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Skontrolujte si aj priečinok SPAM. Link je platný 1 hodinu.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Späť na prihlásenie
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Skúsiť iný email
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
          <CardTitle className="text-2xl text-center">Zabudnuté heslo</CardTitle>
          <CardDescription className="text-center">
            Zadajte svoj email a pošleme vám link na obnovenie hesla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Odosielanie...' : 'Obnoviť heslo'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Spomenuli ste si na heslo?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Prihláste sa
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
