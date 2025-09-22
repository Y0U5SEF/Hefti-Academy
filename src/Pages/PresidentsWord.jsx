import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  PageTitle,
  PageContainer,
  ContentContainer,
} from "../components/PageComponents";
import LoadingScreen from "../components/Loading/loading";

const SHEET_URL =
  "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/PresidentsWord";
const IMAGES_BASE_PATH = "/images/board/";

const SUPPORTED_LOCALES = {
  en: "Loading...",
  ar: "جاري التحميل...",
  fr: "Chargement...",
};

const PresidentsWord = () => {
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const res = await fetch(SHEET_URL);
        const json = await res.json();

        const activeRow = json.find(
          (row) => row.Active?.toLowerCase() === "true"
        );
        if (!activeRow) throw new Error("No active content found");

        setData(activeRow);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const getLocalized = (baseKey) =>
    data?.[`${baseKey}_${language}`] || data?.[`${baseKey}_en`] || "";

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

  if (!data) {
    return (
      <PageContainer>
        <PageTitle title="No content available" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle title={getLocalized("title")} />
      <ContentContainer>
        {data.image && (
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              <img
                src={`${IMAGES_BASE_PATH}${data.image}`}
                alt={getLocalized("title")}
                className="absolute inset-0 w-full h-full object-cover rounded-full shadow-lg border-4 border-slate-100"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = "/images/board/Placeholder.jpg";
                  e.currentTarget.classList.add("error-image");
                }}
              />
            </div>
            {(getLocalized("name") || getLocalized("role")) && (
              <div className="mt-4 text-center">
                {getLocalized("name") && (
                  <div className="text-xl uppercase text-primary font-semibold text-gray-900">
                    {getLocalized("name")}
                  </div>
                )}
                {getLocalized("role") && (
                  <div className="text-base text-gray-600">
                    {getLocalized("role")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: getLocalized("content"),
          }}
        />
      </ContentContainer>
    </PageContainer>
  );
};

export default PresidentsWord;
