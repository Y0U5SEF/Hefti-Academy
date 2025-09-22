import React from 'react';
import Standings from '../components/Standings/Standings';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const StandingsPage = () => {
  const { language } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  
  const cautionTranslations = {
    en: "These standings are automatically calculated based on match results and may not reflect the official standings until confirmed by the regional league.",
    fr: "Ces classements sont calculés automatiquement sur la base des résultats des matchs et peuvent ne pas refléter les classements officiels jusqu'à confirmation par la ligue régionale.",
    ar: "يتم حساب هذه التصنيفات تلقائيًا بناءً على نتائج المباريات وقد لا تعكس التصنيفات الرسمية حتى يتم تأكيدها من قبل العصبة الجهوية."
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-4 flex justify-end">
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-md transition-colors duration-200 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <FiSun className="h-5 w-5" />
          ) : (
            <FiMoon className="h-5 w-5" />
          )}
        </button>
      </div>
      <Standings 
        sheetId="1DnLi1q25KLTjCzchi3uRMMEDJ3AQ2e__w9yVmF2WQbQ" 
        competitionId={1}
        showFilters={true}
        className="max-w-4xl mx-auto"
      />
      
      <div className="max-w-4xl mx-auto mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language !== 'ar' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-base text-yellow-700">
            {cautionTranslations[language]}
          </p>
          {language === 'ar' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingsPage;
