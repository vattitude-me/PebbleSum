/**
 * Build identity, stamped at build time by next.config.ts.
 *
 * - `version` is the human release number from package.json (bumped on every
 *   check-in — see CLAUDE.md "Versioning").
 * - `commit` and `builtAt` change automatically on every build, so two deploys
 *   can always be told apart even if the version wasn't bumped.
 */
export interface BuildInfo {
  version: string;
  commit: string;
  builtAt: string;
  /** "production", "preview" or "development". */
  channel: string;
}

export const BUILD_INFO: BuildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0",
  commit: process.env.NEXT_PUBLIC_BUILD_SHA || "dev",
  builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || "",
  channel: process.env.NEXT_PUBLIC_BUILD_CHANNEL || "development",
};

/** "v1.2.0" in production, "v1.2.0-preview" elsewhere. */
export function formatVersionLabel(info: BuildInfo): string {
  return info.channel === "production" ? `v${info.version}` : `v${info.version}-${info.channel}`;
}

export function formatBuildDate(iso: string, locale = "en-CA"): string {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** A deploy is newer if either the release number or the commit differs. */
export function isDifferentBuild(current: BuildInfo, deployed: Partial<BuildInfo> | null | undefined): boolean {
  if (!deployed?.version || !deployed.commit) return false;
  return deployed.version !== current.version || deployed.commit !== current.commit;
}
