import { devLensStore } from "./store";
import type { DevLensConfig, DevLensErrorEntry, DevLensLogEntry, DevLensNetworkEntry } from "./types";
import { getSensitiveKeys, maskValue, normalizeHeaders, nowId, stringifyForDisplay, tryReadBody } from "./utils";

type CleanupFn = () => void;

let activeCleanup: CleanupFn | null = null;

function addLog(level: DevLensLogEntry["level"], args: unknown[]) {
  const message = args.map((arg) => stringifyForDisplay(arg)).join(" ");
  devLensStore.addEntry({
    id: nowId(),
    kind: "log",
    level,
    args,
    message,
    timestamp: Date.now(),
  });
}

function addError(error: Partial<DevLensErrorEntry> & Pick<DevLensErrorEntry, "message">) {
  devLensStore.addEntry({
    id: nowId(),
    kind: "error",
    timestamp: Date.now(),
    name: error.name ?? "Error",
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  });
}

function readRequestBody(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.body == null) {
    return undefined;
  }

  if (typeof init.body === "string") {
    return init.body;
  }

  if (typeof URLSearchParams !== "undefined" && init.body instanceof URLSearchParams) {
    return init.body.toString();
  }

  return String(init.body);
}

function installConsoleTracking() {
  const originals = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  console.log = (...args: unknown[]) => {
    addLog("log", args);
    originals.log(...args);
  };
  console.info = (...args: unknown[]) => {
    addLog("info", args);
    originals.info(...args);
  };
  console.warn = (...args: unknown[]) => {
    addLog("warn", args);
    originals.warn(...args);
  };
  console.error = (...args: unknown[]) => {
    addLog("error", args);
    originals.error(...args);
  };
  console.debug = (...args: unknown[]) => {
    addLog("debug", args);
    originals.debug(...args);
  };

  return () => {
    console.log = originals.log;
    console.info = originals.info;
    console.warn = originals.warn;
    console.error = originals.error;
    console.debug = originals.debug;
  };
}

function installErrorTracking() {
  const maybeWindow = typeof window !== "undefined" ? window : undefined;
  const maybeGlobal = globalThis as {
    ErrorUtils?: {
      getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
      setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
    };
  };

  const cleanupFns: CleanupFn[] = [];

  if (maybeWindow?.addEventListener) {
    const onError = (event: ErrorEvent) => {
      addError({
        name: event.error?.name ?? "WindowError",
        message: event.error?.message ?? event.message,
        stack: event.error?.stack,
      });
    };
    const onUnhandled = (event: PromiseRejectionEvent) => {
      addError({
        name: "UnhandledRejection",
        message: stringifyForDisplay(event.reason),
      });
    };

    maybeWindow.addEventListener("error", onError);
    maybeWindow.addEventListener("unhandledrejection", onUnhandled);
    cleanupFns.push(() => maybeWindow.removeEventListener("error", onError));
    cleanupFns.push(() => maybeWindow.removeEventListener("unhandledrejection", onUnhandled));
  }

  if (maybeGlobal.ErrorUtils?.getGlobalHandler && maybeGlobal.ErrorUtils?.setGlobalHandler) {
    const originalHandler = maybeGlobal.ErrorUtils.getGlobalHandler();
    maybeGlobal.ErrorUtils.setGlobalHandler((error, isFatal) => {
      addError({
        name: isFatal ? "FatalError" : error.name,
        message: error.message,
        stack: error.stack,
      });
      originalHandler?.(error, isFatal);
    });

    cleanupFns.push(() => {
      maybeGlobal.ErrorUtils?.setGlobalHandler?.(originalHandler ?? (() => undefined));
    });
  }

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

function installFetchTracking(config: DevLensConfig) {
  if (typeof fetch === "undefined") {
    return () => undefined;
  }

  const originalFetch = fetch;
  const sensitiveKeys = getSensitiveKeys(config.sensitiveKeys);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startedAt = Date.now();
    const method = init?.method ?? (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET");
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    const requestHeaders = normalizeHeaders(
      init?.headers ??
        (typeof Request !== "undefined" && input instanceof Request ? normalizeHeaders(input.headers) : undefined),
    );

    const requestBody = config.captureRequestBody ? readRequestBody(input, init) : undefined;

    try {
      const response = await originalFetch(input, init);
      const cloned = response.clone();
      const responseHeaders = normalizeHeaders(cloned.headers);
      const responseBody =
        config.captureResponseBody
          ? await tryReadBody(cloned, cloned.headers.get("content-type"))
          : undefined;

      const entry: DevLensNetworkEntry = {
        id: nowId(),
        kind: "network",
        timestamp: startedAt,
        method: method.toUpperCase(),
        url,
        status: response.status,
        ok: response.ok,
        durationMs: Date.now() - startedAt,
        requestHeaders: maskValue(requestHeaders, sensitiveKeys) as Record<string, unknown> | undefined,
        responseHeaders: maskValue(responseHeaders, sensitiveKeys) as Record<string, unknown> | undefined,
        requestBody: maskValue(requestBody, sensitiveKeys),
        responseBody: maskValue(responseBody, sensitiveKeys),
      };

      devLensStore.addEntry(entry);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : stringifyForDisplay(error);
      const entry: DevLensNetworkEntry = {
        id: nowId(),
        kind: "network",
        timestamp: startedAt,
        method: method.toUpperCase(),
        url,
        durationMs: Date.now() - startedAt,
        requestHeaders: maskValue(requestHeaders, sensitiveKeys) as Record<string, unknown> | undefined,
        requestBody: maskValue(requestBody, sensitiveKeys),
        errorMessage: message,
      };

      devLensStore.addEntry(entry);
      throw error;
    }
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}

export function startDevLens(config: DevLensConfig = {}) {
  devLensStore.configure(config);

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  if (config.enabled === false) {
    return () => undefined;
  }

  const cleanupFns: CleanupFn[] = [];
  const merged = devLensStore.getConfig();

  if (merged.trackConsole !== false) {
    cleanupFns.push(installConsoleTracking());
  }
  if (merged.trackErrors !== false) {
    cleanupFns.push(installErrorTracking());
  }
  if (merged.trackNetwork !== false) {
    cleanupFns.push(installFetchTracking(merged));
  }

  activeCleanup = () => {
    cleanupFns.reverse().forEach((cleanup) => cleanup());
  };

  return activeCleanup;
}
