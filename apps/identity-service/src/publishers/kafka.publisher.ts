import { producer } from "../kafka/kafka.producer";
import { EventPublisher } from "./event-publisher.interface";
import { EventEnvelope } from "@worksphere/shared-contracts";

class KafkaPublisher implements EventPublisher {
  async publish<T>(event: EventEnvelope<T>): Promise<void> {
    await producer.connect();

    await producer.send({
      topic: "identity.events",
      acks: -1, // all
      messages: [
        {
          key: event.aggregateId ?? event.eventId,

          value: JSON.stringify(event),
        },
      ],
    });
  }
}

export const kafkaPublisher = new KafkaPublisher();
