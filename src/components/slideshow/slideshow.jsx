import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import "./slideshow.css";

// Base path for slideshow images
const SLIDESHOW_IMAGES_PATH = "/images/slideshow/";

const Slideshow = ({
  showText = true,
  transitionDelay = 4000,
  transitionDuration = 500,
  transitionType = "fade-and-slide",
}) => {
  const { language } = useLanguage();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState("next");
  const [slideshowHeight, setSlideshowHeight] = useState("100vh");
  
  // Calculate and update slideshow height
  useEffect(() => {
    const updateHeight = () => {
      const header = document.querySelector("header");
      if (header) {
        const headerHeight = header.offsetHeight;
        setSlideshowHeight(`calc(100vh - ${headerHeight}px)`);
      }
    };

    // Initial calculation
    updateHeight();
    
    // Recalculate on resize
    window.addEventListener("resize", updateHeight);
    
    // Recalculate after a short delay to ensure header is fully loaded
    const timeout = setTimeout(updateHeight, 100);

    return () => {
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timeout);
    };
  }, []);

  // Fetch slides from Google Sheets
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/Slideshow"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch slides");
        }

        const data = await response.json();
        
        // Process the data and add the full image path
        const processedSlides = data
          .filter(row => row.Active === "TRUE")
          .map(row => ({
            id: row.id,
            image: row.image_url ? SLIDESHOW_IMAGES_PATH + row.image_url : "/images/Placeholder.jpg",
            title: row[`title_${language}`] || row.title_en,
            description: row[`description_${language}`] || row.description_en,
            order: parseInt(row.order) || 999
          }))
          .sort((a, b) => a.order - b.order);

        setSlides(processedSlides);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, [language]);

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setDirection("next");
      updateSlide(1);
    }, transitionDelay);

    return () => clearInterval(timer);
  }, [slides.length, transitionDelay]);

  const updateSlide = (step) => {
    setCurrentSlide((prev) => (prev + step + slides.length) % slides.length);
  };

  const getTransitionStyles = (index) => {
    const isCurrentSlide = index === currentSlide;
    const baseTransition = `all ${transitionDuration}ms ease-in-out`;

    if (transitionType === "fade") {
      return {
        transition: baseTransition,
        opacity: isCurrentSlide ? 1 : 0,
      };
    }

    if (transitionType === "slide") {
      const translateX =
        direction === "next"
          ? isCurrentSlide
            ? 0
            : index < currentSlide
            ? -100
            : 100
          : isCurrentSlide
          ? 0
          : index < currentSlide
          ? -100
          : 100;

      return {
        transition: baseTransition,
        transform: `translateX(${translateX}%)`,
        opacity: 1,
      };
    }

    const translateX =
      direction === "next"
        ? isCurrentSlide
          ? 0
          : index < currentSlide
          ? -30
          : 30
        : isCurrentSlide
        ? 0
        : index < currentSlide
        ? -30
        : 30;

    return {
      transition: baseTransition,
      transform: `translateX(${translateX}%)`,
      opacity: isCurrentSlide ? 1 : 0,
    };
  };

  if (isLoading) {
    return (
      <div
        className="w-full flex items-center justify-center bg-gray-100"
        style={{ height: slideshowHeight }}
      >
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="w-full flex items-center justify-center bg-gray-100"
        style={{ height: slideshowHeight }}
      >
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="slideshow-container relative w-full overflow-hidden"
      style={{ 
        height: slideshowHeight,
        minHeight: "400px", // Minimum height to prevent too small slideshow
        maxHeight: "calc(100vh - 60px)" // Fallback max height if header height calculation fails
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className="absolute inset-0 w-full h-full"
          style={getTransitionStyles(index)}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/Placeholder.jpg";
              e.currentTarget.classList.add("error-image");
            }}
          />
          <div className="slide-overlay absolute z-0"></div>
          {showText && (slide.title || slide.description) && (
            <div
              className={`slideshow-cont absolute left-0 right-0 text-white p-4 ${
                language === "ar" ? "text-right" : "text-left"
              }`}
              style={{
                transform: `translateY(${
                  index === currentSlide ? "0" : "100%"
                })`,
                opacity: index === currentSlide ? 1 : 0,
                transition: `all ${transitionDuration}ms ease-in-out`,
              }}
            >
              {slide.title && (
                <h2 className="text-xl font-bold mb-2 py-4 px-4 m-0 slideshow-title">
                  {slide.title}
                </h2>
              )}
              {slide.description && (
                <p className="text-lg slideshow-desc">{slide.description}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="z-10 absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? "next" : "prev");
                setCurrentSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-150"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slideshow;
