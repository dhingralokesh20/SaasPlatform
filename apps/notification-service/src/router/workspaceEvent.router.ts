import { handleInvitationCreated } from "../handlers/workspace/invitation.handler";
import { logger } from "../logger";

export async function handleWorkspaceEvent(event: any) {
  switch (event.eventType) {
    case "INVITATION_CREATED":
      await handleInvitationCreated(event);
      break;
    default:
      logger.warn("Unhandled workspace event", {
        eventType: event.eventType,
      });
  }
}
