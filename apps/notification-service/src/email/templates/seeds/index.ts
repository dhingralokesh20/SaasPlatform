import { emailTemplateRepository } from "../../repositories/emailTemplate.repository";
import { otpTemplate } from "./otp.seed";
import { passwordResetTemplate } from "./password-reset.seed";

const templates = [
  passwordResetTemplate,
  otpTemplate
];

export async function seedEmailTemplates() {
  for (const template of templates) {
    await emailTemplateRepository.createIfNotExists(template);
  }
}