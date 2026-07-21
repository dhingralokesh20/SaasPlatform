import { outboxRepository } from "../repositories/outboxEvent.repository";
import { RepositoryOptions } from "../types/repository.types";

interface CreateOutboxEventParams {
  eventType: string;

  aggregateType: string;

  aggregateId?: string | null;

  payload: Record<string, any>;
}

class OutboxEventService {
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

  async getPendingEvents(limit = 100) {
    return outboxRepository.findPendingEvents(limit);
  }

  async markProcessing(id: string, options?: RepositoryOptions) {
    return outboxRepository.markProcessing(id, options);
  }

  async markCompleted(id: string, options?: RepositoryOptions) {
    return outboxRepository.markCompleted(id, options);
  }

  async markFailed(id: string, error: string, options?: RepositoryOptions) {
    await outboxRepository.incrementRetry(id, options);

    return outboxRepository.markFailed(id, error, options);
  }
}

export const outboxEventService = new OutboxEventService();
