# Collaborative Document Editor

## Overview
Build a real-time collaborative document editor that allows multiple users to edit the same document simultaneously with conflict resolution.

## Requirements

### Backend Requirements
1. Create a Node.js backend with:
   - Document storage and retrieval using Prisma with a database of your choice (e.g., MySQL, PostgreSQL)
   - Real-time collaboration using WebSockets or gRPC
   - Document versioning and conflict resolution
   - User presence indication (who is currently editing)

2. Implement the following API endpoints:
   - Create/retrieve/update documents
   - Get document revision history
   - User authentication (simple implementation)
   - Document sharing and permissions

### Frontend Requirements
1. Build a frontend application (using either SolidJS or React) with:
   - A rich text editor component
   - Real-time updates from other users
   - Visual indication of other users' cursors/selections
   - Responsive design using TailwindCSS
   - Offline editing capabilities with synchronization on reconnect (optional)

## Technical Challenges
1. **Conflict Resolution**: Implement Operational Transformation (OT) or a similar algorithm to handle concurrent edits
2. **Real-time Synchronization**: Ensure edits are propagated efficiently to all connected clients
3. **Performance**: Maintain responsive UI even with frequent updates
4. **State Management**: Handle complex document state across multiple users

## Advanced Features (Optional)
1. Implement commenting and suggestion features
2. Add collaborative cursors showing other users' positions
3. Create a document history browser
4. Add formatting options (bold, italic, headings, etc.)

## Evaluation Criteria

1. **Architecture**: Clean separation of concerns between frontend and backend
2. **Real-time Performance**: How well your solution handles concurrent edits
3. **Code Quality**: Well-structured, maintainable code
4. **UI/UX**: Intuitive interface with appropriate feedback for collaborative actions
5. **Error Handling**: Robust handling of network issues and conflicts

## What We Value

1. **Clean, Non-nested Code**: Keep your code simple and modular
2. **Foolproof Design**: Design your application to handle edge cases and prevent data loss
3. **Maintainability**: Write code that is easy to understand and extend
4. **Performance**: Optimize for both network efficiency and UI responsiveness
5. **Documentation**: Clear documentation for setup and architecture decisions

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