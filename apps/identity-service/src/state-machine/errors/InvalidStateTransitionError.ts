import { AppError } from "../../errors/AppError";

export class InvalidStateTransitionError extends AppError {
  constructor(from: string, to: string) {
    super({
      message: `Invalid state transition: ${from} -> ${to}`,
      code: "INVALID_STATE_TRANSITION",
    });
  }
}
