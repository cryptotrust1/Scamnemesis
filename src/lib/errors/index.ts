/**
 * Custom Error Classes for ScamNemesis API
 *
 * These error classes provide structured error handling with:
 * - Consistent error codes
 * - HTTP status codes
 * - Safe error messages for clients
 * - Additional context for logging
 */

/**
 * Base API Error class
 * All custom errors extend this class
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON response format
   */
  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * Validation Error - 400 Bad Request
 * Use for invalid input data, schema validation failures
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'validation_error', 400, details);
  }

  static fromZodError(zodError: { errors: Array<{ path: (string | number)[]; message: string }> }) {
    const fields = zodError.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return new ValidationError('Validation failed', { fields });
  }
}

/**
 * Authentication Error - 401 Unauthorized
 * Use when user is not authenticated or token is invalid
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 'authentication_error', 401);
  }
}

/**
 * Authorization Error - 403 Forbidden
 * Use when user lacks permission for the action
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Permission denied') {
    super(message, 'authorization_error', 403);
  }
}

/**
 * Not Found Error - 404
 * Use when requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', id?: string) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 'not_found', 404, { resource, id });
  }
}

/**
 * Conflict Error - 409
 * Use for duplicate entries, concurrent modifications
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'conflict', 409, details);
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 * Use when rate limit is exceeded
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(message = 'Too many requests', retryAfter?: number) {
    super(message, 'rate_limited', 429, retryAfter ? { retry_after: retryAfter } : undefined);
    this.retryAfter = retryAfter;
  }
}

/**
 * Service Unavailable Error - 503
 * Use when external service is down (S3, database, etc.)
 */
export class ServiceUnavailableError extends ApiError {
  constructor(service: string, message?: string) {
    super(message || `${service} is temporarily unavailable`, 'service_unavailable', 503, { service });
  }
}

/**
 * Internal Server Error - 500
 * Use for unexpected errors (catch-all)
 */
export class InternalError extends ApiError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 'internal_error', 500, undefined, false);
  }
}

/**
 * Database Error - 500
 * Use for database-related errors
 */
export class DatabaseError extends ApiError {
  constructor(operation: string, originalError?: Error) {
    super(`Database operation failed: ${operation}`, 'database_error', 500, {
      operation,
      originalMessage: originalError?.message,
    }, false);
  }
}

/**
 * File Upload Error - 400/413
 * Use for file-related errors
 */
export class FileUploadError extends ApiError {
  constructor(message: string, filename?: string, statusCode = 400) {
    super(message, 'file_upload_error', statusCode, filename ? { filename } : undefined);
  }

  static tooLarge(filename: string, maxSize: number) {
    return new FileUploadError(
      `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
      filename,
      413
    );
  }

  static invalidType(filename: string, allowedTypes: string[]) {
    return new FileUploadError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      filename
    );
  }

  static spoofingDetected(filename: string) {
    return new FileUploadError(
      'File content does not match claimed type (possible spoofing detected)',
      filename
    );
  }
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Convert unknown error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalError(
      process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    );
  }

  return new InternalError();
}
