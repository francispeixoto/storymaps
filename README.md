# StoryMaps

A self-hosted application for Product Managers to structure and visualize user value flows using Jeff Patton's User Story Mapping methodology.

## About

StoryMaps enables teams to create, maintain, and share user story maps through a frontend interface and API. Self-hosted deployment allows teams to keep their data private while benefiting from the visual approach to requirements planning.

## Methodology

This project is structured using Jeff Patton's User Story Mapping methodology, which organizes work into three levels:

### Maps

High-level themes or areas of focus that represent the overall user experience to build. Maps group related activities together and provide the top-level structure for organizing the product backlog.

### Activities

The value targets users expect to achieve within each map. Activities represent meaningful outcomes users want to experience - not just tasks to complete. They sit between the user's overall journey (Map) and specific steps (Actions).

### Actions

The specific, executable steps users take to accomplish an activity. Each action includes:

- **Actor**: Who performs the action (PM, Developer, DevOps)
- **Priority**: Need (essential) | Want (important) | Nice (delight)
- **Inbound Dependencies**: UIDs of actions that provide required input

## Documentation Structure

```
docs/product/maps/
├── maps-001-map-management/   # Core CRUD operations
├── maps-002-visualization/   # UI components
├── maps-003-data-api/        # Backend API
└── maps-004-self-hosted/     # Deployment
```

## Getting Started

See [docs/product/maps/](docs/product/maps/) for detailed product story maps.

## License

MIT