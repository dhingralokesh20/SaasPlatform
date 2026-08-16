import { Sequelize } from "sequelize";
import { identityDbConfig } from "../config/db.config";

export const identitySequelize = new Sequelize({
  dialect: "postgres",

  host: identityDbConfig.host,
  port: identityDbConfig.port,
  database: identityDbConfig.database,
  username: identityDbConfig.username,
  password: identityDbConfig.password,

  logging: false,
});