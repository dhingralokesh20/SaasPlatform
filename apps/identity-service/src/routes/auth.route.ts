import { AuthMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, registerSchema, refreshTokenSchema } from "../validations/auth.validation";

const AuthRoutes = {
  basePath: "/auth",
  routes: {
    login: {
      method: "post",
      handler: "login",
      middleware: [validate(loginSchema)],
    },
    register: {
      method: "post",
      handler: "register",
      middleware: [validate(registerSchema)],
    },
    refreshToken: {
      method: "post",
      handler: "getNewRefreshToken",
      middleware: [validate(refreshTokenSchema)]
    },
    logout: {
      method: "post",
      handler: "logoutCurrentSession",
      middleware: [AuthMiddleware],
    },
    logoutAll: {
      method: "post",
      handler: "logoutAllDevices",
      middleware: [AuthMiddleware],
    },
  },
};

export default AuthRoutes;
