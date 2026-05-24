import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { envConfig } from "../config/env.config";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,

      message: error.message,

      code: error.code,

      data: error.data,

      ...(envConfig.NODE_ENV !== "production" && {
        stack: error.stack,
        cause: error.cause,
      }),
    });
  }

  return res.status(500).json({
    success: false,

    message: "Internal Server Error",

    code: "INTERNAL_SERVER_ERROR",

    ...(envConfig.NODE_ENV !== "production" && {
      stack: error.stack,
    }),
  });
};