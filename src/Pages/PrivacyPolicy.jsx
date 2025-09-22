import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  PageTitle,
  PageContainer,
  ContentContainer,
} from "../components/PageComponents";
import LoadingScreen from "../components/Loading/loading";

const SHEET_URL =
  "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/PrivacyPolicy";

const SUPPORTED_LOCALES = {
  en: "Loading...",
  ar: "جاري التحميل...",
  fr: "Chargement...",
};

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const res = await fetch(SHEET_URL);
        const json = await res.json();

        // Sort sections by order
        const sortedSections = json.sort((a, b) => a.order - b.order);
        
        if (!sortedSections.length) throw new Error("No content found");

        setSections(sortedSections);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [language]);

  const getLocalizedContent = (section) => {
    return section[language] || section.en || "";
  };

  if (loading) {
    return (
      <LoadingScreen
        message={SUPPORTED_LOCALES[language] || SUPPORTED_LOCALES.en}
      />
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageTitle title={`Error: ${error}`} />
      </PageContainer>
    );
  }

  if (!sections.length) {
    return (
      <PageContainer>
        <PageTitle title="No content available" />
      </PageContainer>
    );
  }

  // Find title section
  const titleSection = sections.find(section => section.section === 'title');
  const title = titleSection ? getLocalizedContent(titleSection) : "Privacy Policy";

  return (
    <PageContainer>
      <PageTitle title={title} />
      <ContentContainer>
        <div className="prose max-w-none space-y-6">
          {sections
            .filter(section => section.section !== 'title')
            .map((section, index) => (
              <div 
                key={section.id || index}
                className="mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul>li]:text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: getLocalizedContent(section)
                }}
              />
            ))}
        </div>
      </ContentContainer>
    </PageContainer>
  );
};

export default PrivacyPolicy; 