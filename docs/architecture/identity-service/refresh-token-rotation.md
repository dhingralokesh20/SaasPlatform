# Refresh Token Rotation

## Purpose

Refresh token rotation limits the impact of token theft by ensuring every refresh token can only be used once.

---

# Flow

```text
Receive Refresh Token
        │
Validate JWT
        │
Validate Session
        │
Generate New Refresh Token
        │
Update Session
        │
Generate Access Token
        │
Return New Cookies
```

---

# Security Benefits

Rotation prevents:

- Replay attacks
- Long-lived stolen tokens
- Reuse of compromised refresh tokens

---

# Session Updates

Every successful refresh updates:

- Refresh Token Hash
- Last Used Time
- Expiration

---

# Failure Cases

If validation fails:

- Session revoked
- Cookies cleared
- User re-authentication required

---

# Future Improvements

- Token reuse detection
- Family revocation
- Device-aware refresh