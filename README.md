# devlens

`devlens` is an in-app inspector for React Native and React apps. Wrap your app once, then inspect network requests, console logs, and runtime errors from a floating launcher or an embedded panel.

## Planned MVP

- Track `fetch` requests, responses, duration, and failures
- Capture `console.log`, `console.warn`, `console.error`, and runtime errors
- Render a floating inspector trigger
- Render an embedded inspector panel
- Keep records in memory with masking for sensitive keys

## Example

```tsx
import { DevLensProvider } from "devlens";
import { DevLensFloatingButton } from "devlens/react-native";

export function App() {
  return (
    <DevLensProvider trackConsole trackErrors trackNetwork>
      <RootNavigator />
      <DevLensFloatingButton />
    </DevLensProvider>
  );
}
```

## Embedded web panel

```tsx
import { DevLensProvider } from "devlens";
import { DevLensPanel } from "devlens/web";

export function App() {
  return (
    <DevLensProvider>
      <Routes />
      <DevLensPanel />
    </DevLensProvider>
  );
}
```

## Notes

- Intended for development and staging builds
- Network capture patches global `fetch`
- Sensitive fields such as `authorization`, `cookie`, `token`, and `password` are masked by default
