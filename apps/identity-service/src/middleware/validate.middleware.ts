import { NextFunction, Request, Response } from "express";

import { ZodAny } from "zod";

import { AppError } from "../errors/AppError";

export const validate = (
  schema: ZodAny
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(
        new AppError({
          message: "Validation failed",

          statusCode: 400,

          code: "VALIDATION_ERROR",

          data: result.error.flatten(),
        })
      );
    }

    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
  };
};