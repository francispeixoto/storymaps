# Actions - CRUD via API

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-003_act_003_act_001 | Create map via API | Developer | Need | |
| maps-003_act_003_act_002 | Read map via API | Developer | Need | maps-003_act_003_act_001 |
| maps-003_act_003_act_003 | Update map via API | Developer | Need | maps-003_act_003_act_002 |
| maps-003_act_003_act_004 | Delete map via API | Developer | Need | maps-003_act_003_act_002 |