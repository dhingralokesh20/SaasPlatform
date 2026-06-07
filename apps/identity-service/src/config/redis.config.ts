import { envConfig } from "./env.config";

export const redisConfig = {
  host: envConfig.REDIS_HOST,
  port: Number(envConfig.REDIS_PORT),
  maxRetriesPerRequest: null,
};
