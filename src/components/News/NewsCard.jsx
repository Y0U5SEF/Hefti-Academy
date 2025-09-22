import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar, fr } from 'date-fns/locale';

const NewsCard = ({ article }) => {
  const { language } = useLanguage();
  
  // Format date based on language
  const formatDate = (dateStr) => {
    try {
      // Check if dateStr is valid
      if (!dateStr || typeof dateStr !== 'string') {
        console.warn('Invalid date string:', dateStr);
        return 'N/A';
      }

      // Parse date in M/D/YYYY format (from Google Sheets)
      const [month, day, year] = dateStr.split('/');
      
      // Create a valid date object (month is 0-indexed in JavaScript Date)
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Validate the date object
      if (isNaN(date.getTime())) {
        console.warn('Invalid date object created from:', dateStr);
        return 'N/A';
      }

      // Format as DD/MM/YYYY based on language
      const locales = { ar, fr, en: undefined };
      return format(date, 'dd/MM/yyyy', { locale: locales[language] });
    } catch (error) {
      console.error('Error formatting date:', error, dateStr);
      return 'N/A';
    }
  };

  // Get title in current language, fallback to Arabic
  const getTitle = () => {
    return article[`title_${language}`] || article.title_ar;
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: getTitle(),
        url: window.location.origin + `/${language}/news/${article.id}`,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/${language}/news/${article.id}`} className="block">
        <div className="relative h-48">
          <img
            src={`/images/news/${article.image_url}`}
            alt={getTitle()}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">
              {formatDate(article.published_date)}
            </span>
            <button
              onClick={handleShare}
              className="text-gray-500 hover:text-sky-500 transition-colors"
            >
              <i className="fi fi-rr-share text-lg"></i>
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-right">
            {getTitle()}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default NewsCard; 