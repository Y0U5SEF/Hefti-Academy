import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../PageComponents";
import Hero from "./Hero";
import About from "./About";
import Programs from "./Programs";
import Partners from "../Partners/Partners";
import Gallery from "../Gallery/Gallery";
import PresidentWord from "../PresidentWord/PresidentWord";
import NewsSection from "../News/NewsSection";

const Home = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const translations = {
    about: {
      en: "About Us",
      fr: "À propos de nous",
      ar: "من نحن",
    },
    programs: {
      en: "Our Programs",
      fr: "Nos programmes",
      ar: "برامجنا",
    },
    gallery: {
      en: "Gallery",
      fr: "Galerie",
      ar: "معرض الصور",
    },
    presidentWord: {
      en: "President's Word",
      fr: "Mot du président",
      ar: "كلمة الرئيس",
    },
    sponsors: {
      en: "Our Sponsors",
      fr: "Nos sponsors",
      ar: "رعاة",
    },
  };

  return (
    <PageContainer>
      <Hero />
      <About />
      <Programs />
      <NewsSection />
      <Gallery />
      <PresidentWord />
      
      {/* Sponsors Section */}
      <div className="bg-sky-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            {translations.sponsors[language]}
          </h2>
          <Partners />
        </div>
      </div>
    </PageContainer>
  );
};

export default Home; 