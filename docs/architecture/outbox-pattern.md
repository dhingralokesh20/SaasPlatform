# Outbox Pattern Architecture

## Purpose

The Outbox Pattern is used to reliably publish domain events without creating inconsistencies between database operations and event publishing.

The Identity Service uses the Outbox Pattern as the foundation for future event-driven architecture using Kafka.

The goal is to ensure important business events are not lost even when external systems are unavailable.

---

# Problem

A simple event publishing approach looks like:

```text
Update Database

        |
        v

Publish Event
```

This creates consistency issues.

Example:

```text
1. Password reset token is saved successfully

2. Event publishing fails

3. Email service never receives the event
```

Result:

```text
Database

  |
  +---- Reset token exists


Event System

  |
  +---- Event missing
```

The system reaches an inconsistent state.

---

# Solution

The Outbox Pattern stores business changes and event records inside the same database transaction.

The database temporarily becomes the source of truth for events.

Flow:

```text
Request

   |
   v

Identity Service

   |
   |
   +-------------------------+
   |                         |
   v                         v

Users Table              Outbox Events Table

Reset Token              PASSWORD_RESET_REQUESTED


   |
   v

Commit Transaction
```

If any operation fails:

```text
Rollback Everything
```

No partial state is stored.

---

# Current Architecture

```text
Identity Service

        |
        |
        +----------------+
        |                |
        v                v

 PostgreSQL        Outbox Events

 Users             Event Records

 Sessions
 OTP
```

The Outbox table is stored inside the Identity Service database.

---

# Outbox Event Lifecycle

Every event follows a lifecycle.

## Initial State

```text
PENDING
```

## Processing

```text
PENDING

   |
   v

PROCESSING
```

## Successful Processing

```text
PROCESSING

   |
   v

COMPLETED
```

## Failed Processing

```text
PROCESSING

   |
   v

FAILED
```

Failed events maintain retry information for future processing.

---

# Outbox Table

## outbox_events

Stores events waiting to be published.

Fields:

```text
id

eventType

aggregateType

aggregateId

payload

status

retryCount

lastError

processedAt

createdAt

updatedAt
```

---

# Field Responsibility

## id

Unique identifier of the event.

---

## eventType

Defines what happened.

Examples:

```text
PASSWORD_RESET_REQUESTED

USER_REGISTERED

WORKSPACE_CREATED
```

---

## aggregateType

Defines the entity responsible for the event.

Examples:

```text
USER

WORKSPACE

MEMBER
```

---

## aggregateId

Identifier of the related entity.

Examples:

```text
User ID

Workspace ID
```

---

## payload

Contains data required by consumers.

Example:

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "resetUrl": "https://example.com/reset-password?token=abc"
}
```

---

## status

Tracks event processing state.

Values:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

---

## retryCount

Tracks failed publishing attempts.

---

## lastError

Stores the last failure reason.

---

## processedAt

Stores successful processing timestamp.

---

# Current Implementation

```text
OutboxRepository

        |
        v

OutboxEventService

        |
        v

outbox_events table
```

---

# OutboxRepository Responsibilities

Handles database operations:

- Create events
- Fetch pending events
- Update event status
- Increment retry count
- Store failure information

---

# OutboxEventService Responsibilities

Handles application-level operations:

- Create events
- Manage lifecycle
- Update processing state
- Prepare events for future worker processing

---

# Current Usage

## Forgot Password Flow

Implemented event:

```text
PASSWORD_RESET_REQUESTED
```

Flow:

```text
User requests forgot password

        |
        v

Generate Reset Token

        |
        v

Database Transaction

        |
        +-------------------------+
        |                         |
        v                         v

Users Table              Outbox Events Table

Reset Token              PASSWORD_RESET_REQUESTED


        |
        v

Commit Transaction
```

After commit:

```text
users

- resetTokenHash
- resetTokenExpiresAt


outbox_events

- eventType = PASSWORD_RESET_REQUESTED
- status = PENDING
```

---

# Why Transaction Is Important

Without transaction:

```text
Save Reset Token

        |

Create Event Failed
```

The system has incomplete state.

With transaction:

```text
Save Reset Token

        +

Create Outbox Event

        |

Commit
```

Both operations succeed together.

---

# Future Kafka Integration

Future architecture:

```text
outbox_events

        |
        v

Outbox Worker

        |
        v

Kafka Producer

        |
        v

Kafka Topic

        |
        v

Consumer Services
```

---

# Outbox Worker Responsibilities

The worker will:

1. Fetch pending events

2. Lock events for processing

3. Publish events to Kafka

4. Mark successful events as completed

5. Retry failed events

---

# Future Consumers

## Email Service

Consumes:

```text
PASSWORD_RESET_REQUESTED
```

Responsibilities:

- Send password reset emails
- Handle email templates

---

## Notification Service

Possible events:

```text
USER_REGISTERED

WORKSPACE_CREATED

MEMBER_INVITED
```

Responsibilities:

- User notifications
- Product alerts

---

## Audit Service

Possible events:

```text
USER_LOGIN

PASSWORD_CHANGED

ROLE_UPDATED
```

Responsibilities:

- Maintain audit history
- Track important actions

---

# Design Decisions

## Why Outbox Before Kafka?

Kafka provides event transportation.

Outbox provides reliability.

Kafka alone does not solve:

```text
Database update succeeded

but

Event publishing failed
```

The Outbox Pattern solves this by storing events inside the same database transaction.

---

# Current Status

Completed:

- Outbox database design
- Outbox model
- Outbox repository
- Outbox service
- Transaction support
- Forgot password integration

Pending:

- Outbox worker
- Kafka producer
- Kafka topics
- Consumer services
- Retry strategy
- Dead letter queue