import { EmailType, EmailStatus } from "../constants/emailConstants";
import { Email } from "../db/models";
import { TemplateLoader } from "../emails/template.loader";
import { renderTemplate } from "../emails/template.renderer";

export class EmailService {
  private templateLoader = new TemplateLoader();

  async queue(input: {
    type: EmailType;
    to: string;
    subject?: string;
    mappings: any;
    attachments?: any;
  }) {
    const email = await Email.create({
      type: input.type,
      to: input.to,
      subject: input.subject ?? null,
      payload: input.mappings,
      attachments: input.attachments ?? null,
      status: EmailStatus.PENDING,
      attempts: 0,
    });

    this.process(email.id);

    return email;
  }

  async process(emailId: string) {
    const email = await Email.findByPk(emailId);
    if (!email) return;

    try {
      await email.update({
        status: EmailStatus.PROCESSING,
      });

      const html = this.buildEmailHtml(email.type, email.payload);

      const providerMessageId = await this.sendEmail(
        email.to,
        email.subject ?? "Notification",
        html,
      );

      await email.update({
        status: EmailStatus.SENT,
        sentAt: new Date(),
        providerMessageId,
      });
    } catch (err: any) {
      await email.update({
        status: EmailStatus.FAILED,
        lastError: err.message,
        attempts: email.attempts + 1,
      });
    }
  }

  private buildEmailHtml(type: EmailType, mappings: any) {
    const template = this.templateLoader.loadTemplate(type);
    return renderTemplate(template, mappings);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    console.log("Sending email:", { to, subject });
    return "mock-id";
  }
}
