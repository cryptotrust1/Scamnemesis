/**
 * Feature Flags Configuration
 *
 * Environment-based feature toggles for the application.
 * All features can be enabled/disabled via environment variables.
 */

export const FEATURES = {
  /**
   * Swagger UI / API Documentation
   *
   * ENABLE_SWAGGER_UI: 'true' to enable /docs endpoint (default: false)
   * SWAGGER_REQUIRE_AUTH: 'false' to disable auth requirement (default: true)
   */
  SWAGGER_UI: {
    /** Whether Swagger UI is enabled */
    enabled: process.env.ENABLE_SWAGGER_UI === 'true',
    /** Whether authentication is required to access docs */
    requireAuth: process.env.SWAGGER_REQUIRE_AUTH !== 'false',
    /** Roles allowed to access docs (checked via scopes) */
    allowedScopes: ['admin:read', '*'],
    /** Enable "Try it out" only in development */
    tryItOutEnabled: process.env.NODE_ENV === 'development',
  },
} as const;

/**
 * Check if user scopes include any of the allowed scopes
 */
export function hasAllowedScope(
  userScopes: string[],
  allowedScopes: string[]
): boolean {
  if (userScopes.includes('*')) return true;
  return userScopes.some((scope) => allowedScopes.includes(scope));
}
