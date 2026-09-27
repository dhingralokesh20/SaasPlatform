import { emailTemplateRepository } from "../../repositories/emailTemplate.repository";
import { invitationTemplate } from "./invitation.seed";
import { otpTemplate } from "./otp.seed";
import { passwordResetTemplate } from "./password-reset.seed";

const templates = [
  passwordResetTemplate,
  otpTemplate,
  invitationTemplate
];

export async function seedEmailTemplates() {
  for (const template of templates) {
    await emailTemplateRepository.createIfNotExists(template);
  }
}