import { producer } from "../kafka/kafka.producer";
import { logger } from "../logger";
import { EventPublisher } from "./event-publisher.interface";
import { EventEnvelope } from "@worksphere/shared-contracts";

class KafkaPublisher implements EventPublisher {
  async publish<T>(event: EventEnvelope<T>): Promise<void> {
    await producer.connect();

    await producer.send({
      topic: "workspace.events",
      acks: -1, // all
      messages: [
        {
          key: event.aggregateId ?? event.eventId,

          value: JSON.stringify(event),
        },
      ],
    });
    logger.eventPublished({
      topic: "workspace.events",
      eventId: event.eventId,
      eventType: event.eventType,
    });
  }
}

export const kafkaPublisher = new KafkaPublisher();
