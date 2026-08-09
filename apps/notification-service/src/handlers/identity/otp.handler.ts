import { emailService } from "../../email/services/email.service";
import { logger } from "../../logger";

export async function handleOtpRequested(event: any) {
  logger.info("Processing OTP request", {
    eventId: event.eventId,
    email: event.payload.email,
  });

  await emailService.sendOtpEmail({
    eventId: event.eventId,
    email: event.payload.email,
    otp: event.payload.otp,
  });
}