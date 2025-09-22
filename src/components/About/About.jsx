import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { useLanguage } from "../../context/LanguageContext";
import "./About.css";
import athleteLeft from "../../assets/athleteLeft.webp";
import athleteCenter from "../../assets/athleteCenter.webp";
import athleteRight from "../../assets/athleteRight.webp";

const translations = {
  ar: {
    title: "أكاديمية هفتي لكرة القدم",
    description:
      "هفتي هي أكاديمية للتميز الرياضي تهدف إلى اكتشاف وتطوير المواهب وصناعة أجيال من الأبطال والقادة بهدف تمكينهم من تحقيق إنجازات وطنية وإقليمية وعالمية.",
    values: "قيمنا:",
    animatedValues: ["المسؤولية", "الاحترام", "التميز"],
  },
  en: {
    title: "Hefti Football Academy",
    description:
      "Hefti is an academy for sports excellence aimed at discovering and developing talents and creating generations of champions and leaders with the goal of enabling them to achieve national, regional and global achievements.",
    values: "Our Values:",
    animatedValues: ["Responsibility", "Respect", "Excellence"],
  },
  fr: {
    title: "Académie Hefti de Football",
    description:
      "Hefti est une académie d'excellence sportive visant à découvrir et développer les talents et à créer des générations de champions et de leaders dans le but de leur permettre de réaliser des succès nationaux, régionaux et mondiaux.",
    values: "Nos Valeurs:",
    animatedValues: ["Responsabilité", "Respect", "Excellence"],
  },
};

const AboutSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
    mass: 1.2
  });

  // Transform values based on scroll progress
  const textOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);
  const textY = useTransform(smoothProgress, [0, 0.2], [50, 0]);
  const shapesScale = useTransform(smoothProgress, [0.1, 0.5], [0, 1]);
  // const imagesOpacity = useTransform(smoothProgress, [0.3, 0.6], [0, 1]);

  // Image position transforms with smoother easing
  const leftImageX = useTransform(
    smoothProgress,
    [0.3, 0.6],
    [100, isMobile ? 50 : 90],
    { clamp: true }
  );
  const rightImageX = useTransform(
    smoothProgress,
    [0.3, 0.6],
    [-100, isMobile ? -50 : -90],
    { clamp: true }
  );
  const centerImageScale = useTransform(
    smoothProgress,
    [0, 1.5],
    [0.6, 1],
    { clamp: true }
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { language = "en", dir = "ltr" } = useLanguage() || {};
  const content = translations[language] || translations.en;
  const animationSequence = content.animatedValues.flatMap((value) => [
    value,
    2000,
  ]);

  return (
    <section
      ref={sectionRef}
      className="main-about min-h-[100vh] w-full snap-start bg-white flex flex-row items-center justify-center px-4 md:px-[0%] overflow-hidden"
    >
      <motion.div
        className={`w-full space-y-8 fade-in ${
          isMobile ? "p-0" : dir === "rtl" ? "pr-[5rem]" : "pl-[5rem]"
        }`}
        style={{
          opacity: textOpacity,
          y: textY,
          willChange: 'transform, opacity'
        }}
      >
        <h1
          className={`text-2xl md:text-4xl font-bold mb-6 text-blue-900 ${
            dir === "rtl" ? "text-right" : "text-left"
          }`}
        >
          {content.title}
        </h1>

        <p
          className={`text-justify w-[90%] text-base md:text-lg mb-8 leading-relaxed text-gray-700 ${
            dir === "rtl" ? "text-right" : "text-left"
          }`}
        >
          {content.description}
        </p>

        <div
          className={`flex ${
            isMobile ? "flex-col text-center" : "flex-row"
          } gap-[10px] space-y-4 font-semibold text-xl md:text-2xl ${
            isMobile
              ? "text-center"
              : dir === "rtl"
              ? "text-right"
              : "text-left"
          }`}
        >
          <h2 className="text-blue-900 m-0">{content.values}</h2>
          <TypeAnimation
            key={language}
            sequence={animationSequence}
            wrapper="div"
            speed={50}
            className="text-blue-600 m-0"
            repeat={Infinity}
          />
        </div>
      </motion.div>

      <motion.div className="force-ltr flex items-center justify-center w-full relative mt-8">
        <div className="relative shapes flex justify-center items-center">
          <motion.div
            className="shape shape1 origin-top"
            style={{ 
              scaleY: shapesScale,
              willChange: 'transform'
            }}
          />
          <motion.div
            className="shape shape2 origin-top"
            style={{ 
              scaleY: shapesScale,
              willChange: 'transform'
            }}
          />
          <motion.div
            className="shape shape3 origin-top"
            style={{ 
              scaleY: shapesScale,
              willChange: 'transform'
            }}
          />
          <div className="absolute images flex items-center justify-center">
            {[
              { src: athleteLeft, className: "athlete-left", x: leftImageX },
              {
                src: athleteCenter,
                className: "athlete-center",
                scale: centerImageScale,
              },
              { src: athleteRight, className: "athlete-right", x: rightImageX },
            ].map(({ src, className, x, scale }, index) => (
              <motion.img
                key={src}
                src={src}
                alt={`Athlete ${index + 1}`}
                className={`w-auto h-auto transition-transform duration-300 ${className} ${
                  index === 1 ? "z-2" : ""
                }`}
                style={{
                  x: index === 1 ? undefined : x, // Remove x for the center image
                  scale: index === 1 ? scale : undefined, // Apply scale for the center image
                  zIndex: index === 1 ? 2 : 1,
                }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
