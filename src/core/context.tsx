"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import type { PropsWithChildren } from "react";
import { devLensStore } from "./store";
import { startDevLens } from "./tracker";
import type { DevLensConfig } from "./types";

const DevLensContext = createContext(devLensStore);

export function DevLensProvider({ children, ...config }: PropsWithChildren<DevLensConfig>) {
  useEffect(() => {
    const cleanup = startDevLens(config);
    return cleanup;
  }, [
    config.captureRequestBody,
    config.captureResponseBody,
    config.enabled,
    config.maxEntries,
    config.sensitiveKeys,
    config.trackConsole,
    config.trackErrors,
    config.trackNetwork,
  ]);

  return <DevLensContext.Provider value={devLensStore}>{children}</DevLensContext.Provider>;
}

export function useDevLensSnapshot() {
  const store = useContext(DevLensContext);
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );
}

export function useDevLensActions() {
  const store = useContext(DevLensContext);
  return {
    clear: () => store.clear(),
  };
}
