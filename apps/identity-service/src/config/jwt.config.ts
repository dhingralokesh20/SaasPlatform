import { envConfig } from "./env.config";

export const jwtConfig = {
  accessSecret: envConfig.JWT_ACCESS_SECRET,
  refreshSecret: envConfig.JWT_REFRESH_SECRET,

  accessExpiry: "15m",
  refreshExpiry: "7d",
};
