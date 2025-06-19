import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://184edf77bb8057844b8d0a404a2e49a0@o4509522711740416.ingest.de.sentry.io/4509522739593296",
  
  // Enable logging functionality
  _experiments: {
    enableLogs: true
  },
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
});