import { z } from "zod";
import { AppError } from "../errors/AppError";
import { InvitationValidationFailedError } from "../errors/ErrorConfig";
import { invitationRepository } from "../repositories/invitation.repository";
import { generateInvitationToken, hashInvitationToken } from "../utils/crypto";

const emailSchema = z.email();

const INVITATION_EXPIRY_DAYS = 7;

type InvitationValidationError = {
  email: string;
  code:
    | "INVALID_EMAIL"
    | "SELF_INVITATION"
    | "ALREADY_MEMBER"
    | "ALREADY_INVITED";
};

export class InvitationService {
  async createInvitations(data: {
    organizationId: string;
    emails: string[];
    invitedBy: string;
    invitedByEmail: string;
  }) {
    // Normalize and remove duplicate emails.
    const normalizedEmails = [
      ...new Set(
        data.emails.map((email) =>
          email.trim().toLowerCase(),
        ),
      ),
    ];

    const validationErrors: InvitationValidationError[] = [];

    // Validate all emails before creating any invitation.
    for (const email of normalizedEmails) {
      const emailValidation = emailSchema.safeParse(email);

      if (!emailValidation.success) {
        validationErrors.push({
          email,
          code: "INVALID_EMAIL",
        });

        continue;
      }

      // Prevent users from inviting themselves.
      if (
        email ===
        data.invitedByEmail.trim().toLowerCase()
      ) {
        validationErrors.push({
          email,
          code: "SELF_INVITATION",
        });

        continue;
      }

      // Prevent duplicate pending invitations.
      const existingInvitation =
        await invitationRepository.findPendingInvitation(
          data.organizationId,
          email,
        );

      if (existingInvitation) {
        validationErrors.push({
          email,
          code: "ALREADY_INVITED",
        });

        continue;
      }

      // TODO: Check whether the email is already a member.
    }

    // Do not create any invitation if validation fails.
    if (validationErrors.length > 0) {
      throw new AppError({
        ...InvitationValidationFailedError,
        data: {
          errors: validationErrors,
        },
      });
    }

    const invitations = [];

    // Create invitations only after all emails pass validation.
    for (const email of normalizedEmails) {
      const token = generateInvitationToken();
      const tokenHash = hashInvitationToken(token);

      const expiresAt = new Date(
        Date.now() +
          INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      );

      const invitation =
        await invitationRepository.createInvitation({
          organizationId: data.organizationId,
          email,
          invitedBy: data.invitedBy,
          tokenHash,
          expiresAt,
        });

      invitations.push({
        invitation,
        token,
      });
    }

    // TODO: Create outbox events in the same transaction.

    return {
      total: invitations.length,
      invited: invitations.length,
      skipped: 0,
      results: invitations.map(({ invitation }) => ({
        email: invitation.email,
        status: "INVITED" as const,
        invitationId: invitation.id,
      })),
    };
  }
}

export const invitationService = new InvitationService();