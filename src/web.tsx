"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useDevLensActions, useDevLensSnapshot } from "./core/context";
import type { DevLensEntry } from "./core/types";
import { stringifyForDisplay } from "./core/utils";
import { formatTime, summarizeEntry } from "./components/common";

const shellStyle: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  background: "#0f172a",
  color: "#e2e8f0",
  border: "1px solid #334155",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.28)",
};

function detailText(entry: DevLensEntry) {
  return stringifyForDisplay(entry);
}

export function DevLensPanel() {
  const { entries, counts } = useDevLensSnapshot();
  const { clear } = useDevLensActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => entries.find((item) => item.id === selectedId) ?? entries[0], [entries, selectedId]);

  return (
    <div style={{ ...shellStyle, display: "grid", gridTemplateColumns: "320px 1fr", minHeight: 420 }}>
      <aside style={{ borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: 16, borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>DevLens</div>
          <div style={{ fontSize: 12, opacity: 0.72, marginTop: 4 }}>
            {counts.network} network · {counts.log} logs · {counts.error} errors
          </div>
          <button
            type="button"
            onClick={clear}
            style={{
              marginTop: 12,
              background: "#1d4ed8",
              color: "white",
              border: 0,
              borderRadius: 999,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </header>
        <div style={{ overflow: "auto", maxHeight: 520 }}>
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedId(entry.id)}
              style={{
                width: "100%",
                textAlign: "left",
                background: selected?.id === entry.id ? "#172554" : "transparent",
                color: "inherit",
                border: 0,
                borderBottom: "1px solid #1e293b",
                padding: 14,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>
                {entry.kind.toUpperCase()} · {formatTime(entry.timestamp)}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.45, wordBreak: "break-word" }}>{summarizeEntry(entry)}</div>
            </button>
          ))}
        </div>
      </aside>
      <section style={{ padding: 16, overflow: "auto" }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12 }}>
          {selected ? detailText(selected) : "No events yet."}
        </pre>
      </section>
    </div>
  );
}

export function DevLensFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 999999,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: 0,
          background: "#0f172a",
          color: "white",
          fontWeight: 700,
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.35)",
          cursor: "pointer",
        }}
      >
        DL
      </button>
      {open ? (
        <div
          style={{
            position: "fixed",
            inset: "auto 20px 92px auto",
            zIndex: 999998,
            width: "min(920px, calc(100vw - 40px))",
            maxHeight: "min(720px, calc(100vh - 120px))",
          }}
        >
          <DevLensPanel />
        </div>
      ) : null}
    </>
  );
}
