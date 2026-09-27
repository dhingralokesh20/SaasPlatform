import { Consumer } from "kafkajs";
import { kafka } from "./kafka.client";
import { logger } from "../logger";

export function createConsumer(groupId: string): Consumer {
  return kafka.consumer({
    groupId,
  });
}

export async function connectConsumer(consumer: Consumer) {
  await consumer.connect();

  logger.info("Kafka consumer connected");
}

export async function disconnectConsumer(consumer: Consumer) {
  try {
    await consumer.disconnect();

    logger.info("Kafka consumer disconnected");
  } catch (error) {
    logger.warn("Failed to disconnect Kafka consumer", {
      error,
    });
  }
}