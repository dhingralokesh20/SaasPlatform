import { EventEnvelope } from "../base.event";

export interface OtpRequestedPayload {
  email: string;
  otp: string;
  type: string;
  expiresInSeconds: number;
}

export type OtpRequestedEvent =
  EventEnvelope<OtpRequestedPayload> & {
    eventType: "OTP_REQUESTED";
    aggregateType: "OTP";
  };