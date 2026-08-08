import { EventEnvelope } from "@worksphere/shared-contracts";

export interface EventPublisher {
  publish<T>(event: EventEnvelope<T>): Promise<void>;
}