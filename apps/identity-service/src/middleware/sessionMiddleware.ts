import { NextFunction, Request, Response } from "express";
import { getAuthorizedUser } from "../utils/auth.token";
import { SessionRepository } from "../repositories/session.repository";
import { UnauthorizedError } from "../errors/ErrorConfig";
import { AppError } from "../errors/AppError";

const sessionRepository = new SessionRepository();

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    sessionId: string;
  };
}

export const SessionMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError(UnauthorizedError);
    }
    const decodedToken = getAuthorizedUser(accessToken);
    const { sessionId } = decodedToken;

    const session = await sessionRepository.findActiveSession(sessionId);
    if (!session) throw new AppError(UnauthorizedError);

    req.user = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};
