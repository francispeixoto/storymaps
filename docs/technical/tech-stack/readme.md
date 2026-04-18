# Tech Stack

This section documents the technology choices and implementation details for StoryMaps.

## Overview

| Layer | Technology |
|-------|------------|
| Frontend | Angular + Tailwind CSS |
| Backend | Express.js (Node.js) |
| Database | SQLite |
| Containerization | Docker + Docker Compose |

## Features

- **Dark Mode**: CSS variables with Tailwind class-based dark mode toggle
- **Contexts Layer**: Group maps by context (e.g., "Mobile App", "Web App")
- **Health Metrics**: Priority-weighted implementation scores
- **Matrix View**: Kanban-style visualization of actions by priority
- **Actor Management**: Track actions by user/role
- **Action Dependencies**: Manage prerequisites between actions

## Rationale

### Node.js Only

Using Node.js for both frontend and backend enables:
- Shared TypeScript types between client and server
- Simplified development environment
- Unified package management

### Angular

- Component-based architecture
- TypeScript integration
- Robust routing
- Built-in dependency injection

### Tailwind CSS

- Utility-first CSS framework
- Rapid UI development
- Small bundle size (purges unused styles)
- Easy customization

### Express.js

- Minimal and flexible
- Large ecosystem of middleware
- Easy to learn and implement
- Well-suited for REST APIs

### SQLite

- Zero-configuration
- Single file storage
- Sufficient for single-instance deployments
- No separate server process needed

See individual sections for detailed implementation:
- [Frontend](frontend.md)
- [Backend](backend.md)
- [Database](database.md)