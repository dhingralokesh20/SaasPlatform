import { validate } from "../middleware/validate.middleware";

const OtpRoutes = {
  basePath: "/otp",
  routes: {
    generate: {
      method: "post",
      handler: "generateOtp",
    },
    validateRequest: {
      method: "post",
      handler: "valiateOtpRequest",
    },
    verify: {
      method: "post",
      handler: "verifyOtp",
    },
    resent: {
      method: "post",
      handler: "resendOtp",
    },
  },
};

export default OtpRoutes;
