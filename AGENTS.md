# AGENTS.md

> Instruction file for OpenCode sessions. Add high-signal, repo-specific guidance.

## Product Mission

**StoryMaps** - A self-hosted application for Product Managers to structure and visualize user value flows using Jeff Patton's User Story Mapping methodology.

**Core value**: Enable teams to create, maintain, and share user story maps through a frontend interface and API.

**Key capabilities**:
- Create/edit user story maps (steps, activities, user segments, backlogs)
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

## Branching Strategy

- Use GitFlow: `feature/{issue-number}-{description}` for issue work
- Create branch from `main` for each issue
- Commit changes to feature branch
- Create PR for review when work is complete
- **All branch reviews must be done formally through GitHub Pull Request**
- **When PR is approved, update relevant documentation to reflect implementation**
- **Post-merge doc updates: create a new commit on main branch with message referencing the PR ID (e.g., "docs: update X (#PR-ID)")**
- **Do NOT merge to main without explicit approval**

## Development Commands

> TODO: Add commands after code is added

## Architecture

> TODO: Document structure after code is added

## Testing

> TODO: Add test quirks after code is added