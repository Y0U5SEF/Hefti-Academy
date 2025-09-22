import React, { useEffect, useState } from "react";
import "./Hero.css";

const Hero = () => {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  // Adjust these values to control the fade effect
  const scrollThreshold = 10; // Scroll position where the fade effect starts
  const fadeDistance = 10; // Distance over which the fade occurs after the threshold

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition <= scrollThreshold) {
        setScrollOpacity(1);
      } else {
        const fadeProgress = Math.min(
          1,
          (scrollPosition - scrollThreshold) / fadeDistance
        );
        const newOpacity = Math.max(0, 1 - fadeProgress);
        setScrollOpacity(newOpacity);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="Hero_section">
      <div className="Hero_Container">
        <div className="title">
          <div className="heading">
            Crafting Digital Experiences That Inspire
          </div>
          <div className="TypeAnimation">
            <div>Empowering your vision as a</div>
          </div>
          <button className="gradient-btn">Hire me</button>
          <a className="view_anchor" href="https://www.google.com/">
            <div className="circular">
              <svg
                className="tg-circle-text-path tg-animation-spin"
                viewBox="0 0 100 100"
                width="120"
                height="120"
              >
                <defs>
                  <path
                    id="circle"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  ></path>
                </defs>
                <text>
                  <textPath xlinkHref="#circle">
                    view portfolio • view portfolio •
                  </textPath>
                </text>
              </svg>
            </div>
          </a>
        </div>

        <div className="banner_images">
          <div className="right_image">
            <img
              className="banner_image"
              src="assets/images/05.jpg"
              alt=""
            />
          </div>
          <div className="left_image">
            <img
              className="banner_image"
              src="assets/images/13.jpg"
              alt=""
            />
          </div>
        </div>
        <span
          className="scroll-btn"
          style={{
            opacity: scrollOpacity,
            visibility: scrollOpacity === 0 ? "hidden" : "visible",
            transition: "opacity 0.3s ease, visibility 0.3s ease",
          }}
        >
          <a href="#">
            <span className="mouse">
              <span></span>
            </span>
          </a>
          <p>scroll me</p>
        </span>
      </div>
    </div>
  );
};

export default Hero;
