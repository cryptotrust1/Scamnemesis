/**
 * Structured Logging for ScamNemesis
 * Uses Winston for production-grade logging with request tracking
 */

import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'ISO' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Development format with colors
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, requestId, service, ...meta }) => {
    const reqIdStr = requestId ? `[${requestId}]` : '';
    const serviceStr = service ? `[${service}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${serviceStr}${reqIdStr} ${message}${metaStr}`;
  })
);

// Create the base logger
const baseLogger = winston.createLogger({
  level: logLevel,
  format: isDevelopment ? devFormat : structuredFormat,
  defaultMeta: { app: 'scamnemesis' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Request context type
interface LogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  [key: string]: unknown;
}

// Logger interface for type safety
interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(context: LogContext): Logger;
}

// Create a child logger with context
function createChildLogger(context: LogContext): Logger {
  const childLogger = baseLogger.child(context);

  return {
    debug: (message: string, meta?: Record<string, unknown>) => {
      childLogger.debug(message, meta);
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      childLogger.info(message, meta);
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      childLogger.warn(message, meta);
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      childLogger.error(message, meta);
    },
    child: (additionalContext: LogContext) => {
      return createChildLogger({ ...context, ...additionalContext });
    },
  };
}

// Main logger export
export const logger: Logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    baseLogger.debug(message, meta);
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    baseLogger.info(message, meta);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    baseLogger.warn(message, meta);
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    baseLogger.error(message, meta);
  },
  child: createChildLogger,
};

// Utility to create a request-scoped logger
export function createRequestLogger(requestId: string, service?: string): Logger {
  return createChildLogger({
    requestId,
    ...(service && { service }),
  });
}

// Generate unique request ID
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

// Re-export for convenience
export type { Logger, LogContext };
