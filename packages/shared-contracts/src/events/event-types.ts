export const EventTypes = {
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  OTP_REQUESTED: "OTP_REQUESTED",
  INVITATION_CREATED: "INVITATION_CREATED",
} as const;

export type EventType =
  typeof EventTypes[keyof typeof EventTypes];
