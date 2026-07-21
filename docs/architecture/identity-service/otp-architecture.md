# OTP Architecture

## Purpose

The OTP service provides secure, time-limited verification for authentication and account recovery workflows.

It is designed to be reusable across multiple authentication flows while maintaining strong security guarantees.

OTP is implemented as an internal service capability and is not exposed as a standalone API.

---

# Supported Use Cases

## Current

- Multi-Factor Authentication (MFA)
- Password Reset

## Future

- Email Verification
- Phone Verification
- High-Risk Authentication
- Device Verification

---

# High Level Architecture

```text
Client
   |
   v

Identity Service

   |
   +-----------------> Redis
   |                   |
   |                   +-- Active OTP
   |                   +-- Cooldown
   |                   +-- Attempts
   |
   v

PostgreSQL

OTP History
```

---

# Design Decision

## Why OTP Is Not Exposed As API

OTP operations depend on the business flow that triggered them.

Example:

```text
Login Request

      |
      v

Password Verification

      |
      v

MFA Challenge Creation

      |
      v

Generate OTP
```

Exposing generic OTP APIs would allow OTP generation without validating the actual business context.

Therefore OTP is consumed internally:

```text
Authentication Flow

        |
        v

    OTP Service

        |
        v

 Redis + PostgreSQL
```

---

# OTP Service Responsibilities

The OTP service is responsible for:

- Generating OTP
- Hashing OTP
- Storing active OTP
- Verifying OTP
- Managing OTP expiry
- Managing resend cooldown
- Tracking verification attempts
- Updating OTP lifecycle status

The OTP service does not handle:

- User authentication decisions
- Authorization
- Email delivery
- Business workflow decisions

---

# Storage Architecture

```text
                 OTP Service

                      |
          +-----------+-----------+
          |                       |
          v                       v

        Redis               PostgreSQL

 Temporary Storage        Permanent Storage

 Active OTP               OTP History

 Cooldown                 Audit Records

 Attempts                 Lifecycle Tracking
```

---

# Why Redis?

Redis is used for temporary OTP verification data.

Responsibilities:

- Store active OTP hash
- Store cooldown information
- Store verification attempts
- Provide fast lookup
- Handle automatic expiration


Benefits:

- Automatic expiry
- No cleanup jobs
- Low latency verification
- Reduced database load


Redis does not store permanent OTP records.

---

# Why PostgreSQL?

PostgreSQL stores OTP lifecycle and audit information.

Purpose:

- Track OTP history
- Maintain verification records
- Support debugging and auditing


Stored information:

- User ID
- Email
- OTP Type
- OTP Hash
- Status
- Attempts
- Expiry Time
- Verified At
- Metadata

---

# OTP Lifecycle

```text
Generate OTP

      |
      v

Hash OTP

      |
      v

Create OTP History Record

      |
      v

Store Active OTP In Redis

      |
      v

Send OTP

      |
      v

Wait For Verification

      |
      v

Verify OTP

      |
      v

Update OTP Status

      |
      v

Delete Redis Entry
```

---

# OTP Generation Flow

OTP generation is triggered by authentication workflows.

Example:

Login MFA:

```text
Login

 |
 v

Password Verified

 |
 v

Create MFA Challenge

 |
 v

OTP Service.generateOtp()

 |
 v

Generate Numeric OTP

 |
 v

Hash OTP

 |
 +----------------+
 |                |
 v                v

Redis          PostgreSQL

Active OTP    OTP History

```

---

# OTP Storage Rules

## Plain OTP

Plain OTP is never stored.

Example:

```text
123456
```

exists only temporarily during generation and delivery.

---

## Stored OTP

Only hashed OTP is stored.

Flow:

```text
Plain OTP

    |
    v

Hash Function

    |
    v

OTP Hash
```

---

# OTP Verification Flow

```text
Verify OTP Request

        |
        v

Read Active OTP From Redis

        |
        v

Hash Provided OTP

        |
        v

Compare Hash Values

        |
        +----------------+
        |                |
        v                v

     Success          Failure


        |                |

 Update OTP       Increase Attempts
 History


        |
        v

 Delete Redis OTP
```

---

# Failed Verification Handling

Invalid OTP attempts are tracked separately.

Redis key:

```text
{otp-key}:attempts
```

Every failed attempt:

```text
Increment Attempt Count
```

When maximum attempts are reached:

```text
OTP Status = LOCKED
```

Actions:

- Remove OTP from Redis
- Update database status
- Reject further attempts

---

# Resend OTP Flow

```text
Resend OTP Request

        |
        v

Check Cooldown

        |
        v

Find Existing Active OTP

        |
        v

Revoke Previous OTP

        |
        v

Generate New OTP
```

Previous OTP lifecycle:

```text
ACTIVE

   |
   v

REVOKED
```

---

# Cooldown Handling

Cooldown prevents repeated OTP generation.

Redis key:

```text
otp-cooldown:{type}:{email}
```

Example:

```text
otp-cooldown:LOGIN_MFA:user@example.com
```

If cooldown exists:

```text
Reject Request

Return Retry After Seconds
```

---

# OTP Types

## Current

```text
LOGIN_MFA
```

## Future

```text
EMAIL_VERIFICATION

PASSWORD_RESET

PHONE_VERIFICATION

TRANSACTION_APPROVAL
```

---

# Security Features

Implemented:

- OTP hashing
- No plaintext OTP storage
- Redis temporary storage
- Time-based expiration
- Maximum verification attempts
- OTP cooldown
- Lifecycle tracking
- Audit history

---

# Current Integrations

## Login MFA

```text
Login

 |
 v

Password Verified

 |
 v

Create MFA Challenge

 |
 v

Generate OTP

 |
 v

Verify OTP

 |
 v

Create Session

 |
 v

Authenticated
```

---

## Password Reset

```text
Forgot Password

 |
 v

Generate Reset Flow

 |
 v

Future Email Service

 |
 v

Verify Identity

 |
 v

Reset Password
```

---

# Future Improvements

- Authenticator Applications
- Backup Codes
- SMS Support
- Push Notifications
- Kafka Email Events
- Notification Service Integration
- Configurable OTP Policies