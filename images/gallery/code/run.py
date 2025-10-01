#!/usr/bin/env python3
import os
import sys
from PIL import Image
import concurrent.futures

# Configuration
THUMBNAIL_WIDTH = 400
FULL_SIZE_WIDTH = 1600
THUMBNAIL_QUALITY = 75
FULLSIZE_QUALITY = 85
SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']

def ensure_dirs_exist():
    """Create output directories if they don't exist."""
    os.makedirs('thumbnails', exist_ok=True)
    os.makedirs('compressed', exist_ok=True)

def process_image(filename):
    """Process a single image file - create thumbnail and compressed version."""
    name, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext not in SUPPORTED_FORMATS:
        print(f"Skipping {filename} - not a supported format")
        return
    
    try:
        # Open the image
        img = Image.open(filename)
        
        # Generate thumbnail
        thumb_img = img.copy()
        
        # Calculate new height to maintain aspect ratio
        width_percent = (THUMBNAIL_WIDTH / float(thumb_img.size[0]))
        thumbnail_height = int((float(thumb_img.size[1]) * float(width_percent)))
        
        # Resize thumbnail
        thumb_img = thumb_img.resize((THUMBNAIL_WIDTH, thumbnail_height), Image.Resampling.LANCZOS)
        
        # Save thumbnail as WebP
        thumb_path = os.path.join('thumbnails', f"{name}.webp")
        thumb_img.save(thumb_path, 'WEBP', quality=THUMBNAIL_QUALITY)
        print(f"Created thumbnail: {thumb_path}")
        
        # Generate compressed full-size image
        full_img = img.copy()
        
        # Calculate new height to maintain aspect ratio
        width_percent = (FULL_SIZE_WIDTH / float(full_img.size[0]))
        full_height = int((float(full_img.size[1]) * float(width_percent)))
        
        # Resize full-size image
        full_img = full_img.resize((FULL_SIZE_WIDTH, full_height), Image.Resampling.LANCZOS)
        
        # Save full-size image as WebP
        full_path = os.path.join('compressed', f"{name}.webp")
        full_img.save(full_path, 'WEBP', quality=FULLSIZE_QUALITY)
        print(f"Created compressed image: {full_path}")
        
        # Calculate compression ratio
        original_size = os.path.getsize(filename)
        compressed_size = os.path.getsize(full_path)
        compression_ratio = (1 - compressed_size / original_size) * 100
        
        print(f"Original: {original_size/1024/1024:.2f} MB, Compressed: {compressed_size/1024/1024:.2f} MB")
        print(f"Compression ratio: {compression_ratio:.2f}%")
        print("-" * 50)
        
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")

def main():
    """Process all image files in the current directory."""
    print("Starting image compression and thumbnail generation...")
    ensure_dirs_exist()
    
    # Get list of image files in current directory
    files = [f for f in os.listdir('.') if os.path.isfile(f) and 
             os.path.splitext(f)[1].lower() in SUPPORTED_FORMATS]
    
    if not files:
        print("No supported image files found in the current directory.")
        return
    
    print(f"Found {len(files)} image files to process.")
    
    # Process files in parallel to speed up execution
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.map(process_image, files)
    
    print("\nCompleted! All images have been processed.")
    print(f"Thumbnails are in the 'thumbnails' directory - {THUMBNAIL_WIDTH}px width, {THUMBNAIL_QUALITY}% quality")
    print(f"Compressed images are in the 'compressed' directory - {FULL_SIZE_WIDTH}px width, {FULLSIZE_QUALITY}% quality")

if __name__ == "__main__":
    main()