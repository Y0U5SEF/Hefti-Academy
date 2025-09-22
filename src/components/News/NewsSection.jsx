import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import NewsCard from './NewsCard';
import { fetchSheetData } from '../../utils/sheets';

const NewsSection = () => {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchSheetData('news');
        // Filter published articles and sort by date
        const publishedNews = data
          .filter(article => article && (article.is_published === 'TRUE' || article.is_published === true))
          .sort((a, b) => {
            const dateA = new Date(a.published_date.split('/').reverse().join('-'));
            const dateB = new Date(b.published_date.split('/').reverse().join('-'));
            return dateB - dateA;
          })
          .slice(0, 4); // Get latest 4 articles
        if (publishedNews && publishedNews.length > 0) {
          setNews(publishedNews);
        } else {
          console.warn('No published news articles found');
          setNews([]);
        }
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const translations = {
    title: {
      en: "Latest News",
      fr: "Dernières Nouvelles",
      ar: "آخر الأخبار",
    },
    viewAll: {
      en: "View All News",
      fr: "Voir Toutes les Nouvelles",
      ar: "عرض جميع الأخبار",
    },
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {translations.title[language]}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {news.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to={`/${language}/news`}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 transition-colors duration-300"
          >
            {translations.viewAll[language]}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsSection; 