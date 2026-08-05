# Notification Service

## Overview

The Notification Service is a dedicated microservice responsible for handling asynchronous notifications across the platform.

Currently, it consumes events from Kafka and handles email-based notifications.

The service is intentionally separated from the Identity Service so that business flows (authentication) and side effects (sending notifications) remain independent.

---

# Architecture

```
                    Identity Service

                          |
                          |
              PASSWORD_RESET_REQUESTED Event

                          |
                          |
                    Outbox Pattern

                          |
                          |
                    Kafka Producer

                          |
                          |
                 Topic: identity.events

                          |
                          |
              Notification Service Consumer

                          |
                          |
                  Event Handler Layer

                          |
                          |
                    Email Service

                          |
                          |
                  Email Provider
```

---

# Responsibilities

## Notification Service owns:

- Consuming domain events
- Routing events to handlers
- Sending notifications
- Managing notification providers
- Future notification tracking

---

## Notification Service does NOT own:

- User authentication logic
- Password reset token generation
- User database access
- Identity workflows

Those responsibilities belong to Identity Service.

---

# Current Folder Structure

```
notification-service

src
├── config
│
├── constants
│
├── consumers
│
├── emails
│
├── errors
│
├── kafka
│
├── logger
│
├── middleware
│
├── utils
│
├── app.ts
│
└── server.ts
```

---

# Kafka Integration

## Kafka Client

The service connects to the Kafka cluster using:

```
kafka-1:9092
kafka-2:9092
kafka-3:9092
```

Client ID:

```
notification-service
```

---

# Consumer

Consumer group:

```
notification-service-group
```

Topic:

```
identity.events
```

Current subscription:

```
identity.events
```

The consumer receives events published by Identity Service.

---

# Supported Events

## PASSWORD_RESET_REQUESTED

Triggered when a user requests a password reset.

Event flow:

```
User
 |
 |
Forgot Password API
 |
 |
Identity Service
 |
 |
Create Reset Token
 |
 |
Create Outbox Event
 |
 |
Kafka
 |
 |
Notification Service
```

Example payload:

```json
{
  "eventType": "PASSWORD_RESET_REQUESTED",
  "aggregateType": "USER",
  "aggregateId": "user-id",
  "payload": {
    "email": "user@example.com",
    "resetUrl": "http://localhost/reset-password?token=xyz"
  }
}
```

---

# Logger

The service uses a wrapper around Pino logger.

Usage:

```ts
logger.info(
  "Kafka consumer connected",
  {
    topic: "identity.events"
  }
);
```

Example:

```ts
logger.error(
  "Failed to process email",
  {
    error
  }
);
```

---

# Event Processing Flow

Current:

```
Kafka Consumer

      |
      |

Parse Event

      |
      |

Check Event Type

      |
      |

Execute Handler
```

---

# Planned Improvement

Move from switch-based handling:

```
consumer

   |
   |
switch(eventType)

```

to handler based routing:

```
Kafka Consumer

        |
        |

Event Router

        |
        |

----------------------------

|                          |

PasswordResetHandler    UserCreatedHandler

```

This allows adding future events without modifying consumer logic.

---

# Email Service

## Planned Structure

```
emails

├── email.service.ts

└── providers

    └── smtp.provider.ts

```

Responsibilities:

## Email Service

- Email templates
- Email orchestration
- Provider abstraction


## Provider

Handles actual delivery.

Possible providers:

- SMTP
- AWS SES
- SendGrid
- Resend
- Mailgun

---

# Future Events

Possible events:

```
WELCOME_EMAIL_REQUESTED

PASSWORD_RESET_REQUESTED

PASSWORD_CHANGED

OTP_REQUESTED

MFA_ENABLED

LOGIN_ALERT
```

---

# Docker

Notification service runs as part of the docker compose stack.

Service:

```
notification-service
```

Dependencies:

```
Kafka
```

---

# Current Status

Completed:

✅ Docker setup  
✅ Service bootstrap  
✅ Logger setup  
✅ Kafka connection  
✅ Kafka consumer  
✅ Identity event consumption  
✅ PASSWORD_RESET_REQUESTED flow  

---

# Next Steps

1. Add event handler layer
2. Add Email Service abstraction
3. Integrate email provider
4. Add notification failure handling
5. Add notification persistence (optional)
6. Add retry/DLQ handling

---

# Final Architecture Goal

```
                 Identity Service

                        |
                        |
                 Domain Events

                        |
                        |
                      Kafka

                        |
                        |

          ----------------------------

          Notification Service

          ----------------------------

             |
             |
        Email Service

             |
             |
       External Provider

```

The Notification Service remains independent and can evolve without affecting authentication workflows.