import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { fetchSheetData } from '../../utils/sheets';
import { PageContainer } from '../PageComponents';
import useIsMobile from '../../components/isMobile';

// Dynamically import the NewsCard component
const NewsCard = lazy(() => import('./NewsCard'));

const NewsPage = () => {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchSheetData('news');
        console.log('Raw news data:', data); // Debug log

        // Filter published articles and sort by date
        const publishedNews = data
          .filter(article => article && (article.is_published === 'TRUE' || article.is_published === true))
          .sort((a, b) => {
            // Parse dates in M/D/YYYY format
            const parseDate = (dateStr) => {
              if (!dateStr || typeof dateStr !== 'string') return new Date(0); // Invalid date
              
              // Split the date string by '/' and create a new Date object
              const [month, day, year] = dateStr.split('/');
              return new Date(year, month - 1, day); // month is 0-indexed in JS Date
            };
            
            const dateA = parseDate(a.published_date);
            const dateB = parseDate(b.published_date);
            return dateB - dateA; // Sort descending (newest first)
          });
        
        console.log('Filtered news:', publishedNews); // Debug log
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
      en: "News & Updates",
      fr: "Actualités et Mises à jour",
      ar: "الأخبار والتحديثات",
    },
    subtitle: {
      en: "Stay updated with the latest news and events from our academy.",
      fr: "Restez à jour avec les dernières nouvelles et événements de notre académie.",
      ar: "ابق على اطلاع بأحدث الأخبار والفعاليات من أكاديميتنا.",
    },
    latestNews: {
      en: "Latest Articles",
      fr: "Derniers Articles",
      ar: "أحدث المقالات",
    },
    noNews: {
      en: "No news articles available.",
      fr: "Aucun article d'actualité disponible.",
      ar: "لا توجد مقالات إخبارية متاحة."
    },
    checkBackLater: {
      en: "Please check back later.",
      fr: "Veuillez vérifier ultérieurement.",
      ar: "يرجى التحقق لاحقاً."
    },
    articleCount: {
      en: {
        single: "article",
        plural: "articles"
      },
      fr: {
        single: "article",
        plural: "articles"
      },
      ar: {
        single: "مقال",
        plural: "مقالات"
      }
    },
  };

  // Custom container without the negative top margin
  const NewsContainer = ({ children }) => {
    const isMobile = useIsMobile();
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className={`bg-white shadow-md border-solid border-2 border-gray-200 rounded-lg text-justify ${isMobile ? 'p-2' : 'p-8'}`}>
          {children}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <NewsContainer>
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
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
        </NewsContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* News content */}
      <NewsContainer>
        <div className="max-w-7xl mx-auto bg-white">
          {news.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-gray-100">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-lg font-medium">{translations.noNews?.[language] || translations.noNews.en}</p>
              <p className="text-sm text-gray-400 mt-2">{translations.checkBackLater?.[language] || translations.checkBackLater.en}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {translations.latestNews?.[language] || 'Latest Articles'}
                </h2>
                <div className="text-sm text-gray-500">
                  {news.length} {news.length === 1 ? translations.articleCount[language].single : translations.articleCount[language].plural}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map(article => (
                  <Suspense key={article.id} fallback={<div className="bg-white rounded-lg shadow-lg overflow-hidden h-64 animate-pulse"></div>}>
                    <NewsCard article={article} />
                  </Suspense>
                ))}
              </div>
            </>
          )}
        </div>
      </NewsContainer>
    </PageContainer>
  );
};

export default NewsPage;