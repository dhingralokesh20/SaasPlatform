import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";

const ACCESS_TOKEN_SECRET = envConfig.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = envConfig.JWT_REFRESH_SECRET!;


export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

