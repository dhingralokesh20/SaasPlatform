import { LoginState } from "../auth/login/LoginState";
import { LoginStateMachine } from "../auth/login/LoginStateMachine";
import { InvalidStateTransitionError } from "../errors/InvalidStateTransitionError";
import { describe, it, expect, beforeEach } from "vitest";

describe("LoginStateMachine", () => {
  let machine: LoginStateMachine;

  beforeEach(() => {
    machine = new LoginStateMachine();
  });

  it("should allow password verified to MFA pending", () => {
    const nextState = machine.transition({
      from: LoginState.PASSWORD_VERIFIED,
      to: LoginState.MFA_PENDING,
    });

    expect(nextState).toBe(LoginState.MFA_PENDING);
  });

  it("should allow password verified directly to authenticated", () => {
    const nextState = machine.transition({
      from: LoginState.PASSWORD_VERIFIED,
      to: LoginState.AUTHENTICATED,
    });

    expect(nextState).toBe(LoginState.AUTHENTICATED);
  });

  it("should reject invalid transitions", () => {
    expect(() =>
      machine.transition({
        from: LoginState.AUTHENTICATED,
        to: LoginState.PASSWORD_VERIFIED,
      }),
    ).toThrow(InvalidStateTransitionError);
  });
  it("should not allow MFA pending to password verified", () => {
    expect(() =>
      machine.transition({
        from: LoginState.MFA_PENDING,
        to: LoginState.PASSWORD_VERIFIED,
      }),
    ).toThrow(InvalidStateTransitionError);
  });
});
