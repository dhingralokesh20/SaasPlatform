import { SessionMiddleware } from "../middleware/sessionMiddleware";
import { validate } from "../middleware/validate.middleware";
import {
  loginSchema,
  registerSchema,
  forgetPasswordSchema,
  validateResetPasswordSchema,
  resetPasswordSchema,
  verifyMFASchema,
  resendMFASchema,
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
    },
    logout: {
      method: "post",
      handler: "logoutCurrentUserSession",
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
    password: {
      forget: {
        method: "post",
        handler: "forgetPassword",
        middleware: [validate(forgetPasswordSchema)],
      },
      validateRequest: {
        method: "post",
        handler: "validateResetPasswordRequest",
        middleware: [validate(validateResetPasswordSchema)],
      },
      reset: {
        method: "post",
        handler: "resetPassword",
        middleware: [validate(resetPasswordSchema)],
      },
    },
    verifyMFA: {
      method: "post",
      handler: "verifyMFA",
      middleware: [validate(verifyMFASchema)]
    },
    resendMFA: {
      method: "post",
      handler: "resendMFA",
      middleware: [validate(resendMFASchema)]
    }
  },
};

export default AuthRoutes;
