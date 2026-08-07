import { emailService } from "../../email/services/email.service";
import { logger } from "../../logger";

export async function handlePasswordResetRequested(event: any) {
    logger.info("Processing password reset request", {
        eventId: event.eventId,
        email: event.payload.email,
    });

    await emailService.sendPasswordResetEmail({
        eventId: event.eventId,
        email: event.payload.email,
        resetUrl: event.payload.resetUrl,
    });
}