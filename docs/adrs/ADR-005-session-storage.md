# ADR-001: Store Sessions in PostgreSQL

## Status

Accepted

---

# Context

Authentication requires session tracking for:

- Logout
- Refresh token rotation
- Revocation
- Auditability

Possible storage options:

- Redis
- PostgreSQL

---

# Decision

Store sessions in PostgreSQL.

---

# Reasons

Benefits:

- Persistent storage
- Easier debugging
- Strong relational consistency
- Transaction support
- No additional infrastructure dependency

---

# Consequences

Advantages:

- Session lifecycle is auditable
- Easy revocation
- Simple architecture

Tradeoffs:

- Requires database access during validation
- Higher load compared to in-memory storage

---

# Future Consideration

Redis caching may be introduced if session lookup becomes a bottleneck.