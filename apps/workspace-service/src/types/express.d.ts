import { Logger } from "pino";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      logger: Logger;
    }
  }
}

export {};
