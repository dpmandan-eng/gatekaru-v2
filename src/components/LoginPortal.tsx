import React, { useState, useEffect, useRef } from "react";
import { User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Lock, ChevronRight, RefreshCw, KeyRound, ArrowLeft, Shield, Building, Compass, Sparkles, Palette, Globe } from "lucide-react";
import { INDIAN_LANGUAGES } from "../utils/alertTemplates";
import FooterIntegrations from "./FooterIntegrations";

const BANNER_THEMES = [
  { id: "slate", name: "Deep Slate", bgClass: "bg-slate-950", accentClass: "text-slate-400" },
  { id: "indigo", name: "Royal Indigo", bgClass: "bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950", accentClass: "text-indigo-300" },
  { id: "emerald", name: "Emerald Forest", bgClass: "bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950", accentClass: "text-emerald-300" },
  { id: "crimson", name: "Sunset Crimson", bgClass: "bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950", accentClass: "text-rose-300" },
  { id: "cosmic", name: "Cosmic Ocean", bgClass: "bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950", accentClass: "text-sky-300" }
];

interface LoginPortalProps {
  users: User[];
  onLoginSuccess: (user: User, portal: "resident" | "guard" | "admin" | "super_admin") => void;
  onLogoClick?: () => void;
  onRegisterSuccess?: () => void;
  globalLang?: string;
  onLanguageChange?: (lang: string) => void;
  isLangChanging?: boolean;
  isInstallable?: boolean;
  onInstallClick?: () => void;
}

const LOGIN_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "login.title": "Secure Sign In",
    "login.subtitle": "Society ERP & Gate Security Access",
    "login.phone_label": "Mobile Number",
    "login.phone_placeholder": "Enter 10-digit mobile number",
    "login.get_otp": "Get OTP Code",
    "login.register_link": "✨ New Registration / नया रजिस्ट्रेशन",
    "login.otp_title": "OTP Verify",
    "login.otp_subtitle": "Enter verification code sent to",
    "login.otp_label": "Verification Code",
    "login.otp_button": "Verify OTP",
    "login.sandbox_notice": "For sandbox simulation testing, enter the generated OTP to proceed.",
    "login.profiles_title": "Quick Simulator Profiles",
    "login.profiles_subtitle": "Demo Mode",
    "login.choose_workspace": "Choose Workspace",
    "login.workspace_desc": "Access whitelisted. Proceed directly to your assigned ERP dashboard.",
    "login.continue": "Continue"
  },
  hi: {
    "login.title": "सुरक्षित लॉग इन",
    "login.subtitle": "सोसाइटी ईआरपी और गेट सुरक्षा एक्सेस",
    "login.phone_label": "मोबाइल नंबर",
    "login.phone_placeholder": "10-अंकीय मोबाइल नंबर दर्ज करें",
    "login.get_otp": "ओटीपी प्राप्त करें",
    "login.register_link": "✨ नया रजिस्ट्रेशन / New Registration",
    "login.otp_title": "ओटीपी सत्यापित करें",
    "login.otp_subtitle": "सत्यापन कोड इस नंबर पर भेजा गया है:",
    "login.otp_label": "सत्यापन कोड",
    "login.otp_button": "ओटीपी सत्यापित करें",
    "login.sandbox_notice": "सैंडबॉक्स सिमुलेशन परीक्षण के लिए, आगे बढ़ने के लिए उत्पन्न ओटीपी दर्ज करें।",
    "login.profiles_title": "त्वरित सिम्युलेटर प्रोफाइल",
    "login.profiles_subtitle": "डेमो मोड",
    "login.choose_workspace": "कार्यक्षेत्र चुनें",
    "login.workspace_desc": "एक्सेस स्वीकृत। अपने आवंटित ईआरपी डैशबोर्ड पर सीधे आगे बढ़ें।",
    "login.continue": "आगे बढ़ें"
  },
  mr: {
    "login.title": "सुरक्षित लॉग इन",
    "login.subtitle": "सोसायटी ईआरपी आणि गेट सुरक्षा प्रवेश",
    "login.phone_label": "मोबाईल नंबर",
    "login.phone_placeholder": "१०-अंकी मोबाईल नंबर प्रविष्ट करा",
    "login.get_otp": "ओटीपी मिळवा",
    "login.register_link": "✨ नवीन नोंदणी / New Registration",
    "login.otp_title": "ओटीपी सत्यापित करा",
    "login.otp_subtitle": "सत्यापन कोड या नंबरवर पाठवला आहे:",
    "login.otp_label": "सत्यापन कोड",
    "login.otp_button": "ओटीपी सत्यापित करा",
    "login.sandbox_notice": "सँडबॉक्स सिम्युलेशन चाचणीसाठी, पुढे जाण्यासाठी व्युत्पन्न ओटीपी प्रविष्ट करा.",
    "login.profiles_title": "त्वरित सिम्युलेटर प्रोफाइल",
    "login.profiles_subtitle": "डेमो मोड",
    "login.choose_workspace": "कार्यक्षेत्र निवडा",
    "login.workspace_desc": "प्रवेश मंजूर. आपल्या नियुक्त ईआरपी डॅशबोर्डवर थेट पुढे जा.",
    "login.continue": "पुढे जा"
  },
  gu: {
    "login.title": "સુરક્ષિત લૉગ ઇન",
    "login.subtitle": "સોસાયટી ઇઆરપી અને ગેટ સુરક્ષા એક્સેસ",
    "login.phone_label": "મોબાઇલ નંબર",
    "login.phone_placeholder": "10-અંકોનો મોબાઇલ નંબર દાખલ કરો",
    "login.get_otp": "ઓટીપી મેળવો",
    "login.register_link": "✨ નવું રજીસ્ટ્રેશન / New Registration",
    "login.otp_title": "ઓટીપી ચકાસો",
    "login.otp_subtitle": "ચકાસણી કોડ આ નંબર પર મોકલવામાં આવ્યો છે:",
    "login.otp_label": "ચકાસણી કોડ",
    "login.otp_button": "ઓટીપી ચકાસો",
    "login.sandbox_notice": "સેન્ડબોક્સ સિમ્યુલેશન પરીક્ષણ માટે, આગળ વધવા માટે જનરેટ કરેલ ઓટીપી દાખલ કરો.",
    "login.profiles_title": "ઝડપી સિમ્યુલેટર પ્રોફાઇલ્સ",
    "login.profiles_subtitle": "ડેમો મોડ",
    "login.choose_workspace": "કાર્યસ્થળ પસંદ કરો",
    "login.workspace_desc": "પ્રવેશ મંજૂર. તમારા સોંપાયેલ ઇઆરપી ડેશબોર્ડ પર સીધા આગળ વધો.",
    "login.continue": "આગળ વધો"
  },
  bn: {
    "login.title": "নিরাপদ লগ ইন",
    "login.subtitle": "সোসাইটি ইআরপি এবং গেট সুরক্ষা অ্যাক্সেস",
    "login.phone_label": "মোবাইল নম্বর",
    "login.phone_placeholder": "১০-অঙ্কের মোবাইল নম্বর লিখুন",
    "login.get_otp": "ওটিপি পান",
    "login.register_link": "✨ নতুন রেজিস্ট্রেশন / New Registration",
    "login.otp_title": "ওটিপি যাচাই করুন",
    "login.otp_subtitle": "যাচাইকরণ কোড এই নম্বরে পাঠানো হয়েছে:",
    "login.otp_label": "যাচাইকরণ কোড",
    "login.otp_button": "ওটিপি যাচাই করুন",
    "login.sandbox_notice": "স্যান্ডবক্স সিমুলেশন পরীক্ষার জন্য, এগিয়ে যেতে উৎপন্ন ওটিপি লিখুন।",
    "login.profiles_title": "দ্রুত সিমুলেটর প্রোফাইল",
    "login.profiles_subtitle": "ডেমো মোড",
    "login.choose_workspace": "ওয়ার্কস্পেস নির্বাচন করুন",
    "login.workspace_desc": "অ্যাক্সেস অনুমোদিত। আপনার নির্ধারিত ইআরপি ড্যাশবোর্ডে সরাসরি এগিয়ে যান।",
    "login.continue": "এগিয়ে যান"
  },
  ta: {
    "login.title": "பாதுகாப்பான உள்நுழைவு",
    "login.subtitle": "சொசைட்டி ஈஆர்பி & கேட் பாதுகாப்பு அணுகல்",
    "login.phone_label": "கைபேசி எண்",
    "login.phone_placeholder": "10 இலக்க கைபேசி எண்ணை உள்ளிடவும்",
    "login.get_otp": "OTP பெறவும்",
    "login.register_link": "✨ புதிய பதிவு / New Registration",
    "login.otp_title": "OTP சரிபார்ப்பு",
    "login.otp_subtitle": "சரிபார்ப்புக் குறியீடு அனுப்பப்பட்ட எண்:",
    "login.otp_label": "சரிபார்ப்புக் குறியீடு",
    "login.otp_button": "OTP சரிபார்",
    "login.sandbox_notice": "சாಂಡ்பாக்ஸ் உருவகப்படுத்துதல் சோதனைக்கு, தொடர உருவாக்கப்பட்ட OTP ஐ உள்ளிடவும்.",
    "login.profiles_title": "விரைவான சிமுலேட்டர் சுயவிவரங்கள்",
    "login.profiles_subtitle": "டெમો பயன்முறை",
    "login.choose_workspace": "பணியிடத்தைத் தேர்வுசெய்",
    "login.workspace_desc": "அணுகல் அங்கீகரிக்கப்பட்டது. உங்களுக்கு ஒதுக்கப்பட்ட ஈஆர்பి டாஷ்போர்டுக்கு நேரடியாகச் செல்லவும்.",
    "login.continue": "தொடரவும்"
  },
  te: {
    "login.title": "సురక్షిత లాగిన్",
    "login.subtitle": "సొసైటీ ఈఆర్‌పీ & గేట్ సెక్యూరిటీ యాక్సెస్",
    "login.phone_label": "మొబైల్ నంబర్",
    "login.phone_placeholder": "10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి",
    "login.get_otp": "OTP పొందండి",
    "login.register_link": "✨ కొత్త రిజిస్ట్రేషన్ / New Registration",
    "login.otp_title": "OTP వెరిఫై",
    "login.otp_subtitle": "ధృవీకరణ కోడ్ పంపబడిన నంబర్:",
    "login.otp_label": "ధృవీకరణ కోడ్",
    "login.otp_button": "OTP వెరిఫై చేయండి",
    "login.sandbox_notice": "శాండ్‌బాక్స్ సిమ్యులేషన్ టెస్టింగ్ కోసం, కొనసాగడానికి జనరేట్ చేసిన OTPని నమోదు చేయండి.",
    "login.profiles_title": "త్వరిత సిమ్యులేటర్ ప్రొఫైల్స్",
    "login.profiles_subtitle": "డెమో మోడ్",
    "login.choose_workspace": "వర్క్‌స్పేస్‌ను ఎంచుకోండి",
    "login.workspace_desc": "యాక్సెస్ అనుమతించబడింది. మీ కేటాయించిన ఈఆర్‌పీ డాష్‌బోర్డ్‌కు నేరుగా వెళ్లండి.",
    "login.continue": "కొనసాగించండి"
  },
  kn: {
    "login.title": "ಸುರಕ್ಷಿತ ಲಾಗಿನ್",
    "login.subtitle": "ಸೊಸೈಟಿ ಇಆರ್ಪಿ ಮತ್ತು ಗೇಟ್ ಭದ್ರತಾ ಪ್ರವೇಶ",
    "login.phone_label": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "login.phone_placeholder": "10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    "login.get_otp": "OTP ಪಡೆಯಿರಿ",
    "login.register_link": "✨ ಹೊಸ ನೋಂದಣಿ / New Registration",
    "login.otp_title": "OTP ಪರಿಶೀಲಿಸಿ",
    "login.otp_subtitle": "ಪರಿಶೀಲನಾ ಕೋಡ್ ಕಳುಹಿಸಲಾದ ಸಂಖ್ಯೆ:",
    "login.otp_label": "ಪರಿಶೀಲನಾ ಕೋಡ್",
    "login.otp_button": "OTP ಪರಿಶೀಲಿಸಿ",
    "login.sandbox_notice": "ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್ ಪರೀಕ್ಷೆಗಾಗಿ, ಮುಂದುವರೆಯಲು ರಚಿಸಲಾದ OTP ಅನ್ನು ನಮೂದಿಸಿ.",
    "login.profiles_title": "ತ್ವರಿತ ಸಿಮ್ಯುಲೇಟರ್ ಪ್ರೊಫೈಲ್‌ಗಳು",
    "login.profiles_subtitle": "ಡೆಮೊ ಮೋಡ್",
    "login.choose_workspace": "ಕೆಲಸದ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "login.workspace_desc": "ಪ್ರವೇಶ ಅನುಮೋದಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ನಿಯೋಜಿತ ಇಆರ್‌ಪಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ನೇರವಾಗಿ ಮುಂದುವರಿಯಿರಿ.",
    "login.continue": "ಮುಂದುವರಿಯಿರಿ"
  },
  pa: {
    "login.title": "ਸੁਰੱਖਿਅਤ ਲੌਗਇਨ",
    "login.subtitle": "ਸੁਸਾਇਟੀ ERP ਅਤੇ ਗੇਟ ਸੁਰੱਖਿਆ ਪਹੁੰਚ",
    "login.phone_label": "ਮੋਬਾਈਲ ਨੰਬਰ",
    "login.phone_placeholder": "10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ",
    "login.get_otp": "OTP ਪ੍ਰਾਪਤ ਕਰੋ",
    "login.register_link": "✨ ਨਵੀਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨ / New Registration",
    "login.otp_title": "OTP ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    "login.otp_subtitle": "ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਇਸ ਨੰਬਰ 'ਤੇ ਭੇਜਿਆ ਗਿਆ ਹੈ:",
    "login.otp_label": "ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ",
    "login.otp_button": "OTP ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    "login.sandbox_notice": "ਸੈਂਡਬੌਕਸ ਸਿਮੂਲੇਸ਼ਨ ਟੈਸਟਿੰਗ ਲਈ, ਅੱਗੇ ਵਧਣ ਲਈ ਤਿਆਰ ਕੀਤਾ OTP ਦਰਜ ਕਰੋ।",
    "login.profiles_title": "ਤੁਰੰਤ ਸਿਮੂਲੇਟਰ ਪ੍ਰੋਫਾਈਲ",
    "login.profiles_subtitle": "ਡੈਮੋ ਮੋਡ",
    "login.choose_workspace": "ਵਰਕਸਪੇਸ ਚੁਣੋ",
    "login.workspace_desc": "ਪਹੁੰਚ ਮਨਜ਼ੂਰ। ਆਪਣੇ ਨਿਰਧਾਰਤ ERP ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਸਿੱਧੇ ਅੱਗੇ ਵਧੋ।",
    "login.continue": "ਜਾਰੀ ਰੱਖੋ"
  }
};

type Step = "phone" | "otp" | "workspace" | "register";

export default function LoginPortal({ 
  users, 
  onLoginSuccess, 
  onLogoClick, 
  onRegisterSuccess,
  globalLang = "en",
  onLanguageChange,
  isLangChanging = false,
  isInstallable = false,
  onInstallClick
}: LoginPortalProps) {
  const [bannerTheme, setBannerTheme] = useState<string>(() => {
    return localStorage.getItem("gatekaru_login_banner") || "slate";
  });
  const activeThemeObj = BANNER_THEMES.find(t => t.id === bannerTheme) || BANNER_THEMES[0];
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const themePickerRef = useRef<HTMLDivElement>(null);
  
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const getLoginTranslation = (key: string, fallback: string) => {
    const lang = globalLang || "en";
    return LOGIN_TRANSLATIONS[lang]?.[key] || LOGIN_TRANSLATIONS["en"]?.[key] || fallback;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themePickerRef.current && !themePickerRef.current.contains(event.target as Node)) {
        setIsThemePickerOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [expectedOtp, setExpectedOtp] = useState<string>(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Selected user after matching phone number
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  // Selected workspace for dual role (Aarav Sharma) or single role
  const [selectedWorkspace, setSelectedWorkspace] = useState<"resident" | "guard" | "admin" | "super_admin" | "unified">("resident");

  // Registration states
  const [regRole, setRegRole] = useState<"resident" | "guard" | "admin" | "both">("resident");
  const [societies, setSocieties] = useState<{ id: string; name: string }[]>([]);
  const [regSociety, setRegSociety] = useState("Greenwood Heights Society");
  const [regName, setRegName] = useState("");

  useEffect(() => {
    fetch("/api/societies")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSocieties(data);
          if (data.length > 0) {
            setRegSociety(data[0].name);
          }
        }
      })
      .catch(err => console.error("Error fetching societies:", err));
  }, []);
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  
  // Role specific fields
  const [regFlat, setRegFlat] = useState("");
  const [regType, setRegType] = useState("Owner");
  const [regVehicleNo, setRegVehicleNo] = useState("");
  
  const [regShift, setRegShift] = useState("Day Shift (08:00 AM - 08:00 PM)");
  const [regGate, setRegGate] = useState("Gate 1");
  const [regIdCard, setRegIdCard] = useState("");
  
  const [regDesignation, setRegDesignation] = useState("Committee Member");
  const [regCommittee, setRegCommittee] = useState("Greenwood Management Committee");

  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [smsNotification, setSmsNotification] = useState<{ phone: string; message: string; visible: boolean } | null>(null);

  const normalizePhone = (num: string) => {
    return num.replace(/[^0-9]/g, "");
  };

  // Quick simulator login option
  const handleQuickSelect = (user: User) => {
    setPhoneNumber(user.phone);
    setError(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEntered = normalizePhone(phoneNumber);
    if (!cleanEntered) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber })
      });
      
      const contentType = response.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textText = await response.text();
        console.error("Non-JSON API response:", textText);
        throw new Error("Unable to connect to login server. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      // Use user from response or find in current users
      const enteredLast10 = cleanEntered.slice(-10);
      const user = data.user || users.find(u => {
        const uClean = normalizePhone(u.phone);
        const uLast10 = uClean.slice(-10);
        return (enteredLast10 && uLast10 && enteredLast10 === uLast10) || uClean.includes(cleanEntered) || cleanEntered.includes(uClean);
      });
      
      if (!user) {
        setError("This mobile number is not registered on GateKaru ERP. Click 'New Registration' below to register.");
        setRegPhone(phoneNumber);
        setLoading(false);
        return;
      }

      setMatchedUser(user);
      setStep("otp");
      
      const otpCode = data.otp || "9999";
      setExpectedOtp(otpCode);

      // Slide-down simulated SMS OTP notification!
      setSmsNotification({
        phone: user.phone,
        message: `💬 Security OTP: "Your GateKaru ERP verification code is ${otpCode}. Valid for 5 minutes. DO NOT share this with anyone."`,
        visible: true
      });
      
      // Auto-dismiss after 15 seconds
      setTimeout(() => {
        setSmsNotification(prev => prev ? { ...prev, visible: false } : null);
      }, 15000);
    } catch (err: any) {
      setError(err.message || "An error occurred while sending OTP.");
      setRegPhone(phoneNumber);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, otp })
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Server response error. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Incorrect OTP code.");
      }

      if (data.token) {
        localStorage.setItem("gatekaru_token", data.token);
      }

      const finalUser = data.user || matchedUser;
      if (!finalUser) {
        throw new Error("User session could not be established.");
      }

      // Detect workspaces for matched user
      if (finalUser.id === "u1" || finalUser.email === "aarav@example.com" || finalUser.role === "both") {
        // Aarav Sharma or newly registered dual-role user has Resident and Admin Committee role choice
        setSelectedWorkspace(finalUser.role === "both" ? "unified" : "resident"); // Default selection to Unified Portal if role is "both"
        setStep("workspace");
      } else {
        // Direct automatic zero-click routing:
        let targetPortal: "resident" | "guard" | "admin" | "super_admin" | "unified" = "resident";
        if (finalUser.role === "resident") targetPortal = "resident";
        else if (finalUser.role === "guard") targetPortal = "guard";
        else if (finalUser.role === "admin") targetPortal = "admin";
        else if (finalUser.role === "super_admin") targetPortal = "super_admin";
        
        onLoginSuccess(finalUser, targetPortal);
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!regPhone.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(),
          role: regRole,
          flat: (regRole === "resident" || regRole === "both") ? regFlat.trim() : undefined,
          type: (regRole === "resident" || regRole === "both") ? regType : undefined,
          vehicleNo: (regRole === "resident" || regRole === "both") ? regVehicleNo.trim() : undefined,
          shift: regRole === "guard" ? regShift : undefined,
          gate: regRole === "guard" ? regGate : undefined,
          idCard: regRole === "guard" ? regIdCard.trim() : undefined,
          designation: (regRole === "admin" || regRole === "both") ? regDesignation.trim() : undefined,
          committee: (regRole === "admin" || regRole === "both") ? regCommittee.trim() : undefined,
          society: regSociety
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      setRegSuccess("Registration successful! Redirecting you back to sign in...");
      setPhoneNumber(regPhone);

      const registeredOtp = data.otp || "9999";
      setExpectedOtp(registeredOtp);

      // Slide-down simulated SMS welcome/OTP notification!
      setSmsNotification({
        phone: regPhone,
        message: `💬 GateKaru System: "Welcome to GateKaru ERP! Your registration is successful. Please sign in using your registered mobile number. Your verification OTP is ${registeredOtp}."`,
        visible: true
      });

      setRegName("");
      setRegPhone("");
      setRegEmail("");
      setRegFlat("");
      setRegVehicleNo("");
      setRegIdCard("");

      // Trigger users refresh in App.tsx
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

      setTimeout(() => {
        setStep("phone");
        setRegSuccess(null);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishLogin = () => {
    if (!matchedUser) return;
    onLoginSuccess(matchedUser, selectedWorkspace);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Abstract premium decorative circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>

      {/* Simulated Mobile SMS alert popup overlay */}
      <AnimatePresence>
        {smsNotification && smsNotification.visible && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 max-w-sm w-11/12 bg-slate-950 border-2 border-indigo-500 text-white rounded-2xl p-4 flex gap-3 z-50 pointer-events-auto"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)" }}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xl shrink-0">
              💬
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">SMS Alert (simulated)</span>
                <button 
                  onClick={() => setSmsNotification(prev => prev ? { ...prev, visible: false } : null)}
                  className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h5 className="text-xs font-black text-white mt-0.5">GateKaru OTP Server</h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {smsNotification.message}
              </p>
              <span className="text-[9px] font-bold text-slate-500 mt-1.5 block font-mono">To: {smsNotification.phone}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100/50 overflow-hidden relative z-10">
        
        {/* GateKaru Header Banner */}
        <div className={`p-5 md:p-8 text-white relative transition-all duration-500 ease-in-out ${activeThemeObj.bgClass}`} id="login-header-banner">
          
          {/* Theme Palette & Language Dropdown */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2" id="theme-palette-container">
            
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-150 backdrop-blur-md px-2.5 h-7.5 rounded-full border border-white/25 shadow-sm cursor-pointer select-none text-[10px] font-black text-white"
                id="global-lang-selector-btn"
              >
                <Globe className="w-3 h-3 text-white shrink-0" />
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 border ${
                  isLangChanging 
                    ? "animate-border-glow bg-slate-100" 
                    : `border-white ${
                        globalLang === "en" ? "bg-emerald-400" :
                        globalLang === "hi" ? "bg-orange-400" :
                        globalLang === "mr" ? "bg-amber-400" :
                        globalLang === "gu" ? "bg-teal-400" :
                        globalLang === "bn" ? "bg-indigo-400" :
                        globalLang === "ta" ? "bg-purple-400" :
                        globalLang === "te" ? "bg-rose-400" :
                        globalLang === "kn" ? "bg-cyan-400" :
                        "bg-sky-400"
                      }`
                }`} />
                <span className="max-w-[70px] truncate">
                  {isLangChanging ? "..." : (INDIAN_LANGUAGES.find((lang) => lang.code === globalLang)?.name.split(" ")[0] || "English")}
                </span>
                <span className="text-[6px] opacity-80">▼</span>
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 10, y: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 bg-slate-950/95 backdrop-blur-lg border border-white/15 rounded-2xl shadow-2xl p-2 z-30 min-w-[160px] max-h-64 overflow-y-auto"
                  >
                    <p className="text-[8px] text-white/50 font-bold uppercase tracking-wider px-2 py-1 border-b border-white/10 mb-1">Language / भाषा</p>
                    <div className="flex flex-col gap-0.5">
                      {INDIAN_LANGUAGES.map((lang) => {
                        const isSelected = globalLang === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onLanguageChange?.(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all w-full text-left cursor-pointer ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                lang.code === "en" ? "bg-emerald-400" :
                                lang.code === "hi" ? "bg-orange-400" :
                                lang.code === "mr" ? "bg-amber-400" :
                                lang.code === "gu" ? "bg-teal-400" :
                                lang.code === "bn" ? "bg-indigo-400" :
                                lang.code === "ta" ? "bg-purple-400" :
                                lang.code === "te" ? "bg-rose-400" :
                                lang.code === "kn" ? "bg-cyan-400" :
                                "bg-sky-400"
                              }`} />
                              <span>{lang.name}</span>
                            </div>
                            {isSelected && <span className="w-1 h-1 rounded-full bg-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Palette Toggle Picker */}
            <div className="relative" ref={themePickerRef}>
              <button
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className="flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-150 backdrop-blur-md w-7.5 h-7.5 rounded-full border border-white/25 shadow-sm cursor-pointer select-none"
                id="theme-palette-toggle-btn"
                title="Change Banner Theme"
              >
                <Palette className="w-3.5 h-3.5 text-white" />
              </button>

              <AnimatePresence>
                {isThemePickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 10, y: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 bg-slate-950/95 backdrop-blur-lg border border-white/15 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 z-30 min-w-[150px]"
                  >
                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider px-1">Select Theme</p>
                    <div className="flex flex-col gap-1">
                      {BANNER_THEMES.map((theme) => {
                        const isSelected = bannerTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => {
                              setBannerTheme(theme.id);
                              localStorage.setItem("gatekaru_login_banner", theme.id);
                              setIsThemePickerOpen(false); // Close after selection
                            }}
                            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all w-full text-left cursor-pointer ${
                              isSelected
                                ? "bg-white/15 text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                              theme.id === "slate" ? "bg-slate-950 border-slate-700" :
                              theme.id === "indigo" ? "bg-indigo-700 border-indigo-400" :
                              theme.id === "emerald" ? "bg-emerald-700 border-emerald-400" :
                              theme.id === "crimson" ? "bg-rose-700 border-rose-400" :
                              "bg-sky-600 border-sky-400"
                            } ${isSelected ? "ring-2 ring-white/80" : ""}`} />
                            <span>{theme.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Install App Button */}
            {onInstallClick && (
              <button
                onClick={onInstallClick}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 h-7.5 rounded-full border border-indigo-400/30 shadow-md cursor-pointer select-none transition-all duration-200 active:scale-95 shrink-0"
                title="Install GateKaru App"
              >
                <span className="animate-bounce">📲</span>
                <span>{globalLang === "hi" ? "ऐप इंस्टॉल" : "Install App"}</span>
              </button>
            )}
          </div>

          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Building className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/logo.svg" 
              alt="GateKaru Logo" 
              onClick={onLogoClick}
              className="w-12 h-12 rounded-xl object-contain cursor-pointer select-none hover:scale-105 active:scale-95 transition-transform shadow-md"
              referrerPolicy="no-referrer"
              title="GateKaru Core"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight">GateKaru</h1>
              <p className={`text-[10px] uppercase tracking-widest font-black transition-all duration-500 ease-in-out ${activeThemeObj.accentClass}`}>Secure Society ERP</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium">Greenwood Heights Society • Multitenant Portal</p>
        </div>

        <div className="p-5 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ENTER MOBILE NUMBER */}
            {step === "phone" && (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-slate-800">{getLoginTranslation("login.title", "GateKaru Login")}</h2>
                  <p className="text-xs text-slate-500 mt-1">{getLoginTranslation("login.subtitle", "Please enter your registered mobile number to access your society workspace.")}</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{getLoginTranslation("login.phone_label", "Mobile Number")}</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={getLoginTranslation("login.phone_placeholder", "E.g., +91 98765 43210")}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                      <span className="shrink-0">⚠️</span> {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {getLoginTranslation("login.get_otp", "Get OTP Code")} <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRegSuccess(null);
                        setError(null);
                        setStep("register");
                      }}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition uppercase tracking-wider cursor-pointer"
                      id="register-toggle-btn"
                    >
                      {getLoginTranslation("login.register_link", "✨ New Registration / नया रजिस्ट्रेशन")}
                    </button>
                  </div>
                </form>

                {/* Simulated Quick Logins - Extremely useful for developer testing */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{getLoginTranslation("login.profiles_title", "Quick Simulator Profiles")}</span>
                    <span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{getLoginTranslation("login.profiles_subtitle", "Demo Mode")}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSelect(u)}
                        className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between text-xs font-semibold ${phoneNumber === u.phone ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:bg-slate-50 text-slate-700"}`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.phone}</p>
                        </div>
                        <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-slate-200/60 rounded text-slate-600">
                          {u.role === "admin" ? "Committee" : u.role === "super_admin" ? "Corporate" : u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: OTP VERIFY */}
            {step === "otp" && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("phone")}
                    className="p-1 rounded-lg hover:bg-slate-100 transition"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{getLoginTranslation("login.otp_title", "OTP Verify")}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{getLoginTranslation("login.otp_subtitle", "Enter verification code sent to")} <span className="font-mono text-slate-700 font-bold">{phoneNumber}</span></p>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{getLoginTranslation("login.otp_label", "Verification Code")}</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-black tracking-[0.4em] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="bg-sky-50 text-sky-800 border border-sky-100 rounded-xl p-3 text-[11px] font-semibold flex items-start gap-2 leading-relaxed">
                    <span className="text-sky-500 text-sm">💡</span>
                    <div>
                      {getLoginTranslation("login.sandbox_notice", "For sandbox simulation testing, enter the generated OTP to proceed.")}{" "}
                      <strong className="font-mono bg-sky-100 px-1.5 py-0.5 rounded text-sky-900">{expectedOtp}</strong>
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {getLoginTranslation("login.otp_button", "Verify OTP")} <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2.5: NEW MEMBER REGISTRATION */}
            {step === "register" && (
              <motion.div
                key="register-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStep("phone");
                      setError(null);
                      setRegSuccess(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-600 cursor-pointer"
                    type="button"
                    title="Back to Login"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-slate-800">New Registration / रजिस्ट्रेशन</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Register as a Resident, Security Guard or Admin</p>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  
                  {/* Select Role Tabs */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">I am registering as (मैं हूँ):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRegRole("resident");
                          setError(null);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                          regRole === "resident" 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-extrabold" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        🏡 Resident
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRegRole("guard");
                          setError(null);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                          regRole === "guard" 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-extrabold" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        🛡️ Guard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRegRole("admin");
                          setError(null);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                          regRole === "admin" 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-extrabold" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        📊 Committee
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRegRole("both");
                          setError(null);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border transition cursor-pointer text-center ${
                          regRole === "both" 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-extrabold" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        💎 Both (Res + Comm)
                      </button>
                    </div>
                  </div>

                  {/* Common Fields */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex justify-between">
                        <span>Select Building / Society (सोसायटी चुनें)</span>
                        <span className="text-[8px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-bold uppercase">Subscribed / Onboarded</span>
                      </label>
                      <select
                        value={regSociety}
                        onChange={(e) => setRegSociety(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                      >
                        {societies.map((soc) => (
                          <option key={soc.id} value={soc.name}>
                            🏢 {soc.name}
                          </option>
                        ))}
                        {societies.length === 0 && (
                          <>
                            <option value="Greenwood Heights Society">🏢 Greenwood Heights Society</option>
                            <option value="Yashika Residency">🏢 Yashika Residency</option>
                            <option value="Sahil Tower">🏢 Sahil Tower</option>
                            <option value="Silver Maple Heights">🏢 Silver Maple Heights</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Full Name (पूरा नाम)</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="E.g., Rajesh Kumar"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Mobile Number (मोबाइल नंबर)</label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="E.g., +91 99999 11111"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Email Address (ईमेल - Optional)</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="E.g., rajesh@example.com"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* RESIDENT SPECIFIC FIELDS */}
                  {(regRole === "resident" || regRole === "both") && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 mt-1">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Flat Number (फ्लैट नंबर)</label>
                        <input
                          type="text"
                          required
                          value={regFlat}
                          onChange={(e) => setRegFlat(e.target.value)}
                          placeholder="E.g., C-303"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Resident Type</label>
                        <select
                          value={regType}
                          onChange={(e) => setRegType(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none transition"
                        >
                          <option value="Owner">Owner (मालिक)</option>
                          <option value="Tenant">Tenant (किरायेदार)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Vehicle No (Optional)</label>
                        <input
                          type="text"
                          value={regVehicleNo}
                          onChange={(e) => setRegVehicleNo(e.target.value)}
                          placeholder="E.g., HR-26-CD-1111"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* GUARD SPECIFIC FIELDS */}
                  {regRole === "guard" && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-100/50 mt-1">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-black uppercase text-amber-800 tracking-wider">ID Card / Batch No (आईडी कार्ड नंबर)</label>
                        <input
                          type="text"
                          required
                          value={regIdCard}
                          onChange={(e) => setRegIdCard(e.target.value)}
                          placeholder="E.g., SG-901"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-amber-800 tracking-wider">Gate Assignment</label>
                        <select
                          value={regGate}
                          onChange={(e) => setRegGate(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none transition"
                        >
                          <option value="Gate 1">Gate 1</option>
                          <option value="Gate 2">Gate 2</option>
                          <option value="Main Gate">Main Gate</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-amber-800 tracking-wider">Active Shift</label>
                        <select
                          value={regShift}
                          onChange={(e) => setRegShift(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 focus:outline-none transition"
                        >
                          <option value="Day Shift (08:00 AM - 08:00 PM)">Day Shift</option>
                          <option value="Night Shift (08:00 PM - 08:00 AM)">Night Shift</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* COMMITTEE / ADMIN SPECIFIC FIELDS */}
                  {(regRole === "admin" || regRole === "both") && (
                    <div className="grid grid-cols-1 gap-3 p-3 bg-rose-50/40 rounded-xl border border-rose-100/50 mt-1">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-rose-800 tracking-wider">Designation / Role (पद)</label>
                        <input
                          type="text"
                          required
                          value={regDesignation}
                          onChange={(e) => setRegDesignation(e.target.value)}
                          placeholder="E.g., President, Joint Secretary"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-rose-800 tracking-wider">Committee Name (प्रबंध समिति)</label>
                        <input
                          type="text"
                          required
                          value={regCommittee}
                          onChange={(e) => setRegCommittee(e.target.value)}
                          placeholder="E.g., Greenwood Management Committee"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error & Success indicators */}
                  {error && (
                    <div className="text-[11px] text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-2">
                      <span className="shrink-0">⚠️</span> {error}
                    </div>
                  )}

                  {regSuccess && (
                    <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                      <span className="shrink-0 text-emerald-500 text-sm">✓</span> {regSuccess}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setError(null);
                        setRegSuccess(null);
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* STEP 3: WORKSPACE SELECTOR & AUTOMATIC ROLE CHECK */}
            {step === "workspace" && matchedUser && (
              <motion.div
                key="workspace-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full tracking-wider">
                    ✨ System Checked Role Automatically
                  </span>
                  <h2 className="text-lg font-black text-slate-800 mt-2.5">
                    Welcome {matchedUser.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {(matchedUser.id === "u1" || matchedUser.role === "both")
                      ? "Choose the workspace compartment you want to proceed into today. You have multiple active roles."
                      : getLoginTranslation("login.workspace_desc", "Access whitelisted. Proceed directly to your assigned ERP dashboard.")}
                  </p>
                </div>

                {/* Dual role Workspace selection layout */}
                {(matchedUser.id === "u1" || matchedUser.role === "both") ? (
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Choose Workspace</div>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedWorkspace("resident")}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-4 ${selectedWorkspace === "resident" ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-100 hover:bg-slate-50"}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-lg shadow-sm border border-sky-100">
                        🏡
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase">Resident Portal</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Manage visitors, pay maintenance, reserve amenities.</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedWorkspace === "resident" ? "border-indigo-600" : "border-slate-300"}`}>
                        {selectedWorkspace === "resident" && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWorkspace("admin")}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-4 ${selectedWorkspace === "admin" ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-100 hover:bg-slate-50"}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-lg shadow-sm border border-indigo-100">
                        📊
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase">Committee Admin</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Review complaints, manage bills, broadcast bulletins.</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedWorkspace === "admin" ? "border-indigo-600" : "border-slate-300"}`}>
                        {selectedWorkspace === "admin" && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWorkspace("unified")}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-4 ${selectedWorkspace === "unified" ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-100 hover:bg-slate-50"}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg shadow-sm border border-emerald-100">
                        💎
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase">Unified Suite / दोनों एकीकृत</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">View all your resident and committee responsibilities in a single, consolidated overview.</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedWorkspace === "unified" ? "border-indigo-600" : "border-slate-300"}`}>
                        {selectedWorkspace === "unified" && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                      </div>
                    </button>
                  </div>
                ) : (
                  /* Other standard single roles: automatically checked */
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Your Designated Workspace</div>
                    
                    {matchedUser.role === "resident" && (
                      <div className="p-4 rounded-2xl border border-indigo-600 bg-indigo-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">🏡</div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">Resident Portal</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Role: Greenwood Resident ({matchedUser.flat})</p>
                        </div>
                      </div>
                    )}

                    {matchedUser.role === "guard" && (
                      <div className="p-4 rounded-2xl border border-indigo-600 bg-indigo-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">🛡️</div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">Guard App Console</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Role: Security Guard (Gate 1 Staff)</p>
                        </div>
                      </div>
                    )}

                    {matchedUser.role === "admin" && (
                      <div className="p-4 rounded-2xl border border-indigo-600 bg-indigo-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">📊</div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">Committee Dashboard</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Role: Society Management Admin</p>
                        </div>
                      </div>
                    )}

                    {matchedUser.role === "super_admin" && (
                      <div className="p-4 rounded-2xl border border-indigo-600 bg-indigo-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">🏢</div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">Corporate Dashboard</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Role: Super Admin Enterprise</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleFinishLogin}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {getLoginTranslation("login.continue", "Continue")} <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer info links */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex gap-4">
            <span>Enterprise Secure Partition</span>
            <span>GateKaru ERP v2.4.0</span>
          </div>
          <FooterIntegrations globalLang={globalLang || "en"} />
        </div>

      </div>
    </div>
  );
}
