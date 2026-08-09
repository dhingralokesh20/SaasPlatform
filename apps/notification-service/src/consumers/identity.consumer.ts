import {
  consumer,
  connectConsumer,
  disconnectConsumer,
} from "../kafka/kafka.consumer";

import { logger } from "../logger";
import { handleIdentityEvent } from "../router/identityEvent.router";

const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startIdentityConsumer() {
  let attempt = 0;

  while (true) {
    try {
      await connectConsumer();

      await consumer.subscribe({
        topic: "identity.events",
        fromBeginning: false,
      });

      logger.info("Subscribed to identity.events");

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) {
            return;
          }

          const event = JSON.parse(message.value.toString());

          logger.info("Identity event received", {
            eventType: event.eventType,
            eventId: event.eventId,
          });

          await handleIdentityEvent(event);
        },
      });

      return;
    } catch (error) {
      logger.error("Kafka consumer startup failed. Retrying...", {
        error,
        attempt: attempt + 1,
      });

      await disconnectConsumer();

      const retryDelay =
        RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];

      logger.info("Retrying Kafka consumer startup", {
        retryInMs: retryDelay,
      });

      await delay(retryDelay);

      attempt++;
    }
  }
}
