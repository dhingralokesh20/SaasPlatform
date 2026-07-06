import { SessionMiddleware } from "../middleware/sessionMiddleware";
import { validate } from "../middleware/validate.middleware";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgetPasswordSchema,
  validateResetPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";

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
      middleware: [validate(refreshTokenSchema)],
    },
    logout: {
      method: "post",
      handler: "logoutCurrentSession",
      middleware: [SessionMiddleware],
    },
    logoutAll: {
      method: "post",
      handler: "logoutAllDevices",
      middleware: [SessionMiddleware],
    },
    me: {
      method: "get",
      handler: "getLoggedInUserState",
      middleware: [SessionMiddleware],
    },
    forgetPassword: {
      method: "post",
      handler: "forgetPassword",
      middleware: [validate(forgetPasswordSchema)],
    },
    validateResetPasswordRequest: {
      method: "post",
      handler: "validateResetPasswordRequest",
      middleware: [validate(validateResetPasswordSchema)],
    },
    resetPassword: {
      method: "post",
      handler : "resetPassword",
      middlware: [validate(resetPasswordSchema)]
    }
  },
};

export default AuthRoutes;
