import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";
import { RefreshTokenPayload } from "../types/session.types";

const ACCESS_TOKEN_SECRET = envConfig.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = envConfig.JWT_REFRESH_SECRET!;


const RESET_PASSWORD_TOKEN_SECRET = envConfig.RESET_PASSWORD_TOKEN_SECRET!;


const ACCESS_TOKEN_EXPIRY = "15m";
const RESET_PASSWORD_TOKEN_EXPIRY = "30m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateAccessToken = (payload: {
  userId: string;
  email: string;
  sessionId: string;
}) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

export const generateResetPasswordToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, RESET_PASSWORD_TOKEN_SECRET, {
    expiresIn: RESET_PASSWORD_TOKEN_EXPIRY,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

export const verifyResetPasswordToken = (token : string) => {
  return jwt.verify(token, RESET_PASSWORD_TOKEN_SECRET);
}