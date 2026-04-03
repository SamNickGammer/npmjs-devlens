import type { DevLensConfig, DevLensEntry, DevLensSnapshot } from "./types";

const DEFAULT_CONFIG: Required<Pick<
  DevLensConfig,
  "enabled" | "maxEntries" | "trackConsole" | "trackErrors" | "trackNetwork" | "captureRequestBody" | "captureResponseBody"
>> = {
  enabled: true,
  maxEntries: 200,
  trackConsole: true,
  trackErrors: true,
  trackNetwork: true,
  captureRequestBody: true,
  captureResponseBody: true,
};

export class DevLensStore {
  private entries: DevLensEntry[] = [];
  private listeners = new Set<() => void>();
  private config: DevLensConfig = DEFAULT_CONFIG;

  configure(config: DevLensConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.emit();
  }

  getConfig() {
    return this.config;
  }

  addEntry(entry: DevLensEntry) {
    const maxEntries = this.config.maxEntries ?? DEFAULT_CONFIG.maxEntries;
    this.entries = [entry, ...this.entries].slice(0, maxEntries);
    this.emit();
  }

  clear() {
    this.entries = [];
    this.emit();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): DevLensSnapshot {
    return {
      entries: this.entries,
      counts: {
        network: this.entries.filter((item) => item.kind === "network").length,
        log: this.entries.filter((item) => item.kind === "log").length,
        error: this.entries.filter((item) => item.kind === "error").length,
      },
    };
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const devLensStore = new DevLensStore();
