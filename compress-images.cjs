const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = './src/assets/images';

const filesToCompress = [
  'background-dark.png',
  'cat_message.png',
  'home-background.png',
  'book_open.png',
  'book_close.png',
  'cat1.png',
  'exclamation_mark.png',
  'cactus.png',
  'logincat.png'
];

async function compressImages() {
  for (const file of filesToCompress) {
    const inputPath = path.join(imageDir, file);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skip: ${file} not found`);
      continue;
    }

    const stats = fs.statSync(inputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    // Backup original
    const backupPath = inputPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Resize if too large (max 1500px width for backgrounds, 800px for others)
      const maxWidth = file.includes('background') ? 1500 : 800;
      const shouldResize = metadata.width > maxWidth;

      let pipeline = image;
      if (shouldResize) {
        pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
      }

      // Compress PNG
      const outputBuffer = await pipeline
        .png({ quality: 80, compressionLevel: 9 })
        .toBuffer();

      fs.writeFileSync(inputPath, outputBuffer);

      const newStats = fs.statSync(inputPath);
      const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
      const reduction = ((1 - newStats.size / stats.size) * 100).toFixed(1);

      console.log(`✓ ${file}: ${sizeMB}MB → ${newSizeMB}MB (${reduction}% reduced)`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
}

compressImages();
