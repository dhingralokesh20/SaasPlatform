import nodemailer, { Transporter } from "nodemailer";
import { EmailProvider } from "./email.provider";
import { envConfig } from "../../config/env.config";

class SmtpProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envConfig.SMTP_HOST,
      port: Number(envConfig.SMTP_PORT),
      secure: envConfig.SMTP_SECURE === "true",
      auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASSWORD,
      },
    });
  }

  async send(data: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: object[];
  }) {
    const result = await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      attachments: data.attachments,
    });

    return {
      providerMessageId: result.messageId,
    };
  }
}

export const smtpProvider = new SmtpProvider();
