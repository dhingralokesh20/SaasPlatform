# ADR-002: Hybrid OTP Storage Strategy

## Status

Accepted

---

# Context

OTP verification requires:

- Fast lookup
- Expiration
- Attempt tracking
- Audit history

---

# Decision

Use:

Redis for active OTP verification.

PostgreSQL for OTP history.

---

# Reasons

Redis provides:

- Fast expiration
- Automatic cleanup
- Low latency

PostgreSQL provides:

- Audit trail
- Historical records
- Reporting capability

---

# Consequences

Benefits:

- Efficient verification
- Persistent history
- Clear responsibility separation

---

# Future Consideration

OTP events may move to an event-driven architecture.