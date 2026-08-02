import { consumer } from "../kafka/kafka.consumer";
import { logger } from "../logger";

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

      switch (event.eventType) {
        case "PASSWORD_RESET_REQUESTED":
          logger.info("Password reset event received", event.payload);

          break;

        default:
          logger.warn("Unhandled identity event", {
            eventType: event.eventType,
          });
      }
    },
  });
}
