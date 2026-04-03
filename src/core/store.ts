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
  private snapshot: DevLensSnapshot = {
    entries: [],
    counts: {
      network: 0,
      log: 0,
      error: 0,
    },
  };

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
    this.snapshot = this.createSnapshot();
    this.emit();
  }

  clear() {
    this.entries = [];
    this.snapshot = this.createSnapshot();
    this.emit();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): DevLensSnapshot {
    return this.snapshot;
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private createSnapshot(): DevLensSnapshot {
    return {
      entries: this.entries,
      counts: {
        network: this.entries.filter((item) => item.kind === "network").length,
        log: this.entries.filter((item) => item.kind === "log").length,
        error: this.entries.filter((item) => item.kind === "error").length,
      },
    };
  }
}

export const devLensStore = new DevLensStore();
