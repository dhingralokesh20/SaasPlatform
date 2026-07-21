import { otpCleanupQueue } from "../queues/queues";

export const initializeOtpCleanupQueue = async () => {
  await otpCleanupQueue.upsertJobScheduler(
    "otp-cleanup-scheduler",
    {
      pattern: "0 3 * * *",
    },
    {
      name: "otp-cleanup",
      data: {},
    },
  );
};