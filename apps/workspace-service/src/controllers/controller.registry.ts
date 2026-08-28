import { InvitationController } from "./invitation.controller";
import { OrganizationController } from "./organization.controller";

export const controllerRegistry = {
    organization: new OrganizationController(),
    invitation: new InvitationController(),
};
