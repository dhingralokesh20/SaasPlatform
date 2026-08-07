import { EmailType } from "../constants/emailConstants";

export interface CreateEmailInput {
  eventId: string;
  type: EmailType;
  to: string;
  template: string;
  payload: object;
  metadata?: object;
}