import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

// Google Sheets API URL for Partners
const PARTNERS_SHEET_URL = "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/Partners";
const LOGOS_BASE_PATH = "/images/partners/";
const IMAGES_BASE_PATH = "/images/partners/";

const Partners = () => {
  const { language } = useLanguage();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainPartner, setMainPartner] = useState(null);
  const [otherPartners, setOtherPartners] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
        setShowControls(false);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoClick = () => {
    setShowControls(true);
  };

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    setShowControls(true);
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch(PARTNERS_SHEET_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Process the data
        const processedPartners = data
          .filter(row => row.isActive === "TRUE")
          .map(row => ({
            id: row.id,
            name: row[`name_${language}`] || row.name_en,
            logo: row.logoUrl ? `${LOGOS_BASE_PATH}${row.logoUrl}` : "assets/Placeholder.jpg",
            order: parseInt(row.order) || 999,
            imageUrl: row.imageUrl ? `${IMAGES_BASE_PATH}${row.imageUrl}` : null,
            isVideo: row.imageUrl?.toLowerCase().endsWith('.mp4') || false
          }))
          .sort((a, b) => a.order - b.order);

        // Separate main partner (order 1) from other partners
        const main = processedPartners.find(p => p.order === 1);
        const others = processedPartners.filter(p => p.order !== 1);
        
        setMainPartner(main);
        setOtherPartners(others);
        setError(null);
      } catch (err) {
        console.error("Error fetching partners:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [language]);

  const localizedTexts = {
    title: {
      ar: "شركاؤنا",
      fr: "Nos Partenaires",
      en: "Our Partners"
    },
    description: {
      ar: "نشكر شركائنا على دعمهم وتعاونهم المستمر",
      fr: "Nous remercions nos partenaires pour leur soutien et collaboration continue",
      en: "We thank our partners for their continued support and collaboration"
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Error loading partners: {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {localizedTexts.title[language]}
          </h2>
          <p className="text-lg text-gray-600">
            {localizedTexts.description[language]}
          </p>
        </div>
        
        {/* Main Partner Section */}
        {mainPartner && (
          <div className="flex p-4 rounded-lg bg-gray-100 border-2 border-solid flex-col md:flex-row gap-8 max-w-7xl mx-auto mb-16">
            {/* Logo */}
            <div className="w-full md:w-1/2">
              <div className="h-[100px] md:h-[400px] rounded-lg">
                <div className="h-full flex items-center justify-center">
                  <img
                    src={mainPartner.logo}
                    alt={mainPartner.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "assets/Placeholder.jpg";
                      e.currentTarget.classList.add("error-image");
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Side Image */}
            <div className="w-full md:w-1/2">
              <div className="h-[400px] rounded-lg overflow-hidden shadow-sm relative">
                {mainPartner.isVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      src={mainPartner.imageUrl}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={handleVideoClick}
                      onEnded={handleVideoEnd}
                      muted
                      onError={(e) => {
                        e.currentTarget.src = "assets/Placeholder.jpg";
                        e.currentTarget.classList.add("error-image");
                      }}
                    />
                    {showControls && (
                      <button
                        onClick={toggleVideoPlay}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300"
                        aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                      >
                        {isVideoPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={toggleMute}
                      className="absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <img
                    src={mainPartner.imageUrl || "assets/Placeholder.jpg"}
                    alt={mainPartner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "assets/Placeholder.jpg";
                      e.currentTarget.classList.add("error-image");
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Partners Grid */}
        {otherPartners.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
            {otherPartners.map((partner) => (
              <div
                key={partner.id}
                className="w-[45%] md:w-64 h-32 flex items-center justify-center p-4 transform"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "assets/Placeholder.jpg";
                    e.currentTarget.classList.add("error-image");
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Partners; 