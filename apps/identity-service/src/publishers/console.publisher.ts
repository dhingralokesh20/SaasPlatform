import { EventEnvelope } from "@worksphere/shared-contracts";
import { EventPublisher } from "./event-publisher.interface";

export class ConsolePublisher implements EventPublisher {
  async publish<T>(event: EventEnvelope<T>): Promise<void> {
    console.log("Publishing event:");
    console.log(JSON.stringify(event, null, 2));
  }
}

export const consolePublisher = new ConsolePublisher();