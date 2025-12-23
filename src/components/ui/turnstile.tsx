'use client';

import { Turnstile as TurnstileWidget, TurnstileInstance } from '@marsidev/react-turnstile';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export interface TurnstileRef {
  reset: () => void;
  getToken: () => string | null;
}

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'invisible';
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Test key

export const TurnstileCaptcha = forwardRef<TurnstileRef, TurnstileProps>(
  ({ onSuccess, onError, onExpire, className, theme = 'auto', size = 'normal' }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [token, setToken] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
        setToken(null);
        setStatus('idle');
      },
      getToken: () => token,
    }));

    const handleSuccess = (newToken: string) => {
      setToken(newToken);
      setStatus('success');
      onSuccess(newToken);
    };

    const handleError = () => {
      setStatus('error');
      setToken(null);
      onError?.();
    };

    const handleExpire = () => {
      setToken(null);
      setStatus('idle');
      onExpire?.();
    };

    // Use test key for development
    const siteKey = SITE_KEY;

    if (size === 'invisible') {
      return (
        <TurnstileWidget
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={handleSuccess}
          onError={handleError}
          onExpire={handleExpire}
          options={{
            size: 'invisible',
            theme,
          }}
        />
      );
    }

    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Shield className="h-4 w-4" />
          <span>Overenie bezpečnosti</span>
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
          {status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600 ml-auto" />}
        </div>

        <div className="flex justify-center">
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={siteKey}
            onSuccess={handleSuccess}
            onError={handleError}
            onExpire={handleExpire}
            onLoadStart={() => setStatus('loading')}
            options={{
              size,
              theme,
            }}
          />
        </div>

        {status === 'error' && (
          <p className="text-xs text-red-600 text-center">
            Overenie zlyhalo. Skúste to znova alebo obnovte stránku.
          </p>
        )}
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';

// Hook for invisible captcha
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);

  const reset = () => {
    turnstileRef.current?.reset();
    setToken(null);
    setIsVerified(false);
  };

  const handleSuccess = (newToken: string) => {
    setToken(newToken);
    setIsVerified(true);
  };

  return {
    token,
    isVerified,
    reset,
    handleSuccess,
    turnstileRef,
  };
}
