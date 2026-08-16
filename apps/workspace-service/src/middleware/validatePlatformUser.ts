import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { UnauthorizedError } from "../errors/ErrorConfig";
import { PlatformUserRepository } from "../repositories/platformUserRepository";

const platformUserRepo = new PlatformUserRepository();
export const ValidatePlatformUserMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new AppError(UnauthorizedError);
  }

  const platformUser = await platformUserRepo.findPlatformUserById(req.user.userId);

  if (!platformUser) {
    throw new AppError(UnauthorizedError);
  }

  if (platformUser.status !== "ACTIVE") {
    throw new AppError(UnauthorizedError);
  }

  next();
};