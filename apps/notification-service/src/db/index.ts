import { sequelize } from "./sequelize";
import "./models";
import { logger } from "../logger";
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info("Database connected");
  } catch (error) {
    logger.error(`Database connection failed, ${error}`);

    process.exit(1);
  }
};
