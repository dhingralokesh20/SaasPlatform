# ADR-003: Refresh Token Rotation

## Status

Accepted

---

# Context

Long-lived refresh tokens create security risks if stolen.

---

# Decision

Rotate refresh tokens after every successful refresh request.

---

# Flow

```text
Refresh Request
      |
Validate Token
      |
Generate New Token
      |
Invalidate Old Token
      |
Update Session
```

---

# Benefits

Provides protection against:

- Token replay
- Stolen token reuse
- Long-lived compromise

---

# Future Improvements

Possible additions:

- Token reuse detection
- Session family tracking
- Device awareness