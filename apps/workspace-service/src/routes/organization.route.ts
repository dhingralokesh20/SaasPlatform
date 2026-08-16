import { AuthMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { ValidatePlatformUserMiddleware } from "../middleware/validatePlatformUser";
import { createOrganizationSchema } from "../validations/organization.validation";

const OrganizationRoutes = {
  basePath: "/organization",

  routes: {
    create: {
      method: "post",
      handler: "createOrganization",
      middleware: [
        AuthMiddleware,
        ValidatePlatformUserMiddleware,
        validate(createOrganizationSchema),
      ],
    },
  },
};

export default OrganizationRoutes;