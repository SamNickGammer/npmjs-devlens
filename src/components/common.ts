import type { DevLensEntry } from "../core/types";

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function summarizeEntry(entry: DevLensEntry) {
  if (entry.kind === "network") {
    return `${entry.method} ${entry.url}`;
  }
  if (entry.kind === "log") {
    return entry.message;
  }
  return `${entry.name}: ${entry.message}`;
}
