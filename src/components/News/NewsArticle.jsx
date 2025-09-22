import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { ar, fr } from 'date-fns/locale';
import { fetchSheetData } from '../../utils/sheets';
import { PageContainer } from '../PageComponents';

// Dynamically import the NewsCard component
const NewsCard = lazy(() => import('./NewsCard'));

const NewsArticle = () => {
  // Use article ID from URL params
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await fetchSheetData('news');
        console.log('Fetched news data:', data); // Log the entire data
        
        // Extract the actual ID from the URL parameter
        const articleId = id.startsWith('article-') ? id.replace('article-', '') : id;
        console.log('Looking for article with ID:', articleId);
        
        // Find the article by exact string comparison
        const foundArticle = data.find(a => String(a.id) === String(articleId));
        console.log('Found article:', foundArticle ? 'Yes' : 'No');
        
        if (!foundArticle) {
          console.warn('Article not found with ID:', articleId);
          navigate('/404');
          return;
        }
        
        setArticle(foundArticle);
        
        // Get 4 random articles excluding the current one
        const otherArticles = data.filter(a => 
          String(a.id) !== String(articleId) && 
          (a.is_published === 'TRUE' || a.is_published === true)
        );
        
        // Shuffle and take up to 4 articles
        const shuffled = [...otherArticles].sort(() => 0.5 - Math.random());
        setRelatedArticles(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Error loading article:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, language, navigate]);

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

  const getTitle = () => {
    return article?.[`title_${language}`] || article?.title_ar;
  };

  const getContent = () => {
    return article?.[`content_${language}`] || article?.content_ar;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: getTitle(),
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!article) return null;

  return (
    <PageContainer>
      {/* Hero Section with Image and Gradient Overlay */}
      <div className="relative h-[60vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src={`/images/news/${article.image_url}`}
            alt={getTitle()}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative h-full flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-white text-center py-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-relaxed">
                {getTitle()}
              </h1>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center text-lg">
                  <i className={`fi fi-rr-calendar-lines ${language === 'ar' ? 'ml-2' : 'mr-2'}`}></i>
                  <span>{formatDate(article.published_date)}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-6 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  <i className={`fi fi-rr-share ${language === 'ar' ? 'ml-2' : 'mr-2'}`}></i>
                  <span>{language === 'ar' ? 'مشاركة' : language === 'fr' ? 'Partager' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto py-10 relative z-10 px-6 bg-white rounded-lg shadow-sm my-8">
          <img
            src={`/images/news/${article.image_url}`}
            alt={getTitle()}
            className="w-full h-auto rounded-lg shadow-md mb-8"
          />
          <div className="prose prose-lg max-w-none prose-headings:text-sky-700 prose-a:text-sky-600 text-justify">
            <div dangerouslySetInnerHTML={{ __html: getContent() }} />
          </div>
          
          {/* You might also like section */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                {language === 'ar' ? '\u0642\u062f \u064a\u0639\u062c\u0628\u0643 \u0623\u064a\u0636\u064b\u0627' : language === 'fr' ? 'Vous pourriez aussi aimer' : 'You might also like'}
              </h2>
              <div className="space-y-6">
                {relatedArticles.map(relatedArticle => (
                  <Suspense key={relatedArticle.id} fallback={
                    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden h-32 animate-pulse">
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-1/4 bg-gray-200"></div>
                        <div className="md:w-3/4 p-6">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                          <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  }>
                    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-1/4 relative">
                          <img
                            src={`/images/news/${relatedArticle.image_url}`}
                            alt={relatedArticle[`title_${language}`] || relatedArticle.title_ar}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="md:w-3/4 p-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">
                              {formatDate(relatedArticle.published_date)}
                            </span>
                          </div>
                          <a href={`/${language}/news/${relatedArticle.id}`} className="block">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-sky-600 transition-colors">
                              {relatedArticle[`title_${language}`] || relatedArticle.title_ar}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-1 mb-3">
                              {relatedArticle[`excerpt_${language}`]?.split(' ').slice(0, 20).join(' ') || 
                               relatedArticle[`content_${language}`]?.split(' ').slice(0, 20).join(' ') || 
                               relatedArticle.excerpt_ar?.split(' ').slice(0, 20).join(' ') || 
                               relatedArticle.content_ar?.split(' ').slice(0, 20).join(' ') || ''}
                              {((relatedArticle[`excerpt_${language}`]?.split(' ').length > 20) || 
                                (relatedArticle[`content_${language}`]?.split(' ').length > 20) || 
                                (relatedArticle.excerpt_ar?.split(' ').length > 20) || 
                                (relatedArticle.content_ar?.split(' ').length > 20)) && '...'}
                            </p>
                            <div className={`mt-auto ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                              <button className="inline-flex items-center px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                {language === 'ar' ? 'اقرأ المزيد' : language === 'fr' ? 'Lire plus' : 'Read More'}
                              </button>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </Suspense>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default NewsArticle;