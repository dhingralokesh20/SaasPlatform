import { consumer } from "../kafka/kafka.consumer";
import { logger } from "../logger";
import { handleIdentityEvent } from "../router/identityEvent.router";

export async function startIdentityConsumer() {
  await consumer.subscribe({
    topic: "identity.events",
    fromBeginning: false,
  });

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
}