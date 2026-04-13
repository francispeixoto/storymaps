# Actions - Export data

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-003_act_001_act_001 | Select map to export | PM | Want | maps-001_act_001_act_001 |
| maps-003_act_001_act_002 | Choose format | PM | Want | maps-003_act_001_act_001 |
| maps-003_act_001_act_003 | Download file | PM | Want | maps-003_act_001_act_002 |