import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { BuildInfo, formatBuildDate, formatVersionLabel, isDifferentBuild } from "./version";

const ROOT = path.resolve(__dirname, "../..");
const PROD: BuildInfo = { version: "1.1.0", commit: "abc1234", builtAt: "2026-09-30T14:00:00.000Z", channel: "production" };

describe("version", () => {
  it("should_show_plain_version_when_channel_is_production", () => {
    expect(formatVersionLabel(PROD)).toBe("v1.1.0");
  });

  it("should_tag_version_when_channel_is_not_production", () => {
    expect(formatVersionLabel({ ...PROD, channel: "preview" })).toBe("v1.1.0-preview");
  });

  it("should_detect_new_build_when_commit_changes_without_version_bump", () => {
    expect(isDifferentBuild(PROD, { ...PROD, commit: "def5678" })).toBe(true);
  });

  it("should_detect_new_build_when_version_changes", () => {
    expect(isDifferentBuild(PROD, { ...PROD, version: "1.2.0" })).toBe(true);
  });

  it("should_report_no_update_when_build_matches_or_response_is_empty", () => {
    expect(isDifferentBuild(PROD, { ...PROD })).toBe(false);
    expect(isDifferentBuild(PROD, null)).toBe(false);
    expect(isDifferentBuild(PROD, {})).toBe(false);
  });

  it("should_show_dash_when_build_date_is_missing", () => {
    expect(formatBuildDate("")).toBe("—");
    expect(formatBuildDate("2026-09-30T14:00:00.000Z")).toContain("2026");
  });

  // Enforces the check-in rule in CLAUDE.md: bump package.json and log it.
  it("should_have_a_changelog_entry_for_the_current_package_version", () => {
    const { version } = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
    const changelog = readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
    const latest = changelog.match(/^## (\d+\.\d+\.\d+)/m)?.[1];
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(latest, "Top CHANGELOG.md entry must match package.json version").toBe(version);
  });
});
