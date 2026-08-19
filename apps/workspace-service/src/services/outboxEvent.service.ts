import { sequelize } from "../db/sequelize";
import { EventPublisher } from "../publishers/event-publisher.interface";
import { kafkaPublisher } from "../publishers/kafka.publisher";
import { outboxRepository } from "../repositories/outboxEvent.repository";
import { RepositoryOptions } from "../types/repository.types";

interface CreateOutboxEventParams {
  eventType: string;
  aggregateType: string;
  aggregateId?: string | null;
  payload: Record<string, any>;
}

class OutboxEventService {
  constructor(private readonly publisher: EventPublisher) {}

  async createEvent(
    params: CreateOutboxEventParams,
    options?: RepositoryOptions,
  ) {
    return outboxRepository.createEvent(
      {
        eventType: params.eventType,
        aggregateType: params.aggregateType,
        aggregateId: params.aggregateId ?? null,
        payload: params.payload,
      },
      options,
    );
  }

  async processPendingEvents() {
    const events = await sequelize.transaction(async (transaction) => {
      const pendingEvents = await outboxRepository.findPendingEvents(100, {
        transaction,
      });

      for (const event of pendingEvents) {
        await outboxRepository.markProcessing(event.id, {
          transaction,
        });
      }

      return pendingEvents.map((event) => event.toJSON());
    });

    for (const event of events) {
      try {
        await this.publisher.publish({
          eventId: event.eventId,
          eventType: event.eventType,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          version: event.version,
          source: "workspace-service",
          publishedAt: event.createdAt.toISOString(),
          payload: event.payload,
        });

        await outboxRepository.markCompleted(event.id);
      } catch (error) {
        await outboxRepository.incrementRetry(event.id);

        await outboxRepository.markFailed(
          event.id,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }
  }
}

export const outboxEventService =
  new OutboxEventService(kafkaPublisher);