# API Conventions

## Purpose

This document defines common API standards followed by WorkSphere backend services.

Consistency across APIs improves maintainability and frontend integration.

---

# API Versioning

All APIs use versioned routes.

Example:

```
/api/v1/auth/login
```

Versioning allows future changes without breaking existing clients.

---

# HTTP Methods

Common usage:

| Method | Purpose |
|---|---|
| GET | Fetch resources |
| POST | Create resources |
| PUT | Update resources |
| DELETE | Remove resources |

---

# Response Format

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

---

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

---

# HTTP Status Codes

Common usage:

| Status | Usage |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 500 | Internal server error |

---

# Error Codes

Errors contain stable machine-readable codes.

Example:

```json
{
 "code": "INVALID_OTP"
}
```

Frontend uses codes instead of matching messages.

---

# Validation

Requests are validated before business logic execution.

Validation responsibilities:

- Required fields
- Data formats
- Business constraints

---

# Authentication

Protected routes require valid authentication context.

Authentication is handled through:

- Access tokens
- Session validation
- Refresh token rotation

---

# Future Improvements

Planned:

- Pagination standards
- Filtering conventions
- OpenAPI documentation
- API contract testing