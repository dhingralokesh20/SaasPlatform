export enum OtpType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
  LOGIN_MFA = "LOGIN_MFA",
  INVITE = "INVITE",
}

export enum OtpStatus {
  PENDING = "PENDING",   // inserted in DB, not yet confirmed in Redis
  ACTIVE = "ACTIVE",     // written to Redis successfully, usable
  VERIFIED = "VERIFIED",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED",     // Redis write failed, unusable
  REVOKED = "REVOKED",   // superseded by a resend
  LOCKED = "LOCKED",     // max attempts exceeded
}

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 5 * 60, // 5 minutes
  MAX_VERIFY_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 30,
  MAX_RESENDS_PER_WINDOW: 5,
};