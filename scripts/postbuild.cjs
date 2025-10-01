// Create a 404.html copy of index.html for GitHub Pages SPA routing
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

try {
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('Created dist/404.html for GitHub Pages fallback.');
  } else {
    console.warn('dist/index.html not found; skipping 404.html creation.');
  }
} catch (err) {
  console.error('Failed to create 404.html:', err);
  process.exitCode = 1;
}

