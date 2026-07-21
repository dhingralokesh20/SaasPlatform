import { EmailType } from "../constants/emailConstants";

export const EmailTemplateMap: Record<EmailType, string> = {
  [EmailType.FORGOT_PASSWORD]: "forgot-password.html",
  [EmailType.OTP]: "otp.html",
  [EmailType.INVITE]: "invite.html",
  [EmailType.EXPORT_USERS]: "export-users.html",
  [EmailType.ACCOUNT_DEACTIVATED]: "account-decativated.html",
};
