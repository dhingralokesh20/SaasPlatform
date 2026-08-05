# Notification Service Architecture

## Overview

The Notification Service is responsible for processing asynchronous events published by other microservices and performing notification-related actions (emails, SMS, push notifications, etc.).

It follows an event-driven architecture using Kafka.

---

# High-Level Flow

```text
Identity Service
        │
        ▼
    Outbox Table
        │
        ▼
 Outbox Worker
        │
        ▼
 Kafka Producer
        │
        ▼
=============================
          Kafka
=============================
        │
        ▼
Notification Consumer
        │
        ▼
Identity Event Router
        │
        ▼
Specific Event Handler
        │
        ▼
Notification Service
        │
        ▼
Notification Provider
        │
        ▼
Email / SMS / Push Notification
```

---

# Responsibilities

## 1. Kafka Consumer

**Location**

```
src/consumers/
```

Example:

```
identity.consumer.ts
```

### Responsibility

The consumer should only:

* Subscribe to Kafka topics
* Read incoming messages
* Parse the event
* Pass it to the router

The consumer should **never** contain business logic.

### Flow

```text
Kafka
   │
   ▼
Read Message
   │
   ▼
Parse JSON
   │
   ▼
handleIdentityEvent(event)
```

---

# 2. Event Router

**Location**

```
src/router/
```

Example:

```
identityEvent.router.ts
```

### Responsibility

The router decides **which handler** should process a particular event.

It acts as the entry point for all events coming from a service.

Example:

```text
PASSWORD_RESET_REQUESTED
            │
            ▼
passwordResetHandler

USER_REGISTERED
            │
            ▼
userRegisteredHandler

EMAIL_VERIFIED
            │
            ▼
emailVerifiedHandler
```

The router should not contain business logic.

Its only responsibility is dispatching events.

---

# 3. Event Handlers

**Location**

```
src/handlers/
```

Example:

```
handlers/
    identity/
        passwordReset.handler.ts
        userRegistered.handler.ts
        emailVerified.handler.ts
```

### Responsibility

Each handler is responsible for exactly one event.

Example:

```
PASSWORD_RESET_REQUESTED
```

The handler should:

* validate payload if required
* perform business logic
* invoke Notification Service

The handler should not know:

* Kafka
* Consumer implementation
* Topic names
* Email provider implementation

---

# 4. Notification Service

**Location**

```
src/services/
```

Example

```
notification.service.ts
email.service.ts
```

### Responsibility

Contains reusable notification business logic.

Examples:

* Send password reset email
* Send welcome email
* Send workspace invitation
* Send verification email

Handlers delegate work to the service.

---

# 5. Notification Provider

**Location**

```
src/providers/
```

Examples

```
smtp.provider.ts
resend.provider.ts
ses.provider.ts
```

### Responsibility

Responsible for communicating with external notification providers.

Examples

* SMTP
* Amazon SES
* Resend
* SendGrid

The Notification Service should depend on the provider, not vice versa.

---

# Complete Request Flow

```text
Forgot Password API
        │
        ▼
Identity Service
        │
        ▼
Create Outbox Event
        │
        ▼
Database Transaction Commit
        │
        ▼
Outbox Worker
        │
        ▼
Kafka Producer
        │
        ▼
identity.events Topic
        │
        ▼
Notification Consumer
        │
        ▼
Identity Event Router
        │
        ▼
Password Reset Handler
        │
        ▼
Email Service
        │
        ▼
SMTP / Resend / SES
        │
        ▼
User receives email
```

---

# Folder Structure

```text
src
│
├── consumers
│      identity.consumer.ts
│
├── router
│      identityEvent.router.ts
│
├── handlers
│      identity
│          passwordReset.handler.ts
│          userRegistered.handler.ts
│          emailVerified.handler.ts
│
├── services
│      notification.service.ts
│      email.service.ts
│
├── providers
│      smtp.provider.ts
│      resend.provider.ts
│
├── templates
│
├── kafka
│
└── logger
```

---

# Why this Architecture?

## Single Responsibility Principle

Consumer

* Reads Kafka messages.

Router

* Chooses the correct handler.

Handler

* Handles one business event.

Service

* Contains reusable notification logic.

Provider

* Communicates with external services.

Every layer has exactly one responsibility.

---

# Advantages

* Thin Kafka consumers
* Easy to add new events
* Easy to test handlers independently
* Email provider can be changed without modifying handlers
* Supports multiple notification channels (Email, SMS, Push)
* Highly scalable as the number of events grows
* Follows clean architecture and separation of concerns

---

# Future Expansion

New events only require:

1. Publish a new event from a producer service.
2. Add a new handler.
3. Register the handler in the router.

No changes are required in the Kafka consumer.

Examples:

* USER_REGISTERED
* EMAIL_VERIFIED
* ACCOUNT_LOCKED
* LOGIN_ALERT
* WORKSPACE_INVITATION
* PASSWORD_CHANGED
* PAYMENT_RECEIVED
* SUBSCRIPTION_EXPIRED

This keeps the Notification Service extensible while maintaining a clean and predictable architecture.
