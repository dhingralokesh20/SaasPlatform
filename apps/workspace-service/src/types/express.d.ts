import { Logger } from "../logger/logger";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      logger: Logger;
      user?: {
        userId: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

export {};
