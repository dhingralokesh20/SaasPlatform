import { EmailStatus } from "../constants/emailConstants";
import { Email } from "../db/models";
import { BaseRepository } from "./base.repository";

export class EmailRepository extends BaseRepository<Email> {
  async findPendingEmails(limit = 50) {
    return this.findAll({
      status: EmailStatus.PENDING,
      limit,
      order: [["createdAt", "ASC"]],
    });
  }
}
