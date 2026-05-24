import { envConfig } from "./env.config";

export const redisConfig = {
    host: envConfig.REDIS_HOST,
    port: envConfig.REDIS_PORT
}