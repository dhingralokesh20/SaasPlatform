import { AuthController } from "./auth.controller";
import { UserController } from "./user.controller";

const authController = new AuthController();
const userController = new UserController();
export const controllerRegistry = {
  auth: {
    register: authController.register.bind(authController),
    login: authController.login.bind(authController),
    getNewRefreshToken: authController.getNewRefreshToken.bind(authController),
    logoutCurrentSession: authController.logoutCurrentUserSession.bind(authController),
    logoutAllDevices: authController.logoutAllDevices.bind(authController),
    getLoggedInUserState: authController.getLoggedInUserState.bind(authController),
    forgetPassword: authController.forgetPassword.bind(authController),
    validateResetPasswordRequest: authController.validateResetPasswordRequest.bind(authController),
    resetPassword: authController.resetPassword.bind(authController)
  },
  user: {
    getCurrentUser: userController.getCurrentUser.bind(userController)
  },
};
