import "dotenv/config";

import app from "./app";
import { connectDB } from "./db";
import { envConfig } from "./config/env.config";
import { logger } from "./logger";

const PORT = envConfig.PORT;

async function bootstrap() {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Identity Server running on ${PORT}`);
  });
}

bootstrap();