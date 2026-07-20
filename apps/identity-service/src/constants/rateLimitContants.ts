export const RATE_LIMITS = {
  OTP_GENERATE: {
    limit: 5,
    windowSeconds: 15 * 60,
  },

  MFA_VERIFY: {
    limit: 5,
    windowSeconds: 5 * 60,
  },

  LOGIN: {
    limit: 5,
    windowSeconds: 15 * 60,
  },

  FORGOT_PASSWORD: {
    limit: 3,
    windowSeconds: 15 * 60,
  },
} as const;
