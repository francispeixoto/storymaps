# maps-005 - Dark Mode

UI enhancement for toggling between light and dark themes.

## Overview

| Field | Value |
|-------|-------|
| UID | maps-005 |
| Title | Dark Mode |
| Description | UI enhancement for toggling between light and dark themes |
| Status | Implemented |

## Background

- Users prefer working in dark mode especially during low-light conditions
- Dark mode reduces eye strain during extended sessions
- Many productivity tools offer theme customization

## Requirements

### Core Features

- Toggle switch in the app header
- Persist user's theme preference in localStorage
- Apply dark theme styles consistently across all components
- System preference detection on first visit

### Acceptance Criteria

- [x] Toggle visible and accessible on all pages
- [x] Switching themes works without page reload
- [x] Theme preference persists across sessions
- [x] All UI elements properly themed in both modes

## Technical Details

### Implementation

| Component | File | Description |
|-----------|------|-------------|
| Toggle Button | `client/src/app/app.component.ts` | Header button with sun/moon icons |
| Theme State | `client/src/app/app.component.ts` | darkMode property with localStorage persistence |
| CSS Variables | `client/src/styles.css` | Custom properties for light and dark themes |
| Tailwind Config | `client/tailwind.config.js` | darkMode set to 'class' |
| Component Styles | All page components | Dark mode classes applied |

### Theme Variables

```css
:root {
  --bg-primary: #f9fafb;
  --bg-secondary: #ffffff;
  --text-primary: #111827;
  /* ... */
}

.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  /* ... */
}
```

## Related Issues

- #65: UI Story: Implement Dark Mode Toggle