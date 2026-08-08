import { Partitioners } from "kafkajs";
import { kafka } from "./kafka.client";

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
  createPartitioner: Partitioners.DefaultPartitioner,
  retry: {
    retries: 5,
  },
});
