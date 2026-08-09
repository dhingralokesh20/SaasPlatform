import pino from "pino";

const loggerInstance = pino({
  level: process.env.LOG_LEVEL || "info",

  base: {
    service: process.env.SERVICE_NAME || "notification-service",
  },

  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

class Logger {
  info(message: string, data?: unknown) {
    if (data) {
      loggerInstance.info(data, message);
      return;
    }

    loggerInstance.info(message);
  }

  error(message: string, data?: unknown) {
    if (data) {
      loggerInstance.error(data, message);
      return;
    }

    loggerInstance.error(message);
  }

  warn(message: string, data?: unknown) {
    if (data) {
      loggerInstance.warn(data, message);
      return;
    }

    loggerInstance.warn(message);
  }

  debug(message: string, data?: unknown) {
    if (data) {
      loggerInstance.debug(data, message);
      return;
    }

    loggerInstance.debug(message);
  }
  eventPublished(data: { topic: string; eventId: string; eventType: string }) {
    loggerInstance.info(
      {
        ...data,
        eventAction: "PUBLISHED",
      },
      "Kafka event published",
    );
  }

  eventReceived(data: {
    topic: string;
    eventId: string;
    eventType: string;
    partition?: number;
    offset?: string;
  }) {
    loggerInstance.info(
      {
        ...data,
        eventAction: "RECEIVED",
      },
      "Kafka event received",
    );
  }
}

export const logger = new Logger();
