# Designing Workspace

> Living design document for the Worksphere Workspace Service.
>
> This document captures the architectural decisions, problems, trade-offs, and open questions discussed while designing the Workspace Service.

---

# 1. Core Responsibility

The fundamental service boundary:

```text
Identity Service
    → Who is the user?

Workspace Service
    → Which organizations does the user belong to?
    → What can the user do inside them?
    → What is the user's organizational context?
```

## Identity owns

* User identity
* Authentication
* Credentials
* Sessions
* MFA
* Password reset
* Email verification

## Workspace owns

* Organizations
* Organization membership
* Invitations
* Roles
* Permissions
* Organization state
* User ↔ Organization relationship
* Organizational context

---

# 2. Core Domain Model

```text
Organization
    │
    ├── OrganizationUser ─── Platform User
    │
    ├── Invitation
    │
    └── Role
           │
           └── RolePermission
                    │
                    └── Permission
```

The key relationship is:

```text
Platform User
      │
      │ membership
      ▼
OrganizationUser
      │
      ▼
Organization
```

A platform user can belong to:

```text
0..N organizations
```

A user does **not** have to belong to an organization.

---

# 3. Organizations

Proposed table:

```text
organizations

id
name
slug
status
createdBy
createdAt
updatedAt
```

## Organization ID

`id` is the internal immutable identifier.

Used for:

* Foreign keys
* DB relationships
* Events
* Internal service communication
* Service-to-service references

## Organization slug

`slug` is the external/navigation identifier.

Example:

```text
/org/acme
/org/acme-engineering
/org/lokesh-personal
```

Used for:

* Frontend routing
* URLs
* Organization navigation
* Human-readable references

Important distinction:

```text
organization.id
    → internal identity

organization.slug
    → external/navigation identity
```

## Slug constraint

Slug should be globally unique:

```text
UNIQUE(slug)
```

Slug should generally remain stable unless explicitly changed because it becomes part of the external URL.

---

# 4. Organization Navigation

Organization navigation will use the slug.

Example:

```text
/org/acme/dashboard
```

Switching from Org A to Org B:

```text
/org/acme/dashboard
        ↓
/org/another-org/dashboard
```

The URL changes.

The organization slug itself is not changed in the DB during navigation.

---

# 5. Organization Membership

Core table:

```text
organization_users

id
organizationId
userId
roleId
status
joinedAt
lastActiveAt
createdAt
updatedAt
```

This represents:

> Platform User X is a member of Organization Y.

`userId` is owned by Identity.

Workspace does **not** become the owner of the platform user.

---

# 6. Invitations

Invitation and membership are different concepts.

```text
Invitation
    │
    ├── organizationId
    ├── email
    ├── roleId
    ├── invitedBy
    ├── token/hash
    ├── expiresAt
    └── status
```

Lifecycle:

```text
PENDING
   │
   ├── ACCEPTED
   ├── REVOKED
   └── EXPIRED
```

Accepting an invitation eventually creates:

```text
organization_users
```

Therefore:

```text
Invitation
     │
     │ accept
     ▼
OrganizationUser
```

---

# 7. Roles and Permissions

Authorization should be extensible instead of hardcoding role behaviour.

Conceptual model:

```text
Role
  │
  └── RolePermission
          │
          └── Permission
```

Example:

```text
ADMIN
 ├── organization.read
 ├── organization.update
 ├── member.invite
 ├── member.remove
 └── role.assign

MEMBER
 ├── organization.read
 └── member.read

VIEWER
 └── organization.read
```

Authorization chain:

```text
User
 ↓
OrganizationUser
 ↓
Role
 ↓
Permissions
```

---

# 8. Platform User Projection

Workspace will use an event-driven local projection instead of owning a duplicate platform-user entity.

Identity publishes events such as:

```text
UserCreated
UserUpdated
UserDeleted
```

through Kafka.

Workspace consumes these events and maintains:

```text
workspace_user_projection
```

Conceptually:

```text
workspace_user_projection

userId                  PK
email
firstName
lastName
avatarUrl
status
lastActiveOrganizationId
createdAt
updatedAt
```

This is **not a second source of truth for users**.

It is:

```text
Identity-owned user information
+
Workspace-owned organizational context
```

---

# 9. Why the User Projection Exists

Without a projection, Workspace would repeatedly need to call Identity:

```text
Workspace → Identity
```

just to display basic user information.

Instead:

```text
Identity
   │
   │ UserUpdated
   ▼
Kafka
   │
   ▼
Workspace
   │
   ▼
workspace_user_projection
```

This gives Workspace fast local reads.

---

# 10. Workspace as Source of Truth for Organizational State

The central ownership rule:

> Identity owns the user. Workspace owns the user's organizational world.

Workspace is authoritative for:

* Organization membership
* Organization state
* Roles
* Permissions
* Invitations
* Organizational access

Other services should not independently invent their own membership truth.

---

# 11. Last Active Organization

There are three different concepts that must not be conflated.

## 1. Membership

> Can this user access Organization A?

Determined by:

```text
organization_users
```

## 2. Requested organization

> Which organization is this request asking for?

Determined by:

```text
URL slug
```

Example:

```text
/org/acme/dashboard
```

## 3. Last active organization

> Which organization should we restore/recommend when establishing a new workspace context?

Stored through Redis / durable projection state.

These concepts must remain separate.

---

# 12. Active Organization Is Not Authorization

`lastActiveOrganizationId` should **never** determine whether a user is allowed to access an organization.

It is convenience/default state.

Authorization must validate:

```text
User status
+
Organization status
+
OrganizationUser status
+
Role/permissions
```

Therefore, if:

```text
Redis:
activeOrganizationId = disabledOrg
```

the request still gets rejected because:

```text
organization.status = DISABLED
```

---

# 13. User Can Access Any Valid Organization Directly

A user should **not** be forced to call a switch API before opening an organization.

Example:

```text
User belongs to:

Org A
Org B

Current lastActiveOrg = B
```

User opens directly:

```text
/org/a/dashboard
```

This is valid.

Workspace should:

```text
resolve slug
    ↓
find organization
    ↓
check organization status
    ↓
check user membership
    ↓
check permissions
    ↓
allow
```

No prior switch API is required.

This means the URL represents the **actual requested context**.

---

# 14. What Does Organization Switching Do?

Switching organizations is primarily a context/preference operation.

Example:

```text
POST /workspace/switch
{
    "organizationId": "org-b"
}
```

This can update:

```text
Redis:
activeOrganizationId = org-b
```

and eventually:

```text
DB:
lastActiveOrganizationId = org-b
```

Frontend then navigates to:

```text
/org-b/...
```

The switch operation does **not** grant access.

Access is always determined independently by membership and authorization.

---

# 15. Active Organization and Multiple Tabs

Consider:

```text
User
├── Tab 1 → Org B
└── Tab 2 → Org A
```

We initially considered user-level state:

```text
user:{userId}:activeOrg
```

but this creates conflicts because Tab 1 and Tab 2 can legitimately operate on different organizations.

Even session-level state can have the same problem if multiple tabs share the same authentication session.

Therefore:

> The URL should remain the authoritative representation of the organization being requested by a particular request.

Example:

```text
Tab 1:
/org/b/dashboard

Tab 2:
/org/a/dashboard
```

Both can be valid simultaneously.

`lastActiveOrganizationId` should therefore not be interpreted as:

> "The only organization the user is currently allowed to access."

It is merely a restore/default preference.

---

# 16. Redis State

We considered Redis for quick access to active organization state.

Conceptually:

```text
session/context
    ↓
activeOrganizationId
```

The exact Redis key strategy is still open.

Important requirements:

* Must support fast lookup.
* Must not require scanning all Redis keys for organization/user invalidation.
* Should support multiple sessions/devices.
* Should be recoverable.
* Redis should not be the source of authorization truth.

---

# 17. Redis Reverse Index

For organization → active sessions lookup, a reverse Redis index may be useful:

```text
org:{orgId}:active-sessions
```

Example:

```text
org:123:active-sessions

    session-A
    session-B
    session-C
```

This allows:

```text
OrganizationDisabled
        ↓
org:123:active-sessions
        ↓
find affected sessions
```

instead of scanning all Redis keys.

Exact implementation is still open.

---

# 18. User → Organizations Lookup

For durable membership relationships, Postgres already provides the correct source of truth.

Useful indexes:

```text
INDEX(userId, status)
INDEX(organizationId, status)
```

This allows efficient:

```text
User → Organizations
```

and:

```text
Organization → Users
```

Therefore, we should not duplicate the entire membership graph into Redis unnecessarily.

---

# 19. Redis vs PostgreSQL Responsibility

Current conceptual split:

```text
PostgreSQL
    ↓
Durable relationship/state truth

Redis
    ↓
Fast ephemeral/session state
```

Postgres owns durable relationships:

```text
User ←→ Organization
```

Redis owns transient context:

```text
Session/context → activeOrganization
```

This keeps Redis smaller and disposable.

---

# 20. Organization Disabled

If:

```text
Organization B
     ↓
DISABLED
```

we may have:

```text
Session A → Org B
Session B → Org B
Session C → Org B
```

and:

```text
User 1 → lastActiveOrg = B
User 2 → lastActiveOrg = B
```

These references need cleanup.

Organization disabling should therefore be treated as a domain lifecycle event.

---

# 21. Organization Disabled — Required Effects

Conceptually:

```text
OrganizationDisabled
        │
        ├── block membership access
        ├── invalidate active session references
        ├── update affected users' last-active organization
        └── notify downstream services
```

If the affected user has another valid organization:

```text
User 42

Org A → MEMBER
Org B → ADMIN   ← disabled
Org C → MEMBER

lastActiveOrg = Org C
```

If no valid organization remains:

```text
lastActiveOrganizationId = NULL
```

---

# 22. User Disabled

The reverse scenario also needs fast handling.

If:

```text
User X
    ↓
DISABLED
```

we need to identify:

* Their active sessions
* Their organization memberships
* Their current organizational context
* Downstream services that care about user state

Durable membership lookup comes from:

```text
organization_users
```

and session invalidation comes from the session/auth architecture plus Redis indexes.

---

# 23. Future Organization-Based Services

Potential future services:

```text
Project Service
Billing Service
Task Service
Analytics Service
Notification Service
```

All may need organizational user state.

The architectural rule is:

> Workspace Service is the authoritative source for organizational membership state.

Workspace publishes domain events:

```text
UserAddedToOrganization
UserRemovedFromOrganization
UserDisabled
OrganizationDisabled
RoleChanged
```

through Kafka.

Architecture:

```text
Workspace
     │
     │ domain events
     ▼
   Kafka
  /  |  \
 /   |   \
▼    ▼    ▼
Project Billing Analytics
```

---

# 24. Local Projections in Future Services

A future service can maintain a local projection when it needs fast access.

Example:

```text
project_user_access

userId
organizationId
status
role/permissions
```

But this projection is not independent truth.

The rule remains:

```text
Workspace
    ↓
source of truth

Other services
    ↓
local projections
```

---

# 25. DB ↔ Redis Consistency Problem

We identified two failure scenarios:

```text
DB update succeeds
Redis update fails
```

and:

```text
Redis update succeeds
DB update fails
```

We should not attempt to make Postgres and Redis behave like one ACID transaction.

Instead:

```text
Postgres
    ↓
Outbox
    ↓
Kafka
    ↓
Redis / other consumers
```

This gives us reliable propagation and retryability.

---

# 26. Redis Should Be Disposable

If:

```text
Postgres = correct
Redis = stale
```

that should be temporarily tolerable.

Redis should be:

* Retryable
* Repairable
* Rebuildable
* Recoverable from durable state

The system should be able to wipe Redis and reconstruct the required state.

Therefore:

> Redis is a performance/state-management layer, not the ultimate source of truth.

---

# 27. Session Expiry Without Explicit Logout

A problem exists if we only persist:

```text
lastActiveOrganizationId
```

during explicit logout.

Consider:

```text
User active in Org B
      ↓
Redis = Org B
DB = Org A
      ↓
User never logs out
      ↓
Session automatically expires
      ↓
Redis state disappears
      ↓
DB still says Org A
```

Therefore:

> Explicit logout should not be the only mechanism that persists last-active organization state.

Possible strategies:

## Strategy A — Persist on every organization switch

```text
Org A → Org B

Redis:
activeOrganizationId = B

DB:
lastActiveOrganizationId = B
```

### Pros

* Durable immediately
* No dependency on logout

### Cons

* DB write on every switch

## Strategy B — Persist on session expiration

Persist the current Redis value when the session is about to expire.

### Pros

* Fewer DB writes

### Cons

* Expiration handling is more complex
* Redis expiration itself is not a reliable transactional workflow

## Strategy C — Hybrid

Current preferred direction:

* Redis stores current active organization/session context.
* DB stores durable fallback.
* Persist on explicit logout.
* Also persist through controlled lifecycle/background mechanisms.
* Never rely on last-active state for authorization.
* Reconstruct Redis from DB if required.

Exact strategy remains open and should be finalized together with session design.

---

# 28. Login and Workspace Context

There are two possible approaches.

## Option A — Identity Login Response Includes Workspace

```text
Frontend
   ↓
Identity Login
   ↓
Identity → Workspace
   ↓
Login response contains workspace context
```

Example:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "user-123"
  },
  "workspace": {
    "activeOrganization": {
      "id": "org-123",
      "slug": "acme",
      "name": "Acme"
    }
  }
}
```

### Problem

Identity becomes coupled to Workspace and the login flow starts orchestrating other services.

This is not preferred for the long-term architecture.

---

# 29. Preferred Login Context Flow

Frontend performs authentication first:

```text
Frontend
   │
   │ POST /login
   ▼
Identity
   │
   └── authentication response
          │
          ▼
       Frontend
          │
          │ GET /workspace/context
          ▼
       Workspace
```

Workspace then:

```text
JWT
 ↓
userId
 ↓
current workspace/session context
 ↓
lastActiveOrganizationId
 ↓
membership validation
 ↓
organization status validation
 ↓
return workspace context
```

Example:

```json
{
  "activeOrganization": {
    "id": "org-123",
    "slug": "acme",
    "name": "Acme"
  },
  "organizations": [
    {
      "id": "org-123",
      "slug": "acme",
      "name": "Acme",
      "role": "ADMIN"
    },
    {
      "id": "org-456",
      "slug": "another-org",
      "name": "Another Org",
      "role": "MEMBER"
    }
  ]
}
```

Frontend then navigates to:

```text
/org/acme/dashboard
```

This keeps ownership clean:

```text
Identity
    → authentication

Workspace
    → organizational context
```

---

# 30. User With Zero Organizations

A platform user may exist without any organization membership.

Valid state:

```text
Platform User
    │
    └── 0 Organizations
```

This should not be treated as an error.

Login/context flow:

```text
User logs in
    ↓
GET /workspace/context
    ↓
No active memberships
    ↓
No active organization
    ↓
/workspace
```

The frontend can show:

```text
Welcome

You don't belong to any organization yet.

[Create Organization]
[Join Organization]
```

The exact onboarding UX is still open.

---

# 31. Do Not Create Fake Default Organizations

Unless product requirements explicitly require personal workspaces, do not automatically create:

```text
"My Workspace"
```

for every platform user.

Keeping:

```text
Platform User
      ↓
0..N Organizations
```

is cleaner.

This also naturally supports:

```text
User registers
      ↓
0 organizations
      ↓
Invitation received
      ↓
Invitation accepted
      ↓
OrganizationUser created
```

---

# 32. Current High-Level Architecture

```text
                         ┌──────────────────┐
                         │ Identity Service │
                         │                  │
                         │ User             │
                         │ Auth             │
                         │ Sessions         │
                         └────────┬─────────┘
                                  │
                             User Events
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Kafka       │
                         └────────┬─────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Workspace Service   │
                       │                     │
                       │ AUTHORITY FOR:      │
                       │ Org membership      │
                       │ Roles               │
                       │ Permissions         │
                       │ Org state           │
                       └───────┬─────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
             PostgreSQL      Redis         Kafka
             durable         fast          events
                 │             │             │
                 │             │       ┌─────┼─────┐
                 │             │       ▼     ▼     ▼
                 │             │    Project Billing ...
                 │             │
                 │             └── current
                 │                 session/context
                 │
                 └── source of truth
```

---

# 33. Current Architectural Principles

These are the principles established so far:

1. **Identity owns the user.**
2. **Workspace owns organizational state.**
3. **Organization ID is internal identity.**
4. **Organization slug is external/navigation identity.**
5. **URL identifies the organization requested by a request.**
6. **Membership determines whether the user can access an organization.**
7. **Last-active organization is convenience state, not authorization state.**
8. **A user can belong to zero or many organizations.**
9. **Redis stores fast/ephemeral state.**
10. **Postgres stores durable truth.**
11. **Redis should be disposable/rebuildable.**
12. **Kafka propagates domain changes.**
13. **Workspace remains the source of truth for organization membership.**
14. **Other services can maintain local projections.**
15. **Identity should not become the orchestrator for Workspace.**
16. **Authentication and organizational context should remain separate concerns.**
17. **Authorization should not depend solely on Redis.**
18. **Failure between Postgres and Redis should be recoverable rather than solved through distributed transactions.**

---

# 34. Open Design Questions

These are the next areas to design.

## State Machines

* Organization states
* User states
* Membership states
* Invitation states
* Valid transitions
* Events generated by transitions

## Database

* Exact schema
* PK/FK relationships
* Unique constraints
* Indexes
* Soft delete vs hard delete
* Cascade strategy
* Audit fields

## Redis

* Exact key structure
* Session/context model
* TTLs
* Reverse indexes
* Multi-device behaviour
* Multi-tab behaviour
* Cleanup strategy
* Rebuild strategy

## Events

* Event names
* Event payloads
* Event versioning
* Idempotency
* Ordering
* Retry behaviour
* Dead-letter handling

## Outbox

* Which transactions create events
* Outbox schema
* Publisher behaviour
* Retry strategy
* Failure handling

## User Disabled Flow

* Session invalidation
* Membership handling
* Projection updates
* Redis cleanup
* Events to downstream services

## Organization Disabled Flow

* Active sessions
* Redis cleanup
* Last-active organization updates
* Membership handling
* Downstream service propagation

## Organization Switching

* Slug resolution
* Membership validation
* Redis state
* DB persistence
* Race conditions
* Multi-tab semantics

## Authorization

* Where authorization happens
* Role/permission evaluation
* Permission caching
* Whether downstream services validate locally
* How Workspace communicates authorization state

## Cross-Service State

* Which Workspace events are public
* Which data future services should project
* How projections are rebuilt
* How stale projections are handled

## Consistency

* What must be strongly consistent
* What can be eventually consistent
* Acceptable stale-state windows
* Kafka downtime
* Redis downtime
* Workspace downtime

## Recovery

* Rebuilding Redis
* Rebuilding projections
* Replaying Kafka events
* Missed events
* Consumer recovery
* Corrupt/stale projection handling

---

# 35. Design Philosophy

The goal of this Workspace Service is not to eliminate every possible failure.

The goal is to make the system's behaviour **explicit, recoverable, and understandable**.

The core separation is:

```text
Identity
    ↓
Who are you?

Workspace
    ↓
Where do you belong?

Organization URL
    ↓
Where are you trying to operate?

Membership + permissions
    ↓
Are you allowed?

Postgres
    ↓
What is durably true?

Redis
    ↓
What is useful to access quickly right now?

Kafka
    ↓
Who else needs to know that something changed?
```

The design should prefer:

```text
Explicit ownership
+
Durable source of truth
+
Disposable projections/cache
+
Event-driven propagation
+
Idempotent recovery
```

over ad-hoc synchronization or service-to-service coupling.
