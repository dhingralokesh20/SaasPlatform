import { EmailStatus, EmailType } from "../../constants/emailConstants";
import { CreateEmailInput } from "../../types/email.types";
import { emailRepository } from "../repositories/email.repository";

class EmailService {
  async create(data: CreateEmailInput) {
    return emailRepository.create({
      eventId: data.eventId,
      type: data.type,
      to: data.to,
      template: data.template,
      payload: data.payload,
      metadata: data.metadata ?? null,
      status: EmailStatus.PENDING,
    });
  }

  async sendPasswordResetEmail(data: {
    eventId: string;
    email: string;
    resetUrl: string;
  }) {
    return this.create({
      eventId: data.eventId,
      type: EmailType.PASSWORD_RESET,
      to: data.email,
      template: "password-reset",
      payload: {
        resetUrl: data.resetUrl,
      },
      metadata: {
        source: "identity-service",
      },
    });
  }

  async sendOtpEmail(data: { eventId: string; email: string; otp: string }) {
    return this.create({
      eventId: data.eventId,
      type: EmailType.OTP,
      to: data.email,
      template: "otp",
      payload: {
        otp: data.otp,
      },
      metadata: {
        source: "identity-service",
      },
    });
  }

  async sendInvitationEmail(data: {
    eventId: string;
    email: string;
    invitationUrl: string;
    expiresAt: string;
  }) {
    return this.create({
      eventId: data.eventId,
      type: EmailType.INVITE,
      to: data.email,
      template: "invitation",
      payload: {
        invitationUrl: data.invitationUrl,
        expiresAt: data.expiresAt,
        year: String(new Date().getFullYear()),
      },
      metadata: {
        source: "workspace-service",
      },
    });
  }
}

export const emailService = new EmailService();
