import { kafka } from "./kafka.client";
import { logger } from "../logger";

export const consumer = kafka.consumer({
  groupId: "notification-service-group",
});

export async function connectConsumer() {
  await consumer.connect();

  logger.info("Kafka consumer connected");
}

export async function disconnectConsumer() {
  try {
    await consumer.disconnect();
    logger.info("Kafka consumer disconnected");
  } catch (error) {
    logger.warn("Failed to disconnect Kafka consumer", { error });
  }
}
