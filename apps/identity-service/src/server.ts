import "dotenv/config";

import app from "./app";
import { connectDB } from "./db";
import { envConfig } from "./config/env.config";
import { logger } from "./logger";
import { initializeSessionCleanupQueue } from "./scheduler/session-cleanup.scheduler";
import "./workers";

const PORT = envConfig.PORT;

async function bootstrap() {
  await connectDB();
  await initializeSessionCleanupQueue();

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Identity Server running on ${PORT}`);
  });
//   app.listen(3001, , () => {
//   console.log("Server running");
// });
}

bootstrap();