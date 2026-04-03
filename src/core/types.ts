export type DevLensEntryKind = "network" | "log" | "error";

export type DevLensLogLevel = "log" | "warn" | "error" | "info" | "debug";

export interface DevLensBaseEntry {
  id: string;
  kind: DevLensEntryKind;
  timestamp: number;
}

export interface DevLensNetworkEntry extends DevLensBaseEntry {
  kind: "network";
  method: string;
  url: string;
  status?: number;
  ok?: boolean;
  durationMs: number;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  requestBody?: unknown;
  responseBody?: unknown;
  errorMessage?: string;
}

export interface DevLensLogEntry extends DevLensBaseEntry {
  kind: "log";
  level: DevLensLogLevel;
  message: string;
  args: unknown[];
}

export interface DevLensErrorEntry extends DevLensBaseEntry {
  kind: "error";
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
}

export type DevLensEntry = DevLensNetworkEntry | DevLensLogEntry | DevLensErrorEntry;

export interface DevLensConfig {
  enabled?: boolean;
  maxEntries?: number;
  trackNetwork?: boolean;
  trackConsole?: boolean;
  trackErrors?: boolean;
  captureResponseBody?: boolean;
  captureRequestBody?: boolean;
  sensitiveKeys?: string[];
}

export interface DevLensSnapshot {
  entries: DevLensEntry[];
  counts: Record<DevLensEntryKind, number>;
}
