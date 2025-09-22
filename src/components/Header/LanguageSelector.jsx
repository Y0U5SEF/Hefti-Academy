import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import useIsMobile from "../../components/isMobile"

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const languages = {
    ar: { name: 'العربية', dir: 'rtl' },
    en: { name: 'English', dir: 'ltr' },
    fr: { name: 'Français', dir: 'ltr' }
  };

  const handleLanguageChange = (code) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex font-normal items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${isMobile ? "bg-white/10" : "hover:bg-white/10"}`}
      >
        <Globe className="h-4 w-4" />
        <span className="font-normal text-sm">{languages[currentLanguage].name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          {Object.entries(languages).map(([code, { name, dir }]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`w-full font-normal text-left px-4 py-2 text-sm hover:bg-gray-100
                ${currentLanguage === code ? 'bg-gray-50 font-medium' : ''}
                ${code === 'ar' ? 'font-arabic' : ''}`}
              dir={dir}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;