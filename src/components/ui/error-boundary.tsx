'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component for catching and handling React errors gracefully.
 * Prevents the entire app from crashing when a component throws an error.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
                </div>
              </div>
              <CardTitle>Nieco sa pokazilo</CardTitle>
              <CardDescription>
                Nastala neocakavana chyba. Skuste obnovit stranku alebo sa vratit na hlavnu stranku.
              </CardDescription>
            </CardHeader>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <CardContent>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technicke detaily
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </CardContent>
            )}

            <CardFooter className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                aria-label="Prejst na hlavnu stranku"
              >
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                Hlavna stranka
              </Button>
              <Button
                onClick={this.handleRetry}
                aria-label="Skusit znova"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Skusit znova
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for programmatically triggering error boundary.
 * Useful for async errors that can't be caught by error boundaries.
 *
 * Usage:
 * ```tsx
 * const throwError = useErrorHandler();
 *
 * useEffect(() => {
 *   fetchData().catch(throwError);
 * }, []);
 * ```
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;
