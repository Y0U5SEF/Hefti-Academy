import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const galleryDir = path.join(__dirname, '../public/images/gallery');
const outputFile = path.join(galleryDir, 'gallery-manifest.json');

/**
 * Recursively scans a directory and returns all files with their relative paths
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative paths
 * @returns {string[]} - Array of file paths relative to baseDir
 */
function scanDirectory(dir, baseDir) {
  let results = [];
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return results;
  }
  
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursively scan subdirectories
      results = results.concat(scanDirectory(filePath, baseDir));
    } else {
      // Check if the file is an image
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        // Get the path relative to the base directory
        const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
        results.push(`images/gallery/${relativePath}`);
      }
    }
  });
  
  return results;
}

// Ensure the gallery directory exists
if (!fs.existsSync(galleryDir)) {
  console.log(`Creating gallery directory: ${galleryDir}`);
  fs.mkdirSync(galleryDir, { recursive: true });
  
  // Create sample category folders
  ['events', 'training', 'tournaments'].forEach(category => {
    const categoryDir = path.join(galleryDir, category);
    if (!fs.existsSync(categoryDir)) {
      console.log(`Creating category directory: ${categoryDir}`);
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  });
  
  console.log('Gallery directory structure created. Please add images to the gallery folders.');
}

// Scan the gallery directory
console.log('Scanning gallery directory...');
const publicDir = path.join(__dirname, '../public');
const files = scanDirectory(galleryDir, publicDir);

// Create the manifest
const manifest = {
  generated: new Date().toISOString(),
  files: files
};

// Ensure the parent directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the manifest file
fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`Gallery manifest generated with ${files.length} images.`);
console.log(`Manifest saved to: ${outputFile}`);

// If no images were found, provide instructions
if (files.length === 0) {
  console.log('\nNo images found in the gallery directory.');
  console.log('Please add images to the following directories:');
  console.log(`- Root gallery: ${galleryDir}`);
  console.log(`- Categories: ${galleryDir}/{category-name}`);
  console.log('\nThen run this script again to generate the manifest.');
}
