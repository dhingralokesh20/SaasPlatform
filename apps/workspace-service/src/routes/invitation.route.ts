import { AuthMiddleware } from "../middleware/auth.middleware";
import { ValidatePlatformUserMiddleware } from "../middleware/validatePlatformUser";
import { validate } from "../middleware/validate.middleware";
import { createInvitationSchema } from "../validations/invitation.validation";

const InvitationRoutes = {
  basePath: "/invitation",

  routes: {
    ":organizationId": {
      create: {
        method: "post",
        handler: "createInvitations",
        middleware: [
          AuthMiddleware,
          ValidatePlatformUserMiddleware,
          validate(createInvitationSchema),
        ],
      },
    },
  },
};

export default InvitationRoutes;