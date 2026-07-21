# ADR-004: Use State Machines for Authentication Flows

## Status

Accepted

---

# Context

Authentication flows contain multiple conditional paths:

- Password authentication
- MFA
- Recovery flows
- Future authentication methods

Traditional conditional logic becomes difficult to maintain.

---

# Decision

Model authentication workflows using state machines.

---

# Benefits

- Explicit states
- Controlled transitions
- Easier testing
- Reduced conditional complexity

---

# Current Usage

Implemented:

- Login authentication flow

Future:

- Password reset
- Registration verification
- Recovery workflows

---

# Consequences

Advantages:

- Better maintainability
- Safer workflow changes

Tradeoff:

- Additional abstraction for simple flows