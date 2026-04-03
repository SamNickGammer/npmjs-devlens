# DevLens Inspector

> In-app network, log, and error inspector for React, Next.js, and React Native.

`DevLens Inspector` helps you inspect what your app is doing without opening external devtools every time. Wrap your app once, then view API requests, responses, headers, console logs, and runtime errors from a floating launcher or an embedded panel.

## Why DevLens Inspector?

Frontend and mobile teams often lose time jumping between:

- browser devtools
- Metro logs
- remote debugging tools
- temporary `console.log()` statements
- custom debug screens built again and again

`DevLens Inspector` brings those signals into the app itself.

## Features

- Track `fetch` requests
- Capture request method, URL, status, duration, headers, and bodies
- Capture `console.log`, `console.info`, `console.warn`, `console.error`, and `console.debug`
- Capture runtime errors and unhandled promise rejections
- Show a floating debug launcher
- Show an embedded inspector panel
- Mask sensitive keys like `authorization`, `cookie`, `token`, `password`, and `secret`
- Works well for local development, QA, and staging builds

## Best For

- React apps
- Next.js apps
- React Native apps
- internal tools
- admin dashboards
- staging builds
- QA builds

## Installation

```bash
npm install devlens-inspector
```

## Quick Start

### React / Web

```tsx
import { DevLensProvider } from "devlens-inspector";
import { DevLensFloatingButton } from "devlens-inspector/web";

export function App() {
  return (
    <DevLensProvider trackConsole trackErrors trackNetwork>
      <YourApp />
      <DevLensFloatingButton />
    </DevLensProvider>
  );
}
```

### Embedded Panel

```tsx
import { DevLensProvider } from "devlens-inspector";
import { DevLensPanel } from "devlens-inspector/web";

export function App() {
  return (
    <DevLensProvider>
      <YourApp />
      <DevLensPanel />
    </DevLensProvider>
  );
}
```

### React Native

```tsx
import { DevLensProvider } from "devlens-inspector";
import { DevLensFloatingButton } from "devlens-inspector/react-native";

export function App() {
  return (
    <DevLensProvider trackConsole trackErrors trackNetwork>
      <RootNavigator />
      <DevLensFloatingButton />
    </DevLensProvider>
  );
}
```

## Platform Guides

npm does not support true interactive tabs in README files, so the sections below are written as collapsible tab-like guides.

<details open>
<summary><strong>React</strong></summary>

### 1. Install

```bash
npm install devlens-inspector
```

### 2. Wrap your app

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { DevLensProvider } from "devlens-inspector";
import { DevLensFloatingButton } from "devlens-inspector/web";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <DevLensProvider trackConsole trackErrors trackNetwork>
    <App />
    <DevLensFloatingButton />
  </DevLensProvider>,
);
```

### 3. Start working

Once the app loads, use the floating `DL` button to open the inspector.

You should see:

- network requests
- console output
- app errors

</details>

<details>
<summary><strong>Next.js</strong></summary>

### 1. Install

```bash
npm install devlens-inspector
```

### 2. Use it inside a client component

Because `DevLens Inspector` uses hooks and browser APIs, place it in a client component.

```tsx
"use client";

import { DevLensProvider } from "devlens-inspector";
import { DevLensFloatingButton, DevLensPanel } from "devlens-inspector/web";

export function DebugShell({ children }: { children: React.ReactNode }) {
  return (
    <DevLensProvider trackConsole trackErrors trackNetwork maxEntries={300}>
      {children}
      <DevLensFloatingButton />
      <DevLensPanel />
    </DevLensProvider>
  );
}
```

### 3. Use it in your app

```tsx
import { DebugShell } from "./debug-shell";

export default function Page() {
  return (
    <DebugShell>
      <main>Your page</main>
    </DebugShell>
  );
}
```

### 4. Generate some activity

```tsx
async function loadUsers() {
  const response = await fetch("/api/users");
  const data = await response.json();
  console.log("Users loaded", data);
}
```

If you want a working example, check:

- [examples/next-demo](./examples/next-demo)

</details>

<details>
<summary><strong>React Native</strong></summary>

### 1. Install

```bash
npm install devlens-inspector
```

### 2. Wrap your app root

```tsx
import { DevLensProvider } from "devlens-inspector";
import { DevLensFloatingButton } from "devlens-inspector/react-native";

export default function App() {
  return (
    <DevLensProvider trackConsole trackErrors trackNetwork>
      <RootNavigator />
      <DevLensFloatingButton />
    </DevLensProvider>
  );
}
```

### 3. Trigger some logs or requests

```tsx
async function loadProfile() {
  const response = await fetch("https://example.com/api/profile");
  const profile = await response.json();
  console.log("Profile loaded", profile);
}
```

### 4. Open the inspector

Tap the floating button to open the built-in inspector panel.

</details>

## How It Works

`DevLens Inspector` patches global `fetch` and listens to console/error events while your app is running.

Captured events are stored in memory and shown through:

- `DevLensFloatingButton`
- `DevLensPanel`

## API

### `DevLensProvider`

Wrap your application with `DevLensProvider` to start tracking.

```tsx
<DevLensProvider
  enabled
  trackConsole
  trackErrors
  trackNetwork
  maxEntries={200}
  captureRequestBody
  captureResponseBody
  sensitiveKeys={["authorization", "cookie", "token", "password"]}
>
  <App />
</DevLensProvider>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable DevLens Inspector |
| `trackConsole` | `boolean` | `true` | Capture console events |
| `trackErrors` | `boolean` | `true` | Capture runtime errors |
| `trackNetwork` | `boolean` | `true` | Capture `fetch` requests |
| `maxEntries` | `number` | `200` | Maximum in-memory event history |
| `captureRequestBody` | `boolean` | `true` | Store request body |
| `captureResponseBody` | `boolean` | `true` | Store response body |
| `sensitiveKeys` | `string[]` | built-in list | Extra keys to mask |

## Components

### Web

```tsx
import { DevLensFloatingButton, DevLensPanel } from "devlens-inspector/web";
```

- `DevLensFloatingButton`: floating launcher that opens the inspector
- `DevLensPanel`: embedded inspector panel for dedicated debug routes or pages

### React Native

```tsx
import { DevLensFloatingButton, DevLensPanel } from "devlens-inspector/react-native";
```

- `DevLensFloatingButton`: draggable floating trigger
- `DevLensPanel`: full inspector panel for embedded views or sheets

## Common Usage Patterns

### Development only

```tsx
<DevLensProvider enabled={process.env.NODE_ENV !== "production"}>
  <App />
</DevLensProvider>
```

### Custom masking

```tsx
<DevLensProvider sensitiveKeys={["authorization", "accessToken", "refreshToken", "sessionId"]}>
  <App />
</DevLensProvider>
```

### Embedded debug page

```tsx
import { DevLensProvider } from "devlens-inspector";
import { DevLensPanel } from "devlens-inspector/web";

export default function DebugPage() {
  return (
    <DevLensProvider>
      <DevLensPanel />
    </DevLensProvider>
  );
}
```

## Example Project

A working Next.js example is included in:

- [examples/next-demo](./examples/next-demo)

Run it locally:

```bash
cd examples/next-demo
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Notes

- `DevLens Inspector` currently tracks global `fetch`
- `axios` interception is not included yet
- recommended for development, staging, internal QA, and test builds
- avoid exposing debug tooling in public production builds unless you intentionally control access

## Roadmap

- `axios` adapter support
- filtering and search
- export/copy request details
- better grouping for repeated requests
- persistent session history
- custom event adapters

## Troubleshooting

### I do not see any requests

Make sure your app uses global `fetch`. If your project uses a custom API client, those calls will not appear unless they go through `fetch`.

### I only want this in dev mode

Use:

```tsx
<DevLensProvider enabled={process.env.NODE_ENV !== "production"}>
  <App />
</DevLensProvider>
```

### Next.js dev server is failing on Windows

The included example already uses a custom build directory in:

- [examples/next-demo/next.config.ts](./examples/next-demo/next.config.ts)

If your own app has file-locking issues, try using a custom `distDir`.

## Developer Notes

Built for developers who want faster feedback while building app flows, debugging APIs, and reviewing runtime behavior directly inside the UI.

This package is especially useful when:

- browser devtools are inconvenient
- React Native logs are noisy
- QA needs a built-in debug screen
- you want a reusable internal debug toolkit across projects

## License

MIT
