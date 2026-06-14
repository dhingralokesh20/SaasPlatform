# Why Turbo?

Worksphere uses Turbo as the build orchestration tool for the monorepo.

The project consists of multiple applications and shared packages that will continue to grow over time. As the number of services increases, managing builds, tests, and development workflows manually becomes increasingly difficult.

Turbo provides a structured way to orchestrate tasks across the repository.

## Goals

The primary goals behind choosing Turbo are:

* Faster development workflows
* Dependency-aware task execution
* Scalable monorepo management
* Consistent developer experience

---

## Benefits

### Dependency-Aware Execution

Turbo understands relationships between applications and packages.

For example:

```text
Identity Service
        |
        v
Shared Types Package
```

If a shared package changes, Turbo can determine which applications need to be rebuilt.

This prevents unnecessary work and keeps builds efficient.

---

### Incremental Builds

Turbo executes only the tasks that are affected by a change.

Benefits:

* Faster builds
* Faster test execution
* Reduced developer wait times

---

### Consistent Workflows

Common tasks can be executed from the repository root.

Examples:

```bash
npm run dev
npm run build
npm run test
```

Developers do not need to manually navigate between applications to perform common operations.

---

### Scalability

The current repository contains:

* Identity Service
* Workspace Service
* UI Application

Future services can be added without changing the overall build strategy.

Examples:

* Notification Service
* Reporting Service
* Audit Service

Turbo allows the repository to scale while maintaining manageable build and development workflows.

---

## Why Not Separate Repositories?

Using separate repositories would introduce:

* Duplicate configuration
* Independent dependency management
* More complex local development
* Additional CI/CD overhead

For the current stage of Worksphere, a monorepo provides a simpler and more productive development experience.

---

## Decision Summary

Turbo was chosen because it complements the monorepo architecture and provides a scalable foundation for managing multiple applications and shared packages within a single repository.

The focus is not only on the current structure but also on supporting future growth without increasing operational complexity.
# Monorepo Architecture

## Purpose

Why Worksphere uses a monorepo.

---

## Repository Structure

```text
saas-platform/
├── apps/
├── packages/
├── docs/
├── infra/
├── scripts/
├── turbo.json
├── package.json
└── tsconfig.base.json
```

Explanation of each directory.

---

## Applications

### Identity Service

Responsibilities:

* Authentication
* Sessions
* User Management

### Workspace Service

Responsibilities:

* Organizations
* Memberships
* Roles
* Invitations

### UI

Responsibilities:

* Frontend application
* User workflows

---

## Shared Packages

Purpose:

* Shared types
* Constants
* Utility functions
* Event contracts

Guiding Principle:

Code should only move to shared packages when used by multiple applications.

---

## Dependency Management

Worksphere uses npm workspaces.

Benefits:

* Single dependency installation
* Local package linking
* Simplified package management

---

## Build Orchestration

Worksphere uses Turbo.

### Why Turbo?

The repository contains multiple applications that will continue to grow over time.

Turbo was selected because it provides:

* Dependency-aware task execution
* Incremental builds
* Consistent development workflows
* Better scalability as services are added

Examples:

```bash
npm run dev
npm run build
npm run test
```

---

## Service Boundaries

Identity Service owns:

* Users
* Authentication
* Sessions

Workspace Service owns:

* Organizations
* Memberships
* Roles
* Invitations

Applications should not directly access another application's internals.

Communication should occur through:

* APIs
* Shared contracts
* Events

---

## Design Principles

1. Explicit service ownership.
2. Shared contracts over duplicated code.
3. Framework-agnostic shared packages.
4. Minimize unnecessary abstractions.
5. Maintain clear service boundaries.

---

## Future Evolution

Potential future services:

* Notification Service
* Reporting Service
* Audit Service
* File Management Service

The monorepo structure allows new services to be introduced without changing the overall repository architecture.
