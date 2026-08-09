import "dotenv/config";
import { logger } from "./logger";
import { connectConsumer } from "./kafka/kafka.consumer";
import { startIdentityConsumer } from "./consumers/identity.consumer";
import { connectDB } from "./db";
import { seedEmailTemplates } from "./email/templates/seeds";
import { startEmailWorker } from "./email/worker/email.worker";

async function bootstrap() {
  await connectDB();

  await seedEmailTemplates();

  startIdentityConsumer();

  startEmailWorker();

  logger.info("Notification Service Started");
}

bootstrap();
