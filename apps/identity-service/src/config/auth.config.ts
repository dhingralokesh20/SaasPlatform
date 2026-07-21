import { envConfig } from "./env.config";

export const authConfig = {
  mfaEnabled: envConfig.MFA_ENABLED === "true",
};