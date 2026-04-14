# AGENTS.md

> Instruction file for OpenCode sessions. Add high-signal, repo-specific guidance.

## Product Mission

**StoryMaps** - A self-hosted application for Product Managers to structure and visualize user value flows using Jeff Patton's User Story Mapping methodology.

**Core value**: Enable teams to create, maintain, and share user story maps through a frontend interface and API.

**Key capabilities**:
- Create/edit user story maps (maps, activities, actions)
- Actor management (CRUD)
- Kanban-style matrix view
- Data management via UI and API
- Self-hosted deployment

## Getting Started

1. Read `README*`, root manifests, and build/test config first
2. Check for existing instruction files (`.cursorrules`, `.github/copilot-instructions.md`)
3. Inspect CI workflows and task runner config for developer commands

## Development Workflow

- Every build/feature action must update all relevant documentation:
  - Product story maps: `docs/product/maps/` (existing structure)
  - Technical docs: `docs/technical/` (future)
  - User guides: `docs/user/` (future)
  - Project root docs: (future documentation at root level)
- Documentation changes follow the same PR/commit as the code they document
- **Update Bruno collection (`bruno/`) before PR creation**

## Branching Strategy

- Use GitFlow: `feature/{issue-number}-{description}` for issue work
- Create branch from `main` for each issue
- Commit changes to feature branch
- Create PR for review when work is complete
- **All branch reviews must be done formally through GitHub Pull Request**
- **When PR is approved, update relevant documentation to reflect implementation**
- **Post-merge doc updates: create a new commit on main branch with message referencing the PR ID (e.g., "docs: update X (#PR-ID)")**
- **When PR is merged, close the relevant issue**
- **Do NOT merge to main without explicit approval**

## Development Commands

```bash
# Backend (Express + SQLite)
cd server && npm install && npm run dev
# Server runs on http://localhost:3000

# Frontend (Angular)
cd client && npm install && npm run dev
# Angular app runs on http://localhost:4200 (with API proxy)

# Production (Docker)
docker-compose up --build
# App runs on http://localhost:8080
```

## Architecture

```
storymaps/
├── server/
│   ├── src/
│   │   ├── controllers/   # Express route handlers
│   │   ├── routes/     # API endpoints
│   │   └── models/    # SQLite database
│   └── dist/        # Compiled output
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/    # Angular page components
│   │   │   └── services/ # API services
│   │   └── styles.css
│   └── dist/          # Built output
├── docker/           # Docker configs
└── bruno/         # API testing collection
```

## Testing

Use Bruno collection for API testing:
```bash
# Import bruno/storymaps folder into Bruno app
# Configure environment: baseUrl=http://localhost:3000
```

## Open Issues (P1-Need)

- #15-28: Self-hosted deployment features (docker-compose, verify services, set env vars, start services, file import/export)

## Bruno Collection

**Location:** `bruno/` directory

**Purpose:** API testing collection for Bruno app

**Maintenance:**
- After any endpoint changes, update the `bruno/` collection
- Update must happen **before PR creation** to keep API testing current
- Include all new endpoints and remove deprecated ones