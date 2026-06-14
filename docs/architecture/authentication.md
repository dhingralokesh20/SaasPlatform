# Authentication Architecture

## Purpose

The authentication system is responsible for user identity verification, session management, and access control across Worksphere.

The current implementation focuses on simplicity, security, and maintainability while providing a foundation for future scaling and service expansion.

---

# Current Architecture

```text
Client
   |
   v
Identity Service
   |
   +------> PostgreSQL
           |
           +---- Users
           +---- Sessions
```

---

# Components

## Client

Responsibilities:

* User registration
* User login
* Token storage
* Authenticated API requests

---

## Identity Service

Responsibilities:

* User registration
* User authentication
* Password validation
* Token generation
* Session creation
* Session validation

Technology:

* Node.js
* TypeScript
* Express

---

## PostgreSQL

Stores:

### Users

Contains:

* User profile information
* Authentication credentials
* Account metadata

### Sessions

Contains:

* Session identifiers
* User associations
* Refresh token metadata
* Session expiration information
* Session status

The Sessions table acts as the source of truth for active user sessions.

---

# Authentication Flow

## User Registration

```text
1. Validate request
2. Check email availability
3. Check username availability
4. Hash password
5. Create user record
6. Generate access token
7. Generate refresh token
8. Create session record
9. Commit transaction
10. Return user and tokens
```

### Transactional Behaviour

Registration is executed within a database transaction.

If any step fails:

* User creation is rolled back.
* Session creation is rolled back.
* No partial data is persisted.

---

## User Login

```text
1. Validate credentials
2. Find user by email
3. Verify password hash
4. Generate access token
5. Generate refresh token
6. Create session record
7. Commit transaction
8. Return user and tokens
```

### Transactional Behaviour

Login and session creation occur within a single transaction to ensure consistency.

---

# Token Strategy

## Access Token

Purpose:

* Authenticate API requests.
* Carry user identity information.

Characteristics:

* Short-lived.
* Stateless.
* Signed JWT.

---

## Refresh Token

Purpose:

* Generate new access tokens.
* Maintain user sessions.

Characteristics:

* Longer lifetime.
* Associated with a session record.
* Can be revoked through session invalidation.

---

# Session Management

## Session Creation

A new session is created when:

* A user registers.
* A user logs in.

Each session is associated with:

* User ID
* Refresh token
* Expiration information
* Session metadata

---

## Session Validation

Authentication relies on both:

1. JWT verification
2. Session validation

This provides additional control over active user sessions.

Benefits:

* Session revocation support
* Logout support
* Future multi-device session support
* Better auditability

---

# Security Considerations

Current security measures include:

* Password hashing
* JWT signing
* Session tracking
* Transactional consistency
* Credential validation

---

# Design Decisions

## Why Sessions Table Instead of Redis?

Current goals:

* Simpler infrastructure
* Easier debugging
* Fewer moving parts
* Faster development

The Sessions table provides sufficient functionality for the current scale of the platform.

---

# Future Enhancements

Potential future improvements include:

* Redis-backed session storage
* Session caching
* Multi-device session management
* Device tracking
* Session analytics
* MFA support
* OAuth integrations
* Event-driven authentication workflows

These enhancements will be introduced only when justified by product or scalability requirements.

---

# Current Status

Authentication Type:
JWT-based Authentication

Session Storage:
PostgreSQL Sessions Table

Token Revocation:
Session-based

Cache Layer:
Not Currently Used

Architecture Stage:
Phase 1 Foundation
