import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  PageTitle,
  PageContainer,
  ContentContainer,
} from "../components/PageComponents";
import fontkit from '@pdf-lib/fontkit';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
// Import removed as we're using a custom layout

// Import font files as URL assets
import arialFontUrl from '../Fonts/arial.ttf';
import arialBoldFontUrl from '../Fonts/arialbd.ttf';
import segoeUISymbolFontUrl from '../fonts/seguisym.ttf';
import captchaFontUrl from '../fonts/captcha.ttf';

// Import template images
// Adult templates
import adultPage1Template from '/images/docs/J5-Adult-page-001.jpg';
import adultPage2Template from '/images/docs/J5-Adult-page-002.jpg';
// Minor templates
import minorPage1Template from '/images/docs/J6-minor-page-001.jpg';
import minorPage2Template from '/images/docs/J6-minor-page-002.jpg';

// Field positions for PDF generation
const ArFontSize = 18;

// Hardcoded values for club, club number, league, and league number
const hardcodedValues = {
  club: "AHFA",
  clubNumber: "1020",
  league: "LRDTF",
  leagueNumber: "02",
};
const fieldPositions = {
  // Adult template positions
  adult: {
    // Page 1 fields
    firstNameAr: { x: 117, y: 223, isArabic: true, isBold: true, fontSize: ArFontSize },
    lastNameAr: { x: 105, y: 245, isArabic: true, isBold: true, fontSize: ArFontSize },
    firstName: { x: 122, y: 220, isBold: true, fontSize: 13, upper: true },
    lastName: { x: 115, y: 243, isBold: true, fontSize: 13, upper: true },
    dateOfBirth: { x: 131, y: 264, isBold: true, fontSize: 14, letterSpacing: 13 },
    placeOfBirthAr: { x: 490, y: 267, isArabic: true, isBold: true, fontSize: ArFontSize },
    nationalId: { x: 327, y: 290, isBold: true, fontSize: 13, upper: true, letterSpacing: 10 },
      
    // Hardcoded fields
    club: { x: 407, y: 175, isBold: true, fontSize: 13, upper: true, hardcoded: true },
    clubNumber: { x: 288, y: 175, isBold: true, fontSize: 13, hardcoded: true, letterSpacing: 10 },
    league: { x: 138, y: 175, isBold: true, fontSize: 13, upper: true, hardcoded: true, letterSpacing: 3 },
    leagueNumber: { x: 22, y: 175, isBold: true, fontSize: 13, hardcoded: true, letterSpacing: 20 },
    
    // Page 2 fields
    email: { x: 400, y: 210 },
    
    // Checkboxes
    // You can use any symbol from Segoe UI Symbol font by specifying the Unicode character
    // Examples: ✓✔ (checkmark), ✗✘ (cross), ● (bullet), ◆ (diamond), etc.
    checkbox1: { x: 553, y: 395, isBold: true, checked: true, symbol: '✔' }, // Default checkmark symbol
  },

  // Minor template positions
  minor: {
    // Guardian fields (Page 1)
    guardianFirstNameAr: { x: 115, y: 238, isArabic: true, isBold: true, fontSize: ArFontSize },
    guardianLastNameAr: { x: 105, y: 260, isArabic: true, isBold: true, fontSize: ArFontSize },
    guardianFirstName: { x: 122, y: 235, isBold: true, fontSize: 13, upper: true },
    guardianLastName: { x: 115, y: 258, isBold: true, fontSize: 13, upper: true },
    guardianDateOfBirth: { x: 131, y: 279, isBold: true, fontSize: 14, letterSpacing: 13 },
    guardianPlaceOfBirthAr: { x: 497, y: 282, isArabic: true, isBold: true, fontSize: ArFontSize },
    
    // Hardcoded fields for minor template (Page 1)
    club: { x: 407, y: 188, isBold: true, fontSize: 13, upper: true, hardcoded: true },
    clubNumber: { x: 275, y: 188, isBold: true, fontSize: 13, hardcoded: true, letterSpacing: 13 },
    league: { x: 138, y: 188, isBold: true, fontSize: 13, upper: true, hardcoded: true, letterSpacing: 3 },
    leagueNumber: { x: 22, y: 188, isBold: true, fontSize: 13, hardcoded: true, letterSpacing: 20 },
    
    // Minor fields (Page 1)
    minorFirstNameAr: { x: 115, y: 370, isArabic: true, isBold: true, fontSize: ArFontSize },
    minorLastNameAr: { x: 332, y: 370, isArabic: true, isBold: true, fontSize: ArFontSize },
    minorFirstName: { x: 122, y: 135, isBold: true, fontSize: 13, upper: true },
    minorLastName: { x: 115, y: 158, isBold: true, fontSize: 13, upper: true },
    minorDateOfBirth: { x: 133, y: 387, isBold: true, fontSize: 14, letterSpacing: 13 },
    minorPlaceOfBirthAr: { x: 484, y: 391, isArabic: true, isBold: true, fontSize: ArFontSize },
    birthCertificateNumber: { x: 405, y: 411, isBold:true, fontSize: 14 },
    
    // Guardian fields on Page 1
    guardianNationalId: { x: 326, y: 305, isBold: true, fontSize: 13, upper: true, letterSpacing: 10 },
    
    // Fields remaining on Page 2
    guardianPhone: { x: 400, y: 300, fontSize: 12, page: 2 },

    // checkboxes for kinship on page 1 (for minors)
    fatherCheckbox: { x: 372, y: 325, isBold: true, symbol: '✔' },
    motherCheckbox: { x: 301, y: 325, isBold: true, symbol: '✔' },
    brotherCheckbox: { x: 229, y: 325, isBold: true, symbol: '✔' },
    
    // Position for the 'other' kinship text when specified
    otherKinshipText: { x: 457, y: 328, isBold: true, isArabic: true, fontSize: ArFontSize }
  }
};

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

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Caught error:', error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700">{error?.message || 'An error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Add import for the image at the top with other imports
import deflatedFootball from '/assets/deflated-football.png';

const RegistrationClosed = ({ language }) => {
  const messages = {
    ar: "عذراً، التسجيل غير متاح حالياً.\nسيتم فتح التسجيل عند بدء الموسم القادم.",
    fr: "Désolé, l'inscription n'est pas disponible pour le moment.\nElle sera ouverte au début de la prochaine saison.",
    en: "Sorry, registration is currently not available.\nIt will open when the next season begins."
  };

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <img 
          src={deflatedFootball} 
          alt="Registration Closed" 
          className="mx-auto w-32 h-32 object-contain"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 whitespace-pre-line">
        {messages[language] || messages.en}
      </h2>
    </div>
  );
};

// Add ArabicKeyboard component before PlayerRegistration
const ArabicKeyboard = ({ onInputChange, onClose }) => {
  const [input, setInput] = useState('');
  const [layoutName, setLayoutName] = useState('default');
  const keyboardRef = useRef();

  const onChange = (input) => {
    setInput(input);
    onInputChange(input);
  };

  const onKeyPress = (button) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
    }
  };

  // Define the Arabic keyboard layout
  const layout = {
    default: [
      'ذ 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
      '{tab} ض ص ث ق ف غ ع ه خ ح ج د {enter}',
      '{lock} ش س ي ب ل ا ت ن م ك ط {shift}',
      '{shift} ئ ء ؤ ر لا ى ة و ز ظ {shift}',
      '{space}'
    ],
    shift: [
      'ّ ! @ # $ % ^ & * ( ) _ + {bksp}',
      '{tab} َ ً ُ ٌ ِ ٍ ّ ّ ّ ّ > < {enter}',
      '{lock} ّ ّ ّ ّ ّ آ ّ ّ ّ : " {shift}',
      '{shift} ّ ّ ّ ّ ّ ّ ّ , . ؟ {shift}',
      '{space}'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Arabic Keyboard</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
            dir="rtl"
          />
        </div>
        <Keyboard
          keyboardRef={r => (keyboardRef.current = r)}
          layoutName={layoutName}
          layout={layout}
          onChange={onChange}
          onKeyPress={onKeyPress}
          theme="hg-theme-default"
          display={{
            '{shift}': '⇧',
            '{lock}': '⇪',
            '{enter}': '↵',
            '{bksp}': '⌫',
            '{space}': ' ',
            '{tab}': '⇥'
          }}
          buttonTheme={[
            {
              class: "special-key",
              buttons: "{shift} {lock} {enter} {bksp} {tab}"
            }
          ]}
        />
      </div>
    </div>
  );
};

// Captcha Configuration
const CAPTCHA_CONFIG = {
  // Font settings
  font: {
    family: 'CaptchaFont', // Change this to your new font family name
    url: captchaFontUrl,   // Change this to your new font URL
    size: 35,              // Adjust font size as needed
    fallback: 'Tahoma'     // Fallback font if custom font fails to load
  },
  // Character positioning
  position: {
    startX: 25,           // Starting X position (adjust to center the text)
    spacing: 30,          // Space between characters
    startY: 30,           // Starting Y position
    yVariation: 5         // Random Y position variation
  },
  // Character effects
  effects: {
    rotation: 0.4,        // Maximum rotation angle in radians
    colorSaturation: 70,  // Color saturation percentage
    colorLightness: 50    // Color lightness percentage
  }
};

// Form field translations
const translations = {
  // Page title
  pageTitle: {
    en: 'Academy enrollment',
    fr: 'Inscription à l\'Académie',
    ar: 'التسجيل في الأكاديمية'
  },
  // Personal Information
  firstNameArabic: {
    en: 'First Name (Arabic)',
    fr: 'Prénom (Arabe)',
    ar: 'الاسم الأول (بالعربية)'
  },
  lastNameArabic: {
    en: 'Last Name (Arabic)',
    fr: 'Nom de famille (Arabe)',
    ar: 'اسم العائلة (بالعربية)'
  },
  firstName: {
    en: 'First Name',
    fr: 'Prénom',
    ar: 'الاسم الأول'
  },
  lastName: {
    en: 'Last Name',
    fr: 'Nom de famille',
    ar: 'اسم العائلة'
  },
  dateOfBirth: {
    en: 'Date of Birth',
    fr: 'Date de naissance',
    ar: 'تاريخ الميلاد'
  },
  cityArabic: {
    en: 'City (Arabic)',
    fr: 'Ville (Arabe)',
    ar: 'المدينة (بالعربية)'
  },
  age: {
    en: 'Age',
    fr: 'Âge',
    ar: 'العمر'
  },
  years: {
    en: 'years',
    fr: 'ans',
    ar: 'سنوات'
  },
  
  // Adult Information
  nationalId: {
    en: 'National ID',
    fr: 'Carte d\'identité nationale',
    ar: 'رقم الهوية الوطنية'
  },
  email: {
    en: 'Email (Optional)',
    fr: 'Email (Facultatif)',
    ar: 'البريد الإلكتروني (اختياري)'
  },
  
  // Guardian Information
  guardianFirstNameArabic: {
    en: 'Guardian First Name (Arabic)',
    fr: 'Prénom du tuteur (Arabe)',
    ar: 'الاسم الأول للوصي (بالعربية)'
  },
  guardianLastNameArabic: {
    en: 'Guardian Last Name (Arabic)',
    fr: 'Nom de famille du tuteur (Arabe)',
    ar: 'اسم عائلة الوصي (بالعربية)'
  },
  guardianFirstName: {
    en: 'Guardian First Name',
    fr: 'Prénom du tuteur',
    ar: 'الاسم الأول للوصي'
  },
  guardianLastName: {
    en: 'Guardian Last Name',
    fr: 'Nom de famille du tuteur',
    ar: 'اسم عائلة الوصي'
  },
  guardianDateOfBirth: {
    en: 'Guardian Date of Birth',
    fr: 'Date de naissance du tuteur',
    ar: 'تاريخ ميلاد الوصي'
  },
  guardianCityArabic: {
    en: 'Guardian\'s City (Arabic)',
    fr: 'Ville du tuteur (Arabe)',
    ar: 'مدينة الوصي (بالعربية)'
  },
  guardianPhone: {
    en: 'Guardian Phone Number',
    fr: 'Numéro de téléphone du tuteur',
    ar: 'رقم هاتف الوصي'
  },
  guardianNationalId: {
    en: 'Guardian National ID',
    fr: 'Carte d\'identité nationale du tuteur',
    ar: 'رقم الهوية الوطنية للوصي'
  },
  birthCertificateNumber: {
    en: 'Birth Certificate Number',
    fr: 'Numéro de certificat de naissance',
    ar: 'رقم شهادة الميلاد'
  },
  
  // Kinship
  kinship: {
    en: 'Kinship',
    fr: 'Parenté',
    ar: 'صلة القرابة'
  },
  father: {
    en: 'Father',
    fr: 'Père',
    ar: 'الأب'
  },
  mother: {
    en: 'Mother',
    fr: 'Mère',
    ar: 'الأم'
  },
  brother: {
    en: 'Brother',
    fr: 'Frère',
    ar: 'الأخ'
  },
  other: {
    en: 'Other',
    fr: 'Autre',
    ar: 'أخرى'
  },
  pleaseSpecify: {
    en: 'Please specify',
    fr: 'Veuillez préciser',
    ar: 'يرجى التحديد'
  },
  
  // Captcha
  captchaVerification: {
    en: 'Captcha Verification',
    fr: 'Vérification Captcha',
    ar: 'التحقق من كابتشا'
  },
  enterCode: {
    en: 'Enter the code shown above',
    fr: 'Entrez le code affiché ci-dessus',
    ar: 'أدخل الرمز الموضح أعلاه'
  },
  
  // Success page
  downloadRegistration: {
    en: 'Download Registration Documents',
    fr: 'Télécharger les documents d\'inscription',
    ar: 'تنزيل مستندات التسجيل'
  },
  registrationSuccess: {
    en: 'Your registration has been submitted successfully!',
    fr: 'Votre inscription a été soumise avec succès!',
    ar: 'تم تقديم تسجيلك بنجاح!'
  },
  downloadForm: {
    en: 'Download Registration Form',
    fr: 'Télécharger le formulaire d\'inscription',
    ar: 'تنزيل نموذج التسجيل'
  },
  downloadAdditional: {
    en: 'Download Additional Document',
    fr: 'Télécharger le document supplémentaire',
    ar: 'تنزيل المستند الإضافي'
  },
  
  // Section titles
  personalInformation: {
    en: 'Personal Information',
    fr: 'Informations personnelles',
    ar: 'المعلومات الشخصية'
  },
  adultInformation: {
    en: 'Adult Information',
    fr: 'Informations adulte',
    ar: 'معلومات البالغ'
  },
  guardianInformation: {
    en: 'Guardian Information',
    fr: 'Informations du tuteur',
    ar: 'معلومات الوصي'
  },
  
  // Step labels
  step1: {
    en: 'Personal Info',
    fr: 'Informations Personnelles',
    ar: 'المعلومات الشخصية'
  },
  step2: {
    en: 'Verification',
    fr: 'Vérification',
    ar: 'التحقق'
  },
  step3: {
    en: 'Download PDF',
    fr: 'Télécharger PDF',
    ar: 'تحميل PDF'
  },
  
  // Form buttons
  previous: {
    en: 'Previous',
    fr: 'Précédent',
    ar: 'السابق'
  },
  next: {
    en: 'Next',
    fr: 'Suivant',
    ar: 'التالي'
  },
  submit: {
    en: 'Submit Registration',
    fr: 'Soumettre l\'inscription',
    ar: 'تقديم التسجيل'
  },
  submitting: {
    en: 'Submitting...',
    fr: 'Soumission...',
    ar: 'جاري التقديم...'
  }
};

const PlayerRegistration = () => {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [isAdult, setIsAdult] = useState(true);
  const [kinship, setKinship] = useState('father');
  const [otherKinship, setOtherKinship] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [additionalPdfUrl, setAdditionalPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isRegistrationActive, setIsRegistrationActive] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeArabicField, setActiveArabicField] = useState(null);
  
  // Get current language from URL path
  const getCurrentLanguage = () => {
    const path = window.location.pathname;
    if (path.startsWith('/ar/')) return 'arabic';
    if (path.startsWith('/fr/')) return 'french';
    return 'english'; // Default to English
  };
  
  const currentLanguage = getCurrentLanguage();
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstNameAr: '',
    lastNameAr: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    cityAr: '',
    nationalId: '',
    phone: '',
    email: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianFirstNameAr: '',
    guardianLastNameAr: '',
    guardianDateOfBirth: '',
    guardianAge: '',
    guardianCityAr: '',
    guardianPhone: '',
    guardianNationalId: '',
    birthCertificateNumber: '',
    minorFirstName: '',
    minorLastName: '',
    minorFirstNameAr: '',
    minorLastNameAr: '',
    minorDateOfBirth: '',
    minorAge: '',
    minorCityAr: '',
  });

  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const canvasRef = useRef(null);

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Generate captcha when step changes to 2
  useEffect(() => {
    if (step === 2) {
      generateCaptcha();
    }
  }, [step]);

  // Calculate age from date of birth with error handling
  const calculateAge = (dateString) => {
    if (!dateString) return 0;
    try {
      const today = new Date();
      const birthDate = new Date(dateString);
      if (isNaN(birthDate.getTime())) return 0;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (err) {
      console.error('Error calculating age:', err);
      return 0;
    }
  };

  const handleDateChange = (e, isGuardian = false) => {
    const { value } = e.target;
    const age = calculateAge(value);
    
    if (isGuardian) {
      setFormData(prev => ({
        ...prev,
        guardianDateOfBirth: value,
        guardianAge: age
      }));
    } else {
      // For the person being registered
      if (age >= 18) {
        // Adult
        setIsAdult(true);
        setFormData(prev => ({
          ...prev,
          dateOfBirth: value,
          age: age,
          // Clear minor fields when switching to adult
          minorFirstName: '',
          minorLastName: '',
          minorFirstNameAr: '',
          minorLastNameAr: '',
          minorDateOfBirth: '',
          minorAge: '',
          minorCityAr: ''
        }));
      } else {
        // Minor - copy personal info to minor fields
        setIsAdult(false);
        setFormData(prev => ({
          ...prev,
          dateOfBirth: value,
          age: age,
          // Copy personal info to minor fields
          minorFirstName: prev.firstName,
          minorLastName: prev.lastName,
          minorFirstNameAr: prev.firstNameAr,
          minorLastNameAr: prev.lastNameAr,
          minorDateOfBirth: value,
          minorAge: age,
          minorCityAr: prev.cityAr
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    
    // Reset city selection when region changes
    if (name === 'cityAr') {
      newFormData.cityAr = value;
      // If minor, also update minor city
      if (!isAdult) {
        newFormData.minorCityAr = value;
      }
    } else if (name === 'guardianCityAr') {
      newFormData.guardianCityAr = value;
    } else if (name === 'minorCityAr') {
      newFormData.minorCityAr = value;
    }
    
    // If minor and updating personal info, sync to minor fields
    if (!isAdult) {
      if (name === 'firstName') {
        newFormData.minorFirstName = value;
      } else if (name === 'lastName') {
        newFormData.minorLastName = value;
      } else if (name === 'firstNameAr') {
        newFormData.minorFirstNameAr = value;
      } else if (name === 'lastNameAr') {
        newFormData.minorLastNameAr = value;
      }
    }
    
    setFormData(newFormData);
  };

  const generateCaptcha = () => {
    const chars = "2345678ADHKMXZ";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(captcha);
    // Ensure the captcha text is set before rendering
    setTimeout(() => {
      renderCaptcha(captcha);
    }, 0);
  };

  const renderCaptcha = (captcha) => {
    // Use setTimeout to ensure the canvas is available in the DOM
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      canvas.width = 200;
      canvas.height = 60;
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

      // Draw text
      ctx.font = "35px Tahoma";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Draw each character with random effects
      for (let i = 0; i < captcha.length; i++) {
        const x = 25 + (i * 30);
        const y = 30 + (Math.random() * 10 - 5);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() * 0.4) - 0.2);
        
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.fillText(captcha[i], 0, 0);
        
        ctx.restore();
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only verify captcha on step 2
    if (step === 2) {
      if (userInput.toLowerCase() !== captchaText.toLowerCase()) {
        alert('Invalid captcha. Please try again.');
        generateCaptcha();
        setUserInput('');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Prepare the data for submission
      const submissionData = {
        timestamp: new Date().toISOString(),
        isAdult,
        // Personal Information
        firstNameAr: formData.firstNameAr,
        lastNameAr: formData.lastNameAr,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        age: formData.age,
        cityAr: formData.cityAr,
        nationalId: formData.nationalId,
        phone: formData.phone,
        email: formData.email,
        // Guardian Information (for minors)
        guardianFirstNameAr: formData.guardianFirstNameAr,
        guardianLastNameAr: formData.guardianLastNameAr,
        guardianFirstName: formData.guardianFirstName,
        guardianLastName: formData.guardianLastName,
        guardianDateOfBirth: formData.guardianDateOfBirth,
        guardianAge: formData.guardianAge,
        guardianCityAr: formData.guardianCityAr,
        guardianPhone: formData.guardianPhone,
        guardianNationalId: formData.guardianNationalId,
        birthCertificateNumber: formData.birthCertificateNumber,
        kinship: kinship,
        otherKinship: otherKinship,
        // Minor Information (for minors)
        minorFirstNameAr: formData.minorFirstNameAr,
        minorLastNameAr: formData.minorLastNameAr,
        minorFirstName: formData.minorFirstName,
        minorLastName: formData.minorLastName,
        minorDateOfBirth: formData.minorDateOfBirth,
        minorAge: formData.minorAge,
        minorCityAr: formData.minorCityAr,
      };

      // Submit to OpenSheet API
      const response = await fetch('https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/Registered_players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Move to PDF download step on success
      setStep(3);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add keyboard handlers
  const handleArabicFieldClick = (fieldName) => {
    setActiveArabicField(fieldName);
    setShowKeyboard(true);
  };

  const handleKeyboardInput = (value) => {
    if (activeArabicField) {
      setFormData(prev => ({
        ...prev,
        [activeArabicField]: value
      }));
    }
  };

  const handleKeyboardClose = () => {
    setShowKeyboard(false);
    setActiveArabicField(null);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">{translations.personalInformation[language]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">{translations.firstNameArabic[language]}</label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstNameAr"
                    value={formData.firstNameAr}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => handleArabicFieldClick('firstNameAr')}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    title="Open Arabic keyboard"
                  >
                    ⌨️
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{translations.lastNameArabic[language]}</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastNameAr"
                    value={formData.lastNameAr}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => handleArabicFieldClick('lastNameAr')}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    title="Open Arabic keyboard"
                  >
                    ⌨️
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translations.firstName[language]}</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translations.lastName[language]}</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translations.dateOfBirth[language]}</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleDateChange(e, false)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {formData.age > 0 && (
                  <p className="mt-1 text-sm text-gray-500">{translations.age[language]}: {formData.age} {translations.years[language]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translations.cityArabic[language]}</label>
                <input
                  type="text"
                  name="cityAr"
                  value={formData.cityAr}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">{isAdult ? translations.adultInformation[language] : translations.guardianInformation[language]}</h3>
            
            {isAdult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.nationalId[language]}</label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.email[language]}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianFirstNameArabic[language]}</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="guardianFirstNameAr"
                      value={formData.guardianFirstNameAr}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => handleArabicFieldClick('guardianFirstNameAr')}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      title="Open Arabic keyboard"
                    >
                      ⌨️
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianLastNameArabic[language]}</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="guardianLastNameAr"
                      value={formData.guardianLastNameAr}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => handleArabicFieldClick('guardianLastNameAr')}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      title="Open Arabic keyboard"
                    >
                      ⌨️
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianFirstName[language]}</label>
                  <input
                    type="text"
                    name="guardianFirstName"
                    value={formData.guardianFirstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianLastName[language]}</label>
                  <input
                    type="text"
                    name="guardianLastName"
                    value={formData.guardianLastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianDateOfBirth[language]}</label>
                  <input
                    type="date"
                    name="guardianDateOfBirth"
                    value={formData.guardianDateOfBirth}
                    onChange={(e) => handleDateChange(e, true)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {formData.guardianAge > 0 && (
                    <p className="mt-1 text-sm text-gray-500">{translations.age[language]}: {formData.guardianAge} {translations.years[language]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianCityArabic[language]}</label>
                  <input
                    type="text"
                    name="guardianCityAr"
                    value={formData.guardianCityAr}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianPhone[language]}</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.guardianNationalId[language]}</label>
                  <input
                    type="text"
                    name="guardianNationalId"
                    value={formData.guardianNationalId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations.birthCertificateNumber[language]}</label>
                  <input
                    type="text"
                    name="birthCertificateNumber"
                    value={formData.birthCertificateNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{translations.kinship[language]}</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="father"
                        name="kinship"
                        value="father"
                        checked={kinship === 'father'}
                        onChange={(e) => setKinship(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="father" className="ml-2 block text-sm text-gray-700">
                        {translations.father[language]}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="mother"
                        name="kinship"
                        value="mother"
                        checked={kinship === 'mother'}
                        onChange={(e) => setKinship(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="mother" className="ml-2 block text-sm text-gray-700">
                        {translations.mother[language]}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="brother"
                        name="kinship"
                        value="brother"
                        checked={kinship === 'brother'}
                        onChange={(e) => setKinship(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="brother" className="ml-2 block text-sm text-gray-700">
                        {translations.brother[language]}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="other"
                        name="kinship"
                        value="other"
                        checked={kinship === 'other'}
                        onChange={(e) => setKinship(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="other" className="ml-2 block text-sm text-gray-700">
                        {translations.other[language]}
                      </label>
                    </div>
                    {kinship === 'other' && (
                      <div className="ml-6 mt-2">
                        <input
                          type="text"
                          value={otherKinship}
                          onChange={(e) => setOtherKinship(e.target.value)}
                          placeholder={translations.pleaseSpecify[language]}
                          required={kinship === 'other'}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">{translations.captchaVerification[language]}</h3>
              <div className="space-y-4">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="mx-auto h-[60px] w-[200px] border border-gray-200 rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
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
                    placeholder={translations.enterCode[language]}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">{translations.downloadRegistration[language]}</h3>
            <div className="text-center space-y-4">
              <p className="mb-4">{translations.registrationSuccess[language]}</p>
              
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    try {
                      const { url } = await generatePDF();
                      // Open the PDF in a new tab
                      window.open(url, '_blank');
                      
                      // Create a download link and click it
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'player-registration.pdf';
                      link.click();
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                      alert(`Error generating PDF: ${error.message}`);
                    }
                  }}
                  className="block w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {translations.downloadForm[language]}
                </button>

                <button
                  onClick={async () => {
                    try {
                      const { url } = await generateAdditionalPDF();
                      // Open the PDF in a new tab
                      window.open(url, '_blank');
                      
                      // Create a download link and click it
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'additional-document.pdf';
                      link.click();
                    } catch (error) {
                      console.error('Error downloading additional PDF:', error);
                      alert('Error generating additional PDF. Please try again.');
                    }
                  }}
                  className="block w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {translations.downloadAdditional[language]}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Function to generate PDF using pdf-lib
  const generatePDF = async () => {
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Register fontkit
      pdfDoc.registerFontkit(fontkit);
      
      // Determine which templates to use based on isAdult flag
      const page1TemplateSource = isAdult ? adultPage1Template : minorPage1Template;
      const page2TemplateSource = isAdult ? adultPage2Template : minorPage2Template;
      
      // Load the template images
      let page1ImageBytes, page2ImageBytes;
      try {
        page1ImageBytes = await fetch(page1TemplateSource).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch page1 template: ${res.status}`);
          return res.arrayBuffer();
        });
        page2ImageBytes = await fetch(page2TemplateSource).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch page2 template: ${res.status}`);
          return res.arrayBuffer();
        });
      } catch (error) {
        console.error('Error loading template images:', error);
        throw new Error(`Failed to load template images: ${error.message}`);
      }
      
      let page1Image, page2Image;
      try {
        page1Image = await pdfDoc.embedJpg(page1ImageBytes);
        page2Image = await pdfDoc.embedJpg(page2ImageBytes);
      } catch (error) {
        console.error('Error embedding images:', error);
        throw new Error(`Failed to embed images: ${error.message}`);
      }
      
      // Load fonts
      let arialFont, arialBoldFont, segoeUISymbolFont;
      try {
        // Load Arial Regular font
        const arialFontBytes = await fetch(arialFontUrl).then(res => res.arrayBuffer());
        
        // Load Arial Bold font
        const arialBoldFontBytes = await fetch(arialBoldFontUrl).then(res => res.arrayBuffer());
        
        // Load Segoe UI Symbol font for special characters
        const segoeUISymbolFontBytes = await fetch(segoeUISymbolFontUrl).then(res => res.arrayBuffer());
        
        // Embed fonts in the PDF
        arialFont = await pdfDoc.embedFont(arialFontBytes);
        arialBoldFont = await pdfDoc.embedFont(arialBoldFontBytes);
        segoeUISymbolFont = await pdfDoc.embedFont(segoeUISymbolFontBytes);
      } catch (error) {
        console.error('Error loading fonts:', error);
        throw new Error(`Failed to load fonts: ${error.message}`);
      }
      
      // Create Page 1
      const page1 = pdfDoc.addPage([595, 842]); // A4 size in points
      
      // Draw the template image
      const { width, height } = page1.getSize();
      try {
        page1.drawImage(page1Image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      } catch (error) {
        console.error('Error drawing page1 image:', error);
        throw new Error(`Failed to draw page1 image: ${error.message}`);
      }
      
      // Get the correct positions based on template type
      const positions = isAdult ? fieldPositions.adult : fieldPositions.minor;

      // Helper function to draw a checkbox (just the checkmark character, no borders or background)
      const drawCheckbox = (page, x, y, checked = false, size = 18, symbol = '✔') => {
        // If checked, draw the symbol
        if (checked) {
          // Use the provided symbol character from Segoe UI Symbol font
          page.drawText(symbol, {
            x: x,  // Use the exact x position provided
            y: height - y,  // Use the exact y position provided
            size: size,
            font: segoeUISymbolFont, // Use Segoe UI Symbol font for special characters
            color: rgb(0, 0, 0),
          });
        }
      };
      
      // Add text fields for Page 1
      try {
        // Arabic text fields - different fields based on adult/minor status
        const arabicFields = isAdult ? 
          ['firstNameAr', 'lastNameAr', 'placeOfBirthAr'] : 
          ['guardianFirstNameAr', 'guardianLastNameAr', 'guardianPlaceOfBirthAr'];
        arabicFields.forEach(field => {
          if (formData[field]) {
            const position = positions[field];
            const text = formData[field];
            const font = position.isBold ? arialBoldFont : arialFont;
            const fontSize = position.fontSize || 12;
            
            // Calculate text width for proper positioning
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            // For Arabic text, position from right edge
            // For non-Arabic text, position from left edge
            const xPosition = position.isArabic ? 
              width - textWidth - position.x : // Arabic: offset from right edge
              position.x; // Non-Arabic: offset from left edge
            
            // Apply uppercase if specified
            const displayText = position.upper ? text.toUpperCase() : text;
            
            page1.drawText(displayText, {
              x: xPosition,
              y: height - position.y,
              font: font,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
          }
        });
        
        try {
          // Handle non-hardcoded fields first
          const regularFields = isAdult ? 
            ['firstName', 'lastName', 'dateOfBirth', 'nationalId'] :
            ['guardianFirstName', 'guardianLastName', 'guardianDateOfBirth', 'guardianAge', 'guardianNationalId'];
          
          regularFields.forEach(field => {
            const position = positions[field];
            // Skip if position is undefined
            if (!position) {
              console.warn(`Position not defined for field: ${field}`);
              return;
            }
            
            // Only process if form data exists
            if (formData[field] !== undefined && formData[field] !== null) {
              // Process the field
              processField(page1, field, position, formData[field], arialFont, arialBoldFont, height, width, rgb);
            }
          });
          
          // Handle hardcoded fields separately based on template
          const hardcodedFields = ['club', 'clubNumber', 'league', 'leagueNumber'];
          
          hardcodedFields.forEach(field => {
            // Get the position based on the template type
            const position = positions[field];
            
            // Skip if position is undefined
            if (!position) {
              console.warn(`Position not defined for hardcoded field: ${field}`);
              return;
            }
            
            // Process the hardcoded field
            processField(page1, field, position, hardcodedValues[field], arialFont, arialBoldFont, height, width, rgb, true);
          });
          
          // Helper function to process a field
          function processField(page, field, position, value, regularFont, boldFont, height, width, rgb, isHardcoded = false) {
              // Convert value to string and handle undefined/null
              const text = value !== undefined && value !== null ? String(value) : '';
              if (text === '') return; // Skip empty values
              
              const font = position.isBold ? boldFont : regularFont;
              const fontSize = position.fontSize || 12;
              
              // Check if letter spacing is defined
              if (position.letterSpacing) {
                // Apply letter spacing by drawing each character individually
                // Calculate the width of each character
                let currentX = position.x; // Non-Arabic text starts from left
                
                // Apply uppercase if specified
                const displayText = position.upper ? text.toUpperCase() : text;
                
                // Draw each character with spacing
                for (let i = 0; i < displayText.length; i++) {
                  const char = displayText[i];
                  
                  page.drawText(char, {
                    x: currentX,
                    y: height - position.y,
                    font: font,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                  });
                  
                  // Move to the next character position with added spacing
                  const charWidth = font.widthOfTextAtSize(char, fontSize);
                  currentX += charWidth + position.letterSpacing;
                }
              } else if (position.isArabic) {
                // For Arabic text, calculate width for proper positioning
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                
                // Position from right edge for Arabic text
                const xPosition = width - textWidth - position.x;
                
                // Apply uppercase if specified (though not typically needed for Arabic)
                const displayText = position.upper ? text.toUpperCase() : text;
                
                page.drawText(displayText, {
                  x: xPosition,
                  y: height - position.y,
                  font: font,
                  size: fontSize,
                  color: rgb(0, 0, 0),
                });
              } else {
                // Regular text without letter spacing
                // Apply uppercase if specified
                const displayText = position.upper ? text.toUpperCase() : text;
                
                page.drawText(displayText, {
                  x: position.x, // Non-Arabic text starts from left
                  y: height - position.y,
                  font: font,
                  size: fontSize,
                  color: rgb(0, 0, 0),
                });
              }
          }
        } catch (error) {
          console.error('Error processing fields:', error);
          throw new Error(`Failed to process fields: ${error.message}`);
        }
        
        // Draw checkboxes for page 1
        if (isAdult) {
          // Draw checkboxes defined in the adult template
          if (positions.checkbox1 && positions.checkbox1.x) {
            drawCheckbox(
              page1, 
              positions.checkbox1.x, 
              positions.checkbox1.y, 
              positions.checkbox1.checked,
              positions.checkbox1.size || 20,
              positions.checkbox1.symbol || '✓'
            );
          }
        } else {
          // For minors, draw the appropriate kinship checkbox based on selection
          if (kinship === 'father' && positions.fatherCheckbox) {
            drawCheckbox(
              page1,
              positions.fatherCheckbox.x,
              positions.fatherCheckbox.y,
              true,
              positions.fatherCheckbox.size || 20,
              positions.fatherCheckbox.symbol || '✓'
            );
          } else if (kinship === 'mother' && positions.motherCheckbox) {
            drawCheckbox(
              page1,
              positions.motherCheckbox.x,
              positions.motherCheckbox.y,
              true,
              positions.motherCheckbox.size || 20,
              positions.motherCheckbox.symbol || '✓'
            );
          } else if (kinship === 'brother' && positions.brotherCheckbox) {
            drawCheckbox(
              page1,
              positions.brotherCheckbox.x,
              positions.brotherCheckbox.y,
              true,
              positions.brotherCheckbox.size || 20,
              positions.brotherCheckbox.symbol || '✓'
            );
          } else if (kinship === 'other') {
            // For 'other' kinship, don't show a checkbox but instead write the specified text
            if (otherKinship) {
              // Use the otherKinshipText position configuration
              const position = positions.otherKinshipText || { x: 157, y: 325, isBold: true, fontSize: 12 };
              const font = position.isBold ? arialBoldFont : arialFont;
              const fontSize = position.fontSize || 12;
              
              // Handle Arabic text if specified
              if (position.isArabic) {
                // Calculate text width for proper positioning
                const textWidth = font.widthOfTextAtSize(otherKinship, fontSize);
                
                // For Arabic text, position from right edge
                const xPosition = width - textWidth - position.x;
                
                page1.drawText(otherKinship, {
                  x: xPosition,
                  y: height - position.y,
                  font: font,
                  size: fontSize,
                  color: rgb(0, 0, 0),
                });
              } else {
                // For non-Arabic text
                page1.drawText(otherKinship, {
                  x: position.x,
                  y: height - position.y,
                  font: font,
                  size: fontSize,
                  color: rgb(0, 0, 0),
                });
              }
            }
            
            // Also draw the checkbox if needed
            // if (positions.otherCheckbox) {
            //   drawCheckbox(
            //     page1,
            //     positions.otherCheckbox.x,
            //     positions.otherCheckbox.y,
            //     true,
            //     positions.otherCheckbox.size || 20,
            //     positions.otherCheckbox.symbol || '✓'
            //   );
            // }
          }
        }
        
        // Now add code to handle the city data
        // For adult player's city
        if (isAdult && formData.cityAr) {
          const position = positions.placeOfBirthAr;
          if (position) {
            const text = formData.cityAr;
            const font = position.isBold ? arialBoldFont : arialFont;
            const fontSize = position.fontSize || 12;
            
            // Calculate text width for proper positioning
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            // For Arabic text, position from right edge
            // For non-Arabic text, position from left edge
            const xPosition = position.isArabic ? 
              width - textWidth - position.x : // Arabic: offset from right edge
              position.x; // Non-Arabic: offset from left edge
              
            page1.drawText(text, {
              x: xPosition,
              y: height - position.y,
              font: font,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
          }
        }
        
        // For guardian's city (on page 1 for minors)
        if (!isAdult && formData.guardianCityAr) {
          const position = positions.guardianPlaceOfBirthAr;
          if (position) {
            const text = formData.guardianCityAr;
            const font = position.isBold ? arialBoldFont : arialFont;
            const fontSize = position.fontSize || 12;
            
            // Calculate text width for proper positioning
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            // For Arabic text, position from right edge
            // For non-Arabic text, position from left edge
            const xPosition = position.isArabic ? 
              width - textWidth - position.x : // Arabic: offset from right edge
              position.x; // Non-Arabic: offset from left edge
              
            page1.drawText(text, {
              x: xPosition,
              y: height - position.y,
              font: font,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
          }
        }
        
        // Add minor's information to page 1 (moved from page 2)
        if (!isAdult) {
          // Minor's Arabic name fields
          ['minorFirstNameAr', 'minorLastNameAr'].forEach(field => {
            if (formData[field]) {
              const position = positions[field];
              if (!position) {
                console.warn(`Position not defined for field: ${field} on page 1`);
                return;
              }
              
              const text = formData[field];
              const font = position.isBold ? arialBoldFont : arialFont;
              const fontSize = position.fontSize || 12;
              
              // Calculate text width for proper positioning
              const textWidth = font.widthOfTextAtSize(text, fontSize);
              
              // For Arabic text, position from right edge
              const xPosition = position.isArabic ? 
                width - textWidth - position.x : // Arabic: offset from right edge
                position.x; // Non-Arabic: offset from left edge
              
              page1.drawText(text, {
                x: xPosition,
                y: height - position.y,
                font: font,
                size: fontSize,
                color: rgb(0, 0, 0),
              });
            }
          });
          
          // Minor's English fields
          ['minorDateOfBirth', 'birthCertificateNumber'].forEach(field => {
            if (formData[field] !== undefined && formData[field] !== null) {
              const position = positions[field];
              if (!position) {
                console.warn(`Position not defined for field: ${field} on page 1`);
                return;
              }
              
              // Check if letter spacing is defined
              if (position.letterSpacing) {
                // Apply letter spacing by drawing each character individually
                const text = String(formData[field]);
                const font = position.isBold ? arialBoldFont : arialFont;
                const fontSize = position.fontSize || 12;
                
                // Calculate the width of each character
                let currentX = position.x;
                
                // Apply uppercase if specified
                const displayText = position.upper ? text.toUpperCase() : text;
                
                // Draw each character with spacing
                for (let i = 0; i < displayText.length; i++) {
                  const char = displayText[i];
                  page1.drawText(char, {
                    x: currentX,
                    y: height - position.y,
                    font: font,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                  });
                  
                  // Move to the next position with letter spacing
                  const charWidth = font.widthOfTextAtSize(char, fontSize);
                  currentX += charWidth + position.letterSpacing;
                }
              } else {
                // Regular text without letter spacing
                let displayText = String(formData[field]);
                if (position.upper) {
                  displayText = displayText.toUpperCase();
                }
                
                page1.drawText(displayText, {
                  x: position.x,
                  y: height - position.y,
                  font: position.isBold ? arialBoldFont : arialFont,
                  size: position.fontSize || 12,
                  color: rgb(0, 0, 0),
                });
              }
            }
          });
          
          // For minor's city (on page 1)
          if (formData.minorCityAr) {
            const position = positions.minorPlaceOfBirthAr;
            if (position) {
              const text = formData.minorCityAr;
              const font = position.isBold ? arialBoldFont : arialFont;
              const fontSize = position.fontSize || 12;
              
              // Calculate text width for proper positioning
              const textWidth = font.widthOfTextAtSize(text, fontSize);
              
              // For Arabic text, position from right edge
              const xPosition = position.isArabic ? 
                width - textWidth - position.x : // Arabic: offset from right edge
                position.x; // Non-Arabic: offset from left edge
              
              page1.drawText(text, {
                x: xPosition,
                y: height - position.y,
                font: font,
                size: fontSize,
                color: rgb(0, 0, 0),
              });
            }
          }
        }
      } catch (error) {
        console.error('Error adding text to page1:', error);
        throw new Error(`Failed to add text to page1: ${error.message}`);
      }
      
      // Create Page 2
      const page2 = pdfDoc.addPage([595, 842]);
      
      try {
        // Draw the template image
        page2.drawImage(page2Image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      } catch (error) {
        console.error('Error drawing page2 image:', error);
        throw new Error(`Failed to draw page2 image: ${error.message}`);
      }
      
      // Add text fields for Page 2 based on adult status
      try {
        if (isAdult) {
          // Adult fields
          const adultFields = ['email'];
          adultFields.forEach(field => {
            if (formData[field]) {
              const position = positions[field];
              
              // Skip if position is undefined
              if (!position) {
                console.warn(`Position not defined for field: ${field} on page 2`);
                return;
              }
              
              page2.drawText(formData[field], {
                x: position.x,
                y: height - position.y,
                font: position.isBold ? arialBoldFont : arialFont,
                size: position.fontSize || 12,
                color: rgb(0, 0, 0),
              });
            }
          });
        } else {
          // Minor template - Only fields that remain on page 2
          // Only guardian phone number remains on page 2
          if (formData.guardianPhone) {
            const position = positions.guardianPhone;
            
            // Skip if position is undefined
            if (!position) {
              console.warn(`Position not defined for field: guardianPhone on page 2`);
              return;
            }
            
            page2.drawText(formData.guardianPhone, {
              x: position.x,
              y: height - position.y,
              font: position.isBold ? arialBoldFont : arialFont,
              size: position.fontSize || 12,
              color: rgb(0, 0, 0),
            });
          }
          
          // Add hardcoded fields to page 2 if needed
          const hardcodedPage2Fields = ['club', 'clubNumber', 'league', 'leagueNumber'].filter(field => {
            const position = positions[field];
            return position && position.page === 2;
          });
          
          hardcodedPage2Fields.forEach(field => {
            const position = positions.minor[field];
            
            // Skip if position is undefined
            if (!position) {
              console.warn(`Position not defined for hardcoded field: ${field} on page 2`);
              return;
            }
            
            const text = hardcodedValues[field];
            
            if (position.letterSpacing) {
              // Apply letter spacing
              const font = position.isBold ? arialBoldFont : arialFont;
              const fontSize = position.fontSize || 12;
              let currentX = position.x;
              
              // Apply uppercase if specified
              const displayText = position.upper ? text.toUpperCase() : text;
              
              for (let i = 0; i < displayText.length; i++) {
                const char = displayText[i];
                page2.drawText(char, {
                  x: currentX,
                  y: height - position.y,
                  font: font,
                  size: fontSize,
                  color: rgb(0, 0, 0),
                });
                
                const charWidth = font.widthOfTextAtSize(char, fontSize);
                currentX += charWidth + position.letterSpacing;
              }
            } else {
              // Regular text
              let displayText = text;
              if (position.upper) {
                displayText = displayText.toUpperCase();
              }
              
              page2.drawText(displayText, {
                x: position.x,
                y: height - position.y,
                font: position.isBold ? arialBoldFont : arialFont,
                size: position.fontSize || 12,
                color: rgb(0, 0, 0),
              });
            }
          });
        }
      } catch (error) {
        console.error('Error adding text to page2:', error);
        throw new Error(`Failed to add text to page2: ${error.message}`);
      }
      
      // Serialize the PDF to bytes
      let pdfBytes;
      try {
        pdfBytes = await pdfDoc.save();
      } catch (error) {
        console.error('Error saving PDF:', error);
        throw new Error(`Failed to save PDF: ${error.message}`);
      }
      
      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      return { url, blob };
    } catch (error) {
      console.error('Error in generatePDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  };
  
  // Function to generate additional PDF
  const generateAdditionalPDF = async () => {
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      // Add content to the page (placeholder for now)
      const { width, height } = page.getSize();
      page.drawText('Additional Document', {
        x: 50,
        y: height - 50,
        size: 24,
      });
      
      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      return { url, blob };
    } catch (error) {
      console.error('Error generating additional PDF:', error);
      throw error;
    }
  };

  // Function to check registration status
  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch('https://opensheet.elk.sh/1M7Up4HySa9rRszY7ySHbBV_1rJLU2--W0WwrXGG_PP0/registration');
      const data = await response.json();
      // Assuming the first row contains the status
      const isActive = data[0]?.status?.toLowerCase() === 'true';
      setIsRegistrationActive(isActive);
    } catch (error) {
      console.error('Error checking registration status:', error);
      // Default to active if there's an error
      setIsRegistrationActive(true);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  if (isLoadingStatus) {
    return (
      <PageContainer>
        <PageTitle title={translations.pageTitle[language]} />
        <ContentContainer>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (!isRegistrationActive) {
    return (
      <PageContainer>
        <PageTitle title={translations.pageTitle[language]} />
        <ContentContainer>
          <RegistrationClosed language={language} />
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <ErrorBoundary>
      <PageContainer>
        <PageTitle title={translations.pageTitle[language]} />
        <ContentContainer>
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{translations.step1[language]}</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{translations.step2[language]}</span>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{translations.step3[language]}</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white shadow rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStep()}

              <div className="flex justify-between mt-8">
                {step > 1 && step < 3 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {translations.previous[language]}
                  </button>
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {translations.next[language]}
                  </button>
                ) : step === 2 ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {submitting ? translations.submitting[language] : translations.submit[language]}
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          {/* Add the keyboard component */}
          {showKeyboard && (
            <ArabicKeyboard
              onInputChange={handleKeyboardInput}
              onClose={handleKeyboardClose}
            />
          )}
        </ContentContainer>
      </PageContainer>
    </ErrorBoundary>
  );
};

const WrappedPlayerRegistration = () => {
  return (
    <ErrorBoundary>
      <PlayerRegistration />
    </ErrorBoundary>
  );
};

export default WrappedPlayerRegistration; 