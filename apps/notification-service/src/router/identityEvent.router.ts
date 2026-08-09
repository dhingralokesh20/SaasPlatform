import { handleOtpRequested } from "../handlers/identity/otp.handler";
import { handlePasswordResetRequested } from "../handlers/identity/passwordReset.handler";
import { logger } from "../logger";

export async function handleIdentityEvent(event: any) {
  switch (event.eventType) {
    case "PASSWORD_RESET_REQUESTED":
      await handlePasswordResetRequested(event);
      break;
    case "OTP_REQUESTED":
      await handleOtpRequested(event);
      break;
    default:
      logger.warn("Unhandled identity event", {
        eventType: event.eventType,
      });
  }
}
