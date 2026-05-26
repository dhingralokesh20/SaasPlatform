import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";

export const generateAccessToken = (
  payload: {
    userId: string;
    email: string;
  }
) => {
  return jwt.sign(
    payload,
    envConfig.JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
    }
  );
};