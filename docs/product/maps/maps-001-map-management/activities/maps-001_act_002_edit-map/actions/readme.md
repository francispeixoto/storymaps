# Actions - Edit map

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-001_act_002_act_001 | Select map to edit | PM | Need | maps-001_act_001_act_001 |
| maps-001_act_002_act_002 | Add activity | PM | Need | maps-001_act_002_act_001 |
| maps-001_act_002_act_003 | Add action | PM | Need | maps-001_act_002_act_002 |