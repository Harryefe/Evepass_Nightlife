import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://184edf77bb8057844b8d0a404a2e49a0@o4509522711740416.ingest.de.sentry.io/4509522739593296",
  
  // Enable logging functionality
  _experiments: {
    enableLogs: true
  },
  
  // Configure error logging integration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // User context
  beforeSend(event, hint) {
    // Add user context if available
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          event.user = {
            id: userData.id,
            email: userData.email,
            user_type: userData.user_type
          };
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    return event;
  }
});