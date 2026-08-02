import { OutboxEvent } from "../db/models/outboxEvent.model";
import { RepositoryOptions } from "../types/repository.types";
import { BaseRepository } from "./base.repository";

export class OutboxRepository extends BaseRepository<OutboxEvent> {
  constructor() {
    super(OutboxEvent);
  }

  async findPendingEvents(limit = 100, options?: RepositoryOptions) {
    return this.model.findAll({
      where: {
        status: "PENDING",
      },
      order: [["createdAt", "ASC"]],
      limit,
      lock: true,
      skipLocked: true,
      transaction: options?.transaction,
    });
  }

  async createEvent(
    data: {
      eventType: string;
      aggregateType: string;
      aggregateId?: string | null;
      payload: Record<string, any>;
    },
    options?: RepositoryOptions,
  ) {
    return this.create(
      {
        eventType: data.eventType,
        aggregateType: data.aggregateType,
        aggregateId: data.aggregateId ?? null,
        payload: data.payload,
        status: "PENDING",
        retryCount: 0,
      },
      options,
    );
  }

  async markProcessing(id: string, options?: RepositoryOptions) {
    return this.update(
      {
        id,
        status: "PENDING",
      },
      {
        status: "PROCESSING",
      },
      options,
    );
  }

  async markCompleted(id: string, options?: RepositoryOptions) {
    return this.update(
      {
        id,
        status: "PROCESSING",
      },
      {
        status: "COMPLETED",
        processedAt: new Date(),
      },
      options,
    );
  }

  async markFailed(id: string, error: string, options?: RepositoryOptions) {
    return this.update(
      {
        id,
        status: "PROCESSING",
      },
      {
        status: "FAILED",
        lastError: error,
      },
      options,
    );
  }

  async incrementRetry(id: string, options?: RepositoryOptions) {
    return this.model.increment("retryCount", {
      where: {
        id,
      },

      transaction: options?.transaction,
    });
  }
}

export const outboxRepository = new OutboxRepository();
