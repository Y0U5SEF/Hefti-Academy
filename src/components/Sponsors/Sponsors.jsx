import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Sponsors = () => {
  const { language } = useLanguage();

  const mainSponsor = {
    name: "AtlantaSanad Assurance",
    logo: "/assets/Atlanta-sanad.svg",
    website: "https://www.atlantasanad.ma/",
    description: {
      ar: "الراعي الرسمي الأول للأكاديمية منذ 2023",
      fr: "Le principal sponsor de l'Académie depuis 2023",
      en: "The main sponsor of the Academy since 2023"
    }
  };

  const localizedTexts = {
    title: {
      ar: "الراعي الرسمي",
      fr: "Sponsor Officiel",
      en: "Official Sponsor"
    },
    description: {
      ar: "نشكر راعينا الرئيسي على دعمه الكبير والمستمر",
      fr: "Nous remercions notre sponsor principal pour son soutien important et continu",
      en: "We thank our main sponsor for their significant and continued support"
    },
    visitWebsite: {
      ar: "زيارة الموقع",
      fr: "Visiter le Site",
      en: "Visit Website"
    }
  };

  return (
    <section className="py-20 bg-sky-500 relative">
      <div 
        className="absolute inset-0 overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-50"
          src="/images/AtlantaSanad.mp4"
        >
        </video>
      </div>
      <div className="absolute inset-0 bg-sky-500 opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {localizedTexts.title[language]}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {localizedTexts.description[language]}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-4 bg-sky-50 flex items-center justify-center">
                <a
                  href={mainSponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transform hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={mainSponsor.logo}
                    alt={mainSponsor.name}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </a>
              </div>
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {mainSponsor.name}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {mainSponsor.description[language]}
                </p>
                <a
                  href={mainSponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-300"
                >
                  <span className={language === 'ar' ? 'ml-2' : 'mr-2'}>
                    {localizedTexts.visitWebsite[language]}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sponsors; 