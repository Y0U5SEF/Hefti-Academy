import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import "./Header.css";
import Logo from "/src/assets/hefti-dark.svg";
import MobileNav from "../Mobile/MobileNav";
import axios from "axios";

const SHEETS_API_URL = "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/NavigationMenu";

const registerButtonTexts = {
  ar: "سجل الآن",
  fr: "S'inscrire",
  en: "Register Now",
};

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await axios.get(SHEETS_API_URL);
        const data = response.data;
        // Filter active items and process the data
        const activeItems = data.filter(item => item.isActive === "TRUE");
        // Build menu hierarchy
        const buildMenu = (items, parentId = "") => {
          return items
            .filter(item => (item.parent_id || "") === parentId)
            .sort((a, b) => parseInt(a.order) - parseInt(b.order))
            .map(item => {
              const subItems = buildMenu(items, item.id);
              return {
                title: item[`title_${language}`] || item.title_en,
                link: item[`link_${language}`] || item.link_en || '#', // Provide default link value
                ...(subItems.length > 0 && { subMenu: subItems.map(subItem => ({
                  ...subItem,
                  link: subItem.link || '#' // Ensure all submenu items have links
                })) }),
                ...(item.icon && { icon: item.icon })
              };
            });
        };
        setMenuData(buildMenu(activeItems));
      } catch (error) {
        setMenuData([]); // fallback or show error
      }
    };
    fetchMenuData();
  }, [language]);

  const handleScroll = useCallback(() => {
    setIsSticky(window.scrollY >= 70);
  }, []);

  const handleNavClick = (e, href, isRoutePath = false) => {
    e.preventDefault();

    if (isRoutePath) {
      navigate(href);
      return;
    }

    // For anchor links (internal page navigation)
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const headerOffset = isSticky ? 80 : 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const isRoutePath = (path) => {
    return path && path.startsWith("/");
  };

  const toggleNav = () => setIsOpen(!isOpen);

  const closeNav = () => {
    setIsOpen(false);
    setOpenSubMenu(null);
  };

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <header className={`header ${isSticky ? "sticky" : ""} m-0 bg-primary`}>
        <div className="flex logo">
          <Link to="/" onClick={(e) => handleNavClick(e, "#Hero")}>
            <img className="HeftiLogo" src={Logo} alt="Logo" />
          </Link>
        </div>
        <nav className="Main_Nav">
          <ul className="text-white nav_list">
            {menuData.map((item, index) => (
              <li
                key={index}
                className={`text-base nav_item ${
                  item.subMenu ? "submenu_icon" : ""
                }`}
              >
                {isRoutePath(item.link) ? (
                  <Link
                    to={item.link}
                    onClick={(e) => handleNavClick(e, item.link, true)}
                    className="nav_link"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <a
                    href={`#${item.link}`}
                    onClick={(e) => handleNavClick(e, `#${item.link}`)}
                    className="nav_link"
                  >
                    {item.title}
                  </a>
                )}
                {item.subMenu && (
                  <>
                    <i className="arrow-ic fi fi-ss-angle-small-down"></i>
                    <ul className="bg-gray-100 min-w-48 overflow-hidden w-[max-content] text-black shadow-lg rounded dropdown">
                      {item.subMenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          {isRoutePath(subItem.link) ? (
                            <Link
                              to={subItem.link}
                              className="w-full text-sm block px-2 py-2.5 hover:bg-gray-200"
                              onClick={(e) =>
                                handleNavClick(e, subItem.link, true)
                              }
                            >
                              {subItem.title}
                            </Link>
                          ) : (
                            <a
                              href={`#${subItem.link}`}
                              onClick={(e) =>
                                handleNavClick(e, `#${subItem.link}`)
                              }
                            >
                              {subItem.title}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="register-btn font-medium text-white bg-yellow-400 hover:bg-yellow-500 rounded-full text-sm px-5 py-2.5 text-center dark:focus:ring-yellow-900"
            onClick={(e) => handleNavClick(e, `/${language}/player-registration`, true)}
          >
            {registerButtonTexts[language]}
          </button>
          <div className="hidden md:hidden lg:block">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={changeLanguage}
            />
          </div>
        </div>
        <button className="Mobile_nav_toggler" onClick={toggleNav}>
          <i className="fi fi-rs-bars-staggered"></i>
        </button>
      </header>

      <MobileNav
        isOpen={isOpen}
        toggleNav={toggleNav}
        closeNav={closeNav}
        openSubMenu={openSubMenu}
        toggleSubMenu={toggleSubMenu}
        menuData={menuData}
      />
    </>
  );
};

export default Header;
