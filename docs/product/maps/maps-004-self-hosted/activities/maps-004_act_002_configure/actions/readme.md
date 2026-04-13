# Actions - Configure

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-004_act_002_act_001 | Set environment variables | DevOps | Need | |
| maps-004_act_002_act_002 | Start services | DevOps | Need | maps-004_act_002_act_001 |