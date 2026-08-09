# Debugging Services with VS Code

This project uses Docker Compose + Node.js Inspector + VS Code for debugging backend services.

## 1. Start Docker in Debug Mode

Use the debug environment file:

```bash
docker compose --env-file .env.debug up
```

The `.env.debug` file contains the normal environment configuration plus:

```env
DEBUG_SERVICE=identity
IDENTITY_DEBUG_PORT=9229
WORKSPACE_DEBUG_PORT=9230
NOTIFICATION_DEBUG_PORT=9231
```

Only the service specified by `DEBUG_SERVICE` starts with the Node.js debugger enabled.

### Available services

| Service      | Debug Port |
| ------------ | ---------: |
| Identity     |       9229 |
| Workspace    |       9230 |
| Notification |       9231 |

---

## 2. Attach VS Code

Open:

**Run and Debug → Attach: Identity Service**

or select the appropriate service:

* `Attach: Identity Service`
* `Attach: Workspace Service`
* `Attach: Notification Service`

The configurations are already defined in:

```text
.vscode/launch.json
```

---

## 3. Set a Breakpoint

Open the TypeScript file you want to debug and click beside the line number.

Example:

```ts
const { email, password } = req.body;
```

A red dot should appear.

---

## 4. Trigger the Code

Call the corresponding API from the frontend, Postman, or another client.

For example:

```text
POST http://localhost:3001/auth/login
```

When execution reaches the breakpoint, VS Code will pause.

You can then inspect:

* Local variables
* Request data
* Call stack
* Expressions
* Database values
* Execution flow

Use:

* **F5** — Continue
* **F10** — Step Over
* **F11** — Step Into
* **Shift + F11** — Step Out

---

## 5. Debug Another Service

Change `DEBUG_SERVICE` in `.env.debug`.

### Workspace

```env
DEBUG_SERVICE=workspace
```

Then restart:

```bash
docker compose --env-file .env.debug down
docker compose --env-file .env.debug up
```

Attach:

```text
Attach: Workspace Service
```

### Notification

```env
DEBUG_SERVICE=notification
```

Then restart Compose and attach:

```text
Attach: Notification Service
```

---

## 6. Normal Development

Debugging is **not enabled by default**.

For normal development use:

```bash
docker compose up
```

For debugging use:

```bash
docker compose --env-file .env.debug up
```

---

## Quick Reference

### Normal

```bash
docker compose up
```

### Debug

```bash
docker compose --env-file .env.debug up
```

### Stop

```bash
docker compose down
```

### Debug workflow

```text
.env.debug
    ↓
docker compose --env-file .env.debug up
    ↓
Node Inspector starts
    ↓
VS Code → Run & Debug
    ↓
Attach to service
    ↓
Set breakpoint
    ↓
Call API
    ↓
Debugger pauses
```

> **Important:** `.env.debug` is a complete environment file. Keep the normal infrastructure variables in it as well as the debugging variables, because `--env-file` does not automatically merge values from `.env`.
