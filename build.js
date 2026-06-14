// Simple build script: copy static files to public/ directory for Vercel
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Clean and recreate public directory
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// Files to copy from root
const rootFiles = ['index.html', 'styles.css', 'script.js', 'start.bat', 'README.md'];

rootFiles.forEach(file => {
  const src = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log(`Copied: ${file}`);
  }
});

// Copy xianyu directory
const xianyuSrc = path.join(__dirname, '闲鱼上架素材');
const xianyuDst = path.join(publicDir, '闲鱼上架素材');
if (fs.existsSync(xianyuSrc)) {
  fs.mkdirSync(xianyuDst, { recursive: true });
  fs.readdirSync(xianyuSrc).forEach(f => {
    fs.copyFileSync(path.join(xianyuSrc, f), path.join(xianyuDst, f));
    console.log(`Copied: 闲鱼上架素材/${f}`);
  });
}

console.log('Build complete! Files in public/:');
fs.readdirSync(publicDir).forEach(f => console.log(`  - ${f}`));
