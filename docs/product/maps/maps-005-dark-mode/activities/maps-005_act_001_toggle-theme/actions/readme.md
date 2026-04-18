# Toggle Theme Action

| UID | Title |
|-----|-------|
| maps-005_act_001_act_001 | Toggle Theme |

## Description

Click toggle button in app header to switch between light and dark themes.

## Acceptance Criteria

- [x] Toggle button displays in app header
- [x] Sun icon shown in light mode, moon icon in dark mode
- [x] Theme switches instantly without page reload
- [x] Preference saved to localStorage
- [x] Supports system preference detection on first visit

## Implementation

Location: `client/src/app/app.component.ts`

```typescript
toggleDarkMode(): void {
  this.darkMode = !this.darkMode;
  localStorage.setItem('darkMode', String(this.darkMode));
  this.applyDarkMode();
}

private applyDarkMode(): void {
  if (this.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
```