import { producer } from "../kafka/kafka.producer";
import { logger } from "../logger";

class KafkaService {
  async connect() {
    await producer.connect();
    logger.info("✅ Kafka producer connected");
  }

  async disconnect() {
    await producer.disconnect();
    logger.error("🛑 Kafka producer disconnected");
  }
}

export const kafkaService = new KafkaService();
