import React, { useState, useEffect } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import { 
  User, Visitor, MaintenanceBill, Complaint, Notice, ChatMessage, Amenity, AmenityBooking, StaffMember, ParkingSpot, Poll, SocietyProgram 
} from "../types";
import { 
  Plus, ShieldAlert, Package, Car, Users, CreditCard, Send, Sparkles, MapPin, 
  CheckCircle2, AlertTriangle, Clock, Calendar, HelpCircle, FileText, QrCode, 
  Lock, MessageSquare, Volume2, ArrowRight, ArrowLeft, Share2, ShieldCheck, Dumbbell, UploadCloud, Check, User as UserIcon,
  LayoutDashboard, Settings, CloudSun, PhoneCall, Trash2, Bell, ChevronRight, Menu, Wrench, Tag, Copy, Sparkle, Printer,
  BatteryCharging, Camera, RefreshCw, Download, Search, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getActiveFestival, FestivalTheme } from "../utils/festivalThemes";
import { SmartGateService } from "../utils/smartGateService";
import { getTranslation } from "../utils/translations";
import ApplicationList from "./ApplicationList";
import FestivalHub from "./FestivalHub";

interface ResidentPortalProps {
  currentUser: User;
  onSOS: (msg: string) => void;
  visitors: Visitor[];
  onAddVisitor: (newVisitor: Visitor) => void;
  bills: MaintenanceBill[];
  onPayBill: (billId: string) => void;
  complaints: Complaint[];
  onAddComplaint: (newComplaint: Complaint) => void;
  onHelpWithComplaint: (title: string, desc: string, callback: (data: { draft: string; suggestions: string[] }) => void) => void;
  chats: ChatMessage[];
  onSendChat: (msg: string) => void;
  onChatBotQuery: (msg: string, callback: (reply: string) => void) => void;
  amenities: Amenity[];
  bookings: AmenityBooking[];
  onBookAmenity: (amenityId: string, date: string, slot: string) => void;
  staff: StaffMember[];
  parking: ParkingSpot[];
  polls: Poll[];
  onVote: (pollId: string, optionId: string) => void;
  promotionalAdsEnabled: boolean;
  activeThemeOverride: string;
  simulatedDate: string;
  globalLang?: string;
  dndPreferences?: {
    globalDnd: boolean;
    muteVisitorChime: boolean;
    muteVoiceAnnounce: boolean;
    muteEmergencyAlert: boolean;
  };
  onUpdateDndPreferences?: (prefs: {
    globalDnd: boolean;
    muteVisitorChime: boolean;
    muteVoiceAnnounce: boolean;
    muteEmergencyAlert: boolean;
  }) => void;
  onUpdateCurrentUser?: (updatedUser: User) => void;
  programs?: SocietyProgram[];
  onRefreshPrograms?: () => void;
}

export default function ResidentPortal({
  currentUser,
  onSOS,
  visitors,
  onAddVisitor,
  bills,
  onPayBill,
  complaints,
  onAddComplaint,
  onHelpWithComplaint,
  chats,
  onSendChat,
  onChatBotQuery,
  amenities,
  bookings,
  onBookAmenity,
  staff,
  parking,
  polls,
  onVote,
  promotionalAdsEnabled,
  activeThemeOverride,
  simulatedDate,
  globalLang = "en",
  dndPreferences,
  onUpdateDndPreferences,
  onUpdateCurrentUser,
  programs = [],
  onRefreshPrograms
}: ResidentPortalProps) {
  const t = (key: string, def: string) => getTranslation(globalLang, key, def);
  const activeFestival = getActiveFestival(simulatedDate, activeThemeOverride);
  const festDetails = activeFestival ? (() => {
    if (globalLang === "hi") {
      return {
        name: activeFestival.hindiName,
        greeting: activeFestival.greeting
      };
    } else if (globalLang === "mr") {
      let marathiName = activeFestival.name;
      let marathiGreeting = activeFestival.englishGreeting;
      if (activeFestival.id === "sawan") {
        marathiName = "श्रावण उत्सव";
        marathiGreeting = "सर्व रहिवाशांना पवित्र श्रावण महिन्याची हार्दिक शुभेच्छा! हर हर महादेव.";
      } else if (activeFestival.id === "diwali") {
        marathiName = "दिवाळी उत्सव";
        marathiGreeting = "दिवाळीच्या या शुभ पर्वावर आपल्या आयुष्यात सुख, समृद्धी आणि प्रकाश येवो. शुभ दिवाळी!";
      } else if (activeFestival.id === "holi") {
        marathiName = "होळी उत्सव";
        marathiGreeting = "होळीच्या हार्दिक शुभेच्छा! तुमच्या आयुष्यात आनंदाचे रंग मिळोत. होळी मुबारक!";
      } else if (activeFestival.id === "eid") {
        marathiName = "ईद मुबारक";
        marathiGreeting = "तुम्हाला आणि तुमच्या परिवाराला ईदच्या हार्दिक शुभेच्छा. ईद मुबारक!";
      } else if (activeFestival.id === "independence") {
        marathiName = "स्वातंत्र्य दिन";
        marathiGreeting = "सर्व देशवासियांना स्वातंत्र्य दिनाच्या हार्दिक शुभेच्छा. जय हिंद, जय महाराष्ट्र!";
      } else if (activeFestival.id === "janmashtami") {
        marathiName = "गोकुळाष्टमी";
        marathiGreeting = "श्रीकृष्ण जन्माष्टमीच्या हार्दिक शुभेच्छा! भगवान श्रीकृष्ण तुम्हाला सुख, शांती आणि समृद्धी देवो.";
      } else if (activeFestival.id === "christmas") {
        marathiName = "नाताळ उत्सव";
        marathiGreeting = "तुम्हाला नाताळ आणि नवीन वर्षाच्या हार्दिक शुभेच्छा!";
      }
      return {
        name: marathiName,
        greeting: marathiGreeting
      };
    } else {
      return {
        name: activeFestival.name,
        greeting: activeFestival.englishGreeting
      };
    }
  })() : null;

  // Tabs for Resident Portal
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "visitors" | "bills" | "complaints" | "community" | "amenities" | "helpers" | "family" | "vehicles" | "documents" | "parcels" | "emergency" | "settings" | "services" | "festival"
  >("dashboard");

  // Tab navigation history for step-by-step back
  const [tabHistory, setTabHistory] = useState<string[]>(["dashboard"]);

  useEffect(() => {
    setTabHistory(prev => {
      if (activeTab === "dashboard") {
        return ["dashboard"];
      }
      if (prev[prev.length - 1] === activeTab) {
        return prev;
      }
      return [...prev, activeTab];
    });
  }, [activeTab]);

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const updatedHistory = [...tabHistory];
      updatedHistory.pop(); // remove current tab
      const previousTab = updatedHistory[updatedHistory.length - 1] as any;
      setTabHistory(updatedHistory);
      setActiveTab(previousTab || "dashboard");
    } else {
      setActiveTab("dashboard");
      setTabHistory(["dashboard"]);
    }
  };
  
  // States
  const [programFilter, setProgramFilter] = useState<"all" | "ganpati" | "navratri" | "other">("all");
  const [festivalSubTab, setFestivalSubTab] = useState<"schedule" | "duty" | "loudspeaker">("schedule");
  const [voiceLang, setVoiceLang] = useState<string>(globalLang || "hi");

  useEffect(() => {
    if (globalLang) {
      setVoiceLang(globalLang);
    }
  }, [globalLang]);

  const [localDndPrefs, setLocalDndPrefs] = useState(() => {
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

  const toggleLocalPref = (key: keyof typeof localDndPrefs) => {
    setLocalDndPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("gatekaru_dnd_preferences", JSON.stringify(next));
      if (onUpdateDndPreferences) {
        onUpdateDndPreferences(next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (dndPreferences) {
      setLocalDndPrefs(dndPreferences);
    }
  }, [dndPreferences]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPreApprove, setShowPreApprove] = useState(false);
  const [preAppName, setPreAppName] = useState("");
  const [preAppType, setPreAppType] = useState<"Guest" | "Delivery" | "Cab" | "Service">("Guest");
  const [preAppPurpose, setPreAppPurpose] = useState("");
  const [preAppCompany, setPreAppCompany] = useState("");
  const [preAppVehicle, setPreAppVehicle] = useState("");
  const [preAppMobile, setPreAppMobile] = useState("");
  const [preAppGate, setPreAppGate] = useState("Gate No. 1");
  const [preAppDate, setPreAppDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  });
  const [preAppValidTime, setPreAppValidTime] = useState("10:00 AM");
  const [preAppExpiryTime, setPreAppExpiryTime] = useState("06:00 PM");
  const [latestPasscode, setLatestPasscode] = useState<Visitor | null>(null);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  // Detail view state
  const [selectedDetail, setSelectedDetail] = useState<{
    type: "resident" | "visitor" | "bill" | "complaint" | "notice";
    data: any;
  } | null>(null);

  // Guard Call Intercom state variables
  const [intercomStatus, setIntercomStatus] = useState<"idle" | "ringing" | "connected">("idle");
  const [intercomCaller, setIntercomCaller] = useState("Gate No. 1 Guard");
  const [intercomDuration, setIntercomDuration] = useState(0);
  const [intercomSpeaker, setIntercomSpeaker] = useState(false);

  // Intercom Call Timer effect
  useEffect(() => {
    let interval: any = null;
    if (intercomStatus === "connected") {
      interval = setInterval(() => {
        setIntercomDuration(prev => prev + 1);
      }, 1000);
    } else {
      setIntercomDuration(0);
    }
    return () => clearInterval(interval);
  }, [intercomStatus]);

  // Helper to play subtle intercom ringtone
  const triggerIntercomBleep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.log("AudioContext blocked or not supported:", e);
    }
  };

  // Bill payment states
  const [payingBill, setPayingBill] = useState<MaintenanceBill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("aarav@okaxis");
  const [cardNumber, setCardNumber] = useState("4321 8827 9102 3341");
  const [cardExpiry, setCardExpiry] = useState("09/29");
  const [cardCvv, setCardCvv] = useState("321");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Complaint states
  const [compTitle, setCompTitle] = useState("");
  const [compCategory, setCompCategory] = useState("Lifts & Elevators");
  const [compDesc, setCompDesc] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  // Chat states
  const [chatInput, setChatInput] = useState("");
  const [aiBotInput, setAiBotInput] = useState("");
  const [aiBotHistory, setAiBotHistory] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "नमस्ते! I am GateKaru AI, your Society Helpdesk. Feel free to ask about bylaws, bills, amenities, or raise issues!" }
  ]);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  // Amenity states
  const [selectedAmenity, setSelectedAmenity] = useState<string>("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("18:00 - 19:00");

  // Emergency SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosMessage, setSosMessage] = useState("Medical help requested at Flat A-402!");
  const [showQuickDialModal, setShowQuickDialModal] = useState(false);
  const [pendingDispatchTemplate, setPendingDispatchTemplate] = useState<any>(null);
  const [quickDialDispatchResult, setQuickDialDispatchResult] = useState<{
    message: string;
    type: string;
    dispatches: any[];
    timestamp: string;
  } | null>(null);
  const [isQuickDialing, setIsQuickDialing] = useState(false);

  // Vehicles management
  const [vehicles, setVehicles] = useState<Array<{ 
    plate: string; 
    type: string; 
    rfidTag?: string;
    owner?: string;
    flat?: string;
    slot?: string;
    insuranceExpiry?: string;
    pucExpiry?: string;
    rcFile?: string | null;
    insuranceFile?: string | null;
    pucFile?: string | null;
    isEV?: boolean;
    secondary?: boolean;
    category?: string;
  }>>([
    { plate: "DL-3C-AB-1234", type: "Car (Sedan)", rfidTag: "UHF-TAG-8821", owner: "Aarav Sharma", flat: "A-402", slot: "A-P45", insuranceExpiry: "2026-07-21", pucExpiry: "2026-07-14", rcFile: "rc_dl3cab1234.pdf", insuranceFile: "ins_dl3cab1234.pdf", pucFile: "puc_dl3cab1234.pdf", isEV: false, secondary: false, category: "Primary Vehicle" },
    { plate: "DL-3C-MM-5566", type: "Two-Wheeler", rfidTag: "UHF-TAG-5529", owner: "Aarav Sharma", flat: "A-402", slot: "A-P99", insuranceExpiry: "2026-08-15", pucExpiry: "2026-07-14", rcFile: "rc_dl3cmm5566.pdf", insuranceFile: "ins_dl3cmm5566.pdf", pucFile: null, isEV: false, secondary: true, category: "Secondary Vehicle" }
  ]);
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("Car (Sedan)");
  const [newVehicleIsEV, setNewVehicleIsEV] = useState(false);
  const [newVehicleCategory, setNewVehicleCategory] = useState("Primary Vehicle");

  const [linkTagVehicle, setLinkTagVehicle] = useState("DL-3C-AB-1234");
  const [linkTagValue, setLinkTagValue] = useState("");
  const [selectedQrPassVehicle, setSelectedQrPassVehicle] = useState<any>(null);

  // Advanced Vehicle features states
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null); // For Vehicle Details Popup
  const [isEditingVehicle, setIsEditingVehicle] = useState(false); // Edit mode inside details popup
  const [editPlate, setEditPlate] = useState("");
  const [editType, setEditType] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editSlot, setEditSlot] = useState("");
  const [editInsExp, setEditInsExp] = useState("");
  const [editPucExp, setEditPucExp] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIsEV, setEditIsEV] = useState(false);

  const [gateLogs, setGateLogs] = useState<any[]>([]); // Gate Entry History Table
  const [gateRange, setGateRange] = useState<string>("all"); // "all" | "today" | "week" | "month"
  const [isExporting, setIsExporting] = useState<string | null>(null); // For Export Loading feedback
  const [logSearchQuery, setLogSearchQuery] = useState(""); // Gate Logs search query

  // Temporary Visitor Pass State
  const [visPassNumber, setVisPassNumber] = useState("");
  const [visPassName, setVisPassName] = useState("");
  const [visPassFrom, setVisPassFrom] = useState(new Date().toISOString().split("T")[0]);
  const [visPassTo, setVisPassTo] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [generatedPassQr, setGeneratedPassQr] = useState<any>(null);

  // Document Uploading Simulation State
  const [uploadProgress, setUploadProgress] = useState<any>(null); // { docType: string, progress: number }

  // Live Cam simulated ANPR state
  const [camSnapshot, setCamSnapshot] = useState<any>({
    active: true,
    feedUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
    plateDetected: "DL-3C-AB-1234",
    rfidDetected: "UHF-TAG-8821",
    timestamp: "Live Feed - Real-Time",
    anprConfidence: "98.7% Confidence",
    status: "STANDBY"
  });

  const [rfidAutoOpenEnabled, setRfidAutoOpenEnabled] = useState(true);
  const [selectedSimVehicle, setSelectedSimVehicle] = useState("DL-3C-AB-1234");
  const [vehicleDistance, setVehicleDistance] = useState(15); // in meters
  const [barrierStatus, setBarrierStatus] = useState<"Closed" | "Opening" | "Open" | "Closing">("Closed");
  const [simLog, setSimLog] = useState<string[]>(["RFID UHF System initialized. Boom barriers ready."]);

  // Local gate approvals state
  const [localApprovals, setLocalApprovals] = useState<any[]>([]);

  // Profile edit modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(currentUser.emergencyPhone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const openEditProfileModal = () => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone);
    setEditEmail(currentUser.email);
    setEditEmergencyPhone(currentUser.emergencyPhone || "");
    setProfileError("");
    setProfileSaveSuccess(false);
    setEditProfileOpen(true);
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSaveSuccess(false);

    try {
      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          name: editName,
          phone: editPhone,
          email: editEmail,
          emergencyPhone: editEmergencyPhone
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to update profile.");
      }

      setProfileSaveSuccess(true);
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(resData.user);
      }
      setTimeout(() => {
        setEditProfileOpen(false);
        setProfileSaveSuccess(false);
      }, 1200);
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Coupons & Perks State
  const [coupons, setCoupons] = useState<any[]>([]);

  const fetchCoupons = async () => {
    try {
      const data = await safeFetchJson("/api/coupons", undefined, []);
      setCoupons(data);
    } catch (err) {
      console.error("Error loading coupons:", err);
    }
  };

  const redeemCouponCode = async (code: string) => {
    try {
      const response = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (response.ok) {
        const data = await response.json();
        alert(`🎉 Coupon Redeemed Successfully!\nBrand: ${data.coupon.brand}\nCode: ${data.coupon.code}\nDiscount: ${data.coupon.title}`);
        fetchCoupons();
      } else {
        const err = await response.json();
        alert(`❌ Redemption failed: ${err.error || "Invalid coupon code"}`);
      }
    } catch (err) {
      console.error("Error redeeming coupon:", err);
    }
  };

  const createCouponAdmin = async () => {
    const code = prompt("Enter Coupon Code (E.g. PIZZA50):");
    if (!code) return;
    const title = prompt("Enter Title/Discount (E.g. 50% Off on Dominos):");
    if (!title) return;
    const brand = prompt("Enter Brand Name (E.g. Dominos Pizza):");
    if (!brand) return;
    const description = prompt("Enter Description:");
    const expiryDate = prompt("Enter Expiry Date (YYYY-MM-DD):", "2026-12-31");
    const usageLimitStr = prompt("Enter Max Usage Limit:", "100");
    const usageLimit = usageLimitStr ? parseInt(usageLimitStr) : 100;

    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          brand,
          description,
          expiryDate,
          usageLimit
        })
      });
      if (response.ok) {
        alert("🎉 New Coupon Created successfully inside database!");
        fetchCoupons();
      } else {
        alert("Failed to create coupon");
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  // Synchronize vehicles and logs from server
  const fetchVehiclesAndLogs = async () => {
    try {
      const flatQuery = currentUser.flat ? `?flat=${encodeURIComponent(currentUser.flat)}` : "";
      const vehData = await safeFetchJson(`/api/vehicles${flatQuery}`, undefined, []);
      if (vehData && vehData.length > 0) {
        setVehicles(vehData);
      }

      const logQuery = `${flatQuery ? flatQuery + "&" : "?"}range=${gateRange}`;
      const logData = await safeFetchJson(`/api/gates/history${logQuery}`, undefined, []);
      setGateLogs(logData);
    } catch (err) {
      console.error("Error fetching vehicles/logs:", err);
    }
  };

  const fetchFamilyAndDocuments = async () => {
    try {
      const flatQuery = currentUser.flat ? `?flat=${encodeURIComponent(currentUser.flat)}` : "";
      const famData = await safeFetchJson(`/api/family${flatQuery}`, undefined, []);
      setFamily(famData);
      
      const docsData = await safeFetchJson(`/api/documents${flatQuery}`, undefined, []);
      setVaultDocs(docsData);
      if (docsData && docsData.length > 0) {
        setAgreementName(docsData[0].title);
      }
    } catch (err) {
      console.error("Error loading family/documents:", err);
    }
  };

  useEffect(() => {
    fetchVehiclesAndLogs();
    fetchFamilyAndDocuments();
    fetchCoupons();
  }, [currentUser.flat, gateRange]);

  useEffect(() => {
    const fetchLocalApprovals = async () => {
      try {
        const data = await safeFetchJson("/api/approvals", undefined, []);
        setLocalApprovals(data);
      } catch (err) {
        console.error("Error loading approvals in ResidentPortal:", err);
      }
    };
    
    fetchLocalApprovals();
    const interval = setInterval(fetchLocalApprovals, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLocalApprovalAction = async (approvalId: string, action: "Approved" | "Rejected") => {
    try {
      const data = await safeFetchJson("/api/approvals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: approvalId, action })
      }, null);
      if (data && data.approval) {
        setLocalApprovals(prev => prev.map(a => a.id === approvalId ? data.approval : a));
        alert(`Request ${action === "Approved" ? "APPROVED (प्रवेश स्वीकृत)" : "REJECTED (अस्वीकार)"} successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // JobsKaru Service Booking states
  const [serviceCategory, setServiceCategory] = useState("Plumbing");
  const [serviceSubCategory, setServiceSubCategory] = useState("Tap Leakage & Pipe Repair");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("09:00 AM - 11:00 AM");
  const [serviceNotes, setServiceNotes] = useState("");
  const [localServicesHistory, setLocalServicesHistory] = useState<Array<{
    id: string;
    category: string;
    subCategory: string;
    date: string;
    time: string;
    notes: string;
    status: string;
    provider: string;
    cost: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem("gatekaru_home_services");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [
      {
        id: "JK-5021",
        category: "Plumbing",
        subCategory: "Tap Leakage & Pipe Repair",
        date: "2026-07-09",
        time: "09:00 AM - 11:00 AM",
        notes: "Kitchen sink has active dripping water and pressure is low.",
        status: "Technician Assigned",
        provider: "Ramesh Kumar (Plumbing Expert)",
        cost: "₹350"
      },
      {
        id: "JK-9912",
        category: "Cleaning",
        subCategory: "Deep House Cleaning",
        date: "2026-07-05",
        time: "02:00 PM - 04:00 PM",
        notes: "Full apartment dusting and vacuuming requested.",
        status: "Completed",
        provider: "Shanti Cleaning Team (JobsKaru Partner)",
        cost: "₹1,200"
      },
      {
        id: "JK-9983",
        category: "Electrical",
        subCategory: "Ceiling Fan Installation",
        date: "2026-07-09",
        time: "11:00 AM - 01:00 PM",
        notes: "Need help mounting new high-speed fan in living room.",
        status: "Completed",
        provider: "Vijay Singh (Electrician Pro)",
        cost: "₹450"
      }
    ];
  });

  // Family members
  const [family, setFamily] = useState<Array<{ name: string; relation: string; id: string }>>([]);
  const [famName, setFamName] = useState("");
  const [famRelation, setFamRelation] = useState("Spouse");

  // Document Vault state
  const [vaultDocs, setVaultDocs] = useState<Array<{ id: string; title: string; type: string; uploadDate: string; verified: boolean; verifiedBy: string }>>([]);

  // Parcels Tracking
  const [parcels, setParcels] = useState([
    { id: "p1", courier: "Amazon", item: "Electronics box", status: "Arrived at Gate 1", time: "10 mins ago" },
    { id: "p2", courier: "Zomato", item: "Food parcel", status: "With Guard Mahendra", time: "Just now" },
    { id: "p3", courier: "BlueDart", item: "Office documents", status: "Delivered to flat", time: "Yesterday" }
  ]);

  // Rent agreement upload mockup
  const [agreementName, setAgreementName] = useState<string | null>("Rent_Agreement_2026.pdf");
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false);

  // Trigger SOS
  const handleTriggerSOS = async () => {
    setSosActive(true);
    try {
      const response = await fetch("/api/alerts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: currentUser.name,
          message: sosMessage || `SOS PANIC triggered from Flat ${currentUser.flat || 'A-402'}!`,
          type: "Emergency Panic",
          flat: currentUser.flat
        })
      });
      if (response.ok) {
        const data = await response.json();
        // Trigger local test alarm siren sound too!
        playLocalAlarmSiren();
        
        let dispatchText = "🚨 EMERGENCY SOS PANIC BROADCAST SUCCESSFUL!\n\n";
        if (data.dispatches) {
          data.dispatches.forEach((d: any) => {
            dispatchText += `• [${d.channel}] ${d.target}: ${d.details || d.text || 'Notification sent.'}\n`;
          });
        }
        alert(dispatchText);
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => {
      setSosActive(false);
    }, 6000);
  };

  // Pre-configured Quick Dial templates for simultaneous Guard & Admin notification
  const quickDialTemplates = [
    {
      id: "medical",
      label: "Medical Emergency",
      hindiLabel: "चिकित्सा आपातकाल",
      icon: "🚑",
      badge: "Priority 1",
      color: "from-red-600 to-rose-700 text-white border-red-500",
      bgLight: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100",
      type: "Medical Emergency",
      defaultText: "Medical help urgently needed! Please dispatch first-aid and coordinate ambulance at Flat " + (currentUser?.flat || "A-402")
    },
    {
      id: "fire",
      label: "Fire / Smoke Hazard",
      hindiLabel: "आग / धुआँ चेतावनी",
      icon: "🔥",
      badge: "High Alert",
      color: "from-amber-600 to-orange-700 text-white border-amber-500",
      bgLight: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
      type: "Fire Hazard",
      defaultText: "Fire / Smoke outbreak reported near Flat " + (currentUser?.flat || "A-402") + "! Guard desk inspect immediately with extinguishers."
    },
    {
      id: "intruder",
      label: "Intruder / Threat",
      hindiLabel: "सुरक्षा / संदिग्ध खतरा",
      icon: "🛡️",
      badge: "Security",
      color: "from-purple-600 to-indigo-800 text-white border-purple-500",
      bgLight: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
      type: "Security Threat",
      defaultText: "Unidentified intruder or suspicious movement near Flat " + (currentUser?.flat || "A-402") + "! Immediate guard deployment requested."
    },
    {
      id: "lift",
      label: "Lift Stuck / Trapped",
      hindiLabel: "लिफ्ट आपातकाल",
      icon: "⚡",
      badge: "Facility",
      color: "from-blue-600 to-cyan-700 text-white border-blue-500",
      bgLight: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100",
      type: "Elevator Emergency",
      defaultText: "Resident trapped inside elevator near Block A! Dispatched technician team & guard desk."
    },
    {
      id: "gate_block",
      label: "Gate Path Obstruction",
      hindiLabel: "द्वार मार्ग अवरोध",
      icon: "🚗",
      badge: "Access Gate",
      color: "from-slate-700 to-slate-900 text-white border-slate-600",
      bgLight: "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200",
      type: "Gate Obstruction",
      defaultText: "Emergency vehicle or driveway route blocked at Main Gate. Guard clear obstruction immediately."
    }
  ];

  const handleQuickDialDispatch = async (template: typeof quickDialTemplates[0]) => {
    setIsQuickDialing(true);
    setQuickDialDispatchResult(null);
    try {
      const flatNo = currentUser?.flat || "A-402";
      const fullMsg = `🚨 [QUICK DIAL ${template.type.toUpperCase()}]: ${template.defaultText}`;
      
      const response = await fetch("/api/alerts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: currentUser?.name || "Aarav Sharma",
          message: fullMsg,
          type: template.type,
          flat: flatNo
        })
      });

      if (response.ok) {
        const data = await response.json();
        playLocalAlarmSiren();
        setQuickDialDispatchResult({
          message: fullMsg,
          type: template.type,
          dispatches: data.dispatches || [
            { target: "Security Guard Cabin (Gate 1)", channel: "Push Notification", status: "Delivered", details: "Tablet alarm sound triggered." },
            { target: "Security Guard Mahendra", channel: "Walkie-Talkie Ch 4", status: "Broadcasted", details: "Automated distress speech broadcasted." },
            { target: "Vikram Mehta (General Secretary)", channel: "SMS (+91 98100 23456)", status: "Sent", details: "Direct emergency text dispatched." },
            { target: "Management Committee Group", channel: "WhatsApp API", status: "Delivered", details: "Group SOS broadcast active." }
          ],
          timestamp: new Date().toLocaleTimeString()
        });
        setSosActive(true);
        if (onSOS) {
          onSOS(fullMsg);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuickDialing(false);
    }
  };

  // Submit Pre-approval
  const handlePreApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preAppName) return;

    try {
      const response = await fetch("/api/visitors/pre-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preAppName,
          type: preAppType,
          purpose: preAppPurpose || "Visit",
          flat: currentUser.flat || "A-402",
          hostName: currentUser.name,
          company: preAppCompany || "None",
          vehicleNumber: preAppVehicle || "No Vehicle",
          phone: preAppMobile || "+91 98765 43210",
          gateName: preAppGate,
          validDate: preAppDate,
          validTime: preAppValidTime,
          expiryTime: preAppExpiryTime
        })
      });
      if (response.ok) {
        const data = await response.json();
        onAddVisitor(data);
        setLatestPasscode(data);
        setPreAppName("");
        setPreAppPurpose("");
        setPreAppCompany("");
        setPreAppVehicle("");
        setPreAppMobile("");
        setShowPreApprove(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getVisitorShareMessage = (pass: Visitor) => {
    return `🏡 GateKaru Visitor Pass\n\nHello ${pass.name.toUpperCase()},\n\nYour visitor pass has been approved.\n\nSociety:\nGreenwood Heights Society\n\nResident:\n${pass.hostName || "Aarav Sharma"}\n\nFlat:\n${pass.flat}\n\nPass Code:\n${pass.passcode}\n\nDate:\n${pass.validDate || "08 July 2026"}\n\nTime:\n${pass.validTime || "10:00 AM"} - ${pass.expiryTime || "06:00 PM"}\n\nScan the QR Code at ${pass.gateName || "Gate No.1"}.\n\nDownload Pass:\nhttps://gatekaru.com/pass/${pass.passcode}\n\nPowered by JobsKaru Technologies`;
  };

  const shareWhatsApp = (pass: Visitor) => {
    const msg = getVisitorShareMessage(pass);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareEmail = (pass: Visitor) => {
    const msg = getVisitorShareMessage(pass);
    window.open(`mailto:?subject=${encodeURIComponent("GateKaru Visitor Pass - " + pass.name)}&body=${encodeURIComponent(msg)}`);
  };

  const shareSMS = (pass: Visitor) => {
    const msg = getVisitorShareMessage(pass);
    window.open(`sms:?body=${encodeURIComponent(msg)}`);
  };

  const shareTelegram = (pass: Visitor) => {
    const msg = getVisitorShareMessage(pass);
    window.open(`https://t.me/share/url?url=${encodeURIComponent("https://gatekaru.com/pass/" + pass.passcode)}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  const copyPassLink = (pass: Visitor) => {
    navigator.clipboard.writeText(`https://gatekaru.com/pass/${pass.passcode}`);
    alert("🔗 Secure Pass Link Copied to Clipboard!");
  };

  const copyPasscode = (pass: Visitor) => {
    navigator.clipboard.writeText(pass.passcode);
    alert("🔑 Pass Code / OTP Copied to Clipboard!");
  };

  const downloadQRImage = (pass: Visitor) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 256, 256);
      
      // Draw QR finder patterns
      ctx.fillStyle = "#1e1b4b"; // deep indigo
      
      // Top left corner finder pattern
      ctx.fillRect(20, 20, 50, 50);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(27, 27, 36, 36);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(34, 34, 22, 22);
      
      // Top right corner finder pattern
      ctx.fillRect(186, 20, 50, 50);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(193, 27, 36, 36);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(200, 34, 22, 22);
      
      // Bottom left corner finder pattern
      ctx.fillRect(20, 186, 50, 50);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(27, 193, 36, 36);
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(34, 200, 22, 22);
      
      // Fill random QR looking pixels
      ctx.fillStyle = "#1e1b4b";
      for (let x = 80; x < 180; x += 10) {
        for (let y = 20; y < 240; y += 10) {
          if (Math.random() > 0.4) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      for (let x = 20; x < 80; x += 10) {
        for (let y = 80; y < 180; y += 10) {
          if (Math.random() > 0.4) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      for (let x = 180; x < 240; x += 10) {
        for (let y = 80; y < 180; y += 10) {
          if (Math.random() > 0.4) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      }
      
      ctx.fillStyle = "#4338ca";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(pass.passcode, 105, 135);
      
      const link = document.createElement("a");
      link.download = `GateKaru_Pass_${pass.passcode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const printPass = (pass: Visitor) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>GateKaru Visitor Pass - ${pass.passcode}</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 40px;
                color: #1e293b;
                background: #ffffff;
              }
              .a4-container {
                max-width: 800px;
                margin: 0 auto;
                border: 3px double #cbd5e1;
                padding: 40px;
                border-radius: 12px;
                position: relative;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .logo-title {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .logo {
                width: 50px;
                height: 50px;
                background: #4f46e5;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                font-size: 24px;
                font-weight: 900;
              }
              .logo-text h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                color: #1e1b4b;
                letter-spacing: -0.5px;
              }
              .logo-text p {
                margin: 2px 0 0 0;
                font-size: 11px;
                color: #64748b;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .badge {
                background: #ecfdf5;
                border: 1px solid #10b981;
                color: #047857;
                padding: 6px 14px;
                border-radius: 50px;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              }
              .grid-details {
                display: grid;
                grid-template-cols: 1fr 1fr;
                gap: 24px;
                margin-bottom: 30px;
              }
              .detail-item {
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 10px;
              }
              .detail-label {
                font-size: 10px;
                font-weight: 800;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .detail-value {
                font-size: 15px;
                font-weight: 700;
                color: #0f172a;
                margin-top: 4px;
              }
              .pass-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc;
                border: 2px dashed #cbd5e1;
                padding: 30px;
                border-radius: 16px;
                margin-bottom: 30px;
              }
              .passcode-section h2 {
                margin: 0;
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1.5px;
              }
              .passcode-display {
                font-size: 36px;
                font-weight: 900;
                color: #4f46e5;
                letter-spacing: 2px;
                margin-top: 8px;
                font-family: monospace;
              }
              .qr-box {
                width: 140px;
                height: 140px;
                border: 4px solid #1e1b4b;
                background: #ffffff;
                padding: 8px;
                box-sizing: border-box;
                position: relative;
              }
              .qr-mock {
                width: 100%;
                height: 100%;
                background: repeating-conic-gradient(#1e1b4b 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
                opacity: 0.95;
              }
              .qr-label {
                position: absolute;
                bottom: -22px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 9px;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
              }
              .instructions {
                margin-top: 40px;
                background: #fffdf5;
                border: 1px solid #fef08a;
                padding: 20px;
                border-radius: 12px;
              }
              .instructions h3 {
                margin: 0 0 10px 0;
                font-size: 13px;
                color: #854d0e;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .instructions ul {
                margin: 0;
                padding-left: 20px;
                font-size: 12px;
                color: #71717a;
                line-height: 1.6;
              }
              .footer-text {
                margin-top: 40px;
                text-align: center;
                font-size: 11px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
                font-weight: 600;
              }
              .society-logo {
                font-size: 28px;
                margin-right: 10px;
              }
            </style>
          </head>
          <body>
            <div class="a4-container">
              <div class="header">
                <div class="logo-title">
                  <div class="logo">G</div>
                  <div class="logo-text">
                    <h1>GateKaru</h1>
                    <p>Secured Society Entry</p>
                  </div>
                </div>
                <div>
                  <span class="badge">Digital Verification Badge</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 30px;">
                <span class="society-logo">🏡</span>
                <div>
                  <h2 style="margin: 0; font-size: 18px; color: #1e1b4b; font-weight: 800;">Greenwood Heights Society</h2>
                  <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Secured Visitor Entrance Pass</p>
                </div>
              </div>

              <div class="grid-details">
                <div class="detail-item">
                  <div class="detail-label">Visitor Pass ID</div>
                  <div class="detail-value">PASS-${pass.passcode}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Visitor Name</div>
                  <div class="detail-value">${pass.name}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Mobile Number</div>
                  <div class="detail-value">${pass.phone || "+91 98765 43210"}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Purpose of Visit</div>
                  <div class="detail-value">${pass.purpose}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Destination Flat</div>
                  <div class="detail-value">Flat ${pass.flat}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Host Resident</div>
                  <div class="detail-value">${pass.hostName || "Aarav Sharma"}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Gate / Check-In Point</div>
                  <div class="detail-value">${pass.gateName || "Gate No. 1"}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Valid Date</div>
                  <div class="detail-value">${pass.validDate || "08 July 2026"}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Valid Time Window</div>
                  <div class="detail-value">${pass.validTime || "10:00 AM"} - ${pass.expiryTime || "06:00 PM"}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Emergency Helpline</div>
                  <div class="detail-value">+91 11-4020-8888 / SOS Intercom</div>
                </div>
              </div>

              <div class="pass-container">
                <div class="passcode-section">
                  <h2>6-Digit OTP / Passcode</h2>
                  <div class="passcode-display">${pass.passcode}</div>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Present this OTP to the guard for manual check-in.</p>
                </div>
                <div class="qr-box">
                  <div class="qr-mock"></div>
                  <div class="qr-label">SCAN AT ${pass.gateName || "GATE 1"}</div>
                </div>
              </div>

              <div class="instructions">
                <h3>Gate & Security Instructions</h3>
                <ul>
                  <li>Present this digital pass or the 6-digit OTP code to the security guards at ${pass.gateName || "Gate No. 1"}.</li>
                  <li>Do not share this pass or code with unauthorized individuals. It is single-entry valid only.</li>
                  <li>Visitors must adhere to society guidelines and parking rules within the Greenwood Heights premises.</li>
                  <li>In case of emergency, contact the control room or trigger SOS through the GateKaru App.</li>
                </ul>
              </div>

              <div class="footer-text">
                GateKaru Security Suite • Powered by JobsKaru Technologies
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Pay Maintenance
  const handlePaySubmit = async () => {
    if (!payingBill) return;
    setIsProcessingPayment(true);
    try {
      const response = await fetch("/api/maintenance/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: payingBill.id, flat: currentUser.flat })
      });
      if (response.ok) {
        onPayBill(payingBill.id);
        setPayingBill(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // AI Complaint drafting
  const handleAiDraftComplaint = () => {
    if (!compTitle || !compDesc) return;
    setIsAiDrafting(true);
    onHelpWithComplaint(compTitle, compDesc, (data) => {
      setAiDraft(data.draft);
      setAiSuggestions(data.suggestions);
      setIsAiDrafting(false);
    });
  };

  // Submit Complaint
  const handleRegisterComplaint = async () => {
    if (!compTitle || !compDesc) return;
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: compTitle,
          category: compCategory,
          description: compDesc,
          flat: currentUser.flat || "A-402",
          residentName: currentUser.name
        })
      });
      if (response.ok) {
        const data = await response.json();
        onAddComplaint(data);
        setCompTitle("");
        setCompDesc("");
        setAiDraft("");
        setAiSuggestions([]);
        alert("Complaint registered successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chatbot Query
  const handleSendAiBotQuery = () => {
    if (!aiBotInput.trim()) return;
    const userMsg = aiBotInput;
    setAiBotHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiBotInput("");
    setIsAiReplying(true);

    onChatBotQuery(userMsg, (reply) => {
      setAiBotHistory(prev => [...prev, { sender: "bot", text: reply }]);
      setIsAiReplying(false);
    });
  };

  // Trigger simulated voice response (Hindi / English audio mockup)
  const handleSpeakSimulate = () => {
    setVoiceMode(true);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioContext.currentTime); // Standard beep
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.15);

    setTimeout(() => {
      setVoiceMode(false);
      setAiBotHistory(prev => [
        ...prev, 
        { sender: "user", text: "🎙️ [Voice Prompt] Water timing issues are resolved?" },
        { sender: "bot", text: "🔊 हाँ, जल आपूर्ति विभाग द्वारा Greenwood Heights के मुख्य टैंकों की सफाई पूर्ण हो चुकी है। अब पानी की आपूर्ति सामान्य रूप से सुचारू रूप से चालू है।" }
      ]);
    }, 1500);
  };

  // Submit Amenity Bookings
  const handleBookAmenitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !bookingDate || !bookingSlot) return;
    onBookAmenity(selectedAmenity, bookingDate, bookingSlot);
    alert("Amenity booking submitted! Please check your Maintenance bills tab to settle utility cost.");
  };

  // Submit JobsKaru / Home Service Booking
  const handleServiceBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate) {
      alert("Please select a preferred service booking date.");
      return;
    }

    // Determine estimated cost based on category
    let cost = "₹350";
    if (serviceCategory === "Plumbing" || serviceCategory === "Plumber") {
      cost = "₹350";
    } else if (serviceCategory === "Electrical" || serviceCategory === "Electrician") {
      cost = "₹300";
    } else if (serviceCategory === "Cleaning" || serviceCategory === "Cleaner") {
      cost = "₹800";
    } else if (serviceSubCategory.toLowerCase().includes("deep")) {
      cost = "₹1,200";
    }

    const newBooking = {
      id: `JK-${Math.floor(1000 + Math.random() * 9000)}`,
      category: serviceCategory,
      subCategory: serviceSubCategory,
      date: serviceDate,
      time: serviceTime,
      notes: serviceNotes || "No extra instructions",
      status: "Searching for Partner...",
      provider: "Assigning Expert...",
      cost: cost
    };

    setLocalServicesHistory(prev => {
      const next = [newBooking, ...prev];
      localStorage.setItem("gatekaru_home_services", JSON.stringify(next));
      return next;
    });

    alert(`🎉 Home Service Request Registered Successfully!\n\nCategory: ${serviceCategory}\nService: ${serviceSubCategory}\nScheduled: ${serviceDate} (${serviceTime})\nEst. Cost: ${cost}\n\nYour order is now being broadcast to verified partners. You can track real-time dispatch progress on the Live Order Status board below.`);

    // Clear notes & fields
    setServiceNotes("");
  };

  const cancelServiceBooking = (id: string) => {
    if (confirm("Are you sure you want to cancel this service request?")) {
      setLocalServicesHistory(prev => {
        const next = prev.map(b => b.id === id ? { ...b, status: "Cancelled", provider: "None" } : b);
        localStorage.setItem("gatekaru_home_services", JSON.stringify(next));
        return next;
      });
    }
  };

  const simulateServiceMatch = (id: string) => {
    const providers: Record<string, string[]> = {
      Plumbing: ["Mohit Sharma (Certified Plumber)", "Anil Kushwaha (Senior Plumber)", "Ravi Shankar (Waterworks Pro)"],
      Electrical: ["Suresh Prasad (Certified Wireman)", "Amit Mishra (Electrical Engineer)", "Deepak Verma (Pro Electrician)"],
      Cleaning: ["Kiran Devi (SqueakyClean Lead)", "Pinky Cleaning Solutions", "Radhe Janitorial Service"],
      Plumber: ["Mohit Sharma (Certified Plumber)", "Anil Kushwaha (Senior Plumber)", "Ravi Shankar (Waterworks Pro)"],
      Electrician: ["Suresh Prasad (Certified Wireman)", "Amit Mishra (Electrical Engineer)", "Deepak Verma (Pro Electrician)"],
      Cleaner: ["Kiran Devi (SqueakyClean Lead)", "Pinky Cleaning Solutions", "Radhe Janitorial Service"]
    };

    const booking = localServicesHistory.find(b => b.id === id);
    if (!booking) return;
    const cat = booking.category || "Plumbing";
    const possibleProviders = providers[cat] || providers["Plumbing"];
    const randomProvider = possibleProviders[Math.floor(Math.random() * possibleProviders.length)];

    setLocalServicesHistory(prev => {
      const next = prev.map(b => {
        if (b.id === id) {
          if (b.status === "Searching for Partner...") {
            return { ...b, status: "Technician Dispatched", provider: randomProvider };
          } else if (b.status === "Technician Dispatched" || b.status === "Technician Assigned") {
            return { ...b, status: "In Progress", provider: b.provider };
          } else if (b.status === "In Progress") {
            return { ...b, status: "Completed", provider: b.provider };
          }
          return b;
        }
        return b;
      });
      localStorage.setItem("gatekaru_home_services", JSON.stringify(next));
      return next;
    });
  };

  // Add Family & Vehicle
  const addVehicle = async () => {
    if (!newVehiclePlate) return;
    const cleanPlate = newVehiclePlate.trim().toUpperCase();
    const generatedTag = `UHF-TAG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: cleanPlate,
          type: newVehicleType,
          rfidTag: generatedTag,
          owner: currentUser.name || "Aarav Sharma",
          flat: currentUser.flat || "A-402",
          slot: `A-P${Math.floor(10 + Math.random() * 89)}`,
          isEV: newVehicleIsEV,
          category: newVehicleCategory
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setNewVehiclePlate("");
        setLinkTagVehicle(cleanPlate);
        setSelectedSimVehicle(cleanPlate);
        
        // Refresh the list from the database
        fetchVehiclesAndLogs();
        
        setSimLog(prev => [
          `[${new Date().toLocaleTimeString()}] 📝 Backend Registered: ${cleanPlate} | Allocated slot ${data.vehicle?.slot} | Linked tag: ${generatedTag}`,
          ...prev
        ]);
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || "Failed to register vehicle"}`);
      }
    } catch (err) {
      console.error("Error adding vehicle:", err);
    }
  };

  const addFamily = async () => {
    if (!famName) return;
    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flat: currentUser.flat || "A-402",
          name: famName,
          relation: famRelation
        })
      });
      if (response.ok) {
        const newMember = await response.json();
        setFamily(prev => [...prev, newMember]);
        setFamName("");
        alert(`Successfully added family member: ${newMember.name} (Relation: ${newMember.relation})!`);
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || "Failed to add family member"}`);
      }
    } catch (err) {
      console.error("Error adding family member:", err);
    }
  };

  const deleteFamilyMember = async (id: string) => {
    try {
      const response = await fetch(`/api/family/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setFamily(prev => prev.filter(item => item.id !== id));
        alert("Family member removed successfully!");
      } else {
        alert("Failed to remove family member");
      }
    } catch (err) {
      console.error("Error deleting family member:", err);
    }
  };

  const playLocalAlarmSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(853, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(960, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc1.start();
      osc2.start();
      setTimeout(() => {
        audioCtx.close();
      }, 1500);

      // Speech synthesis
      const speech = new SpeechSynthesisUtterance("Emergency SOS! Local Siren audio test is triggered.");
      speech.lang = "en-IN";
      window.speechSynthesis.speak(speech);
    } catch (err) {
      console.error(err);
    }
  };

  // RFID Barrier distance trigger logic
  const handleDistanceChange = async (dist: number) => {
    setVehicleDistance(dist);
    const timestamp = new Date().toLocaleTimeString();
    
    const matchedVehicle = vehicles.find(v => v.plate === selectedSimVehicle);
    const hasTag = !!matchedVehicle?.rfidTag;

    // Utilize new SmartGateService to evaluate proximity parameters
    if (matchedVehicle) {
      const gateCheck = SmartGateService.verifyRfidTag(
        { plate: matchedVehicle.plate, type: matchedVehicle.type, rfidTag: matchedVehicle.rfidTag },
        dist,
        rfidAutoOpenEnabled
      );

      // Log service evaluation results to console or telemetry logs when triggered
      if (dist <= 5) {
        console.log("SmartGateService Proximity Evaluation:", gateCheck);
      }
    }
    
    if (rfidAutoOpenEnabled) {
      if (dist <= 5) {
        if (!hasTag) {
          if (dist % 3 === 0 || barrierStatus !== "Closed") {
            setBarrierStatus("Closed");
            setSimLog(prev => [
              `[${timestamp}] ❌ ACCESS DENIED: Vehicle ${selectedSimVehicle} detected at ${dist}m but has NO linked RFID tag sticker. Please link an RFID tag under "Smart Barrier Configuration".`,
              `[${timestamp}] ℹ️ SmartGateService verification: Unauthorized. Barrier remains locked.`,
              ...prev
            ]);
          }
          return;
        }

        if (barrierStatus === "Closed" || barrierStatus === "Closing") {
          setBarrierStatus("Opening");
          setSimLog(prev => [
            `[${timestamp}] 📡 Vehicle ${selectedSimVehicle} (Tag: ${matchedVehicle.rfidTag}) detected within ${dist}m.`,
            `[${timestamp}] ⚡ SmartGateService check: RFID tag verified. Action = OPEN_GATE.`,
            `[${timestamp}] 🌐 Calling backend API: POST /api/gates/open (RFID Controller relay payload)...`,
            ...prev
          ]);
          
          try {
            const res = await fetch("/api/gates/open", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                vehicleNo: selectedSimVehicle,
                rfidTag: matchedVehicle.rfidTag,
                gateId: "Gate 1"
              })
            });
            
            const data = await res.json();
            
            if (res.ok && data.authorized) {
              setSimLog(prev => [
                `[${new Date().toLocaleTimeString()}] 🟢 Server Response 200 OK: ${data.message}`,
                `[${new Date().toLocaleTimeString()}] 📶 Telemetry RSSI: ${data.telemetry?.signalStrength} • Protocol: ${data.telemetry?.protocol} • Controller IP: ${data.telemetry?.controllerIP}`,
                ...prev
              ]);
              
              setTimeout(() => {
                setBarrierStatus("Open");
                setSimLog(prev => [
                  `[${new Date().toLocaleTimeString()}] 🟢 Boom barrier lifted fully. Access GRANTED via smart gateway response.`,
                  ...prev
                ]);
              }, 1000);
            } else {
              setBarrierStatus("Closed");
              setSimLog(prev => [
                `[${new Date().toLocaleTimeString()}] ❌ Server Response ${res.status}: ${data.message || "Access Denied"}`,
                `[${new Date().toLocaleTimeString()}] 🔒 Boom barrier remains locked. Access Denied.`,
                ...prev
              ]);
            }
          } catch (error) {
            console.error("RFID Gate API Error:", error);
            // Fallback to offline mode for graceful simulation
            setTimeout(() => {
              setBarrierStatus("Open");
              setSimLog(prev => [
                `[${new Date().toLocaleTimeString()}] ⚠️ API Network Offline. Falling back to local hardware backup: Boom barrier lifted. Access GRANTED.`,
                ...prev
              ]);
            }, 1000);
          }
        } else if (barrierStatus === "Open") {
          if (dist % 2 === 0) {
            setSimLog(prev => [
              `[${timestamp}] 🔄 Vehicle ${selectedSimVehicle} is at ${dist}m inside detection zone. Maintaining barrier open state.`,
              ...prev
            ]);
          }
        }
      } else {
        // dist > 5
        if (barrierStatus === "Open" || barrierStatus === "Opening") {
          setBarrierStatus("Closing");
          setSimLog(prev => [
            `[${timestamp}] ⚠️ Vehicle ${selectedSimVehicle} moved outside the 5m range (currently ${dist}m).`,
            `[${timestamp}] ⏱️ Safety vehicle magnetic ground loop sensor cleared. Auto-closing barrier...`,
            ...prev
          ]);
          
          setTimeout(() => {
            setBarrierStatus("Closed");
            setSimLog(prev => [
              `[${new Date().toLocaleTimeString()}] 🔴 Boom barrier fully lowered. Entry gate secured.`,
              ...prev
            ]);
          }, 1000);
        }
      }
    } else {
      // RFID auto open disabled
      if (dist <= 5) {
        setSimLog(prev => [
          `[${timestamp}] 🔒 Vehicle ${selectedSimVehicle} detected at ${dist}m, but RFID Automated Opening is DISABLED in preferences. Barrier remains locked.`,
          ...prev
        ]);
      }
    }
  };

  // Upload / Add document in Document Vault
  const triggerAgreementUpload = async () => {
    const filename = prompt("Enter document filename to upload (E.g., Rent_Agreement_2026.pdf):", "Rent_Agreement_Signed_Final.pdf");
    if (!filename) return;
    
    const docType = prompt("Enter document type (E.g., Rent Deed, ID Proof, Electricity Bill):", "Rent Deed");
    if (!docType) return;

    setIsUploadingAgreement(true);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flat: currentUser.flat || "A-402",
          title: filename,
          type: docType
        })
      });
      if (response.ok) {
        alert("Document uploaded and registered in Document Vault successfully!");
        fetchFamilyAndDocuments();
      } else {
        alert("Failed to upload document");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingAgreement(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document from your vault?")) return;
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        alert("Document deleted successfully from vault.");
        fetchFamilyAndDocuments();
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="resident-portal" className="flex flex-col md:flex-row h-full bg-slate-50 overflow-hidden w-full relative">
      
      {activeFestival && (
        <>
          <style>{`
            @keyframes floatParticle {
              0% { transform: translateY(110vh) translateX(0px) rotate(0deg); opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.6; }
              100% { transform: translateY(-10vh) translateX(var(--x-offset, 20px)) rotate(360deg); opacity: 0; }
            }
            .festive-particle {
              position: absolute;
              bottom: -50px;
              font-size: 24px;
              pointer-events: none;
              z-index: 50;
              animation: floatParticle var(--duration, 12s) linear infinite;
              animation-delay: var(--delay, 0s);
              left: var(--left-percent, 50%);
            }
          `}</style>
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-50">
            {/* Elegant cascading particles of the active festival emojis */}
            {[...Array(12)].map((_, i) => {
              const emoji = activeFestival.floatingEmojis[i % activeFestival.floatingEmojis.length];
              const leftPercent = `${(i * 8.5) + 5}%`;
              const delay = `${i * 1.5}s`;
              const duration = `${10 + (i % 3) * 4}s`;
              const xOffset = `${(i % 2 === 0 ? 30 : -30) + (i * 2)}px`;
              return (
                <div
                  key={i}
                  className="festive-particle"
                  style={{
                    '--left-percent': leftPercent,
                    '--delay': delay,
                    '--duration': duration,
                    '--x-offset': xOffset,
                  } as React.CSSProperties}
                >
                  {emoji}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Mobile Top Navigation Bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 bg-indigo-950 text-white shrink-0 shadow-md border-b border-indigo-900 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow border border-indigo-400">
            G
          </div>
          <span className="font-black text-sm tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            GateKaru
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-900 border border-indigo-800 font-bold px-2.5 py-0.5 rounded-full text-indigo-200">
            Flat {currentUser.flat || "A-402"}
          </span>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 active:bg-indigo-950 transition border border-indigo-800"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Resident Sidebar / Left Menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 text-slate-300 border-r border-slate-900 flex flex-col shrink-0 transition-transform duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static
      `}>
        {/* Profile Card Summary */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm border border-indigo-400 shadow shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white leading-none truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-none">{currentUser.flat || "A-402"}</p>
              <button 
                type="button"
                onClick={openEditProfileModal}
                className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black flex items-center gap-1 mt-2.5 transition uppercase tracking-wider cursor-pointer hover:underline"
              >
                <Settings className="w-2.5 h-2.5" /> Edit Profile
              </button>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-none bg-slate-950">
          <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 mt-1">{t("resident.sidebar.main_portal", "MAIN PORTAL")}</p>
          <button 
            onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "dashboard" ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>{t("resident.sidebar.dashboard", "My Dashboard")}</span>
          </button>

          <p className="px-3 pt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("resident.sidebar.visitor_services", "VISITOR & STAFF SERVICES")}</p>
          <button 
            onClick={() => { setActiveTab("visitors"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "visitors" ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <QrCode className="w-4 h-4 shrink-0 text-purple-400" />
            <span>{t("resident.sidebar.visitor_preapprove", "Visitor Pre-Approval")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("helpers"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "helpers" ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Users className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{t("resident.sidebar.daily_staff", "Daily Staff Records")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("parcels"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "parcels" ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Package className="w-4 h-4 shrink-0 text-blue-400" />
            <span>{t("resident.sidebar.parcel_tracking", "Parcel Tracking")}</span>
          </button>

          <p className="px-3 pt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("resident.sidebar.accounts_bookings", "ACCOUNTS & BOOKINGS")}</p>
          <button 
            onClick={() => { setActiveTab("bills"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "bills" ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <CreditCard className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{t("resident.sidebar.maintenance_bills", "Maintenance Bills")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("amenities"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "amenities" ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Dumbbell className="w-4 h-4 shrink-0 text-teal-400" />
            <span>{t("resident.sidebar.book_amenities", "Book Amenities")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("services"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "services" ? "bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Wrench className="w-4 h-4 shrink-0 text-sky-400" />
            <span>{t("resident.sidebar.home_services", "Book Home Services")}</span>
          </button>

          <p className="px-3 pt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("resident.sidebar.helpdesk_ai", "SOCIETY HELPDESK & AI")}</p>
          <button 
            onClick={() => { setActiveTab("complaints"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "complaints" ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{t("resident.sidebar.helpdesk_tickets", "AI Helpdesk & Tickets")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("community"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "community" ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md shadow-violet-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <MessageSquare className="w-4 h-4 shrink-0 text-violet-400" />
            <span>{t("resident.sidebar.chat_bot", "Society Chat & AI Bot")}</span>
          </button>

          <p className="px-3 pt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("resident.sidebar.household_profile", "MY HOUSEHOLD PROFILE")}</p>
          <button 
            onClick={() => { setActiveTab("family"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "family" ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white shadow-md shadow-fuchsia-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Users className="w-4 h-4 shrink-0 text-fuchsia-400" />
            <span>{t("resident.sidebar.my_family", "My Family")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("vehicles"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "vehicles" ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md shadow-orange-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Car className="w-4 h-4 shrink-0 text-orange-400" />
            <span>{t("resident.sidebar.my_vehicles", "My Vehicles")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("documents"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "documents" ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <FileText className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{t("resident.sidebar.my_documents", "My Documents")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("emergency"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "emergency" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{t("resident.sidebar.emergency_contacts", "Emergency Contacts")}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("festival"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "festival" ? "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-md shadow-amber-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-yellow-400" />
            <span>Festival Central Hub (उत्सव हब)</span>
          </button>
          <button 
            onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 ${activeTab === "settings" ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md shadow-slate-900/40" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            <span>{t("resident.sidebar.settings", "Settings")}</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <span>GateKaru Secure Pay</span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
      </aside>

      {/* Slide-out mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        
        {/* Emergency SOS Banner Always At Top */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center animate-pulse shrink-0 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-red-950 text-sm">Emergency GateKaru SOS Panic Trigger</h4>
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse hidden sm:inline-block">
                  Simultaneous Guard & Admin
                </span>
              </div>
              <p className="text-xs text-red-700 mt-0.5 font-semibold">Broadcasting alert notifies all security guards and committee admins simultaneously.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto z-10">
            {/* Quick Dial Button */}
            <button
              type="button"
              onClick={() => setShowQuickDialModal(true)}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/60 animate-pulse hover:animate-none transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer border border-amber-300"
            >
              <PhoneCall className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>Quick Dial (Guard & Admin)</span>
            </button>

            <input 
              type="text" 
              value={sosMessage} 
              onChange={(e) => setSosMessage(e.target.value)}
              placeholder="E.g., Medical help at A-402"
              className="bg-white border border-red-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 w-full lg:w-56 shadow-sm font-bold placeholder-slate-400 text-slate-700"
            />
            <button 
              onClick={handleTriggerSOS}
              disabled={sosActive}
              className={`px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all whitespace-nowrap uppercase tracking-wider ${sosActive ? "bg-red-400 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95 shadow-red-200"}`}
            >
              {sosActive ? "Triggered!..." : "TRIGGER SOS"}
            </button>
          </div>
        </div>

        {/* Sleek Global Back Navigation Bar */}
        {activeTab !== "dashboard" && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <button
              type="button"
              onClick={handleGoBack}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-950 text-xs font-black transition cursor-pointer"
            >
              <div className="p-1.5 bg-slate-100 group-hover:bg-slate-200 rounded-lg transition">
                <ArrowLeft className="w-4 h-4 text-slate-800" />
              </div>
              <span className="tracking-wide">← BACK (1 STEP BACK)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition"
            >
              <span>🏡</span> MY DASHBOARD
            </button>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 0: RESIDENT PORTAL HOME DASHBOARD */}
        {/* ==================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Beautiful Colorful Hero Welcome Banner - Theme Aware */}
            <div className={`bg-gradient-to-r ${activeFestival ? activeFestival.gradientClass : "from-indigo-600 via-purple-600 to-pink-600"} text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border ${activeFestival ? "border-amber-400/50" : "border-indigo-500"}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {activeFestival && festDetails ? (
                      <span className="flex items-center gap-1">
                        <Sparkle className="w-3 h-3 text-yellow-300 animate-spin" /> {activeFestival.floatingEmojis[0]} SHUBH {festDetails.name.toUpperCase()} CELEBRATION
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-200" /> GREENWOOD HEIGHTS SECURED
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">
                    {activeFestival && festDetails ? `Shubh ${festDetails.name}, ${currentUser.name}! ${activeFestival.floatingEmojis[1]}` : `${t("resident.dashboard.namaste", "Namaste")}, ${currentUser.name}! 👋`}
                  </h2>
                  <p className="text-xs md:text-sm text-indigo-100 font-bold leading-relaxed max-w-xl">
                    {activeFestival && festDetails ? festDetails.greeting : t("resident.dashboard.banner_desc", "Welcome to your GateKaru Resident Command Center. Raise SOS alerts, approve daily visitors, settle pending maintenance dues, and interact with society AI chatbot instantly.")}
                  </p>
                  <div className="pt-1">
                    <button 
                      onClick={openEditProfileModal}
                      className="inline-flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-md transition-all duration-150 cursor-pointer border border-indigo-100 active:scale-95"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
                      <span>Edit Contact Profile</span>
                    </button>
                  </div>
                </div>
                
                {/* Micro metrics card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 grid grid-cols-2 gap-4 shrink-0 w-full md:w-64">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] text-indigo-200 uppercase font-black">{t("resident.dashboard.gate_dues", "Gate Dues")}</p>
                    <p className="text-lg font-black text-white mt-1">
                      ₹{bills.filter(b => b.flat === currentUser.flat && b.status === "Unpaid").reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center md:text-left border-l border-white/10 pl-4">
                    <p className="text-[10px] text-indigo-200 uppercase font-black">{t("resident.dashboard.active_guests", "Active Guests")}</p>
                    <p className="text-lg font-black text-white mt-1">
                      {visitors.filter(v => v.flat === currentUser.flat && v.status === "Checked-In").length} {t("resident.dashboard.inside", "Inside")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE GUARD CALL INTERCOM SYSTEM WIDGET */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 border-2 border-indigo-500/20 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute right-4 top-4 text-3xl opacity-10 animate-bounce">📞</div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-3.5 mb-4">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Gate Guard Intercom System (सुरक्षा गार्ड कॉल इंटरकॉम)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Direct gate intercom cellular terminal for Greenwood Heights
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-xs bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 font-mono">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Intercom No</span>
                    <span className="text-indigo-200 font-black">IC-{currentUser.flat}</span>
                  </div>
                  <div className="border-l border-white/10 pl-3">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">My Destination</span>
                    <span className="text-indigo-200 font-black">Flat {currentUser.flat}</span>
                  </div>
                </div>
              </div>

              {/* Intercom UI conditional state layout */}
              {intercomStatus === "idle" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 text-sm">
                      ✔
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-100 uppercase tracking-wide">Line Secure & Active</p>
                      <p className="text-[10px] text-slate-400">Ready to receive intercom bypass calls from security gates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Dial Guard Room */}
                    <button
                      type="button"
                      onClick={() => {
                        setIntercomCaller("Main Security Guard Room");
                        setIntercomStatus("connected");
                        triggerIntercomBleep();
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wide py-2 px-3.5 rounded-xl transition active:scale-95 cursor-pointer shadow-sm w-full sm:w-auto text-center"
                    >
                      ☎ Dial Guard Room
                    </button>
                    
                    {/* Simulate Incoming Guard Call */}
                    <button
                      type="button"
                      onClick={() => {
                        setIntercomCaller("Gate No. 1 Guard");
                        setIntercomStatus("ringing");
                        // play initial rings
                        triggerIntercomBleep();
                        const interval = setInterval(() => {
                          triggerIntercomBleep();
                        }, 1200);
                        (window as any).intercomRingInterval = interval;
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider py-2 px-3.5 rounded-xl transition active:scale-95 cursor-pointer shadow-sm w-full sm:w-auto text-center"
                    >
                      🔔 Simulate Incoming Call
                    </button>
                  </div>
                </div>
              )}

              {intercomStatus === "ringing" && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-xl shrink-0 animate-bounce">
                      📞
                    </div>
                    <div>
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                        INCOMING GUARD CALL
                      </span>
                      <h5 className="font-extrabold text-sm text-amber-200 mt-1">
                        {intercomCaller} calling Flat {currentUser.flat}
                      </h5>
                      <p className="text-[10px] text-slate-300">
                        Intercom Number: 8801 • Gate No. 1 entrance lobby.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if ((window as any).intercomRingInterval) {
                          clearInterval((window as any).intercomRingInterval);
                        }
                        setIntercomStatus("connected");
                        triggerIntercomBleep();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wide py-2.5 px-4 rounded-xl transition active:scale-95 cursor-pointer w-full sm:w-auto text-center shadow-lg shadow-emerald-950/40"
                    >
                      ✅ ACCEPT CALL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if ((window as any).intercomRingInterval) {
                          clearInterval((window as any).intercomRingInterval);
                        }
                        setIntercomStatus("idle");
                        triggerIntercomBleep();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wide py-2.5 px-4 rounded-xl transition active:scale-95 cursor-pointer w-full sm:w-auto text-center"
                    >
                      ❌ REJECT
                    </button>
                  </div>
                </div>
              )}

              {intercomStatus === "connected" && (
                <div className="bg-indigo-950/80 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                      <span className="text-xs text-slate-300 font-extrabold uppercase">
                        Active Intercom Call (इंटरकॉम वार्तालाप)
                      </span>
                    </div>
                    
                    {/* Glow Timer */}
                    <div className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-mono font-black border border-emerald-500/20">
                      CONNECTED • {Math.floor(intercomDuration / 60).toString().padStart(2, "0")}:{(intercomDuration % 60).toString().padStart(2, "0")}
                    </div>
                  </div>

                  {/* Simulated Audio Wave & Conversation Transcript */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Intercom Line Feed (लाइव बातचीत)</p>
                      <div className="space-y-1 text-xs">
                        <p className="text-amber-300 leading-tight">
                          <strong className="text-slate-400">🛡 Guard (8801):</strong> "Namaste sir, Main gate guard speaking. Guest is requesting entry for Flat {currentUser.flat}. Call Flat No {currentUser.flat} like this, please confirm entry approval?"
                        </p>
                        <p className="text-indigo-300 leading-tight">
                          <strong className="text-slate-400">🏡 Resident (You):</strong> "Approved, whitelisted in my GateKaru. Please let them inside."
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {/* Speaker Mode Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setIntercomSpeaker(!intercomSpeaker);
                          triggerIntercomBleep();
                        }}
                        className={`px-3 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border transition flex items-center gap-1 cursor-pointer ${
                          intercomSpeaker 
                            ? "bg-indigo-600 text-white border-indigo-400" 
                            : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {intercomSpeaker ? "📢 SPEAKER: ON" : "🔇 SPEAKER: OFF"}
                      </button>

                      {/* Whitelist Visitor Button */}
                      <button
                        type="button"
                        onClick={() => {
                          alert("Gate Guard notified of immediate verbal confirmation! Gate whitelisted.");
                          triggerIntercomBleep();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wide py-2 px-3 rounded-xl transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        ✔ APPROVE VERBAL ENTRY
                      </button>

                      {/* End Call */}
                      <button
                        type="button"
                        onClick={() => {
                          setIntercomStatus("idle");
                          triggerIntercomBleep();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wide py-2 px-3.5 rounded-xl transition active:scale-95 cursor-pointer"
                      >
                        ❌ END CALL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* JobsKaru Technology ecosystem app list */}
            <ApplicationList />

            {/* Hyper-Local Partner Offers (Conditional Promotional Ads) */}
            {promotionalAdsEnabled && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupons, Perks & Brand Vouchers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={createCouponAdmin}
                      className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition active:scale-95 cursor-pointer"
                    >
                      ➕ ADD BRAND PERK (ADMIN)
                    </button>
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">
                      GateKaru Premium Vouchers
                    </span>
                  </div>
                </div>

                {coupons.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No active vouchers or member perks loaded. Click "Add Brand Perk" to create one.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="bg-slate-50 hover:bg-indigo-50/40 p-4 rounded-xl border border-slate-200 flex flex-col justify-between transition-all group duration-300 relative">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">{coupon.brand}</span>
                            <span className="text-[9px] text-slate-400 font-semibold font-mono">Expires: {coupon.expiryDate}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-xs mt-1">{coupon.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{coupon.description}</p>
                          <div className="pt-1 flex items-center gap-3">
                            <span className="text-[9px] text-slate-400 font-medium">Usage Limit: {coupon.usageLimit}</span>
                            <span className="text-[9px] text-indigo-600 font-bold">Redeemed: {coupon.redeemCount} times</span>
                          </div>
                        </div>
                        <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              alert(`📋 Promo Code '${coupon.code}' copied to clipboard!`);
                            }}
                            className="bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 flex-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY: {coupon.code}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => redeemCouponCode(coupon.code)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                          >
                            REDEEM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* NEW WIDGET: SOCIETY FESTIVALS & PROGRAMS LIST WITH TIMINGS (त्यौहार और कार्यक्रम) */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md animate-pulse">
                    🪔
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Society Ganeshotsav & Navratri Central Hub</span>
                      <span className="bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">LIVE 🔴</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      गणेशोत्सव व नवरात्रि कार्यक्रम केंद्र • Active for <span className="text-indigo-600">{currentUser.society || "your society"}</span>
                    </p>
                  </div>
                </div>

                {/* Sub Tab Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => setFestivalSubTab("schedule")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${festivalSubTab === "schedule" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    📅 Program List / कार्यक्रम सूची
                  </button>
                  <button
                    type="button"
                    onClick={() => setFestivalSubTab("duty")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${festivalSubTab === "duty" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🏢 Aarti Floor Duty / आरती बारी सूची
                  </button>
                  <button
                    type="button"
                    onClick={() => setFestivalSubTab("loudspeaker")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${festivalSubTab === "loudspeaker" ? "bg-pink-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    📢 Loudspeaker / डिजिटल लाउडस्पीकर
                  </button>
                </div>
              </div>

              {/* TAB 1: SCHEDULE & VISARJAN COUNTER */}
              {festivalSubTab === "schedule" && (
                <div className="space-y-4">
                  {/* Visarjan Banner Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ganpati Visarjan Card */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl shadow-sm border border-amber-400 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                      <div className="absolute right-[-10px] bottom-[-10px] text-white/10 text-8xl font-black select-none pointer-events-none">
                         गणेश
                      </div>
                      <div className="space-y-1 z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌺</span>
                          <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">GANPATI VISARJAN (गणपति विसर्जन)</span>
                        </div>
                        <h4 className="font-extrabold text-base tracking-tight mt-1">Thursday, September 24, 2026</h4>
                        <p className="text-[11px] text-amber-500 font-extrabold bg-white px-2 py-0.5 rounded-md inline-block mt-1 shadow-sm">
                          ⏰ Time: 05:00 PM onwards • Central Fountain Lawn
                        </p>
                      </div>
                      
                      {/* Countdown calculator */}
                      <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs z-10">
                        <span className="font-bold text-orange-100">⏳ Countdown Remaining:</span>
                        <span className="font-black bg-white/30 px-2 py-1 rounded-md text-[10px] tracking-wide animate-pulse">
                          {(() => {
                            const todayStr = simulatedDate || "2026-07-12";
                            const today = new Date(todayStr);
                            const target = new Date("2026-09-24T17:00:00");
                            const diffTime = target.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return "Swaroop Visarjan Completed";
                            if (diffDays === 0) return "🎯 VISARJAN TODAY / आज विसर्जन है!";
                            return `⚡ ${diffDays} Days Left (दिन शेष)`;
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Navratri Durga Visarjan Card */}
                    <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white p-4 rounded-xl shadow-sm border border-pink-500 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                      <div className="absolute right-[-10px] bottom-[-10px] text-white/10 text-8xl font-black select-none pointer-events-none">
                         दुर्गा
                      </div>
                      <div className="space-y-1 z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⚔️</span>
                          <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">DURGA VISARJAN (दुर्गा विसर्जन)</span>
                        </div>
                        <h4 className="font-extrabold text-base tracking-tight mt-1">Tuesday, October 20, 2026</h4>
                        <p className="text-[11px] text-pink-500 font-extrabold bg-white px-2 py-0.5 rounded-md inline-block mt-1 shadow-sm">
                          ⏰ Time: 06:00 PM onwards • Central Lawn Gate 1
                        </p>
                      </div>

                      {/* Countdown calculator */}
                      <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs z-10">
                        <span className="font-bold text-pink-100">⏳ Countdown Remaining:</span>
                        <span className="font-black bg-white/30 px-2 py-1 rounded-md text-[10px] tracking-wide">
                          {(() => {
                            const todayStr = simulatedDate || "2026-07-12";
                            const today = new Date(todayStr);
                            const target = new Date("2026-10-20T18:00:00");
                            const diffTime = target.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return "Maha Visarjan Completed";
                            if (diffDays === 0) return "🎯 DURGA VISARJAN TODAY!";
                            return `⚡ ${diffDays} Days Left (दिन शेष)`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Filter and Normal programs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-black text-slate-500 uppercase">📚 Filter Programs / कार्यक्रम श्रेणियां:</span>
                    <div className="flex flex-wrap gap-1">
                      {["all", "ganpati", "navratri", "other"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setProgramFilter(f as any)}
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition ${programFilter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                          {f === "all" ? "All / सभी" : f === "ganpati" ? "Ganpati" : f === "navratri" ? "Navratri" : "Other"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const filtered = programs.filter(p => {
                      const matchesSociety = p.society.toLowerCase() === (currentUser.society || "").toLowerCase();
                      if (!matchesSociety) return false;

                      if (programFilter === "all") return true;
                      if (programFilter === "ganpati") {
                        return p.title.toLowerCase().includes("gan") || 
                               p.title.toLowerCase().includes("गण") || 
                               p.description.toLowerCase().includes("gan");
                      }
                      if (programFilter === "navratri") {
                        return p.title.toLowerCase().includes("nav") || 
                               p.title.toLowerCase().includes("नव") || 
                               p.title.toLowerCase().includes("garba") || 
                               p.title.toLowerCase().includes("गरबा") ||
                               p.title.toLowerCase().includes("dandiya") || 
                               p.title.toLowerCase().includes("डांडिया");
                      }
                      if (programFilter === "other") {
                        return !p.title.toLowerCase().includes("gan") && 
                               !p.title.toLowerCase().includes("गण") && 
                               !p.title.toLowerCase().includes("nav") && 
                               !p.title.toLowerCase().includes("नव") && 
                               !p.title.toLowerCase().includes("garba") && 
                               !p.title.toLowerCase().includes("गरबा") &&
                               !p.title.toLowerCase().includes("dandiya") && 
                               !p.title.toLowerCase().includes("डांडिया");
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-500">No programs scheduled matching this category in your society.</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">कोई कार्यक्रम नहीं मिला।</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((p) => {
                          const todayStr = simulatedDate || "2026-07-12";
                          let statusBadge = { label: "Upcoming", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
                          if (p.date === todayStr) {
                            statusBadge = { label: "TODAY / आज", color: "bg-rose-500 text-white animate-pulse" };
                          } else if (p.date < todayStr) {
                            statusBadge = { label: "Completed / संपन्न", color: "bg-slate-100 text-slate-400" };
                          }

                          return (
                            <div key={p.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 bg-gradient-to-br from-white to-slate-50/50 relative overflow-hidden">
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${statusBadge.color}`}>
                                    {statusBadge.label}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono font-bold">
                                    {p.date}
                                  </span>
                                </div>

                                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                                  ✨ {p.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                  {p.description}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-600 font-semibold">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">📅</span>
                                  <span>Date: <strong>{p.date}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">🕒</span>
                                  <span>Time: <strong className="text-indigo-600">{p.startTime} {p.endTime ? `to ${p.endTime}` : ""}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">📍</span>
                                  <span>Location: <strong>{p.location}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">📞</span>
                                  <span>Contact: <strong className="text-slate-800">{p.coordinator}</strong></span>
                                </div>
                                {p.targetFloors && (
                                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100/70 rounded-lg py-1 px-2 mt-1">
                                    <span className="text-[11px]">🪔</span>
                                    <span className="text-[9px] text-slate-700">Duty/Participation: <strong className="text-rose-800 font-black">{p.targetFloors}</strong></span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`📞 Calling Coordinator ${p.coordinator} to enquire about ${p.title}.\n\n(Simulating call to phone...)`);
                                  }}
                                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[10px] py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <PhoneCall className="w-3 h-3 text-emerald-600" />
                                  <span>Call Coordinator / संपर्क करें</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: AARTI FLOOR DUTY TABLE */}
              {festivalSubTab === "duty" && (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-100 flex items-start gap-3">
                    <span className="text-lg">📢</span>
                    <div>
                      <h4 className="text-xs font-black text-amber-800 uppercase">Aarti Participation Rule / आरती की बारी का नियम</h4>
                      <p className="text-[10px] text-amber-700 mt-0.5 font-semibold">
                        To maintain smooth crowd management at the pandal, floors have been designated specific dates. Daily Aarti happens at <strong>07:00 PM (Ganpati)</strong> & <strong>07:30 PM (Navratri)</strong>. Please gather as per your scheduled turn!
                      </p>
                    </div>
                  </div>

                  {/* Inner sub tab for Ganpati vs Navratri duty */}
                  <div className="flex gap-2 border-b border-slate-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setProgramFilter("ganpati")}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg ${programFilter === "ganpati" || programFilter === "all" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-50 text-slate-500"}`}
                    >
                      🪔 Ganeshotsav Duty Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgramFilter("navratri")}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg ${programFilter === "navratri" ? "bg-pink-100 text-pink-800 border border-pink-200" : "bg-slate-50 text-slate-500"}`}
                    >
                      💃 Navratri Garba & Aarti Duty
                    </button>
                  </div>

                  {/* Duty List Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                          <th className="p-3">Date / दिनांक</th>
                          <th className="p-3">Aarti Time</th>
                          <th className="p-3">Assigned Wing & Floors</th>
                          <th className="p-3">Coordinator</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const activeSchedule = (programFilter === "navratri") ? [
                            { date: "2026-10-11", time: "07:30 PM", wings: "Tower A (Floors 1 - 5)", coordinator: "Arvind Kejriwal", phone: "+91 98765 43210" },
                            { date: "2026-10-12", time: "07:30 PM", wings: "Tower A (Floors 6 - 10)", coordinator: "Gaurav Gupta", phone: "+91 98765 43211" },
                            { date: "2026-10-13", time: "07:30 PM", wings: "Tower B (Floors 1 - 5)", coordinator: "Satyendar Jain", phone: "+91 98765 43212" },
                            { date: "2026-10-14", time: "07:30 PM", wings: "Tower B (Floors 6 - 10)", coordinator: "Manish Sisodia", phone: "+91 98765 43213" },
                            { date: "2026-10-15", time: "07:30 PM", wings: "Tower C (Floors 1 - 5)", coordinator: "Raghav Chadha", phone: "+91 98765 43214" },
                            { date: "2026-10-16", time: "07:30 PM", wings: "Tower C (Floors 6 - 10)", coordinator: "Sanjay Singh", phone: "+91 98765 43215" },
                            { date: "2026-10-17", time: "07:30 PM", wings: "Penthouse Residents", coordinator: "Atishi Marlena", phone: "+91 98765 43216" },
                            { date: "2026-10-18", time: "07:30 PM", wings: "ALL RESIDENTS (Maha Ashtami)", coordinator: "Saurabh Bhardwaj", phone: "+91 98765 43217" },
                            { date: "2026-10-19", time: "07:30 PM", wings: "ALL RESIDENTS (Maha Navami)", coordinator: "Kailash Gahlot", phone: "+91 98765 43218" },
                            { date: "2026-10-20", time: "05:30 PM", wings: "ALL TOWERS (Dussehra Visarjan)", coordinator: "Committee Board", phone: "+91 98765 43219" }
                          ] : [
                            { date: "2026-09-15", time: "07:00 PM", wings: "Tower A (Floors 1 - 3)", coordinator: "Sanjay Singhal", phone: "+91 98123 45601" },
                            { date: "2026-09-16", time: "07:00 PM", wings: "Tower A (Floors 4 - 6)", coordinator: "Rajesh Khandelwal", phone: "+91 98123 45602" },
                            { date: "2026-09-17", time: "07:00 PM", wings: "Tower A (Floors 7 - 10)", coordinator: "Vikas Joshi", phone: "+91 98123 45603" },
                            { date: "2026-09-18", time: "07:00 PM", wings: "Tower B (Floors 1 - 3)", coordinator: "Amit Saxena", phone: "+91 98123 45604" },
                            { date: "2026-09-19", time: "07:00 PM", wings: "Tower B (Floors 4 - 6)", coordinator: "Manoj Tiwari", phone: "+91 98123 45605" },
                            { date: "2026-09-20", time: "07:00 PM", wings: "Tower B (Floors 7 - 10)", coordinator: "Preeti Deshmukh", phone: "+91 98123 45606" },
                            { date: "2026-09-21", time: "07:00 PM", wings: "Tower C (Floors 1 - 3)", coordinator: "Nikhil Kamath", phone: "+91 98123 45607" },
                            { date: "2026-09-22", time: "07:00 PM", wings: "Tower C (Floors 4 - 6)", coordinator: "Rahul Iyer", phone: "+91 98123 45608" },
                            { date: "2026-09-23", time: "07:00 PM", wings: "Tower C (Floors 7 - 10)", coordinator: "Sudhir Kumar", phone: "+91 98123 45609" },
                            { date: "2026-09-24", time: "05:00 PM", wings: "ALL RESIDENTS (Grand Visarjan)", coordinator: "Committee Core Team", phone: "+91 98123 45600" }
                          ];

                          const todayStr = simulatedDate || "2026-07-12";

                          return activeSchedule.map((d, index) => {
                            const isToday = d.date === todayStr;
                            const isCompleted = d.date < todayStr;
                            
                            let statusText = "Upcoming";
                            let statusStyle = "bg-slate-100 text-slate-600";
                            if (isToday) {
                              statusText = "TODAY / आज";
                              statusStyle = "bg-rose-500 text-white font-black animate-pulse";
                            } else if (isCompleted) {
                              statusText = "Completed";
                              statusStyle = "bg-slate-100 text-slate-400 border border-slate-200/50";
                            }

                            return (
                              <tr 
                                key={index} 
                                className={`border-b border-slate-100 text-xs font-semibold hover:bg-slate-50/50 transition-colors ${isToday ? "bg-amber-50/60 border-l-4 border-l-amber-500" : ""}`}
                              >
                                <td className="p-3 font-mono font-bold text-slate-700">{d.date}</td>
                                <td className="p-3 text-indigo-600 font-bold">{d.time}</td>
                                <td className="p-3">
                                  <div className="font-extrabold text-slate-800">{d.wings}</div>
                                  {isToday && <span className="text-[9px] text-amber-600 font-extrabold">👉 Your Turn Tonight! / आज आपका ग्रुप है!</span>}
                                </td>
                                <td className="p-3">
                                  <div className="text-slate-800">{d.coordinator}</div>
                                  <div className="text-[10px] text-slate-400">{d.phone}</div>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-black ${statusStyle}`}>
                                    {statusText}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`📞 Calling ${d.coordinator} (${d.phone}) to coordinate turn.`);
                                    }}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 transition active:scale-95 inline-flex items-center justify-center cursor-pointer"
                                    title="Call Coordinator"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: SMART LOUDSPEAKER ANNOUNCEMENT SIMULATOR */}
              {festivalSubTab === "loudspeaker" && (
                <div className="space-y-5">
                  <div className="bg-slate-900 rounded-xl p-5 text-white border border-slate-800 relative overflow-hidden flex flex-col md:flex-row gap-5 items-center justify-between shadow-lg">
                    {/* Retro loudspeaker dynamic illustration */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl shadow-lg relative z-10 animate-pulse">
                          📢
                        </div>
                        {/* Speaker soundwave ring simulation */}
                        <div className="absolute w-20 h-20 bg-pink-500/20 rounded-full animate-ping z-0"></div>
                        <div className="absolute w-24 h-24 bg-indigo-500/10 rounded-full animate-ping delay-300 z-0"></div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 flex items-center gap-1.5">
                          <span>Society Digital PA System</span>
                          <span className="bg-red-500 text-white text-[8px] font-black px-1 rounded animate-pulse">MIC ON</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold max-w-sm">
                          Simulate the society's high-fidelity loudspeaker voice alert. Whoever selects a language on their phone will hear it natively!
                        </p>
                      </div>
                    </div>

                    {/* Language selector for simulation */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 flex flex-col gap-1 w-full md:w-auto">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Select Voice Language / आवाज़ बदलें:</label>
                      <select
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-black text-amber-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        id="simulation-loudspeaker-lang-selector"
                      >
                        <option value="en">🇬🇧 English (अंग्रेज़ी)</option>
                        <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                        <option value="mr">🇮🇳 Marathi (मराठी)</option>
                        <option value="gu">🇮🇳 Gujarati (ગુજરાતી)</option>
                        <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                        <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                        <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                        <option value="kn">🇮🇳 Kannada (ಕನ್ನಡ)</option>
                        <option value="pa">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Announcement Display and play controls */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="space-y-1">
                      <span className="bg-slate-200 text-slate-700 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Announcement Text (घोषणा वाक्य):</span>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative min-h-[70px] flex items-center">
                        <p className="text-slate-800 font-black text-sm leading-relaxed">
                          {(() => {
                            const map: Record<string, string> = {
                              en: "Attention please! The Aarti time has started. Please gather near the pandal.",
                              hi: "कृपया ध्यान दें! आरती का समय हो गया है। कृपया नीचे पंडाल के पास सभी लोग इकट्ठा हो जाएं।",
                              mr: "कृपया लक्ष द्या! आरतीची वेळ झाली आहे. कृपया खाली पंडालजवळ सर्व लोकांनी एकत्र यावे.",
                              gu: "કૃપા કરીને ધ્યાન આપો! આરતીનો સમય થઈ ગયો છે. કૃપા કરીને નીચે પંડાલ પાસે બધા લોકો ભેગા થઈ જાઓ.",
                              bn: "অনুগ্রহ করে মনোযোগ দিন! আরতির সময় শুরু হয়েছে। অনুগ্রহ করে নিচে প্যান্ডেলের কাছে সবাই জড়ো হন।",
                              ta: "தயவுசெய்து கவனிக்கவும்! ஆரத்தி நேரம் தொடங்கிவிட்டது. தயவுசெய்து கீழே உள்ள பந்தல் அருகே அனைவரும் ஒன்று கூடுங்கள்.",
                              te: "దయచేసి గమనించండి! హారతి సమయం ప్రారంభమైంది. దయచేసి కింద ఉన్న పండల్ వద్ద అందరూ కూడా చేరండి.",
                              kn: "ದಯವಿಟ್ಟು ಗಮನಿಸಿ! ಆರತಿಯ ಸಮಯ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪಂಡಾಲ್ ಹತ್ತಿರ ಎಲ್ಲರೂ ಒಟ್ಟಾಗಿ ಸೇರಿ.",
                              pa: "ਕਿਰਪਾ ਕਰਕੇ ਧਿਆਨ ਦਿਓ! ਆਰਤੀ ਦਾ ਸਮਾਂ ਹੋ ਗਿਆ ਹੈ। ਕਿਰਪา ਕਰਕੇ ਹੇਠਾਂ ਪੰਡਾਲ ਦੇ ਕੋਲ ਸਾਰੇ ਇਕੱਠੇ ਹੋ ਜਾਓ।"
                            };
                            return map[voiceLang] || map["en"];
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons with custom audio synthesis */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Play realism chime sound
                          try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const osc1 = audioCtx.createOscillator();
                            const gain1 = audioCtx.createGain();
                            osc1.type = "sine";
                            osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
                            gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
                            gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                            osc1.connect(gain1);
                            gain1.connect(audioCtx.destination);
                            osc1.start();
                            osc1.stop(audioCtx.currentTime + 1.5);
                          } catch (e){}
                          alert("🛎️ Simulating brass temple bell ringing sound!");
                        }}
                        className="bg-white hover:bg-amber-50 text-slate-800 font-extrabold text-[11px] py-3 rounded-xl border border-slate-200 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        🔔 Play Temple Bell / घंटी बजाएं
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const map: Record<string, string> = {
                            en: "Attention please! The Aarti time has started. Please gather near the pandal.",
                            hi: "कृपया ध्यान दें! आरती का समय हो गया है। कृपया नीचे पंडाल के पास सभी लोग इकट्ठा हो जाएं।",
                            mr: "कृपया लक्ष द्या! आरतीची वेळ झाली आहे. कृपया खाली पंडालजवळ सर्व लोकांनी एकत्र यावे.",
                            gu: "કૃપા કરીને ધ્યાન આપો! આરતીનો સમય થઈ ગયો છે. કૃપા કરીને નીચે પંડાલ પાસે બધા લોકો ભેગા થઈ જાઓ.",
                            bn: "অনুগ্রহ করে মনোযোগ দিন! আরতির সময় শুরু হয়েছে। অনুগ্রহ করে নিচে প্যান্ডেলের কাছে সবাই জড়ো হন।",
                            ta: "தயவுசெய்து கவனிக்கவும்! ஆரத்தி நேரம் தொடங்கிவிட்டது. தயவுசெய்து கீழே உள்ள பந்தல் அருகே அனைவரும் ஒன்று கூடுங்கள்.",
                            te: "దయచేసి గమనించండి! హారతి సమయం ప్రారంభమైంది. దయచేసి కింద ఉన్న పండల్ వద్ద అందరూ కూడా చేరండి.",
                            kn: "ದಯವಿಟ್ಟು ಗಮನಿಸಿ! ಆರತಿಯ ಸಮಯ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪಂಡಾಲ್ ಹತ್ತಿರ ಎಲ್ಲರೂ ಒಟ್ಟಾಗಿ ಸೇರಿ.",
                            pa: "ਕਿਰਪਾ ਕਰਕੇ ਧਿਆਨ ਦਿਓ! ਆਰਤੀ ਦਾ ਸਮਾਂ ਹੋ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਪੰਡਾਲ ਦੇ ਕੋਲ ਸਾਰੇ ਇਕੱਠੇ ਹੋ ਜਾਓ।"
                          };
                          const text = map[voiceLang] || map["en"];

                          // Play complex temple bells and then speak!
                          try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const now = audioCtx.currentTime;
                            const chimes = [650, 850, 1100, 1300];
                            chimes.forEach((f, idx) => {
                              const osc = audioCtx.createOscillator();
                              const gain = audioCtx.createGain();
                              osc.type = "sine";
                              osc.frequency.setValueAtTime(f, now + idx * 0.2);
                              gain.gain.setValueAtTime(0.0, now + idx * 0.2);
                              gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.2 + 0.02);
                              gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 1.0);
                              osc.connect(gain);
                              gain.connect(audioCtx.destination);
                              osc.start(now + idx * 0.2);
                              osc.stop(now + idx * 0.2 + 1.2);
                            });
                          } catch (e){}

                          setTimeout(() => {
                            if ("speechSynthesis" in window) {
                              window.speechSynthesis.cancel();
                              const utterance = new SpeechSynthesisUtterance(text);
                              utterance.rate = 0.88;
                              utterance.pitch = 1.02;
                              const voices = window.speechSynthesis.getVoices();
                              const targetVoice = voices.find(v => 
                                v.lang.toLowerCase().startsWith(voiceLang.toLowerCase()) ||
                                (voiceLang === "en" && v.lang.toLowerCase().includes("in"))
                              );
                              if (targetVoice) utterance.voice = targetVoice;
                              window.speechSynthesis.speak(utterance);
                            } else {
                              alert("Speech Synthesis is not supported in this browser. Showing notification instead:\n\n" + text);
                            }
                          }, 1000);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] py-3 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        🔊 Hear Announcement / घोषणा सुनें
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          alert("📲 Alerts sent! Triggered smart resident dashboard popups on all registered devices belonging to " + (currentUser.society || "your society") + ".");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] py-3 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        📲 Simulate Broadcaster / सभी को भेजें
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Grid for Mobile & Desktop - Colorful Bento Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>{t("resident.dashboard.hub_title", "Resident Services Hub (1-Tap Launch)")}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                
                {/* 1. Visitor Pre-Approval */}
                <button 
                  onClick={() => setActiveTab("visitors")}
                  className="bg-white hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-purple-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.pre_approve_guest", "Pre-Approve Guest")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.pre_approve_desc", "Generate gate QR codes")}</p>
                  </div>
                </button>

                {/* 2. Domestic Help Attendance */}
                <button 
                  onClick={() => setActiveTab("helpers")}
                  className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-cyan-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.domestic_help", "Domestic Help")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.domestic_help_desc", "Attendance check of staff")}</p>
                  </div>
                </button>

                {/* 3. Parcel Delivery Tracking */}
                <button 
                  onClick={() => setActiveTab("parcels")}
                  className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-blue-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.parcel_tracking", "Parcel Tracking")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.parcel_tracking_desc", "Packages dropped at gate")}</p>
                  </div>
                </button>

                {/* 4. Maintenance Bills */}
                <button 
                  onClick={() => setActiveTab("bills")}
                  className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-emerald-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.maintenance_bills", "Maintenance & Bills")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.maintenance_bills_desc", "Settle utility dues instantly")}</p>
                  </div>
                </button>

                {/* 5. Book Amenities */}
                <button 
                  onClick={() => setActiveTab("amenities")}
                  className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-teal-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.book_amenities", "Book Amenities")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.book_amenities_desc", "Reserve slots & clubhouse")}</p>
                  </div>
                </button>

                {/* 5b. Book Home Services (JobsKaru) */}
                <button 
                  onClick={() => setActiveTab("services")}
                  className="bg-white hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-sky-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.home_services", "Book Home Services")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.home_services_desc", "Electrician, Plumber & repair")}</p>
                  </div>
                </button>

                {/* 6. AI Helpdesk & Tickets */}
                <button 
                  onClick={() => setActiveTab("complaints")}
                  className="bg-white hover:bg-rose-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-rose-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.helpdesk_tickets", "AI Helpdesk Tickets")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.helpdesk_tickets_desc", "Lodge plumbing/lift complaints")}</p>
                  </div>
                </button>

                {/* 7. Society Chat & AI Bot */}
                <button 
                  onClick={() => setActiveTab("community")}
                  className="bg-white hover:bg-violet-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-violet-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.chat_board", "Society Chat Board")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.chat_board_desc", "Discuss with neighbors & AI")}</p>
                  </div>
                </button>

                {/* 8. My Household Family */}
                <button 
                  onClick={() => setActiveTab("family")}
                  className="bg-white hover:bg-fuchsia-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-fuchsia-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.my_family", "My Family")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.my_family_desc", "Manage family flat profiles")}</p>
                  </div>
                </button>

                {/* 9. Registered Vehicles */}
                <button 
                  onClick={() => setActiveTab("vehicles")}
                  className="bg-white hover:bg-orange-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-orange-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.my_vehicles", "My Vehicles RFID")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.my_vehicles_desc", "Register smart RFID stickers")}</p>
                  </div>
                </button>

                {/* 10. Document Vault */}
                <button 
                  onClick={() => setActiveTab("documents")}
                  className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-amber-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.my_documents", "My Document Vault")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.my_documents_desc", "Verify Rent Agreement deeds")}</p>
                  </div>
                </button>

                {/* 11. Emergency Dial Directory */}
                <button 
                  onClick={() => setActiveTab("emergency")}
                  className="bg-white hover:bg-red-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-red-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.emergency_contacts", "Emergency Contacts")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.emergency_contacts_desc", "Fire, guards, and committee")}</p>
                  </div>
                </button>

                {/* 12. Security Preferences */}
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="bg-white hover:bg-slate-50/50 p-4 rounded-2xl border border-slate-200 text-left transition hover:shadow-md hover:border-slate-300 flex flex-col justify-between h-32 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t("resident.dashboard.settings", "App Settings")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{t("resident.dashboard.settings_desc", "Manage notification alerts")}</p>
                  </div>
                </button>

              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Dynamic Live Opinion Poll Widget */}
              {polls && polls.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                      <span>Society Live Ballot & Vote</span>
                    </h4>
                    <span className="bg-violet-50 text-violet-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                  </div>
                  
                  {polls.slice(0, 1).map(poll => {
                    // Check if current user voted
                    const hasVoted = poll.votedUsers.includes(currentUser.id);
                    const totalVotes = poll.totalVotes || 1;
                    
                    return (
                      <div key={poll.id} className="space-y-3.5">
                        <p className="font-extrabold text-slate-800 text-xs leading-normal bg-violet-50/50 p-3 rounded-xl border border-violet-100/60">
                          {poll.question}
                        </p>
                        
                        <div className="space-y-2">
                          {poll.options.map(opt => {
                            // Calculate votes for this option using properties from types.ts
                            const optVotesCount = opt.votes;
                            const percentage = Math.round((optVotesCount / totalVotes) * 100);
                            const isSelected = hasVoted && opt.votes > 0;
                            
                            return (
                              <div key={opt.id} className="relative">
                                {hasVoted ? (
                                  // Voted State (Progress Bars)
                                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 overflow-hidden relative">
                                    <div 
                                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-100 to-indigo-100/50 transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                    <div className="relative z-10 flex justify-between items-center text-xs font-semibold text-slate-700">
                                      <span className="flex items-center gap-1.5">
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                                        <span>{opt.text}</span>
                                      </span>
                                      <span className="text-indigo-900 font-bold">{percentage}% ({optVotesCount})</span>
                                    </div>
                                  </div>
                                ) : (
                                  // Unvoted State (Action Buttons)
                                  <button 
                                    onClick={() => onVote(poll.id, opt.id)}
                                    className="w-full text-left border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl p-3 text-xs font-semibold text-slate-700 transition active:scale-[0.99]"
                                  >
                                    {opt.text}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <p className="text-[10px] text-slate-400 font-bold text-center mt-2 uppercase tracking-wide">
                          {hasVoted ? `THANK YOU! VOTED SECURELY. Total ballots cast: ${totalVotes}` : "Tap an option above to cast your secure RFID vote."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Society Notice Board / Community Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide">
                    Gatekeeper Security Logs Log
                  </h4>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full uppercase">Live Feed</span>
                </div>
                
                <div className="space-y-4">
                  {/* Timeline 1 */}
                  <div className="flex gap-3 relative pb-2 border-l-2 border-slate-100 pl-4 ml-2">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-4 ring-emerald-50"></div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Checked In</span>
                      <p className="text-xs font-extrabold text-slate-800">Maid (Kamla Bai)</p>
                      <p className="text-[10px] text-slate-500">Entered Gate 1 via Biometric RFID scanner • 10:45 AM</p>
                    </div>
                  </div>

                  {/* Timeline 2 */}
                  <div className="flex gap-3 relative pb-2 border-l-2 border-slate-100 pl-4 ml-2">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-amber-500 rounded-full ring-4 ring-amber-50"></div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase">Package Dropped</span>
                      <p className="text-xs font-extrabold text-slate-800">Amazon Delivery Partner</p>
                      <p className="text-[10px] text-slate-500">Left Package for Flat A-402 with Guard Mahendra • 09:30 AM</p>
                    </div>
                  </div>

                  {/* Timeline 3 */}
                  <div className="flex gap-3 relative pl-4 ml-2">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-indigo-50"></div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Visitor Pre-Approval</span>
                      <p className="text-xs font-extrabold text-slate-800">Guest Harish Rawat Pre-Approved</p>
                      <p className="text-[10px] text-slate-500">Generated OTP gatepass code valid until tomorrow • 08:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================== */}
        {/* TAB 1: VISITOR PRE-APPROVAL (QR + PIN) */}
        {/* ==================================== */}
        {activeTab === "visitors" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Active Visitors & Pre-Approvals</h3>
                <p className="text-xs text-slate-500">Provide a secure QR/PIN to visitors to allow immediate entry verification at the gates.</p>
              </div>
              <button 
                onClick={() => setShowPreApprove(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Pre-Approve Guest
              </button>
            </div>

            {/* Live Gate Entry & Intercom Requests Widget */}
            {localApprovals.filter(a => a.flat === currentUser.flat && a.status === "Waiting").length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-ping shrink-0"></span>
                  🔔 Pending Gate Entry Approvals (गेट प्रवेश अनुरोध)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {localApprovals.filter(a => a.flat === currentUser.flat && a.status === "Waiting").map((app) => (
                    <div key={app.id} className="bg-white border border-amber-200 rounded-lg p-3 flex flex-col justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase">
                          <span>{app.type} • {app.company || "Personal"}</span>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{app.flat}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 mt-1">{app.visitorName}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">Waiting at Main Security Gate for your confirmation.</p>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleLocalApprovalAction(app.id, "Rejected")}
                          className="px-2.5 py-1 text-red-600 border border-red-200 hover:bg-red-50 text-[10px] font-black rounded-lg transition"
                        >
                          ❌ REJECT
                        </button>
                        <button
                          onClick={() => handleLocalApprovalAction(app.id, "Approved")}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg transition"
                        >
                          ✅ APPROVE (प्रवेश दें)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated pass popup receipt - UPGRADED PREMIUM GATEPASS HUB */}
            {latestPasscode && (
              <div className="bg-slate-900 border-2 border-indigo-500/40 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
                {/* Background decorative logos */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-[200px]">🏡</div>
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-600 rounded-lg text-white font-black text-xs">GK</span>
                    <div>
                      <h4 className="text-sm font-black tracking-wide text-indigo-400 uppercase">GateKaru Visitor Pass</h4>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Powered by JobsKaru Technologies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      Verified Active
                    </span>
                    <button 
                      onClick={() => setLatestPasscode(null)}
                      className="text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-white/5 font-bold"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Pass layout grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left half: Pass Details */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Visitor Pass ID</p>
                        <p className="font-mono font-bold text-slate-200">PASS-{latestPasscode.passcode}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Society Name</p>
                        <p className="font-bold text-indigo-300">Greenwood Heights</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Resident Name</p>
                        <p className="font-bold text-slate-200">{latestPasscode.hostName || "Aarav Sharma"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Visitor Name</p>
                        <p className="font-bold text-slate-200">{latestPasscode.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Mobile Number</p>
                        <p className="font-mono font-bold text-slate-200">{latestPasscode.phone || "+91 98765 43210"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Purpose of Visit</p>
                        <p className="font-bold text-indigo-300 truncate">{latestPasscode.purpose}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Destination Flat</p>
                        <p className="font-mono font-black text-slate-200">Flat {latestPasscode.flat}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Valid Date</p>
                        <p className="font-bold text-slate-200">{latestPasscode.validDate || "08 July 2026"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Check-In Gate</p>
                        <p className="font-bold text-emerald-400">{latestPasscode.gateName || "Gate No. 1"}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3 border-t border-white/5 pt-2 mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Valid Time Window</p>
                          <p className="font-semibold text-slate-200">{latestPasscode.validTime || "10:00 AM"} - {latestPasscode.expiryTime || "06:00 PM"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Security Helpline</p>
                          <p className="font-mono text-[10px] text-amber-400 font-bold">+91 11-4020-8888</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security rules watermark text */}
                    <p className="text-[9px] text-slate-500 italic leading-relaxed">
                      * Security Instruction: Please show this pass to the security guard at {latestPasscode.gateName || "Gate No. 1"}. This pass is encrypted & authorized for single checkout only.
                    </p>
                  </div>

                  {/* Right half: QR & Passcode */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-5 text-center gap-4 relative">
                    <div className="w-full">
                      <p className="text-[10px] text-indigo-300 font-black tracking-widest uppercase mb-1">6-Digit Passcode / OTP</p>
                      <span className="block bg-indigo-500/20 text-indigo-300 font-mono font-black text-2xl py-2 px-4 rounded-xl border border-indigo-500/30 tracking-widest shadow-inner">
                        {latestPasscode.passcode}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center text-slate-800 relative shadow-lg">
                      <div className="w-28 h-28 bg-slate-100 flex items-center justify-center border-2 border-indigo-900/10 rounded-lg font-bold font-mono text-sm relative">
                        <div className="grid grid-cols-4 gap-1.5 p-2">
                          <div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-100"></div><div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-900"></div>
                          <div className="w-4 h-4 bg-slate-100"></div><div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-100"></div><div className="w-4 h-4 bg-slate-100"></div>
                          <div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-100"></div><div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-900"></div>
                          <div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-900"></div><div className="w-4 h-4 bg-slate-100"></div><div className="w-4 h-4 bg-slate-900"></div>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 font-bold text-[10px] text-indigo-900 rounded-lg">
                          <span className="text-[15px]">📱</span>
                          <span className="font-mono font-black mt-1 text-[9px] tracking-wider">{latestPasscode.passcode}</span>
                        </div>
                      </div>
                      <span className="text-[8px] text-indigo-900 font-black mt-2 tracking-widest uppercase">SCAN AT ENTRY GATE</span>
                    </div>
                  </div>

                </div>

                {/* Professional Action Buttons Grid - UPGRADED PREMIUM DROP-DOWN SYSTEM */}
                <div className="border-t border-slate-800/80 pt-4 mt-5 relative">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span>⚡ Quick Actions & Secure Sharing</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 text-xs w-full">
                    {/* Copy Passcode / OTP (Core Action kept handy) */}
                    <button 
                      type="button"
                      onClick={() => copyPasscode(latestPasscode)}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <span>🔑</span> Copy Code
                    </button>

                    {/* Elegant Share Pass Dropdown Button */}
                    <div className="relative w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black py-2.5 px-5 rounded-xl flex items-center justify-between sm:justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md min-w-[200px]"
                      >
                        <span className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-indigo-400" />
                          <span>📤 SHARE VISITOR PASS</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{shareDropdownOpen ? "▲" : "▼"}</span>
                      </button>

                      {/* Dropdown Menu Container */}
                      {shareDropdownOpen && (
                        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-3 py-1.5 border-b border-slate-900/60 mb-1.5">
                            Select Secure Share Channel
                          </p>
                          
                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => {
                              shareWhatsApp(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-400 rounded-xl px-3 py-2 flex items-center justify-between transition font-bold text-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-emerald-500 text-base">💬</span>
                              <span>WhatsApp</span>
                            </span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Fast</span>
                          </button>

                          {/* Telegram */}
                          <button
                            type="button"
                            onClick={() => {
                              shareTelegram(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-sky-500/10 text-slate-200 hover:text-sky-400 rounded-xl px-3 py-2 flex items-center justify-between transition font-bold text-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-sky-400 text-base">✈</span>
                              <span>Telegram</span>
                            </span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded">Secure</span>
                          </button>

                          {/* Email */}
                          <button
                            type="button"
                            onClick={() => {
                              shareEmail(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-blue-500/10 text-slate-200 hover:text-blue-400 rounded-xl px-3 py-2 flex items-center justify-between transition font-bold text-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-blue-400 text-base">✉</span>
                              <span>Email Address</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-600">SMTP</span>
                          </button>

                          {/* SMS */}
                          <button
                            type="button"
                            onClick={() => {
                              shareSMS(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-purple-500/10 text-slate-200 hover:text-purple-400 rounded-xl px-3 py-2 flex items-center justify-between transition font-bold text-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-purple-400 text-base">📩</span>
                              <span>Mobile SMS</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-600">Cellular</span>
                          </button>

                          <div className="border-t border-slate-900/60 my-1.5"></div>

                          {/* Download PDF */}
                          <button
                            type="button"
                            onClick={() => {
                              printPass(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-rose-500/10 text-slate-200 hover:text-rose-400 rounded-xl px-3 py-2 flex items-center gap-2 transition font-bold text-xs cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-rose-500" />
                            <span>Download PDF Pass</span>
                          </button>

                          {/* Print */}
                          <button
                            type="button"
                            onClick={() => {
                              printPass(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-amber-500/10 text-slate-200 hover:text-amber-400 rounded-xl px-3 py-2 flex items-center gap-2 transition font-bold text-xs cursor-pointer"
                          >
                            <Printer className="w-4 h-4 text-amber-500" />
                            <span>Print Gatepass Receipt</span>
                          </button>

                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => {
                              copyPassLink(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-indigo-500/10 text-slate-200 hover:text-indigo-400 rounded-xl px-3 py-2 flex items-center gap-2 transition font-bold text-xs cursor-pointer"
                          >
                            <span className="text-indigo-400 text-sm">🔗</span>
                            <span>Copy Secure Web Link</span>
                          </button>

                          {/* Download QR Code */}
                          <button
                            type="button"
                            onClick={() => {
                              downloadQRImage(latestPasscode);
                              setShareDropdownOpen(false);
                            }}
                            className="w-full text-left hover:bg-teal-500/10 text-slate-200 hover:text-teal-400 rounded-xl px-3 py-2 flex items-center gap-2 transition font-bold text-xs cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-teal-500" />
                            <span>Download QR Code Image</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pre approval modal/form */}
            {showPreApprove && (
              <form onSubmit={handlePreApprove} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Pre-Approve New Visitor</h4>
                  <button type="button" onClick={() => setShowPreApprove(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visitor Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={preAppName}
                      onChange={(e) => setPreAppName(e.target.value)}
                      placeholder="E.g., Harish Rawat" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visitor Type</label>
                    <select 
                      value={preAppType}
                      onChange={(e: any) => setPreAppType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Guest">Guest / Friend</option>
                      <option value="Delivery">Delivery Partner</option>
                      <option value="Cab">Taxi / Cab Driver</option>
                      <option value="Service">Utility Maintenance Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Purpose of Visit</label>
                    <input 
                      type="text"
                      value={preAppPurpose}
                      onChange={(e) => setPreAppPurpose(e.target.value)}
                      placeholder="E.g., Dinner meetup, fixing WiFi" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company (If Delivery/Service)</label>
                    <input 
                      type="text"
                      value={preAppCompany}
                      onChange={(e) => setPreAppCompany(e.target.value)}
                      placeholder="E.g., Swiggy, Amazon, Kent RO" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visitor Mobile Number</label>
                    <input 
                      type="text" 
                      value={preAppMobile}
                      onChange={(e) => setPreAppMobile(e.target.value)}
                      placeholder="E.g., +91 98765 43210" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gate Name</label>
                    <select 
                      value={preAppGate}
                      onChange={(e) => setPreAppGate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Gate No. 1">Gate No. 1</option>
                      <option value="Gate No. 2">Gate No. 2</option>
                      <option value="Main Security Gate">Main Security Gate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valid Date</label>
                    <input 
                      type="text" 
                      value={preAppDate}
                      onChange={(e) => setPreAppDate(e.target.value)}
                      placeholder="E.g., 08 July 2026" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valid Time</label>
                    <input 
                      type="text" 
                      value={preAppValidTime}
                      onChange={(e) => setPreAppValidTime(e.target.value)}
                      placeholder="E.g., 10:00 AM" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Time</label>
                    <input 
                      type="text" 
                      value={preAppExpiryTime}
                      onChange={(e) => setPreAppExpiryTime(e.target.value)}
                      placeholder="E.g., 06:00 PM" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Plate Number (Optional)</label>
                    <input 
                      type="text"
                      value={preAppVehicle}
                      onChange={(e) => setPreAppVehicle(e.target.value)}
                      placeholder="E.g., DL-3C-ZZ-9900" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition cursor-pointer">
                  GENERATE GATE PASS & PASSCODE
                </button>
              </form>
            )}

            {/* List of current visitor logs matching resident's flat */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Greenwood Heights Visitors Log (Flat: {currentUser.flat})</h4>
                <span className="text-[10px] text-slate-400 font-bold">REFRESHES AUTOMATICALLY</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2.5">Visitor</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Company/Purpose</th>
                      <th className="px-4 py-2.5">Passcode</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Check-In / Out</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {visitors.filter(v => v.flat === currentUser.flat).map((visitor) => (
                      <tr 
                        key={visitor.id} 
                        onClick={() => setSelectedDetail({ type: "visitor", data: visitor })}
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-700">{visitor.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            visitor.type === "Guest" ? "bg-purple-100 text-purple-700" :
                            visitor.type === "Delivery" ? "bg-amber-100 text-amber-700" :
                            visitor.type === "Cab" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {visitor.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {visitor.company !== "Personal" ? `${visitor.company} - ` : ""}{visitor.purpose}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-600">{visitor.passcode}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            visitor.status === "Checked-In" ? "bg-green-100 text-green-700 animate-pulse" :
                            visitor.status === "Checked-Out" ? "bg-slate-100 text-slate-700" : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {visitor.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-500">
                          {visitor.checkedInAt ? (
                            <div>
                              <p className="text-green-600 font-semibold">In: {new Date(visitor.checkedInAt).toLocaleTimeString()}</p>
                              {visitor.checkedOutAt && <p className="text-slate-400">Out: {new Date(visitor.checkedOutAt).toLocaleTimeString()}</p>}
                            </div>
                          ) : (
                            <span className="text-slate-400">Not verified yet</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLatestPasscode(visitor);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-[10px] font-extrabold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            View & Share Pass
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 2: MAINTENANCE BILLS & PAYMENTS */}
        {/* ==================================== */}
        {activeTab === "bills" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Outstanding Billing Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">A-402 Current Dues</span>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">
                    ₹{bills.filter(b => b.flat === currentUser.flat && b.status === "Unpaid").reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">Due by: 15th July 2026. Avoid late fee penalty of ₹100/week.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Clean water utility charges</span>
                    <span>Inc. in bills</span>
                  </div>
                </div>
              </div>

              {/* Secure Payment System Info */}
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">GateKaru Pay Assurance</span>
                  </div>
                  <h3 className="text-lg font-bold mt-2">Instant UPI & Cards Settlement</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    GateKaru payments are escrow-secured. Once paid, the society accounting ERP automatically issues an instant PDF receipt and notifies the society secretary.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 0% Transaction Fees
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant GST Receipt
                  </div>
                </div>
              </div>
            </div>

            {/* List of Bills */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Maintenance & Amenities Billing History</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2.5">Billing Item</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Due Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Action / Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {bills.filter(b => b.flat === currentUser.flat).map((bill) => (
                      <tr 
                        key={bill.id} 
                        onClick={() => setSelectedDetail({ type: "bill", data: bill })}
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-700">{bill.title}</p>
                          <p className="text-[10px] text-slate-400">ID: {bill.id}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{bill.category}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">₹{bill.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-500">{bill.dueDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bill.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {bill.status === "Unpaid" ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPayingBill(bill);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded text-[10px]"
                            >
                              PAY NOW
                            </button>
                          ) : (
                            <div className="text-[10px] text-slate-500">
                              <p className="text-emerald-600 font-semibold">Paid Settle</p>
                              <p className="font-mono text-[9px] text-slate-400">{bill.transactionId}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment checkout modal simulation */}
            {payingBill && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200">
                  <div className="bg-indigo-900 text-white p-6">
                    <span className="text-[10px] uppercase font-bold text-indigo-300">Secure Checkout GateKaruPay</span>
                    <h3 className="text-lg font-bold mt-1">Settle Maintenance Fees</h3>
                    <div className="flex justify-between items-center mt-3 bg-indigo-800 p-3 rounded-lg border border-indigo-700">
                      <div>
                        <p className="text-[10px] text-indigo-300 uppercase font-bold">{payingBill.title}</p>
                        <p className="text-xs text-white">Flat: {payingBill.flat}</p>
                      </div>
                      <p className="text-xl font-bold">₹{payingBill.amount}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Tabs for payment mode */}
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setPaymentMethod("upi")}
                        className={`flex-1 py-2 text-xs font-bold transition ${paymentMethod === "upi" ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
                      >
                        BHIM UPI / GPay
                      </button>
                      <button 
                        onClick={() => setPaymentMethod("card")}
                        className={`flex-1 py-2 text-xs font-bold transition ${paymentMethod === "card" ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
                      >
                        Credit / Debit Card
                      </button>
                    </div>

                    {paymentMethod === "upi" ? (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">UPI Virtual ID Address</label>
                        <input 
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                          placeholder="e.g. sharma@okaxis"
                        />
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center gap-3">
                          <QrCode className="w-10 h-10 text-slate-600 shrink-0" />
                          <p className="text-[10px] text-slate-500 leading-normal">
                            A payment request will be sent to your UPI app. Open GPay/PhonePe to complete verification.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Number</label>
                          <input 
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                            <input 
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-center font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CVV Code</label>
                            <input 
                              type="password"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setPayingBill(null)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handlePaySubmit}
                        disabled={isProcessingPayment}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm flex items-center justify-center gap-1"
                      >
                        {isProcessingPayment ? "Processing..." : `PAY ₹${payingBill.amount}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 3: AI HELPDESK & COMPLAINTS */}
        {/* ==================================== */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            
            {/* AI Assistant Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">GateKaru AI Complaint copilot</span>
              </div>
              <h3 className="text-lg font-bold">Write polite drafts or explore immediate solutions before submitting.</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Type your concern briefly. Our Gemini-3.5-powered AI will automatically construct a perfectly formatted official letter for the managing committee and propose immediate troubleshooting steps.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Add Complaint Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">File a New Helpdesk Complaint</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Complaint Category</label>
                  <select 
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Lifts & Elevators">Lifts & Elevators</option>
                    <option value="Plumbing">Water Leakage / Plumbing</option>
                    <option value="Electrical">Electrical Grid & Power backup</option>
                    <option value="Security">Security & Guard Patrols</option>
                    <option value="Housekeeping">Garbage / Housekeeping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Issue Headline</label>
                  <input 
                    type="text"
                    required
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    placeholder="E.g., Low water pressure in master bedroom bathroom"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detailed Description of Concern</label>
                  <textarea 
                    rows={4}
                    required
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Provide specific details such as date/time started, block/tower number, and severity..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleAiDraftComplaint}
                    disabled={isAiDrafting || !compTitle || !compDesc}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-indigo-400 font-bold py-2 rounded-lg text-xs border border-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    {isAiDrafting ? "AI is Thinking..." : "AI POLISH & SOLUTIONS"}
                  </button>
                  <button 
                    onClick={handleRegisterComplaint}
                    disabled={!compTitle || !compDesc}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-2 rounded-lg text-xs shadow transition"
                  >
                    REGISTER TICKET
                  </button>
                </div>
              </div>

              {/* AI Copilot output draft */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Gemini AI Drafted Letter & Suggestions
                  </h4>
                  
                  {aiDraft ? (
                    <div className="space-y-4 mt-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-60 overflow-y-auto">
                        <pre className="text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed">{aiDraft}</pre>
                      </div>
                      
                      {aiSuggestions.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Actionable DIY Troubleshooting Tips</p>
                          <ul className="space-y-1">
                            {aiSuggestions.map((sug, idx) => (
                              <li key={idx} className="text-xs text-indigo-950 flex items-start gap-1.5 bg-indigo-50/50 px-2.5 py-1 rounded-md">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>{sug}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                      <p className="text-xs">No active draft yet. Enter details on the left and click **AI Polish & Solutions** to trigger assistance.</p>
                    </div>
                  )}
                </div>
                {aiDraft && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(aiDraft);
                      alert("AI draft copied to clipboard!");
                    }}
                    className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-xs border border-slate-200"
                  >
                    COPY AI LETTER COPY
                  </button>
                )}
              </div>
            </div>

            {/* Existing complaints history list */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Helpdesk Complaint Tickets (Flat: {currentUser.flat})</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {complaints.filter(c => c.flat === currentUser.flat).map((complaint) => (
                  <div 
                    key={complaint.id} 
                    onClick={() => setSelectedDetail({ type: "complaint", data: complaint })}
                    className="p-4 hover:bg-slate-50 transition space-y-2 cursor-pointer text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{complaint.title}</h5>
                        <p className="text-xs text-slate-400">Category: {complaint.category} • Created on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        complaint.status === "Pending" ? "bg-red-100 text-red-700" :
                        complaint.status === "Assigned" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">{complaint.description}</p>
                    
                    {complaint.assignedTo && (
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> Assigned to: {complaint.assignedTo}
                      </p>
                    )}

                    {/* Ticket progress notes */}
                    {complaint.updates && complaint.updates.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Updates Feed</p>
                        {complaint.updates.map((upd, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-600">
                            <span>• {upd.note}</span>
                            <span className="text-[10px] text-slate-400">{new Date(upd.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 4: SOCIETY CHAT & AI CHATBOT */}
        {/* ==================================== */}
        {activeTab === "community" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px]">
            
            {/* Left Col: Society Public Chat Board (8 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Society Resident Chat Board</h4>
                  <p className="text-[10px] text-slate-500">Public messages and queries shared by neighbors.</p>
                </div>
                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Greenwood Heights Live</span>
              </div>
              
              {/* Message scroll container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {chats.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-md ${msg.sender === currentUser.name ? "ml-auto items-end" : ""}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-slate-700">{msg.sender}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({msg.flat})</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${msg.role === "Admin" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>{msg.role}</span>
                    </div>
                    <div className={`p-3 rounded-xl text-xs leading-normal ${
                      msg.sender === currentUser.name ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (onSendChat(chatInput), setChatInput(""))}
                  placeholder="Share a general update, ask neighbors for help, or recommend vendors..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <button 
                  onClick={() => { onSendChat(chatInput); setChatInput(""); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Col: AI Helpdesk Chatbot Assistant (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-xl shadow-lg border border-slate-800 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide">GateKaru AI Society Chatbot</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Bylaws, guidelines & quick help desk</p>
                  </div>
                </div>
                {/* Voice mode trigger */}
                <button 
                  onClick={handleSpeakSimulate}
                  disabled={voiceMode}
                  className={`p-1.5 rounded-full flex items-center justify-center transition-all ${
                    voiceMode ? "bg-red-500 text-white animate-ping" : "bg-slate-800 text-indigo-400 hover:bg-slate-700"
                  }`}
                  title="Simulate Voice Prompt (Hindi/English Support)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bot chat history */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                {aiBotHistory.map((item, idx) => (
                  <div key={idx} className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}>
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      {item.sender === "user" ? "Resident Query" : "GateKaru AI Bot"}
                    </span>
                    <div className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      item.sender === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                    }`}>
                      {item.text}
                    </div>
                  </div>
                ))}
                {isAiReplying && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> GateKaru AI is drafting reply...
                  </div>
                )}
              </div>

              {/* Bot query input */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
                <input 
                  type="text"
                  value={aiBotInput}
                  onChange={(e) => setAiBotInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAiBotQuery()}
                  placeholder="E.g., What is the clubhouse fee? or Late charges?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                />
                <button 
                  onClick={handleSendAiBotQuery}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition"
                >
                  ASK AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 5: BOOK AMENITIES */}
        {/* ==================================== */}
        {activeTab === "amenities" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Society Amenity Scheduling ERP</h3>
                <p className="text-xs text-slate-500">Instantly lock slots for Community Halls, Badminton Courts, and Gymnasium.</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">0% Booking Surcharges</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to book slot */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Book a Slot</h4>
                <form onSubmit={handleBookAmenitySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Amenity</label>
                    <select 
                      value={selectedAmenity}
                      onChange={(e) => setSelectedAmenity(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Choose an Option --</option>
                      {amenities.map(a => (
                        <option key={a.id} value={a.id}>{a.name} (₹{a.costPerHour}/hr)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Date</label>
                    <input 
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Time Slot</label>
                    <select 
                      value={bookingSlot}
                      onChange={(e) => setBookingSlot(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="09:00 - 10:00">09:00 AM - 10:00 AM</option>
                      <option value="11:00 - 12:00">11:00 AM - 12:00 PM</option>
                      <option value="15:00 - 16:00">03:00 PM - 04:00 PM</option>
                      <option value="18:00 - 19:00">06:00 PM - 07:00 PM</option>
                      <option value="19:00 - 21:00">07:00 PM - 09:00 PM</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition">
                    CONFIRM & GENERATE BILLING
                  </button>
                </form>
              </div>

              {/* List of Society Amenities available */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Greenwood Society Leisure Amenities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amenities.map(a => (
                      <div key={a.id} className="border border-slate-100 p-3.5 rounded-lg bg-slate-50 hover:border-slate-300 transition flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-slate-800 text-xs">{a.name}</h5>
                          <p className="text-[10px] text-slate-500 mt-1">{a.description}</p>
                          <p className="text-[10px] text-indigo-600 font-semibold mt-1">Capacity: {a.capacity} persons</p>
                        </div>
                        <span className="bg-white px-2 py-1 rounded text-[10px] border border-slate-200 font-bold text-slate-700 whitespace-nowrap">
                          {a.costPerHour === 0 ? "FREE" : `₹${a.costPerHour}/hr`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking History list */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Approved Amenity Bookings (Resident: Aarav Sharma)</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                          <th className="px-4 py-2.5">Amenity</th>
                          <th className="px-4 py-2.5">Resident</th>
                          <th className="px-4 py-2.5">Scheduled Slot</th>
                          <th className="px-4 py-2.5">Bill Amount</th>
                          <th className="px-4 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-100">
                        {bookings.map(book => (
                          <tr key={book.id}>
                            <td className="px-4 py-3 font-semibold text-slate-700">{book.amenityName}</td>
                            <td className="px-4 py-3 text-slate-500">{book.residentName} ({book.flat})</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold">{book.date}</p>
                              <p className="text-[10px] text-slate-400">{book.timeSlot}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800">₹{book.cost}</td>
                            <td className="px-4 py-3">
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                {book.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 6: STAFF MEMBERS & PARCELS */}
        {/* ==================================== */}
        {activeTab === "helpers" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Staff List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Daily Domestic Help / Staff Records</h4>
                    <p className="text-[10px] text-slate-500">Live attendance check for your registered maids, cooks, and drivers.</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Biometric Linked</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {staff.map(st => (
                    <div key={st.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-xs">{st.name} ({st.type})</h5>
                          <p className="text-[10px] text-slate-400">Helper Code: <span className="font-mono font-semibold text-slate-700">{st.code}</span> • Rated: {st.rating} ⭐</p>
                          <p className="text-[10px] text-slate-500">Flats Assigned: {st.flats}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            st.status === "Checked-In" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {st.status}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {st.status === "Checked-In" ? `Entered: ${new Date(st.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "Left Premises"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parcel Deliveries Tracker */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3 flex items-center gap-1">
                    <Package className="w-4 h-4 text-indigo-500" /> Live Parcel Tracking
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-4">Packages dropped by courier partners at the security room Gate 1.</p>
                  
                  <div className="space-y-4">
                    {parcels.map(pc => (
                      <div key={pc.id} className="flex items-start gap-3 border-l-2 border-indigo-200 pl-3.5 relative py-1">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">{pc.courier}</span>
                            <span className="text-[9px] text-slate-400">{pc.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-600">{pc.item}</p>
                          <span className="inline-block bg-slate-100 text-slate-600 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide mt-1">
                            {pc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => alert("Courier pick-up instruction left with Security. Guard will ask deliverer to retain parcels.")}
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-lg text-xs"
                >
                  LEAVE PICK-UP INSTRUCTION
                </button>
              </div>
            </div>
          </div>
        )}
                       {/* ==================================== */}
        {/* TAB 8: HOUSEHOLD FAMILY MEMBERS */}
        {/* ==================================== */}
        {activeTab === "family" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Users className="w-5 h-5 text-fuchsia-500" />
                    <span>My Household Family Members</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage family profiles linked to flat {currentUser.flat || "A-402"} for keyless entry and guard alerts.</p>
                </div>
                <span className="bg-fuchsia-50 text-fuchsia-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-fuchsia-100 uppercase">
                  {family.length} Registered
                </span>
              </div>

              {/* Add Family Member Form */}
              <div className="bg-fuchsia-50/40 border border-fuchsia-100 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={famName}
                    onChange={(e) => setFamName(e.target.value)}
                    placeholder="E.g., Priya Sharma"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Relationship</label>
                  <select 
                    value={famRelation}
                    onChange={(e) => setFamRelation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-slate-800 font-semibold"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other Tenant</option>
                  </select>
                </div>
                <button 
                  onClick={addFamily}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black py-2 rounded-lg text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow shadow-fuchsia-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              {/* Family Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {family.map((member) => (
                  <div key={member.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-fuchsia-300 transition-all bg-white hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-100 to-pink-100 text-fuchsia-700 border border-fuchsia-200 flex items-center justify-center font-bold text-sm shadow-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs">{member.name}</h4>
                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 border ${
                          member.relation === "Spouse" ? "bg-pink-50 text-pink-700 border-pink-100" :
                          member.relation === "Son" || member.relation === "Daughter" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                          "bg-cyan-50 text-cyan-700 border-cyan-100"
                        }`}>
                          {member.relation}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteFamilyMember(member.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "vehicles" && (
          <div className="space-y-6">
            
            {/* 5️⃣ AI GATE REMINDERS & NOTIFICATION TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-red-800 uppercase tracking-widest">PUC EXPIRING</span>
                  <span className="block text-xs font-black text-red-900 mt-0.5">Expires in 5 Days</span>
                  <span className="block text-[8px] text-red-700 font-medium font-mono">Plate: DL-3C-AB-1234</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest">INSURANCE ALER</span>
                  <span className="block text-xs font-black text-amber-900 mt-0.5">Expires in 12 Days</span>
                  <span className="block text-[8px] text-amber-700 font-medium font-mono">DL-3C-AB-1234</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-blue-800 uppercase tracking-widest">SERVICE DUE</span>
                  <span className="block text-xs font-black text-blue-900 mt-0.5">Due at 75k km</span>
                  <span className="block text-[8px] text-blue-700 font-medium">Schedule on JobsKaru</span>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-sky-800 uppercase tracking-widest">FASTAG BALANCE</span>
                  <span className="block text-xs font-black text-sky-900 mt-0.5">Low Balance: ₹120</span>
                  <span className="block text-[8px] text-sky-700 font-medium font-mono">Minimum: ₹150</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <BatteryCharging className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest">BATTERY HEALTH</span>
                  <span className="block text-xs font-black text-emerald-900 mt-0.5">Health Good (82%)</span>
                  <span className="block text-[8px] text-emerald-700 font-medium font-mono">Last checked: 3d ago</span>
                </div>
              </div>
            </div>

            {/* MAIN VEHICLES LIST & MANAGEMENT */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Car className="w-5 h-5 text-orange-500" />
                    <span>My Registered Household Vehicles</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Managing primary, secondary and two-wheeler authorizations linked to the society boom barrier.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-50 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-orange-100 uppercase">
                    {vehicles.length} Whitelisted
                  </span>
                </div>
              </div>

              {/* 7️⃣ MULTIPLE VEHICLE REGISTRATION FORM */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                <span className="block text-[10px] font-black uppercase text-slate-700 tracking-wider">Register a New Household Vehicle</span>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">License Plate</label>
                    <input 
                      type="text" 
                      value={newVehiclePlate}
                      onChange={(e) => setNewVehiclePlate(e.target.value)}
                      placeholder="DL-3C-AB-9988"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 uppercase font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">Vehicle Type</label>
                    <select 
                      value={newVehicleType}
                      onChange={(e) => setNewVehicleType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none text-slate-800 font-semibold"
                    >
                      <option value="Car (Sedan)">Car (Sedan)</option>
                      <option value="Car (SUV/EV)">Car (SUV/EV)</option>
                      <option value="Two-Wheeler (Motorcycle)">Two-Wheeler (Motorcycle)</option>
                      <option value="Two-Wheeler (EV Scooter)">Two-Wheeler (EV Scooter)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">Category</label>
                    <select 
                      value={newVehicleCategory}
                      onChange={(e) => setNewVehicleCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none text-slate-800 font-semibold"
                    >
                      <option value="Primary Vehicle">Primary Vehicle</option>
                      <option value="Secondary Vehicle">Secondary Vehicle</option>
                      <option value="Two Wheeler">Two Wheeler</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <input 
                      type="checkbox" 
                      id="isEV" 
                      checked={newVehicleIsEV} 
                      onChange={(e) => setNewVehicleIsEV(e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="isEV" className="text-[10px] font-extrabold text-slate-700 cursor-pointer">EV Charger Plug</label>
                  </div>
                  <button 
                    onClick={addVehicle}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-2 rounded-lg text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Whitelist RFID</span>
                  </button>
                </div>
              </div>

              {/* VEHICLE CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((v) => (
                  <div key={v.plate} className="border border-slate-200 rounded-2xl p-4 bg-white relative hover:border-orange-400/60 hover:shadow-md transition-all space-y-4">
                    
                    {/* Header with category and tags */}
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-slate-100 text-slate-700 font-black px-2.5 py-0.5 rounded-full uppercase">
                        {v.category || "Primary"}
                      </span>
                      {v.isEV && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                          <BatteryCharging className="w-3 h-3 text-emerald-600" /> EV Active
                        </span>
                      )}
                    </div>

                    {/* Realistic Indian License Plate Display */}
                    <div className="border-[3px] border-slate-900 rounded-lg p-2.5 bg-white relative flex items-center justify-center shadow-inner overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-blue-600 flex flex-col justify-center items-center text-[5px] text-white font-black select-none">
                        <span>IND</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-0.5"></div>
                      </div>
                      <p className="font-black text-lg text-slate-800 tracking-widest font-mono pl-3 uppercase">
                        {v.plate}
                      </p>
                      <div className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-400 opacity-60"></div>
                    </div>

                    {/* Meta parameters and expiries */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner:</span>
                        <span className="font-extrabold text-slate-700">{v.owner || "Aarav Sharma"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parking Slot:</span>
                        <span className="font-bold text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{v.slot || "A-P45"}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">RFID Tag:</span>
                        <span className="font-bold text-sky-700 font-mono">{v.rfidTag || "Not Linked"}</span>
                      </div>

                      {/* Expiry alerts */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-[10px]">
                        <div className={`p-1.5 rounded-lg border flex flex-col justify-between ${v.plate === "DL-3C-AB-1234" ? "bg-red-50 border-red-200 text-red-800" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                          <span className="block font-medium">PUC Expiry:</span>
                          <span className="block font-black mt-0.5">{v.pucExpiry || "2026-10-15"}</span>
                        </div>
                        <div className={`p-1.5 rounded-lg border flex flex-col justify-between ${v.plate === "DL-3C-AB-1234" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                          <span className="block font-medium">Insurance:</span>
                          <span className="block font-black mt-0.5">{v.insuranceExpiry || "2027-01-10"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 1️⃣ 4️⃣ POPUP & WINDSHIELD PASS TRIGGERS */}
                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button
                        onClick={() => {
                          setSelectedVehicleDetails(v);
                          setEditPlate(v.plate);
                          setEditType(v.type);
                          setEditOwner(v.owner || "Aarav Sharma");
                          setEditSlot(v.slot || "A-P45");
                          setEditInsExp(v.insuranceExpiry || "2026-07-21");
                          setEditPucExp(v.pucExpiry || "2026-07-14");
                          setEditCategory(v.category || "Primary Vehicle");
                          setEditIsEV(!!v.isEV);
                          setIsEditingVehicle(false);
                        }}
                        className="py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-lg text-center transition cursor-pointer"
                      >
                        Details & Edit
                      </button>

                      <button
                        onClick={() => setSelectedQrPassVehicle(v)}
                        className="py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-lg text-center transition flex items-center justify-center gap-1 cursor-pointer border border-indigo-100"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Windshield Pass
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* 3️⃣ VISUAL PARKING MAP */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  <span>Visual Parking Map (Basement B1)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allocated, EV Charger, and Vacant vehicle parking slot map for Greenwood Heights Block A & B.
                </p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Basement B1 Layout</span>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Slot A-101 */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 space-y-1 text-center relative">
                    <span className="block text-[9px] font-black text-emerald-400">SLOT A-101</span>
                    <Car className="w-6 h-6 mx-auto text-emerald-400 my-1" />
                    <span className="block text-[10px] font-bold font-mono text-white">DL-3C-AB-1234</span>
                    <span className="block text-[8px] text-emerald-500 font-extrabold">Aarav Sharma</span>
                  </div>

                  {/* Slot A-102 */}
                  <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 space-y-1 text-center relative">
                    <span className="block text-[9px] font-black text-indigo-400">SLOT A-102</span>
                    <Car className="w-6 h-6 mx-auto text-indigo-400 my-1" />
                    <span className="block text-[10px] font-bold font-mono text-white">HR-26-CD-5678</span>
                    <span className="block text-[8px] text-indigo-500 font-extrabold">Priya Patel</span>
                  </div>

                  {/* Slot A-103 */}
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 text-slate-500 space-y-1 text-center flex flex-col justify-center items-center group hover:border-slate-500 transition cursor-pointer">
                    <span className="block text-[9px] font-black text-slate-400">SLOT A-103</span>
                    <span className="block text-xs font-black text-emerald-500 mt-1 uppercase group-hover:underline">+ Vacant</span>
                    <span className="block text-[8px] text-slate-500 mt-1">Ready to Allocate</span>
                  </div>

                  {/* Slot B-201 */}
                  <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 space-y-1 text-center relative">
                    <span className="block text-[9px] font-black text-cyan-400">SLOT B-201 ⚡ EV</span>
                    <BatteryCharging className="w-6 h-6 mx-auto text-cyan-400 my-1 animate-pulse" />
                    <span className="block text-[10px] font-bold font-mono text-white">MH-12-PQ-9988</span>
                    <span className="block text-[8px] text-cyan-400 font-extrabold">Aarav Sharma</span>
                  </div>

                  {/* Slot B-202 */}
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 text-slate-500 space-y-1 text-center flex flex-col justify-center items-center group hover:border-slate-500 transition cursor-pointer">
                    <span className="block text-[9px] font-black text-slate-400">SLOT B-202 ⚡</span>
                    <span className="block text-xs font-black text-emerald-500 mt-1 uppercase group-hover:underline">+ EV Vacant</span>
                    <span className="block text-[8px] text-slate-500 mt-1">EV Charging Slot</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-4 font-semibold justify-center">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Allocated (Resident)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block"></span> EV Charging Port Active</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-dashed border-slate-600 inline-block"></span> Empty / Vacant</span>
                </div>
              </div>
            </div>

            {/* LIVE ANPR CAMERA SENSORS & PLAYGROUND ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 8️⃣ LIVE ANPR SURVEILLANCE CAMERA FEED */}
              <div className="bg-slate-950 p-6 rounded-2xl text-white border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> Live ANPR Camera (Gate 1)
                  </span>
                  <span className="text-[8px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                    Live Feed
                  </span>
                </div>

                {/* Surveillance Stream Container */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 select-none">
                  <img 
                    src={camSnapshot.feedUrl}
                    alt="Main Gate Cam" 
                    className="w-full h-full object-cover opacity-80" 
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Glowing camera scanning bar */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-loop"></div>
                  
                  {/* Corner bounds */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white"></div>

                  {/* ANPR HUD overlays */}
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-lg text-[9px] font-mono space-y-1 max-w-[80%] border border-slate-800">
                    <p className="text-emerald-400 font-bold">PLATE OCR: {camSnapshot.plateDetected}</p>
                    <p className="text-slate-300">RFID IN RANGE: {camSnapshot.rfidDetected}</p>
                    <p className="text-slate-400">CONFIDENCE: {camSnapshot.anprConfidence}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Test RFID & Gate Trigger</span>
                  <div className="flex gap-2">
                    <select
                      id="anprPlateSelector"
                      value={selectedSimVehicle}
                      onChange={(e) => setSelectedSimVehicle(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono flex-1 uppercase"
                    >
                      {vehicles.map((v) => (
                        <option key={v.plate} value={v.plate}>{v.plate}</option>
                      ))}
                      <option value="MH-02-AB-9999">MH-02-AB-9999 (Unregistered Visitor)</option>
                    </select>

                    <button
                      onClick={async () => {
                        const plateVal = selectedSimVehicle;
                        const matchV = vehicles.find(v => v.plate === plateVal);
                        const rfidVal = matchV ? matchV.rfidTag : "UHF-TAG-UNKNOWN";
                        
                        setCamSnapshot(prev => ({
                          ...prev,
                          plateDetected: plateVal,
                          rfidDetected: rfidVal,
                          anprConfidence: "99.2% OCR Match"
                        }));

                        // Trigger barrier opening simulation!
                        handleDistanceChange(3);
                        
                        // Fire call to the gate API
                        setTimeout(() => {
                          fetchVehiclesAndLogs();
                        }, 1200);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-black px-4 rounded-lg text-[10px] uppercase tracking-wider transition shrink-0 cursor-pointer"
                    >
                      Trigger Scan
                    </button>
                  </div>
                </div>
              </div>

              {/* 6️⃣ VISITOR PASS PRE-APPROVAL FORM */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                    <QrCode className="w-4 h-4 text-fuchsia-600" />
                    <span>Visitor Vehicle Temporary Pass</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pre-approve visitor vehicles or delivery cabs for automated paperless QR gate entries.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Visitor Name</label>
                    <input 
                      type="text" 
                      value={visPassName}
                      onChange={(e) => setVisPassName(e.target.value)}
                      placeholder="E.g., Swiggy Delivery Partner"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-fuchsia-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Vehicle License Plate Number</label>
                    <input 
                      type="text" 
                      value={visPassNumber}
                      onChange={(e) => setVisPassNumber(e.target.value)}
                      placeholder="E.g., MH-12-CD-5432"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-fuchsia-500 focus:outline-none font-mono uppercase font-black text-slate-850"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Valid From</label>
                      <input 
                        type="date" 
                        value={visPassFrom}
                        onChange={(e) => setVisPassFrom(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Valid To</label>
                      <input 
                        type="date" 
                        value={visPassTo}
                        onChange={(e) => setVisPassTo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!visPassNumber || !visPassName) {
                        alert("Please enter visitor name and plate number!");
                        return;
                      }

                      try {
                        const res = await fetch("/api/visitors/pass", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            vehicleNumber: visPassNumber,
                            visitorName: visPassName,
                            validFrom: visPassFrom,
                            validTo: visPassTo,
                            hostFlat: currentUser.flat,
                            hostName: currentUser.name
                          })
                        });

                        if (res.ok) {
                          const data = await res.json();
                          setGeneratedPassQr(data.pass);
                          setVisPassName("");
                          setVisPassNumber("");
                          alert(`🎉 Temporary Pass ${data.pass?.passcode} generated successfully for ${data.pass?.name}!`);
                        }
                      } catch (err) {
                        console.error("Error creating pass:", err);
                      }
                    }}
                    className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-lg text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Generate Pre-Approval Pass</span>
                  </button>

                </div>
              </div>

              {/* 🔟 EMERGENCY LOCKDOWN CONTROLS */}
              <div className="bg-red-950 p-6 rounded-2xl text-white border border-red-900 space-y-4">
                <div className="border-b border-red-900 pb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Emergency Gate Lockdown Center</span>
                </div>

                <p className="text-[10px] text-red-200 leading-normal font-medium">
                  Perform high-security remote actions. Guard house and gates will receive priority alarms instantly.
                </p>

                <div className="space-y-2 text-xs">
                  {/* Action 1: Report theft */}
                  <button
                    onClick={async () => {
                      const ans = confirm("⚠️ Are you sure you want to Report Theft for primary vehicle DL-3C-AB-1234? This instantly blacklists the RFID windshield tag!");
                      if (!ans) return;
                      
                      try {
                        const res = await fetch("/api/vehicles/emergency", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            plate: "DL-3C-AB-1234",
                            action: "blacklist",
                            details: "Reported Stolen by Resident Aarav Sharma. Guard SOS alert sent."
                          })
                        });
                        if (res.ok) {
                          alert("🚨 VEHICLE STOLEN REPORT SUBMITTED. RFID Tag UHF-TAG-8821 Blacklisted. Greenwood Security Guards dispatched!");
                          fetchVehiclesAndLogs();
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full text-left p-3 rounded-xl bg-red-900/60 hover:bg-red-900 border border-red-800 transition flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <span className="block font-extrabold text-red-200">Report Vehicle Theft</span>
                      <p className="text-[9px] text-red-400">Lock down tag DL-3C-AB-1234 immediately</p>
                    </div>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </button>

                  {/* Action 2: Lost tag */}
                  <button
                    onClick={() => {
                      alert("🏷️ Passive RFID Tag UHF-TAG-8821 has been flagged as 'Deactivated'. Please visit Society Office Block B to purchase a replacement sticker pass.");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <span className="block font-extrabold text-slate-200">Report RFID Tag Lost</span>
                      <p className="text-[9px] text-slate-400">De-whitelist physical sticker tag code</p>
                    </div>
                    <Tag className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Action 3: Remote gate open */}
                  <button
                    onClick={async () => {
                      const ans = confirm("🚒 Trigger Emergency Override gate open? This lifts Gate 1 and Gate 2 boom barriers for continuous escape route!");
                      if (!ans) return;
                      
                      try {
                        setBarrierStatus("Opening");
                        setSimLog(prev => [
                          `[${new Date().toLocaleTimeString()}] 🚨 EMERGENCY OVERRIDE TRIGGERED BY RESIDENT AARAV SHARMA.`,
                          `[${new Date().toLocaleTimeString()}] ⚡ Dry-Contact relay override forced = LIFT GATE 1 & 2.`,
                          ...prev
                        ]);

                        setTimeout(() => {
                          setBarrierStatus("Open");
                        }, 1000);

                        alert("🚨 EMERGENCY OVERRIDE SUBMITTED. Gate barriers are lifted!");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full text-left p-3 rounded-xl bg-orange-950/60 hover:bg-orange-900 border border-orange-800 transition flex justify-between items-center cursor-pointer animate-pulse"
                  >
                    <div>
                      <span className="block font-extrabold text-orange-200">Emergency Override Unlock</span>
                      <p className="text-[9px] text-orange-400 font-bold">Force gate boom barrier to hold open</p>
                    </div>
                    <Wrench className="w-4 h-4 text-orange-400" />
                  </button>
                </div>
              </div>

            </div>

            {/* 2️⃣ GATE ENTRY HISTORY LOGS TABLE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <span>RFID Gate Entry & Exit History Logs</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Real-time logs recorded by Gate 1 & Gate 2 automated ANPR cameras and long-range UHF readers.
                  </p>
                </div>
                
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search plate or gate..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none text-slate-800 w-full sm:w-48 font-mono"
                />
              </div>

              {/* Filtering tabs & export buttons */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex gap-1.5 font-bold">
                  <button 
                    onClick={() => setGateRange("all")}
                    className={`px-3 py-1.5 rounded-lg transition uppercase text-[9px] ${gateRange === "all" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    All Logs
                  </button>
                  <button 
                    onClick={() => setGateRange("today")}
                    className={`px-3 py-1.5 rounded-lg transition uppercase text-[9px] ${gateRange === "today" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => setGateRange("week")}
                    className={`px-3 py-1.5 rounded-lg transition uppercase text-[9px] ${gateRange === "week" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    This Week
                  </button>
                  <button 
                    onClick={() => setGateRange("month")}
                    className={`px-3 py-1.5 rounded-lg transition uppercase text-[9px] ${gateRange === "month" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    This Month
                  </button>
                </div>

                <div className="flex gap-2 font-black uppercase text-[10px]">
                  <button
                    onClick={() => {
                      setIsExporting("pdf");
                      setTimeout(() => {
                        setIsExporting(null);
                        alert("📄 Security Gate logs exported to 'Greenwood_Heights_Gate_Report.pdf' successfully! Printable format generated.");
                      }, 1500);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {isExporting === "pdf" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-red-500" />}
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsExporting("excel");
                      setTimeout(() => {
                        setIsExporting(null);
                        alert("📊 Security Gate logs exported to 'Greenwood_Heights_Gate_Report.xlsx' successfully!");
                      }, 1500);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {isExporting === "excel" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black font-mono tracking-wider">
                      <th className="p-3">Date</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Gate Name</th>
                      <th className="p-3">Entry/Exit</th>
                      <th className="p-3">Vehicle No / RFID</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gateLogs
                      .filter(log => {
                        if (!logSearchQuery) return true;
                        const query = logSearchQuery.toUpperCase();
                        return log.vehicleNo?.toUpperCase().includes(query) || 
                               log.gate?.toUpperCase().includes(query) || 
                               log.rfid?.toUpperCase().includes(query);
                      })
                      .map((log) => (
                        <tr key={log.id} className="text-xs hover:bg-slate-50/50 transition">
                          <td className="p-3 text-slate-600">{log.date}</td>
                          <td className="p-3 text-slate-600">{log.time}</td>
                          <td className="p-3 text-slate-700 font-bold">{log.gate}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${log.type === "Entry" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="block font-black text-slate-800 font-mono tracking-wide">{log.vehicleNo}</span>
                            <span className="block text-[9px] text-slate-400 font-mono">RFID: {log.rfid}</span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              log.status === "Success" ? "bg-green-50 text-green-700 border border-green-100" :
                              log.status === "Rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                              "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Hardware wiring info section */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  <span>Hardware Setup and Wiegand-34 Wiring Instructions</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Physical installation instructions for smart readers and boom barrier controllers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="bg-sky-500/10 text-sky-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Step 1</span>
                  <h5 className="font-bold">UHF Long-Range Antenna Mounting</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Install the 865-868 MHz passive long-range UHF circular polarized reader on the entrance pole at a height of 3.5m, tilted down 30° toward the lane center.
                  </p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Step 2</span>
                  <h5 className="font-bold">Wiegand-34 and Relay Connection</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Wire Wiegand terminals (D0/D1/GND) to the access control panel. Connect COM/NO dry contact ports to the boom barrier manual push button trigger.
                  </p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Step 3</span>
                  <h5 className="font-bold">Loop Detector Calibration</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Install an inductive ground loop beneath the pavement right under the boom gate to detect chassis metallic mass, preventing gate closures on vehicles.
                  </p>
                </div>
              </div>
            </div>

            {/* 6️⃣ VISITOR PASS VISUAL COUPON STICKER (if generated) */}
            {generatedPassQr && (
              <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                  <span className="bg-fuchsia-100 text-fuchsia-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">Active Pre-Approved Pass</span>
                  <h4 className="font-black text-slate-800 text-sm">Temporary Visitor Pass Coupon generated!</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Share this coupon with your visitor. The QR code or Passcode **{generatedPassQr.passcode}** can be scanned at the boom barrier tablet or entered manually to lift the gates instantly.
                  </p>
                  <div className="flex gap-2 pt-1 font-bold text-[10px]">
                    <button
                      onClick={() => alert(`Copied code: ${generatedPassQr.passcode}`)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      Copy Passcode
                    </button>
                    <button
                      onClick={() => setGeneratedPassQr(null)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Dismiss Pass
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex items-center gap-4 shrink-0 font-mono text-[9px] max-w-sm w-full md:w-auto shadow-md">
                  <div className="bg-white p-1 rounded-lg shrink-0">
                    <svg width="80" height="80" viewBox="0 0 100 100" className="w-20 h-20 text-black">
                      <rect width="100" height="100" fill="#fff" />
                      <rect x="5" y="5" width="22" height="22" />
                      <rect x="9" y="9" width="14" height="14" fill="#fff" />
                      <rect x="12" y="12" width="8" height="8" />
                      <rect x="73" y="5" width="22" height="22" />
                      <rect x="77" y="9" width="14" height="14" fill="#fff" />
                      <rect x="80" y="12" width="8" height="8" />
                      <rect x="5" y="73" width="22" height="22" />
                      <rect x="9" y="77" width="14" height="14" fill="#fff" />
                      <rect x="12" y="80" width="8" height="8" />
                      <rect x="40" y="40" width="20" height="20" />
                      <rect x="50" y="50" width="20" height="10" />
                    </svg>
                  </div>
                  <div className="space-y-1 font-sans text-slate-300">
                    <span className="block text-[8px] bg-fuchsia-500/20 text-fuchsia-300 font-extrabold px-1 py-0.5 rounded border border-fuchsia-500/30 w-fit uppercase">PRE-APPROVED</span>
                    <p className="font-black text-xs text-white">{generatedPassQr.name}</p>
                    <p className="text-white font-mono tracking-wide">PLATE: {generatedPassQr.vehicleNumber}</p>
                    <p className="text-[10px] text-fuchsia-400 font-extrabold font-mono mt-1">PASS: {generatedPassQr.passcode}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}


            {/* VEHICLE WINDSHIELD QR PASS PRINTING MODAL */}
            {selectedQrPassVehicle && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in duration-200">
                  
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                        <QrCode className="w-5 h-5 animate-pulse" />
                        <span>Windshield QR Sticker Pass Generator</span>
                      </h3>
                      <p className="text-[10px] text-fuchsia-100 mt-0.5">Self-Printable RFID/QR Gate Entry Windshield Label</p>
                    </div>
                    <button 
                      onClick={() => setSelectedQrPassVehicle(null)}
                      className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      ✕ CLOSE
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                    
                    {/* Bilingual Hindi/English Alert */}
                    <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl p-3 text-[11px] text-fuchsia-800 space-y-1">
                      <p className="font-bold">📢 self-printing instructions / स्वयं प्रिंट करने के निर्देश:</p>
                      <p className="text-slate-600 leading-relaxed">
                        <strong>English:</strong> Print this weatherproof QR pass sticker, cut along the dotted border, and stick it to the upper-center of your windshield (inside car) for automated boom-barrier camera entry.
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        <strong>हिन्दी:</strong> इस QR पास स्टिकर को प्रिंट करें, बिंदीदार बॉर्डर से काटें और गेट ऑटोमेशन के लिए अपनी कार के शीशे के ऊपरी मध्य भाग में (अन्दर की तरफ) चिपकाएँ।
                      </p>
                    </div>

                    {/* Windshield Sticker Printable Layout (Dotted Scissor Line) */}
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50 relative group select-none">
                      {/* Dotted border indicator */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 border border-slate-200 rounded-full text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        ✂️ CUT ALONG DOTTED LINE / यहाँ से काटें
                      </div>

                      {/* Actual Windshield Sticker Card */}
                      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
                        
                        {/* High-tech security pattern lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>

                        {/* Sticker Header */}
                        <div className="flex justify-between items-start relative z-10 border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/30 tracking-widest uppercase">
                              AUTOMATED VEHICLE PASS
                            </span>
                            <h4 className="font-black text-xs uppercase tracking-wider text-white mt-1">
                              GREENWOOD HEIGHTS CO-OP
                            </h4>
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono tracking-wider">
                            SECURE GATEKARU SYST
                          </span>
                        </div>

                        {/* Sticker Content: QR and Fields Grid */}
                        <div className="grid grid-cols-12 gap-4 items-center relative z-10">
                          
                          {/* Left Vector simulated QR code */}
                          <div className="col-span-5 bg-white p-2 rounded-lg flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                            <svg width="105" height="105" viewBox="0 0 100 100" className="w-full h-auto">
                              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                              
                              {/* Finder Pattern Top-Left */}
                              <rect x="5" y="5" width="22" height="22" fill="#000000" />
                              <rect x="9" y="9" width="14" height="14" fill="#ffffff" />
                              <rect x="12" y="12" width="8" height="8" fill="#000000" />
                              
                              {/* Finder Pattern Top-Right */}
                              <rect x="73" y="5" width="22" height="22" fill="#000000" />
                              <rect x="77" y="9" width="14" height="14" fill="#ffffff" />
                              <rect x="80" y="12" width="8" height="8" fill="#000000" />
                              
                              {/* Finder Pattern Bottom-Left */}
                              <rect x="5" y="73" width="22" height="22" fill="#000000" />
                              <rect x="9" y="77" width="14" height="14" fill="#ffffff" />
                              <rect x="12" y="80" width="8" height="8" fill="#000000" />
                              
                              {/* Alignment Pattern */}
                              <rect x="73" y="73" width="10" height="10" fill="#000000" />
                              <rect x="75" y="75" width="6" height="6" fill="#ffffff" />
                              <rect x="77" y="77" width="2" height="2" fill="#000000" />

                              {/* Matrix noise simulation - dynamic based on vehicle plate */}
                              <rect x="32" y="5" width="6" height="6" fill="#000" />
                              <rect x="42" y="10" width="10" height="4" fill="#000" />
                              <rect x="58" y="5" width="6" height="10" fill="#000" />
                              
                              <rect x="32" y="20" width="15" height="6" fill="#000" />
                              <rect x="55" y="18" width="10" height="10" fill="#000" />
                              <rect x="58" y="32" width="8" height="6" fill="#000" />

                              <rect x="5" y="32" width="10" height="10" fill="#000" />
                              <rect x="20" y="35" width="12" height="4" fill="#000" />
                              <rect x="38" y="32" width="14" height="14" fill="#000" />
                              
                              <rect x="5" y="48" width="20" height="6" fill="#000" />
                              <rect x="30" y="50" width="8" height="12" fill="#000" />
                              <rect x="45" y="52" width="14" height="6" fill="#000" />

                              <rect x="58" y="48" width="36" height="6" fill="#000" />
                              <rect x="72" y="58" width="12" height="12" fill="#000" />
                              <rect x="88" y="58" width="6" height="10" fill="#000" />

                              <rect x="32" y="70" width="6" height="18" fill="#000" />
                              <rect x="44" y="73" width="16" height="6" fill="#000" />
                              <rect x="44" y="84" width="24" height="10" fill="#000" />

                              <rect x="73" y="88" width="20" height="6" fill="#000" />
                              
                              {/* Code identifier representation */}
                              <rect x="46" y="40" width="8" height="8" fill="#818cf8" />
                            </svg>
                            <span className="text-[7px] text-indigo-950 font-black tracking-widest uppercase mt-1 font-mono">
                              PASS-ID: {selectedQrPassVehicle.plate.replace(/[^A-Z0-9]/g, "").slice(0, 8)}
                            </span>
                          </div>

                          {/* Right Fields description */}
                          <div className="col-span-7 space-y-2">
                            <div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">
                                License Plate No. / गाड़ी नंबर
                              </span>
                              <span className="font-mono text-base font-black tracking-wider text-indigo-300 block">
                                {selectedQrPassVehicle.plate}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[7px] text-slate-400 font-bold uppercase block">Vehicle Type</span>
                                <span className="text-[10px] font-extrabold text-white block truncate">{selectedQrPassVehicle.type}</span>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 font-bold uppercase block">Flat / Block</span>
                                <span className="text-[10px] font-extrabold text-white block">A-402</span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-white/5 grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[7px] text-slate-400 font-bold uppercase block">RFID Tag Code</span>
                                <span className="text-[9px] font-mono font-bold text-sky-400 block truncate">
                                  {selectedQrPassVehicle.rfidTag || "AUTOMATIC QR SCAN"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 font-bold uppercase block">Security Seal</span>
                                <span className="text-[8px] text-emerald-400 font-extrabold block">
                                  ● VERIFIED CO-OP
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom security holographic ribbon */}
                        <div className="relative h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 rounded opacity-80 mt-1"></div>
                        
                      </div>
                    </div>

                    {/* Simulation / Physical Label Printing Section */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                      <div>
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          <Printer className="w-3 h-3 text-indigo-600 animate-pulse" /> Self-Printing Portal
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1.5">Directly Print QR Code Sticker for your Vehicle</h4>
                        <p className="text-[10px] text-slate-500 max-w-sm mx-auto mt-1">
                          You can print this label directly on any standard home printer (A4 or label sheet). The barcode and QR pattern are optimized for instant entry scan.
                        </p>
                      </div>

                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => {
                            // Custom stylish high-fidelity feedback simulation
                            const printWindow = window.open("", "_blank");
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Greenwood Heights - Vehicle Pass - ${selectedQrPassVehicle.plate}</title>
                                    <style>
                                      body {
                                        font-family: 'Courier New', Courier, monospace;
                                        padding: 40px;
                                        text-align: center;
                                        background-color: #fff;
                                        color: #000;
                                      }
                                      .pass-box {
                                        border: 4px dashed #000;
                                        border-radius: 15px;
                                        padding: 30px;
                                        max-width: 450px;
                                        margin: 0 auto;
                                        background: #fbfbfb;
                                      }
                                      h2 { margin: 0 0 10px 0; font-size: 22px; font-weight: bold; }
                                      h3 { margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; color: #555; }
                                      .qr-box {
                                        margin: 20px auto;
                                        border: 2px solid #000;
                                        padding: 10px;
                                        display: inline-block;
                                        background-color: #fff;
                                      }
                                      .meta {
                                        text-align: left;
                                        font-size: 13px;
                                        line-height: 1.8;
                                        border-top: 2px solid #000;
                                        padding-top: 15px;
                                        margin-top: 15px;
                                      }
                                      .meta span { font-weight: bold; }
                                      .instructions {
                                        margin-top: 30px;
                                        font-size: 11px;
                                        color: #666;
                                        max-width: 400px;
                                        margin-left: auto;
                                        margin-right: auto;
                                      }
                                    </style>
                                  </head>
                                  <body onload="window.print()">
                                    <div class="pass-box">
                                      <h2>GREENWOOD HEIGHTS CO-OP</h2>
                                      <h3>Automated Vehicle Windshield Pass</h3>
                                      <div class="qr-box">
                                        <svg width="180" height="180" viewBox="0 0 100 100">
                                          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                                          <rect x="5" y="5" width="22" height="22" fill="#000000" />
                                          <rect x="9" y="9" width="14" height="14" fill="#ffffff" />
                                          <rect x="12" y="12" width="8" height="8" fill="#000000" />
                                          <rect x="73" y="5" width="22" height="22" fill="#000000" />
                                          <rect x="77" y="9" width="14" height="14" fill="#ffffff" />
                                          <rect x="80" y="12" width="8" height="8" fill="#000000" />
                                          <rect x="5" y="73" width="22" height="22" fill="#000000" />
                                          <rect x="9" y="77" width="14" height="14" fill="#ffffff" />
                                          <rect x="12" y="80" width="8" height="8" fill="#000000" />
                                          <rect x="73" y="73" width="10" height="10" fill="#000000" />
                                          <rect x="32" y="5" width="6" height="6" fill="#000" />
                                          <rect x="42" y="10" width="10" height="4" fill="#000" />
                                          <rect x="58" y="5" width="6" height="10" fill="#000" />
                                          <rect x="32" y="20" width="15" height="6" fill="#000" />
                                          <rect x="55" y="18" width="10" height="10" fill="#000" />
                                          <rect x="38" y="32" width="14" height="14" fill="#000" />
                                          <rect x="5" y="48" width="20" height="6" fill="#000" />
                                          <rect x="30" y="50" width="8" height="12" fill="#000" />
                                          <rect x="45" y="52" width="14" height="6" fill="#000" />
                                          <rect x="58" y="48" width="36" height="6" fill="#000" />
                                          <rect x="72" y="58" width="12" height="12" fill="#000" />
                                          <rect x="32" y="70" width="6" height="18" fill="#000" />
                                          <rect x="44" y="73" width="16" height="6" fill="#000" />
                                          <rect x="44" y="84" width="24" height="10" fill="#000" />
                                          <rect x="73" y="88" width="20" height="6" fill="#000" />
                                        </svg>
                                      </div>
                                      <div class="meta">
                                        <div><span>VEHICLE NUMBER:</span> ${selectedQrPassVehicle.plate}</div>
                                        <div><span>VEHICLE MODEL:</span> ${selectedQrPassVehicle.type}</div>
                                        <div><span>HOUSEHOLD FLAT:</span> Flat A-402</div>
                                        <div><span>VALIDITY TERM:</span> 2026-2027 CO-OP APPROVED</div>
                                        <div><span>RFID SYNC TAG:</span> ${selectedQrPassVehicle.rfidTag || "AUTOMATIC QR ACTIVE"}</div>
                                      </div>
                                    </div>
                                    <div class="instructions">
                                      Cut along the dashed line and affix this pass sticker onto your car windshield.
                                      <br/>
                                      <strong>Greenwood Gates Automated Transcoder verification loop.</strong>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }
                            
                            setSimLog(prev => [
                              `[${new Date().toLocaleTimeString()}] 🖨️ Initialized printer stream for vehicle ${selectedQrPassVehicle.plate} windshield QR pass.`,
                              ...prev
                            ]);
                            alert("🟢 Sent to print queue successfully! Cut along the dotted line and mount it on your car's windshield.");
                            setSelectedQrPassVehicle(null);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>PRINT QR STICKER PASS</span>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://stream.gatekaru.in/qr-passes/${selectedQrPassVehicle.plate}`);
                            alert("🟢 Digital Sticker Link copied to clipboard! You can share this link with any local print shop or photo studio to get a custom high-visibility vinyl decal.");
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95"
                        >
                          Copy Digital Link
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

        {/* ==================================== */}
        {/* TAB 10: MY DOCUMENTS & VAULT */}
        {/* ==================================== */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            
            {/* Split layout: Digital ID Card & Vault Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Resident Digital Pass ID */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-3 w-full text-left">
                  Resident Digital ID Pass
                </h4>
                
                {/* Virtual Holographic ID */}
                <div className="w-80 h-48 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden border border-slate-800 group hover:scale-[1.02] transition-transform">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-extrabold tracking-tight text-sm">{currentUser?.name || "Aarav Sharma"}</h5>
                      <span className="bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                        {currentUser?.role === 'resident' ? (currentUser?.type ? `${currentUser.type.toUpperCase()} RESIDENT` : 'OWNER RESIDENT') : currentUser?.role?.toUpperCase() || "OWNER RESIDENT"}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-black text-xl text-indigo-400 italic border border-white/10">
                      G
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">FLAT / BLOCK</p>
                      <p className="text-xs font-semibold">{currentUser?.flat || "A-402"} • GREENWOOD</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">VEHICLE PLATE</p>
                      <p className="text-xs font-semibold">{currentUser?.vehicleNo || "DL-3C-AB-1234"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">PHONE NUMBER</p>
                      <p className="text-xs font-semibold">{currentUser?.phone || "+91 98765 43210"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">VERIFIED SECURITY</p>
                      <p className="text-xs font-semibold text-emerald-400">● RFID ENCRYPT</p>
                    </div>
                  </div>

                  <div className="absolute bottom-2.5 right-4 flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold font-mono">
                    <ShieldCheck className="w-3 h-3 text-indigo-400 animate-pulse" /> GateKaru Verified
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 max-w-sm">
                  Hold this cryptographic RFID-simulated ID badge close to security biometrics or barriers for touchless entryway release.
                </p>
              </div>

              {/* Rent Agreement Mock Upload */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide">Rent Agreement & Document Vault</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Upload property registration cards, NOCs, or tenant deeds for management committee authorization.</p>
                  </div>
                  <button 
                    onClick={triggerAgreementUpload}
                    disabled={isUploadingAgreement}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploadingAgreement ? "Uploading..." : "UPLOAD NEW"}</span>
                  </button>
                </div>

                {vaultDocs.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 p-8 rounded-xl text-center bg-slate-50 flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">Your Property Vault is empty</p>
                    <p className="text-[10px] text-slate-400">PDF, JPEG files up to 10MB accepted</p>
                    <button 
                      onClick={triggerAgreementUpload}
                      className="mt-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-extrabold px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      BROWSE FILE TO UPLOAD
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {vaultDocs.map((doc) => (
                      <div key={doc.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-red-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">{doc.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{doc.type}</span>
                              <span className="text-[9px] text-slate-400 font-mono">Uploaded on {doc.uploadDate}</span>
                            </div>
                            {doc.verified && (
                              <p className="text-[9px] text-emerald-600 font-black mt-1.5 flex items-center gap-1 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Verified by {doc.verifiedBy}
                              </p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteDocument(doc.id)}
                          className="text-[10px] text-red-600 font-black hover:underline bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-100 transition"
                        >
                          DELETE
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 11: PARCEL LOGS & TRACKING */}
        {/* ==================================== */}
        {activeTab === "parcels" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span>Gatekeep Parcel & Delivery Hub</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Track courier boxes left by delivery executives with the security guard cabin at the gates.</p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                  {parcels.length} Registered Packages
                </span>
              </div>

              {/* Parcels List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parcels.map((parcel) => (
                  <div key={parcel.id} className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-sm hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                          parcel.courier === "Amazon" ? "bg-amber-50 text-amber-800 border-amber-200" :
                          parcel.courier === "Zomato" ? "bg-red-50 text-red-800 border-red-200" :
                          "bg-indigo-50 text-indigo-800 border-indigo-200"
                        }`}>
                          {parcel.courier}
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold">{parcel.time}</span>
                      </div>
                      
                      <p className="text-xs font-black text-slate-800 mt-3">{parcel.item}</p>
                      
                      {/* Simple Stepper UI */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parcel.status.includes("Delivered") ? "bg-emerald-500" : "bg-blue-500 animate-ping"}`}></div>
                          <span className="text-[10px] font-bold text-slate-600">{parcel.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                      <button 
                        onClick={() => {
                          alert(`Gatekeep Alert: Message sent to Gate 1 Guards to hold ${parcel.courier} package for flat ${currentUser.flat}!`);
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 border border-slate-100 px-2.5 py-1 rounded-lg flex-1"
                      >
                        HOLD AT GATE
                      </button>
                      <button 
                        onClick={() => {
                          setParcels(prev => prev.map(p => p.id === parcel.id ? { ...p, status: "Collected from gate cabin" } : p));
                          alert("Marked package as collected successfully!");
                        }}
                        className="text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg flex-1 whitespace-nowrap text-center"
                      >
                        COLLECTED
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leave picker instruction */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-600 font-medium">Out of station? Click here to authorize security guards to store all incoming courier parcels inside the biometric vault cabinets.</p>
                <button 
                  onClick={() => alert("Auto-Store Vault mode activated! Guards will safe-keep all parcels until you toggle off.")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0"
                >
                  Authorize Vault Safe-keeping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 12: EMERGENCY CONTACT DIRECTORY */}
        {/* ==================================== */}
        {activeTab === "emergency" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span>Emergency Dial Directory</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Direct security intercom cellular contacts to guard rooms, estate directors, and regional rescue services.</p>
                </div>
                <span className="bg-red-50 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-100 uppercase">
                  Hotlines Active
                </span>
              </div>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                
                {/* Siren Test Card */}
                <div className="border-2 border-dashed border-red-300 rounded-2xl p-4 bg-red-50/40 hover:shadow-sm hover:bg-red-50/70 transition-all space-y-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs flex items-center gap-1">
                        <span>🔊 Play Alarm (Local Test)</span>
                      </h4>
                      <p className="text-[10px] text-red-700 font-bold mt-1 uppercase">Local Audio Engine</p>
                    </div>
                    <span className="bg-red-200 text-red-800 text-[8px] font-black px-2 py-0.5 rounded-full">ACTIVE NODE</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Test the emergency siren speaker and localized synthetic vocal warnings in Greenwood Heights App.</p>
                  <button 
                    onClick={playLocalAlarmSiren}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-1.5 rounded-xl text-xs uppercase transition cursor-pointer"
                  >
                    🔊 PLAY LOCAL SIREN
                  </button>
                </div>

                {/* 1. Gate 1 Security */}
                <div className="border border-red-200 rounded-2xl p-4 bg-gradient-to-br from-red-50/50 to-white hover:shadow-sm hover:border-red-300 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">Gate 1 Security Guard</h4>
                      <p className="text-[10px] text-red-700 font-bold mt-1 uppercase">Main Entrance</p>
                    </div>
                    <span className="bg-red-100 text-red-800 text-[9px] font-black px-2 py-0.5 rounded-full">24x7 Intercom</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700">+91 99881 12233</p>
                  <button 
                    onClick={() => alert("Simulating secure call to Gate 1 Security cabin...")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-1.5 rounded-xl text-xs uppercase transition"
                  >
                    TAP TO DIAL
                  </button>
                </div>

                {/* 2. Gate 2 Security */}
                <div className="border border-red-200 rounded-2xl p-4 bg-gradient-to-br from-red-50/50 to-white hover:shadow-sm hover:border-red-300 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">Gate 2 Security Guard</h4>
                      <p className="text-[10px] text-red-700 font-bold mt-1 uppercase">Back Entrance</p>
                    </div>
                    <span className="bg-red-100 text-red-800 text-[9px] font-black px-2 py-0.5 rounded-full">24x7 Intercom</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700">+91 99881 12244</p>
                  <button 
                    onClick={() => alert("Simulating secure call to Gate 2 Security cabin...")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-1.5 rounded-xl text-xs uppercase transition"
                  >
                    TAP TO DIAL
                  </button>
                </div>

                {/* 3. Society President */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-sm hover:border-indigo-300 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">Vikram Mehta (President)</h4>
                      <p className="text-[10px] text-indigo-700 font-bold mt-1 uppercase">Society Committee</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full">Committee Chair</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700">+91 98100 23456</p>
                  <button 
                    onClick={() => alert("Simulating secure cellular connection to President Vikram Mehta...")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-1.5 rounded-xl text-xs uppercase transition"
                  >
                    TAP TO DIAL
                  </button>
                </div>

                {/* 4. Facility Manager */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-sm hover:border-teal-300 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">Anil Joshi (Facility Manager)</h4>
                      <p className="text-[10px] text-teal-700 font-bold mt-1 uppercase">Estate & Operations</p>
                    </div>
                    <span className="bg-teal-50 text-teal-700 text-[9px] font-black px-2 py-0.5 rounded-full">9 AM - 6 PM</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700">+91 95600 78901</p>
                  <button 
                    onClick={() => alert("Simulating secure intercom connection to Estate Office Anil Joshi...")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-1.5 rounded-xl text-xs uppercase transition"
                  >
                    TAP TO DIAL
                  </button>
                </div>

                {/* 5. Society Electrician */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-sm hover:border-amber-300 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">Society Electrician</h4>
                      <p className="text-[10px] text-amber-700 font-bold mt-1 uppercase">Maintenance</p>
                    </div>
                    <span className="bg-amber-50 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full">On Call</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700">+91 98900 11223</p>
                  <button 
                    onClick={() => alert("Simulating cell call to duty Electrician...")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-1.5 rounded-xl text-xs uppercase transition"
                  >
                    TAP TO DIAL
                  </button>
                </div>

                {/* 6. Society Plumber */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-sm hover:border-cyan-300 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">Society Plumber</h4>
                      <p className="text-[10px] text-cyan-700 font-bold mt-1 uppercase">Maintenance</p>
                    </div>
                    <span className="bg-cyan-50 text-cyan-700 text-[9px] font-black px-2 py-0.5 rounded-full">On Call</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700">+91 98900 44556</p>
                  <button 
                    onClick={() => alert("Simulating cell call to duty Plumber...")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-1.5 rounded-xl text-xs uppercase transition"
                  >
                    TAP TO DIAL
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 12b: JOBSKARU / HOME SERVICE BOOKING */}
        {/* ==================================== */}
        {activeTab === "services" && (
          <div className="space-y-6">
            
            {/* Header Jumbotron */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-sky-500/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-sky-300 border border-sky-400/20">
                    <Wrench className="w-3 h-3 text-sky-400" /> Greenwood Care Services
                  </div>
                  <h3 className="text-xl font-black tracking-tight">On-Demand Home Care & Repair Portal</h3>
                  <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
                    Book certified, background-checked professional plumbers, electricians, or cleaners instantly. Managed locally and backed by Greenwood verified partners.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider">
                    ⚡ 100% Guaranteed Care
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form & Category Selection Column */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Request Expert Service</h4>
                  <p className="text-[10px] text-slate-400">Select category and schedule date/time to request dispatch.</p>
                </div>

                <form onSubmit={handleServiceBookingSubmit} className="space-y-4">
                  {/* Category Card Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">1. Select Category (श्रेणी चुनें)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setServiceCategory("Plumbing");
                          setServiceSubCategory("Tap Leakage & Pipe Repair");
                        }}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          serviceCategory === "Plumbing" 
                            ? "border-sky-500 bg-sky-50/50 text-sky-800 font-bold" 
                            : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="text-lg">🚰</span>
                        <span className="text-[10px] uppercase tracking-tight block">Plumber</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setServiceCategory("Electrical");
                          setServiceSubCategory("Switch & Socket Fitment");
                        }}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          serviceCategory === "Electrical" 
                            ? "border-amber-500 bg-amber-50/50 text-amber-800 font-bold" 
                            : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="text-lg">🔌</span>
                        <span className="text-[10px] uppercase tracking-tight block">Electrician</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setServiceCategory("Cleaning");
                          setServiceSubCategory("Deep House Cleaning");
                        }}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          serviceCategory === "Cleaning" 
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-800 font-bold" 
                            : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="text-lg">🧹</span>
                        <span className="text-[10px] uppercase tracking-tight block">Cleaner</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Sub-Category options */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">2. Specific service work</label>
                    {serviceCategory === "Plumbing" && (
                      <select 
                        value={serviceSubCategory}
                        onChange={(e) => setServiceSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Tap Leakage & Pipe Repair">Tap Leakage & Pipe Repair / नल ठीक करना (₹350)</option>
                        <option value="Basin & Sink Drain Unclogging">Basin & Sink Drain Unclogging / नाली खोलना (₹400)</option>
                        <option value="Water Tank & Motor Repair">Water Tank & Motor Repair / वाटर टैंक मोटर (₹600)</option>
                        <option value="Bathroom Fittings & Shower Repair">Bathroom Fittings & Shower / बाथरूम फिटिंग (₹500)</option>
                      </select>
                    )}

                    {serviceCategory === "Electrical" && (
                      <select 
                        value={serviceSubCategory}
                        onChange={(e) => setServiceSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Switch & Socket Fitment">Switch & Socket Fitment / स्विच ठीक करना (₹300)</option>
                        <option value="Ceiling Fan Installation">Ceiling Fan Installation / पंखा लगाना (₹450)</option>
                        <option value="Short Circuit / MCB Tripping Fix">Short Circuit & MCB Tripping / शॉर्ट सर्किट (₹500)</option>
                        <option value="LED Light & Chandelier Setup">LED Light & Chandelier Setup / लाइट और झूमर (₹400)</option>
                      </select>
                    )}

                    {serviceCategory === "Cleaning" && (
                      <select 
                        value={serviceSubCategory}
                        onChange={(e) => setServiceSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Deep House Cleaning">Deep House Cleaning / पूरे घर की गहरी सफाई (₹1,200)</option>
                        <option value="Kitchen & Bathroom Deep Scrubbing">Kitchen & Bathroom Scrubbing / रसोई और बाथरूम (₹800)</option>
                        <option value="Sofa, Carpet & Mattress Vacuuming">Sofa & Carpet Vacuuming / सोफा वैक्यूम (₹600)</option>
                        <option value="Balcony & Tile High-Pressure Wash">Balcony Tile Washing / टाइल प्रेशर वॉश (₹500)</option>
                      </select>
                    )}
                  </div>

                  {/* Scheduling Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Date</label>
                      <input 
                        type="date"
                        required
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time Slot</label>
                      <select 
                        value={serviceTime}
                        onChange={(e) => setServiceTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                        <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Fixed Address Display */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Address</label>
                    <input 
                      type="text"
                      disabled
                      value={`${currentUser.name}, Flat ${currentUser.flat}, Greenwood Heights, Block B`}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instructions / Specific Issue</label>
                    <textarea 
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      placeholder="Specify your model, leakage severity, or specific directions if any..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    🚀 Register Booking Request
                  </button>
                </form>
              </div>

              {/* Order Tracking Dashboard Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Live Tracking Header */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span>Resident Order Tracking Status Dashboard</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Manage, cancel, or advance your real-time booked services below.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {localServicesHistory.filter(b => b.status !== "Completed" && b.status !== "Cancelled").length} Active
                    </span>
                  </div>

                  {/* If no history */}
                  {localServicesHistory.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <span className="text-3xl">🧹</span>
                      <p className="text-xs font-bold">No active service requests currently registered.</p>
                      <p className="text-[10px]">Select a category and schedule a plumber, electrician, or cleaner to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {localServicesHistory.map(order => {
                        const isTerminal = order.status === "Completed" || order.status === "Cancelled";
                        return (
                          <div 
                            key={order.id} 
                            className={`p-4 border rounded-2xl transition-all ${
                              order.status === "Completed" ? "bg-emerald-50/30 border-emerald-100" :
                              order.status === "Cancelled" ? "bg-slate-50 border-slate-100 opacity-75" :
                              order.status === "Searching for Partner..." ? "bg-indigo-50/20 border-indigo-100" :
                              "bg-sky-50/20 border-sky-100"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100/70 pb-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                  {order.id}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                  order.category === "Plumbing" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                                  order.category === "Electrical" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                  "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                  {order.category}
                                </span>
                              </div>
                              <div className="text-[10px] font-black text-slate-600 flex items-center gap-1">
                                <span>📅 {order.date}</span>
                                <span className="text-slate-300">|</span>
                                <span>⏰ {order.time}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                              <div className="md:col-span-6 space-y-1">
                                <h5 className="font-black text-xs text-slate-800">{order.subCategory}</h5>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  Notes: <span className="italic text-slate-600">"{order.notes}"</span>
                                </p>
                                <div className="text-[10px] flex items-center gap-3 pt-1">
                                  <span className="text-slate-500">Partner: <strong className="text-slate-800">{order.provider}</strong></span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-500">Fee: <strong className="text-emerald-700">{order.cost}</strong></span>
                                </div>
                              </div>

                              <div className="md:col-span-6 space-y-2">
                                {/* Tracker Steps bar */}
                                {!isTerminal && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] uppercase font-black text-slate-400">
                                      <span className={order.status === "Searching for Partner..." ? "text-indigo-600 font-bold" : ""}>Request</span>
                                      <span className={order.status === "Technician Dispatched" ? "text-sky-600 font-bold" : ""}>Dispatched</span>
                                      <span className={order.status === "In Progress" ? "text-amber-600 font-bold" : ""}>In Progress</span>
                                      <span>Complete</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${
                                          order.status === "Searching for Partner..." ? "w-1/4 bg-indigo-500" :
                                          order.status === "Technician Dispatched" ? "w-2/4 bg-sky-500" :
                                          "w-3/4 bg-amber-500"
                                        }`}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Status Badge and Controller */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                      order.status === "Completed" ? "bg-green-100 text-green-700" :
                                      order.status === "Cancelled" ? "bg-slate-100 text-slate-500" :
                                      order.status === "Searching for Partner..." ? "bg-indigo-100 text-indigo-700 animate-pulse" :
                                      order.status === "In Progress" ? "bg-amber-100 text-amber-700 animate-pulse" :
                                      "bg-sky-100 text-sky-700"
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {!isTerminal && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => simulateServiceMatch(order.id)}
                                          className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-wider transition active:scale-95 cursor-pointer"
                                        >
                                          {order.status === "Searching for Partner..." ? "⚡ Dispatch Expert" :
                                           order.status === "Technician Dispatched" ? "▶️ Start Work" :
                                           "✅ Complete Work"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => cancelServiceBooking(order.id)}
                                          className="px-2 py-1 rounded bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-extrabold text-[9px] uppercase tracking-wider transition border border-slate-200 active:scale-95 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Local Care Guidelines Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3.5 items-start">
                  <span className="text-xl">💡</span>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Greenwood Heights Care Guideline</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      All visiting technicians undergo automated RFID security tag verification and are required to register at Gate 1. In keeping with society protocols, dispatch logs are automatically whitelisted.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "festival" && (
          <FestivalHub currentUser={currentUser} onRefreshPrograms={onRefreshPrograms} />
        )}

        {/* ==================================== */}
        {/* TAB 13: RESIDENT PREFERENCES SETTINGS */}
        {/* ==================================== */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Resident Profile Contact Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-indigo-500" />
                    <span>My GateKaru Profile Details</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your official resident directory credentials used for billing, gate operations, and security notifications.</p>
                </div>
                <button 
                  type="button"
                  onClick={openEditProfileModal}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black px-4 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm uppercase tracking-wider"
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Full Name</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-1">{currentUser.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mobile Number</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-1">{currentUser.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Email Address</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-1 truncate">{currentUser.email || "Not specified"}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Emergency Contact</span>
                  <p className="text-xs font-extrabold text-slate-800 mt-1 text-red-600">{currentUser.emergencyPhone || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-500" />
                    <span>My GateKaru System Preferences</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Toggle resident secure bypass protocols, notification triggers, and visual app setups.</p>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-2.5 py-1 rounded-full uppercase">Stored Locally</span>
              </div>

              {/* Preferences rows */}
              <div className="space-y-4 pt-2">
                
                {/* Row 1 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Instant Gatepass SMS Relay</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Send entry OTP to visitor's phone via instant cellular SMS automatically.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Guard Call Auto-Approval</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Bypass telephone verification call from security gates for verified pre-approved guests.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Smart RFID Barrier Opening</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Instantly open boom barrier locks when linked household vehicles approach within 5 meters.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                </div>

                {/* Row 4 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">App Lock biometric authentication</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Require FaceID or secure fingerprint credentials when opening the GateKaru portal.</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                </div>

              </div>
            </div>

            {/* DND MANAGEMENT SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    <span>Do Not Disturb (DND) Management</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure global and granular notification mutes for your apartment residence.
                  </p>
                </div>
                <span className="text-[9px] bg-indigo-50 text-indigo-600 font-black px-2.5 py-1 rounded-full uppercase">
                  DND Protocol
                </span>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border ${
                localDndPrefs.globalDnd 
                  ? "bg-red-50 border-red-200 text-red-800" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              } transition flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{localDndPrefs.globalDnd ? "🔇" : "🔔"}</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider">
                      {localDndPrefs.globalDnd ? "Global DND is Active" : "Resident Alerts Active"}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {localDndPrefs.globalDnd 
                        ? "All non-critical and critical sounds & voice notifications are currently muted." 
                        : "Sounds and announcements are permitted based on categories below."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleLocalPref("globalDnd")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    localDndPrefs.globalDnd 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-slate-800 hover:bg-slate-950 text-white"
                  }`}
                >
                  {localDndPrefs.globalDnd ? "Disable DND" : "Enable DND"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* Category 1: Visitor Doorbell Chimes */}
                <div className={`p-4 rounded-xl border transition ${
                  localDndPrefs.muteVisitorChime 
                    ? "bg-slate-50 border-slate-200 opacity-80" 
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🛎</span>
                    <input 
                      type="checkbox" 
                      checked={localDndPrefs.muteVisitorChime}
                      onChange={() => toggleLocalPref("muteVisitorChime")}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
                    />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 mt-2">Mute Visitor Doorbell</h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Silences standard ding-dong audio chime when guests check in or await approval.
                  </p>
                </div>

                {/* Category 2: Voice Announcements */}
                <div className={`p-4 rounded-xl border transition ${
                  localDndPrefs.muteVoiceAnnounce 
                    ? "bg-slate-50 border-slate-200 opacity-80" 
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🗣</span>
                    <input 
                      type="checkbox" 
                      checked={localDndPrefs.muteVoiceAnnounce}
                      onChange={() => toggleLocalPref("muteVoiceAnnounce")}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
                    />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 mt-2">Mute Voice Announcements</h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Turns off spoken text-to-speech lobby entry notifications of guest arrivals.
                  </p>
                </div>

                {/* Category 3: SOS Emergency Alerts */}
                <div className={`p-4 rounded-xl border transition ${
                  localDndPrefs.muteEmergencyAlert 
                    ? "bg-red-50/30 border-red-100 opacity-80" 
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🚨</span>
                    <input 
                      type="checkbox" 
                      checked={localDndPrefs.muteEmergencyAlert}
                      onChange={() => toggleLocalPref("muteEmergencyAlert")}
                      className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer" 
                    />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 mt-2 text-red-700">Mute Emergency Alarms</h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Silences high-priority sirens/SOS broadcast. Keep disabled for security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDetail(null)}
            className="fixed inset-0 bg-[#040612]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    My Flat Gatekeeper Log
                  </span>
                  <h3 className="text-sm font-black text-slate-800 mt-1 uppercase tracking-wide">
                    {selectedDetail.type} Detailed Overview
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedDetail(null)}
                  className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {selectedDetail.type === "visitor" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-850 text-base">{selectedDetail.data.name}</h4>
                        <p className="text-xs text-indigo-600 font-semibold">{selectedDetail.data.type} • Flat {selectedDetail.data.flat}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Transit Purpose</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block">{selectedDetail.data.purpose}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Company / Agency</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block">{selectedDetail.data.company || "Personal"}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Gate Passcode</span>
                        <span className="text-xs font-mono font-bold text-indigo-600 mt-1 block">{selectedDetail.data.passcode}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Status</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedDetail.data.status === "Checked-In" ? "bg-green-100 text-green-700 animate-pulse" : "bg-indigo-100 text-indigo-700"}`}>
                            {selectedDetail.data.status}
                          </span>
                        </span>
                      </div>
                    </div>

                    {selectedDetail.data.checkedInAt && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                        <p className="font-bold text-slate-400 text-[10px] uppercase">Smart Gate Timestamp</p>
                        <p>⏱ Check-in: {new Date(selectedDetail.data.checkedInAt).toLocaleString()}</p>
                        {selectedDetail.data.checkedOutAt && (
                          <p>⏱ Check-out: {new Date(selectedDetail.data.checkedOutAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedDetail.type === "bill" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-850 text-base">{selectedDetail.data.title}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{selectedDetail.data.category} • Flat {selectedDetail.data.flat}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Amount Due</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">₹{selectedDetail.data.amount.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Due Date</span>
                        <span className="text-xs font-bold text-red-600 mt-1 block">{selectedDetail.data.dueDate}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Status</span>
                        <span className="text-xs font-bold mt-1 block">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedDetail.data.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {selectedDetail.data.status}
                          </span>
                        </span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Transaction Reference</span>
                        <span className="text-xs font-mono font-bold text-slate-700 mt-1 block break-all">{selectedDetail.data.transactionId || "Unpaid Pending Settle"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetail.type === "complaint" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-850 text-base">{selectedDetail.data.title}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{selectedDetail.data.category} • Raised on: {new Date(selectedDetail.data.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Issue Description</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedDetail.data.description}</p>
                    </div>

                    {selectedDetail.data.assignedTo && (
                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex justify-between items-center text-xs">
                        <span className="text-indigo-950 font-bold">Assigned Technician:</span>
                        <span className="text-indigo-700 font-extrabold">👨🏽‍🔧 {selectedDetail.data.assignedTo}</span>
                      </div>
                    )}

                    {selectedDetail.data.updates && selectedDetail.data.updates.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Live Ticket Resolution Feed</p>
                        {selectedDetail.data.updates.map((upd: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-600 border-b border-slate-100/50 pb-1.5 last:border-0 last:pb-0">
                            <span>• {upd.note}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(upd.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 transition border border-slate-200"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Profile Edit Modal */}
        {editProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditProfileOpen(false)}
            className="fixed inset-0 bg-[#040612]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    GateKaru Directory Sync
                  </span>
                  <h3 className="text-sm font-black text-slate-800 mt-1 uppercase tracking-wide">
                    Edit Resident Contact Profile
                  </h3>
                </div>
                <button 
                  onClick={() => setEditProfileOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold transition text-sm p-1.5 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleUpdateProfileSubmit}>
                <div className="p-6 space-y-4">
                  {profileError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span className="shrink-0">⚠️</span>
                      <span>{profileError}</span>
                    </div>
                  )}

                  {profileSaveSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                      <span className="shrink-0">✅</span>
                      <span>Profile updated and synced successfully!</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="E.g., Aarav Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <input 
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="E.g., +91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input 
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="E.g., aarav@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider flex justify-between">
                      <span>Emergency Contact Phone</span>
                      <span className="text-[9px] text-indigo-600 font-bold lowercase tracking-normal">Shown to security guards</span>
                    </label>
                    <input 
                      type="tel"
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      placeholder="E.g., +91 91234 56789"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 transition border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition active:scale-95 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 shadow-md flex items-center gap-1.5"
                  >
                    {profileSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Profile Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {/* Quick Dial Emergency SOS Modal */}
        {showQuickDialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickDialModal(false)}
            className="fixed inset-0 bg-[#040612]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-red-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left my-8"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-amber-200 shadow-inner">
                      <PhoneCall className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        🚨 GateKaru Quick Dial Console
                      </span>
                      <h3 className="text-lg font-black tracking-tight mt-0.5">
                        Direct Guard & Admin Simultaneous Alert
                      </h3>
                      <p className="text-xs text-red-100 font-medium mt-0.5">
                        Flat {currentUser?.flat || "A-402"} • Greenwood Heights Security Dispatch
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowQuickDialModal(false)}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* 1. Direct Phone Quick Dial Intercom Buttons */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-red-600" />
                    <span>Direct Intercom Quick Dial Contacts</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Guard Desk */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-red-300 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">
                            Gate 1 Guard
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Ext #101</span>
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-xs mt-2">Main Gate Cabin</h5>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">+91 98765 43210</p>
                      </div>
                      <a
                        href="tel:+919876543210"
                        className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>CALL GUARD</span>
                      </a>
                    </div>

                    {/* Admin / Secretary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-red-300 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md uppercase">
                            Admin Office
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Ext #100</span>
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-xs mt-2">Vikram Mehta (Admin)</h5>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">+91 98100 23456</p>
                      </div>
                      <a
                        href="tel:+919810023456"
                        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>CALL ADMIN</span>
                      </a>
                    </div>

                    {/* Control Room */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-red-300 transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-md uppercase">
                            Control Room
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Ext #999</span>
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-xs mt-2">Emergency Desk</h5>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">+91 11-4020-8888</p>
                      </div>
                      <a
                        href="tel:+911140208888"
                        className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>CALL DESK</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. 1-Tap Pre-Configured Alert Broadcast Triggers */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span>1-Tap Simultaneous Alert Triggers (Guard + Admin)</span>
                    </h4>
                    <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      Instant Dual Dispatch
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {quickDialTemplates.map((template) => (
                      <div 
                        key={template.id}
                        className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-3.5 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl p-2 bg-slate-100 rounded-xl shrink-0 group-hover:scale-110 transition">
                            {template.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-slate-900 text-xs">{template.label}</h5>
                              <span className="text-[10px] font-bold text-slate-500">({template.hindiLabel})</span>
                              <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                {template.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                              "{template.defaultText}"
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isQuickDialing}
                          onClick={() => setPendingDispatchTemplate(template)}
                          className={`bg-gradient-to-r ${template.color} hover:brightness-110 active:scale-95 text-xs font-black px-4 py-2 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>1-TAP DISPATCH</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Live Dispatch Confirmation Feedback */}
                {quickDialDispatchResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                        <span>QUICK DIAL ALERT DISPATCHED SIMULTANEOUSLY!</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">{quickDialDispatchResult.timestamp}</span>
                    </div>

                    <p className="text-xs text-emerald-950 font-bold bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                      {quickDialDispatchResult.message}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {quickDialDispatchResult.dispatches.map((d, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-200 flex items-start gap-2">
                          <span className="text-emerald-600 font-black">✓</span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{d.target}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{d.channel} • {d.details || d.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>GateKaru Emergency Safety Protocol Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickDialModal(false)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Console
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Confirmation Dialog before Quick Dial Dispatch */}
        {pendingDispatchTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPendingDispatchTemplate(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 border-b border-red-100 pb-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl text-2xl animate-bounce shrink-0">
                  ⚠️
                </div>
                <div>
                  <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Emergency Guard & Admin Alert
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Confirm Dispatching Alert?
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Accidental Trigger Prevention Check
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-red-900">Emergency Type:</span>
                  <span className="font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded text-[11px] border border-red-200">
                    {pendingDispatchTemplate.label || pendingDispatchTemplate.type}
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-red-900 block mb-1">Broadcasting Message:</span>
                  <p className="text-slate-800 font-bold bg-white p-2.5 rounded-lg border border-red-200 text-xs leading-relaxed">
                    "{pendingDispatchTemplate.defaultText}"
                  </p>
                </div>
                <div className="text-[10px] font-extrabold text-red-800 bg-red-100/80 p-2 rounded-lg border border-red-200/80 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Notifies Gate 1 Security Guard, Walkie-Talkie & Admin SMS simultaneously.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingDispatchTemplate(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel / Stop
                </button>
                <button
                  type="button"
                  disabled={isQuickDialing}
                  onClick={() => {
                    const template = pendingDispatchTemplate;
                    setPendingDispatchTemplate(null);
                    handleQuickDialDispatch(template);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  <span>YES, DISPATCH NOW 🚨</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
