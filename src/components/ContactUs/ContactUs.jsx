import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import emailjs from '@emailjs/browser';
import {
  PageTitle,
  PageContainer,
  ContentContainer,
} from "../PageComponents";

const ContactUs = () => {
  const { language, changeLanguage } = useLanguage();
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prevLanguage = useRef(language);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
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

  // Update language when URL changes
  useEffect(() => {
    if (lang && lang !== language) {
      changeLanguage(lang);
    }
    // eslint-disable-next-line
  }, [lang]);

  // When language context changes (e.g. from header), update URL if needed
  useEffect(() => {
    if (prevLanguage.current !== language) {
      const pathParts = location.pathname.split("/");
      if (pathParts[1] !== language) {
        pathParts[1] = language;
        navigate(pathParts.join("/"), { replace: true });
      }
      prevLanguage.current = language;
    }
    // eslint-disable-next-line
  }, [language]);

  const translations = {
    title: {
      en: "Contact Us",
      fr: "Contactez-nous",
      ar: "اتصل بنا",
    },
    subtitle: {
      en: "Get in touch with us",
      fr: "Entrez en contact avec nous",
      ar: "تواصل معنا",
    },
    contactInfo: {
      en: "Contact Information",
      fr: "Informations de contact",
      ar: "معلومات الاتصال",
    },
    labels: {
      phone: {
        en: "Phone",
        fr: "Téléphone",
        ar: "الهاتف",
      },
      email: {
        en: "Email",
        fr: "Email",
        ar: "البريد الإلكتروني",
      },
      address: {
        en: "Address",
        fr: "Adresse",
        ar: "العنوان",
      },
    },
    sendMessage: {
      en: "Send Message",
      fr: "Envoyer un message",
      ar: "إرسال رسالة",
    },
    form: {
      name: {
        en: "Your Name",
        fr: "Votre nom",
        ar: "اسمك",
      },
      email: {
        en: "Your Email",
        fr: "Votre email",
        ar: "بريدك الإلكتروني",
      },
      subject: {
        en: "Subject",
        fr: "Sujet",
        ar: "الموضوع",
      },
      message: {
        en: "Your Message",
        fr: "Votre message",
        ar: "رسالتك",
      },
    },
    success: {
      en: "Message sent successfully!",
      fr: "Message envoyé avec succès!",
      ar: "تم إرسال الرسالة بنجاح!",
    },
    error: {
      en: "Error sending message. Please try again.",
      fr: "Erreur lors de l'envoi du message. Veuillez réessayer.",
      ar: "خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Format the data for the Google Sheet
      const formattedData = {
        timestamp: new Date().toISOString(),
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'New',
        language: language
      };

      // Send to Google Sheet
      const sheetResponse = await fetch('https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/Contact_Submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!sheetResponse.ok) {
        throw new Error('Failed to save to Google Sheet');
      }

      // Send email notification
      const emailParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: contactInfo.email, // Your email address from contact info
      };

      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        emailParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <PageContainer>
      <PageTitle title={translations.title[language]} />
      <ContentContainer>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 mb-12">
            {translations.subtitle[language]}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {translations.contactInfo[language]}
              </h2>
              
              <div className="space-y-6">
                {/* Phone */}
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fi fi-rr-phone-call text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{translations.labels.phone[language]}</p>
                    <a href={`tel:${contactInfo.phone}`} className="text-gray-900 hover:text-blue-600">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fi fi-rr-envelope text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{translations.labels.email[language]}</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-900 hover:text-blue-600">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fi fi-rr-marker text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{translations.labels.address[language]}</p>
                    <p className="text-gray-900">{contactInfo.address[language]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {translations.form.name[language]}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition placeholder-gray-400 text-gray-900 text-base py-2 px-3"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {translations.form.email[language]}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition placeholder-gray-400 text-gray-900 text-base py-2 px-3"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    {translations.form.subject[language]}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition placeholder-gray-400 text-gray-900 text-base py-2 px-3"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    {translations.form.message[language]}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition placeholder-gray-400 text-gray-900 text-base py-2 px-3"
                  />
                </div>

                {submitStatus && (
                  <div className={`p-4 rounded-md ${
                    submitStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}>
                    {translations[submitStatus][language]}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <i className="fi fi-rr-spinner animate-spin mr-2"></i>
                  ) : null}
                  {translations.sendMessage[language]}
                </button>
              </form>
            </div>
          </div>
        </div>
      </ContentContainer>
    </PageContainer>
  );
};

export default ContactUs; 