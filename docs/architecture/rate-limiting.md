# Rate Limiting Architecture

## Purpose

Rate limiting protects Worksphere services from abuse, brute force attacks, and excessive resource consumption.

The goal is to provide a centralized mechanism that can be reused across authentication and future platform services.

The current implementation uses Redis-backed counters to track request frequency.

---

# Architecture Overview

```text
                    Service
                       |
                       |
                       v
              RateLimiterService
                       |
                       |
                       v
                     Redis
```

Individual services do not maintain their own rate limiting logic.

They only define:

- Protected action
- Identifier
- Maximum allowed requests
- Time window

---

# RateLimiterService

## Responsibilities

The RateLimiterService handles:

- Incrementing request counters
- Managing Redis TTL
- Calculating remaining attempts
- Providing retry duration
- Resetting limits

Example:

```ts
rateLimiterService.consume({
    key,
    limit,
    windowSeconds
});
```

Response:

```json
{
  "allowed": true,
  "remaining": 4,
  "retryAfterSeconds": 0
}
```

---

# Algorithm

## Current Algorithm

Redis Counter based Fixed Window Rate Limiting.

Example:

```text
Limit:

5 requests / 15 minutes


12:00 - 12:15

Request 1
Request 2
Request 3
Request 4
Request 5

Request 6 -> Blocked
```

Redis key format:

```text
rate-limit:<action>:<identifier>
```

Example:

```text
rate-limit:otp-generate:user@email.com
```

---

# Why Fixed Window?

Fixed window was selected because current requirements focus on authentication abuse prevention.

Protected areas:

- OTP generation
- Login attempts
- MFA verification
- Forgot password requests

Advantages:

- Simple implementation
- Low Redis overhead
- Easy debugging
- Easy migration later

---

# Future Algorithm Improvements

The RateLimiterService abstraction allows changing the internal algorithm without changing consumers.

Possible future implementations:

- Sliding Window
- Token Bucket
- API Gateway level rate limiting

---

# OTP Rate Limiting

## Purpose

Prevent excessive OTP generation requests.

Applies to:

- Login MFA
- Forgot password
- Email verification

---

## Flow

```text
Login Request

      |
      v

AuthService

      |
      v

OtpService.generateOtp()

      |
      v

RateLimiterService

      |
      +---- Blocked
      |
      v

Generate OTP
Store Redis
Create OTP Record
```

---

## Policy

Example:

```text
5 OTP requests / 15 minutes
```

Redis key:

```text
rate-limit:otp-generate:<email>
```

---

# Login Rate Limiting

## Purpose

Prevent password brute force attacks.

Implemented inside AuthService.

---

## Flow

```text
Login API

    |
    v

AuthService.login()

    |
    v

RateLimiterService

    |
    +---- Blocked

    |
    v

Password Validation
```

---

## Policy

Example:

```text
5 failed login attempts / 15 minutes
```

Possible keys:

```text
rate-limit:login:<email>
```

Future:

```text
rate-limit:login-ip:<ip-address>
```

A combination of email and IP based limiting can provide stronger protection.

---

# MFA Verification Rate Limiting

## Purpose

Prevent OTP guessing attacks.

OTP attempts and rate limiting provide two layers of protection.

---

## Flow

```text
Verify MFA API

        |
        v

AuthService.verifyMFA()

        |
        v

RateLimiterService

        |
        v

OtpService.verifyOtp()
```

---

## Policy

Example:

```text
5 verification attempts per OTP lifecycle
```

Redis key:

```text
rate-limit:mfa-verify:<email>
```

---

# Forgot Password Rate Limiting

## Purpose

Prevent password reset abuse and unnecessary email generation.

---

## Flow

```text
Forgot Password Request

          |
          v

Password Service

          |
          v

RateLimiterService

          |
          v

Generate Reset Token / OTP
```

---

## Policy

Example:

```text
3 reset requests / 15 minutes
```

Redis key:

```text
rate-limit:forgot-password:<email>
```

---

# Rate Limit Key Strategy

All rate limit keys follow:

```text
rate-limit:<action>:<identifier>
```

Examples:

```text
rate-limit:otp-generate:user@email.com

rate-limit:login:user@email.com

rate-limit:forgot-password:user@email.com
```

Benefits:

- Consistent Redis structure
- Easy debugging
- Clear ownership

---

# Error Handling

When the limit is exceeded:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429
}
```

Additional data:

```json
{
  "retryAfterSeconds": 500
}
```

Frontend can use this value to display cooldown messages.

---

# Separation of Responsibilities

## RateLimiterService

Responsible for:

- Redis operations
- Counters
- TTL handling
- Limit calculation

---

## Business Services

Responsible for:

- Defining limits
- Deciding when to apply limits
- Handling business errors

Example:

```text
OtpService

OTP generation:
5 requests / 15 minutes


AuthService

Login attempts:
5 failures / 15 minutes


PasswordService

Reset requests:
3 requests / 15 minutes
```

---

# Design Decisions

## Why Custom Redis Rate Limiter?

Instead of using a third-party Node.js rate limiter library, Worksphere uses a custom Redis-backed implementation.

Reasons:

- Existing Redis infrastructure
- Shared state support
- Better control
- Easier future expansion
- No unnecessary dependency

---

## Why Not Leaky Bucket?

Leaky bucket is designed for traffic shaping.

Authentication flows require abuse prevention.

Examples:

- Prevent OTP spam
- Prevent password guessing
- Prevent reset abuse

Fixed window is sufficient for current requirements.

---

# Future Improvements

## Atomic Redis Operations

Current implementation:

```text
INCR
+
EXPIRE
```

Future improvement:

Use Redis Lua scripts for atomic execution.

---

## Multiple Rate Limit Dimensions

Future support:

```text
User based limits

IP based limits

Workspace based limits

API key based limits
```

---

## API Gateway Rate Limiting

Future architecture:

```text
Client

  |
  v

API Gateway

  |
  v

Rate Limiting Layer

  |
  v

Services
```

---

# Current Status

Algorithm:

```text
Redis Fixed Window Counter
```

Storage:

```text
Redis
```

Implemented:

- Central RateLimiterService
- OTP generation rate limiting
- Login rate limiting
- MFA verification rate limiting
- Forgot password rate limiting

Architecture Stage:

```text
Authentication Security Foundation
```