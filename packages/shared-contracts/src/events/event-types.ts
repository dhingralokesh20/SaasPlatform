export const EventTypes = {
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
} as const;

export type EventType =
  typeof EventTypes[keyof typeof EventTypes];