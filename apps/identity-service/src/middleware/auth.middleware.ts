import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  UnauthorizedError,
} from "../errors/ErrorConfig";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    sessionId: string;
  };
}

export const AuthMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(UnauthorizedError);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token) as {
      userId: string;
      email: string;
      sessionId: string;
    };

    req.user = decoded;
    next();
  } catch {
    throw new AppError(UnauthorizedError);
  }
};
