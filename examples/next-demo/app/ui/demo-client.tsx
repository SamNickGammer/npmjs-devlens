"use client";

import { useState } from "react";
import { DevLensProvider } from "devlens";
import { DevLensFloatingButton, DevLensPanel } from "devlens/web";

export function DemoClient() {
  const [showPanel, setShowPanel] = useState(true);
  const [status, setStatus] = useState("Ready to generate activity.");

  async function callSuccessApi() {
    setStatus("Calling success API...");
    const response = await fetch("/api/demo/success?user=ava", {
      headers: {
        Authorization: "Bearer example-secret-token",
      },
    });
    const data = await response.json();
    console.log("Success payload", data);
    setStatus(`Success API returned ${data.message}`);
  }

  async function callErrorApi() {
    setStatus("Calling failing API...");
    const response = await fetch("/api/demo/failure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: "showcase-error",
        password: "123456",
      }),
    });

    const data = await response.json();
    console.error("Failure payload", data);
    setStatus(`Failure API returned ${response.status}`);
  }

  async function callSlowApi() {
    setStatus("Calling delayed API...");
    const response = await fetch("/api/demo/slow");
    const data = await response.json();
    console.info("Slow response", data);
    setStatus(`Slow API finished in about ${data.delayMs}ms`);
  }

  function emitLogs() {
    console.log("Developer note", { area: "demo", type: "log" });
    console.warn("Possible issue detected", { severity: "medium" });
    console.error("Captured error log example", { code: "DEMO_LOG_ERROR" });
    setStatus("Console logs emitted.");
  }

  function emitRuntimeError() {
    setStatus("Throwing runtime error...");
    setTimeout(() => {
      throw new Error("DevLens demo runtime error");
    }, 50);
  }

  return (
    <DevLensProvider trackConsole trackErrors trackNetwork maxEntries={300}>
      <main className="page-shell">
        <section className="hero">
          <span className="eyebrow">DevLens</span>
          <h1>Inspect your app without leaving the screen.</h1>
          <p>
            This demo creates real network traffic, logs, and runtime failures so you can verify the floating
            inspector and the embedded panel in a normal Next.js app.
          </p>
          <span className="inline-code">Wrap once with {"<DevLensProvider />"} and start inspecting.</span>
        </section>

        <section className="grid">
          <article className="card">
            <h2>Network Requests</h2>
            <p>
              These buttons hit Next.js API routes and generate both successful and failing responses. Sensitive keys
              like auth headers and passwords should appear masked in the inspector.
            </p>
            <div className="button-row">
              <button type="button" onClick={callSuccessApi}>
                Success request
              </button>
              <button type="button" onClick={callErrorApi} className="secondary">
                Failing request
              </button>
              <button type="button" onClick={callSlowApi} className="secondary">
                Slow request
              </button>
            </div>
          </article>

          <article className="card">
            <h2>Logs and Errors</h2>
            <p>
              Use these to make sure console events and global runtime errors show up in the same event stream as your
              API calls.
            </p>
            <div className="button-row">
              <button type="button" onClick={emitLogs}>
                Emit logs
              </button>
              <button type="button" onClick={emitRuntimeError} className="secondary">
                Throw runtime error
              </button>
            </div>
          </article>

          <article className="card">
            <h2>Inspector Modes</h2>
            <p>
              Keep the floating launcher on while developing, or embed the panel directly on a route for QA and staging
              builds.
            </p>
            <button
              type="button"
              onClick={() => setShowPanel((value) => !value)}
              className={showPanel ? "toggle secondary" : "toggle"}
            >
              {showPanel ? "Hide embedded panel" : "Show embedded panel"}
            </button>
            <div className="status">{status}</div>
          </article>
        </section>

        {showPanel ? (
          <section className="panel-wrap">
            <DevLensPanel />
          </section>
        ) : null}
      </main>
      <DevLensFloatingButton />
    </DevLensProvider>
  );
}
