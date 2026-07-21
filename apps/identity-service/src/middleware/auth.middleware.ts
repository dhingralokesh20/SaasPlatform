import { NextFunction, Request, Response } from "express";
import { getAuthorizedUser } from "../utils/auth.token";
import { AppError } from "../errors/AppError";
import { UnauthorizedError } from "../errors/ErrorConfig";

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
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new AppError(UnauthorizedError);
  }
  req.user = getAuthorizedUser(accessToken);

  next();
};
