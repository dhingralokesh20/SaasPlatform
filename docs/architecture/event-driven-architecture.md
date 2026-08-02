# Worksphere Event Driven Architecture

## Overview

Worksphere uses an event-driven architecture to enable asynchronous communication between services.

The main goal is to reduce tight coupling between microservices and allow services to react to business events independently.

The current architecture uses:

- Transactional Outbox Pattern
- Apache Kafka
- Kafka KRaft mode cluster
- Event Envelope contracts
- Asynchronous event publishing


High-level architecture:

```
                    Identity Service

                          |
                          |
                          | Database Transaction
                          |
              +-----------+------------+
              |                        |
              v                        v

        Users Table            Outbox Events Table

                                         |
                                         |
                                         | Outbox Worker
                                         |
                                         v

                                  Kafka Producer

                                         |
                                         |
                                         v

                               Kafka KRaft Cluster

                                         |
                                         |
                                         v

                           Other Microservices Consumers
```


---

# Kafka Infrastructure

## Kafka Cluster

Worksphere runs a 3-node Apache Kafka cluster using KRaft mode.

Cluster:

```
kafka-1
kafka-2
kafka-3
```

Each Kafka node acts as both:

- Broker
- Controller


Responsibilities:

### Broker

Handles:

- Producer requests
- Consumer requests
- Topic partitions
- Message storage


### Controller

Handles:

- Cluster metadata
- Partition leadership
- Broker membership
- Leader elections


Kafka runs without ZooKeeper using the KRaft consensus protocol.


---

# KRaft Architecture

Kafka uses controller quorum for metadata management.

Controller quorum:

```
kafka-1:9093
kafka-2:9093
kafka-3:9093
```


Configuration:

```
1@kafka-1:9093
2@kafka-2:9093
3@kafka-3:9093
```


Kafka requires majority of controllers to be available.

Example:

```
3 Controllers

Controller 1  ✅
Controller 2  ✅
Controller 3  ❌


Quorum available
```

The cluster can continue operating because majority is maintained.


---

# Kafka Topic Design

## Topic Strategy

Events are grouped by service/domain instead of creating one topic per event.

Current topic:

```
identity.events
```


The event type is stored inside the message payload.


Example:

```
identity.events

    |
    |
    +-- USER_REGISTERED
    |
    +-- PASSWORD_RESET_REQUESTED
    |
    +-- PASSWORD_CHANGED
```


## Why not create topics like:

```
PASSWORD_RESET_REQUESTED
USER_REGISTERED
USER_CREATED
```

Because large systems can have hundreds of events.

Instead:

```
Domain Topic
     |
     |
     + Event Type
```


This keeps topic management simpler.


---

# Event Envelope

All services communicate using a common event structure.

Example:

```json
{
  "eventId": "uuid",
  "eventType": "PASSWORD_RESET_REQUESTED",
  "aggregateType": "USER",
  "aggregateId": "user-id",
  "version": 1,
  "source": "identity-service",
  "publishedAt": "timestamp",
  "payload": {}
}
```


## Fields Explanation


### eventId

Unique identifier for every event.

Used for:

- Tracking
- Debugging
- Idempotency


### eventType

Business event name.

Example:

```
PASSWORD_RESET_REQUESTED
```


### aggregateType

The business entity affected.

Example:

```
USER
WORKSPACE
PROJECT
```


### aggregateId

Identifier of the affected entity.

Example:

```
userId
```


### version

Event schema version.

Used for future backward compatibility.


### source

Service which generated the event.

Example:

```
identity-service
```


### payload

Business data required by consumers.


---

# Transactional Outbox Pattern


## Problem

A normal approach:

```
Update Database

       |
       |
       X

Publish Kafka Event
```


Problem:

If database update succeeds but Kafka publishing fails:

```
Database updated ✅

Kafka event failed ❌
```

The system becomes inconsistent.


---

# Solution

Use an outbox table.


The business operation and event creation happen inside the same database transaction.


Example:

```
BEGIN TRANSACTION


Create User

       |

Insert Event into outbox_events


COMMIT
```


Now:

```
Database State
        +
Event Creation

are guaranteed together.
```


---

# Outbox Table Flow


Event lifecycle:


```
PENDING

   |
   |
PROCESSING

   |
   |
COMPLETED
```


Failure:

```
PROCESSING

   |
   |
FAILED
```


The table stores:

- Event data
- Processing status
- Retry count
- Failure reason


---

# Outbox Worker


The outbox worker periodically checks pending events.


Flow:


```
outbox_events table

        |
        |
        v

Find pending events

        |
        |
        v

Mark as processing

        |
        |
        v

Publish to Kafka

        |
        |
        v

Mark completed
```


Benefits:

- Reliable publishing
- No lost events
- Database and events remain consistent


---

# Current Implemented Flow

## Password Reset Example


Request:

```
POST /password-reset
```


Flow:


```
User requests password reset

          |
          v

Generate reset token

          |
          v

Store reset information

          |
          v

Create outbox event


PASSWORD_RESET_REQUESTED

          |
          v

Outbox Worker picks event

          |
          v

Kafka Producer publishes event

          |
          v

identity.events topic

          |
          v

Consumers receive event
```


---

# Kafka Reliability Configuration


Current configuration:


```
Replication Factor: 3

Minimum ISR: 2
```


Meaning:


Every partition has three copies:

```
Partition Leader

       |
       + Replica

       |
       + Replica
```


For writes:

At least two replicas must acknowledge.


Example:


```
Broker 1  Leader     ✅

Broker 2  Replica    ✅

Broker 3  Replica    ❌


Write accepted
```


This protects against single broker failures.


---

# Kafka Cluster Verification


Kafka metadata quorum verification:

Command:

```
kafka-metadata-quorum.sh describe --status
```


Example output:

```
LeaderId: 1

CurrentVoters:

kafka-1
kafka-2
kafka-3
```


This confirms:

- KRaft controller quorum
- Leader election
- Cluster metadata availability


---

# Producer Architecture


Identity service contains Kafka publisher.


Flow:


```
Outbox Worker

      |

      v

Kafka Publisher

      |

      v

Kafka Producer

      |

      v

identity.events
```


Producer configuration:

```
Broker List:

kafka-1:9092
kafka-2:9092
kafka-3:9092
```


Using all brokers allows KafkaJS to discover partition leaders correctly.


---

# Current Completed Features


Completed:


- [x] Kafka KRaft cluster
- [x] Three broker setup
- [x] Controller quorum
- [x] Leader election
- [x] Topic replication
- [x] Kafka producer integration
- [x] Shared event envelope contract
- [x] Transactional outbox pattern
- [x] Outbox worker
- [x] Event publishing verification


---

# Next Steps


## Kafka Consumer Implementation


Workspace service will consume:

```
identity.events
```


Example:


```
USER_REGISTERED

        |
        v

Workspace Service

        |
        v

Create Default Workspace
```


---

# Future Improvements


## Consumer Idempotency

Kafka provides at-least-once delivery.

Meaning:

The same event can arrive more than once.


Solution:

Create processed events tracking:


```
processed_events

id
event_id
consumer_name
processed_at
```


Before processing:

```
Check event_id exists

        |

Yes:
Ignore event

        |

No:
Process event
```


---

## Retry Mechanism

Failed events should retry automatically.


Example:


```
Attempt 1
    |
    |
Failed

Attempt 2
    |
    |
Failed

Attempt 3

    |
    |
Move to DLQ
```


---

## Dead Letter Queue


Events that cannot be processed are moved to:

```
identity.events.DLQ
```


Allows:

- Debugging
- Manual recovery
- Failure analysis


---

## Event Versioning


Future event changes should not break existing consumers.


Example:

Version 1:

```json
{
 "email":"user@test.com"
}
```


Version 2:

```json
{
 "email":"user@test.com",
 "phone":"+91xxxx"
}
```


Consumers should support multiple versions.


---

# Final Architecture


```
                    Identity Service

                           |
                           |
                    Database Transaction

                           |
              +------------+------------+
              |                         |
              v                         v

          Business DB             Outbox Table

                                         |
                                         |
                                  Outbox Worker

                                         |
                                         |
                                  Kafka Producer

                                         |
                                         |
                                  Kafka Cluster

                                         |
                                         |
                               Service Consumers

                                         |
                                         |
                              Business Processing
```


This architecture provides:

- Reliable event publishing
- Loose coupling
- Scalability
- Fault tolerance
- Production-like messaging infrastructure