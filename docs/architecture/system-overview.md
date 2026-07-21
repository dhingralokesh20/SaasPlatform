a# Worksphere - System Overview

## Purpose

Worksphere is a multi-tenant SaaS platform designed to help organizations collaborate, communicate, and manage their operations through modular services.

The platform is being built as a learning and engineering project focused on scalability, maintainability, distributed systems, and modern SaaS architecture.

---

# Current Architecture

```text
+----------------+
| Angular Client |
+----------------+
         |
         v
+------------------+
| Identity Service |
+------------------+
         |
         +-------> PostgreSQL
         |
         +-------> Redis
```

## Angular Client

Responsibilities:

* User authentication
* Session management
* Organization onboarding
* Future collaboration features

Technology:

* Angular
* TypeScript
* Tailwind CSS

---

## Identity Service

Responsibilities:

* User registration
* Login
* Logout
* Token generation
* Session validation
* Password management
* Authentication workflows

Technology:

* Node.js
* TypeScript
* Express

---

## PostgreSQL

Responsibilities:

* User data
* Organization data
* Membership data
* Persistent application data

---

## Redis

Responsibilities:

* Session storage
* Token validation
* Temporary data
* Cache layer

---

# Planned Architecture

As the platform grows, functionality will be split into independent services.

```text
                           +----------------+
                           | Angular Client |
                           +----------------+
                                    |
                                    v
                          +------------------+
                          | Identity Service |
                          +------------------+
                                    |
                                    v
                               Kafka Bus
                                    |
          ------------------------------------------------
          |                      |                      |
          v                      v                      v

+----------------+    +----------------+    +----------------+
| Workspace      |    | Chat Service   |    | Notification   |
| Service        |    |                |    | Service        |
+----------------+    +----------------+    +----------------+

          |                      |                      |
          v                      v                      v

     PostgreSQL            PostgreSQL            PostgreSQL
```

---

# Service Responsibilities

## Identity Service

Owns:

* Authentication
* Authorization
* Sessions
* User identities

---

## Workspace Service

Owns:

* Organizations
* Memberships
* Roles
* Permissions
* Invitations

---

## Chat Service

Owns:

* Conversations
* Messages
* Real-time communication

---

## Notification Service

Owns:

* Email notifications
* In-app notifications
* Event notifications

---

# Communication Strategy

## Initial Phase

Services may communicate directly when complexity is low.

## Growth Phase

Services communicate using Kafka events.

Examples:

* UserCreated
* OrganizationCreated
* UserInvited
* UserJoinedOrganization

Benefits:

* Loose coupling
* Better scalability
* Independent deployments
* Improved fault isolation

---

# Design Principles

1. Clear ownership of data.
2. Service boundaries based on business capabilities.
3. Event-driven communication where appropriate.
4. Stateless services whenever possible.
5. Horizontal scalability.
6. Security-first authentication design.
7. Maintainability over premature optimization.

---

# Current Focus

Phase 1:

* Authentication
* Frontend foundation
* Organization management

Future phases:

* Chat
* Notifications
* Event-driven orchestration
* Real-time collaboration
