import { RequestHandler } from "express";

export const wrapRoute = (
  handler: RequestHandler
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(
      next
    );
  };
};