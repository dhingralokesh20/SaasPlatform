import { EmailTemplate } from "../../../db/models/email-template.model";

export const passwordResetTemplate = {
  name: "password-reset",

  subject: "Reset your password",

  body: `
    <h2>Password Reset</h2>

    <p>You requested a password reset.</p>

    <p>
      Click here:
      {{resetUrl}}
    </p>

    <p>
      If you didn't request this, ignore this email.
    </p>
  `,

  variables: {
    resetUrl: "string",
  },

  isActive: true,
};
