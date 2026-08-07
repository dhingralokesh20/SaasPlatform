import { emailRepository } from "../repositories/email.repository";
import { logger } from "../../logger";
import { templateService } from "../templates/template.service";
import { emailProvider } from "../providers/email.provider.factory";

const BATCH_SIZE = 10;
const POLL_INTERVAL = 5000;

export async function processPendingEmails() {
  const emails = await emailRepository.findPendingEmails(BATCH_SIZE);

  for (const email of emails) {
    try {
      await emailRepository.markProcessing(email.id);

      logger.info("Processing email", {
        emailId: email.id,
        eventId: email.eventId,
        type: email.type,
        to: email.to,
      });

      const renderedEmail = await templateService.render(
        email.template,
        email.payload,
      );

      const response = await emailProvider.send({
        to: email.to,
        subject: renderedEmail.subject,
        html: renderedEmail.html,
        text: renderedEmail.text,
        // attachments: renderedEmail?.attachments,
      });

      await emailRepository.markSent(email.id, response.providerMessageId);

      logger.info("Email sent successfully", {
        emailId: email.id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error("Failed to process email", {
        emailId: email.id,
        eventId: email.eventId,
        error: errorMessage,
      });

      await emailRepository.markFailed(email.id, errorMessage);
    }
  }
}
export function startEmailWorker() {
  setInterval(async () => {
    try {
      await processPendingEmails();
    } catch (error) {
      logger.error("Email worker failed", {
        error,
      });
    }
  }, POLL_INTERVAL);

  logger.info("Email worker started", {
    pollInterval: POLL_INTERVAL,
    batchSize: BATCH_SIZE,
  });
}
