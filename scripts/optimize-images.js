#!/usr/bin/env node

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const usedImages = [
  // Backgrounds
  "assets/backgrounds/Progress_background.webp",
  "assets/backgrounds/dashboard_background.webp",
  "assets/backgrounds/onboarding_background.png",
  "assets/backgrounds/onboarding_background.webp",
  "assets/backgrounds/plain-background.webp",
  // Icons (most used)
  "assets/icons/icon-arrow-left.png",
  "assets/icons/icon-arrow-right.png",
  "assets/icons/icon-avatar.png",
  "assets/icons/icon-checkmark.png",
  "assets/icons/icon-close-red.png",
  "assets/icons/icon-coin-star.png",
  "assets/icons/icon-edit.png",
  "assets/icons/icon-fire.png",
  "assets/icons/icon-home.png",
  "assets/icons/icon-level.png",
  "assets/icons/icon-pebble-celebrate-left.png",
  "assets/icons/icon-pebble-thinking.png",
  "assets/icons/icon-pebble-wave.png",
  "assets/icons/icon-pencil.png",
  "assets/icons/icon-play.png",
  "assets/icons/icon-star-purple.png",
  "assets/icons/icon-star.png",
  "assets/icons/icon-timer.png",
  "assets/icons/icon-xp.png",
  // Badge icons
  "assets/icons/icon-badge-footprint.png",
  "assets/icons/icon-badge-streak.png",
  "assets/icons/icon-badge-lightning.png",
  "assets/icons/icon-badge-crown.png",
  "assets/icons/icon-badge-target.png",
  "assets/icons/icon-badge-trophy.png",
  "assets/icons/icon-badge-graduation.png",
  "assets/icons/icon-badge-champion.png",
  "assets/icons/icon-badge-seedling.png",
  // App icons
  "icon-192x192.png",
  "icon-512x512.png",
  "apple-icon.png",
];

async function optimizeImage(filePath) {
  const fullPath = path.join(__dirname, "..", "public", filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skip (not found): ${filePath}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  // Skip images that are already WebP unless they're PNG
  if (ext === ".webp") {
    const stat = fs.statSync(fullPath);
    console.log(`✓ Already WebP: ${filePath} (${(stat.size / 1024).toFixed(1)}KB)`);
    return;
  }

  if (ext === ".png") {
    const webpPath = fullPath.replace(/\.png$/i, ".webp");

    try {
      const stat = fs.statSync(fullPath);
      const originalSize = stat.size;

      await sharp(fullPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath);

      const webpStat = fs.statSync(webpPath);
      const webpSize = webpStat.size;
      const savings = (((originalSize - webpSize) / originalSize) * 100).toFixed(1);

      console.log(
        `✓ Optimized: ${filePath} (${(originalSize / 1024).toFixed(1)}KB → ${(webpSize / 1024).toFixed(1)}KB, ${savings}% smaller)`
      );
    } catch (err) {
      console.error(`✗ Error optimizing ${filePath}:`, err.message);
    }
  }
}

async function main() {
  console.log(`\n📦 Optimizing ${usedImages.length} images...\n`);

  for (const image of usedImages) {
    await optimizeImage(image);
  }

  console.log(`\n✅ Done!\n`);
}

main().catch(console.error);
