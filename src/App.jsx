import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import LoadingScreen from "./components/Loading/loading";
import Home from "./Pages/Home";
import PresidentsWord from "./Pages/PresidentsWord";
import BoardMembers from "./Pages/Board";
import Gallery from "./components/Gallery/Gallery";
import PlayerRegistration from "./Pages/PlayerRegistration";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import ContactUs from "./components/ContactUs/ContactUs";
import NotFound from "./Pages/NotFound";
import NewsArticle from "./components/News/NewsArticle";
import NewsPage from "./components/News/NewsPage";
import Standings from "./Pages/Standings";

import "./App.css";

// Component to detect browser language and redirect accordingly
const BrowserLanguageRedirect = () => {
  const [detectedLang, setDetectedLang] = useState(null);

  useEffect(() => {
    // Get browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const browserLangCode = browserLang.split('-')[0].toLowerCase();
    
    // Check if we support this language
    const validLanguages = ["en", "ar", "fr"];
    let targetLang = "en"; // Default to English
    
    if (browserLangCode === "ar") {
      targetLang = "ar";
    } else if (browserLangCode === "fr") {
      targetLang = "fr";
    }
    
    // Check if there's a stored preference that should override browser language
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang && validLanguages.includes(storedLang)) {
      targetLang = storedLang;
    }
    
    setDetectedLang(targetLang);
  }, []);

  // Wait until we've detected the language before redirecting
  if (!detectedLang) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <Navigate to={`/${detectedLang}`} replace />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <Layout>
            <Routes>
              {/* Redirect default route to detected browser language */}
              <Route path="/" element={<BrowserLanguageRedirect />} />
              {/* Language-specific routes */}
              <Route path="/:lang" element={<Home />} />
              <Route
                path="/:lang/presidents-word"
                element={<PresidentsWord />}
              />
              <Route path="/:lang/Board" element={<BoardMembers />} />
              <Route path="/:lang/gallery" element={<Gallery />} />
              <Route path="/:lang/player-registration" element={<PlayerRegistration />} />
              <Route path="/:lang/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/:lang/contact" element={<ContactUs />} />
              {/* News Routes */}
              <Route path="/:lang/news" element={<NewsPage />} />
              <Route path="/:lang/news/:id" element={<NewsArticle />} />
              {/* Standings Route */}
              <Route path="/:lang/standings" element={<Standings />} />
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          )}
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
