# Actions - Navigate

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-002_act_002_act_001 | Scroll horizontally | PM | Need | maps-002_act_001_act_002 |
| maps-002_act_002_act_002 | Scroll vertically | PM | Need | maps-002_act_001_act_002 |