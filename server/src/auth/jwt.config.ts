/**
 * Returns the JWT signing secret. Requires `JWT_SECRET` in production
 * so deployments never silently fall back to a hardcoded development key.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production');
    }
    return 'dev-only-insecure-jwt-secret-change-in-env';
  }
  return secret;
}
