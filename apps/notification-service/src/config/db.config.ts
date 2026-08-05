import { envConfig } from "./env.config";

export const dbConfig = {
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  database: envConfig.DB_NAME,
  username: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
};
