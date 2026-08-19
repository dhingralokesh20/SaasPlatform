import { AuthMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { ValidatePlatformUserMiddleware } from "../middleware/validatePlatformUser";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validations/organization.validation";

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
    list: {
      method: "get",
      handler: "getUserOrganizations",
      middleware: [AuthMiddleware, ValidatePlatformUserMiddleware],
    },

    ":organizationId": [
      {
        method: "get",
        handler: "getUserOrganization",
        middleware: [AuthMiddleware, ValidatePlatformUserMiddleware],
      },
      {
        method: "patch",
        handler: "updateOrganization",
        middleware: [
          AuthMiddleware,
          ValidatePlatformUserMiddleware,
          validate(updateOrganizationSchema),
        ],
      },
      {
        method: "delete",
        handler: "disableOrganization",
        middleware: [AuthMiddleware, ValidatePlatformUserMiddleware],
      },
    ],
  },
};

export default OrganizationRoutes;
