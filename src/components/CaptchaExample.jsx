import React, { useState, useEffect, useRef } from "react";
// Import the default captcha font
import defaultCaptchaFont from '../fonts/captcha.ttf';

/**
 * Captcha Configuration
 * This configuration object makes it easy to customize the captcha appearance
 * To use a different font, simply update the font.url property with your font path
 */
const CAPTCHA_CONFIG = {
  // Font settings
  font: {
    family: 'CaptchaFont',    // Font family name to use in the canvas
    url: defaultCaptchaFont,  // Font file URL/path - change this to use a different font
    size: 35,                 // Font size in pixels
    fallback: 'Tahoma'        // Fallback font if custom font fails to load
  },
  // Character positioning
  position: {
    startX: 25,              // Starting X position for the first character
    spacing: 30,             // Space between characters
    startY: 30,              // Base Y position for characters
    yVariation: 5            // Random Y position variation (characters will be placed at startY ± yVariation)
  },
  // Character effects
  effects: {
    rotation: 0.4,           // Maximum rotation angle in radians (characters will be rotated between -rotation and +rotation)
    colorSaturation: 70,     // Color saturation percentage (0-100)
    colorLightness: 50       // Color lightness percentage (0-100)
  }
};

// Alert and RefreshIcon components remain the same
const Alert = ({ children, variant = "default" }) => (
  <div
    className={`p-4 rounded-lg ${
      variant === "error"
        ? "bg-red-100 text-red-800"
        : "bg-green-100 text-green-800"
    }`}
  >
    {children}
  </div>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9-9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const CaptchaComponent = () => {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("");
  const canvasRef = useRef(null);

  const generateCaptcha = () => {
    const chars = "2345678ADHKMXZ";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(captcha);
    renderCaptcha(captcha);
    setStatus("");
  };

  const renderCaptcha = (captcha) => {
    const canvas = canvasRef.current;
    // Set the actual canvas dimensions
    canvas.width = 200;
    canvas.height = 60;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add noise background
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
        Math.random() * 255
      },0.3)`;
      ctx.fill();
    }

    // Load and use the custom font
    const font = new FontFace(CAPTCHA_CONFIG.font.family, `url(${CAPTCHA_CONFIG.font.url})`);
    font.load().then(() => {
      // Draw text with custom font
      ctx.font = `${CAPTCHA_CONFIG.font.size}px ${CAPTCHA_CONFIG.font.family}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Draw each character with random effects
      for (let i = 0; i < captcha.length; i++) {
        const x = CAPTCHA_CONFIG.position.startX + (i * CAPTCHA_CONFIG.position.spacing);
        const y = CAPTCHA_CONFIG.position.startY + (Math.random() * CAPTCHA_CONFIG.position.yVariation * 2 - CAPTCHA_CONFIG.position.yVariation);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() * CAPTCHA_CONFIG.effects.rotation * 2 - CAPTCHA_CONFIG.effects.rotation));
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, ${CAPTCHA_CONFIG.effects.colorSaturation}%, ${CAPTCHA_CONFIG.effects.colorLightness}%)`;
        ctx.fillText(captcha[i], 0, 0);
        
        ctx.restore();
      }
    }).catch(err => {
      console.error('Error loading captcha font:', err);
      // Fallback to default font if custom font loading fails
      ctx.font = `${CAPTCHA_CONFIG.font.size}px ${CAPTCHA_CONFIG.font.fallback}`;
      
      // Draw each character with random effects using fallback font
      for (let i = 0; i < captcha.length; i++) {
        const x = CAPTCHA_CONFIG.position.startX + (i * CAPTCHA_CONFIG.position.spacing);
        const y = CAPTCHA_CONFIG.position.startY + (Math.random() * CAPTCHA_CONFIG.position.yVariation * 2 - CAPTCHA_CONFIG.position.yVariation);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() * CAPTCHA_CONFIG.effects.rotation * 2 - CAPTCHA_CONFIG.effects.rotation));
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, ${CAPTCHA_CONFIG.effects.colorSaturation}%, ${CAPTCHA_CONFIG.effects.colorLightness}%)`;
        ctx.fillText(captcha[i], 0, 0);
        
        ctx.restore();
      }
    });
  };

  const handleVerification = () => {
    if (userInput.toLowerCase() === captchaText.toLowerCase()) {
      setStatus("success");
      setTimeout(() => {
        generateCaptcha();
        setUserInput("");
      }, 1500);
    } else {
      setStatus("error");
      setTimeout(() => {
        generateCaptcha();
        setUserInput("");
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerification();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">CAPTCHA Verification</h2>

      <div className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="mx-auto h-[60px] w-[200px] border border-gray-200 rounded-lg bg-gray-50"
          />
          <button
            onClick={generateCaptcha}
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white/90 transition-colors"
            aria-label="Refresh CAPTCHA"
          >
            <RefreshIcon />
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter the code shown above"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            maxLength={6}
          />

          <button
            onClick={handleVerification}
            disabled={!userInput || status !== ""}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Verify
          </button>
        </div>

        {status && (
          <Alert variant={status === "success" ? "default" : "error"}>
            {status === "success"
              ? "CAPTCHA verified successfully!"
              : "Verification failed. Please try again."}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default CaptchaComponent;
