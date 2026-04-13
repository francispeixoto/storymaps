# Actions - Import data

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-003_act_002_act_001 | Upload file | PM | Want | |
| maps-003_act_002_act_002 | Validate format | PM | Want | maps-003_act_002_act_001 |
| maps-003_act_002_act_003 | Confirm import | PM | Want | maps-003_act_002_act_002 |