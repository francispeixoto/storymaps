# Health Metrics

## Overview

Health metrics provide a quantitative measure of implementation progress across StoryMaps. They are calculated on the server to ensure consistency between all views in the application.

Health data is returned for:
- **Contexts**: Aggregate implementation across all associated maps
- **Maps**: Implementation within a single map
- **Actors**: Implementation from an actor's perspective across all their actions

## Calculation Formula

### Priority Weights

| Priority | Weight |
|----------|--------|
| Need     | 3      |
| Want     | 2      |
| Nice     | 1      |

Priority weights reflect business criticality - "Need" actions are 3× more important than "Nice" actions.

### Implementation State Weights

| State    | Weight |
|----------|--------|
| Full     | 1.0    |
| Partial  | 0.5    |
| None     | 0.0    |

The "Partial" weight of 0.5 reflects the "glass half full" principle - partial implementation counts for half of a full implementation.

### Score Formula

```
Score = (Σ (priority_weight × impl_weight) / Σ priority_weight) × 100
```

The score is a weighted average, normalized to a 0-100 scale.

### Score Thresholds

| Score Range | Label | Description |
|-------------|-------|--------------|
| >= 75 | Well Implemented | Strong implementation state |
| >= 50 | Partially Implemented | Moderate implementation progress |
| < 50 | Needs Work | Low implementation state |

## Per-Priority Breakdown

The health object includes a breakdown for each priority level:

```json
{
  "byPriority": {
    "Need": { "full": 5, "partial": 3, "none": 2, "total": 10, "score": 65 },
    "Want": { "full": 4, "partial": 3, "none": 3, "total": 10, "score": 55 },
    "Nice": { "full": 1, "partial": 2, "none": 2, "total": 5, "score": 40 }
  }
}
```

Each priority shows:
- **full**: Number of actions at "Full" state
- **partial**: Number of actions at "Partial" state
- **none**: Number of actions at "None" state
- **total**: Total actions for that priority
- **score**: Calculated score for just that priority

## Examples

### Example 1: All Full

```
Actions:
- 2 Need Full
- 1 Want Full
- 1 Nice Full

Calculation:
Total weight = (2 × 3) + (1 × 2) + (1 × 1) = 6 + 2 + 1 = 9
Weighted score = (2 × 3 × 1.0) + (1 × 2 × 1.0) + (1 × 1 × 1.0) = 6 + 2 + 1 = 9
Score = (9 / 9) × 100 = 100

Result: 100 - Well Implemented
```

### Example 2: Mixed

```
Actions:
- 3 Need Full
- 2 Want None
- 1 Nice Partial

Calculation:
Total weight = (3 × 3) + (2 × 2) + (1 × 1) = 9 + 4 + 1 = 14
Weighted score = (3 × 3 × 1.0) + (2 × 2 × 0.0) + (1 × 1 × 0.5)
                = 9 + 0 + 0.5 = 9.5
Score = (9.5 / 14) × 100 = 68

Result: 68 - Partially Implemented

By priority:
- Need: (3 × 3 × 1.0) / (3 × 3) × 100 = 100
- Want: (2 × 2 × 0.0) / (2 × 2) × 100 = 0
- Nice: (1 × 1 × 0.5) / (1 × 1) × 100 = 50
```

### Example 3: All None

```
Actions:
- 5 Need None

Calculation:
Total weight = 5 × 3 = 15
Weighted score = (5 × 3 × 0.0) / 15 × 100 = 0

Result: 0 - Needs Work
```

### Example 4: Partial Only

```
Actions:
- 2 Need Partial
- 1 Want Partial

Calculation:
Total weight = (2 × 3) + (1 × 2) = 6 + 2 = 8
Weighted score = (2 × 3 × 0.5) + (1 × 2 × 0.5) = 3 + 1 = 4
Score = (4 / 8) × 100 = 50

Result: 50 - Partially Implemented (at threshold)
```

## Business Reasoning

### Priority Weights

The priority weights (Need=3, Want=2, Nice=1) reflect business criticality:
- **Need**: Core functionality that must be delivered
- **Want**: Important but not critical features
- **Nice**: Enhancement features when time permits

### Implementation State Weights

The implementation weights were chosen to replace the original NPS-style calculation:
- **Full (1.0)**: Complete implementation
- **Partial (0.5)**: "Glass half full" - credit for work in progress
- **None (0.0)**: Not started

### Labels

The labels (Well Implemented, Partially Implemented, Needs Work) focus on implementation progress rather than satisfaction:
- Clear, action-oriented language
- Helps teams identify areas needing attention
- Avoids NPS-style categories that don't fit the implementation domain

## API Usage

### Endpoints Returning Health

Health data is returned in the `health` field of these endpoints:

- `GET /api/contexts` - List of contexts (each with health)
- `GET /api/contexts/:id` - Single context
- `GET /api/contexts/:id/full` - Context with maps (each map has health)
- `GET /api/maps/:id` - Single map
- `GET /api/actors` - List of actors (each with health)
- `GET /api/actors/:id` - Single actor

### Response Structure

```json
{
  "id": 1,
  "name": "Shopping App",
  "health": {
    "score": 68,
    "totalActions": 25,
    "fullCount": 10,
    "partialCount": 8,
    "noneCount": 7,
    "byPriority": {
      "Need": { "full": 5, "partial": 3, "none": 2, "total": 10, "score": 65 },
      "Want": { "full": 4, "partial": 3, "none": 3, "total": 10, "score": 55 },
      "Nice": { "full": 1, "partial": 2, "none": 2, "total": 5, "score": 40 }
    }
  }
}
```

### Frontend Usage

The frontend receives the health object from the API and displays:
- **Score**: Number with color (green/yellow/red)
- **Label**: Text description (Well Implemented, etc.)
- **Breakdown**: Per-priority table with progress bars
- **Counts**: Full/Partial/None totals

See [API Endpoints](../api/endpoints.md) for more details.