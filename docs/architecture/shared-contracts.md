# Shared Contracts

`@worksphere/shared-contracts` contains the contracts shared between services.

It is primarily used for:

* Kafka event envelopes
* Event types
* Event payloads
* Shared DTOs/contracts that cross service boundaries

## Location

```text
packages/
└── shared-contracts/
    ├── src/
    │   ├── events/
    │   ├── ...
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

## Using Shared Contracts

Import contracts through the package:

```ts
import {
  EventTypes,
  PasswordResetRequestedEvent,
} from "@worksphere/shared-contracts";
```

Do not import files directly from another service's source directory.

---

## Adding a New Event

When adding a Kafka event:

### 1. Create the payload contract

Example:

```ts
import { EventEnvelope } from "../base.event";

export interface OtpRequestedPayload {
  email: string;
  otp: string;
  type: string;
  expiresInSeconds: number;
}

export type OtpRequestedEvent =
  EventEnvelope<OtpRequestedPayload> & {
    eventType: "OTP_REQUESTED";
    aggregateType: "OTP";
  };
```

### 2. Add the event type

Update the event constants:

```ts
export const EventTypes = {
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  OTP_REQUESTED: "OTP_REQUESTED",
} as const;
```

### 3. Export the contract

Make sure the new contract is exported through the appropriate `index.ts`.

Example:

```ts
export * from "./events/otp-requested.event";
```

### 4. Build shared contracts

From the repository root:

```bash
npm run build -w @worksphere/shared-contracts
```

If the package does not have a build script, use the package's configured build command.

### 5. Use it from a service

```ts
import {
  EventTypes,
  OtpRequestedEvent,
} from "@worksphere/shared-contracts";
```

---

## Development Workflow

When changing a shared contract:

```text
Modify contract
      ↓
Build shared-contracts
      ↓
Typecheck affected services
      ↓
Run tests
      ↓
Restart Docker services if required
```

For example:

```bash
npm run build -w @worksphere/shared-contracts
npm run typecheck -w @apps/identity-service
npm run typecheck -w @apps/notification-service
```

---

## Important Rules

### Shared contracts contain contracts, not business logic

Good:

```ts
interface OtpRequestedPayload {
  email: string;
  otp: string;
}
```

Avoid putting service-specific logic inside this package.

### Treat published event contracts as APIs

Once an event is consumed by another service, changing its structure can break consumers.

Prefer backwards-compatible changes.

For example, adding an optional field is safer than renaming/removing an existing field.

### Never share sensitive internal implementation details

Do not expose:

* database models
* repositories
* Redis keys
* service internals
* password hashes
* OTP hashes

Only expose information required by the receiving service.

---

## Event Contract Example

Identity Service publishes:

```ts
{
  eventType: "OTP_REQUESTED",
  aggregateType: "OTP",
  aggregateId: "...",
  payload: {
    email: "user@example.com",
    otp: "123456",
    type: "LOGIN",
    expiresInSeconds: 300
  }
}
```

Notification Service consumes the contract and handles the event without depending on Identity Service's implementation.

This is the primary purpose of `@worksphere/shared-contracts`.
