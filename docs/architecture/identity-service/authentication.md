# Authentication Architecture

## Purpose

The authentication system is responsible for identity verification, session management, authorization bootstrap, and secure account recovery across WorkSphere.

The architecture prioritizes:

- Security
- Simplicity
- Transactional consistency
- Extensibility
- Stateless API authentication
- Future microservice readiness

---

# High Level Architecture

```text
                +----------------------+
                |      Frontend        |
                |      Angular         |
                +----------+-----------+
                           |
                           |
                     HTTP + Cookies
                           |
                           v
                +----------------------+
                |   Identity Service   |
                |   Node.js + Express  |
                +----------+-----------+
                           |
        +------------------+------------------+
        |                  |                  |
        v                  v                  v
  PostgreSQL          Redis Cache        Email Service
  Users               OTP Cache          (Current)
  Sessions            Rate Limits
  OTP History
```

---

# Core Components

## Frontend

Responsible for:

- Login
- Registration
- Forgot Password
- MFA Verification
- Token refresh
- Session bootstrap

The frontend never stores refresh tokens manually.

Authentication relies entirely on HttpOnly cookies.

---

## Identity Service

Responsible for:

- Registration
- Login
- Logout
- Refresh Token Rotation
- MFA Verification
- Password Reset
- Session Validation
- OTP Management
- Email Verification

---

## PostgreSQL

Acts as the system of record.

Stores:

- Users
- Sessions
- OTP History

---

## Redis

Redis is intentionally limited to temporary authentication data.

Current usage:

- Active OTP storage
- OTP cooldowns
- Rate limiting

Redis is never the source of truth for user identity.

---

# Authentication Flows

## Registration

```text
Validate Request
        │
Check Email
        │
Hash Password
        │
Create User
        │
Create Session
        │
Generate Tokens
        │
Commit Transaction
        │
Return Success
```

Registration executes inside a database transaction to prevent partial user creation.

---

## Login

```text
Validate Credentials
        │
Find User
        │
Verify Password
        │
Check Authentication Policy
        │
        ├───────────────┐
        │               │
        │ MFA Disabled  │
        │               │
        ▼               ▼
Create Session     Generate OTP Challenge
Generate Tokens           │
        │                 │
        ▼                 ▼
Return Login      Wait for OTP Verification
```

The login flow is implemented using a state machine to support future authentication methods without introducing conditional complexity.

---

## MFA Verification

```text
Validate Challenge
        │
Load OTP
        │
Verify Hash
        │
Update OTP Status
        │
Create Session
        │
Generate Tokens
        │
Return Success
```

Only after successful OTP verification is a session created.

---

## Refresh Token Rotation

```text
Receive Refresh Cookie
        │
Validate JWT
        │
Validate Session
        │
Generate New Refresh Token
        │
Update Session
        │
Generate Access Token
        │
Return New Cookies
```

Every refresh invalidates the previous refresh token.

This prevents replay attacks using stolen refresh tokens.

---

## Logout

```text
Receive Request
        │
Locate Session
        │
Mark Session Revoked
        │
Clear Cookies
        │
Return Success
```

---

## Forgot Password

```text
Validate Email
        │
Rate Limiter
        │
Generate OTP
        │
Send Email
        │
Return Generic Response
```

Responses remain intentionally generic to prevent email enumeration.

---

# Session Management

Every authenticated session has a corresponding database record.

Each session stores:

- User reference
- Refresh token hash
- Expiration
- Last usage
- Revocation status

The session table acts as the source of truth for active authentication.

---

# Token Strategy

## Access Token

Purpose

- Authenticate API requests

Characteristics

- JWT
- Short-lived
- Stateless

---

## Refresh Token

Purpose

- Maintain authenticated sessions

Characteristics

- Long-lived
- Stored as HttpOnly Cookie
- Rotated after every refresh
- Backed by a database session

---

# OTP Architecture

OTP records exist in two places.

## Redis

Stores

- Active OTP hash
- Expiration
- Cooldowns

Redis provides fast validation and automatic expiration.

---

## PostgreSQL

Stores

- OTP history
- Status
- Attempts
- Audit information

This separation allows efficient verification while preserving audit history.

---

# State Machines

Authentication workflows use state machines instead of large conditional blocks.

Current implementation:

- Login

Planned:

- Forgot Password
- Registration Verification
- Account Recovery

Benefits:

- Predictable transitions
- Easier testing
- Reduced conditional complexity
- Extensible authentication flows

---

# Security Features

Current security measures include:

- Password hashing
- JWT authentication
- Refresh token rotation
- Session revocation
- HttpOnly cookies
- OTP expiration
- OTP rate limiting
- Request sanitization
- Transactional consistency
- MFA support

---

# Future Enhancements

Planned improvements include:

- Kafka event publishing
- Outbox Pattern
- Email service integration
- Password policy enforcement
- Session policy versioning
- Passkeys (WebAuthn)
- Authenticator Apps
- Backup Codes
- Multi-device session management
- OAuth providers
- SSO

---

# Current Status

| Feature | Status |
|----------|--------|
| Registration | Done |
| Login | Done |
| JWT Authentication | Done |
| Refresh Token Rotation | Done |
| Session Management | Done |
| OTP Service | Done |
| MFA Login | Done |
| State Machines | Done (Login) |
| Forgot Password | Next Step |
| Kafka Integration | Planned |
| Passkeys | Planned |
| OAuth | Planned |