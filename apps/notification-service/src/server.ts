import { logger } from "./logger";
import { connectConsumer } from "./kafka/kafka.consumer";
import { startIdentityConsumer } from "./consumers/identity.consumer";

async function bootstrap() {
  await connectConsumer();

  await startIdentityConsumer();

  logger.info("Notification Service Started");
}

bootstrap();
