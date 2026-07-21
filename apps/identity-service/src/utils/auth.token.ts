import { verifyAccessToken } from "./jwt";
import { AppError } from "../errors/AppError";
import { UnauthorizedError } from "../errors/ErrorConfig";

export const getAuthorizedUser = (token: string) => {

  try {
    const decodedToken = verifyAccessToken(token) as {
      userId: string;
      email: string;
      sessionId: string;
    };

    return decodedToken;
  } catch {
    throw new AppError(UnauthorizedError);
  }
}