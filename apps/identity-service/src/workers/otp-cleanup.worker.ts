import { Worker } from "bullmq";
import { otpRepository } from "../repositories/otp.repository";
import { logger } from "../logger";
import { redisConfig } from "../config/redis.config";

export const otpCleanupWorker = new Worker(
    "otp-cleanup",
    async (job) => {
        const [staleCount] = await otpRepository.markStaleActiveAsFailed();
        const purgedCount = await otpRepository.deleteOlderThan(
            new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        );

        logger.info(`[ OTP-CLEANUP ] Stale=${staleCount}, Purged=${purgedCount}`);
    },
    {
        connection: redisConfig,
    },
);