import { Request, Response, NextFunction } from "express";

import { z } from "zod";

import { AppError } from "../errors/AppError";

type ValidationTarget = "body" | "query" | "params";

const formatZodError = (error: z.ZodError) => {
  const formattedErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "root";
    if (!formattedErrors[key]) {
      formattedErrors[key] = [];
    }
    formattedErrors[key].push(issue.message);
  }
  return formattedErrors;
};

export const validate = (
  schema: z.ZodType,
  target: ValidationTarget = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(
        new AppError({
          message: "Validation failed",
          statusCode: 400,
          code: "VALIDATION_ERROR",
          data: formatZodError(result.error),
        }),
      );
    }
    req[target] = result.data;
    next();
  };
};