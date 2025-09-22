// import React, { useEffect, useLayoutEffect } from "react";
// import { useLanguage } from "../context/LanguageContext";

// const Layout = ({ children }) => {
//   const { dir, language } = useLanguage();

//   // Use useLayoutEffect to avoid flash of wrong direction
//   useLayoutEffect(() => {
//     // Update document direction and lang before render
//     document.documentElement.dir = dir;
//     document.documentElement.lang = language;
//   }, [dir, language]);

//   // Additional setup after render
//   useEffect(() => {
//     // Update viewport meta tag
//     const viewport = document.querySelector('meta[name="viewport"]');
//     if (viewport) {
//       viewport.setAttribute(
//         "content",
//         "width=device-width, initial-scale=1, shrink-to-fit=no"
//       );
//     }

//     // No cleanup needed for direction and lang as they should persist
//     return () => {
//       // Only clean up viewport if needed
//       if (viewport) {
//         viewport.setAttribute("content", "width=device-width, initial-scale=1");
//       }
//     };
//   }, [dir, language]);

//   return (
//     <div
//       dir={dir}
//       className={`
//         min-h-screen
//         flex
//         flex-col
//         ${dir === "rtl" ? "font-arabic" : "font-english"}
//         transition-all
//         duration-300
//         ${dir === "rtl" ? "text-right" : "text-left"}
//       `}
//     >
//       <div className="flex-1">{children}</div>
//     </div>
//   );
// };

// export default Layout;


import React, { useEffect, useLayoutEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header/Header";
import Footer from "../components/footer/footer";

const Layout = ({ children }) => {
  const { dir, language } = useLanguage();

  // Use useLayoutEffect to avoid flash of wrong direction
  useLayoutEffect(() => {
    // Update document direction and lang before render
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  // Additional setup after render
  useEffect(() => {
    // Update viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, shrink-to-fit=no"
      );
    }

    // No cleanup needed for direction and lang as they should persist
    return () => {
      // Only clean up viewport if needed
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1");
      }
    };
  }, [dir, language]);

  return (
    <div
      dir={dir}
      className={`
        min-h-screen
        flex
        flex-col
        ${dir === "rtl" ? "font-arabic" : "font-english"}
        transition-all
        duration-300
        ${dir === "rtl" ? "text-right" : "text-left"}
      `}
    >
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
