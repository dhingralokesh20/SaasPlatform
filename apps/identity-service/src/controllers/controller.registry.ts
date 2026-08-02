import { AuthController } from "./auth.controller";
import { UserController } from "./user.controller";

export const controllerRegistry = {
  auth: new AuthController(),
  user: new UserController(),
};
