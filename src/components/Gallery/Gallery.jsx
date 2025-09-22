import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { PageTitle, PageContainer, ContentContainer } from "../PageComponents";
import useIsMobile from "../../components/isMobile";
import axios from "axios";
import "./Gallery.css";

const Gallery = () => {
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('albums'); // 'all', 'albums', or 'album-view'
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [galleryStructure, setGalleryStructure] = useState({
    root: [],
    categories: {}
  });
  // Temporarily disabled date sorting
  // const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [visibleImages, setVisibleImages] = useState(new Set());
  const { language = "en", dir = "ltr" } = useLanguage() || {};

  // Constants for Google Sheet API
  const SHEET_ID = "1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0";
  const OPENSHEET_API = "https://opensheet.elk.sh";
  const IMAGE_BASE_PATH = "/images/gallery/";
  const THUMBNAIL_PATH = "/images/gallery/thumbnails/";
  
  // Intersection Observer for lazy loading - optimized to not recreate on every galleryStructure change
  const observerRef = React.useRef(null);
  
  useEffect(() => {
    // Only create the observer once
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const imagePath = entry.target.dataset.src;
              setVisibleImages((prev) => new Set([...prev, imagePath]));
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "200px", // Increased for better preloading
          threshold: 0.1
        }
      );
    }
    
    // Observer setup after DOM update
    const setupObserver = () => {
      document.querySelectorAll('.image-placeholder').forEach((el) => {
        observerRef.current.observe(el);
      });
    };
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(setupObserver);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [galleryStructure]);

  // Function to check if image exists with caching
  const imageExistsCache = React.useRef(new Map());
  
  const checkImageExists = useCallback(async (imagePath, thumbnailPath) => {
    // Check for the main image
    const mainImageKey = `main-${imagePath}`;
    if (!imageExistsCache.current.has(mainImageKey)) {
      try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        imageExistsCache.current.set(mainImageKey, response.ok);
      } catch {
        imageExistsCache.current.set(mainImageKey, false);
      }
    }
    
    // Check for the thumbnail
    const thumbnailKey = `thumb-${thumbnailPath}`;
    if (!imageExistsCache.current.has(thumbnailKey)) {
      try {
        const response = await fetch(thumbnailPath, { method: 'HEAD' });
        imageExistsCache.current.set(thumbnailKey, response.ok);
      } catch {
        imageExistsCache.current.set(thumbnailKey, false);
      }
    }
    
    // Return true if either the main image or thumbnail exists
    return imageExistsCache.current.get(mainImageKey) || imageExistsCache.current.get(thumbnailKey);
  }, []);

  // Function to sort categories by order
  const sortCategoriesByOrder = useCallback((categories) => {
    const withOrder = [];
    const withoutOrder = [];
    
    // Separate categories with and without order
    Object.entries(categories).forEach(entry => {
      if (entry[1].order && !isNaN(parseInt(entry[1].order))) {
        withOrder.push(entry);
      } else {
        withoutOrder.push(entry);
      }
    });
    
    // Sort categories with order
    const sortedWithOrder = withOrder.sort((a, b) => {
      const orderA = parseInt(a[1].order) || 9999;
      const orderB = parseInt(b[1].order) || 9999;
      return orderA - orderB;
    });
    
    // Combine sorted categories with order first, then categories without order
    const sortedCategories = [...sortedWithOrder, ...withoutOrder];
    
    return Object.fromEntries(sortedCategories);
  }, []);
  
  // We don't need a separate effect for re-sorting as we're already sorting when data is loaded

  // Function to fetch gallery data from Google Sheets
  useEffect(() => {
    const loadGalleryImages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${OPENSHEET_API}/${SHEET_ID}/Gallery`);
        
        if (!response.data || response.data.length === 0) {
          console.error("No gallery data found in the Google Sheet");
          setIsLoading(false);
          return;
        }
        
        const structure = {
          root: [],
          categories: {}
        };

        // Process images more efficiently
        // Create a function to process all images with Promise.all for parallel existence checks
        const processAllImages = async () => {
          // First, filter out invalid entries
          const validEntries = response.data.filter(image => 
            image && image.imageUrl && image.imageUrl.trim() !== ''
          );
          
          // Create an array of promises for checking image existence
          const existenceChecks = validEntries.map(async (image) => {
            const imagePath = IMAGE_BASE_PATH + image.imageUrl;
            const thumbnailPath = THUMBNAIL_PATH + image.imageUrl;
            const exists = await checkImageExists(imagePath, thumbnailPath);
            
            if (exists) {
              return {
                image,
                imagePath,
                imageObj: {
                  path: imagePath,
                  thumbnailPath: THUMBNAIL_PATH + image.imageUrl,
                  name: image.name || image.imageUrl.split('.')[0] || "Image",
                  category: image.category || "",
                  categoryID: image.categoryID || "",
                  description: image.description || "",
                  fullPath: imagePath,
                  filename: image.imageUrl,
                  date: image.date || "",
                  order: image.order || ""
                }
              };
            }
            return null;
          });
          
          // Wait for all existence checks to complete
          const results = await Promise.all(existenceChecks);
          
          // Process the valid images
          results.filter(Boolean).forEach(({ imageObj }) => {
            if (!imageObj.categoryID) {
              structure.root.push(imageObj);
            } else {
              if (!structure.categories[imageObj.categoryID]) {
                structure.categories[imageObj.categoryID] = {
                  name: imageObj.category,
                  date: imageObj.date,
                  images: []
                };
              }
              structure.categories[imageObj.categoryID].images.push(imageObj);
            }
          });
          
          // Sort images within each category by order
          Object.keys(structure.categories).forEach(categoryId => {
            const category = structure.categories[categoryId];
            const imagesWithOrder = [];
            const imagesWithoutOrder = [];
            
            // Separate images with and without order
            category.images.forEach(image => {
              if (image.order && !isNaN(parseInt(image.order))) {
                imagesWithOrder.push(image);
              } else {
                imagesWithoutOrder.push(image);
              }
            });
            
            // Sort images with order
            const sortedImagesWithOrder = imagesWithOrder.sort((a, b) => {
              const orderA = parseInt(a.order) || 9999;
              const orderB = parseInt(b.order) || 9999;
              return orderA - orderB;
            });
            
            // Replace category images with sorted images, keeping those without order at the end
            category.images = [...sortedImagesWithOrder, ...imagesWithoutOrder];
          });
          
          // Sort root images by order too
          const rootImagesWithOrder = [];
          const rootImagesWithoutOrder = [];
          
          structure.root.forEach(image => {
            if (image.order && !isNaN(parseInt(image.order))) {
              rootImagesWithOrder.push(image);
            } else {
              rootImagesWithoutOrder.push(image);
            }
          });
          
          const sortedRootImagesWithOrder = rootImagesWithOrder.sort((a, b) => {
            const orderA = parseInt(a.order) || 9999;
            const orderB = parseInt(b.order) || 9999;
            return orderA - orderB;
          });
          
          structure.root = [...sortedRootImagesWithOrder, ...rootImagesWithoutOrder];
          
          // Sort categories by order
          structure.categories = sortCategoriesByOrder(structure.categories);
          setGalleryStructure(structure);
          setIsLoading(false);
        };
        
        // Start processing all images
        await processAllImages();
      } catch (error) {
        console.error("Failed to load gallery images from Google Sheets:", error);
        setIsLoading(false);
      }
    };
    
    loadGalleryImages();
  }, [checkImageExists, sortCategoriesByOrder]);

  // Loading wheel component
  const LoadingWheel = () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-800"></div>
    </div>
  );

  // Translations for gallery text
  const translations = {
    gallery: {
      en: "Gallery",
      ar: "معرض الصور",
      fr: "Galerie"
    },
    allPhotos: {
      en: "All Photos",
      ar: "جميع الصور",
      fr: "Toutes les photos"
    },
    albums: {
      en: "Albums",
      ar: "الألبومات",
      fr: "Albums"
    },
    backToAlbums: {
      en: "Back",
      ar: "رجوع",
      fr: "Retour"
    },
    sortBy: {
      en: "Sort by:",
      ar: "ترتيب حسب:",
      fr: "Trier par:"
    },
    newest: {
      en: "Newest",
      ar: "الأحدث",
      fr: "Plus récent"
    },
    oldest: {
      en: "Oldest",
      ar: "الأقدم",
      fr: "Plus ancien"
    },
    image: {
      en: "image",
      ar: "صورة",
      fr: "image"
    },
    images: {
      en: "images",
      ar: "صور",
      fr: "images"
    }
  };

  // Filter component
  const FilterButtons = () => {
    const isAlbumView = viewMode === 'album-view';
    const selectedAlbumName = isAlbumView && selectedAlbumId ? 
      galleryStructure.categories[selectedAlbumId]?.name : '';
    const { dir = "ltr" } = useLanguage() || {};
    
    return (
      <div className={`${isAlbumView ? 'flex flex-col' : 'flex justify-center'} gap-4 mb-8`}>
        {isAlbumView && (
          <div className={`w-full flex ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
            <button
              onClick={() => setViewMode('albums')}
              className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
            >
              {dir === "rtl" ? (
                <>
                  {translations.backToAlbums[language] || translations.backToAlbums.en}
                  <i className="fi fi-rr-arrow-left ml-2 transform rotate-180"></i>
                </>
              ) : (
                <>
                  <i className="fi fi-rr-arrow-left mr-2"></i>
                  {translations.backToAlbums[language] || translations.backToAlbums.en}
                </>
              )}
            </button>
          </div>
        )}
        
        {!isAlbumView && (
          <>
            <button
              onClick={() => setViewMode('all')}
              className={`px-6 py-2 rounded-full transition-colors duration-200 ${
                viewMode === 'all'
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.allPhotos[language] || translations.allPhotos.en}
            </button>
            <button
              onClick={() => setViewMode('albums')}
              className={`px-6 py-2 rounded-full transition-colors duration-200 ${
                viewMode === 'albums'
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.albums[language] || translations.albums.en}
            </button>
          </>
        )}
        
        {isAlbumView && selectedAlbumName && (
          <h2 className={`text-xl font-semibold text-blue-800 text-center ${dir === "rtl" ? "text-right" : "text-left"}`}>
            {selectedAlbumName}
          </h2>
        )}
      </div>
    );
  };

  // Album view component
  const AlbumView = ({ categoryData, categoryID }) => {
    const firstTwoImages = categoryData.images.slice(0, 2);
    const rotationAngles = [-2, 2];
  
    const handleAlbumClick = () => {
      setSelectedAlbumId(categoryID);
      setViewMode('album-view');
    };
  
    const hasImages = firstTwoImages.length > 0;
    const totalImages = categoryData.images.length;
  
    return (
      <div 
        className="flex flex-col items-center mb-4"
        onClick={handleAlbumClick}
      >
        {/* Stacked thumbnails container - using aspect-square for 1:1 ratio */}
        <div className={`relative w-full aspect-square ${isMobile ? 'max-w-[160px]' : 'max-w-[200px]'} my-3 cursor-pointer`}>
          {hasImages ? (
            firstTwoImages.map((image, index) => (
              <motion.div
                key={`${image.path}-${index}`}
                initial={{ opacity: 0, y: 20, rotate: rotationAngles[index] }}
                animate={{ opacity: 1, y: 0, rotate: rotationAngles[index] }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`absolute inset-0 overflow-hidden rounded-lg shadow-lg aspect-square mx-auto ${
                  index === 1 ? 'mt-3 -mr-2' : 'mb-3 -ml-2'
                }`}
                style={{
                  width: '100%',
                  zIndex: index + 1,
                }}
              >
                <img
                  src={image.thumbnailPath}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.target.src = image.path;
                  }}
                />
              </motion.div>
            ))
          ) : (
            <div className="absolute inset-0 rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No images</span>
            </div>
          )}
          
          {/* Image count badge */}
          <div className="absolute top-1 right-1 bg-blue-800 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {totalImages} {totalImages === 1 ? 
              (translations.image[language] || translations.image.en) : 
              (translations.images[language] || translations.images.en)
            }
          </div>
        </div>
        
        {/* Album info */}
        <div className="text-center w-full mt-2">
          <h2 className="text-sm font-medium text-blue-800 cursor-pointer">
            {categoryData.name}
          </h2>
          {categoryData.date && (
            <div className="flex items-center justify-center text-gray-600 text-xs mt-1">
              <i className={`fi fi-rr-calendar ${dir === "rtl" ? "ml-1" : "mr-1"} text-gray-500`}></i>
              <span>{categoryData.date}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      <PageTitle title={translations.gallery[language] || translations.gallery.en} />
      <ContentContainer>
        {isLoading ? (
          <LoadingWheel />
        ) : (
          <>
            <FilterButtons />
            
            {/* Content based on view mode */}
            {viewMode === 'all' ? (
              <>
                {/* Root images without category */}
                {galleryStructure.root.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
                    {galleryStructure.root.map((image, index) => (
                      <GalleryImage 
                        key={`${image.path}-${index}`} 
                        image={image} 
                        index={index} 
                        setSelectedImage={setSelectedImage} 
                        dir={dir}
                        visibleImages={visibleImages}
                      />
                    ))}
                  </div>
                )}

                {/* Category images */}
                {Object.entries(galleryStructure.categories).map(([categoryID, categoryData], categoryIndex) => (
                  <div key={categoryID} className="mb-12">
                    <h2 className={`text-2xl font-semibold mb-2 text-blue-800 ${
                      dir === "rtl" ? "text-right" : "text-left"
                    }`}>
                      {categoryData.name}
                    </h2>
                    {categoryData.date && (
                      <div className={`flex items-center mb-6 ${
                        dir === "rtl" ? "justify-end" : "justify-start"
                      }`}>
                        <div className="inline-flex items-center bg-gray-100 text-gray-600 py-1 px-3 rounded-md">
                          <i className={`fi fi-rr-calendar ${dir === "rtl" ? "ml-2" : "mr-2"} text-gray-500`}></i>
                          <span>{categoryData.date}</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                      {categoryData.images.map((image, index) => (
                        <GalleryImage 
                          key={`${image.path}-${categoryIndex}-${index}`} 
                          image={image} 
                          index={index} 
                          categoryIndex={categoryIndex}
                          setSelectedImage={setSelectedImage}
                          dir={dir}
                          visibleImages={visibleImages}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : viewMode === 'albums' ? (
              // Albums view
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-50"> {/* Modified for 2 columns on mobile */}
                {Object.entries(galleryStructure.categories).map(([categoryID, categoryData]) => (
                  <AlbumView 
                    key={categoryID}
                    categoryData={categoryData}
                    categoryID={categoryID}
                  />
                ))}
              </div>
            ) : viewMode === 'album-view' && selectedAlbumId && galleryStructure.categories[selectedAlbumId] ? (
              // Single album view - shows only images from the selected album
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {galleryStructure.categories[selectedAlbumId].images.map((image, index) => (
                  <GalleryImage 
                    key={`${image.path}-album-view-${index}`} 
                    image={image} 
                    index={index} 
                    setSelectedImage={setSelectedImage}
                    dir={dir}
                    visibleImages={visibleImages}
                  />
                ))}
              </div>
            ) : null}

            {/* Empty state message when no images */}
            {galleryStructure.root.length === 0 && Object.keys(galleryStructure.categories).length === 0 && (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-lg">
                  {language === "ar" ? "لا توجد صور للعرض" : 
                   language === "fr" ? "Aucune image à afficher" : 
                   "No images to display"}
                </p>
              </div>
            )}
          </>
        )}

        {/* Image lightbox */}
        {selectedImage && (
          <ImageLightbox 
            selectedImage={selectedImage} 
            setSelectedImage={setSelectedImage} 
          />
        )}
      </ContentContainer>
    </PageContainer>
  );
};

// Optimized GalleryImage component
// Use a more aggressive equality check for React.memo to prevent unnecessary re-renders
const GalleryImage = React.memo(({ image, index, categoryIndex = 0, setSelectedImage, dir, visibleImages }) => {
  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: 'Hefti Academy Gallery',
      text: 'Check out this image from Hefti Academy!',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Only animate items that are visible in the viewport for better performance
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        // Reduce animation complexity and stagger delay
        delay: Math.min((categoryIndex * 0.05) + (index * 0.02), 0.5)
      }}
      className="relative group cursor-pointer"
      onClick={() => setSelectedImage(image)}
    >
      <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
        {/* Use eager loading for all images to ensure they appear immediately */}
        <img
          src={image.thumbnailPath}
          alt={image.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
          loading="eager"
          onError={(e) => {
            // Fallback to main image if thumbnail fails
            e.target.src = image.path;
          }}
        />
        {image.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {image.description}
          </div>
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleDownload}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors duration-200"
          title="Download"
        >
          <i className="fi fi-rr-download text-gray-700"></i>
        </button>
        <button
          onClick={handleShare}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors duration-200"
          title="Share"
        >
          <i className="fi fi-rr-share text-gray-700"></i>
        </button>
      </div>
    </motion.div>
  );
});

// Separated lightbox component
const ImageLightbox = ({ selectedImage, setSelectedImage }) => {
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  
  // Reset the loaded state when a new image is selected
  useEffect(() => {
    setIsFullImageLoaded(false);
  }, [selectedImage]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(selectedImage.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedImage.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: 'Hefti Academy Gallery',
      text: 'Check out this image from Hefti Academy!',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={() => setSelectedImage(null)}
    >
      <div className="relative max-w-4xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Show thumbnail while full image is loading */}
        {!isFullImageLoaded && (
          <img 
            src={selectedImage.thumbnailPath} 
            alt={selectedImage.name} 
            className="max-w-full max-h-[80vh] object-contain blur-sm"
          />
        )}
        
        {/* Full-sized image with loading handler */}
        <img 
          src={selectedImage.path} 
          alt={selectedImage.name} 
          className={`max-w-full max-h-[80vh] object-contain ${isFullImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.3s ease' }}
          onLoad={() => setIsFullImageLoaded(true)}
        />
        
        {/* Image caption/description if available */}
        {selectedImage.description && (
          <div className="bg-black bg-opacity-70 text-white p-3 absolute bottom-0 left-0 right-0">
            <p>{selectedImage.description}</p>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-4 items-center">
        <button
          onClick={handleDownload}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors duration-200"
          title="Download"
        >
          <i className="fi fi-rr-download text-gray-700"></i>
        </button>
        <button
          onClick={handleShare}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors duration-200"
          title="Share"
        >
          <i className="fi fi-rr-share text-gray-700"></i>
        </button>
        <button
          className="text-white text-4xl hover:text-gray-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImage(null);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Gallery;