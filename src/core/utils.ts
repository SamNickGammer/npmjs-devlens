const DEFAULT_SENSITIVE_KEYS = ["authorization", "cookie", "token", "password", "secret", "apiKey"];

export function nowId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSensitiveKeys(customKeys?: string[]) {
  return new Set([...DEFAULT_SENSITIVE_KEYS, ...(customKeys ?? [])].map((item) => item.toLowerCase()));
}

function safeClone(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value == null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value as object)) {
    return "[circular]";
  }

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => safeClone(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, safeClone(nestedValue, seen)]),
  );
}

export function maskValue(value: unknown, sensitiveKeys: Set<string>): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    return value.length > 2000 ? `${value.slice(0, 2000)}…` : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item, sensitiveKeys));
  }

  if (typeof value === "object") {
    const safeObject = safeClone(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(safeObject).map(([key, nestedValue]) => [
        key,
        sensitiveKeys.has(key.toLowerCase()) ? "[masked]" : maskValue(nestedValue, sensitiveKeys),
      ]),
    );
  }

  return value;
}

export function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function stringifyForDisplay(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(safeClone(value), null, 2);
  } catch {
    return String(value);
  }
}

export function normalizeHeaders(headers: HeadersInit | Record<string, unknown> | undefined | null) {
  if (!headers) {
    return undefined;
  }

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, typeof value === "string" ? value : String(value)]),
  );
}

export async function tryReadBody(
  bodySource: Body | null | undefined,
  contentType: string | null | undefined,
) {
  if (!bodySource) {
    return undefined;
  }

  try {
    const text = await bodySource.text();

    if (!text) {
      return undefined;
    }

    if (contentType?.includes("application/json")) {
      return safeJsonParse(text);
    }

    return text;
  } catch {
    return "[unavailable]";
  }
}
