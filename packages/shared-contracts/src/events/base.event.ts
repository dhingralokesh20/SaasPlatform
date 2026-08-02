export interface EventEnvelope<T> {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string | null;
  version: number;
  publishedAt: string;
  payload: T;
  source: string;
}
