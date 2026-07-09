import sharp from 'sharp';
import { readdir, stat, rename } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

const MAX_WIDTH = 1200;
const QUALITY = 80;
const SIZE_THRESHOLD_KB = 500;

async function getImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  const images = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const fullPath = join(entry.parentPath || entry.path, entry.name);
      const s = await stat(fullPath);
      if (s.size > SIZE_THRESHOLD_KB * 1024) {
        images.push({ path: fullPath, size: s.size });
      }
    }
  }
  return images;
}

async function optimizeImage(filePath) {
  const meta = await sharp(filePath).metadata();
  const ext = extname(filePath).toLowerCase();
  const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  let pipeline = sharp(filePath);

  if (meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  await pipeline.webp({ quality: QUALITY }).toFile(webpPath);

  const originalSize = (await stat(filePath)).size;
  const newSize = (await stat(webpPath)).size;
  const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

  console.log(
    `  ${basename(filePath)} (${(originalSize / 1024).toFixed(0)}KB) → ${basename(webpPath)} (${(newSize / 1024).toFixed(0)}KB) — ${savings}% smaller`
  );

  return { original: filePath, webp: webpPath, originalSize, newSize };
}

async function main() {
  const publicDir = join(process.cwd(), 'public');
  const images = await getImages(publicDir);

  if (images.length === 0) {
    console.log('No images over 500KB found.');
    return;
  }

  console.log(`Found ${images.length} images over ${SIZE_THRESHOLD_KB}KB to optimize:\n`);

  let totalOriginal = 0;
  let totalNew = 0;

  for (const img of images) {
    const result = await optimizeImage(img.path);
    totalOriginal += result.originalSize;
    totalNew += result.newSize;
  }

  console.log(`\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(totalNew / 1024 / 1024).toFixed(1)}MB (${((1 - totalNew / totalOriginal) * 100).toFixed(1)}% savings)`);
  console.log('\nWebP files created alongside originals.');
  console.log('Update your imports/src to use .webp files, then delete the old PNGs.');
}

main().catch(console.error);
