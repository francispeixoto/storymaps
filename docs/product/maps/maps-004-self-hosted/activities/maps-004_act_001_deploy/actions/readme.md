# Actions - Deploy

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-004_act_001_act_001 | Run docker-compose | DevOps | Need | |
| maps-004_act_001_act_002 | Verify services | DevOps | Need | maps-004_act_001_act_001 |