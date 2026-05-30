import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";

const ACCESS_TOKEN_SECRET = envConfig.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = envConfig.JWT_REFRESH_SECRET!;

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateAccessToken = (payload: {
  userId: string;
  email: string;
}) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}
