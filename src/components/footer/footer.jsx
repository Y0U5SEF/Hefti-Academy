import React, { useState, useEffect } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
// import AtlantaSanad from "../../assets/AtlantaSanad_solid.svg";
import { useLanguage } from "../../context/LanguageContext";
import "./footer.css";

const translations = {
  en: {
    academy: "Hefti academy",
    companyName: "Company Name",
    description:
      "Creating innovative solutions for tomorrow's challenges. We're committed to excellence and dedicated success.",
    contactUs: "Contact Us",
    contactUsPage: "Contact Us",
    pages: "Pages",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    aboutUs: "About Us",
    copyright: "All rights reserved.",
  },
  ar: {
    academy: "أكاديمية هفتي",
    companyName: "اسم الشركة",
    description:
      "إنشاء حلول مبتكرة لتحديات الغد. نحن ملتزمون بالتميز والنجاح المخصص.",
    contactUs: "اتصل بنا",
    contactUsPage: "اتصل بنا",
    pages: "الصفحات",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    aboutUs: "معلومات عنا",
    copyright: "جميع الحقوق محفوظة",
  },
  fr: {
    academy: "Academie Hefti",
    companyName: "Nom de l'entreprise",
    description:
      "Créer des solutions innovantes pour les défis de demain. Nous sommes engagés envers l'excellence et le succès dédié.",
    contactUs: "Contactez-nous",
    contactUsPage: "Contactez-nous",
    pages: "Pages",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d'utilisation",
    aboutUs: "À propos de nous",
    copyright: "Tous droits réservés.",
  },
};

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    address: {
      en: "",
      fr: "",
      ar: "",
    },
  });

  // Fetch contact information from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/contact-info');
        const data = await response.json();
        if (data && data.length > 0) {
          const info = data[0];
          setContactInfo({
            phone: info.phone,
            email: info.Email,
            address: {
              en: info.Address,
              fr: info.Address,
              ar: info.Address,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching contact information:', error);
      }
    };

    fetchContactInfo();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">
              {t.companyName}
            </h3>
            <p className="text-sm">{t.description}</p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-pink-400 cursor-pointer" />
              <Linkedin className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">{t.contactUs}</h3>
            <ul className="footer-contact space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{contactInfo.address[language]}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="ltr text-sm">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="ltr text-sm">{contactInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Pages */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">{t.pages}</h3>
            <ul className="space-y-2">
              <li><a href={`/${language}/privacy-policy`} className="hover:underline">{t.privacyPolicy}</a></li>
              <li><a href={`/${language}/terms-of-service`} className="hover:underline">{t.termsOfService}</a></li>
              <li><a href={`/${language}/about-us`} className="hover:underline">{t.aboutUs}</a></li>
              <li><a href={`/${language}/contact`} className="hover:underline">{t.contactUsPage}</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primaryDark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col justify-center items-center">
            <div className="text-sm text-center">
              © {currentYear} {t.academy}. {t.copyright}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
