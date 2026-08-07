import { EmailTemplate } from "../../db/models/email-template.model";
import { BaseRepository } from "./base.repository";

class EmailTemplateRepository extends BaseRepository<EmailTemplate> {
  constructor() {
    super(EmailTemplate);
  }

  async createIfNotExists(data: {
    name: string;
    subject: string;
    body: string;
    variables: object;
    isActive?: boolean;
  }) {
    const existingTemplate = await this.findActiveByName(data.name);

    if (existingTemplate) {
      return existingTemplate;
    }

    return this.create(data);
  }
  async findActiveByName(name: string) {
    return this.findOne({
      name,
      isActive: true,
    });
  }
}

export const emailTemplateRepository = new EmailTemplateRepository();
