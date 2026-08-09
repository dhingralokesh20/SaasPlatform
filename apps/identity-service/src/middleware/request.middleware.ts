import { NextFunction, Request, Response } from "express";

import { v4 as uuid } from "uuid";

import { logger } from "../logger";

export const requestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = uuid();

  req.requestId = requestId;

  req.logger = logger.child({
    requestId,
    method: req.method,
    url: req.originalUrl,
    service: "identity-service",
  });

  req.logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
  });

  res.on("finish", () => {
    req.logger.info("Request completed", {
      statusCode: res.statusCode,
    });
  });

  next();
};
