import { ErrorMessage, HttpErrorStatusCode } from "./ErrorConfig";

export interface AppErrorOptions{
    message: string;
    statusCode?: number;
    code?: string;
    data?: unknown;
    cause?: unknown;
    isOperational?: boolean;
}

export class AppError extends Error {
  public statusCode: number;

  public code: string;

  public data?: unknown;

  public cause?: unknown;

  public isOperational: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);

    this.name = this.constructor.name;

    this.statusCode = options.statusCode || HttpErrorStatusCode.INVALID_OPERATION;

    this.code =
      options.code || ErrorMessage.Something_went_wrong;

    this.data = options.data;

    this.cause = options.cause;

    this.isOperational =
      options.isOperational ?? true;

    Error.captureStackTrace(this, this.constructor);
  }
}