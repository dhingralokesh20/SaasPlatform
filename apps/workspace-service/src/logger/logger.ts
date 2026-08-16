import pino from "pino";

const loggerInstance = pino({
  level: process.env.LOG_LEVEL || "info",

  base: {
    service: process.env.SERVICE_NAME || "workspace-service",
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

export class Logger {
  private logger: pino.Logger;

  constructor(logger: pino.Logger = loggerInstance) {
    this.logger = logger;
  }

  child(bindings: Record<string, unknown>): Logger {
    return new Logger(this.logger.child(bindings));
  }

  info(message: string, data?: unknown) {
    if (data) {
      this.logger.info(data, message);
      return;
    }

    this.logger.info(message);
  }

  error(message: string, data?: unknown) {
    if (data) {
      this.logger.error(data, message);
      return;
    }

    this.logger.error(message);
  }

  warn(message: string, data?: unknown) {
    if (data) {
      this.logger.warn(data, message);
      return;
    }

    this.logger.warn(message);
  }

  debug(message: string, data?: unknown) {
    if (data) {
      this.logger.debug(data, message);
      return;
    }

    this.logger.debug(message);
  }

  eventPublished(data: { topic: string; eventId: string; eventType: string }) {
    this.logger.info(
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
    this.logger.info(
      {
        ...data,
        eventAction: "RECEIVED",
      },
      "Kafka event received",
    );
  }
}

export const logger = new Logger();
