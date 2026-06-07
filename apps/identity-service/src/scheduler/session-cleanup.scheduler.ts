import { sessionCleanupQueue } from "../queues/session-cleanup.queue";

export const initializeSessionCleanupQueue = async () => {
  await sessionCleanupQueue.upsertJobScheduler(
    "session-cleanup-scheduler",
    {
      pattern: "0 */6 * * *",
    },
    {
      name: "session-cleanup",
      data: {},
    },
  );
};