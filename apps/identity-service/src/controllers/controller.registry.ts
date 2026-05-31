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
  },
  user: {
    getCurrentUser: userController.getCurrentUser.bind(userController)
  },
};
