import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLanguage } from "../../context/LanguageContext";
import './TalentPathway.css';

const COLORS = ["#4FC3F7", "#4DD0E1", "#FF7043", "#9C27B0"];

const StageBubble = ({ stage, ageRange, description, color, index, rtl }) => {
  const { ref, inView } = useInView({ 
    triggerOnce: false, 
    threshold: 0.2 
  });
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get the correct stage text based on language
  const getStageText = () => {
    switch(language) {
      case 'ar':
        return stage['Stage-ar'];
      case 'fr':
        return stage['Stage-fr'];
      default:
        return stage['Stageen'];
    }
  };

  const getInitialState = () => {
    if (isMobile) {
      return { opacity: 0, y: -100 };
    }
    return { 
      opacity: 0, 
      x: rtl ? 100 : -100 
    };
  };

  const getAnimateState = () => {
    if (isMobile) {
      return inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 };
    }
    return inView 
      ? { opacity: 1, x: 0 } 
      : { opacity: 0, x: rtl ? 100 : -100 };
  };

  return (
    <motion.div
      ref={ref}
      className={`stage-bubble stage-bubble-${index + 1}${rtl ? ' rtl' : ''}`}
      initial={getInitialState()}
      animate={getAnimateState()}
      transition={{ 
        duration: 0.8,
        delay: index * 0.15,
        type: "spring",
        stiffness: 50,
        damping: 15,
        mass: 1
      }}
      style={{ 
        background: color, 
        zIndex: 5 - index,
        willChange: 'transform, opacity'
      }}
    >
      <div className="stage-content">
        <span className="stage-number">0{index + 1}</span>
        <h2 className="stage-title">{getStageText()}</h2>
        <p className="stage-age">{ageRange}</p>
        {description && <p className="stage-desc">{description}</p>}
      </div>
    </motion.div>
  );
};

const TalentPathway = () => {
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dir } = useLanguage();

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/TalentPathway");
        if (!response.ok) {
          throw new Error('Failed to fetch talent pathway data');
        }
        const data = await response.json();
        // Sort data by Order to ensure correct sequence
        const sortedData = data.sort((a, b) => parseInt(a.Order) - parseInt(b.Order));
        setStages(sortedData);
      } catch (error) {
        console.error("Error fetching talent pathway data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();
  }, []);

  if (isLoading) {
    return <div className="talent-pathway-container loading">Loading...</div>;
  }

  if (error) {
    return <div className="talent-pathway-container error">Error: {error}</div>;
  }

  return (
    <div className={`talent-pathway-container${dir === 'rtl' ? ' rtl' : ''}`}> 
      {stages.map((stage, idx) => (
        <StageBubble
          key={stage.Order}
          stage={stage}
          ageRange={stage.AgeRange}
          color={COLORS[idx % COLORS.length]}
          index={idx}
          rtl={dir === 'rtl'}
        />
      ))}
    </div>
  );
};

export default TalentPathway;