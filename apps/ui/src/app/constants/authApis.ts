export const AUTH_APIS = {
  LOGIN: '/auth/login',
  VERIFY_MFA: '/auth/verifyMFA',
  RESEND_MFA: '/auth/resendMFA',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH_TOKEN: '/auth/refreshToken',
  FORGOT_PASSWORD: '/auth/password/forget',
  RESET_PASSWORD: '/auth/password/reset',
} as const;