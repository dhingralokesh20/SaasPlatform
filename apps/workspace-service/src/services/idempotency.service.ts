import { redis } from "../redis";
import {
  IDEMPOTENCY_STATUS,
  IDEMPOTENCY_TTL,
} from "../constants/idempotency.constants";
import { redisKeys } from "../utils/redisKeys";

interface ProcessingRecord {
  status: typeof IDEMPOTENCY_STATUS.PROCESSING;
  createdAt: string;
}

interface CompletedRecord {
  status: typeof IDEMPOTENCY_STATUS.COMPLETED;
  response: unknown;
  createdAt: string;
}

type IdempotencyRecord = ProcessingRecord | CompletedRecord;

export class IdempotencyService {
  private getKey(userId: string, idempotencyKey: string) {
    return redisKeys.organizationIdempotency(userId, idempotencyKey);
  }

  async acquire(
    userId: string,
    idempotencyKey: string,
  ): Promise<"ACQUIRED" | "PROCESSING" | CompletedRecord> {
    const key = this.getKey(userId, idempotencyKey);

    const record: ProcessingRecord = {
      status: IDEMPOTENCY_STATUS.PROCESSING,
      createdAt: new Date().toISOString(),
    };

    const acquired = await redis.set(
      key,
      JSON.stringify(record),
      "EX",
      IDEMPOTENCY_TTL.PROCESSING,
      "NX",
    );

    if (acquired === "OK") {
      return "ACQUIRED";
    }

    const existingValue = await redis.get(key);

    if (!existingValue) {
      // Small race where the key expired between SET NX and GET.
      return this.acquire(userId, idempotencyKey);
    }

    const existingRecord = JSON.parse(existingValue) as IdempotencyRecord;

    if (existingRecord.status === IDEMPOTENCY_STATUS.PROCESSING) {
      return "PROCESSING";
    }

    return existingRecord;
  }

  async markCompleted(
    userId: string,
    idempotencyKey: string,
    response: unknown,
  ) {
    const key = this.getKey(userId, idempotencyKey);

    const record: CompletedRecord = {
      status: IDEMPOTENCY_STATUS.COMPLETED,
      response,
      createdAt: new Date().toISOString(),
    };

    await redis.set(
      key,
      JSON.stringify(record),
      "EX",
      IDEMPOTENCY_TTL.COMPLETED,
    );
  }
  async markFailed(userId: string, idempotencyKey: string, _error?: string) {
    const key = this.getKey(userId, idempotencyKey);

    await redis.del(key);
  }
}
