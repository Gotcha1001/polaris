import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://f58693d4bcaef62e187767f4148d4329@o4509735316815872.ingest.us.sentry.io/4510680286822400",

  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  sendDefaultPii: true,
  integrations: [
    Sentry.vercelAIIntegration,
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
