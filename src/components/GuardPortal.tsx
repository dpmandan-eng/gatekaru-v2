import React, { useState, useEffect } from "react";
import { safeFetchJson } from "../utils/safeFetch";
import { Visitor, StaffMember, GuardAlert, User } from "../types";
import { getTranslation } from "../utils/translations";
import { 
  Check, AlertTriangle, ScanLine, Camera, Car, ShieldAlert, ArrowRight,
  RefreshCw, Wifi, WifiOff, Users, ClipboardList, HelpCircle, Key, CheckCircle,
  Phone, PhoneCall, Search, Smartphone, Send, Volume2, Shield
} from "lucide-react";
import SecurityDesk from "./SecurityDesk";
import { ALERT_TEMPLATES, INDIAN_LANGUAGES } from "../utils/alertTemplates";

// Web Audio API beep simulator
const playDialTone = (freq: number, duration: number) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // ignore
  }
};

// Text to speech helper for realistic gate announcement with language localization support
const speakText = (text: string, langCode: string = "en") => {
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      if (langCode === "hi") {
        utterance.lang = "hi-IN";
      } else if (langCode === "mr") {
        utterance.lang = "mr-IN";
      } else {
        utterance.lang = "en-IN";
      }

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith(langCode.toLowerCase()) ||
        (langCode === "en" && v.lang.toLowerCase().includes("in"))
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      } else {
        const indVoice = voices.find(v => v.lang.toLowerCase().includes("in") || v.lang.toLowerCase().includes("hi"));
        if (indVoice) utterance.voice = indVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // ignore
  }
};

const flatResidents: Record<string, { name: string; phone: string; status: "Online" | "Offline" }> = {
  "A-101": { name: "Rajesh Kulkarni", phone: "+91 91234 56780", status: "Online" },
  "A-102": { name: "Meera Nair", phone: "+91 92345 67891", status: "Online" },
  "A-201": { name: "Suresh Raina", phone: "+91 93456 78902", status: "Offline" },
  "A-202": { name: "Ananya Deshmukh", phone: "+91 94567 89013", status: "Online" },
  "A-301": { name: "Vikram Malhotra", phone: "+91 95678 90124", status: "Online" },
  "A-302": { name: "Divya Teja", phone: "+91 96789 01235", status: "Online" },
  "A-401": { name: "Karan Johar", phone: "+91 97890 12346", status: "Offline" },
  "A-402": { name: "Aarav Sharma", phone: "+91 98765 43210", status: "Online" }, // Real User
  "A-501": { name: "Preeti Shenoy", phone: "+91 98901 23457", status: "Online" },
  "A-502": { name: "Abhinav Bindra", phone: "+91 99012 34568", status: "Online" },
  "B-101": { name: "Gopal Dutt", phone: "+91 90123 45679", status: "Online" },
  "B-102": { name: "Kiran Bedi", phone: "+91 91234 56789", status: "Online" },
  "B-105": { name: "Priya Patel", phone: "+91 87654 32109", status: "Online" }, // Real User
  "B-201": { name: "Ravi Shastri", phone: "+91 92345 67890", status: "Offline" },
  "B-202": { name: "Sanjana Sanghi", phone: "+91 93456 78901", status: "Online" },
  "B-301": { name: "Alok Nath", phone: "+91 94567 89012", status: "Online" },
  "B-302": { name: "Udit Narayan", phone: "+91 95678 90123", status: "Offline" },
  "B-401": { name: "Shreya Ghoshal", phone: "+91 96789 01234", status: "Online" },
  "B-402": { name: "Arijit Singh", phone: "+91 97890 12345", status: "Online" },
  "B-501": { name: "Mithali Raj", phone: "+91 98901 23456", status: "Online" },
  "B-502": { name: "Mary Kom", phone: "+91 99012 34567", status: "Online" },
};

interface PendingApproval {
  id: string;
  visitorName: string;
  type: "Guest" | "Delivery" | "Cab" | "Service";
  company: string;
  flat: string;
  hostName: string;
  vehicleNumber: string;
  status: "Waiting" | "Approved" | "Rejected";
  timestamp: string;
}

interface GuardPortalProps {
  users?: User[];
  visitors: Visitor[];
  onVisitorAction: (params: { id?: string; passcode?: string; action: "checkin" | "checkout"; name?: string; type?: string; flat?: string; company?: string; vehicleNumber?: string }) => void;
  staff: StaffMember[];
  onStaffAction: (code: string, action: "checkin" | "checkout") => void;
  alerts: GuardAlert[];
  onTriggerSOS: (msg: string, type?: string) => void;
  onResolveAlert: (id: string) => void;
  globalLang?: string;
}

export default function GuardPortal({
  users = [],
  visitors,
  onVisitorAction,
  staff,
  onStaffAction,
  alerts,
  onTriggerSOS,
  onResolveAlert,
  globalLang = "en"
}: GuardPortalProps) {
  const t = (key: string, def: string) => getTranslation(globalLang, key, def);

  // Live Pending Gate Approvals database simulation
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  // Spoken Text language translations and configurations
  const speakLangText = (key: string, variables: Record<string, string> = {}) => {
    let phrase = "";
    if (globalLang === "hi") {
      switch (key) {
        case "calling_flat":
          phrase = `फ्लैट ${variables.flat} के निवासी ${variables.resident} को कॉल किया जा रहा है।`;
          break;
        case "connected_flat":
          phrase = `फ्लैट ${variables.flat} से संपर्क हो गया है। ${variables.resident} इंटरकॉम पर उपस्थित हैं।`;
          break;
        case "disconnected":
          phrase = `इंटरकॉम कॉल समाप्त हो गया है।`;
          break;
        case "sending_pass":
          phrase = `निवासी के मोबाइल ऐप पर गेट पास अनुमति के लिए संदेश भेजा जा रहा है।`;
          break;
        case "approved":
          phrase = `गेट प्रवेश स्वीकृत। अंदर जाने की अनुमति दी गई है।`;
          break;
        case "rejected":
          phrase = `गेट प्रवेश अस्वीकृत। प्रवेश की अनुमति नहीं है।`;
          break;
        case "authorized_checkin":
          phrase = `${variables.visitor} के लिए प्रवेश अधिकृत। द्वार का बूम बैरियर खोल दिया गया है।`;
          break;
        case "sent_notification":
          phrase = `फ्लैट ${variables.flat} के निवासी ${variables.resident} को प्रवेश अनुमति संदेश भेजा गया।`;
          break;
        case "onspot_completed":
          phrase = `तत्काल प्रवेश पूर्ण। ${variables.visitor} का चेक-इन हो गया है।`;
          break;
        default:
          phrase = key;
      }
    } else if (globalLang === "mr") {
      switch (key) {
        case "calling_flat":
          phrase = `फ्लॅट ${variables.flat} चे रहिवासी ${variables.resident} यांना कॉल केला जात आहे.`;
          break;
        case "connected_flat":
          phrase = `फ्लॅट ${variables.flat} शी कॉल जोडला गेला आहे. ${variables.resident} इंटरकॉमवर बोलत आहेत.`;
          break;
        case "disconnected":
          phrase = `इंटरकॉम कॉल समाप्त झाला आहे.`;
          break;
        case "sending_pass":
          phrase = `रहिवाशांच्या मोबाईल ॲपवर गेट पास परवानगीसाठी संदेश पाठवला जात आहे.`;
          break;
        case "approved":
          phrase = `गेट प्रवेश मंजूर. आत जाण्यास परवानगी देण्यात आली आहे.`;
          break;
        case "rejected":
          phrase = `गेट प्रवेश नाकारला. आत जाण्यास परवानगी नाही.`;
          break;
        case "authorized_checkin":
          phrase = `${variables.visitor} यांच्यासाठी प्रवेश अधिकृत. बूम बॅरियर उघडले आहे.`;
          break;
        case "sent_notification":
          phrase = `फ्लॅट ${variables.flat} चे रहिवासी ${variables.resident} यांना परवानगी संदेश पाठवला.`;
          break;
        case "onspot_completed":
          phrase = `तातडीचा प्रवेश पूर्ण. ${variables.visitor} यांचे चेक-इन झाले आहे.`;
          break;
        default:
          phrase = key;
      }
    } else {
      // English / Fallback
      switch (key) {
        case "calling_flat":
          phrase = `Calling flat ${variables.flat} resident ${variables.resident}`;
          break;
        case "connected_flat":
          phrase = `Connected to flat ${variables.flat}. ${variables.resident} is active on the intercom.`;
          break;
        case "disconnected":
          phrase = `Intercom call disconnected.`;
          break;
        case "sending_pass":
          phrase = `Sending real-time gate pass authorization alert to resident application.`;
          break;
        case "approved":
          phrase = `Gate entry approved. Access Granted.`;
          break;
        case "rejected":
          phrase = `Gate entry rejected. Access Denied.`;
          break;
        case "authorized_checkin":
          phrase = `Check-In entry authorized for ${variables.visitor}. Boom barrier raised.`;
          break;
        case "sent_notification":
          phrase = `Sent approval notification to flat ${variables.flat} resident ${variables.resident}.`;
          break;
        case "onspot_completed":
          phrase = `On-spot entry completed. Checked-in ${variables.visitor}.`;
          break;
        default:
          phrase = key;
      }
    }
    speakText(phrase, globalLang);
  };

  // Tabs: Live Scan, On-Spot Entry, Helper Attendance, SOS Log, Intercom & Approvals, Security Operations Desk
  const [activeTab, setActiveTab] = useState<"scan" | "onspot" | "helpers" | "sos" | "intercom" | "securitydesk">("scan");

  // Blacklist states
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [blacklistAlert, setBlacklistAlert] = useState<{ name: string; vehicle: string; reason: string } | null>(null);
  const [overridePin, setOverridePin] = useState("");

  useEffect(() => {
    safeFetchJson("/api/security/blacklist", {}, [])
      .then(data => {
        if (Array.isArray(data)) {
          setBlacklist(data);
        }
      })
      .catch(err => console.error("Error loading blacklist", err));
  }, [activeTab]); // Refresh whenever tab changes or mounts

  const checkBlacklistMatch = (name: string, vehicle: string): boolean => {
    if (!name && !vehicle) return false;
    
    const matched = blacklist.find(item => {
      const nameMatch = name && item.name && item.name.toLowerCase() === name.toLowerCase();
      const cleanInputVehicle = vehicle ? vehicle.replace(/\s+/g, '').toUpperCase() : "";
      const cleanItemVehicle = item.vehicleNo ? item.vehicleNo.replace(/\s+/g, '').toUpperCase() : "";
      const vehicleMatch = cleanInputVehicle && cleanItemVehicle && cleanInputVehicle === cleanItemVehicle;
      
      return nameMatch || vehicleMatch;
    });

    if (matched) {
      // Trigger alarm sirens
      playDialTone(880, 0.4);
      setTimeout(() => playDialTone(660, 0.4), 400);
      setTimeout(() => playDialTone(880, 0.4), 800);
      
      setBlacklistAlert({
        name: matched.name || name,
        vehicle: matched.vehicleNo || vehicle,
        reason: matched.reason
      });
      return true;
    }
    return false;
  };

  // Local Offline Simulation
  const [isOffline, setIsOffline] = useState(false);

  // Intercom calling states
  const [activeCallFlat, setActiveCallFlat] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "connected" | "no_answer">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [intercomSearch, setIntercomSearch] = useState("");
  const [intercomBlock, setIntercomBlock] = useState<"ALL" | "A" | "B">("ALL");

  // Keep track of announced approval IDs so we don't repeat announcements
  const announcedApprovedIdsRef = React.useRef<Set<string>>(new Set());
  const isFirstLoadRef = React.useRef(true);

  // Monitor approvals state for status changes from Waiting -> Approved
  useEffect(() => {
    if (pendingApprovals.length > 0) {
      if (isFirstLoadRef.current) {
        // Populate existing Approved entries to avoid playing they are already approved
        pendingApprovals.forEach(app => {
          if (app.status === "Approved") {
            announcedApprovedIdsRef.current.add(app.id);
          }
        });
        isFirstLoadRef.current = false;
      } else {
        pendingApprovals.forEach(app => {
          if (app.status === "Approved" && !announcedApprovedIdsRef.current.has(app.id)) {
            announcedApprovedIdsRef.current.add(app.id);
            
            // Build the specific message user requested: e.g. "Ram ko 102 flat se approval aaya hai"
            let msg = "";
            const flatNum = app.flat.replace("-", " ");
            if (globalLang === "hi") {
              msg = `${app.visitorName} को ${flatNum} फ्लैट से अप्रूवल आया है।`;
            } else if (globalLang === "mr") {
              msg = `${app.visitorName} ला ${flatNum} फ्लॅट कडून अप्रूव्हल आले आहे.`;
            } else {
              msg = `${app.visitorName} received entry approval from flat ${flatNum}.`;
            }
            speakText(msg, globalLang);
          }
        });
      }
    }
  }, [pendingApprovals, globalLang]);

  // Synchronize approvals with server in real-time
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const data = await safeFetchJson("/api/approvals", undefined, []);
        setPendingApprovals(data);
      } catch (err) {
        console.error("Error loading approvals:", err);
      }
    };
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 3000);
    return () => clearInterval(interval);
  }, []);

  // States
  const [passcodeInput, setPasscodeInput] = useState("");
  const [scannedResult, setScannedResult] = useState<Visitor | null>(null);
  const [scanMessage, setScanMessage] = useState("");
  const [scanError, setScanError] = useState("");

  // Face Mock capture
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // On Spot forms
  const [walkinName, setWalkinName] = useState("");
  const [walkinType, setWalkinType] = useState<"Guest" | "Delivery" | "Cab" | "Service">("Guest");
  const [walkinFlat, setWalkinFlat] = useState("A-402");
  const [walkinCompany, setWalkinCompany] = useState("");
  const [walkinVehicle, setWalkinVehicle] = useState("");
  const [spotActionType, setSpotActionType] = useState<"direct" | "app_approval">("direct");

  // Helper Attendance
  const [helperCode, setHelperCode] = useState("");
  const [helperResult, setHelperResult] = useState<StaffMember | null>(null);
  const [helperError, setHelperError] = useState("");

  // Panic Button Action
  const [panicLoading, setPanicLoading] = useState(false);
  const [selectedAlertTemplate, setSelectedAlertTemplate] = useState<string>("fire_emergency");
  const [customAlertMessage, setCustomAlertMessage] = useState<string>("");

  // Active call duration counter
  useEffect(() => {
    let interval: any = null;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Intercom Call Actions
  const handleInitiateCall = (flatNo: string) => {
    setActiveCallFlat(flatNo);
    setCallStatus("dialing");
    
    // Play dial tones
    playDialTone(440, 0.4);
    setTimeout(() => playDialTone(440, 0.4), 800);
    setTimeout(() => playDialTone(440, 0.4), 1600);

    const resident = flatResidents[flatNo];
    speakLangText("calling_flat", { flat: flatNo.replace("-", " "), resident: resident?.name || "Resident" });

    setTimeout(() => {
      setCallStatus("connected");
      playDialTone(660, 0.25);
      speakLangText("connected_flat", { flat: flatNo.replace("-", " "), resident: resident?.name || "Resident" });
    }, 2500);
  };

  const handleEndCall = () => {
    setCallStatus("idle");
    setActiveCallFlat(null);
    speakLangText("disconnected");
  };

  const handleRequestApprovalFromCall = async () => {
    if (!activeCallFlat) return;
    const resident = flatResidents[activeCallFlat];
    
    try {
      const data = await safeFetchJson("/api/approvals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: "Intercom Guest",
          type: "Guest",
          company: "Personal Visit",
          flat: activeCallFlat,
          hostName: resident?.name || "Resident",
          vehicleNumber: "No Vehicle"
        })
      }, null);
      if (data) {
        setPendingApprovals(prev => [data, ...prev]);
        speakLangText("sending_pass");
        alert(`Gate authorization requested from ${resident?.name || "Resident"} (Flat ${activeCallFlat})!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate resident approving or rejecting via their phone app notification
  const handleSimulateResidentAction = async (id: string, action: "Approved" | "Rejected") => {
    try {
      const data = await safeFetchJson("/api/approvals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      }, null);
      if (data && data.approval) {
        setPendingApprovals(prev => prev.map(app => app.id === id ? data.approval : app));
        
        if (action === "Approved") {
          playDialTone(880, 0.15);
          setTimeout(() => playDialTone(1100, 0.2), 150);
          speakLangText("approved");
        } else {
          playDialTone(300, 0.4);
          speakLangText("rejected");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check in visitor whose approval has been approved
  const handleCheckInApprovedVisitor = (app: PendingApproval) => {
    if (checkBlacklistMatch(app.visitorName, app.vehicleNumber)) {
      return;
    }

    if (isOffline) {
      alert("System is currently offline. Cannot complete remote server check-in.");
      return;
    }

    onVisitorAction({
      action: "checkin",
      name: app.visitorName,
      type: app.type,
      flat: app.flat,
      company: app.company,
      vehicleNumber: app.vehicleNumber
    });

    // Remove from active queue
    setPendingApprovals(prev => prev.filter(a => a.id !== app.id));
    speakLangText("authorized_checkin", { visitor: app.visitorName });
    alert(`Check-In entry authorized! Guest pass is active for ${app.visitorName}.`);
  };

  // Handle Scan Verification
  const handleVerifyPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcodeInput.trim()) return;

    setScanError("");
    setScanMessage("");
    setScannedResult(null);

    const code = passcodeInput.trim().toUpperCase();
    const normalizedCode = code.replace(/[^A-Z0-9]/g, "");

    // 1. Look for visitor in database matching passcode
    const foundVisitorByPasscode = visitors.find(v => v.passcode.toUpperCase() === code);

    // 2. Look for resident matching vehicle registration number
    const foundResidentByVehicle = users.find(u => u.vehicleNo && u.vehicleNo.toUpperCase().replace(/[^A-Z0-9]/g, "") === normalizedCode);

    // 3. Look for visitor matching vehicle registration number
    const foundVisitorByVehicle = visitors.find(v => v.vehicleNumber && v.vehicleNumber.toUpperCase().replace(/[^A-Z0-9]/g, "") === normalizedCode);

    if (foundVisitorByPasscode) {
      setScannedResult(foundVisitorByPasscode);
      setScanMessage(
        globalLang === "hi"
          ? `🟢 आगंतुक ${foundVisitorByPasscode.name} (फ्लैट ${foundVisitorByPasscode.flat}) के लिए पासकोड सत्यापित!`
          : globalLang === "mr"
          ? `🟢 अभ्यागत ${foundVisitorByPasscode.name} (फ्लॅट ${foundVisitorByPasscode.flat}) साठी पासकोड सत्यापित!`
          : `🟢 Passcode verified for visitor ${foundVisitorByPasscode.name} (Flat ${foundVisitorByPasscode.flat})!`
      );
    } else if (foundResidentByVehicle) {
      // Simulate validating a registered resident vehicle QR code!
      setScannedResult({
        id: `veh-${foundResidentByVehicle.id}`,
        name: `Resident Vehicle Sticker Pass`,
        passcode: code,
        flat: foundResidentByVehicle.flat || "Flat A-402",
        hostName: foundResidentByVehicle.name,
        type: "Resident Vehicle (Windshield QR)",
        vehicleNumber: foundResidentByVehicle.vehicleNo,
        company: "Greenwood Resident",
        purpose: "Windshield QR Pass Verified",
        status: "Pre-Approved",
        avatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100&auto=format&fit=crop&q=60"
      } as any);
      setScanMessage(
        globalLang === "hi"
          ? `🟢 विंडशील्ड क्यूआर स्टीकर सत्यापित! फ्लैट ${foundResidentByVehicle.flat} (${foundResidentByVehicle.name}) वाहन स्वीकृत। बूम बैरियर खुल गया है।`
          : globalLang === "mr"
          ? `🟢 विंडशील्ड क्यूआर स्टीकर सत्यापित! फ्लॅट ${foundResidentByVehicle.flat} (${foundResidentByVehicle.name}) वाहन मंजूर. बूम बॅरियर उघडले आहे.`
          : `🟢 Windshield QR Sticker verified! Flat ${foundResidentByVehicle.flat} (${foundResidentByVehicle.name}) vehicle approved. Greenwood Automated boom-barrier triggered.`
      );
    } else if (foundVisitorByVehicle) {
      setScannedResult(foundVisitorByVehicle);
      setScanMessage(
        globalLang === "hi"
          ? `🟢 पूर्व-स्वीकृत आगंतुक वाहन मिला! ${foundVisitorByVehicle.name} (फ्लैट ${foundVisitorByVehicle.flat}) के लिए सत्यापित।`
          : globalLang === "mr"
          ? `🟢 पूर्व-मंजूर अभ्यागत वाहन आढळले! ${foundVisitorByVehicle.name} (फ्लॅट ${foundVisitorByVehicle.flat}) साठी सत्यापित.`
          : `🟢 Pre-Approved Visitor Vehicle found! Verified for ${foundVisitorByVehicle.name} (Flat ${foundVisitorByVehicle.flat}).`
      );
    } else {
      setScanError(
        globalLang === "hi"
          ? "❌ सुरक्षा चेतावनी: गेट पासकोड या वाहन नंबर अमान्य है अथवा डेटाबेस में पंजीकृत नहीं है।"
          : globalLang === "mr"
          ? "❌ सुरक्षा चेतावणी: गेट पासकोड किंवा वाहन क्रमांक अवैध आहे अथवा डेटाबेसमध्ये नोंदणीकृत नाही."
          : "❌ Security Alert: Passcode, Windshield QR, or Vehicle Plate is invalid, expired, or not registered in the Greenwood Heights database."
      );
    }
  };

  // Perform check-in / check-out action
  const handleActionClick = (action: "checkin" | "checkout", visitor: Visitor) => {
    if (action === "checkin" && checkBlacklistMatch(visitor.name, visitor.vehicleNumber)) {
      return;
    }

    if (isOffline) {
      // Offline cache log simulation
      alert(`[Offline Mode Cache Locked]: Check-${action === "checkin" ? "in" : "out"} cached locally. Will sync automatically upon internet restoral.`);
      visitor.status = action === "checkin" ? "Checked-In" : "Checked-Out";
      if (action === "checkin") visitor.checkedInAt = new Date().toISOString();
      else visitor.checkedOutAt = new Date().toISOString();
      setPasscodeInput("");
      setScannedResult(null);
      return;
    }

    onVisitorAction({
      id: visitor.id,
      action: action
    });
    setScanMessage(`Successfully registered ${action === "checkin" ? "Check-In Entry" : "Check-Out Exit"} for ${visitor.name}.`);
    setPasscodeInput("");
    setScannedResult(null);
  };

  // Capture Photo Simulation
  const triggerCameraMock = () => {
    setIsCapturing(true);
    setTimeout(() => {
      // Simulated data URL of a generic guard post snapshot mockup
      setCapturedPhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60");
      setIsCapturing(false);
    }, 1000);
  };

  // Submit on-the-spot walk-in
  const handleOnSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName) return;

    if (checkBlacklistMatch(walkinName, walkinVehicle)) {
      return;
    }

    if (isOffline) {
      alert("[Offline Mode]: Walk-In Entry cached on this tablet local SQLite store. Syncs on reconnection.");
      setWalkinName("");
      return;
    }

    if (spotActionType === "app_approval") {
      const residentName = flatResidents[walkinFlat]?.name || "Resident";
      
      safeFetchJson("/api/approvals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: walkinName,
          type: walkinType,
          company: walkinCompany || "Local Walk-in",
          flat: walkinFlat,
          hostName: residentName,
          vehicleNumber: walkinVehicle || "No Vehicle"
        })
      }, null)
      .then(data => {
        if (!data) {
          throw new Error("Failed to create approval");
        }
        setPendingApprovals(prev => [data, ...prev]);
        speakLangText("sent_notification", { flat: walkinFlat.replace("-", " "), resident: residentName });
        alert(`Gate authorization request sent to ${residentName}'s mobile application! Redirecting you to Intercom & Approvals page to simulate or wait for response.`);
        setActiveTab("intercom");
        
        setWalkinName("");
        setWalkinCompany("");
        setWalkinVehicle("");
      })
      .catch(err => {
        console.error(err);
        alert("Failed to submit app approval request.");
      });
      return;
    }

    onVisitorAction({
      action: "checkin",
      name: walkinName,
      type: walkinType,
      flat: walkinFlat,
      company: walkinCompany || "Local Walk-in",
      vehicleNumber: walkinVehicle || "No Vehicle"
    });

    speakLangText("onspot_completed", { visitor: walkinName });
    alert(`On-Spot Entry created and Checked-In for ${walkinName}!`);
    setWalkinName("");
    setWalkinCompany("");
    setWalkinVehicle("");
  };

  // Helper RFID / Biometrics login toggle
  const handleHelperVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperCode) return;

    setHelperError("");
    setHelperResult(null);

    const found = staff.find(s => s.code.toUpperCase() === helperCode.trim().toUpperCase());
    if (found) {
      setHelperResult(found);
    } else {
      setHelperError("Helper biometric code/pass not found.");
    }
  };

  const handleHelperAction = (action: "checkin" | "checkout", employee: StaffMember) => {
    onStaffAction(employee.code, action);
    alert(`${employee.name} attendance marked as ${action === "checkin" ? "Checked-In" : "Checked-Out"}!`);
    setHelperCode("");
    setHelperResult(null);
  };

  // Guard Panic Alert trigger
  const handleGuardPanic = () => {
    setPanicLoading(true);
    setTimeout(() => {
      if (selectedAlertTemplate === "custom") {
        const text = customAlertMessage.trim() || "SOS Alert triggered from Security Desk!";
        onTriggerSOS(text, "custom");
      } else {
        const template = ALERT_TEMPLATES.find(t => t.id === selectedAlertTemplate);
        const text = template ? template.translations["en"].message : "SOS Alert triggered!";
        onTriggerSOS(text, selectedAlertTemplate);
      }
      setPanicLoading(false);
      setCustomAlertMessage("");
      alert("Emergency broadcast triggered successfully! Residents will receive immediate visual and vocal notifications in their chosen language.");
    }, 800);
  };

  return (
    <div id="guard-portal" className="flex flex-col h-full bg-slate-50 font-sans">
      
      {/* ======================================================= */}
      {/* RED SECURITY ALARM MATCH OVERLAY */}
      {/* ======================================================= */}
      {blacklistAlert && (
        <div className="fixed inset-0 bg-red-950/95 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-red-900/90 border-4 border-red-500 rounded-3xl max-w-lg w-full p-8 text-center text-white shadow-2xl relative overflow-hidden animate-pulse">
            
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 animate-pulse" />
            
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white animate-bounce shadow-lg">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-xl font-black tracking-widest text-red-100 uppercase font-mono">
              🚨 GATEKARU ALARM: BLACKLISTED MATCH! 🚨
            </h2>
            <p className="text-xs text-red-200 mt-2 font-bold uppercase tracking-wider">
              Banned Entry Attempt Blocked / प्रतिबंधित आगंतुक प्रवेश निषेध
            </p>

            <div className="bg-red-950/80 p-5 rounded-2xl border border-red-500/30 text-left my-6 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Banned Target / प्रतिबंधित व्यक्ति</span>
                <span className="text-sm font-black text-white">{blacklistAlert.name}</span>
              </div>
              
              {blacklistAlert.vehicle && blacklistAlert.vehicle !== "No Vehicle" && (
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Banned Vehicle / प्रतिबंधित वाहन</span>
                  <span className="text-xs font-mono font-black text-red-200 bg-red-900/50 px-2 py-0.5 rounded">{blacklistAlert.vehicle}</span>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Banishment Reason / रोके जाने का कारण</span>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                  {blacklistAlert.reason}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  onTriggerSOS("Blacklisted entry attempt blocked: " + blacklistAlert.name + " (" + (blacklistAlert.vehicle || "No Vehicle") + ")");
                  setBlacklistAlert(null);
                  alert("🚨 Alert sent to Society Admin & SOS dispatch logged. Security gates remain locked.");
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs py-3.5 rounded-xl border border-red-500 transition shadow cursor-pointer active:scale-95"
              >
                ⚠️ DENY ENTRY & DISPATCH SOS (प्रवेश अस्वीकार व अलार्म भेजें)
              </button>

              <div className="border-t border-red-500/20 pt-3">
                <p className="text-[9px] font-bold text-red-400 uppercase mb-2">Authorize Exception? (Requires admin bypass PIN: 1234)</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter Bypass PIN"
                    value={overridePin}
                    onChange={(e) => setOverridePin(e.target.value)}
                    className="flex-1 bg-red-950 border border-red-500/30 rounded-lg p-2 text-xs text-white placeholder-red-700 font-bold focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <button
                    onClick={() => {
                      if (overridePin === "1234" || overridePin === "9999") {
                        setBlacklistAlert(null);
                        setOverridePin("");
                        alert("🔒 Admin override code accepted. Entry bypassed & logged as exceptional clearance.");
                      } else {
                        alert("❌ Invalid Bypass PIN!");
                      }
                    }}
                    className="bg-white text-red-950 hover:bg-red-100 font-extrabold uppercase text-[10px] px-4 rounded-lg transition"
                  >
                    Bypass
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Offline simulation toggler */}
      <div className="bg-slate-900 px-6 py-2.5 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-indigo-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider">GATEKaru Security Post Tablet - Gate 1</h3>
        </div>
        <div className="flex items-center gap-3">
          {isOffline ? (
            <button 
              onClick={() => setIsOffline(false)}
              className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-red-500 transition animate-pulse"
            >
              <WifiOff className="w-3.5 h-3.5" /> OFFLINE MODE (TOUCH TO CONNECT)
            </button>
          ) : (
            <button 
              onClick={() => setIsOffline(true)}
              className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500 transition"
            >
              <Wifi className="w-3.5 h-3.5" /> SECURE ONLINE (TOUCH TO DISCONNECT)
            </button>
          )}
        </div>
      </div>

      {/* Guard Horizontal Navigation */}
      <div className="flex bg-white border-b border-slate-200 px-6 py-2 gap-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("scan")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "scan" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Key className="w-3.5 h-3.5" /> Verify Pre-Approved Passcode / QR
        </button>
        <button 
          onClick={() => setActiveTab("onspot")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "onspot" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Car className="w-3.5 h-3.5" /> On-The-Spot Entry Logger
        </button>
        <button 
          onClick={() => setActiveTab("intercom")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "intercom" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Phone className="w-3.5 h-3.5" /> Intercom & Approvals
        </button>
        <button 
          onClick={() => setActiveTab("helpers")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "helpers" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Users className="w-3.5 h-3.5" /> Daily Helpers Attendance
        </button>
        <button 
          onClick={() => setActiveTab("sos")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "sos" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOS Dispatch Log
        </button>
        <button 
          onClick={() => setActiveTab("securitydesk")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "securitydesk" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Shield className="w-3.5 h-3.5" /> Security Operations Desk (नया)
        </button>
      </div>

      {/* Portal Main Canvas */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* Urgent Alert Banner / Emergency SOS Dropdown Broadcast Control Console */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700 font-mono">🚨 REAL-TIME EMERGENCY BROADCAST CONSOLE</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            
            {/* Template Dropdown Selection */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">1. SELECT ALERT CATEGORY / आपातकालीन श्रेणी चुनें</label>
              <select
                value={selectedAlertTemplate}
                onChange={(e) => setSelectedAlertTemplate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-black text-slate-800 focus:ring-1 focus:ring-red-500 focus:outline-none"
                id="guard-sos-category-selector"
              >
                {ALERT_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>
                    ⚠️ {t.icon} {t.translations["en"].title} ({t.translations["hi"].title})
                  </option>
                ))}
                <option value="custom">✍️ Custom Broadcast Message (मनचाहा संदेश लिखें)</option>
              </select>
            </div>

            {/* Custom Input Field (Only visible when 'custom' is selected) */}
            <div className={`lg:col-span-5 space-y-1.5 transition-all duration-300 ${selectedAlertTemplate === "custom" ? "opacity-100 scale-100" : "opacity-40 pointer-events-none scale-95"}`}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">2. ENTER CUSTOM DISPATCH TEXT (संदेश दर्ज करें)</label>
              <input
                type="text"
                disabled={selectedAlertTemplate !== "custom"}
                value={customAlertMessage}
                onChange={(e) => setCustomAlertMessage(e.target.value)}
                placeholder="E.g. Security Guard Alert: Lift B-3 is currently offline due to technical issue."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                id="guard-sos-custom-text"
              />
            </div>

            {/* Trigger Dispatch Button */}
            <div className="lg:col-span-3">
              <button
                onClick={handleGuardPanic}
                disabled={panicLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-lg text-xs uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {panicLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> DISPATCHING...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 animate-pulse" /> BROADCAST ALERT NOW
                  </>
                )}
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-red-600 font-bold mt-3 bg-red-100/50 p-2 rounded-lg border border-red-100">
            💡 <span className="underline">Smart Multilingual Protocol:</span> Clicking Broadcast will instantly play this announcement over the speakers in the preferred language of every resident individually!
          </p>
        </div>

        {/* ==================================== */}
        {/* GUARD TAB 1: PASSCODE / QR VERIFICATION */}
        {/* ==================================== */}
        {activeTab === "scan" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Verify Form */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">Passcode & Guest Pass Verification</h4>
              
              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter 7-Digit Guest Passcode / Scan Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      required
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="E.g., G-49201 or D-88124"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none uppercase"
                    />
                    <button 
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      VERIFY
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 font-semibold">
                    💡 <strong>{globalLang === "hi" ? "डेमो निर्देश:" : globalLang === "mr" ? "डेमो मार्गदर्शक तत्व:" : "Demo Guidance:"}</strong>{" "}
                    {globalLang === "hi" 
                      ? "केवल पंजीकृत क्रेडेंशियल काम करेंगे। परीक्षण के लिए पूर्व-स्वीकृत विज़िटर पासकोड (जैसे G-49201, D-88124) या पंजीकृत निवासी वाहन नंबर (जैसे DL-3C-AB-1234, HR-26-CD-5678) का उपयोग करें।" 
                      : globalLang === "mr"
                      ? "केवळ नोंदणीकृत क्रेडेंशियल काम करतील. चाचणीसाठी पूर्व-मंजूर अभ्यागत पासकोड (उदा. G-49201, D-88124) किंवा नोंदणीकृत रहिवासी वाहन क्रमांक (उदा. DL-3C-AB-1234, HR-26-CD-5678) वापरा."
                      : "Only registered credentials will work. Test with pre-approved visitor passcodes (e.g. G-49201, D-88124) or registered resident vehicle plates (e.g. DL-3C-AB-1234, HR-26-CD-5678)."}
                  </p>
                </div>
              </form>

              {/* simulated Camera scanner */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Simulate Camera Verification scanner</p>
                  <p className="text-[10px] text-slate-500">Extracts visitor face biometrics and scan license plates automatically.</p>
                </div>
                {capturedPhoto ? (
                  <div className="relative mt-2">
                    <img src={capturedPhoto} alt="Snapshot" className="w-20 h-20 rounded-md object-cover border-2 border-indigo-600" referrerPolicy="no-referrer" />
                    <span className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={triggerCameraMock}
                    disabled={isCapturing}
                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded text-[10px]"
                  >
                    {isCapturing ? "Capturing Camera feed..." : "SNAP VISITOR PHOTO"}
                  </button>
                )}
              </div>

              {scanError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> {scanError}
                </div>
              )}

              {scanMessage && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-xs text-green-700 font-semibold flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-4 h-4 text-green-600" /> {scanMessage}
                </div>
              )}
            </div>

            {/* Verification Result Receipt */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Live Scanned Guest verification details</h4>
                
                {scannedResult ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">PASS VALIDATED</span>
                        <h5 className="font-bold text-slate-800 text-sm mt-0.5">{scannedResult.name}</h5>
                      </div>
                      <span className="bg-white px-2.5 py-1 rounded text-xs font-mono font-bold text-slate-700 border border-indigo-200">
                        {scannedResult.passcode}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Flat Allocation</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{scannedResult.flat}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Authorized Resident</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{scannedResult.hostName}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Visitor Category</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{scannedResult.type}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Vehicle Info</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{scannedResult.vehicleNumber}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Purpose / Company</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{scannedResult.company} - {scannedResult.purpose}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex gap-2">
                      {scannedResult.status === "Pre-Approved" && (
                        <button 
                          onClick={() => handleActionClick("checkin", scannedResult)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs"
                        >
                          CONFIRM CHECK-IN ENTRY
                        </button>
                      )}
                      {scannedResult.status === "Checked-In" && (
                        <button 
                          onClick={() => handleActionClick("checkout", scannedResult)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs"
                        >
                          CONFIRM CHECK-OUT EXIT
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
                    <ScanLine className="w-10 h-10 text-slate-300" />
                    <p className="text-xs">No guest data scanned yet. Enter pass value left and press verify.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* GUARD TAB 2: ON THE SPOT logger */}
        {/* ==================================== */}
        {activeTab === "onspot" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">Manual Walk-In Entry Logger</h4>
              
              <form onSubmit={handleOnSpotSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visitor Full Name</label>
                    <input 
                      type="text"
                      required
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                      placeholder="E.g., Anil Bajpai"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Flat Number (Destination)</label>
                    <select 
                      value={walkinFlat}
                      onChange={(e) => setWalkinFlat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="A-402">A-402 (Aarav Sharma)</option>
                      <option value="B-105">B-105 (Priya Patel)</option>
                      <option value="A-101">A-101 (Rajesh Kulkarni)</option>
                      <option value="A-102">A-102 (Meera Nair)</option>
                      <option value="B-101">B-101 (Gopal Dutt)</option>
                      <option value="B-402">B-402 (Arijit Singh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visitor Type</label>
                    <select 
                      value={walkinType}
                      onChange={(e: any) => setWalkinType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="Guest">Guest Walk-In</option>
                      <option value="Delivery">Courier Delivery</option>
                      <option value="Cab">Taxi/Auto Pickup</option>
                      <option value="Service">Labor/Technician Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company / Association</label>
                    <input 
                      type="text"
                      value={walkinCompany}
                      onChange={(e) => setWalkinCompany(e.target.value)}
                      placeholder="E.g., Swiggy, Amazon, Uber"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Plate Number (If Any)</label>
                    <input 
                      type="text"
                      value={walkinVehicle}
                      onChange={(e) => setWalkinVehicle(e.target.value)}
                      placeholder="E.g., DL-1C-CD-8822"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Verification & Authorization Protocol</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSpotActionType("direct")}
                      className={`p-2.5 rounded-lg border text-left transition ${spotActionType === "direct" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                      <p className="text-xs font-bold flex items-center gap-1">
                        <span>⚡</span> Direct Check-In
                      </p>
                      <p className="text-[9px] opacity-80 mt-0.5">Bypass notification, check-in immediately under guard jurisdiction.</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSpotActionType("app_approval")}
                      className={`p-2.5 rounded-lg border text-left transition ${spotActionType === "app_approval" ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                      <p className="text-xs font-bold flex items-center gap-1 text-indigo-700">
                        <Smartphone className="w-3.5 h-3.5" /> Resident App Approval
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Ping resident's smartphone for remote approval or reject action.</p>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-sm transition"
                >
                  {spotActionType === "app_approval" ? "👉 SEND FOR RESIDENT APPROVAL" : "🔒 SAVE ENTRY & DIRECT CHECK-IN"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* GUARD TAB 3: DAILY HELPERS attendance */}
        {/* ==================================== */}
        {activeTab === "helpers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left helper logger */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">Maid & Staff Biometric / RFID Simulator</h4>
              
              <form onSubmit={handleHelperVerify} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter Biometric Helper Pass Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      required
                      value={helperCode}
                      onChange={(e) => setHelperCode(e.target.value)}
                      placeholder="E.g., H-881, H-192, H-002"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none uppercase"
                    />
                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">VERIFY</button>
                  </div>
                </div>
              </form>

              {helperError && (
                <div className="bg-red-50 border border-red-100 p-2.5 rounded text-xs text-red-700 font-semibold">{helperError}</div>
              )}

              {helperResult && (
                <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{helperResult.name}</h5>
                      <p className="text-[10px] text-slate-500">Category: {helperResult.type} • Pass ID: {helperResult.code}</p>
                    </div>
                    <span className="bg-white px-2 py-0.5 rounded text-[10px] border border-slate-200 font-bold">
                      {helperResult.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {helperResult.status === "Checked-Out" ? (
                      <button 
                        onClick={() => handleHelperAction("checkin", helperResult)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-xs"
                      >
                        BIOMETRIC ENTRY IN
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleHelperAction("checkout", helperResult)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded text-xs"
                      >
                        BIOMETRIC EXIT OUT
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Helper Live Directory List */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Premises Helper Directory Check-In Feed</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {staff.map(st => (
                  <div key={st.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{st.name}</h5>
                      <p className="text-[10px] text-slate-400">Type: {st.type} • Biometric ID: {st.code}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        st.status === "Checked-In" ? "bg-green-100 text-green-700 animate-pulse" : "bg-slate-100 text-slate-500"
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* GUARD TAB 4: SOS PANIC RECORD */}
        {/* ==================================== */}
        {activeTab === "sos" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Emergency SOS Dispatch Dispatch System</h4>
                <p className="text-[10px] text-slate-400">All live panic and distress alerts triggered within the Greenwood Heights perimeter.</p>
              </div>
              <button 
                onClick={() => {
                  const demoSOS = prompt("Enter custom Emergency Broadcast Message:");
                  if (demoSOS) onTriggerSOS(demoSOS, "Manual Alert");
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                + RECORD EMERGENCY
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">No active SOS alarms. Clear green status!</div>
              ) : (
                alerts.map((al) => (
                  <div key={al.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          {al.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(al.timestamp).toLocaleString()}</span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-xs mt-1.5">{al.message}</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Reported by: {al.sender}</p>
                    </div>
                    <div>
                      {al.status === "Active" ? (
                        <button 
                          onClick={() => onResolveAlert(al.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs whitespace-nowrap"
                        >
                          MARK RESOLVED / STAND DOWN
                        </button>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-bold uppercase">
                          Resolved & Cleared
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* GUARD TAB 5: INTERCOM & GATE APPROVALS */}
        {/* ==================================== */}
        {activeTab === "intercom" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Intercom Flat Directory (7/12 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Call Status Overlay (If Call is active) */}
              {activeCallFlat && (
                <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-700 shadow-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Greenwood Telephony Link</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {callStatus === "dialing" ? "DIALING..." : `CONNECTED • ${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, "0")}`}
                    </span>
                  </div>
                  
                  <div className="text-center py-4">
                    <PhoneCall className={`w-12 h-12 mx-auto text-indigo-400 ${callStatus === "dialing" ? "animate-bounce" : "animate-pulse"}`} />
                    <h5 className="font-bold text-lg mt-3">{activeCallFlat}</h5>
                    <p className="text-xs text-slate-300 font-medium">{flatResidents[activeCallFlat]?.name || "Resident"}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{flatResidents[activeCallFlat]?.phone}</p>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Telephony Audio Status</span>
                    <p className="text-xs text-slate-200 font-mono">
                      {callStatus === "dialing" ? "🔊 [Dial Tone Beep] Calling Resident App..." : "🎙️ [VOICE INTERCOM LIVE] Speak into tablet mic"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {callStatus === "connected" && (
                      <button
                        onClick={handleRequestApprovalFromCall}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> REQUEST GATE APPROVAL
                      </button>
                    )}
                    <button
                      onClick={handleEndCall}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs transition"
                    >
                      HANG UP / END CALL
                    </button>
                  </div>
                </div>
              )}

              {/* Flats Directory Search & Cards */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">📞 Resident Intercom Dialing Directory</h4>
                    <p className="text-[10px] text-slate-400">Search flat number or primary resident name to dial intercom</p>
                  </div>
                  
                  {/* Block Selectors */}
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1 self-start">
                    {(["ALL", "A", "B"] as const).map(bl => (
                      <button
                        key={bl}
                        onClick={() => setIntercomBlock(bl)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition ${intercomBlock === bl ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        Block {bl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={intercomSearch}
                    onChange={(e) => setIntercomSearch(e.target.value)}
                    placeholder="Search flat (e.g. 402, 105) or resident (e.g. Aarav, Priya)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* Directory list of flats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {Object.entries(flatResidents)
                    .filter(([flatNo, data]) => {
                      const matchesSearch = flatNo.toLowerCase().includes(intercomSearch.toLowerCase()) || 
                                            data.name.toLowerCase().includes(intercomSearch.toLowerCase());
                      const matchesBlock = intercomBlock === "ALL" || flatNo.startsWith(intercomBlock);
                      return matchesSearch && matchesBlock;
                    })
                    .map(([flatNo, resident]) => {
                      const isCallingThis = activeCallFlat === flatNo;
                      return (
                        <div 
                          key={flatNo} 
                          className={`p-3 rounded-lg border transition flex flex-col justify-between gap-3 ${
                            isCallingThis ? "border-indigo-500 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-block bg-slate-900 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                                Flat {flatNo}
                              </span>
                              <h5 className="font-bold text-slate-800 text-xs mt-1.5">{resident.name}</h5>
                              <p className="text-[9px] text-slate-500 mt-0.5">{resident.phone}</p>
                            </div>
                            
                            <span className={`w-2 h-2 rounded-full mt-1 ${resident.status === "Online" ? "bg-green-500" : "bg-slate-300"}`} title={resident.status} />
                          </div>

                          <button
                            onClick={() => handleInitiateCall(flatNo)}
                            disabled={!!activeCallFlat}
                            className={`w-full font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1 transition ${
                              activeCallFlat 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                          >
                            <Phone className="w-3 h-3" /> Dial Intercom
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right: Active Pending Approvals (5/12 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">⏳ Real-Time Gate Entry Approvals</h4>
                  <p className="text-[10px] text-slate-400">Monitor active visitor authorizations sent to resident smartphone applications</p>
                </div>

                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                      No pending app approvals at this moment.
                    </div>
                  ) : (
                    pendingApprovals.map(app => (
                      <div 
                        key={app.id} 
                        className={`p-4 rounded-xl border transition space-y-3.5 ${
                          app.status === "Approved" 
                            ? "border-green-200 bg-green-50/40" 
                            : app.status === "Rejected"
                              ? "border-red-200 bg-red-50/40"
                              : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block bg-slate-100 text-slate-700 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded mb-1">
                              {app.type.toUpperCase()} • {app.company}
                            </span>
                            <h5 className="font-bold text-slate-800 text-xs">{app.visitorName}</h5>
                            <p className="text-[10px] text-slate-500 font-medium">Destination: Flat {app.flat} ({app.hostName})</p>
                            {app.vehicleNumber && app.vehicleNumber !== "No Vehicle" && (
                              <p className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">
                                🚗 {app.vehicleNumber}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              app.status === "Approved" 
                                ? "bg-green-100 text-green-700"
                                : app.status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700 animate-pulse border border-amber-200"
                            }`}>
                              {app.status === "Waiting" ? "⏳ Waiting Approved" : app.status}
                            </span>
                          </div>
                        </div>

                        {/* Simulate Resident Action Buttons */}
                        {app.status === "Waiting" && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                            <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider text-center">
                              📱 SIMULATE RESIDENT MOBILE NOTIFICATION
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleSimulateResidentAction(app.id, "Approved")}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 rounded text-[10px] transition shadow-sm"
                              >
                                ✅ APPROVE ENTRY
                              </button>
                              <button
                                onClick={() => handleSimulateResidentAction(app.id, "Rejected")}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 rounded text-[10px] transition shadow-sm"
                              >
                                ❌ REJECT / BLOCK
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Guard Actions upon response */}
                        {app.status === "Approved" && (
                          <button
                            onClick={() => handleCheckInApprovedVisitor(app)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition animate-bounce"
                          >
                            <Check className="w-3.5 h-3.5" /> CONFIRM ENTRY & OPEN GATE BARRIER
                          </button>
                        )}

                        {app.status === "Rejected" && (
                          <div className="text-center p-2 bg-red-100/50 rounded-lg text-red-800 text-[10px] font-bold">
                            ⚠️ Access Blocked by Resident. Advise visitor to turn back.
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "securitydesk" && (
          <SecurityDesk />
        )}
      </div>
    </div>
  );
}
