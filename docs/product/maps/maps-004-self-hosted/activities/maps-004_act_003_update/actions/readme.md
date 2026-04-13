# Actions - Update

Actions represent the executable steps to achieve this Activity's value target.

Metadata:
- **Actor**: Who performs this action (PM, Developer, DevOps)
- **Priority**: Need | Want | Nice
- **Inbound Dependencies**: UID(s) of action(s) that provide required input

## Actions

| UID | Title | Actor | Priority | Inbound Dependencies |
|-----|------|------|----------|---------------------|
| maps-004_act_003_act_001 | Pull new version | DevOps | Want | maps-004_act_001_act_001 |
| maps-004_act_003_act_002 | Restart containers | DevOps | Want | maps-004_act_003_act_001 |