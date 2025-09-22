// components/PageComponents.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import useIsMobile from "../components/isMobile";

export const PageTitle = ({ title, subtitle, className = "" }) => {
  const { dir } = useLanguage();

  return (
    <div className="page-title-cont flex justify-center max-w-full mx-auto py-[8rem] px-4 sm:px-6 lg:px-8">
      <div className="text-center" dir={dir}>
        <h1
          className={`select-none page-title relative text-4xl font-bold pb-[1.5rem] text-primary ${className}`}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-lg text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
};

export const PageContainer = ({ children }) => {
  return <div className="bg-gray-50">{children}</div>;
};

export const ContentContainer = ({ children }) => {
  const isMobile = useIsMobile();
  return (
    <div className="relative top-[-2rem] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div
        className={`bg-white shadow-md border-solid border-2 border-gray-200 rounded-lg text-justify ${
          isMobile ? "p-2" : "p-8"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
