import { Worker } from "bullmq";
import { SessionRepository } from "../repositories/session.repository";
import { logger } from "../logger";
// import { redis } from "../redis";
import { redisConfig } from "../config/redis.config";

const sessionRepository = new SessionRepository();

export const sessionCleanupWorker = new Worker(
  "session-cleanup",
  async (job) => {
    const expiredCount = await sessionRepository.deleteExpiredSessions();
    const revokedCount = await sessionRepository.deleteRevokedSessions();

    logger.info(
      `[ SESSION-CLEANUP ] Expired = ${expiredCount}, Revoked = ${revokedCount}`,
    );
  },
  {
    connection: redisConfig,
  },
);
