# Real-Time Inventory Management System

## Overview
Build a real-time inventory management system API that handles concurrent inventory updates while maintaining data consistency and preventing race conditions.

## Requirements

### Core Features
1. Create a Node.js backend with Prisma ORM connected to a database of your choice (e.g., MySQL, PostgreSQL, MongoDB)
2. Implement the following API endpoints:
   - Create product inventory items
   - Update inventory quantities (add/remove stock)
   - Reserve inventory for pending orders
   - Release reserved inventory when orders are canceled
   - Get current inventory status with available, reserved, and total quantities

### Technical Requirements
1. **Concurrency Handling**: The system must handle multiple simultaneous inventory operations without race conditions
2. **Transactions**: Use database transactions to ensure data consistency
3. **Error Handling**: Implement proper error handling for edge cases
4. **API Documentation**: Document your API endpoints using OpenAPI/Swagger

### Advanced Features (Optional)
1. Implement inventory alerts when stock levels fall below a threshold
2. Add a simple gRPC service for real-time inventory updates
3. Implement inventory history logging for audit purposes

## Database Schema
Design a database schema that includes at least:
- Products table
- Inventory table
- Inventory transactions table (for tracking all changes)
- Order reservations table

## Evaluation Criteria

1. **Concurrency Handling**: How well your solution handles simultaneous inventory operations
2. **Code Organization**: Clean architecture with separation of concerns
3. **Error Handling**: Robust error handling for edge cases
4. **Performance**: Efficiency of database queries and operations
5. **Testing**: Comprehensive tests, including concurrency tests

## What We Value

1. **Foolproof Design**: Design your API to prevent misuse and handle edge cases
2. **Non-nested, Clean Code**: Keep your code simple and avoid deep nesting
3. **Maintainability**: Write code that is easy to understand and maintain
4. **Security**: Prevent common security issues (SQL injection, etc.)
5. **Documentation**: Include clear documentation for your code and API

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