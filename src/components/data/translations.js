// translations.js
import axios from 'axios';

const SHEETS_API_URL = "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/NavigationMenu";

export const fetchMenuData = async (language) => {
  try {
    const response = await axios.get(SHEETS_API_URL);
    const data = response.data;

    // Filter active items and process the data
    const activeItems = data.filter(item => item.isActive === "TRUE");
    
    // Build menu hierarchy
    const buildMenu = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .sort((a, b) => parseInt(a.order) - parseInt(b.order))
        .map(item => {
          const subItems = buildMenu(items, item.id);
          return {
            title: item[`title_${language}`] || item.title_en,
            link: item[`link_${language}`] || item.link_en,
            ...(subItems.length > 0 && { subMenu: subItems }),
            ...(item.icon && { icon: item.icon })
          };
        });
    };

    return buildMenu(activeItems);
  } catch (error) {
    console.error("Error fetching menu data:", error);
    // Return default menu data if API fails
    return getDefaultMenuData(language);
  }
};

// Default menu data in case API fails
const getDefaultMenuData = (language) => {
  const defaultMenu = {
    ar: [
      {
        title: "الرئيسية",
        link: "/ar",
      },
      {
        title: "الأكاديمية",
        link: "/ar/resume",
        subMenu: [
          { title: "كلمة الرئيس", link: "/ar/presidents-word" },
          { title: "مجلس الإدارة", link: "/ar/board" },
        ],
      },
      {
        title: "الفعاليات",
        link: "/ar/portfolio",
      },
      {
        title: "أخبار",
        link: "/ar/news",
      },
      {
        title: "تواصل معنا",
        link: "/ar/contact",
        subMenu: [
          { title: "فيسبوك", link: "/ar/facebook" },
          { title: "انستغرام", link: "/ar/instagram" },
          { title: "واتساب", link: "/ar/whatsapp" },
        ],
      },
    ],
    fr: [
      {
        title: "Accueil",
        link: "/fr",
      },
      {
        title: "L'Académie",
        link: "/fr/resume",
        subMenu: [
          { title: "Mot du Président", link: "/fr/presidents-word" },
          { title: "Conseil d'Administration", link: "/fr/board" },
        ],
      },
      {
        title: "Événements",
        link: "/fr/portfolio",
      },
      {
        title: "Actualités",
        link: "/fr/news",
      },
    ],
    en: [
      {
        title: "Home",
        link: "/en",
      },
      {
        title: "Academy",
        link: "/en/resume",
        subMenu: [
          { title: "President's Message", link: "/en/presidents-word" },
          { title: "Board of Directors", link: "/en/board" },
        ],
      },
      {
        title: "Events",
        link: "/en/portfolio",
      },
      {
        title: "News",
        link: "/en/news",
      },
      {
        title: "Contact Us",
        link: "/en/contact",
        subMenu: [
          { title: "Facebook", link: "/en/facebook" },
          { title: "Instagram", link: "/en/instagram" },
          { title: "WhatsApp", link: "/en/whatsapp" },
        ],
      },
    ],
  };

  return defaultMenu[language] || defaultMenu.en;
};

// Register button translations
export const registerButtonTexts = {
  ar: "سجل الآن",
  fr: "S'inscrire",
  en: "Register Now",
};

// Helper function to use in your navigation component
export const generateMenuLinks = (menuData, language) => {
  return menuData.map((item) => ({
    ...item,
    link: item.link.startsWith(`/${language}`)
      ? item.link
      : `/${language}${item.link}`,
    subMenu: item.subMenu?.map((subItem) => ({
      ...subItem,
      link: subItem.link.startsWith(`/${language}`)
        ? subItem.link
        : `/${language}${subItem.link}`,
    })),
  }));
};
