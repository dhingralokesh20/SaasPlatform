import { Queue } from "bullmq";
import { redisConfig } from "../config/redis.config";

export const sessionCleanupQueue = new Queue("session-cleanup", {
  connection: redisConfig,
});

export const otpCleanupQueue = new Queue("otp-cleanup", {
  connection: redisConfig,
});
