import { AuthController } from "./auth.controller";
import { OtpController } from "./otp.controller";
import { UserController } from "./user.controller";

export const controllerRegistry = {
  auth: new AuthController(),
  user: new UserController(),
  otp: new OtpController(),
};
