import {
  createConsumer,
  connectConsumer,
  disconnectConsumer,
} from "../kafka/kafka.consumer";

import { logger } from "../logger";
import { handleWorkspaceEvent } from "../router/workspaceEvent.router";

const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startworkspaceConsumer() {
  let attempt = 0;

  const consumer = createConsumer("notification-workspace-service");
  while (true) {
    try {
      await connectConsumer(consumer);

      await consumer.subscribe({
        topic: "workspace.events",
        fromBeginning: false,
      });

      logger.info("Subscribed to workspace.events");

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) {
            return;
          }

          const event = JSON.parse(message.value.toString());

          logger.info("workspace event received", {
            eventType: event.eventType,
            eventId: event.eventId,
          });

          await handleWorkspaceEvent(event);
        },
      });

      return;
    } catch (error) {
      logger.error("Kafka consumer startup failed. Retrying...", {
        error,
        attempt: attempt + 1,
      });

      await disconnectConsumer(consumer);

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
