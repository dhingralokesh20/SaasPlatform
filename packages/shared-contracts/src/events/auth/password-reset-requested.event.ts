import { EventEnvelope } from "../base.event";

export interface PasswordResetRequestedPayload {
  email: string;
  resetUrl: string;
  year: string;
}

export type PasswordResetRequestedEvent =
  EventEnvelope<PasswordResetRequestedPayload> & {
    eventType: "PASSWORD_RESET_REQUESTED";
    aggregateType: "USER";
  };
