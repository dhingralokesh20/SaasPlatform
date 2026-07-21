import { NextFunction, Request, Response } from "express";

const LOWERCASE_FIELDS = new Set([
  "email",
  "username",
]);

function normalize(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (key && LOWERCASE_FIELDS.has(key)) {
      return trimmed.toLowerCase();
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      (value as Record<string, unknown>)[k] = normalize(v, k);
    }
  }

  return value;
}

export const normalizeRequestMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body) {
    normalize(req.body);
  }

  next();
};