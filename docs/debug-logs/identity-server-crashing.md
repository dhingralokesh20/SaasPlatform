# Identity Service Startup Issue (Monorepo ts-node Failure)

---

## 🚨 Problem

The Identity Service was not starting correctly in the Docker/monorepo environment.

### Observed behavior:

- `nodemon` started successfully  
- No logs from `server.ts` were printed  
- Process immediately exited with:

```txt
[nodemon] clean exit - waiting for changes before restart

Even a top-level console.log() did not execute
npx ts-node src/server.ts produced no output
Service appeared to start and exit instantly without errors


Root Cause

Monorepo TypeScript configuration mismatch.

Backend service inherited frontend-style TS settings
ts-node used esnext + bundler resolution
Node.js (CommonJS runtime) could not execute module graph correctly
Process exited silently without logs