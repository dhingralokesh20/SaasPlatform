# Worksphere Architecture Overview

## Identity Service

Responsible for:

- User registration
- Login
- MFA
- Session management
- Password recovery


## Authentication Components

### Session Management

Stores:

- Refresh tokens
- Device sessions
- Expiry
- Revocation


### OTP Service

Used for:

- MFA
- Account recovery


### Rate Limiter

Used for:

- Login protection
- OTP abuse prevention
- Password reset protection


### Outbox Pattern

Used for:

- Reliable event publishing
- Email events
- Kafka integration


## Infrastructure

Current:

- PostgreSQL
- Redis

Future:

- Kafka
- Notification Service