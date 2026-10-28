export const environment = {
  production: true,
  apiUrl: '/api/v1',
  appName: 'Starbucks Egypt Admin',
  enableAnalytics: true,
  logLevel: 'error',
  // Google OAuth Configuration (Production)
  // Relative: resolves against the deployment origin (Vercel domain).
  // Register https://<vercel-domain>/auth/google/callback in Google Console.
  googleOAuth: {
    clientId: '', // Injected from deployment platform (Netlify/Vercel/Azure)
    redirectUri: '/auth/google/callback'
  },
  // Image Configuration
  // Same-origin via the Vercel /api rewrite (proxied to the ASP.NET backend)
  imageConfig: {
    apiBaseUrl: '/api/v1/images',
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize: 5 * 1024 * 1024 // 5MB
  }
};
