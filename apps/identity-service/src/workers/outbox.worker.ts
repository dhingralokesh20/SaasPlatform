import { logger } from "../logger";
import { outboxEventService } from "../services/outboxEvent.service";

let running = false;

export const startOutboxWorker = () => {
  logger.info("📦 Outbox worker started");

  setInterval(async () => {
    if (running) {
      return;
    }

    try {
      running = true;

      await outboxEventService.processPendingEvents();
    } catch (error) {
      logger.error(`Outbox worker failed:, ${error}`);
    } finally {
      running = false;
    }
  }, 5000);
};
