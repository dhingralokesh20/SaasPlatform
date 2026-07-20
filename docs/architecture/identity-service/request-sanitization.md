# Request Sanitization

## Purpose

Incoming requests are normalized before business logic executes.

This ensures consistent validation and storage.

---

# Current Sanitization

Current middleware performs:

- String trimming
- Email normalization
- Lowercase conversion for selected fields

---

# Benefits

- Prevent duplicate accounts
- Simplify validation
- Consistent database values
- Cleaner API contracts

---

# Flow

```text
Incoming Request
        │
Sanitize Request
        │
Validation
        │
Business Logic
        │
Database
```

---

# Future Enhancements

Potential additions:

- HTML sanitization
- Unicode normalization
- Phone normalization
- Configurable field transformers