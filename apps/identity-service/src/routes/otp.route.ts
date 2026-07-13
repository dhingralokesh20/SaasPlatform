import { validate } from "../middleware/validate.middleware";
import {
  generateOtpSchema,
  resendOtpSchema,
  validateOtpRequestSchema,
  verifyOtpSchema,
} from "../validations/otp.validation";

const OtpRoutes = {
  basePath: "/otp",
  routes: {
    generate: {
      method: "post",
      handler: "generateOtp",
      middleware: [validate(generateOtpSchema)],
    },
    validateRequest: {
      method: "post",
      handler: "validateOtpRequest",
      middleware: [validate(validateOtpRequestSchema)],
    },
    verify: {
      method: "post",
      handler: "verifyOtp",
      middleware: [validate(verifyOtpSchema)],
    },
    resend: {
      method: "post",
      handler: "resendOtp",
      middleware: [validate(resendOtpSchema)],
    },
  },
};

export default OtpRoutes;