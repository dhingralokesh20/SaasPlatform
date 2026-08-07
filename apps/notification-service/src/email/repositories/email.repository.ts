import { Email } from "../../db/models/email.model";
import { EmailStatus } from "../../constants/emailConstants";
import { BaseRepository } from "./base.repository";
import { CreateEmailInput } from "../../types/email.types";

class EmailRepository extends BaseRepository<Email> {
  constructor() {
    super(Email);
  }

  async findByEventId(eventId: string) {
    return this.findOne({
      eventId,
    });
  }

  async findPendingEmails(limit = 10) {
    return Email.findAll({
      where: {
        status: EmailStatus.PENDING,
      },
      order: [["createdAt", "ASC"]],
      limit,
    });
  }

  async markProcessing(id: string) {
    return this.update(
      {
        id,
      },
      {
        status: EmailStatus.PROCESSING,
        processedAt: new Date(),
      },
    );
  }

  async markSent(id: string, providerMessageId?: string) {
    return this.update(
      {
        id,
      },
      {
        status: EmailStatus.SENT,
        providerMessageId,
        sentAt: new Date(),
      },
    );
  }

  async markFailed(id: string, error: string) {
    return this.update(
      {
        id,
      },
      {
        status: EmailStatus.FAILED,
        lastError: error,
      },
    );
  }

  async createIfNotExists(data: CreateEmailInput) {
    const existing = await this.findByEventId(data.eventId);

    if (existing) {
      return existing;
    }

    return this.create({
      ...data,
      status: EmailStatus.PENDING,
    });
  }
}

export const emailRepository = new EmailRepository();
