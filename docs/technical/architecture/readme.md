# Architecture

This section describes the overall system architecture of StoryMaps.

## Overview

StoryMaps is a self-hosted web application built with a Node.js stack. It follows a client-server architecture with the frontend communicating with the backend via REST API.

```
┌─────────────┐     HTTP      ┌─────────────┐     SQLite     ┌─────────┐
│   Client    │ <───────────> │   Server    │ <────────────> │ SQLite  │
│  (Angular)  │   REST API    │  (Express)  │   queries      │  DB     │
└─────────────┘               └─────────────┘                └─────────┘
```

## Components

### Frontend (Client)

- **Framework**: Angular
- **Styling**: Tailwind CSS
- **Responsibilities**:
  - User interface for creating and managing story maps
  - Visual representation of the story matrix
  - API communication with the backend
  - State management for map data

### Backend (Server)

- **Framework**: Express.js
- **Responsibilities**:
  - REST API endpoints for CRUD operations
  - Business logic for story map operations
  - SQLite database interactions
  - Data validation and error handling

### Database

- **Type**: SQLite
- **Responsibilities**:
  - Persistent storage of maps, activities, and actions
  - Data integrity via foreign key constraints
  - Indexing for query performance

## Communication

The client interacts with the server exclusively through HTTP REST API calls. The server processes requests, interacts with SQLite, and returns JSON responses.

See [Data Flow](data-flow.md) for detailed request lifecycle.