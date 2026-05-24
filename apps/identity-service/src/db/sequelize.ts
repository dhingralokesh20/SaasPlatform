import { Sequelize } from "sequelize";
import { dbConfig } from "../config/db.config";


export const sequelize = new Sequelize({
  dialect: "postgres",

  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,

  logging: false,
});
