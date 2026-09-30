"use client";

import { useState } from "react";
import { BUILD_INFO, BuildInfo, formatBuildDate, formatVersionLabel, isDifferentBuild } from "@/lib/version";

type CheckState = "idle" | "checking" | "current" | "available" | "offline";

/** Fetches the build that's live on the server, bypassing every cache. */
async function fetchDeployedBuild(): Promise<Partial<BuildInfo> | null> {
  const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

/** Drops the service worker's cached shell so the reload gets the new deploy. */
async function applyUpdate() {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.update();
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } finally {
    window.location.reload();
  }
}

export default function AppVersion() {
  const [state, setState] = useState<CheckState>("idle");
  const [deployed, setDeployed] = useState<Partial<BuildInfo> | null>(null);

  const checkForUpdates = async () => {
    setState("checking");
    try {
      const live = await fetchDeployedBuild();
      setDeployed(live);
      setState(isDifferentBuild(BUILD_INFO, live) ? "available" : "current");
    } catch {
      setState("offline");
    }
  };

  return (
    <section className="settings-page__section app-version">
      <h3 className="settings-page__section-title">About</h3>
      <dl className="app-version__list">
        <div className="app-version__row">
          <dt>Version</dt>
          <dd className="app-version__value">{formatVersionLabel(BUILD_INFO)}</dd>
        </div>
        <div className="app-version__row">
          <dt>Build</dt>
          <dd className="app-version__value app-version__mono">{BUILD_INFO.commit}</dd>
        </div>
        <div className="app-version__row">
          <dt>Released</dt>
          <dd className="app-version__value">{formatBuildDate(BUILD_INFO.builtAt)}</dd>
        </div>
      </dl>

      {state === "available" ? (
        <button onClick={applyUpdate} className="settings-page__btn settings-page__btn--primary app-version__btn">
          Update to v{deployed?.version} now
        </button>
      ) : (
        <button onClick={checkForUpdates} disabled={state === "checking"} className="settings-page__btn app-version__btn">
          {state === "checking" ? "Checking…" : "Check for updates"}
        </button>
      )}
      <p className="app-version__status" role="status">
        {state === "current" && "✓ You're on the latest version."}
        {state === "available" && `A newer version (v${deployed?.version}, build ${deployed?.commit}) is live.`}
        {state === "offline" && "Couldn't reach the server — check your connection."}
      </p>
    </section>
  );
}
