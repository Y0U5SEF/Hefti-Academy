// import React, { createContext, useState, useContext, useEffect } from 'react';
// export const LanguageContext = createContext({ language: 'en', dir: 'ltr' });
// export function LanguageProvider({ children }) {
//   const getInitialLanguage = () => {
//     const pathLang = window.location.pathname.split('/')[1];
//     const validLanguages = ['en', 'ar', 'fr'];
//     if (pathLang && validLanguages.includes(pathLang.toLowerCase())) {
//       localStorage.setItem('preferredLanguage', pathLang.toLowerCase());
//       return pathLang.toLowerCase();
//     }
//     return localStorage.getItem('preferredLanguage') || 'en';
//   };
//   const [language, setLanguage] = useState(getInitialLanguage());
//   const getDirection = (lang) => {
//     return lang === 'ar' ? 'rtl' : 'ltr';
//   };
//   const changeLanguage = (newLanguage) => {
//     setLanguage(newLanguage);
//     localStorage.setItem('preferredLanguage', newLanguage);
//     const pathParts = window.location.pathname.split('/');
//     pathParts[1] = newLanguage;
//     const newPath = pathParts.join('/');
//     window.history.pushState({}, '', newPath);
//   };
//   useEffect(() => {
//     const handleURLChange = () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const urlLang = urlParams.get('lang');
//       if (urlLang && urlLang.toLowerCase() !== language) {
//         const validLanguages = ['en', 'ar', 'fr'];
//         if (validLanguages.includes(urlLang.toLowerCase())) {
//           setLanguage(urlLang.toLowerCase());
//           localStorage.setItem('preferredLanguage', urlLang.toLowerCase());
//         }
//       }
//     };
//     window.addEventListener('popstate', handleURLChange);
//     handleURLChange();
//     return () => {
//       window.removeEventListener('popstate', handleURLChange);
//     };
//   }, [language]);
//   const value = {
//     language,
//     changeLanguage,
//     dir: getDirection(language),
//   };
//   return (
//     <LanguageContext.Provider value={value}>
//       {children}
//     </LanguageContext.Provider>
//   );
// }
// export function useLanguage() {
//   const context = useContext(LanguageContext);
//   if (context === undefined) {
//     throw new Error('useLanguage must be used within a LanguageProvider');
//   }
//   return context;
// }

// LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

export const LanguageContext = createContext({ language: "en", dir: "ltr" });

export function LanguageProvider({ children }) {
  const getInitialLanguage = () => {
    const validLanguages = ["en", "ar", "fr"];
    
    // First priority: Check URL path language
    const pathLang = window.location.pathname.split("/")[1];
    if (pathLang && validLanguages.includes(pathLang.toLowerCase())) {
      localStorage.setItem("preferredLanguage", pathLang.toLowerCase());
      return pathLang.toLowerCase();
    }
    
    // Second priority: Check localStorage
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang && validLanguages.includes(storedLang)) {
      return storedLang;
    }
    
    // Third priority: Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Extract the language code (e.g., 'en-US' -> 'en')
    const browserLangCode = browserLang.split('-')[0].toLowerCase();
    
    // Map browser language to our supported languages
    if (browserLangCode === 'ar') {
      localStorage.setItem("preferredLanguage", "ar");
      return "ar";
    } else if (browserLangCode === 'fr') {
      localStorage.setItem("preferredLanguage", "fr");
      return "fr";
    }
    
    // Default to English if no match
    localStorage.setItem("preferredLanguage", "en");
    return "en";
  };

  const [language, setLanguage] = useState(getInitialLanguage());

  const getDirection = (lang) => {
    return lang === "ar" ? "rtl" : "ltr";
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
    const pathParts = window.location.pathname.split("/");
    pathParts[1] = newLanguage;
    const newPath = pathParts.join("/");
    window.history.pushState({}, "", newPath);
  };

  useEffect(() => {
    const handleURLChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && urlLang.toLowerCase() !== language) {
        const validLanguages = ['en', 'ar', 'fr'];
        if (validLanguages.includes(urlLang.toLowerCase())) {
          setLanguage(urlLang.toLowerCase());
          localStorage.setItem('preferredLanguage', urlLang.toLowerCase());
        }
      }
    };

    window.addEventListener('popstate', handleURLChange);
    handleURLChange();
    return () => {
      window.removeEventListener('popstate', handleURLChange);
    };
  }, [language]);

  const value = {
    language,
    changeLanguage,
    dir: getDirection(language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
