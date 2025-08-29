// Application configuration utilities

/**
 * Get the base URL for the application
 * Priority: NEXT_PUBLIC_BASE_URL > VERCEL_URL > Request headers > localhost fallback
 */
export function getBaseUrl(request?: Request): string {
  // 1. Check for explicitly set base URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2. Check for Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Try to get from request headers (for server-side)
  if (request) {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                    request.headers.get('x-forwarded-protocol') || 
                    (host?.includes('localhost') ? 'http' : 'https');
    
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  // 4. Check for common deployment environment variables
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  // 5. Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Get the base URL for client-side usage
 */
export function getClientBaseUrl(): string {
  // In browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side fallback
  return getBaseUrl();
}