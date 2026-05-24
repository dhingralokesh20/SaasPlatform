import pino from "pino";
import { envConfig } from "../config/env.config";

export const logger = pino({
  level: envConfig.NODE_ENV === "production" ? "info" : "debug",
  transport:
    envConfig.NODE_ENV === "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});
