# Development Setup

## Purpose

This document explains how to set up the WorkSphere development environment.

---

# Requirements

Required software:

- Node.js
- npm
- Docker
- Docker Compose
- PostgreSQL
- Redis

---

# Repository Setup

Clone repository:

```bash
git clone https://github.com/dhingralokesh20/SaasPlatform.git
```

Install dependencies:

```bash
npm install
```

---

# Environment Configuration

Each service requires environment variables.

Example:

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
COOKIE_SECRET=
```

Environment files should never be committed.

---

# Running Infrastructure

Start dependencies:

```bash
docker compose up -d
```

Current infrastructure:

- PostgreSQL
- Redis
- Supporting services

---

# Running Applications

Start development environment:

```bash
npm run dev
```

Applications:

- Identity Service
- Frontend
- Other services

---

# Monorepo Commands

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run development:

```bash
npm run dev
```

---

# Debugging

Useful locations:

```
docs/debug-logs/
```

Contains:

- Production issues
- Debug investigations
- Solutions

---

# Development Principles

- Keep services isolated
- Prefer reusable abstractions
- Document architectural decisions
- Avoid unnecessary complexity# Development Setup

## Purpose

This document explains how to set up the WorkSphere development environment.

---

# Requirements

Required software:

- Node.js
- npm
- Docker
- Docker Compose
- PostgreSQL
- Redis

---

# Repository Setup

Clone repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

---

# Environment Configuration

Each service requires environment variables.

Example:

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
COOKIE_SECRET=
```

Environment files should never be committed.

---

# Running Infrastructure

Start dependencies:

```bash
docker compose up -d
```

Current infrastructure:

- PostgreSQL
- Redis
- Supporting services

---

# Running Applications

Start development environment:

```bash
npm run dev
```

Applications:

- Identity Service
- Frontend
- Other services

---

# Monorepo Commands

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run development:

```bash
npm run dev
```

---

# Debugging

Useful locations:

```
docs/debug-logs/
```

Contains:

- Production issues
- Debug investigations
- Solutions

---

# Development Principles

- Keep services isolated
- Prefer reusable abstractions
- Document architectural decisions
- Avoid unnecessary complexity