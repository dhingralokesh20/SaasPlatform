import { emailTemplateRepository } from "../../repositories/emailTemplate.repository";
import { passwordResetTemplate } from "./password-reset.seed";

const templates = [
  passwordResetTemplate,
];

export async function seedEmailTemplates() {
  for (const template of templates) {
    await emailTemplateRepository.createIfNotExists(template);
  }
}