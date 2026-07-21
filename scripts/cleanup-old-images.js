#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Images to keep (in use or already optimized)
const imagesToKeep = new Set([
  // Used backgrounds (WebP)
  "assets/backgrounds/Progress_background.webp",
  "assets/backgrounds/dashboard_background.webp",
  "assets/backgrounds/onboarding_background.webp",
  "assets/backgrounds/plain-background.webp",
  // Used icons (converted to WebP)
  "assets/icons/icon-arrow-left.webp",
  "assets/icons/icon-arrow-right.webp",
  "assets/icons/icon-avatar.webp",
  "assets/icons/icon-checkmark.webp",
  "assets/icons/icon-close-red.webp",
  "assets/icons/icon-coin-star.webp",
  "assets/icons/icon-edit.webp",
  "assets/icons/icon-fire.webp",
  "assets/icons/icon-home.webp",
  "assets/icons/icon-level.webp",
  "assets/icons/icon-pebble-celebrate-left.webp",
  "assets/icons/icon-pebble-thinking.webp",
  "assets/icons/icon-pebble-wave.webp",
  "assets/icons/icon-pencil.webp",
  "assets/icons/icon-play.webp",
  "assets/icons/icon-star-purple.webp",
  "assets/icons/icon-star.webp",
  "assets/icons/icon-timer.webp",
  "assets/icons/icon-xp.webp",
  // Badge icons (converted to WebP)
  "assets/icons/icon-badge-footprint.webp",
  "assets/icons/icon-badge-streak.webp",
  "assets/icons/icon-badge-lightning.webp",
  "assets/icons/icon-badge-crown.webp",
  "assets/icons/icon-badge-target.webp",
  "assets/icons/icon-badge-trophy.webp",
  "assets/icons/icon-badge-graduation.webp",
  "assets/icons/icon-badge-champion.webp",
  "assets/icons/icon-badge-seedling.webp",
  // App icons (converted to WebP)
  "icon-192x192.webp",
  "icon-512x512.webp",
  "apple-icon.webp",
  // Other assets
  "og-image.png",
]);

function walkDir(dir, relativePath = "") {
  const files = fs.readdirSync(path.join(__dirname, "..", "public", dir));
  let removed = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativeFull = path.join(relativePath, fullPath);
    const absolutePath = path.join(__dirname, "..", "public", fullPath);

    if (fs.statSync(absolutePath).isDirectory()) {
      removed += walkDir(fullPath, relativePath);
    } else {
      if (!imagesToKeep.has(fullPath)) {
        fs.unlinkSync(absolutePath);
        console.log(`🗑️  Removed: ${fullPath}`);
        removed++;
      }
    }
  }

  return removed;
}

console.log("\n🧹 Cleaning up old/unused images...\n");
const removed = walkDir(".");
console.log(`\n✅ Done! Removed ${removed} old images.\n`);
