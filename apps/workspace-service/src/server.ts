import "dotenv/config";
import app from "./app";
import { connectDB } from "./db";
import { envConfig } from "./config/env.config";
import { logger } from "./logger";
import "./workers";
import { kafkaService } from "./services/kafka.service";

const PORT = envConfig.PORT;

async function bootstrap() {
  await connectDB();
  await kafkaService.connect();

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Identity Server running on ${PORT}`);
  });
}

bootstrap();
