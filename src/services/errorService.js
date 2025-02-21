import * as Sentry from '@sentry/react';

export const initErrorTracking = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.VERCEL_ENV || 'production',
      release: process.env.REACT_APP_VERSION,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay()
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

export const logError = (error, context = {}) => {
  console.error(error);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  }
};

export const logMessage = (message, level = 'info', context = {}) => {
  console.log(message);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureMessage(message, level);
    });
  }
};

export const setUserContext = (user) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username
    });
  }
};

export const clearUserContext = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
}; 