# Authentication State Machines

## Purpose

Authentication workflows are modeled as state machines instead of nested conditional logic.

This keeps flows predictable and extensible.

---

# Why State Machines?

Benefits:

- Explicit transitions
- Easier testing
- Reduced complexity
- Better maintainability

---

# Current Implementation

Current state machine:

- Login

---

# Example

```text
LOGIN_STARTED
      │
      ▼
PASSWORD_VERIFIED
      │
      ├────────► MFA_REQUIRED
      │              │
      │              ▼
      │        MFA_VERIFIED
      │              │
      ▼              ▼
AUTHENTICATED
```

---

# Planned State Machines

- Forgot Password
- Registration
- Email Verification
- Account Recovery

---

# Design Principles

- Immutable transitions
- Invalid transitions rejected
- Single responsibility
- Workflow-specific state maps