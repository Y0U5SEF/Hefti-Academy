import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const translations = {
    title: {
      en: "404 - Page Not Found",
      fr: "404 - Page Non Trouvée",
      ar: "404 - الصفحة غير موجودة",
    },
    message: {
      en: "Oops! The page you're looking for doesn't exist.",
      fr: "Oups ! La page que vous recherchez n'existe pas.",
      ar: "عذراً! الصفحة التي تبحث عنها غير موجودة.",
    },
    goHome: {
      en: "Go Home",
      fr: "Retour à l'accueil",
      ar: "العودة للرئيسية",
    },
  };

  const handleGoHome = () => {
    navigate(`/${language}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {translations.title[language]}
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          {translations.message[language]}
        </p>
        <button
          onClick={handleGoHome}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {translations.goHome[language]}
        </button>
      </div>
    </div>
  );
};

export default NotFound; 