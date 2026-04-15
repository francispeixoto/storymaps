# Edit activity/action

- **UID**: maps-002_act_001_act_003
- **Parent Activity**: maps-002_act_001 (View matrix)
- **Actor**: PM
- **Priority**: Need
- **Inbound Dependencies**: maps-002_act_001_act_002

## Description

Users can edit activities and actions directly from the matrix view without navigating to a separate edit page. This improves workflow efficiency and mobile usability.

## Features

### Edit Activity
- Pencil icon on each activity header
- Modal with name and priority fields (pre-filled)
- Save updates the activity via API

### Edit Action (Mobile-friendly)
- Action cards are clickable
- Opens modal with name, actor, priority, and description fields (pre-filled)
- Save updates the action via API

### Delete
- Delete button as red text link at bottom of edit modals (less prominent)
- Confirmation dialog: "will be permanently removed. This action cannot be recovered."
- Reusable `ConfirmDeleteDialogComponent` used across all delete operations

## UX Requirements

1. **Mobile-friendly**: Clicking action card opens edit modal
2. **Less prominent delete**: Text link at bottom, not prominent button
3. **Clear confirmation**: Permanent deletion warning
4. **Reusable dialog**: Same confirmation component used everywhere
