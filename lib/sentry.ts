import * as Sentry from '@sentry/nextjs'

// Initialize Sentry with your configuration
Sentry.init({
  dsn: "https://184edf77bb8057844b8d0a404a2e49a0@o4509522711740416.ingest.de.sentry.io/4509522739593296",
  
  // Enable logging functionality
  _experiments: {
    enableLogs: true
  },
  
  // Configure error logging integration
  integrations: [
    // Capture console.error logs automatically
    Sentry.consoleLoggingIntegration({ 
      levels: ["error"]
    })
  ],

  // Set minimum log level to error
  beforeSend(event) {
    if (event.level === 'error') {
      return event;
    }
    return null;
  },

  // Additional error tracking configuration
  tracesSampleRate: 1.0,
  enableTracing: true,
  debug: process.env.NODE_ENV === 'development',
  attachStacktrace: true,
  
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

// Enhanced logger with Sentry integration
export const logger = {
  error: (message: string, context?: any) => {
    console.error(message, context);
    Sentry.captureException(new Error(message), {
      extra: context,
      tags: {
        component: 'evepass-app'
      }
    });
  },
  
  warn: (message: string, context?: any) => {
    console.warn(message, context);
    Sentry.captureMessage(message, 'warning');
  },
  
  info: (message: string, context?: any) => {
    console.info(message, context);
    if (process.env.NODE_ENV === 'development') {
      Sentry.captureMessage(message, 'info');
    }
  },
  
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, context);
    }
  }
};

// Helper function for wrapping async operations
export const withSentryErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Operation failed: ${context || 'Unknown operation'}`, {
      error: error instanceof Error ? error.message : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined,
      context
    });
    throw error;
  }
};

// Export Sentry for direct use when needed
export { Sentry };