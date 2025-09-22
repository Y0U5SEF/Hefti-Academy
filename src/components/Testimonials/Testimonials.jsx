import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./Testimonials.css";
import useIsMobile from "../../components/isMobile";
import { motion } from "framer-motion";
import pattern from "../../assets/pattern.svg";

const GOOGLE_SHEET_URL =
  "https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/Testimonials";
const IMAGE_BASE_PATH = "/images/";

const TestimonialsSection = () => {
  const isMobile = useIsMobile();
  const { language } = useLanguage(); // 'en', 'fr', or 'ar'
  const [state, setState] = useState({
    testimonials: [],
    status: "loading",
    error: null,
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(GOOGLE_SHEET_URL);
        const data = await res.json();

        const filtered = data
          .filter((item) => item.Active?.toLowerCase() === "true")
          .sort((a, b) => parseInt(a.Order || "0") - parseInt(b.Order || "0"));

        setState({
          testimonials: filtered,
          status: "success",
          error: null,
        });
      } catch (err) {
        setState({
          testimonials: [],
          status: "error",
          error: "Failed to load testimonials",
        });
      }
    };

    fetchTestimonials();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="min-h-[400px] grid place-items-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-[400px] grid place-items-center text-red-500">
        {state.error}
      </div>
    );  
  }

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="space-y-8">
          {state.testimonials.map((testimonial) => {
            const name = testimonial[`Name_${language}`] || testimonial.Name_en;
            const role = testimonial[`Role_${language}`] || testimonial.Role_en;
            const message = testimonial[`Message_${language}`] || testimonial.Message_en;
            const photoUrl = testimonial.Photo ? `${IMAGE_BASE_PATH}${testimonial.Photo}` : null;
            

            return (
              <div key={testimonial.id} className="transition-all">
                <div
                  className={`relative flex justify-around ${
                    isMobile
                      ? "gap-[3rem] flex-col items-center"
                      : "flex-row items-end"
                  }`}
                >
                  {photoUrl && (
                    <div className="avatar-parent flex flex-col items-center relative">
                      <motion.img
                        className="an-rotate absolute aspect-square w-80 right-0 top-0"
                        src={pattern}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 0.2, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ 
                          duration: 0.8,
                          delay: 0.5,
                          type: "spring",
                          stiffness: 50,
                          damping: 15
                        }}
                        viewport={{ margin: "-100px", amount: "some", once: true }}
                        style={{ willChange: 'transform, opacity' }}
                      />
                      <motion.div
                        className="rounded-full gradient-blue flex bottom-0 w-[23rem] h-[23rem]"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ 
                          duration: 0.8,
                          type: "spring",
                          stiffness: 50,
                          damping: 15
                        }}
                        viewport={{ margin: "-100px", amount: "some", once: true }}
                        style={{ willChange: 'transform, opacity' }}
                      />
                      <motion.div
                        className="rounded-full gradient-red flex top-[8rem] w-[20rem] h-[20rem]"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ 
                          duration: 0.8,
                          delay: 0.2,
                          type: "spring",
                          stiffness: 50,
                          damping: 15
                        }}
                        viewport={{ margin: "-100px", amount: "some", once: true }}
                        style={{ willChange: 'transform, opacity' }}
                      />
                      <motion.img
                        src={photoUrl}
                        alt={name}
                        className="testimonial-img z-10 aspect-square bottom-0 max-w-[400px] avatar object-cover"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.3,
                          type: "spring",
                          stiffness: 50,
                          damping: 15
                        }}
                        viewport={{ margin: "-100px", amount: "some", once: true }}
                        style={{ willChange: 'transform, opacity' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div
                    className={`flex flex-col items-start ${
                      isMobile ? "rounded bg-gray-100 p-6 m-0" : ""
                    }`}
                  >
                    <motion.div
                      className="testimonial-message relative text-lg md:text-xl text-gray-700 max-w-2xl mb-6"
                      initial={{ opacity: 0, y: -50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{
                        margin: "-100px",
                        once: true,
                        amount: "some",
                      }}
                    >
                      {message}
                    </motion.div>

                    <div className="testimonial-name">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        viewport={{
                          margin: "-100px",
                          once: true,
                          amount: "some",
                        }}
                        className="text-secondary font-semibold text-gray-900"
                      >
                        {name}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        viewport={{
                          margin: "-100px",
                          once: true,
                          amount: "some",
                        }}
                        className="text-sm text-gray-600"
                      >
                        {role}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
