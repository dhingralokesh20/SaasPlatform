import { emailTemplateRepository } from "../repositories/emailTemplate.repository";
import { renderTemplate } from "./renderer";

class TemplateService {
  async render(templateName: string, payload: Record<string, any>) {
    const template =
      await emailTemplateRepository.findActiveByName(templateName);

    if (!template) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    return {
      subject: renderTemplate(template.subject, payload),

      html: renderTemplate(template.body, payload),

      text: undefined,
    };
  }
}

export const templateService = new TemplateService();
