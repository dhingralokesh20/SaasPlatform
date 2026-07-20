# Backend Architecture

## Purpose

The WorkSphere backend is designed around a modular service-oriented architecture that emphasizes maintainability, scalability, and clear separation of responsibilities.

Each service owns a well-defined domain while following consistent architectural patterns across the platform.

The current implementation consists of a single Identity Service, with additional services planned as the platform grows.

---

# High Level Architecture

```text
                    +----------------------+
                    |      Frontend        |
                    |       Angular        |
                    +----------+-----------+
                               |
                               |
                          REST APIs
                               |
                               v
                 +----------------------------+
                 |      Identity Service      |
                 |     Node.js + Express      |
                 +-------------+--------------+
                               |
                +--------------+--------------+
                |                             |
                v                             v
          PostgreSQL                     Redis
```

---

# Architectural Principles

The backend follows several core principles:

- Domain-driven modularity
- Layered architecture
- Clear separation of concerns
- Dependency injection
- Transactional consistency
- Reusable infrastructure
- Framework independence within business logic

---

# Layered Architecture

Every service follows the same layered structure.

```text
HTTP Request
      │
      ▼
Routes
      │
      ▼
Controllers
      │
      ▼
Services
      │
      ▼
Repositories / Infrastructure
      │
      ▼
Database
```

Each layer has a single responsibility.

---

# Layer Responsibilities

## Routes

Responsibilities:

- Define endpoints
- Register middleware
- Forward requests to controllers

Routes should contain no business logic.

---

## Controllers

Responsibilities:

- Parse requests
- Validate inputs
- Call services
- Return HTTP responses

Controllers remain thin and delegate business rules to services.

---

## Services

Services contain the application's business logic.

Responsibilities include:

- Authentication
- Session management
- OTP verification
- Transactions
- Cross-component orchestration

Business rules should exist only within this layer.

---

## Repositories

Repositories are responsible for data persistence.

Responsibilities:

- Database interaction
- Query abstraction
- Persistence logic

Repositories should not contain business rules.

---

# Shared Infrastructure

Shared components include:

- Error handling
- Request validation
- Request sanitization
- Middleware
- Authentication utilities
- Logging
- Configuration
- Utility functions

These components are reusable across services.

---

# Dependency Flow

Dependencies always flow downward.

```text
Routes
    │
Controllers
    │
Services
    │
Repositories
```

Lower layers never depend on higher layers.

---

# Database Strategy

The backend currently uses PostgreSQL as the primary datastore.

Responsibilities include:

- Persistent application data
- Transactions
- Session storage
- Audit history

Redis is used only for temporary, short-lived data such as OTPs and rate limiting.

---

# Error Handling

Errors are centralized through a shared application error model.

Benefits include:

- Consistent API responses
- Standardized error codes
- Simplified debugging
- Predictable client behavior

---

# Transactions

Database transactions are used whenever multiple operations must succeed or fail together.

Examples include:

- User registration
- Login and session creation
- Password reset
- Refresh token rotation

---

# Scalability

The architecture is designed to evolve into multiple independent services without requiring significant structural changes.

Future services may include:

- Workspace Service
- Notification Service
- File Service
- Search Service
- Analytics Service

Each service will follow the same architectural conventions.

---

# Current Status

Current backend services:

- Identity Service

Primary technologies:

- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis

Future integrations:

- Kafka
- Outbox Pattern
- Object Storage (S3-compatible)
- Background Workers