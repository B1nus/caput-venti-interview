# Real-Time Analytics Dashboard

## Overview
Create a responsive real-time analytics dashboard using either SolidJS or React with TailwindCSS that visualizes streaming data and allows user interactions with minimal UI lag.

## Requirements

### Core Features
1. Build a frontend application (using either SolidJS or React) with multiple dashboard widgets:
   - Line chart showing time-series data
   - Data table with sortable columns and pagination
   - Summary statistics cards
   - Filterable data view

2. Implement real-time data updates that:
   - Update the UI components without full re-renders
   - Handle high-frequency data updates (multiple per second)
   - Allow pausing/resuming data streams
   - Support historical data viewing

### Technical Requirements
1. **Reactivity**: Use your chosen framework's reactivity system efficiently
2. **UI Performance**: Ensure smooth performance even with rapid data updates
3. **Responsive Design**: Build a fully responsive layout using TailwindCSS
4. **Accessibility**: Ensure the dashboard is accessible (WCAG AA compliance)

### Data Integration
For this task, you can:
- Create a simple WebSocket server that emits mock data OR
- Use the provided API endpoint for simulated data streams

## Advanced Features (Optional)
1. Implement data export functionality
2. Add user-configurable dashboard layouts
3. Create custom themes with TailwindCSS
4. Add animations for data transitions

## Evaluation Criteria

1. **Reactivity Implementation**: How efficiently you leverage your framework's reactivity model
2. **UI Performance**: How well the interface performs under high-frequency updates
3. **Code Organization**: Component structure and separation of concerns
4. **CSS Implementation**: Effective and maintainable use of TailwindCSS
5. **User Experience**: Intuitive interface with appropriate loading states and error handling

## What We Value

1. **Clean, Non-nested Components**: Break down complex UI into simple, manageable components
2. **Performance Optimization**: Minimize unnecessary re-renders and optimize for speed
3. **Maintainable Code**: Write code that is easy to understand and extend
4. **Attention to Detail**: Polish UI elements and provide thoughtful interactions
5. **Accessibility**: Ensure the dashboard is usable by everyone

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