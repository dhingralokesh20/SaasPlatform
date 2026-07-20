# OTP Architecture

## Purpose

The OTP service provides secure, time-limited verification for authentication and account recovery workflows.

It is designed to be reusable across multiple authentication flows while maintaining strong security guarantees.

---

# Supported Use Cases

Current:

- Multi-Factor Authentication (MFA)
- Password Reset

Future:

- Email Verification
- Phone Verification
- High-Risk Authentication
- Device Verification

---

# High Level Architecture

```text
Client
   │
   ▼
Identity Service
   │
   ├────────► Redis
   │          Active OTP
   │          Cooldown
   │
   ▼
PostgreSQL
OTP History
```

---

# Why Redis?

Redis is responsible only for active verification.

Benefits:

- Automatic expiration
- Extremely fast lookups
- No cleanup jobs
- Reduced database load

Redis never stores permanent authentication history.

---

# Why PostgreSQL?

The database stores the OTP lifecycle.

Stored information includes:

- Email
- OTP Type
- Status
- Attempts
- Expiration
- Verification timestamp

This provides auditability while keeping verification efficient.

---

# OTP Lifecycle

```text
Generate OTP
      │
Hash OTP
      │
Store Hash in Redis
      │
Create History Record
      │
Send Email
      │
Wait for Verification
      │
Verify Hash
      │
Update History
      │
Delete Redis Entry
```

---

# Security Features

Current implementation:

- OTP hashing
- Time-based expiration
- Maximum verification attempts
- Cooldown between requests
- Separate audit history
- No plaintext storage

---

# Future Improvements

- Authenticator Apps
- Backup Codes
- SMS Support
- Push Notifications
- Kafka Email Events