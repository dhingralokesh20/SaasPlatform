# Invitation Service — Finalized Architecture Decisions

## 1. Invitation Creation

### API

`POST /invitation/:organizationId`

### Request

The API accepts an array of emails.

    {
      "emails": [
        "alice@example.com",
        "bob@example.com"
      ]
    }

### Rules

- Maximum **20 emails** per request.
- Normal invitation API is limited to 20 emails.
- A future **bulk invitation API** will support Excel/CSV upload.
- Role is **not included yet**. Role support will be added later.
- Emails should be normalized before processing.
- Duplicate emails within the same request should be deduplicated.

### Per-email processing

One invalid/business-conflicting email should **not fail the entire request**.

Example:

    {
      "success": true,
      "data": [
        {
          "email": "alice@example.com",
          "status": "INVITED"
        },
        {
          "email": "bob@example.com",
          "status": "ALREADY_INVITED"
        },
        {
          "email": "charlie@example.com",
          "status": "ALREADY_MEMBER"
        }
      ]
    }

### Error Categories

#### Request-level errors

These fail the complete API request:

- Invalid request body
- More than 20 emails
- Authentication failure
- Authorization failure
- Invalid/non-existent organization
- Other request validation failures

#### Per-email business outcomes

These are returned individually:

- `INVITED`
- `ALREADY_INVITED`
- `ALREADY_MEMBER`
- `CANNOT_INVITE_SELF`
- Other business-specific invitation states as required

#### System errors

Infrastructure failures such as:

- Database failure
- Redis failure
- Email provider failure
- Unexpected internal errors

are treated separately from normal per-email business outcomes.

---

# 2. Invitation Repository

`InvitationRepository` is responsible for persistence operations such as:

    createInvitation()
    findPendingInvitation()

The invitation record contains:

- `organizationId`
- `email`
- `emailHash`
- `invitedBy`
- `tokenHash`
- `expiresAt`
- `status`

The invitation token itself is never stored in plaintext.

---

# 3. Invitation Token

The invitation URL contains a cryptographically random token.

Example:

    https://app.worksphere.com/invite/<token>

Only the hash of the token is stored:

    raw token
        ↓
      hash
        ↓
    tokenHash

When resolving an invitation:

    token from URL
        ↓
      hash
        ↓
    find invitation by tokenHash

The raw token should not be persisted.

---

# 4. Email Binding

The invitation is addressed to an email, but workspace membership is ultimately granted to a `userId`.

The invitation stores:

    email
    emailHash
    tokenHash

### `email`

Used for:

- Sending the invitation
- Display/audit purposes
- Operational purposes

### `emailHash`

Used for secure identity binding.

Prefer an HMAC-based hash:

    HMAC(serverSecret, normalizedEmail)

rather than a plain SHA-256 hash.

At acceptance:

    authenticated user's verified email
              ↓
           normalize
              ↓
      HMAC(secret, email)
              ↓
      compare with invitation.emailHash

This avoids making the eventually-consistent `platform_users` projection part of the security boundary.

---

# 5. `platform_users` Is a Projection

`platform_users` is maintained through eventual consistency.

Therefore:

> `platform_users` is NOT an authoritative source for security-sensitive identity decisions.

It may be used for:

- Convenience lookups
- Workspace-side metadata
- Personalization
- Non-critical optimizations

It must not be relied upon to prove:

- Whether an identity exists
- Whether an email belongs to a user
- Whether an authenticated user is the invitation recipient

Identity Service remains the source of truth for identity.

Membership remains the source of truth for organization membership.

---

# 6. Invitation State Machine

Invitation states:

    PENDING
    ACCEPTED
    EXPIRED
    REVOKED

Valid transitions:

                     ┌──────────────┐
                     │    PENDING   │
                     └──────┬───────┘
                            │
                 ┌──────────┼──────────┐
                 │          │          │
                 ▼          ▼          ▼
             ACCEPTED    EXPIRED    REVOKED

Terminal states:

- `ACCEPTED`
- `EXPIRED`
- `REVOKED`

Terminal states cannot transition back to `PENDING`.

A new invitation creates a new invitation record.

---

# 7. Duplicate Invitation Rules

### Existing `PENDING` invitation

Return:

    ALREADY_INVITED

Do not create another invitation.

Resending an invitation should be an explicit future operation rather than silently creating another invitation.

### Existing `EXPIRED` invitation

Create a new invitation.

### Existing `REVOKED` invitation

Create a new invitation.

### Existing `ACCEPTED` invitation

An accepted invitation does not permanently prevent future invitations.

Check the current membership state:

- Active membership → `ALREADY_MEMBER`
- No active membership → a new invitation may be created according to business rules

---

# 8. Invitation Resolution

The invitation flow is deliberately split into separate responsibilities.

The invitation token is the workflow entry point.

The `invitationId` becomes the workflow correlation identifier after the initial token resolution.

## API 1 — Resolve / Validate Invitation

Example:

    GET /invitations/:token/resolve

Responsibilities:

- Hash and validate the token
- Check invitation existence
- Check invitation status
- Check expiration
- Return minimal invitation/workspace context
- Return `invitationId`

Example response:

    {
      "valid": true,
      "invitationId": "inv-123",
      "organization": {
        "id": "org-123",
        "name": "Acme"
      }
    }

This API does **not**:

- Register a user
- Log a user in
- Create membership
- Accept the invitation
- Depend on `platform_users`

---

# 9. Identity Flow

After a valid invitation is resolved, the frontend retains the `invitationId`.

Identity Service handles the user's platform identity.

Possible states:

    NOT_REGISTERED
    REGISTERED_BUT_NOT_AUTHENTICATED
    AUTHENTICATED

### Not registered

Identity Service handles registration.

### Registered but not authenticated

Identity Service handles login.

### Already authenticated

The user can proceed directly to the workspace invitation flow.

The invitation context should remain separate from the JWT.

The JWT represents:

> Who is this user?

The `invitationId` represents:

> Which invitation workflow is this user completing?

Do not put invitation state into the JWT.

---

# 10. Registration Idempotency

The initial invitation resolution is only a snapshot.

State can change before registration.

Example:

    Resolve → NOT_REGISTERED
          ↓
    Another process registers the user
          ↓
    Registration request

Identity Service must independently validate the registration.

If the account already exists, return an expected business result such as:

    ACCOUNT_ALREADY_EXISTS

The frontend can transition to login.

This should not be treated as an unexpected `500` error.

General principle:

> Resolve APIs provide a snapshot. Commands must revalidate authoritative state.

---

# 11. Membership Resolution

After the user is authenticated, Workspace Service resolves what the invitation means for that authenticated user.

Conceptually:

    invitationId
          +
    authenticated user
          ↓
    Invitation state
          +
    email identity binding
          +
    membership state

Possible results include:

    READY_TO_ACCEPT
    ALREADY_MEMBER
    EMAIL_MISMATCH
    INVITATION_EXPIRED
    INVITATION_REVOKED
    INVITATION_ALREADY_ACCEPTED

This operation should not create membership.

---

# 12. Accept Invitation

The final operation is a command.

Example:

    POST /invitations/:invitationId/accept
    Authorization: Bearer <access-token>

The accept operation must **revalidate authoritative state** instead of trusting a previous resolution response.

It must verify:

1. Invitation exists.
2. Invitation is still `PENDING`.
3. Invitation has not expired.
4. Authenticated identity is valid.
5. Authenticated user's verified email matches the invitation's `emailHash`.
6. User is not already an active member.

Then, inside a transaction:

    BEGIN

      verify invitation
      verify identity/email binding
      verify membership

      create membership
      mark invitation ACCEPTED

    COMMIT

The final membership change and invitation transition should be atomic within the Workspace Service database.

---

# 13. Distributed State Machine Principle

The system contains independent state machines.

## Invitation State Machine

    PENDING → ACCEPTED
            → EXPIRED
            → REVOKED

## Identity State Machine

    NOT_REGISTERED → REGISTERED → AUTHENTICATED

## Membership State Machine

    NOT_MEMBER → ACTIVE → REMOVED

These state machines live in different services.

We should **not attempt to make them a single distributed transaction**.

Instead:

    READ / RESOLVE
          ↓
       snapshot
          ↓
    frontend routing / identity flow
          ↓
       COMMAND
          ↓
    revalidate authoritative state
          ↓
    perform transition

Key principle:

> **Reads may become stale. Commands must revalidate.**

This protects the system from state changes occurring between resolution and acceptance.

---

# 14. Security Model

The invitation token provides access to the invitation workflow, but possession of the token alone must not be sufficient to create arbitrary workspace membership.

At final acceptance:

    Invitation
         +
    Authenticated Identity
         +
    Verified Email Match
         +
    Valid Invitation State
         +
    Membership State
         ↓
    Create Membership

If an attacker obtains Alice's invitation token but authenticates as Bob:

    Invitation email = alice@example.com
    Authenticated email = bob@example.com

then:

    EMAIL_MISMATCH

and membership must not be created.

---

# 15. Concurrency and Database Protection

Service-level checks are not sufficient for concurrent requests.

Example:

    Request A → membership doesn't exist
    Request B → membership doesn't exist

    A → create membership
    B → create membership

Database constraints must protect against this.

## Membership Constraint

Recommended unique constraint:

    (userId, organizationId)

for membership.

## Pending Invitation Constraint

Pending invitations should have database-level protection against concurrent duplicate invitation creation.

Recommended PostgreSQL partial unique index:

    CREATE UNIQUE INDEX unique_pending_invitation
    ON invitations (organization_id, email)
    WHERE status = 'PENDING';

The exact migration/index implementation will be finalized with the schema.

---

# 16. Final End-to-End Flow

                    User clicks invitation link
                              │
                              ▼
              GET /invitations/:token/resolve
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 INVALID              VALID
                    │                   │
                    ▼                   ▼
                  Error           invitationId
                                        │
                                        ▼
                              Identity Service
                                        │
                              ┌─────────┼─────────┐
                              │         │         │
                         REGISTER     LOGIN   AUTHENTICATED
                              │         │         │
                              └─────────┴─────────┘
                                        │
                                        ▼
                               Authenticated User
                                        │
                                        ▼
                         Workspace Membership Resolve
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                         ALREADY_MEMBER      READY_TO_ACCEPT
                                                  │
                                                  ▼
                                      POST /invitations/:id/accept
                                                  │
                                                  ▼
                                          Revalidate State
                                                  │
                                                  ▼
                                           DB Transaction
                                             ┌────┴────┐
                                             ▼         ▼
                                        Membership  Invitation
                                         Created     ACCEPTED

---

# 17. API Responsibilities

| API | Owner | Purpose | Mutation |
|---|---|---|---|
| `POST /invitation/:organizationId` | Workspace | Create invitations | Yes |
| `GET /invitations/:token/resolve` | Workspace | Validate invitation + return context | No |
| Identity Register | Identity | Create platform identity | Yes |
| Identity Login | Identity | Authenticate platform user | Yes |
| Membership Resolve | Workspace | Resolve invitation against authenticated user | No |
| `POST /invitations/:id/accept` | Workspace | Create membership + accept invitation | Yes |

---

# 18. Architectural Ownership

| Concern | Source of Truth |
|---|---|
| Platform identity | Identity Service |
| User authentication | Identity Service |
| Invitation | Workspace / Invitation Service |
| Organization | Workspace Service |
| Membership | Workspace Service |
| `platform_users` | Workspace projection |
| Invitation token | Invitation Service |
| Invitation → identity binding | Invitation email hash + authenticated identity |
| Invitation acceptance | Workspace Service |

---

# 19. Core Design Principles

1. **Identity Service owns identity.**
2. **Workspace Service owns invitations and memberships.**
3. **`platform_users` is never a security authority.**
4. **Invitation token is never stored in plaintext.**
5. **Invitation email is cryptographically bound to the authenticated identity.**
6. **Resolve operations are read-only snapshots.**
7. **Commands always revalidate state.**
8. **Registration is resilient to races and duplicate state.**
9. **Membership creation and invitation acceptance are transactional.**
10. **Database constraints protect against concurrent duplicate operations.**
11. **Invitation context (`invitationId`) stays separate from authentication state/JWT.**
12. **Distributed state machines are coordinated through explicit workflow steps, not distributed transactions.**
13. **The frontend may carry workflow context, but it must never be trusted as the authority for invitation or membership state.**
14. **Every security-sensitive decision is revalidated by the service that owns the relevant state.**