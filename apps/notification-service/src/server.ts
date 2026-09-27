import "dotenv/config";
import { logger } from "./logger";
import { startIdentityConsumer } from "./consumers/identity.consumer";
import { connectDB } from "./db";
import { seedEmailTemplates } from "./email/templates/seeds";
import { startEmailWorker } from "./email/worker/email.worker";
import { startworkspaceConsumer } from "./consumers/workspace.consumer";

async function bootstrap() {
  await connectDB();

  await seedEmailTemplates();
  startIdentityConsumer();
  startworkspaceConsumer();
  startEmailWorker();

  logger.info("Notification Service Started");
}

bootstrap();
