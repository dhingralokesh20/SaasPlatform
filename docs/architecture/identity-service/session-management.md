# Session Management

## Purpose

Sessions provide server-side control over authenticated users.

Unlike purely stateless JWT authentication, WorkSphere maintains active session records that can be revoked at any time.

---

# Session Lifecycle

```text
Login
   │
Create Session
   │
Issue Tokens
   │
Authenticated Requests
   │
Refresh Rotation
   │
Logout / Expire
```

---

# Session Information

Each session stores:

- User
- Refresh Token Hash
- Expiration
- Last Used Time
- Revocation Status

---

# Why Sessions?

Benefits include:

- Logout support
- Refresh token rotation
- Session revocation
- Multi-device support
- Auditability

---

# Source of Truth

The session table is the source of truth.

JWTs alone are never trusted.

---

# Future Enhancements

- Device tracking
- Session analytics
- Concurrent session limits
- Global logout
- Policy versioning