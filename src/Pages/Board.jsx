import React, { useState, useEffect, Suspense } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  PageTitle,
  PageContainer,
  ContentContainer,
} from "../components/PageComponents";
import LoadingScreen from "../components/Loading/loading";
import "./pages.css";
import useIsMobile from "../components/isMobile";

// Google Sheets API URL
const SHEETS_API_URL = "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/BoardMembers";

// Category titles
const CATEGORY_TITLES = {
  P1: {
    ar: "رؤساء فخريون",
    fr: "Présidents d'Honneur",
    en: "Honorary Presidents"
  },
  P2: {
    ar: "الرئيس",
    fr: "Président",
    en: "President"
  },
  P3: {
    ar: "نائب الرئيس",
    fr: "Vice-Président",
    en: "Vice President"
  },
  P4: {
    ar: "الأمين العام",
    fr: "Secrétaire Général",
    en: "Secretary General"
  },
  P5: {
    ar: "قسم تكنولوجيا المعلومات",
    fr: "Département IT",
    en: "IT Department"
  },
  P6: {
    ar: "المدربون",
    fr: "Entraîneurs",
    en: "Coaches"
  },
  P7: {
    ar: "الأعضاء",
    fr: "Membres",
    en: "Members"
  }
};

// Localized texts
const LOCALIZED_TEXTS = {
  loading: {
    ar: "جاري التحميل...",
    fr: "Chargement...",
    en: "Loading...",
  },
  pageTitle: {
    ar: "مجلس الإدارة",
    fr: "Conseil d'Administration",
    en: "Board Members",
  },
  noContent: {
    ar: "لا يوجد محتوى متاح",
    fr: "Aucun contenu disponible",
    en: "No content available",
  },
  error: {
    ar: "خطأ",
    fr: "Erreur",
    en: "Error",
  },
};

// Function to get image path
const getImagePath = (imageName) => {
  return `Hefti-Academy/images/board/${imageName}`;
};

// Function to preload an image and check if it exists
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

const BoardMembers = () => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [imageStatus, setImageStatus] = useState({});

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(SHEETS_API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Process the data
        const processedMembers = data
          .filter(row => row.isActive === "TRUE")
          .map(row => ({
            id: row.id,
            category: row.category,
            categoryOrder: parseInt(row.category_order) || 999,
            fullName: row[`fullName_${language}`] || row.fullName_en,
            role: row[`role_${language}`] || row.role_en,
            photoName: row.photoUrl || "Placeholder.jpg", // API already provides just the filename
            bio: row[`bio_${language}`] || row.bio_en,
            socialLinks: row.social_links ? JSON.parse(row.social_links) : {},
          }))
          .sort((a, b) => {
            // First sort by category
            if (a.category !== b.category) {
              return a.category.localeCompare(b.category);
            }
            // Then sort by category order
            return a.categoryOrder - b.categoryOrder;
          });
        
        setMembers(processedMembers);
        setError(null);
      } catch (err) {
        console.error("Error fetching board members:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [language]);

  // Preload images for members when members data changes
  useEffect(() => {
    const preloadMemberImages = async () => {
      if (members.length === 0) return;
      
      const newImageStatus = {};
      
      for (const member of members) {
        const imagePath = getImagePath(member.photoName);
        try {
          await preloadImage(imagePath);
          newImageStatus[member.id] = { loaded: true, path: imagePath };
        } catch (error) {
          console.warn(`Failed to load image for member ${member.id}:`, error);
          // Set fallback image
          const placeholderPath = getImagePath("Placeholder.jpg");
          newImageStatus[member.id] = { loaded: true, path: placeholderPath };
        }
      }
      
      setImageStatus(newImageStatus);
    };
    
    preloadMemberImages();
  }, [members]);

  const getLocalizedText = (key) => {
    return LOCALIZED_TEXTS[key]?.[language] || LOCALIZED_TEXTS[key].en;
  };

  if (loading) {
    return <LoadingScreen message={LOCALIZED_TEXTS.loading[language] || LOCALIZED_TEXTS.loading.en} />;
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle title={`${getLocalizedText("error")}: ${error}`} />
      </PageContainer>
    );
  }

  if (!members?.length) {
    return (
      <PageContainer>
        <PageTitle title={getLocalizedText("noContent")} />
      </PageContainer>
    );
  }

  // Group members by category
  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.category]) {
      acc[member.category] = [];
    }
    acc[member.category].push(member);
    return acc;
  }, {});

  return (
    <PageContainer>
      <PageTitle title={getLocalizedText("pageTitle")} />
      <ContentContainer>
        {Object.entries(groupedMembers).map(([category, members]) => (
          <div key={category} className="mb-16">
            <div className="flex items-center justify-center mb-8">
              
              <h2 className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg py-3 px-6 text-2xl font-bold text-center shadow-lg w-full">
                {CATEGORY_TITLES[category][language] || CATEGORY_TITLES[category].en}
              </h2>
            </div>
            <div
              className={`flex flex-wrap ${
                isMobile ? "gap-4" : "gap-12"
              } max-w-7xl mx-auto justify-center`}
            >
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300 cursor-pointer"
                  style={{ width: isMobile ? 'calc(50% - 8px)' : 'calc(33.333% - 32px)', minWidth: isMobile ? '140px' : '200px' }}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="relative">
                    <div
                      className={`relative board-avatar rounded-full overflow-hidden ${
                        isMobile ? "w-32 h-32" : "w-44 h-44"
                      } shadow-xl`}
                    >
                      {imageStatus[member.id]?.loaded ? (
                        <img
                          src={imageStatus[member.id].path}
                          alt={member.fullName}
                          className="board-img absolute inset-0 w-full h-full object-cover rounded-full z-[1] transition-transform duration-300 group-hover:scale-110"
                          loading="eager"
                        />
                      ) : (
                        <div className="board-img absolute inset-0 w-full h-full bg-gray-200 rounded-full z-[1] flex items-center justify-center">
                          <span className="animate-pulse">Loading...</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 group-hover:border-primary/30 transition-colors duration-300" />
                  </div>
                  <div className="mt-6 text-center">
                    <h3
                      className={`font-bold text-center capitalize mb-2 text-gray-900 ${
                        isMobile ? "text-lg" : "text-xl"
                      }`}
                    >
                      {member.fullName}
                    </h3>
                    <p
                      className={`text-gray-600 text-center ${
                        isMobile ? "text-sm" : "text-base"
                      }`}
                    >
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ContentContainer>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedMember(null)}
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative board-avatar rounded-full overflow-hidden w-32 h-32 md:w-44 md:h-44 shadow-xl">
                  {selectedMember && imageStatus[selectedMember.id]?.loaded ? (
                    <img
                      src={imageStatus[selectedMember.id].path}
                      alt={selectedMember.fullName}
                      className="board-img absolute inset-0 w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="board-img absolute inset-0 w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="animate-pulse">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedMember.fullName}
                </h3>
                <p className="text-lg text-primary mb-4">{selectedMember.role}</p>
                {selectedMember.bio && (
                  <p className="text-gray-600 mb-4">{selectedMember.bio}</p>
                )}
                {Object.entries(selectedMember.socialLinks).length > 0 && (
                  <div className="flex gap-4">
                    {Object.entries(selectedMember.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-primary transition-colors duration-300"
                      >
                        {platform === "linkedin" && "🔗"}
                        {platform === "twitter" && "🐦"}
                        {platform === "facebook" && "📘"}
                        {platform === "instagram" && "📸"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default BoardMembers;
