import { useRef, useState, useEffect } from "react";
// import Header from "../components/Header/Header"; 
// import Footer from "../components/footer/footer";
import Slideshow from "../components/slideshow/slideshow";
import AboutSection from "../components/About/About";
import TestimonialsSection from "../components/Testimonials/Testimonials";
import TalentPathway from "../components/Home/TalentPathway";
import Sponsors from "../components/Sponsors/Sponsors";
import Partners from "../components/Partners/Partners";

function Home() {
  const headerRef = useRef(null);
  const [slideshowHeight, setSlideshowHeight] = useState("100vh");

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        setSlideshowHeight(`calc(100vh - ${headerHeight}px)`);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <>
      <div ref={headerRef} className="top-0 z-50">
        {/* <Header /> */}
      </div>
      <Slideshow showText={true} height={slideshowHeight} />
      <AboutSection />
      <TestimonialsSection />
      <TalentPathway />
      <Sponsors />
      <Partners />
      {/* <Footer /> */}
    </>
  );
}

export default Home;
