import { logger } from "../../logger";

export async function handlePasswordResetRequested(event: any) {
  logger.info("Processing password reset request", {
    eventId: event.eventId,
    email: event.payload.email,
  });

  /*
    Next step:
      await emailService.send(...)
  */
}