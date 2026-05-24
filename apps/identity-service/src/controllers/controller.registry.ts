import { AuthController } from "./auth.controller";

const authController = new AuthController();

export const controllerRegistry = {
    auth: {
        register: authController.register.bind(authController),
        login: authController.login.bind(authController),
        getUserById: authController.getUserById.bind(authController)
    }
}