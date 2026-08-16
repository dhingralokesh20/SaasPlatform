import { envConfig } from "./env.config";

export const dbConfig = {
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  database: envConfig.DB_NAME,
  username: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
};

export const identityDbConfig = {
  host: envConfig.IDENTITY_DB_HOST,
  port: envConfig.IDENTITY_DB_PORT,
  database: envConfig.IDENTITY_DB_NAME,
  username: envConfig.IDENTITY_DB_USER,
  password: envConfig.IDENTITY_DB_PASSWORD,
};
