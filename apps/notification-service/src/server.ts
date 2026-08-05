import "dotenv/config";
import { logger } from "./logger";
import { connectConsumer } from "./kafka/kafka.consumer";
import { startIdentityConsumer } from "./consumers/identity.consumer";
import { connectDB } from "./db";

async function bootstrap() {
  await connectDB();
  await connectConsumer();

  await startIdentityConsumer();

  logger.info("Notification Service Started");
}

bootstrap();
