import { Kafka } from "kafkajs";
import { kafkaConfig } from "./kafka.config";

export const kafka = new Kafka({
  clientId: kafkaConfig.clientId,

  brokers: kafkaConfig.brokers,
  // connection retry
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});
