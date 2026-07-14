import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { safeFetchJson } from "./utils/safeFetch";
import { 
  User as UserType, Visitor, MaintenanceBill, Complaint, Notice, ChatMessage, Amenity, AmenityBooking, StaffMember, ParkingSpot, Poll, GuardAlert, SocietyProgram 
} from "./types";
import ResidentPortal from "./components/ResidentPortal";
import GuardPortal from "./components/GuardPortal";
import AdminPortal from "./components/AdminPortal";
import UnifiedDashboard from "./components/UnifiedDashboard";
import SuperAdminPortal from "./components/SuperAdminPortal";
import LoginPortal from "./components/LoginPortal";
import OnboardingPage from "./components/OnboardingPage";
import FooterIntegrations from "./components/FooterIntegrations";
import { getTranslation } from "./utils/translations";
import { PwaInstallModal } from "./components/PwaInstallModal";
import { 
  ShieldAlert, Clock, RefreshCw, Layers, CheckCircle2, AlertTriangle, 
  User, Sparkles, Building2, Wifi, MessageSquare, Menu, HelpCircle, Bell, Globe, Download
} from "lucide-react";
import { ALERT_TEMPLATES, INDIAN_LANGUAGES } from "./utils/alertTemplates";

const FALLBACK_SOS_TRANSLATIONS: { [key: string]: string } = {
  en: "Emergency! SOS alert triggered from Block A elevator - resident trapped.",
  hi: "आपातकाल! ब्लॉक ए लिफ्ट से एसओएस अलर्ट शुरू हुआ - निवासी फंसा हुआ है।",
  mr: "आणीबाणी! ब्लॉक ए लिफ्टमधून एसओएस अलर्ट सुरू झाला - रहिवासी अडकला आहे.",
  gu: "કટોકટી! બ્લોક A લિફ્ટમાંથી SOS એલર્ટ શરૂ થયું - રહેવાસી ફસાયેલ છે.",
  bn: "জরুরী অবস্থা! ব্লক এ লিফট থেকে এসওএস অ্যালার্ট চালু হয়েছে - বাসিন্দা আটকে আছেন।",
  ta: "அவசரநிலை! பிளாக் ஏ லிஃப்ட்டிலிருந்து எஸ்ஓஎஸ் எச்சரிக்கை தூண்டப்பட்டது - வசிப்பவர் சிக்கியுள்ளார்.",
  te: "అత్యవసర పరిస్థితి! బ్లాక్ ఏ లిఫ్ట్ నుండి SOS అలర్ట్ ప్రారంభమైంది - నివాసి చిక్కుకున్నారు.",
  kn: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ! ಬ್ಲಾಕ್ ಎ ಲಿಫ್ಟ್‌ನಿಂದ ಎಸ್‌ಒಎಸ್ ಎಚ್ಚರಿಕೆ ಪ್ರಚೋದಿಸಲ್ಪಟ್ಟಿದೆ - ನಿವಾಸಿ ಸಿಲುಕಿಕೊಂಡಿದ್ದಾರೆ.",
  pa: "ਐਮਰਜੈਂਸੀ! ਬਲਾਕ ਏ ਲਿਫਟ ਤੋਂ ਐਸਓਐਸ ਅਲਰਟ ਸ਼ੁਰੂ ਹੋਇਆ - ਨਿਵਾਸੀ ਫਸਿਆ ਹੋਇਆ ਹੈ।"
};

const FALLBACK_SOS_TITLES: { [key: string]: string } = {
  en: "CRITICAL SOS ALERT",
  hi: "गंभीर एसओएस आपातकाल",
  mr: "गंभीर एसओएस आणीबाणी",
  gu: "ગંભીર એસઓએસ કટોکટી",
  bn: "গুরুতর এসওএস জরুরী অবস্থা",
  ta: "முக்கிய எமர்ஜென்சி",
  te: "తీవ్రమైన ఎమర్జెన్సీ",
  kn: "ತೀವ್ರ ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
  pa: "ਗੰਭੀਰ ਐਮਰਜੈਂਸੀ"
};

export default function App() {
  // Global Data States loaded from server
  const [users, setUsers] = useState<UserType[]>([]);
  
  // Persistent login state: Initialized from localStorage
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem("gatekaru_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [programs, setPrograms] = useState<SocietyProgram[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [parking, setParking] = useState<ParkingSpot[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [alerts, setAlerts] = useState<GuardAlert[]>([]);
  const [settings, setSettings] = useState<{
    promotionalAdsEnabled: boolean;
    activeThemeOverride: string;
    simulatedDate: string;
  }>({
    promotionalAdsEnabled: true,
    activeThemeOverride: "",
    simulatedDate: ""
  });

  // Active UI portal: Auto-driven by current user role, persisted in localStorage
  const [activePortal, setActivePortal] = useState<"resident" | "guard" | "admin" | "super_admin" | "unified">(() => {
    try {
      const saved = localStorage.getItem("gatekaru_portal");
      return (saved as any) || "resident";
    } catch {
      return "resident";
    }
  });

  // Onboarding & simulated Welcome SMS state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [smsNotification, setSmsNotification] = useState<{
    phone: string;
    message: string;
    visible: boolean;
  } | null>(null);

  const triggerWelcomeSMS = (user: UserType) => {
    const welcomeMsg = globalLang === "hi" 
      ? `💬 संदेश (SMS): "नमस्ते ${user.name}! गेटकरू (GateKaru) में आपका स्वागत है। आपकी सोसाइटी Greenwood Heights के लिए डिजिटल गेट सुरक्षा और ईआरपी सक्रिय कर दी गई है।"`
      : globalLang === "mr"
      ? `💬 संदेश (SMS): "नमस्कार ${user.name}! गेटकरू (GateKaru) मध्ये आपले स्वागत आहे. तुमच्या सोसायटी Greenwood Heights साठी डिजिटल गेट सुरक्षा आणि ईआरपी सक्रिय केली गेली आहे।"`
      : `💬 SMS Alert: "Hello ${user.name}! Welcome to GateKaru ERP. Digital Gate Security & Society ERP are now active for Greenwood Heights."`;

    setSmsNotification({
      phone: user.phone || "+91 98765 43210",
      message: welcomeMsg,
      visible: true
    });

    // Auto-hide welcome SMS banner after 12 seconds
    setTimeout(() => {
      setSmsNotification(prev => prev ? { ...prev, visible: false } : null);
    }, 12000);
  };

  // Check onboarding on initial mount or login
  useEffect(() => {
    if (currentUser && (activePortal === "resident" || activePortal === "admin")) {
      const hasOnboarded = localStorage.getItem(`gatekaru_onboarded_${currentUser.id}`);
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
    }
  }, [currentUser, activePortal]);

  // Easter Egg: G logo clicked 5 times
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        // Find Developer Super Admin u6
        const devAdmin = users.find(u => u.email === "jaiganeshdp@gmail.com") || users.find(u => u.role === "super_admin");
        if (devAdmin) {
          setCurrentUser(devAdmin);
          setActivePortal("super_admin");
          setSystemNotification("🔓 GateKaru Developer Super Admin Portal activated via Easter Egg!");
        }
        return 0;
      }
      return next;
    });
  };

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("GateKaru was successfully installed!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    setIsInstallModalOpen(true);
  };

  const triggerInstallPrompt = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install Choice outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Real-time WebSocket connection health status
  const [wsStatus, setWsStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let pingInterval: any = null;
    let attempts = 0;

    const connectWS = () => {
      if (typeof window === "undefined") return;
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/ws`;

      setWsStatus("connecting");
      
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsStatus("connected");
          attempts = 0;
          console.log("⚡ Real-time WebSocket health connection established.");
          
          // Send keepalive ping
          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 15000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "health") {
              console.log("WebSocket connection state:", data.status);
            }
          } catch (e) {
            // Non-json or fallback messages
          }
        };

        ws.onclose = (event) => {
          clearInterval(pingInterval);
          setWsStatus("disconnected");
          console.warn(`WebSocket connection closed (${event.code}). Retrying...`);
          
          // Exponential backoff reconnect
          const delay = Math.min(1000 * Math.pow(2, attempts), 15000);
          attempts++;
          reconnectTimeout = setTimeout(connectWS, delay);
        };

        ws.onerror = (err) => {
          if (ws) ws.close();
        };
      } catch (err) {
        setWsStatus("disconnected");
        reconnectTimeout = setTimeout(connectWS, 5000);
      }
    };

    connectWS();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
    };
  }, []);

  // General States
  const [isLoading, setIsLoading] = useState(true);
  const [systemNotification, setSystemNotification] = useState<string | null>(null);

  const [dndPreferences, setDndPreferences] = useState<{
    globalDnd: boolean;
    muteVisitorChime: boolean;
    muteVoiceAnnounce: boolean;
    muteEmergencyAlert: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem("gatekaru_dnd_preferences");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      globalDnd: false,
      muteVisitorChime: false,
      muteVoiceAnnounce: false,
      muteEmergencyAlert: false
    };
  });

  const [isDndActive, setIsDndActive] = useState(() => {
    try {
      const saved = localStorage.getItem("gatekaru_dnd_preferences");
      if (saved) {
        return JSON.parse(saved).globalDnd;
      }
    } catch (e) {}
    return false;
  });

  const handleUpdateDndPreferences = (prefs: typeof dndPreferences) => {
    setDndPreferences(prefs);
    setIsDndActive(prefs.globalDnd);
  };

  const handleUpdateCurrentUser = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleToggleGlobalDnd = () => {
    const nextVal = !isDndActive;
    setIsDndActive(nextVal);
    setDndPreferences(prev => {
      const next = { ...prev, globalDnd: nextVal };
      localStorage.setItem("gatekaru_dnd_preferences", JSON.stringify(next));
      return next;
    });
  };

  const [timeStr, setTimeStr] = useState("");

  const lastPlayedAlertIdRef = useRef<string | null>(null);

  // Targeted Gate visitor alert states for residents
  const alertedVisitorIdsRef = useRef<Set<string>>(new Set());
  const alertedApprovalIdsRef = useRef<Set<string>>(new Set());
  const [residentAlerts, setResidentAlerts] = useState<any[]>([]);

  // Language Dropdown states
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Portal Dropdown states for multi-role users
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const portalDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (portalDropdownRef.current && !portalDropdownRef.current.contains(event.target as Node)) {
        setIsPortalDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global Language Selection for India (Hindi, English, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, Punjabi)
  const [globalLang, setGlobalLang] = useState<string>(() => {
    return localStorage.getItem("gatekaru_lang") || "en";
  });
  const [isLangChanging, setIsLangChanging] = useState(false);

  const changeLanguage = (lang: string) => {
    setIsLangChanging(true);
    setGlobalLang(lang);
    localStorage.setItem("gatekaru_lang", lang);
    setTimeout(() => {
      setIsLangChanging(false);
    }, 1200); // 1.2s of premium feedback duration
  };

  const getAlertTranslationText = (alert: GuardAlert, lang: string) => {
    const template = ALERT_TEMPLATES.find(t => t.id === alert.type);
    if (template && template.translations[lang]) {
      return template.translations[lang].message;
    }
    if (alert.message && (alert.message.toLowerCase().includes("elevator") || alert.message.toLowerCase().includes("trapped"))) {
      return FALLBACK_SOS_TRANSLATIONS[lang] || alert.message;
    }
    return alert.message;
  };

  const getAlertTranslationTitle = (alert: GuardAlert, lang: string) => {
    const template = ALERT_TEMPLATES.find(t => t.id === alert.type);
    if (template && template.translations[lang]) {
      return template.translations[lang].title;
    }
    if (alert.message && (alert.message.toLowerCase().includes("elevator") || alert.message.toLowerCase().includes("trapped"))) {
      return FALLBACK_SOS_TITLES[lang] || "Critical SOS";
    }
    return alert.type || "Alert";
  };

  const playEmergencySoundAndSpeech = (message: string, langCode: string = "en") => {
    if (isDndActive || dndPreferences.muteEmergencyAlert) {
      console.log("Emergency alert muted: DND mode or emergency mute is active");
      return;
    }
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playRing = (startTime: number) => {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(853, startTime);
        osc2.frequency.setValueAtTime(960, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.setValueAtTime(0.2, startTime + 0.35);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + 0.4);
        osc2.stop(startTime + 0.4);

        const t2 = startTime + 0.5;
        const osc3 = audioCtx.createOscillator();
        const osc4 = audioCtx.createOscillator();
        const gainNode2 = audioCtx.createGain();
        osc3.type = "sine";
        osc4.type = "sine";
        osc3.frequency.setValueAtTime(853, t2);
        osc4.frequency.setValueAtTime(960, t2);
        gainNode2.gain.setValueAtTime(0, t2);
        gainNode2.gain.linearRampToValueAtTime(0.2, t2 + 0.05);
        gainNode2.gain.setValueAtTime(0.2, t2 + 0.35);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.4);
        osc3.connect(gainNode2);
        osc4.connect(gainNode2);
        gainNode2.connect(audioCtx.destination);
        osc3.start(t2);
        osc4.start(t2);
        osc3.stop(t2 + 0.4);
        osc4.stop(t2 + 0.4);
      };

      playRing(audioCtx.currentTime);

      setTimeout(() => {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.90;
          utterance.pitch = 1.0;

          const voices = window.speechSynthesis.getVoices();
          // Try to match the exact Indian accent voice for that lang
          const targetVoice = voices.find(v => 
            v.lang.toLowerCase().startsWith(langCode.toLowerCase()) ||
            (langCode === "en" && v.lang.toLowerCase().includes("in"))
          );
          if (targetVoice) {
            utterance.voice = targetVoice;
          } else {
            // Find any Indian accent voice as a fallback
            const indVoice = voices.find(v => v.lang.toLowerCase().includes("in"));
            if (indVoice) utterance.voice = indVoice;
          }

          window.speechSynthesis.speak(utterance);
        }
      }, 1100);
    } catch (err) {
      console.error("Emergency audio playback failed:", err);
    }
  };

  const playDoorbellChime = () => {
    if (isDndActive || dndPreferences.muteVisitorChime) {
      console.log("Visitor doorbell chime muted by DND settings");
      return;
    }
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(660, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(523.25, now + 0.3);
      gain2.gain.setValueAtTime(0, now + 0.3);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 1.2);
    } catch (err) {
      console.error("Failed to play doorbell chime:", err);
    }
  };

  const speakGateAnnouncement = (message: string) => {
    if (isDndActive || dndPreferences.muteVoiceAnnounce) {
      console.log("Visitor voice announcement muted by DND settings");
      return;
    }
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const inVoice = voices.find(v => v.lang.includes("IN") || v.lang.includes("hi"));
        if (inVoice) {
          utterance.voice = inVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("TTS failed:", err);
    }
  };

  useEffect(() => {
    const activeAl = alerts.find(a => a.status === "Active");
    if (activeAl) {
      if (activeAl.id !== lastPlayedAlertIdRef.current) {
        lastPlayedAlertIdRef.current = activeAl.id;
        
        // Find translated speech based on active language selector!
        const translatedMsg = getAlertTranslationText(activeAl, globalLang);
        
        // Play sound sequence immediately
        playEmergencySoundAndSpeech(translatedMsg, globalLang);
        
        // Play second time after 7.5 seconds
        const timer = setTimeout(() => {
          playEmergencySoundAndSpeech(translatedMsg, globalLang);
        }, 7500);
        
        return () => clearTimeout(timer);
      }
    } else {
      lastPlayedAlertIdRef.current = null;
    }
  }, [alerts, globalLang]);

  // Periodical Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all initial data from express endpoints
  const fetchAllData = async () => {
    try {
      const [
        usersRes, visitorsRes, billsRes, complaintsRes, noticesRes, programsRes,
        chatsRes, amenitiesRes, staffRes, parkingRes, pollsRes, alertsRes, settingsRes
      ] = await Promise.all([
        safeFetchJson("/api/users", undefined, []),
        safeFetchJson("/api/visitors", undefined, []),
        safeFetchJson("/api/maintenance", undefined, []),
        safeFetchJson("/api/complaints", undefined, []),
        safeFetchJson("/api/notices", undefined, []),
        safeFetchJson("/api/programs", undefined, []),
        safeFetchJson("/api/chats", undefined, []),
        safeFetchJson("/api/amenities", undefined, { amenities: [], bookings: [] }),
        safeFetchJson("/api/staff", undefined, []),
        safeFetchJson("/api/parking", undefined, []),
        safeFetchJson("/api/polls", undefined, []),
        safeFetchJson("/api/alerts", undefined, []),
        safeFetchJson("/api/settings", undefined, { promotionalAdsEnabled: true, activeThemeOverride: "", simulatedDate: "" })
      ]);

      setUsers(usersRes);
      // Wait for user to authenticate via GateKaru Login Portal first
      setVisitors(visitorsRes);
      setBills(billsRes);
      setComplaints(complaintsRes);
      setNotices(noticesRes);
      setPrograms(programsRes);
      setChats(chatsRes);
      setAmenities(amenitiesRes.amenities || []);
      setBookings(amenitiesRes.bookings || []);
      setStaff(staffRes);
      setParking(parkingRes);
      setPolls(pollsRes);
      setAlerts(alertsRes);
      if (settingsRes) {
        setSettings(settingsRes);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading application state:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll alerts & settings every 4 seconds to sync SOS & configurations in real-time!
    const pollTimer = setInterval(async () => {
      try {
        const [alRes, settingsRes] = await Promise.all([
          safeFetchJson("/api/alerts", undefined, []),
          safeFetchJson("/api/settings", undefined, { promotionalAdsEnabled: true, activeThemeOverride: "", simulatedDate: "" })
        ]);
        setAlerts(alRes);
        if (settingsRes) {
          setSettings(settingsRes);
        }
        // Check if there is an active alert that we haven't warned about
        const activeAl = alRes.find((a: GuardAlert) => a.status === "Active");
        if (activeAl) {
          const transTitle = getAlertTranslationTitle(activeAl, globalLang);
          const transMsg = getAlertTranslationText(activeAl, globalLang);
          setSystemNotification(`⚠️ ${transTitle}: ${transMsg}`);
        } else {
          setSystemNotification(null);
        }
      } catch (e) {
        // ignore
      }
    }, 4000);

    return () => clearInterval(pollTimer);
  }, [globalLang]);

  // Targeted alerts and polling for resident notifications
  useEffect(() => {
    if (currentUser && currentUser.role === "resident") {
      // Fetch currently checked-in visitors and approvals to prime our "seen" refs
      Promise.all([
        safeFetchJson("/api/visitors", undefined, []),
        safeFetchJson("/api/approvals", undefined, [])
      ]).then(([vList, aList]) => {
        const seenV = new Set<string>();
        vList.forEach((v: any) => {
          if (v.flat === currentUser.flat && v.status === "Checked-In") {
            seenV.add(v.id);
          }
        });
        alertedVisitorIdsRef.current = seenV;

        const seenA = new Set<string>();
        aList.forEach((a: any) => {
          if (a.flat === currentUser.flat) {
            seenA.add(a.id);
          }
        });
        alertedApprovalIdsRef.current = seenA;
        setResidentAlerts([]);
      }).catch(err => console.warn("Error priming resident alert refs:", err));
    } else {
      alertedVisitorIdsRef.current = new Set();
      alertedApprovalIdsRef.current = new Set();
      setResidentAlerts([]);
    }
  }, [currentUser]);

  // Poll for visitors and approvals for the active resident
  useEffect(() => {
    if (!currentUser || currentUser.role !== "resident") return;

    const pollResidentData = async () => {
      try {
        const [vRes, aRes] = await Promise.all([
          safeFetchJson("/api/visitors", undefined, []),
          safeFetchJson("/api/approvals", undefined, [])
        ]);

        // Sync visitors list
        setVisitors(vRes);

        // Check for new Checked-In visitors for the resident's flat
        vRes.forEach((visitor: any) => {
          if (
            visitor.flat === currentUser.flat &&
            visitor.status === "Checked-In" &&
            !alertedVisitorIdsRef.current.has(visitor.id)
          ) {
            alertedVisitorIdsRef.current.add(visitor.id);
            // Add to active alerts list
            setResidentAlerts(prev => [
              ...prev,
              {
                id: `alert-vis-${visitor.id}`,
                visitorId: visitor.id,
                visitorName: visitor.name,
                type: visitor.type,
                company: visitor.company || "Personal",
                flat: visitor.flat,
                status: "Checked-In",
                vehicleNumber: visitor.vehicleNumber
              }
            ]);
            // Play doorbell and voice announcement
            playDoorbellChime();
            speakGateAnnouncement(`Attention! Your guest, ${visitor.name}, has checked in at the gate.`);
          }
        });

        // Check for new Waiting approvals for the resident's flat
        aRes.forEach((app: any) => {
          if (
            app.flat === currentUser.flat &&
            app.status === "Waiting" &&
            !alertedApprovalIdsRef.current.has(app.id)
          ) {
            alertedApprovalIdsRef.current.add(app.id);
            setResidentAlerts(prev => [
              ...prev,
              {
                id: `alert-app-${app.id}`,
                approvalId: app.id,
                visitorName: app.visitorName,
                type: app.type,
                company: app.company || "Personal",
                flat: app.flat,
                status: "Waiting",
                vehicleNumber: app.vehicleNumber
              }
            ]);
            playDoorbellChime();
            speakGateAnnouncement(`Attention! ${app.visitorName} is waiting at the gate. Please approve entry.`);
          }
        });
      } catch (err) {
        console.warn("Error polling resident alerts (gracefully handled):", err);
      }
    };

    const interval = setInterval(pollResidentData, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleResidentApprovalAction = async (alertId: string, approvalId: string, action: "Approved" | "Rejected") => {
    try {
      const response = await fetch("/api/approvals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: approvalId, action })
      });
      if (response.ok) {
        // Remove from alerts
        setResidentAlerts(prev => prev.filter(al => al.id !== alertId));
        // Show confirmation toast/alert
        alert(`Gate entry request ${action === "Approved" ? "APPROVED (प्रवेश स्वीकृत)" : "REJECTED (अस्वीकार)"} successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync state helpers
  const handleTriggerSOS = async (msg: string, type?: string) => {
    try {
      const response = await fetch("/api/alerts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: currentUser?.name || "GateKaru Resident",
          message: msg,
          type: type || "Emergency SOS"
        })
      });
      if (response.ok) {
        const newAl = await response.json();
        setAlerts(prev => [newAl, ...prev]);
        setSystemNotification(`⚠️ EMERGENCY ALERT BROADCASTED: ${msg}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      const response = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Resolved" } : a));
        setSystemNotification(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVisitor = (newVisitor: Visitor) => {
    setVisitors(prev => [newVisitor, ...prev]);
  };

  const handlePayBill = (billId: string) => {
    setBills(prev => prev.map(b => b.id === billId ? { ...b, status: "Paid", paidAt: new Date().toISOString() } : b));
  };

  const handleAddComplaint = (newComp: Complaint) => {
    setComplaints(prev => [newComp, ...prev]);
  };

  const handleSendChat = async (msgText: string) => {
    if (!msgText.trim() || !currentUser) return;
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: currentUser.name,
          role: currentUser.role === "admin" ? "Admin" : "Resident",
          flat: currentUser.flat || "Committee",
          message: msgText
        })
      });
      if (response.ok) {
        const newMsg = await response.json();
        setChats(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch Profiles
  const handleProfileSwitch = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      localStorage.setItem("gatekaru_user", JSON.stringify(selected));
      if (selected.role === "super_admin") {
        setActivePortal("super_admin");
        localStorage.setItem("gatekaru_portal", "super_admin");
      } else if (selected.role === "admin") {
        setActivePortal("admin");
        localStorage.setItem("gatekaru_portal", "admin");
      } else if (selected.role === "guard") {
        setActivePortal("guard");
        localStorage.setItem("gatekaru_portal", "guard");
      } else {
        setActivePortal("resident");
        localStorage.setItem("gatekaru_portal", "resident");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("gatekaru_user");
    localStorage.removeItem("gatekaru_portal");
    setShowOnboarding(false);
    setSmsNotification(null);
  };

  const handleLoginSuccess = (user: UserType, portal: "resident" | "guard" | "admin" | "super_admin" | "unified") => {
    setCurrentUser(user);
    setActivePortal(portal);
    localStorage.setItem("gatekaru_user", JSON.stringify(user));
    localStorage.setItem("gatekaru_portal", portal);

    // Check onboarding for first-time login
    if (portal === "resident" || portal === "admin" || portal === "unified") {
      const onboardKey = `gatekaru_onboarded_${user.id}`;
      if (!localStorage.getItem(onboardKey)) {
        setShowOnboarding(true);
        triggerWelcomeSMS(user);
      }
    }
  };

  // AI Helpers proxy calls
  const handleHelpWithComplaint = async (title: string, desc: string, callback: (data: any) => void) => {
    try {
      const response = await fetch("/api/complaints/ai-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc })
      });
      const data = await response.json();
      callback(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateNoticeAi = async (topic: string, category: string, callback: (data: any) => void) => {
    try {
      const response = await fetch("/api/notices/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category })
      });
      const data = await response.json();
      callback(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatBotQuery = async (message: string, callback: (reply: string) => void) => {
    try {
      const response = await fetch("/api/chats/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      callback(data.reply);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetAiAnalytics = async (callback: (data: any) => void) => {
    try {
      const response = await fetch("/api/analytics/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      callback(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      const merged = { ...settings, ...newSettings };
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged)
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const handleBookAmenity = async (amenityId: string, date: string, slot: string) => {
    try {
      const response = await fetch("/api/amenities/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amenityId,
          residentName: currentUser?.name,
          flat: currentUser?.flat,
          date,
          timeSlot: slot
        })
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(prev => [...prev, data.booking]);
        // reload bills because a booking might auto-charge a fee
        fetch("/api/maintenance").then(res => res.json()).then(setBills);
      } else {
        const errData = await response.json();
        alert(errData.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVisitorAction = async (params: any) => {
    try {
      const response = await fetch("/api/visitors/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (response.ok) {
        const data = await response.json();
        // reload visitor list
        fetch("/api/visitors").then(res => res.json()).then(setVisitors);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStaffAction = async (code: string, action: "checkin" | "checkout") => {
    try {
      const response = await fetch("/api/staff/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action })
      });
      if (response.ok) {
        fetch("/api/staff").then(res => res.json()).then(setStaff);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateComplaint = async (id: string, status: any, assignedTo?: string, note?: string) => {
    try {
      const response = await fetch("/api/complaints/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, assignedTo, note })
      });
      if (response.ok) {
        fetch("/api/complaints").then(res => res.json()).then(setComplaints);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNotice = (newNotice: Notice) => {
    setNotices(prev => [newNotice, ...prev]);
  };

  const handleAddPoll = (newPoll: Poll) => {
    setPolls(prev => [newPoll, ...prev]);
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionId, userId: currentUser.id })
      });
      if (response.ok) {
        fetch("/api/polls").then(res => res.json()).then(setPolls);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to vote");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-slate-950 text-white items-center justify-center flex-col gap-6 font-sans select-none overflow-hidden relative">
        {/* Glow backdrop */}
        <div className="absolute w-[250px] h-[250px] rounded-full bg-indigo-500/10 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center gap-6 z-10">
          {/* Custom animated shield logo replicating the Android native splash icon */}
          <div className="w-24 h-24 relative animate-pulse">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              {/* Outer Golden Border */}
              <path
                fill="#F59E0B"
                d="M50,4 C72,18 88,25 88,25 L88,58 C88,78 50,94 50,94 C50,94 12,78 12,58 L12,25 C12,25 28,18 50,4 Z"
              />
              {/* Inner Royal Slate/Indigo Body */}
              <path
                fill="#0F172A"
                d="M50,8 C69,21 84,27 84,27 L84,56 C84,74 50,89 50,89 C50,89 16,74 16,56 L16,27 C16,27 31,21 50,8 Z"
              />
              {/* Golden Accents Half-Shade */}
              <path
                fill="#F59E0B"
                fillOpacity="0.12"
                d="M50,8 C50,8 50,89 50,89 C50,89 16,74 16,56 L16,27 C16,27 31,21 50,8 Z"
              />
              {/* Gate Grid Lines */}
              <path
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.8"
                d="M32,38 L68,38 M32,48 L68,48 M32,58 L68,58 M36,30 L36,66 M50,30 L50,66 M64,30 L64,66"
              />
              {/* Center Lock */}
              <path fill="#F59E0B" d="M44,44 L56,44 L56,56 L44,56 Z" />
              <path fill="#0F172A" d="M48,48 L52,48 L52,52 L48,52 Z" />
              <path
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                d="M46,44 C46,40 50,37 50,37 C50,37 54,40 54,44"
              />
            </svg>
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
              GATEKARU
            </h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.25em] animate-pulse">
              Society ERP &amp; Gate Security Access
            </p>
          </div>
        </div>

        {/* Small subtle spinner at the very bottom */}
        <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
          <span>Synchronizing Security Nodes...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginPortal 
        users={users} 
        onLoginSuccess={handleLoginSuccess} 
        onLogoClick={handleLogoClick}
        onRegisterSuccess={fetchAllData}
        globalLang={globalLang}
        onLanguageChange={changeLanguage}
        isLangChanging={isLangChanging}
        isInstallable={isInstallable}
        onInstallClick={handleInstallClick}
      />
    );
  }

  if (currentUser && showOnboarding) {
    return (
      <OnboardingPage
        currentUser={currentUser}
        globalLang={globalLang}
        onComplete={(goal) => {
          localStorage.setItem(`gatekaru_onboarded_${currentUser.id}`, "true");
          setShowOnboarding(false);
        }}
        onLanguageChange={changeLanguage}
      />
    );
  }

  if (currentUser && activePortal === "super_admin") {
    return (
      <SuperAdminPortal 
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onSwitchPortal={(portal: any) => {
          setActivePortal(portal);
          localStorage.setItem("gatekaru_portal", portal);
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
        globalLang={globalLang}
      />
    );
  }

  const availablePortals: { id: string; name: string; icon: string }[] = [];
  if (currentUser) {
    if (currentUser.role === "both") {
      availablePortals.push({ id: "unified", name: getTranslation(globalLang, "app.unified_portal", "Unified Suite / दोनों एकीकृत"), icon: "💎" });
    }
    if (currentUser.role === "resident" || currentUser.role === "both" || currentUser.id === "u1") {
      availablePortals.push({ id: "resident", name: getTranslation(globalLang, "app.resident_portal", "Resident Portal"), icon: "🏡" });
    }
    if (currentUser.role === "guard") {
      availablePortals.push({ id: "guard", name: getTranslation(globalLang, "app.guard_portal", "Guard Station"), icon: "🛡️" });
    }
    if (currentUser.role === "admin" || currentUser.role === "both" || currentUser.id === "u1") {
      availablePortals.push({ id: "admin", name: getTranslation(globalLang, "app.admin_portal", "Committee Admin"), icon: "📊" });
    }
    if (currentUser.role === "super_admin") {
      availablePortals.push({ id: "super_admin", name: getTranslation(globalLang, "app.super_admin_portal", "Super Admin"), icon: "🏢" });
    }
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* MAIN WINDOW (Full Width - Solved Double Sidebar Issue) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          
          {/* Logo and Society Name */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="GateKaru Logo" 
              onClick={handleLogoClick}
              className="w-8 h-8 rounded-lg object-contain cursor-pointer select-none active:scale-95 transition-transform shrink-0 shadow-sm"
              referrerPolicy="no-referrer"
              title="GateKaru Core"
            />
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-slate-800 leading-none">GateKaru</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                {getTranslation(globalLang, "app.society_name", "Greenwood Heights Society")}
              </span>
            </div>

            {/* Active Portal Title Indicator */}
            <div className="hidden md:flex items-center pl-3 border-l border-slate-200 ml-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                {activePortal === "unified" ? getTranslation(globalLang, "portal.unified_title", "💎 Unified Multi-Role Suite") :
                 activePortal === "resident" ? getTranslation(globalLang, "portal.resident_title", "🏡 Resident Dashboard") : 
                 activePortal === "guard" ? getTranslation(globalLang, "portal.guard_title", "🛡️ Security Guard Station") : 
                 activePortal === "admin" ? getTranslation(globalLang, "portal.admin_title", "📊 Society Committee Suite") : 
                 getTranslation(globalLang, "portal.super_admin_title", "🏢 Platform Super Admin")}
              </span>
            </div>
          </div>

          {/* AI Security Pulse Widget in Header (Pulsing badge) */}
          <div className="hidden xl:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-900 animate-pulse max-w-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-[10px] font-medium leading-none truncate">
              {getTranslation(globalLang, "app.ai_pulse_text", "Gate 1 traffic is optimal. AI reports all registered RFID staff entries are processed.")}
            </span>
          </div>

          {/* Quick Real-Time Profile Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Portal Switcher Dropdown (for multi-portal users like Aarav Sharma) */}
            {availablePortals.length > 1 && (
              <div className="relative" ref={portalDropdownRef}>
                <button
                  onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-bold text-xs transition cursor-pointer select-none active:scale-[0.98]"
                >
                  <span>{availablePortals.find(p => p.id === activePortal)?.icon || "🔄"}</span>
                  <span className="hidden sm:inline">{availablePortals.find(p => p.id === activePortal)?.name || "Switch Portal"}</span>
                  <span className="text-[8px] text-slate-400 font-black ml-0.5">▼</span>
                </button>
                <AnimatePresence>
                  {isPortalDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-1 border-b border-slate-100 mb-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Portals</p>
                      </div>
                      {availablePortals.map((p) => {
                        const isSelected = activePortal === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActivePortal(p.id as any);
                              localStorage.setItem("gatekaru_portal", p.id);
                              setIsPortalDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-700 font-black"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{p.icon}</span>
                            <span>{p.name}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl text-indigo-900 font-bold text-xs transition cursor-pointer select-none active:scale-[0.98]"
                id="global-lang-selector-btn"
                aria-haspopup="listbox"
                aria-expanded={isLangDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                
                 {/* Active status dot changing color based on language */}
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 transition-all duration-300 shadow-sm border-2 ${
                  isLangChanging 
                    ? "animate-border-glow border-2 bg-slate-100" 
                    : `border-white ${
                        globalLang === "en" ? "bg-emerald-500 shadow-emerald-200/50" :
                        globalLang === "hi" ? "bg-orange-500 shadow-orange-200/50" :
                        globalLang === "mr" ? "bg-amber-500 shadow-amber-200/50" :
                        globalLang === "gu" ? "bg-teal-500 shadow-teal-200/50" :
                        globalLang === "bn" ? "bg-indigo-500 shadow-indigo-200/50" :
                        globalLang === "ta" ? "bg-purple-500 shadow-purple-200/50" :
                        globalLang === "te" ? "bg-rose-500 shadow-rose-200/50" :
                        globalLang === "kn" ? "bg-cyan-500 shadow-cyan-200/50" :
                        "bg-sky-500 shadow-sky-200/50"
                      }`
                }`} />

                <AnimatePresence mode="wait">
                  <motion.span
                    key={isLangChanging ? "changing" : globalLang}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="truncate max-w-[120px] inline-block font-extrabold"
                  >
                    {isLangChanging 
                      ? (globalLang === "hi" ? "बदल रहा है..." : globalLang === "mr" ? "बदलत आहे..." : "Switching...") 
                      : (INDIAN_LANGUAGES.find((lang) => lang.code === globalLang)?.name || "English")}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[8px] text-indigo-400 font-black ml-0.5">▼</span>
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden"
                    role="listbox"
                  >
                    <div className="px-3 py-1 border-b border-slate-100 mb-1">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Select Language</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {INDIAN_LANGUAGES.map((lang) => {
                        const isSelected = globalLang === lang.code;
                        return (
                          <button
                            key={lang.code}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-bold transition flex items-center justify-between ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-700 font-black"
                                : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                lang.code === "en" ? "bg-emerald-500" :
                                lang.code === "hi" ? "bg-orange-500" :
                                lang.code === "mr" ? "bg-amber-500" :
                                lang.code === "gu" ? "bg-teal-500" :
                                lang.code === "bn" ? "bg-indigo-500" :
                                lang.code === "ta" ? "bg-purple-500" :
                                lang.code === "te" ? "bg-rose-500" :
                                lang.code === "kn" ? "bg-cyan-500" :
                                "bg-sky-500"
                              }`} />
                              <span>{lang.name}</span>
                            </div>
                            {isSelected && (
                              <motion.span 
                                layoutId="activeLangIndicator"
                                className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Active Status Avatar Badge */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center gap-2 pl-1 border-l border-slate-200 ml-0.5"
                id="active-session-status-badge"
              >
                <div className="relative group cursor-pointer">
                  {/* Avatar Circle with role-based colors */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${
                    activePortal === "resident" ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" :
                    activePortal === "guard" ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" :
                    activePortal === "admin" ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" :
                    "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-100"
                  }`}>
                    {currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                  </div>
                  
                  {/* Active Status Indicator Dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                  </span>

                  {/* Elegant Hover Details Tooltip */}
                  <div className="pointer-events-none absolute right-0 mt-2 w-52 bg-slate-950 text-white text-[11px] rounded-xl py-2.5 px-3 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-slate-800 scale-95 group-hover:scale-100 origin-top-right">
                    <div className="font-extrabold text-slate-200 truncate flex items-center gap-1">
                      <span>{currentUser.name}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{currentUser.email}</p>
                    
                    {currentUser.flat && (
                      <p className="text-[9px] text-indigo-300 font-bold mt-1">🏡 Flat: {currentUser.flat}</p>
                    )}
                    {currentUser.gate && (
                      <p className="text-[9px] text-amber-300 font-bold mt-1">🛡️ Gate: {currentUser.gate} ({currentUser.shift || "Active Shift"})</p>
                    )}
                    {currentUser.committee && (
                      <p className="text-[9px] text-rose-300 font-bold mt-1">📊 Role: {currentUser.committee}</p>
                    )}

                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-black text-[8px] uppercase tracking-wider text-emerald-400">
                        {activePortal === "resident" ? getTranslation(globalLang, "status.resident_active", "Resident Active") :
                         activePortal === "guard" ? getTranslation(globalLang, "status.guard_active", "Guard Session Active") :
                         activePortal === "admin" ? getTranslation(globalLang, "status.admin_active", "Admin Session Active") : 
                         getTranslation(globalLang, "status.super_admin_active", "Super Admin Active")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {timeStr}
            </div>

            {/* PWA Install Button */}
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200/60 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={getTranslation(globalLang, "app.install_pwa", "Install GateKaru App")}
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" />
              <span>{getTranslation(globalLang, "app.install", "Install App")}</span>
            </button>

            {/* Sign Out Button */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.button
                  key={globalLang}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title={getTranslation(globalLang, "app.logout", "Sign Out")}
                >
                  <span>🚪</span> {getTranslation(globalLang, "app.logout", "Sign Out")}
                </motion.button>
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Global Urgent Emergency Ticker */}
        {systemNotification && (
          <div className={`${isDndActive ? "bg-slate-800 border-b border-slate-700" : "bg-red-600 animate-pulse"} text-white px-6 py-2.5 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0`}>
            <span className="flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 text-white ${isDndActive ? "" : "animate-spin"}`} /> 
              <span>
                {systemNotification} {isDndActive && <span className="text-amber-400 font-extrabold uppercase ml-2">[🔇 DND ACTIVE / MUTED]</span>}
              </span>
            </span>
            <div className="flex items-center gap-2.5">
              {!isDndActive && (
                <button 
                  onClick={() => {
                    const activeAl = alerts.find(a => a.status === "Active");
                    if (activeAl) {
                      const transMsg = getAlertTranslationText(activeAl, globalLang);
                      playEmergencySoundAndSpeech(transMsg, globalLang);
                    } else {
                      const transMsg = FALLBACK_SOS_TRANSLATIONS[globalLang] || "Emergency! SOS alert triggered from Block A elevator - resident trapped.";
                      playEmergencySoundAndSpeech(transMsg, globalLang);
                    }
                  }}
                  className="bg-white/25 hover:bg-white/40 text-white font-black px-2.5 py-1 rounded-lg border border-white/20 uppercase text-[9px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  🔊 Play Alarm
                </button>
              )}
              
              {/* DND Toggle Button */}
              <button
                onClick={handleToggleGlobalDnd}
                className={`font-black px-2.5 py-1 rounded-lg border uppercase text-[9px] flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                  isDndActive 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500" 
                    : "bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-400 font-extrabold"
                }`}
                title={isDndActive ? "Turn On Alarm Sounds" : "Mute & Turn On Do Not Disturb"}
              >
                {isDndActive ? "🔊 Turn Alarm On" : "🔇 DND (MUTE ALL)"}
              </button>

              <button 
                onClick={() => setSystemNotification(null)}
                className="text-white hover:text-slate-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-bold uppercase cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        )}

        {/* Active Portal Panel Canvas */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* Simulated Mobile SMS alert popup */}
          {smsNotification && smsNotification.visible && (
            <motion.div
              initial={{ opacity: 0, y: -80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md w-full bg-slate-900 border-2 border-indigo-500 text-white rounded-2xl shadow-2xl p-4 flex gap-3 z-50 pointer-events-auto"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xl shrink-0">
                💬
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">SMS Alert (simulated)</span>
                  <button 
                    onClick={() => setSmsNotification(prev => prev ? { ...prev, visible: false } : null)}
                    className="text-slate-400 hover:text-white font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <h5 className="text-xs font-black text-white mt-0.5">GateKaru System Dispatched</h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {smsNotification.message}
                </p>
                <span className="text-[9px] font-bold text-slate-500 mt-1.5 block font-mono">To: {smsNotification.phone}</span>
              </div>
            </motion.div>
          )}

          {currentUser && activePortal === "resident" && (
            <ResidentPortal 
              currentUser={currentUser}
              onSOS={handleTriggerSOS}
              visitors={visitors}
              onAddVisitor={handleAddVisitor}
              bills={bills}
              onPayBill={handlePayBill}
              complaints={complaints}
              onAddComplaint={handleAddComplaint}
              onHelpWithComplaint={handleHelpWithComplaint}
              chats={chats}
              onSendChat={handleSendChat}
              onChatBotQuery={handleChatBotQuery}
              amenities={amenities}
              bookings={bookings}
              onBookAmenity={handleBookAmenity}
              staff={staff}
              parking={parking}
              polls={polls}
              onVote={handleVote}
              promotionalAdsEnabled={settings.promotionalAdsEnabled}
              activeThemeOverride={settings.activeThemeOverride}
              simulatedDate={settings.simulatedDate}
              globalLang={globalLang}
              dndPreferences={dndPreferences}
              onUpdateDndPreferences={handleUpdateDndPreferences}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              programs={programs}
              onRefreshPrograms={fetchAllData}
            />
          )}

          {activePortal === "guard" && (
            <GuardPortal 
              users={users}
              visitors={visitors}
              onVisitorAction={handleVisitorAction}
              staff={staff}
              onStaffAction={handleStaffAction}
              alerts={alerts}
              onTriggerSOS={handleTriggerSOS}
              onResolveAlert={handleResolveAlert}
              globalLang={globalLang}
            />
          )}

          {currentUser && activePortal === "admin" && (
            <AdminPortal 
              currentUser={currentUser}
              users={users}
              onApproveResident={fetchAllData}
              visitors={visitors}
              bills={bills}
              complaints={complaints}
              onUpdateComplaint={handleUpdateComplaint}
              notices={notices}
              onAddNotice={handleAddNotice}
              onGenerateNoticeAi={handleGenerateNoticeAi}
              polls={polls}
              onAddPoll={handleAddPoll}
              staff={staff}
              parking={parking}
              onGetAiAnalytics={handleGetAiAnalytics}
              alerts={alerts}
              onTriggerSOS={handleTriggerSOS}
              onResolveAlert={handleResolveAlert}
              globalLang={globalLang}
              programs={programs}
              onRefreshPrograms={fetchAllData}
            />
          )}

          {currentUser && activePortal === "unified" && (
            <UnifiedDashboard 
              currentUser={currentUser}
              users={users}
              onApproveResident={fetchAllData}
              visitors={visitors}
              onVisitorAction={handleVisitorAction}
              bills={bills}
              onPayBill={handlePayBill}
              complaints={complaints}
              onAddComplaint={handleAddComplaint}
              onUpdateComplaint={handleUpdateComplaint}
              notices={notices}
              onAddNotice={handleAddNotice}
              polls={polls}
              onVotePoll={handleVote}
              onAddPoll={handleAddPoll}
              alerts={alerts}
              onTriggerSOS={handleTriggerSOS}
              onResolveAlert={handleResolveAlert}
              globalLang={globalLang}
            />
          )}

          {activePortal === "super_admin" && (
            <SuperAdminPortal 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onSwitchPortal={(portal: any) => {
                setActivePortal(portal);
                localStorage.setItem("gatekaru_portal", portal);
              }}
              onLogout={handleLogout}
              currentUser={currentUser}
              globalLang={globalLang}
              users={users}
            />
          )}
        </div>

        {/* Dynamic Footer */}
        <footer className="min-h-12 py-2 sm:py-0 bg-white border-t border-slate-200 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>{getTranslation(globalLang, "app.uptime", "Enterprise Secure Partition • Green Uptime Node")}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <FooterIntegrations globalLang={globalLang} />
          </div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1">
              <Wifi className={`w-3.5 h-3.5 transition-colors duration-300 ${
                wsStatus === "connected" ? "text-green-500" : wsStatus === "connecting" ? "text-amber-500 animate-pulse" : "text-red-500"
              }`} />
              {getTranslation(globalLang, "app.db_sync", "Database Live Sync")}
            </span>
            <span className="flex items-center gap-1.5 select-none">
              <span className={`w-2.5 h-2.5 rounded-full inline-block transition-all duration-500 ${
                wsStatus === "connected" 
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" 
                  : wsStatus === "connecting" 
                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" 
                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
              }`} />
              <span className={`font-black tracking-wider transition-colors duration-300 ${
                wsStatus === "connected" 
                  ? "text-green-500" 
                  : wsStatus === "connecting" 
                    ? "text-amber-500" 
                    : "text-red-500"
              }`}>
                {wsStatus === "connected" 
                  ? getTranslation(globalLang, "app.optimal", "Optimal") 
                  : wsStatus === "connecting" 
                    ? (globalLang === "hi" ? "कनेक्ट हो रहा है..." : globalLang === "mr" ? "कनेक्ट होत आहे..." : "Connecting...") 
                    : (globalLang === "hi" ? "ऑफ़लाइन" : globalLang === "mr" ? "ऑफलाईन" : "Offline")}
              </span>
            </span>
          </div>
        </footer>
      </div>

      {/* Real-time Targeted Resident Alert Overlay */}
      <div className="fixed bottom-14 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {residentAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl border-2 border-indigo-600 shadow-2xl p-4 pointer-events-auto flex flex-col gap-3 relative overflow-hidden"
              style={{ boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(79, 70, 229, 0.1)" }}
            >
              {/* Highlight bar depending on status */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${alert.status === "Waiting" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              
              <div className="flex items-start gap-3 mt-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-2xl ${alert.status === "Waiting" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {alert.type === "Delivery" ? "📦" : alert.type === "Cab" ? "🚗" : alert.type === "Service" ? "🔧" : "👤"}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {alert.company ? `${alert.type} • ${alert.company}` : alert.type}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-2 py-0.5 rounded-full">
                      My Flat {alert.flat}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-black text-slate-800 mt-1">
                    {alert.status === "Waiting" ? "Gate Entry Request" : "Guest Arrived at Gate!"}
                  </h4>
                  
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {alert.status === "Waiting" ? (
                      <>
                        <strong className="text-slate-900 font-bold">{alert.visitorName}</strong> is waiting at Gate 1 and requests your entry approval.
                      </>
                    ) : (
                      <>
                        Your guest <strong className="text-slate-900 font-bold">{alert.visitorName}</strong> has checked in at the gate and is heading to your flat!
                      </>
                    )}
                  </p>

                  {alert.vehicleNumber && alert.vehicleNumber !== "No Vehicle" && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Vehicle: {alert.vehicleNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-1 justify-end">
                {alert.status === "Waiting" ? (
                  <>
                    <button
                      onClick={() => handleResidentApprovalAction(alert.id, alert.approvalId, "Rejected")}
                      className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      👎 REJECT (अस्वीकार)
                    </button>
                    <button
                      onClick={() => handleResidentApprovalAction(alert.id, alert.approvalId, "Approved")}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      👍 APPROVE (प्रवेश अनुमति)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setResidentAlerts(prev => prev.filter(al => al.id !== alert.id))}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    👍 Acknowledge / Got it
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* PWA Install Guide Modal */}
      <PwaInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isAutomatedSupported={isInstallable}
        onInstallAutomated={triggerInstallPrompt}
        globalLang={globalLang}
      />
    </div>
  );
}
