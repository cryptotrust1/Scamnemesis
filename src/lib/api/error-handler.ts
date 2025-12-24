/**
 * Centralized API Error Handler
 *
 * Provides consistent error handling across all API routes:
 * - Automatic Sentry error capture
 * - Structured logging
 * - Consistent error response format
 * - Request ID tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { toApiError, isApiError, ValidationError } from '@/lib/errors';
import { logger as baseLogger } from '@/lib/logger';

interface ErrorHandlerOptions {
  /** Route name for logging (e.g., 'POST /api/v1/reports') */
  route?: string;
  /** Whether to capture error in Sentry (default: true for 5xx errors) */
  captureInSentry?: boolean;
  /** Additional context for error logging */
  context?: Record<string, unknown>;
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract safe request info for logging
 */
function getRequestInfo(request: NextRequest) {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  };
}

/**
 * Handle API errors consistently
 * Use this in catch blocks of API routes
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  options: ErrorHandlerOptions = {}
): NextResponse {
  const requestId = generateRequestId();
  const apiError = toApiError(error);
  const { route = request.url, captureInSentry = apiError.statusCode >= 500, context } = options;

  // Create logger with request context
  const logger = baseLogger.child({
    requestId,
    route,
    ...context,
  });

  // Log the error
  if (apiError.statusCode >= 500) {
    logger.error('API Error', {
      error: {
        name: apiError.name,
        message: apiError.message,
        code: apiError.code,
        statusCode: apiError.statusCode,
        details: apiError.details,
        stack: error instanceof Error ? error.stack : undefined,
      },
      request: getRequestInfo(request),
    });
  } else {
    logger.warn('API Client Error', {
      error: {
        name: apiError.name,
        message: apiError.message,
        code: apiError.code,
        statusCode: apiError.statusCode,
      },
      request: getRequestInfo(request),
    });
  }

  // Capture in Sentry for server errors
  if (captureInSentry) {
    Sentry.withScope((scope) => {
      scope.setTag('request_id', requestId);
      scope.setTag('error_code', apiError.code);
      scope.setTag('route', route);
      scope.setExtra('request', getRequestInfo(request));
      scope.setExtra('error_details', apiError.details);

      if (isApiError(error)) {
        Sentry.captureException(error);
      } else if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(`Unknown error: ${String(error)}`);
      }
    });
  }

  // Return error response
  return NextResponse.json(
    {
      ...apiError.toJSON(),
      request_id: requestId,
    },
    {
      status: apiError.statusCode,
      headers: {
        'X-Request-Id': requestId,
      },
    }
  );
}

/**
 * Wrapper for API route handlers
 * Automatically handles errors and provides consistent response format
 *
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json(data);
 * }, { route: 'GET /api/v1/example' });
 */
export function withErrorHandler<T extends NextRequest>(
  handler: (request: T, context?: { params?: Record<string, string> }) => Promise<NextResponse>,
  options: ErrorHandlerOptions = {}
) {
  return async (request: T, context?: { params?: Record<string, string> }): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request, options);
    }
  };
}

/**
 * Helper to validate request body with Zod schema
 * Throws ValidationError if validation fails
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { errors: Array<{ path: (string | number)[]; message: string }> } } }
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw ValidationError.fromZodError(result.error!);
  }

  return result.data!;
}

/**
 * Helper to validate query params with Zod schema
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { errors: Array<{ path: (string | number)[]; message: string }> } } }
): T {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string | null> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    throw ValidationError.fromZodError(result.error!);
  }

  return result.data!;
}

/**
 * Success response helper with request ID
 */
export function successResponse<T>(
  data: T,
  status = 200,
  headers: Record<string, string> = {}
): NextResponse {
  const requestId = generateRequestId();

  return NextResponse.json(
    { ...data as object, request_id: requestId },
    {
      status,
      headers: {
        'X-Request-Id': requestId,
        ...headers,
      },
    }
  );
}
