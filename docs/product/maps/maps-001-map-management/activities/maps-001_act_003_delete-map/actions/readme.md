# Actions - Delete map

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-001_act_003_act_001 | Select map to delete | PM | Want | maps-001_act_001_act_001 |
| maps-001_act_003_act_002 | Confirm deletion | PM | Want | maps-001_act_003_act_001 |