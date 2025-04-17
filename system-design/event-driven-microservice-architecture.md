# Event-Driven Microservice Architecture Design

## Overview
Design and implement a proof-of-concept for an event-driven microservice architecture that handles a high volume of events with guaranteed processing.

## Problem Description
You're tasked with designing a scalable system for an e-commerce platform where multiple services need to react to events like order placements, inventory updates, and payment processing. The system must ensure that events are processed reliably even during service outages.

## Requirements

### Design Requirements
1. Create a system architecture diagram showing:
   - Service boundaries and responsibilities
   - Event flow between services
   - Data storage solutions
   - Scaling considerations

2. Design patterns to address:
   - Event sourcing
   - CQRS (Command Query Responsibility Segregation)
   - Idempotent event processing
   - Eventual consistency

### Implementation Requirements
1. Create a proof-of-concept implementation with at least three microservices:
   - Order Service
   - Inventory Service
   - Notification Service

2. Implement key components:
   - Event publishing mechanism
   - Event consumption and processing
   - Event storage/event log
   - Service-to-service communication

3. Demonstrate:
   - Successful event flow through the system
   - Handling of a service outage without data loss
   - Horizontal scaling of a service

## Technical Considerations
1. **Event Format**: Define a clear event structure with appropriate metadata
2. **Message Broker**: Choose and justify an appropriate message broker
3. **Database Choices**: Select appropriate databases for different services
4. **Error Handling**: Design robust error handling and retry mechanisms
5. **Monitoring**: Consider how the system would be monitored in production

## Technology Options
You may choose any technologies you're comfortable with, but your solution should include:
- A message broker (Kafka, RabbitMQ, NATS, etc.)
- Multiple service implementations
- Appropriate data stores
- Configuration for local deployment

## Evaluation Criteria

1. **Architecture Design**: Clarity and appropriateness of the overall design
2. **System Resilience**: How well the system handles failures
3. **Implementation Quality**: Code organization and quality of the POC
4. **Scalability**: Design considerations for handling increasing load
5. **Documentation**: Clear explanation of design decisions and trade-offs

## What We Value

1. **Clear Boundaries**: Well-defined service responsibilities
2. **Failure Handling**: Robust approaches to system failures
3. **Pragmatic Complexity**: Appropriate complexity for the problem (not over-engineered)
4. **Operational Considerations**: Thinking beyond just the happy path
5. **Decoupled Design**: Services that can evolve independently

## Submission Guidelines

1. Use this repo as a template
2. Invite StAmirey as collaborator
3. Complete source code for your solution
4. A README file that includes:
   - Setup instructions for running your solution locally
   - Overview of your approach and architecture
   - Any assumptions or limitations of your implementation
   - Explanation of key design decisions
   - What you would improve with more time 