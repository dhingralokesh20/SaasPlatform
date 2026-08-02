import { EmailRepository } from "../repositories/email.repository";
import { EmailService } from "../services/email.service";

export class EmailWorker {
  constructor(private readonly emailService: EmailService,
    private readonly emailRepostiory: EmailRepository
  ) {}

  async processPendingEmails() {
    const pendingEmails = await this.emailRepostiory.findPendingEmails();

    for (const email of pendingEmails) {
      await this.emailService.process(email.id);
    }
  }
}