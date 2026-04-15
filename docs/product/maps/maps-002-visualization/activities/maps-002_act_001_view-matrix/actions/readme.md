# Actions - View matrix

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-002_act_001_act_001 | Select map to view | PM | Need | maps-002_act_001_act_001 |
| maps-002_act_001_act_002 | Display story matrix | PM | Need | maps-002_act_001_act_001 |
| maps-002_act_001_act_003 | Edit activity/action | PM | Need | maps-002_act_001_act_002 |