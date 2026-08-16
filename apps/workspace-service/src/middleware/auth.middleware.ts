import { NextFunction, Request, Response } from "express";
import { getAuthorizedUser } from "../utils/auth.token";
import { AppError } from "../errors/AppError";
import { UnauthorizedError } from "../errors/ErrorConfig";

export const AuthMiddleware = (
  req: Request,
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