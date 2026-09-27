import { EventEnvelope } from "../base.event";

export interface InvitationCreatedPayload {
  invitationId: string;
  organizationId: string;
  email: string;
  invitedBy: string;
  token: string;
  expiresAt: string;
}

export type InvitationCreatedEvent =
  EventEnvelope<InvitationCreatedPayload> & {
    eventType: "INVITATION_CREATED";
    aggregateType: "INVITATION";
  };
