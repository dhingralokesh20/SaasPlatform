# Proposed Create Organization Architecture

## 1. Objective

`Create Organization` will be the first complete vertical slice of the Workspace Service.

The operation establishes:

- Organization creation
- Initial `OWNER` membership
- Transactional consistency
- Redis workspace context
- Event publication through Outbox + Kafka
- Idempotent command handling
- Future audit logging

The implementation will be built incrementally rather than introducing every infrastructure component at once.

---

## 2. High-Level Flow

```text
Frontend
    |
    | POST /organizations
    | Authorization
    | Idempotency-Key
    v
Nginx / API Gateway
    |
    v
Workspace Service
    |
    +-- Authenticate request
    |
    +-- Validate platform user
    |
    +-- Validate request
    |
    +-- Idempotency check
    |
    v
DB Transaction
    |
    +-- Create Organization
    |
    +-- Create OWNER Membership
    |
    +-- Create Outbox Event
    |
    +-- Store idempotency result
    |
    v
COMMIT
    |
    +--------------------+
    |                    |
    v                    v
Redis Context         API Response
    |
    v
lastActiveOrg / context

Outbox
    |
    v
Kafka
    |
    v
Future Consumers / Projections
```

---

# 3. Domain Ownership

## Identity Service

Identity remains the source of truth for platform identity.

It owns:

- User identity
- Authentication
- Platform-user lifecycle
- Platform account status

Workspace does not maintain a foreign-key relationship to the Identity database.

## Workspace Service

Workspace owns:

- Organizations
- Memberships
- Invitations
- Workspace context
- Workspace authorization

Workspace maintains a local `workspace_users` projection of platform users.

### Workspace User Projection

```text
workspace_users

userId
email
firstName
lastName
profilePic
status
createdAt
updatedAt
```

`userId` is the Identity-generated UUID and is the permanent identity reference inside Workspace.

---

# 4. Organization Creation Contract

For the current design, any eligible authenticated platform user can create an organization.

A super-admin invitation is not required.

### Request

```http
POST /organizations
Authorization: ...
Idempotency-Key: <unique-key>
```

Example:

```json
{
  "name": "Acme",
  "slug": "acme",
  "description": "Acme organization",
  "logo": "..."
}
```

### Initial Response

```json
{
  "organization": {
    "id": "...",
    "name": "Acme",
    "slug": "acme"
  },
  "membership": {
    "id": "...",
    "role": "OWNER"
  }
}
```

The response can be expanded later without changing the core creation model.

---

# 5. Validation

Before creating the organization:

1. Authenticate the request.
2. Extract `userId` from the authenticated identity/token.
3. Validate that the platform user exists.
4. Validate the platform user's state.
5. Validate organization input.
6. Validate slug constraints.
7. Apply idempotency handling.

The `userId` from the request identity is not trusted blindly; it is validated against the platform-user state available to Workspace.

---

# 6. Database Transaction

Organization creation is one business operation even though it creates multiple records.

The following must happen transactionally:

```text
BEGIN

    Create Organization

    Create OWNER Membership

    Create OrganizationCreated Outbox Event

    Store Idempotency Result

COMMIT
```

If any operation fails:

```text
ROLLBACK
```

This guarantees that we don't end up with:

```text
Organization exists
but
OWNER membership does not exist
```

or:

```text
Organization exists
but
event/idempotency state is missing
```

---

# 7. Organization + Owner Membership

Creating an organization automatically creates its initial owner membership.

Conceptually:

```text
Organization
     |
     +---- OWNER Membership
                |
                +---- Platform User
```

The owner relationship is therefore established as part of the same transaction.

Roles and permissions will be designed separately.

For now, `OWNER` is the initial role required by organization creation.

---

# 8. Redis Architecture

Redis is a derived context/cache layer.

It is **not the source of truth**.

Postgres remains authoritative.

## Proposed Redis Structures

### Organization Slug Index

```text
workspace:org:slugs
```

Hash:

```text
slug -> organizationId
```

Example:

```text
acme     -> org-123
globex   -> org-456
```

This supports fast:

```text
slug -> organization
```

resolution.

---

### User Organization Memberships

```text
workspace:user:{userId}:orgs
```

Hash:

```text
organizationId -> membership context
```

Example:

```text
org-123 -> {
    membershipId: "membership-1",
    status: "ACTIVE"
}

org-456 -> {
    membershipId: "membership-2",
    status: "SUSPENDED"
}
```

This supports:

```text
Does this user have access to this organization?
```

without requiring a database query on every request.

---

### Organization Context

Potential structure:

```text
workspace:org:{orgId}
```

Hash containing organization context such as:

```text
name
slug
status
...
```

The exact fields will be finalized during Redis implementation.

---

# 9. Redis Cache-Miss Strategy

There will not be a dedicated "repopulate Redis" API.

Redis will use a cache-aside/read-through pattern.

```text
Request
    |
    v
Redis
    |
    +-- HIT --> Continue
    |
    +-- MISS
          |
          v
       Postgres
          |
          v
     Populate Redis
          |
          v
       Continue
```

For example:

```text
Request
  |
  v
Resolve organization slug
  |
  v
Redis
  |
  +-- HIT --> orgId
  |
  +-- MISS
        |
        v
     Postgres
        |
        v
     HSET Redis
```

The same approach applies to membership context.

This means Redis can be flushed and progressively rebuilt through normal application traffic.

---

# 10. Redis Write / Projection Strategy

There are two different categories of Redis updates.

## Domain State Changes

For authoritative domain changes:

```text
Postgres
   |
   v
Outbox
   |
   v
Kafka
   |
   v
Redis Projection / Consumer
```

Examples:

- Organization created
- Organization disabled
- Membership revoked
- User removed from organization
- Membership status changed

The event pipeline updates Redis asynchronously.

## Non-authoritative Context

For data such as a user's current/last active organization:

```text
User selects organization
        |
        v
Redis
```

This does not necessarily require a Kafka event because it is a context/UX preference rather than authoritative domain state.

---

# 11. Redis Failure Behaviour

Redis must not become a single point of failure.

If Redis is unavailable:

```text
Redis unavailable
       |
       v
Postgres fallback
       |
       v
Request continues
```

If the database transaction succeeds but Redis cannot be updated:

```text
Postgres  = SUCCESS
Outbox    = SUCCESS
Redis     = FAILURE
```

The organization remains valid.

The event pipeline and/or future cache misses can repair Redis.

### Important Invariant

Redis must be rebuildable from authoritative state.

> Redis can be deleted completely without losing business data.

---

# 12. Event Publication

Even if there are currently no consumers for organization creation, the event boundary will be established through the Outbox Pattern.

Example event:

```json
{
  "eventType": "organization.created",
  "organizationId": "...",
  "createdBy": "...",
  "timestamp": "..."
}
```

The event is created inside the same transaction as the organization and membership.

```text
BEGIN
    Organization
    OWNER Membership
    Outbox Event
COMMIT
```

Then:

```text
Outbox
   |
   v
Kafka
   |
   v
Future Consumers
```

We do not need to invent a consumer merely because the event exists.

---

# 13. Idempotency

Organization creation should be idempotent.

This protects against:

- Double-clicks
- Network timeouts
- Client retries
- Reverse-proxy retries
- Repeated requests
- Concurrent duplicate requests

## Frontend

The frontend generates one key per logical creation operation.

Example:

```ts
const idempotencyKey = crypto.randomUUID();
```

The same key is reused for retries.

```text
Logical operation
       |
       +-- Request #1 -> abc-123
       +-- Request #2 -> abc-123
       +-- Request #3 -> abc-123
```

A new organization creation gets a new key.

The frontend should not generate a new key for every HTTP retry.

## Backend

The backend enforces idempotency.

Potential generic table:

```text
idempotency_keys

id
userId
key
operation
status
responseStatus
responseBody
createdAt
expiresAt
```

With a uniqueness constraint conceptually equivalent to:

```text
UNIQUE(userId, operation, key)
```

The database, rather than the frontend, provides the actual guarantee.

---

# 14. Idempotency + Transaction

The ideal organization creation transaction is:

```text
BEGIN

    Register / validate idempotency operation

    Create Organization

    Create OWNER Membership

    Create OrganizationCreated Outbox Event

    Store successful response

COMMIT
```

On a retry:

```text
Same user
    +
Same operation
    +
Same Idempotency-Key
        |
        v
Existing result
        |
        v
Return previous response
```

No duplicate organization is created.

The generic idempotency infrastructure can later be reused for other commands such as invitation acceptance.

---

# 15. Active Organization

After successful organization creation, the newly created organization becomes the user's active organization.

Conceptually:

```text
Create Organization
        |
        v
OWNER Membership
        |
        v
activeOrgId = new organization
```

This is context/UX state and is not an authorization boundary.

Authorization must always be based on actual membership and organization state.

---

# 16. Audit Logging — Future Step

Audit logging is planned but does not need to be fully designed before the first implementation.

Example future audit record:

```text
actorUserId
action = ORGANIZATION_CREATED
entityType = ORGANIZATION
entityId
organizationId
metadata
createdAt
```

Example:

```text
Actor: user-123
Action: ORGANIZATION_CREATED
Entity: Organization
Entity ID: org-456
```

Audit logs are intentionally separate from domain events.

### Domain Event

Purpose:

```text
Communication between services/components
```

### Audit Log

Purpose:

```text
Historical record of what happened and who performed it
```

---

# 17. Architectural Invariants

The following principles should remain true:

- Organization creation and OWNER membership creation are transactional.
- Invite acceptance must be idempotent.
- Organization creation must be idempotent.
- Identity owns platform-user lifecycle.
- Workspace owns organization, membership, and invitation lifecycle.
- Workspace user data is a local projection.
- Redis is never the source of truth.
- `lastActiveOrg` is not an authorization boundary.
- Domain changes can propagate through Outbox → Kafka → projections.
- Redis can be rebuilt from authoritative data.
- Live domain data is not hard-deleted; archival is used instead.
- Critical authorization decisions must account for stale projections/eventual consistency.

---

# 18. Implementation Sequence

We will implement the feature incrementally.

## Step 1 — Core Create Organization API

```text
Authentication
      ↓
User validation
      ↓
Input validation
      ↓
DB Transaction
      ├── Organization
      └── OWNER Membership
      ↓
Response
```

## Step 2 — Redis Layer

Add:

- Organization slug resolution
- User membership context
- Organization context
- Cache misses
- DB fallback
- Redis population

## Step 3 — Event Publication

Add:

```text
Organization
    ↓
Outbox
    ↓
Kafka
```

No consumer is required yet.

## Step 4 — Idempotency

Add generic command idempotency infrastructure.

## Step 5 — Audit Logging

Introduce the audit model and logging mechanism once the domain flow is stable.

---

# 19. Current Boundary

We intentionally do **not** solve everything during Create Organization.

Not yet finalized:

- Roles
- Permissions
- Full authorization model
- Complete state-machine implementation
- Exact Redis fields
- Redis TTL strategy
- Full audit-log architecture
- Consumers for `OrganizationCreated`
- Complete invitation state machine

Those will be addressed when their respective phases begin.

---

# 20. Target Mental Model

The final architecture we are moving toward is:

```text
                    ┌───────────────┐
                    │   Frontend    │
                    └───────┬───────┘
                            │
                     Idempotency-Key
                            │
                            v
                    ┌───────────────┐
                    │     Nginx     │
                    └───────┬───────┘
                            │
                            v
                    ┌───────────────┐
                    │    Workspace  │
                    │    Service    │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 v                     v
            PostgreSQL              Redis
          Source of Truth        Derived Context
                 │
                 │ Transaction
                 │
        ┌────────┼─────────┐
        │        │         │
        v        v         v
      Org     Owner      Outbox
             Member        │
                           v
                         Kafka
                           │
                           v
                   Future Consumers
                           │
                           v
                    Redis Projections
```

The key principle is:

> **Postgres owns truth, Redis accelerates context, Outbox guarantees event publication, Kafka distributes domain changes, and idempotency makes commands safe to retry.**
