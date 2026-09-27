import { emailService } from "../../email/services/email.service";
import { logger } from "../../logger";

export async function handleInvitationCreated(event: any) {
  logger.info("Processing invitation created event", {
    eventId: event.eventId,
    invitationId: event.payload.invitationId,
    email: event.payload.email,
  });

  await emailService.sendInvitationEmail({
    eventId: event.eventId,
    email: event.payload.email,
    invitationUrl: event.payload.invitationUrl,
    expiresAt: event.payload.expiresAt,
  });
}