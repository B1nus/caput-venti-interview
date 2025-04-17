# Distributed Rate Limiter

## Overview
Design and implement a distributed rate limiting system that can be used across multiple server instances to control API request rates.

## Problem Description
In a distributed environment with multiple server instances, you need to implement a rate limiter that ensures users don't exceed their allocated request quotas. Traditional in-memory rate limiters don't work effectively in distributed systems because each instance would track limits separately.

## Requirements

1. Implement a rate limiting algorithm that:
   - Limits requests based on user identity
   - Supports different rate limits for different API endpoints
   - Works in a distributed environment (multiple server instances)
   - Handles temporary network/database outages gracefully

2. The system should support:
   - Request/second limits
   - Burst allowances
   - Different time windows (per second, minute, hour, day)
   - Custom limits for different user tiers

3. Your implementation should include:
   - Core rate limiting algorithm
   - Data storage strategy
   - Synchronization mechanism
   - API for checking and updating limits

## Technical Challenges

1. **Consistency**: Ensure accurate counting across distributed servers
2. **Performance**: Minimize impact on API response times
3. **Reliability**: Handle component failures gracefully
4. **Scalability**: Design for horizontal scaling

## Implementation Options

You can choose any programming language and technologies you prefer. Some options to consider:

1. **Storage Mechanism**:
   - Redis with INCR and EXPIRE commands
   - Distributed cache
   - Database with appropriate locking
   - Custom solution

2. **Algorithm Options**:
   - Token Bucket
   - Leaky Bucket
   - Fixed Window Counter
   - Sliding Window Log
   - Sliding Window Counter

## Evaluation Criteria

1. **Algorithm Design**: The correctness and efficiency of your chosen algorithm
2. **Distributed Coordination**: How well your solution handles distributed scenarios
3. **Edge Cases**: Handling of failures, clock drift, and race conditions
4. **Performance**: Speed and resource usage
5. **Code Quality**: Clean, maintainable implementation

## What We Value

1. **Clear Design**: Well-thought-out architecture with justifications
2. **Pragmatic Solutions**: Balance between theoretical correctness and practical implementation
3. **Comprehensive Testing**: Tests showing the system works correctly in normal and edge cases
4. **Performance Awareness**: Understanding of performance trade-offs
5. **Documentation**: Clear explanation of your approach and its implications

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