# Authentication APIs

## Overview

This document describes the core authentication APIs implemented in the Identity Service.

Covered APIs:

1. Login
2. Verify MFA
3. Refresh Token Rotation
4. Forgot Password
5. Reset Password


---

# 1. Login

## Endpoint

```
POST /auth/login
```

## Purpose

Authenticates a user using email and password.

If MFA is enabled, the user is moved into MFA pending state and an OTP challenge is created.

If MFA is disabled, authentication is completed immediately and session tokens are generated.


## Request Body

```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "rememberMe": true
}
```


## Validation

Schema:

```
loginSchema
```

Validates:

- Email format
- Password presence
- rememberMe boolean


## Flow

```
User Login Request

        |
        v

Check Login Rate Limit

        |
        v

Find User By Email

        |
        v

Verify Password

        |
        v

Login State Machine

        |
        +----------------+
        |                |
        v                v

 MFA Enabled       MFA Disabled


        |                |
        v                v


Create MFA          Complete
Challenge           Authentication


        |
        v


Generate OTP


        |
        v


Return challengeId
```


## Database Changes

### MFA Enabled

Creates login challenge:

```
LoginStateChallenge
```

Stores:

- userId
- email
- challengeId
- current state
- rememberMe


### MFA Disabled

Creates:

```
Session
```

Stores:

- userId
- refresh token hash
- expiry
- revoke status


## Redis Changes

Login rate limit:

```
login:{email}
```

MFA OTP:

```
LOGIN_MFA:{email}
```


## Response

### MFA Required

```json
{
  "requiresMfa": true,
  "challengeId": "uuid"
}
```


### Successful Authentication

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```


## Errors

| Error | Description |
|---|---|
| INVALID_CREDENTIALS | Email or password incorrect |
| RATE_LIMIT_EXCEEDED | Too many login attempts |


---

# 2. Verify MFA

## Endpoint

```
POST /auth/verifyMFA
```


## Purpose

Verifies OTP generated during MFA login flow.

After successful verification, authentication is completed and user session is created.


## Request Body

```json
{
  "challengeId": "challenge-id",
  "otp": "123456",
  "rememberMe": true
}
```


## Flow

```
Verify MFA Request

        |
        v

Find Login Challenge

        |
        v

Verify OTP

        |
        v

State Machine Transition

MFA_PENDING

        |
        v

AUTHENTICATED

        |
        v

Create Session

        |
        v

Generate Tokens
```


## Redis Changes

Reads:

```
LOGIN_MFA:{email}
```

Deletes OTP after successful verification.


## Database Changes

Updates:

```
LoginStateChallenge
```

Creates:

```
Session
```


## Response

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```


## Errors

| Error | Description |
|---|---|
| OTP_EXPIRED | OTP expired |
| INVALID_OTP | Incorrect OTP |
| OTP_LOCKED | Maximum attempts exceeded |


---

# 3. Refresh Token Rotation

## Endpoint

```
POST /auth/refreshToken
```


## Purpose

Generates a new access token and refresh token pair.

The old refresh token is revoked after successful rotation.


## Request Body

```json
{
  "refreshToken": "token"
}
```


## Flow

```
Refresh Token Request

        |
        v

Validate Refresh Token

        |
        v

Find Session

        |
        v

Check Session Validity

        |
        v

Generate New Tokens

        |
        v

Rotate Refresh Token

        |
        v

Update Session
```


## Database Changes

Updates:

```
Session
```

Changes:

- refreshTokenHash
- lastUsedAt
- expiry


## Security Features

Implemented:

- Refresh token hashing
- Rotation
- Session validation
- Session revocation


## Response

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```


---

# 4. Forgot Password

## Endpoint

```
POST /auth/password/forget
```


## Purpose

Starts password recovery flow.

Generates reset token and creates an outbox event for future email processing.


## Request Body

```json
{
  "email": "user@example.com"
}
```


## Flow

```
Forgot Password Request

        |
        v

Check Rate Limit

        |
        v

Find User

        |
        v

Generate Reset Token

        |
        v

Hash Token

        |
        v

Database Transaction

        |
        +----------------------+
        |                      |
        v                      v

Update User            Create Outbox Event

Reset Token            PASSWORD_RESET_REQUESTED


        |
        v

Commit Transaction
```


## Database Changes

User table:

```
resetTokenHash

resetTokenExpiresAt
```


Outbox event:

```
eventType:
PASSWORD_RESET_REQUESTED
```


## Redis Changes

Rate limit key:

```
forgot-password:{email}
```


## Security Features

Implemented:

- Email enumeration prevention
- Hashed reset token
- Token expiry
- Rate limiting


## Response

```json
{
  "success": true,
  "message": "RESET_PASSWORD_LINK_GENERATED"
}
```


---

# 5. Reset Password

## Endpoint

```
POST /auth/password/reset
```


## Purpose

Validates reset token and updates user password.


## Request Body

```json
{
  "token": "reset-token",
  "password": "NewPassword@123"
}
```


## Flow

```
Reset Password Request

        |
        v

Hash Token

        |
        v

Find User By Reset Token

        |
        v

Validate Token Expiry

        |
        v

Hash New Password

        |
        v

Update Password

        |
        v

Clear Reset Token
```


## Database Changes

Updates:

```
User
```

Changes:

```
passwordHash

resetTokenHash = null

resetTokenExpiresAt = null
```


## Future Improvements

- Invalidate all active sessions after password reset
- Publish PASSWORD_CHANGED event
- Send password changed notification


---

# Authentication Architecture Summary

Current authentication system:

```
Authentication

    |
    +---- Login
    |
    +---- MFA
    |
    +---- OTP Service
    |
    +---- Session Management
    |
    +---- Refresh Token Rotation
    |
    +---- Rate Limiting
    |
    +---- Forgot Password
    |
    +---- Reset Password
    |
    +---- Outbox Events
```


Future extensions:

- Kafka events
- Email Service
- Notification Service
- Workspace authentication flows
```