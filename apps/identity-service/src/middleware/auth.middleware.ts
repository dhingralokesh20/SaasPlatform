import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  errorCode,
  ErrorMessage,
  HttpErrorStatusCode,
} from "../errors/ErrorConfig";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const AuthMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError({
      message: ErrorMessage.UNAUTHORIZED,
      statusCode: HttpErrorStatusCode.UNAUTHORIZED,
      code: errorCode.UNAUTHORIZED,
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch {
    throw new AppError({
      message: ErrorMessage.UNAUTHORIZED,
      statusCode: HttpErrorStatusCode.UNAUTHORIZED,
      code: errorCode.UNAUTHORIZED,
    });
  }
};
