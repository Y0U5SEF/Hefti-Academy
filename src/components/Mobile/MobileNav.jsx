import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../Header/LanguageSelector";
import "./MobileNav.css";
import { useNavigate } from "react-router-dom";

const MobileNav = ({
  toggleNav,
  isOpen,
  closeNav,
  openSubMenu,
  toggleSubMenu,
  menuData,
}) => {
  const { language, changeLanguage } = useLanguage();
  const [languageClass, setLanguageClass] = useState("");
  const navigate = useNavigate();

  const handleLanguageChange = (language) => {
    changeLanguage(language);
    if (language === "fr") {
      setLanguageClass("lang-fr");
    } else if (language === "ar") {
      setLanguageClass("lang-ar");
    } else {
      setLanguageClass("");
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const overlayClass = isOpen ? "overlay visible" : "overlay";
  const mobileNavClass = `mobile-nav-wrapper bg-primary ${
    isOpen ? "open" : ""
  } ${languageClass}`;

  return (
    <>
      <div className={overlayClass} onClick={closeNav}></div>
      <div className={mobileNavClass}>
        <div className="nav-header">
          <div className="flex items-center gap-4 w-full justify-between">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
            <div className="ribbon"></div>
            <button
              className="close-button"
              onClick={closeNav}
              aria-label="Close Navigation"
            >
              <i className="text-white fi fi-rs-cross"></i>
            </button>
          </div>
        </div>

        <div className="nav-container">
          <ul className="nav-menu">
            {menuData.map((item, index) => (
              <li
                key={index}
                className={`nav-item ${item.subMenu ? "has-children" : ""} ${
                  openSubMenu === index ? "open" : ""
                }`}
              >
                <div className="sub-menu-cont">
                  <a className="text-white" href={item.link}>
                    {item.title}
                  </a>
                  {item.subMenu && (
                    <button
                      className="sub-menu-toggle"
                      onClick={() => toggleSubMenu(index)}
                      aria-expanded={openSubMenu === index}
                      aria-label={`Toggle submenu for ${item.title}`}
                    >
                      <i className="text-white fi fi-rs-angle-small-down"></i>
                    </button>
                  )}
                </div>
                {item.subMenu && (
                  <ul className="sub-menu">
                    {item.subMenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <a className="text-sm text-white" href={subItem.link}>
                          {subItem.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* <div className="flex justify-center mb-8">
          <button
            type="button"
            className="register-btn font-medium text-white bg-yellow-400 hover:bg-yellow-500 rounded-full text-sm px-5 py-2.5 text-center dark:focus:ring-yellow-900"
            onClick={(e) => {
              e.preventDefault();
              closeNav();
              navigate(`/${language}/player-registration`);
            }}
          >
            {language === 'ar' ? 'سجل الآن' : language === 'fr' ? "S'inscrire" : 'Register Now'}
          </button>
        </div> */}

        <div className="social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Facebook"
          >
            <i className="fi fi-brands-facebook"></i>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Twitter"
          >
            <i className="fi fi-brands-twitter-alt"></i>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Instagram"
          >
            <i className="fi fi-brands-instagram"></i>
          </a>
        </div>
      </div>
    </>
  );
};

MobileNav.propTypes = {
  toggleNav: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  closeNav: PropTypes.func.isRequired,
  openSubMenu: PropTypes.number,
  toggleSubMenu: PropTypes.func.isRequired,
  menuData: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      subMenu: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          link: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default React.memo(MobileNav);
