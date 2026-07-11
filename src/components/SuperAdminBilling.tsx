import React, { useState } from "react";
import { 
  Building, CreditCard, Users, Plus, Trash2, CheckCircle, Clock, 
  Receipt, AlertTriangle, Send, ShieldCheck, DollarSign,
  Building2, MapPin, Layers, KeyRound, Shield, Sparkles, Trophy, 
  Briefcase, UserCheck, Award, Percent, Zap, FileText, Lock, 
  Brain, Cpu, UserPlus, Rocket, FileCheck, Check, ChevronRight, 
  ChevronLeft, Info, Globe, HelpCircle, Server, RefreshCw
} from "lucide-react";

interface SuperAdminBillingProps {
  societies: any[];
  plans: any[];
  settings: any;
  onExtendSubscription: (socId: string) => void;
  onSendRenewalReminder: (socId: string) => void;
  onTerminateTenant: (socId: string, name: string) => void;
  onUpgradePackage: (socId: string, planName: string) => void;
  onAddNewSociety: (newSoc: any) => void;
  onAddNewPlan: (newPlan: any) => void;
  onDeletePlan: (planId: string, name: string) => void;
  onGenerateInvoice: (socId: string, amount: number, desc: string) => void;
  onMarkInvoicePaid: (socId: string, invId: string) => void;
}

const ENTERPRISE_AMENITIES = [
  "Club House", "Swimming Pool", "Gym", "Garden", "Temple", "Jogging Track",
  "Tennis Court", "Basketball Court", "Badminton Court", "Children's Play Area",
  "Banquet Hall", "Guest Rooms", "Amphitheatre", "Skating Rink", "Supermarket",
  "Pharmacy", "Cafeteria", "Library", "EV Charging Station", "Solar Power Plant",
  "Sewage Treatment Plant", "Rainwater Harvesting", "Intercom Facility",
  "CCTV Surveillance", "Gas Pipeline", "Fire Fighting System", "Wi-Fi Zone",
  "Dog Park", "Yoga Deck", "Senior Citizen Corner"
];

const DEFAULT_STAFF_ROLES = [
  { role: "Security Guard (Day Shift)", count: 4, shiftTiming: "08:00 AM - 08:00 PM", supervisor: "Security Head" },
  { role: "Security Guard (Night Shift)", count: 4, shiftTiming: "08:00 PM - 08:00 AM", supervisor: "Security Head" },
  { role: "Security Supervisor", count: 1, shiftTiming: "12-Hour Rotating", supervisor: "Security Head" },
  { role: "CCTV Operator", count: 2, shiftTiming: "8-Hour Shifts", supervisor: "Security Head" },
  { role: "Facility Manager", count: 1, shiftTiming: "General Shift", supervisor: "RWA Management" },
  { role: "Electrician", count: 1, shiftTiming: "General Shift", supervisor: "Facility Manager" },
  { role: "Plumber", count: 1, shiftTiming: "General Shift", supervisor: "Facility Manager" },
  { role: "Gardener", count: 1, shiftTiming: "General Shift", supervisor: "Facility Manager" },
  { role: "Cleaning Staff", count: 6, shiftTiming: "General Shift", supervisor: "Facility Manager" },
  { role: "Lift Operator", count: 0, shiftTiming: "General Shift", supervisor: "Facility Manager" },
  { role: "Valet Driver", count: 0, shiftTiming: "General Shift", supervisor: "Facility Manager" }
];

const INITIAL_WIZARD_DATA = {
  // Step 1: Society Info
  name: "",
  type: "Apartment",
  regNumber: "REG-IND/2026/88921",
  gstNumber: "06AAACR1234F1Z1",
  reraNumber: "RERA-HR/2026/012",
  website: "www.mygatekarusociety.in",
  email: "contact@gatedsociety.com",
  phone: "+91 99999 88888",
  logoUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop&q=80",
  coverUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",

  // Step 2: Location
  country: "India",
  state: "Haryana",
  district: "Gurugram",
  city: "Gurugram",
  area: "Sector 56",
  pincode: "122011",
  address: "Sector 56, Golf Course Road, Gurugram, Haryana",
  googleMapsLink: "https://maps.google.com/?q=Sector+56+Gurugram",

  // Step 3: Building Configuration
  towerCount: 3,
  towers: [
    { name: "Tower Alpha", code: "TWR-A", floors: 12, flatsPerFloor: 4, lifts: 2, totalFlats: 48 },
    { name: "Tower Beta", code: "TWR-B", floors: 12, flatsPerFloor: 4, lifts: 2, totalFlats: 48 },
    { name: "Tower Gamma", code: "TWR-C", floors: 10, flatsPerFloor: 4, lifts: 2, totalFlats: 40 }
  ],
  totalFlatsCalculated: 136,

  // Step 4: Gates Configuration
  gates: [
    { name: "Main Gate North", type: "Main Gate", number: "G-1", securityCabin: true, boomBarrier: true, rfidReader: true, qrScanner: true, anprCamera: true },
    { name: "Service Gate South", type: "Service Gate", number: "G-2", securityCabin: true, boomBarrier: true, rfidReader: true, qrScanner: false, anprCamera: true },
    { name: "Emergency Gate East", type: "Emergency Gate", number: "G-3", securityCabin: false, boomBarrier: true, rfidReader: false, qrScanner: false, anprCamera: false },
    { name: "Visitor Gate West", type: "Visitor Gate", number: "G-4", securityCabin: true, boomBarrier: true, rfidReader: false, qrScanner: true, anprCamera: true },
    { name: "Loading Gate Yard", type: "Loading Gate", number: "G-5", securityCabin: true, boomBarrier: false, rfidReader: false, qrScanner: false, anprCamera: false }
  ],

  // Step 5: Amenities
  selectedAmenities: ["Club House", "Swimming Pool", "Gym", "Garden", "CCTV Surveillance", "Fire Fighting System", "EV Charging Station"],

  // Step 6: Staff Requirement
  staff: DEFAULT_STAFF_ROLES,

  // Step 7: Committee Members
  committee: {
    president: { name: "Rajesh Malhotra", phone: "+91 98112 34567", email: "president@gatedsociety.com", flat: "Alpha-1201" },
    vicePresident: { name: "Anjali Deshmukh", phone: "+91 98765 43210", email: "vp@gatedsociety.com", flat: "Beta-1002" },
    secretary: { name: "Sanjay Kumar", phone: "+91 99999 88888", email: "secretary@gatedsociety.com", flat: "Gamma-504" },
    jointSecretary: { name: "Vikram Sethi", phone: "+91 95555 44444", email: "joint.sec@gatedsociety.com", flat: "Alpha-402" },
    treasurer: { name: "Nitin Mehra", phone: "+91 91111 22222", email: "treasurer@gatedsociety.com", flat: "Beta-801" },
    jointTreasurer: { name: "Priya Sharma", phone: "+91 93333 44444", email: "joint.treas@gatedsociety.com", flat: "Gamma-302" },
    executiveMembers: [
      { name: "Kunal Kapoor", phone: "+91 92222 33333", email: "member1@gatedsociety.com", flat: "Alpha-101" },
      { name: "Sunita Sen", phone: "+91 94444 55555", email: "member2@gatedsociety.com", flat: "Beta-202" },
      { name: "Rohan Roy", phone: "+91 96666 77777", email: "member3@gatedsociety.com", flat: "Gamma-103" }
    ]
  },

  // Step 8: Subscription Config
  planName: "", 
  billingCycle: "Yearly",
  couponCode: "GATEKARU_SAAS_50",
  couponDiscountPercent: 50,
  couponApplied: true,

  // Step 9: Billing Details
  companyName: "RWA Gated Community Association",
  companyAddress: "Sector 56, Golf Course Road, Gurugram, Haryana",
  panNumber: "AAACR1234F",
  gstin: "06AAACR1234F1Z1",
  sacCode: "998311",
  paymentTerms: "Net 15",
  bankName: "HDFC Bank Ltd.",
  beneficiaryName: "GateKaru ERP Solutions",
  accountNumber: "50200088921132",
  ifscCode: "HDFC0000240",

  // Step 10: AI Configuration
  aiSmartNotice: true,
  aiAnpr: true,
  aiVisitorApproval: true,
  aiFacialRecognition: true,
  aiChatbot: true,
  aiPaymentPredictor: true,
  aiAudioAnomaly: false,
  aiWasteClassification: false,
  aiPromptFineTune: "You are the AI Gated Concierge of Gated Society Pod, an ultra-premium residential complex. Act as an assistant to security staff and committee members.",

  // Step 11: Demo Data Setup
  demoResidents: true,
  demoGuards: true,
  demoCommittee: true,
  demoVisitorLogs: true,
  demoTickets: true,
  demoPassword: "GateKaru@123"
};

// Re-use countdown timer with high-tech styles
function SubscriptionCountdown({ expiresAt, simulatedDate }: { expiresAt: string, simulatedDate: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const expDate = new Date(`${expiresAt}T00:00:00`);
      const simDateMidnight = new Date(`${simulatedDate || "2026-07-08"}T00:00:00`);
      
      const now = new Date();
      const currentDayOffsetMs = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();
      
      const simulatedNowMs = simDateMidnight.getTime() + currentDayOffsetMs;
      const diffMs = expDate.getTime() - simulatedNowMs;
      return Math.max(0, Math.floor(diffMs / 1000));
    };

    setSecondsLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setSecondsLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, simulatedDate]);

  if (secondsLeft <= 0) {
    return (
      <span className="font-mono text-red-400 font-extrabold text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded animate-pulse inline-flex items-center gap-1">
        ⌛ EXPIRED
      </span>
    );
  }

  const days = Math.floor(secondsLeft / (3600 * 24));
  const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="font-mono text-[10.5px] font-bold text-indigo-300 flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/30 p-1 rounded-md max-w-fit">
      <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
      <span className="bg-indigo-500/20 text-indigo-400 px-1 rounded font-black">{days}d</span>
      <span className="text-slate-600">:</span>
      <span className="bg-slate-900 text-slate-300 px-1 rounded">{pad(hours)}h</span>
      <span className="text-slate-600">:</span>
      <span className="bg-slate-900 text-slate-300 px-1 rounded">{pad(minutes)}m</span>
      <span className="text-slate-600">:</span>
      <span className="bg-slate-900 text-indigo-400 font-black px-1 rounded w-[18px] inline-block text-center">{pad(secs)}s</span>
    </div>
  );
}

export default function SuperAdminBilling({
  societies,
  plans,
  settings,
  onExtendSubscription,
  onSendRenewalReminder,
  onTerminateTenant,
  onUpgradePackage,
  onAddNewSociety,
  onAddNewPlan,
  onDeletePlan,
  onGenerateInvoice,
  onMarkInvoicePaid
}: SuperAdminBillingProps) {
  
  // Tab within billing/plans
  const [subTab, setSubTab] = useState<"subscriptions" | "plans" | "ledger">("subscriptions");

  // New Society local state (maintained for backwards compatibility / simple flows)
  const [newSocName, setNewSocName] = useState("");
  const [newSocAddr, setNewSocAddr] = useState("");
  const [newSocPlan, setNewSocPlan] = useState(plans[0]?.name || "GateKaru Essential");
  const [newSocFlats, setNewSocFlats] = useState(120);
  const [newSocContactName, setNewSocContactName] = useState("");
  const [newSocContactPhone, setNewSocContactPhone] = useState("");
  const [newSocContactEmail, setNewSocContactEmail] = useState("");
  const [showAddSocForm, setShowAddSocForm] = useState(false);

  // 12-Step Enterprise Onboarding Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardNotification, setWizardNotification] = useState<string | null>(null);
  const [wizardData, setWizardData] = useState(() => ({
    ...INITIAL_WIZARD_DATA,
    planName: plans[0]?.name || "GateKaru Essential"
  }));

  const showWizardNotification = (msg: string) => {
    setWizardNotification(msg);
    setTimeout(() => {
      setWizardNotification(null);
    }, 4000);
  };

  const handleUpdateWizardField = (field: string, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateNestedField = (parent: string, child: string, value: any) => {
    setWizardData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [child]: value
      }
    }));
  };

  const handleTowerCountChange = (count: number) => {
    const newTowers = Array.from({ length: count }, (_, i) => {
      const char = String.fromCharCode(65 + i);
      return {
        name: `Tower ${char}`,
        code: `TWR-${char}`,
        floors: 12,
        flatsPerFloor: 4,
        lifts: 2,
        totalFlats: 48
      };
    });
    const totalFlats = newTowers.reduce((sum, t) => sum + t.totalFlats, 0);
    setWizardData(prev => ({
      ...prev,
      towerCount: count,
      towers: newTowers,
      totalFlatsCalculated: totalFlats
    }));
  };

  const handleTowerFieldChange = (index: number, field: string, value: any) => {
    const updatedTowers = wizardData.towers.map((t, idx) => {
      if (idx !== index) return t;
      const updated = { ...t, [field]: value };
      if (field === "floors" || field === "flatsPerFloor") {
        updated.totalFlats = Number(updated.floors || 0) * Number(updated.flatsPerFloor || 0);
      }
      return updated;
    });
    const totalFlats = updatedTowers.reduce((sum, t) => sum + (t.totalFlats || 0), 0);
    setWizardData(prev => ({
      ...prev,
      towers: updatedTowers,
      totalFlatsCalculated: totalFlats
    }));
  };

  const handleSubmitWizardSociety = () => {
    if (!wizardData.name) {
      showWizardNotification("⚠️ Validation Error: Society Name is required in Step 1.");
      setWizardStep(1);
      return;
    }
    if (!wizardData.address) {
      showWizardNotification("⚠️ Validation Error: Full Address is required in Step 2.");
      setWizardStep(2);
      return;
    }

    // Submit using the expected onAddNewSociety prop mapping
    onAddNewSociety({
      name: wizardData.name,
      address: wizardData.address,
      plan: wizardData.planName,
      flatsCount: Number(wizardData.totalFlatsCalculated),
      contactName: `${wizardData.committee.secretary.name} (Secretary)`,
      contactPhone: wizardData.committee.secretary.phone,
      contactEmail: wizardData.committee.secretary.email
    });

    // Reset wizard
    setWizardStep(1);
    setWizardData({
      ...INITIAL_WIZARD_DATA,
      planName: plans[0]?.name || "GateKaru Essential"
    });
    setShowAddSocForm(false);
    alert(`🎉 Enterprise Node for "${wizardData.name}" has been successfully provisioned on GateKaru secure cloud infrastructure!\n\nCheck the partition table below to inspect status metrics.`);
  };

  // New Plan local state
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState(2500);
  const [newPlanPeriod, setNewPlanPeriod] = useState("Monthly");
  const [newPlanFeatures, setNewPlanFeatures] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);

  // New Custom invoice manual generator state
  const [selectedInvoiceSoc, setSelectedInvoiceSoc] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(1500);
  const [invoiceDesc, setInvoiceDesc] = useState("Manual custom security ledger charge");

  // Helper to compute remaining days relative to simulated date
  const getDaysRemainingInfo = (expiresAtStr: string) => {
    const simDate = new Date(settings.simulatedDate || "2026-07-08");
    const expDate = new Date(expiresAtStr);
    
    simDate.setHours(0,0,0,0);
    expDate.setHours(0,0,0,0);
    
    const diffTime = expDate.getTime() - simDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      isExpired: diffDays < 0,
      isExpiringSoon: diffDays >= 0 && diffDays <= 7
    };
  };

  const handleCreateSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocName || !newSocAddr) return;

    onAddNewSociety({
      name: newSocName,
      address: newSocAddr,
      plan: newSocPlan,
      flatsCount: Number(newSocFlats),
      contactName: newSocContactName,
      contactPhone: newSocContactPhone,
      contactEmail: newSocContactEmail
    });

    setNewSocName("");
    setNewSocAddr("");
    setNewSocContactName("");
    setNewSocContactPhone("");
    setNewSocContactEmail("");
    setShowAddSocForm(false);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanFeatures) return;

    onAddNewPlan({
      name: newPlanName,
      price: Number(newPlanPrice),
      period: newPlanPeriod,
      features: newPlanFeatures,
      desc: newPlanDesc
    });

    setNewPlanName("");
    setNewPlanFeatures("");
    setNewPlanDesc("");
    setShowAddPlanForm(false);
  };

  const handleInvoiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceSoc) {
      alert("Please select a target society!");
      return;
    }
    onGenerateInvoice(selectedInvoiceSoc, Number(invoiceAmount), invoiceDesc);
    setInvoiceDesc("Manual custom security ledger charge");
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Intro Header */}
      <div className="border-b border-[#1e295d] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-400" /> Subscription & Financial Handshake
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Tenant Billing Console</h2>
          <p className="text-xs text-slate-400">Configure corporate pricing tiers, audit manual invoice ledgers, upgrade active society memberships, and monitor renewal countdowns.</p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="bg-[#11193d] border border-[#23357a] p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSubTab("subscriptions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition tracking-wider ${subTab === "subscriptions" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Societies
          </button>
          <button
            type="button"
            onClick={() => setSubTab("plans")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition tracking-wider ${subTab === "plans" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Pricing Matrix
          </button>
          <button
            type="button"
            onClick={() => setSubTab("ledger")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition tracking-wider ${subTab === "ledger" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Ledger & Billing
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SECTION 1: SUBSCRIPTIONS OVERVIEW (Required table) */}
      {/* ======================================================= */}
      {subTab === "subscriptions" && (
        <div className="space-y-6">
          
          {/* Quick Actions and Add Society Form */}
          <div className="flex justify-between items-center bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400">Active Society Partition Directory</span>
              <p className="text-xs text-slate-300">Live monitoring of tenant active society subscription plans, user registrations, and real-time countdown timers.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSocForm(!showAddSocForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider py-2 px-4 rounded-xl shadow transition"
            >
              {showAddSocForm ? "Close Form" : "➕ Onboard New Society"}
            </button>
          </div>

          {showAddSocForm && (
            <div className="bg-[#0b1029]/90 border border-[#21326d] rounded-2xl p-5 md:p-6 animate-slideIn space-y-6">
              
              {/* Wizard Heading */}
              <div className="border-b border-[#21326d] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> GATEKARU ENTERPRISE ONBOARDING ENGINE
                  </span>
                  <h4 className="font-extrabold text-white text-lg tracking-tight">🏢 Onboarding Gated Society Pod</h4>
                  <p className="text-xs text-slate-400">Configure core virtual infrastructure partition, IoT security hardware, staff ratios, and RWA committee ledger.</p>
                </div>
                <div className="bg-slate-900/60 border border-[#1d2a5f] p-2 rounded-xl text-right min-w-[140px]">
                  <span className="text-[9px] uppercase font-black text-indigo-400 block">Completeness</span>
                  <span className="text-sm font-black text-white font-mono">{Math.round((wizardStep / 12) * 100)}%</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${(wizardStep / 12) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Temp Alert Notification Widget */}
              {wizardNotification && (
                <div className="bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>{wizardNotification}</span>
                </div>
              )}

              {/* Wizard Panel Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Vertical Progress Rail (3/12 columns) */}
                <div className="lg:col-span-3 bg-slate-950/50 border border-[#1b2b5f] rounded-xl p-3 space-y-1.5 max-h-[580px] overflow-y-auto custom-scrollbar">
                  {[
                    { num: 1, title: "Society Info", icon: Building2 },
                    { num: 2, title: "Location", icon: MapPin },
                    { num: 3, title: "Building Config", icon: Layers },
                    { num: 4, title: "Gates & Hardware", icon: KeyRound },
                    { num: 5, title: "Amenities Grid", icon: Sparkles },
                    { num: 6, title: "Staff Allocations", icon: Briefcase },
                    { num: 7, title: "RWA Committee", icon: UserCheck },
                    { num: 8, title: "Subscription Tier", icon: Percent },
                    { num: 9, title: "Bank & Billing", icon: FileText },
                    { num: 10, title: "AI Core Engines", icon: Brain },
                    { num: 11, title: "Demo Seed Data", icon: Cpu },
                    { num: 12, title: "Orchestration", icon: Rocket }
                  ].map((s) => {
                    const IconComp = s.icon;
                    const isActive = wizardStep === s.num;
                    const isCompleted = wizardStep > s.num;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => setWizardStep(s.num)}
                        className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
                          isActive 
                            ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow shadow-indigo-500/10" 
                            : isCompleted 
                              ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-400 hover:bg-slate-900/40" 
                              : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                            isActive 
                              ? "bg-indigo-600 text-white" 
                              : isCompleted 
                                ? "bg-emerald-600/20 text-emerald-400" 
                                : "bg-slate-800 text-slate-500"
                          }`}>
                            {isCompleted ? "✓" : s.num}
                          </span>
                          <span className="truncate max-w-[120px]">{s.title}</span>
                        </div>
                        <IconComp className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-indigo-400" : isCompleted ? "text-emerald-400" : "text-slate-600"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Step Content Area (9/12 columns) */}
                <div className="lg:col-span-9 bg-slate-950/20 border border-[#1b2b5f] rounded-xl p-5 min-h-[420px] flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    
                    {/* STEP 1: SOCIETY INFORMATION */}
                    {wizardStep === 1 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-indigo-400" /> STEP 1: Society Info & Core Metadata
                          </h5>
                          <p className="text-[10px] text-slate-400">Specify corporate entity names, branding assets, and external registry validations.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Society Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Maple Leaf Premium Township" 
                              value={wizardData.name}
                              onChange={(e) => handleUpdateWizardField("name", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Society Type</label>
                            <select
                              value={wizardData.type}
                              onChange={(e) => handleUpdateWizardField("type", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                            >
                              <option value="Apartment">Apartment Complex</option>
                              <option value="Villa">Villa Gated Community</option>
                              <option value="Cooperative">Cooperative Housing Society</option>
                              <option value="Commercial">Commercial Gated Complex</option>
                            </select>
                          </div>
                        </div>

                        {/* Society Logo & Cover preset triggers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Choose Brand Logo Preset</label>
                            <div className="flex gap-2 items-center">
                              <img src={wizardData.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg border border-indigo-500 bg-indigo-950 p-1 object-cover" referrerPolicy="no-referrer" />
                              <div className="grid grid-cols-4 gap-1">
                                {[
                                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=120&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1422490987114-f4548a60965e?w=120&auto=format&fit=crop&q=80"
                                ].map((url, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleUpdateWizardField("logoUrl", url)}
                                    className={`w-7 h-7 rounded overflow-hidden border ${wizardData.logoUrl === url ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-800"}`}
                                  >
                                    <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Choose Cover Image Preset</label>
                            <div className="flex gap-2 items-center">
                              <img src={wizardData.coverUrl} alt="Cover" className="w-14 h-8 rounded border border-indigo-500 bg-indigo-950 object-cover" referrerPolicy="no-referrer" />
                              <div className="grid grid-cols-4 gap-1">
                                {[
                                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1464146072230-91cabc268266?w=800&auto=format&fit=crop&q=80"
                                ].map((url, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleUpdateWizardField("coverUrl", url)}
                                    className={`w-8 h-6 rounded overflow-hidden border ${wizardData.coverUrl === url ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-800"}`}
                                  >
                                    <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Registration No.</label>
                            <input 
                              type="text" 
                              value={wizardData.regNumber}
                              onChange={(e) => handleUpdateWizardField("regNumber", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">GSTIN (Optional)</label>
                            <input 
                              type="text" 
                              value={wizardData.gstNumber}
                              onChange={(e) => handleUpdateWizardField("gstNumber", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">RERA Number</label>
                            <input 
                              type="text" 
                              value={wizardData.reraNumber}
                              onChange={(e) => handleUpdateWizardField("reraNumber", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Website URL</label>
                            <input 
                              type="text" 
                              value={wizardData.website}
                              onChange={(e) => handleUpdateWizardField("website", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Society Email</label>
                            <input 
                              type="email" 
                              value={wizardData.email}
                              onChange={(e) => handleUpdateWizardField("email", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Primary Phone</label>
                            <input 
                              type="text" 
                              value={wizardData.phone}
                              onChange={(e) => handleUpdateWizardField("phone", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: LOCATION */}
                    {wizardStep === 2 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-indigo-400" /> STEP 2: Location Topology & Geofencing
                          </h5>
                          <p className="text-[10px] text-slate-400">Plot physical coordinates, regional taxation areas, and geocoded Google maps links.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Country</label>
                            <input 
                              type="text" 
                              value={wizardData.country}
                              onChange={(e) => handleUpdateWizardField("country", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">State</label>
                            <input 
                              type="text" 
                              value={wizardData.state}
                              onChange={(e) => handleUpdateWizardField("state", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">District</label>
                            <input 
                              type="text" 
                              value={wizardData.district}
                              onChange={(e) => handleUpdateWizardField("district", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">City</label>
                            <input 
                              type="text" 
                              value={wizardData.city}
                              onChange={(e) => handleUpdateWizardField("city", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Area / Sector</label>
                            <input 
                              type="text" 
                              value={wizardData.area}
                              onChange={(e) => handleUpdateWizardField("area", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Pincode *</label>
                            <input 
                              type="text" 
                              value={wizardData.pincode}
                              onChange={(e) => handleUpdateWizardField("pincode", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase">Full Address *</label>
                          <textarea 
                            value={wizardData.address}
                            onChange={(e) => handleUpdateWizardField("address", e.target.value)}
                            rows={2}
                            placeholder="Full physical address..."
                            className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none font-medium resize-none"
                          />
                        </div>

                        <div className="space-y-1.5 bg-[#0a0f28] border border-indigo-950 p-3 rounded-xl">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block">🛰️ Geocoded Google Maps Location Link</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={wizardData.googleMapsLink}
                              onChange={(e) => handleUpdateWizardField("googleMapsLink", e.target.value)}
                              className="flex-1 bg-[#030616] border border-[#21326d] rounded-lg p-2 text-white text-[11px] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => showWizardNotification("🗺️ Google Maps API geolocated! Lat: 28.4312, Lng: 77.0984. Signal locked.")}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-3 rounded-lg uppercase font-black"
                            >
                              Verify GPS
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono italic">GPS status: Verified and binded with regional municipal boundaries.</p>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: BUILDING CONFIGURATION */}
                    {wizardStep === 3 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-indigo-400" /> STEP 3: Building & Wings Topology
                          </h5>
                          <p className="text-[10px] text-slate-400">Auto-generate floors, flats-per-floor, and calculate total apartments across towers.</p>
                        </div>

                        <div className="flex justify-between items-center bg-[#0d143c] border border-indigo-950 p-3 rounded-xl">
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-indigo-400 font-black uppercase block">Number of Towers / Wings</label>
                            <span className="text-[10px] text-slate-400 block font-medium">Selecting changes auto-regenerates below rows.</span>
                          </div>
                          <select
                            value={wizardData.towerCount}
                            onChange={(e) => handleTowerCountChange(Number(e.target.value))}
                            className="bg-[#030616] border border-[#21326d] rounded-lg p-2 text-white text-xs font-black w-24"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>{n} Towers</option>
                            ))}
                          </select>
                        </div>

                        {/* Towers List Table */}
                        <div className="bg-[#05081a]/60 border border-indigo-950 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto max-h-[220px] custom-scrollbar">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-[#070b20] text-[9px] text-slate-400 font-black border-b border-indigo-900/40 uppercase tracking-widest">
                                  <th className="px-4 py-2">Tower Name</th>
                                  <th className="px-4 py-2">Code</th>
                                  <th className="px-4 py-2">Floors</th>
                                  <th className="px-4 py-2">Flats/Floor</th>
                                  <th className="px-4 py-2">Lifts Count</th>
                                  <th className="px-4 py-2 text-right">Total Flats</th>
                                </tr>
                              </thead>
                              <tbody className="text-[11px] divide-y divide-indigo-950">
                                {wizardData.towers.map((t, idx) => (
                                  <tr key={idx} className="hover:bg-indigo-950/20">
                                    <td className="px-4 py-2">
                                      <input 
                                        type="text" 
                                        value={t.name}
                                        onChange={(e) => handleTowerFieldChange(idx, "name", e.target.value)}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-1 text-white w-28 text-[11px]"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        type="text" 
                                        value={t.code}
                                        onChange={(e) => handleTowerFieldChange(idx, "code", e.target.value)}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-1 text-white w-20 text-[11px] font-mono font-bold"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        type="number" 
                                        value={t.floors}
                                        onChange={(e) => handleTowerFieldChange(idx, "floors", Number(e.target.value))}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-1 text-white w-14 text-[11px] font-mono text-center"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        type="number" 
                                        value={t.flatsPerFloor}
                                        onChange={(e) => handleTowerFieldChange(idx, "flatsPerFloor", Number(e.target.value))}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-1 text-white w-14 text-[11px] font-mono text-center"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        type="number" 
                                        value={t.lifts}
                                        onChange={(e) => handleTowerFieldChange(idx, "lifts", Number(e.target.value))}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-1 text-white w-14 text-[11px] font-mono text-center"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-right font-black text-indigo-300 font-mono">{t.totalFlats}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Summary Metric Display */}
                        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-3 flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Sum total capacity:</span>
                          <span className="font-mono font-black text-white bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-1 rounded">
                            📊 {wizardData.totalFlatsCalculated} Gated Apartments
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: GATES CONFIGURATION */}
                    {wizardStep === 4 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-indigo-400" /> STEP 4: Smart Gate & Barrier IoT Hub
                          </h5>
                          <p className="text-[10px] text-slate-400">Install virtual terminals for automated barriers, QR reader protocols, and RFID checkpoints.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar p-0.5">
                          {wizardData.gates.map((g, idx) => (
                            <div key={idx} className="bg-[#070c26] border border-[#1f2f6a] p-3.5 rounded-xl space-y-3 shadow">
                              <div className="flex justify-between items-start border-b border-indigo-950 pb-1.5">
                                <div>
                                  <span className="text-[8.5px] uppercase font-black tracking-wider text-indigo-400 block">{g.type}</span>
                                  <input 
                                    type="text" 
                                    value={g.name} 
                                    onChange={(e) => {
                                      const updated = [...wizardData.gates];
                                      updated[idx].name = e.target.value;
                                      handleUpdateWizardField("gates", updated);
                                    }}
                                    className="bg-transparent border-b border-transparent hover:border-indigo-500 font-extrabold text-white text-xs focus:outline-none"
                                  />
                                </div>
                                <span className="bg-[#0f1945] px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 font-black border border-indigo-900/30">
                                  No. {g.number}
                                </span>
                              </div>

                              {/* IoT Switches */}
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                                {[
                                  { label: "Security Cabin", field: "securityCabin" },
                                  { label: "Boom Barrier", field: "boomBarrier" },
                                  { label: "RFID Reader", field: "rfidReader" },
                                  { label: "QR Scanner", field: "qrScanner" },
                                  { label: "ANPR Camera", field: "anprCamera" }
                                ].map((sw) => (
                                  <label key={sw.field} className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-indigo-950/20">
                                    <span className="text-slate-400 font-semibold">{sw.label}</span>
                                    <input 
                                      type="checkbox"
                                      checked={!!g[sw.field as keyof typeof g]}
                                      onChange={(e) => {
                                        const updated = [...wizardData.gates];
                                        (updated[idx] as any)[sw.field] = e.target.checked;
                                        handleUpdateWizardField("gates", updated);
                                      }}
                                      className="accent-indigo-600 rounded cursor-pointer w-3.5 h-3.5"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: AMENITIES GRID */}
                    {wizardStep === 5 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-400" /> STEP 5: Premium Amenities Catalog
                          </h5>
                          <p className="text-[10px] text-slate-400">Activate RWA booking permissions and ledger rules for physical society assets.</p>
                        </div>

                        <div className="flex justify-between items-center text-xs border-b border-indigo-950 pb-2">
                          <span className="text-indigo-300 font-black font-mono">
                            🌟 {wizardData.selectedAmenities.length} of 30 amenities enabled
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateWizardField("selectedAmenities", ENTERPRISE_AMENITIES)}
                              className="text-[9px] bg-indigo-950 border border-indigo-800 text-indigo-300 px-2.5 py-1 rounded-md uppercase font-extrabold hover:bg-indigo-900 transition"
                            >
                              Toggle All
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateWizardField("selectedAmenities", [])}
                              className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md uppercase font-extrabold hover:bg-slate-800 transition"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Large Grid of checkboxes */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                          {ENTERPRISE_AMENITIES.map((am) => {
                            const isChecked = wizardData.selectedAmenities.includes(am);
                            return (
                              <label
                                key={am}
                                className={`flex items-center gap-2 p-2 rounded-xl text-[10.5px] font-bold border transition cursor-pointer ${
                                  isChecked 
                                    ? "bg-indigo-950/30 border-indigo-500/40 text-indigo-300" 
                                    : "bg-[#040718] border-indigo-950 text-slate-400 hover:border-slate-800"
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = e.target.checked 
                                      ? [...wizardData.selectedAmenities, am]
                                      : wizardData.selectedAmenities.filter(item => item !== am);
                                    handleUpdateWizardField("selectedAmenities", updated);
                                  }}
                                  className="accent-indigo-600 rounded"
                                />
                                <span className="truncate">{am}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 6: STAFF REQUIREMENT */}
                    {wizardStep === 6 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-indigo-400" /> STEP 6: Security & Facility Staff Allocation
                          </h5>
                          <p className="text-[10px] text-slate-400">Configure standard labor deployments, duty shifts, and supervisor command.</p>
                        </div>

                        <div className="bg-[#05081a]/60 border border-indigo-950 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto max-h-[240px] custom-scrollbar">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-[#070b20] text-[9.5px] text-slate-400 font-black border-b border-indigo-900/40 uppercase tracking-widest">
                                  <th className="px-4 py-2">Facility Role</th>
                                  <th className="px-4 py-2 text-center">Required Count</th>
                                  <th className="px-4 py-2">Shift Timing</th>
                                  <th className="px-4 py-2">Supervisor Command</th>
                                </tr>
                              </thead>
                              <tbody className="text-[11px] divide-y divide-indigo-950">
                                {wizardData.staff.map((st, idx) => (
                                  <tr key={idx} className="hover:bg-indigo-950/15">
                                    <td className="px-4 py-2 font-bold text-white truncate max-w-[150px]">{st.role}</td>
                                    <td className="px-4 py-2">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...wizardData.staff];
                                            updated[idx].count = Math.max(0, updated[idx].count - 1);
                                            handleUpdateWizardField("staff", updated);
                                          }}
                                          className="w-5 h-5 bg-indigo-950 border border-indigo-900 text-indigo-400 hover:bg-indigo-900 rounded font-black flex items-center justify-center text-xs"
                                        >
                                          -
                                        </button>
                                        <span className="font-mono text-xs font-black text-indigo-300 text-center w-6">{st.count}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...wizardData.staff];
                                            updated[idx].count = updated[idx].count + 1;
                                            handleUpdateWizardField("staff", updated);
                                          }}
                                          className="w-5 h-5 bg-indigo-950 border border-indigo-900 text-indigo-400 hover:bg-indigo-900 rounded font-black flex items-center justify-center text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        type="text" 
                                        value={st.shiftTiming}
                                        onChange={(e) => {
                                          const updated = [...wizardData.staff];
                                          updated[idx].shiftTiming = e.target.value;
                                          handleUpdateWizardField("staff", updated);
                                        }}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-0.5 text-slate-300 w-32 text-[10.5px]"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        type="text" 
                                        value={st.supervisor}
                                        onChange={(e) => {
                                          const updated = [...wizardData.staff];
                                          updated[idx].supervisor = e.target.value;
                                          handleUpdateWizardField("staff", updated);
                                        }}
                                        className="bg-[#030616]/60 border border-indigo-900/35 rounded px-2 py-0.5 text-slate-300 w-32 text-[10.5px]"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 7: RWA COMMITTEE MEMBERS */}
                    {wizardStep === 7 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-indigo-400" /> STEP 7: RWA Committee Assignments
                          </h5>
                          <p className="text-[10px] text-slate-400">Designate official community administrators, financial treasurers and board delegates.</p>
                        </div>

                        {/* Committee Officers Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-h-[250px] overflow-y-auto custom-scrollbar p-0.5">
                          {[
                            { label: "President", key: "president" },
                            { label: "Vice President", key: "vicePresident" },
                            { label: "Secretary", key: "secretary" },
                            { label: "Joint Secretary", key: "jointSecretary" },
                            { label: "Treasurer", key: "treasurer" },
                            { label: "Joint Treasurer", key: "jointTreasurer" }
                          ].map((role) => {
                            const val = (wizardData.committee as any)[role.key] || { name: "", phone: "", email: "", flat: "" };
                            return (
                              <div key={role.key} className="bg-[#060a22] border border-[#1f2f6a] p-3 rounded-xl space-y-2">
                                <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 block border-b border-indigo-950 pb-1">{role.label}</span>
                                <div className="space-y-1.5 text-[10px]">
                                  <input 
                                    type="text" 
                                    placeholder="Full Name"
                                    value={val.name}
                                    onChange={(e) => {
                                      const updatedCom = { ...wizardData.committee };
                                      (updatedCom as any)[role.key].name = e.target.value;
                                      handleUpdateWizardField("committee", updatedCom);
                                    }}
                                    className="w-full bg-[#030616] border border-[#21326d] rounded-lg p-1.5 text-white"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Phone"
                                    value={val.phone}
                                    onChange={(e) => {
                                      const updatedCom = { ...wizardData.committee };
                                      (updatedCom as any)[role.key].phone = e.target.value;
                                      handleUpdateWizardField("committee", updatedCom);
                                    }}
                                    className="w-full bg-[#030616] border border-[#21326d] rounded-lg p-1.5 text-white font-mono"
                                  />
                                  <input 
                                    type="email" 
                                    placeholder="Email"
                                    value={val.email}
                                    onChange={(e) => {
                                      const updatedCom = { ...wizardData.committee };
                                      (updatedCom as any)[role.key].email = e.target.value;
                                      handleUpdateWizardField("committee", updatedCom);
                                    }}
                                    className="w-full bg-[#030616] border border-[#21326d] rounded-lg p-1.5 text-white font-medium"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Flat No (e.g. A-1201)"
                                    value={val.flat}
                                    onChange={(e) => {
                                      const updatedCom = { ...wizardData.committee };
                                      (updatedCom as any)[role.key].flat = e.target.value;
                                      handleUpdateWizardField("committee", updatedCom);
                                    }}
                                    className="w-full bg-[#030616] border border-[#21326d] rounded-lg p-1.5 text-white font-semibold"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 8: SUBSCRIPTION CONFIG */}
                    {wizardStep === 8 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Percent className="w-4 h-4 text-indigo-400" /> STEP 8: Subscription Configuration & Coupons
                          </h5>
                          <p className="text-[10px] text-slate-400">Map society database size with standard pricing plans, discounts, and billing cycles.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Platform Plan Tier</label>
                            <select
                              value={wizardData.planName}
                              onChange={(e) => handleUpdateWizardField("planName", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                            >
                              {plans.map(p => (
                                <option key={p.id} value={p.name}>{p.name} (Base: ₹{p.price}/{p.period === "Yearly" ? "yr" : "mo"})</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Billing Multiplier Term</label>
                            <select
                              value={wizardData.billingCycle}
                              onChange={(e) => handleUpdateWizardField("billingCycle", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
                            >
                              <option value="Monthly">Monthly Cycle</option>
                              <option value="Quarterly">Quarterly Cycle (3 mos)</option>
                              <option value="Half-Yearly">Half-Yearly Cycle (6 mos)</option>
                              <option value="Yearly">Yearly Cycle (12 mos - 20% Discount!)</option>
                            </select>
                          </div>
                        </div>

                        {/* Pricing auto-calculates */}
                        {(() => {
                          const matched = plans.find(p => p.name === wizardData.planName);
                          const planPrice = matched ? matched.price : 1500;
                          
                          // Custom math: base plan price + ₹15 per flat/month
                          const flatRate = 15;
                          const monthlyBase = planPrice + (wizardData.totalFlatsCalculated * flatRate);
                          
                          let months = 1;
                          let termDiscountPercent = 0;
                          if (wizardData.billingCycle === "Quarterly") months = 3;
                          else if (wizardData.billingCycle === "Half-Yearly") months = 6;
                          else if (wizardData.billingCycle === "Yearly") {
                            months = 12;
                            termDiscountPercent = 20; // 20% off for annual contract
                          }

                          const grossSub = monthlyBase * months;
                          const termDiscount = Math.round(grossSub * (termDiscountPercent / 100));
                          const couponDiscount = wizardData.couponApplied ? Math.round((grossSub - termDiscount) * (wizardData.couponDiscountPercent / 100)) : 0;
                          
                          const subtotal = grossSub - termDiscount - couponDiscount;
                          const gst = Math.round(subtotal * 0.18);
                          const totalNet = subtotal + gst;

                          return (
                            <div className="bg-[#05081b]/80 border border-indigo-950 p-4 rounded-xl space-y-2 text-xs">
                              <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 block border-b border-indigo-900/30 pb-1">Dynamic Corporate Fee Summary</span>
                              
                              <div className="grid grid-cols-2 gap-y-1 font-semibold text-[11px] text-slate-300">
                                <span>Platform License Price (Base):</span>
                                <span className="text-right font-mono">₹{planPrice.toLocaleString()} / mo</span>
                                
                                <span>Variable Charge (₹15 × {wizardData.totalFlatsCalculated} Flats):</span>
                                <span className="text-right font-mono">₹{(wizardData.totalFlatsCalculated * flatRate).toLocaleString()} / mo</span>
                                
                                <span>Gross Contract Total ({months} mos):</span>
                                <span className="text-right font-mono">₹{grossSub.toLocaleString()}</span>

                                {termDiscountPercent > 0 && (
                                  <>
                                    <span className="text-emerald-400">Annual Contract Reduction ({termDiscountPercent}%):</span>
                                    <span className="text-right font-mono text-emerald-400">-₹{termDiscount.toLocaleString()}</span>
                                  </>
                                )}

                                {wizardData.couponApplied && (
                                  <>
                                    <span className="text-indigo-400">Promo Code Applied ({wizardData.couponCode} - {wizardData.couponDiscountPercent}%):</span>
                                    <span className="text-right font-mono text-indigo-400">-₹{couponDiscount.toLocaleString()}</span>
                                  </>
                                )}

                                <span className="border-t border-indigo-950 pt-1 font-extrabold text-white">Net Subtotal:</span>
                                <span className="border-t border-indigo-950 pt-1 text-right font-black font-mono text-white">₹{subtotal.toLocaleString()}</span>

                                <span>Central GST (18% SAC 998311):</span>
                                <span className="text-right font-mono">₹{gst.toLocaleString()}</span>

                                <span className="border-t border-indigo-900 pt-1.5 text-xs font-black text-indigo-300 uppercase">Gross Handshake Amount:</span>
                                <span className="border-t border-indigo-900 pt-1.5 text-right text-sm font-black font-mono text-indigo-400">₹{totalNet.toLocaleString()}</span>
                              </div>

                              {/* Coupon code validator */}
                              <div className="pt-2 border-t border-indigo-950 flex gap-2 items-center">
                                <div className="flex-1">
                                  <input 
                                    type="text" 
                                    placeholder="Enter Coupon (e.g. GATEKARU_SAAS_50)"
                                    value={wizardData.couponCode}
                                    onChange={(e) => handleUpdateWizardField("couponCode", e.target.value)}
                                    className="w-full bg-[#030616] border border-[#21326d] rounded-lg p-1.5 text-white font-mono uppercase text-[11px]"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const code = wizardData.couponCode.trim().toUpperCase();
                                    if (code === "GATEKARU_SAAS_50") {
                                      setWizardData(prev => ({ ...prev, couponApplied: true, couponDiscountPercent: 50 }));
                                      showWizardNotification("✅ Coupon verified! 50% discount registered.");
                                    } else if (code === "WELCOME_20") {
                                      setWizardData(prev => ({ ...prev, couponApplied: true, couponDiscountPercent: 20 }));
                                      showWizardNotification("✅ Coupon verified! 20% discount registered.");
                                    } else {
                                      setWizardData(prev => ({ ...prev, couponApplied: false, couponDiscountPercent: 0 }));
                                      showWizardNotification("❌ Invalid promo coupon code.");
                                    }
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* STEP 9: BILLING & GST DETAILS */}
                    {wizardStep === 9 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-indigo-400" /> STEP 9: Corporate Billing & GST Ledger
                          </h5>
                          <p className="text-[10px] text-slate-400">Specify legal tax registration keys, double-entry payment terms, and direct NEFT bank details.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Billing Company Name</label>
                            <input 
                              type="text" 
                              value={wizardData.companyName}
                              onChange={(e) => handleUpdateWizardField("companyName", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">PAN Card Number</label>
                            <input 
                              type="text" 
                              value={wizardData.panNumber}
                              onChange={(e) => handleUpdateWizardField("panNumber", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">GSTIN Code (15-digit)</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={wizardData.gstin}
                                onChange={(e) => handleUpdateWizardField("gstin", e.target.value)}
                                className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs focus:border-indigo-500 font-mono"
                              />
                              <span className="absolute right-2.5 top-2 text-[8px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-1 py-0.5 rounded font-black font-mono">
                                VERIFIED
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">SAC Classification Code</label>
                            <input 
                              type="text" 
                              disabled
                              value={wizardData.sacCode}
                              className="w-full bg-[#030616]/60 border border-slate-800 rounded-xl p-2.5 text-slate-500 text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase">Payment Terms Term</label>
                            <select
                              value={wizardData.paymentTerms}
                              onChange={(e) => handleUpdateWizardField("paymentTerms", e.target.value)}
                              className="w-full bg-[#030616] border border-[#21326d] rounded-xl p-2.5 text-white text-xs font-bold focus:border-indigo-500"
                            >
                              <option value="Immediate">Immediate Settlement</option>
                              <option value="Net 15">Net 15 Days</option>
                              <option value="Net 30">Net 30 Days</option>
                              <option value="Net 45">Net 45 Days</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5 bg-[#0a0f28]/70 border border-indigo-950 p-3 rounded-xl space-y-1 text-xs">
                          <span className="text-[8px] uppercase font-black text-indigo-400 block tracking-widest">JobsKaru Double-Entry Clearing Account (NEFT/IMPS)</span>
                          <div className="grid grid-cols-2 gap-y-1 text-[10px] text-slate-300 font-mono">
                            <span>Beneficiary: <span className="font-bold text-white">{wizardData.beneficiaryName}</span></span>
                            <span>Bank: <span className="font-bold text-white">{wizardData.bankName}</span></span>
                            <span>A/C Number: <span className="font-bold text-white">{wizardData.accountNumber}</span></span>
                            <span>IFSC Branch: <span className="font-bold text-white">{wizardData.ifscCode}</span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 10: AI FEATURES CONFIGURATION */}
                    {wizardStep === 10 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Brain className="w-4 h-4 text-indigo-400" /> STEP 10: Platform AI Core Co-Processors
                          </h5>
                          <p className="text-[10px] text-slate-400">Deploy server-side neural models, computer vision for ANPR, and support LLMs.</p>
                        </div>

                        {/* AI Switchboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[170px] overflow-y-auto custom-scrollbar p-0.5">
                          {[
                            { label: "AI Smart Notice Board Generator", desc: "Craft notices automatically from logs.", field: "aiSmartNotice" },
                            { label: "AI ANPR License Plate Verification", desc: "Recognize vehicle plates instantly.", field: "aiAnpr" },
                            { label: "AI Smart Visitor Pre-Approval Engine", desc: "Learn frequent visitor routines.", field: "aiVisitorApproval" },
                            { label: "AI Facial Recognition for Staff Logins", desc: "Settle timesheets via facial verification.", field: "aiFacialRecognition" },
                            { label: "AI Support Assistant Chatbot", desc: "Auto-answer resident support tickets.", field: "aiChatbot" },
                            { label: "AI Defaulter Bill Payment Predictor", desc: "Predict late payers via billing models.", field: "aiPaymentPredictor" },
                            { label: "AI Audio Anomaly Sound Detector", desc: "Detect high-decibel screams or crashing.", field: "aiAudioAnomaly" },
                            { label: "AI Smart Waste Sorting Classifier", desc: "Analyze garbage sorting via camera.", field: "aiWasteClassification" }
                          ].map((aiItem) => (
                            <div key={aiItem.field} className="bg-[#050920] border border-[#1e2f69] p-2.5 rounded-xl flex items-center justify-between gap-3 shadow hover:border-indigo-500 transition duration-150">
                              <div className="space-y-0.5 truncate">
                                <span className="font-extrabold text-white text-[10.5px] block truncate">{aiItem.label}</span>
                                <span className="text-[9px] text-slate-400 block truncate">{aiItem.desc}</span>
                              </div>
                              <input 
                                type="checkbox"
                                checked={!!(wizardData as any)[aiItem.field]}
                                onChange={(e) => handleUpdateWizardField(aiItem.field, e.target.checked)}
                                className="accent-indigo-600 rounded cursor-pointer w-4 h-4 flex-shrink-0"
                              />
                            </div>
                          ))}
                        </div>

                        {/* LLM persona field */}
                        <div className="space-y-1.5 bg-[#0a0f28]/60 p-3 rounded-xl border border-indigo-950">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block">📝 Localized LLM Persona Fine-Tuning Instructions</label>
                          <textarea 
                            value={wizardData.aiPromptFineTune}
                            onChange={(e) => handleUpdateWizardField("aiPromptFineTune", e.target.value)}
                            rows={2}
                            className="w-full bg-[#030616] border border-[#21326d] rounded-lg p-2 text-white text-[10px] focus:outline-none font-mono resize-none leading-normal"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 11: DEMO SEED DATA */}
                    {wizardStep === 11 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-indigo-400" /> STEP 11: Virtual Sandbox & Demo Seed
                          </h5>
                          <p className="text-[10px] text-slate-400">Instantiate trial databases, preset resident profiles and mockup visitor records instantly.</p>
                        </div>

                        <div className="bg-[#070c26]/60 border border-[#1d2d66] p-4 rounded-xl space-y-3.5">
                          <span className="text-[10px] text-indigo-300 font-black block uppercase tracking-wider">Configure Sandbox Partition Seed Data</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {[
                              { label: "Auto-provision Resident Profiles", field: "demoResidents" },
                              { label: "Pre-populate Security Guard logins", field: "demoGuards" },
                              { label: "Seeded Committee Officers", field: "demoCommittee" },
                              { label: "Fake Visitor/Delivery Ledger logs", field: "demoVisitorLogs" },
                              { label: "Sample Support tickets", field: "demoTickets" }
                            ].map((dItem) => (
                              <label key={dItem.field} className="flex items-center justify-between bg-slate-900/40 p-2 border border-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-900/70">
                                <span className="text-slate-300 font-semibold">{dItem.label}</span>
                                <input 
                                  type="checkbox"
                                  checked={!!(wizardData as any)[dItem.field]}
                                  onChange={(e) => handleUpdateWizardField(dItem.field, e.target.checked)}
                                  className="accent-indigo-600 rounded cursor-pointer"
                                />
                              </label>
                            ))}
                          </div>

                          <div className="space-y-1.5 border-t border-indigo-950 pt-3">
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase block">Default Login Credentials Password (Sandbox)</label>
                            <input 
                              type="text" 
                              value={wizardData.demoPassword}
                              onChange={(e) => handleUpdateWizardField("demoPassword", e.target.value)}
                              className="w-full md:w-1/2 bg-[#030616] border border-[#21326d] rounded-lg p-2 text-white font-mono text-xs focus:outline-none"
                            />
                            <span className="text-[9px] text-slate-500 block italic leading-tight">By default, all sandbox users can authenticate using the password above.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 12: ORCHESTRATION AND SUMMARY */}
                    {wizardStep === 12 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="border-b border-[#1c295f] pb-2">
                          <h5 className="text-white text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                            <Rocket className="w-4 h-4 text-indigo-400 animate-bounce" /> STEP 12: Final Orchestration & Partition Rollout
                          </h5>
                          <p className="text-[10px] text-slate-400">Review compiled metadata parameters and deploy the new gated community container.</p>
                        </div>

                        {/* Elegant Tabbed Summary Resume */}
                        <div className="bg-[#05081b] border border-indigo-950 rounded-xl p-4 max-h-[220px] overflow-y-auto custom-scrollbar space-y-3.5 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block border-b border-indigo-950 pb-1">🏢 Entity Parameters</span>
                              <div className="space-y-1 font-semibold text-[10.5px] mt-1.5 text-slate-300">
                                <p>Society Name: <span className="font-extrabold text-white">{wizardData.name || "N/A"}</span></p>
                                <p>Topology Category: <span className="font-extrabold text-white">{wizardData.type}</span></p>
                                <p>RERA Certificate: <span className="font-mono text-slate-300">{wizardData.reraNumber}</span></p>
                                <p>Location Address: <span className="text-slate-300 block text-[10px] mt-0.5 leading-tight">{wizardData.address || "N/A"}</span></p>
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block border-b border-indigo-950 pb-1">💳 Billing & Subscriptions</span>
                              <div className="space-y-1 font-semibold text-[10.5px] mt-1.5 text-slate-300">
                                <p>License Package: <span className="font-extrabold text-white">{wizardData.planName}</span></p>
                                <p>Capacity Count: <span className="font-mono text-indigo-300 font-bold">{wizardData.totalFlatsCalculated} Gated Units</span></p>
                                <p>Duty Officers: <span className="font-mono">{wizardData.staff.reduce((sum, s) => sum + s.count, 0)} Active Staff</span></p>
                                <p>Contract Term: <span className="font-black text-emerald-400">{wizardData.billingCycle}</span></p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-indigo-950 pt-2.5">
                            <div>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block border-b border-indigo-950 pb-1">🧠 Enabled AI Modules</span>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {[
                                  { label: "Smart Notices", val: wizardData.aiSmartNotice },
                                  { label: "ANPR Vision", val: wizardData.aiAnpr },
                                  { label: "Visitor Approval", val: wizardData.aiVisitorApproval },
                                  { label: "Face Lock", val: wizardData.aiFacialRecognition },
                                  { label: "Bot Support", val: wizardData.aiChatbot },
                                  { label: "Payment Predictor", val: wizardData.aiPaymentPredictor },
                                  { label: "Audio Sensor", val: wizardData.aiAudioAnomaly },
                                  { label: "Waste Classifier", val: wizardData.aiWasteClassification }
                                ].filter(x => x.val).map(x => (
                                  <span key={x.label} className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md font-semibold">
                                    ⚙️ {x.label}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block border-b border-indigo-950 pb-1">🔑 Primary Administrator</span>
                              <div className="space-y-1 font-semibold text-[10.5px] mt-1.5 text-slate-300">
                                <p>Secretary: <span className="font-extrabold text-white">{wizardData.committee.secretary.name || "N/A"}</span></p>
                                <p>Contact No: <span className="font-mono text-slate-300">{wizardData.committee.secretary.phone || "N/A"}</span></p>
                                <p>Secure Email: <span className="font-mono text-slate-300">{wizardData.committee.secretary.email || "N/A"}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Large High-Tech Action Button Group */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              handleSubmitWizardSociety();
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-3 rounded-lg uppercase tracking-wider transition text-center shadow"
                          >
                            🚀 Create Gated Society Node
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              showWizardNotification("👥 Sandbox Seed Initiated: Generated 15 resident accounts, 4 guards, and 2 committee log partitions.");
                            }}
                            className="bg-[#121c43] hover:bg-[#1a2961] border border-[#233575] text-slate-300 font-extrabold py-2 px-3 rounded-lg uppercase transition text-center"
                          >
                            👥 Generate Demo Trial Accounts
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const targetEmail = wizardData.committee.secretary.email || wizardData.email || "secretary@gatedsociety.com";
                              showWizardNotification(`✉️ Mailbox Dispatched: Enterprise welcome packages transmitted to: ${targetEmail}`);
                            }}
                            className="bg-[#121c43] hover:bg-[#1a2961] border border-[#233575] text-slate-300 font-extrabold py-2 px-3 rounded-lg uppercase transition text-center"
                          >
                            ✉️ Send Welcome Onboarding Email
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const targetPhone = wizardData.committee.secretary.phone || wizardData.phone || "+91 99999 88888";
                              showWizardNotification(`💬 JobsKaru Gateway: Guard SMS/WhatsApp credentials dispatched to: ${targetPhone}`);
                            }}
                            className="bg-[#121c43] hover:bg-[#1a2961] border border-[#233575] text-slate-300 font-extrabold py-2 px-3 rounded-lg uppercase transition text-center"
                          >
                            💬 Send WhatsApp Guard Credentials
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showWizardNotification(`🚪 Virtual Portal: Simulating dashboard launch for Gated Partition Node #${Date.now()}`);
                            }}
                            className="bg-[#121c43] hover:bg-[#1a2961] border border-[#233575] text-slate-300 font-extrabold py-2 px-3 rounded-lg uppercase transition text-center"
                          >
                            🚪 Open Live Society Dashboard
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showWizardNotification("💾 Onboarding configuration draft successfully saved to SuperAdmin local draft storage.");
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-extrabold py-2 px-3 rounded-lg uppercase transition text-center"
                          >
                            💾 Save Onboarding Draft
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Wizard Footer Controls */}
                  <div className="border-t border-[#1c295f] pt-4 mt-6 flex justify-between items-center text-xs">
                    <button
                      type="button"
                      disabled={wizardStep === 1}
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className={`font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border transition duration-150 flex items-center gap-1 ${
                        wizardStep === 1 
                          ? "border-slate-800 text-slate-600 cursor-not-allowed" 
                          : "border-[#21326d] bg-slate-900/40 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="text-[10px] text-slate-500 font-mono">
                      Partition Server IP: <span className="text-slate-400 font-bold">10.128.0.42</span>
                    </div>

                    {wizardStep < 12 ? (
                      <button
                        type="button"
                        onClick={() => {
                          // Simple steps validation
                          if (wizardStep === 1 && !wizardData.name) {
                            showWizardNotification("⚠️ Verification Error: Society Name is required to proceed.");
                            return;
                          }
                          setWizardStep(prev => prev + 1);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider py-1.5 px-3 rounded-lg shadow transition flex items-center gap-1"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmitWizardSociety()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider py-1.5 px-4 rounded-lg shadow transition flex items-center gap-1 animate-pulse"
                      >
                        Approve & Deploy <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Subscriptions Table (Slick glassmorphism structure) */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#070b1d] text-[10px] font-black text-slate-400 border-b border-[#1e295d] uppercase tracking-widest">
                    <th className="px-5 py-3.5">Active Society Name</th>
                    <th className="px-5 py-3.5">Current Plan Type</th>
                    <th className="px-5 py-3.5 text-center">User Count</th>
                    <th className="px-5 py-3.5">Plan Expiry Countdown</th>
                    <th className="px-5 py-3.5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#16214f]">
                  {societies.map((soc) => {
                    const expInfo = getDaysRemainingInfo(soc.expiresAt);
                    return (
                      <tr key={soc.id} className="hover:bg-[#0f173c]/50 transition duration-150">
                        
                        {/* Society Details */}
                        <td className="px-5 py-4 space-y-1">
                          <p className="font-bold text-white text-[13px] tracking-tight">{soc.name}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{soc.address}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                              🏡 {soc.flatsCount} Flats
                            </span>
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md">
                              ₹{soc.price}/{soc.billingCycle === "Yearly" ? "yr" : "mo"}
                            </span>
                          </div>
                        </td>

                        {/* Plan and Billing Cycle */}
                        <td className="px-5 py-4 align-top">
                          <span className="font-extrabold text-indigo-300 block text-[11px]">{soc.plan}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">Purchased: {soc.purchasedAt}</span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Cycle: {soc.billingCycle}</span>
                          
                          {/* Fast Action Upgrade Plan selector */}
                          <select
                            value={soc.plan}
                            onChange={(e) => onUpgradePackage(soc.id, e.target.value)}
                            className="bg-[#050817] border border-[#1b2b5f] text-slate-300 text-[9px] font-black uppercase rounded-md px-1.5 py-1 mt-2 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="" disabled>Upgrade Plan...</option>
                            {plans.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Registered user count */}
                        <td className="px-5 py-4 text-center align-top">
                          <div className="inline-flex flex-col items-center justify-center bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl min-w-[75px]">
                            <Users className="w-4 h-4 text-indigo-400 mb-0.5" />
                            <span className="font-black font-mono text-[13px] text-white">{soc.usersCount}</span>
                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Logins</span>
                          </div>
                        </td>

                        {/* Countdown Timers */}
                        <td className="px-5 py-4 space-y-2 align-top">
                          <div>
                            {expInfo.isExpired ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-400 uppercase tracking-widest border border-rose-500/20 inline-block">
                                🔴 EXPIRED
                              </span>
                            ) : soc.status !== "Active" ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-400 uppercase tracking-widest border border-amber-500/20 inline-block">
                                🟡 {soc.status}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20 inline-block">
                                🟢 ACTIVE
                              </span>
                            )}
                          </div>

                          {/* Countdown Component */}
                          <SubscriptionCountdown expiresAt={soc.expiresAt} simulatedDate={settings.simulatedDate} />

                          <div className="text-[9.5px] font-semibold text-slate-400 space-y-0.5">
                            <p>Expiry: <span className="font-bold text-slate-300">{soc.expiresAt}</span></p>
                            {expInfo.isExpired ? (
                              <span className="text-rose-400 font-black block text-[9px]">Overdue by {Math.abs(expInfo.days)} days</span>
                            ) : expInfo.isExpiringSoon ? (
                              <span className="text-amber-400 font-black block text-[9px]">🚨 Renew in {expInfo.days} days!</span>
                            ) : (
                              <span className="text-emerald-400 font-black block text-[9px]">{expInfo.days} days remaining</span>
                            )}
                          </div>
                        </td>

                        {/* Administrative actions */}
                        <td className="px-5 py-4 text-right space-y-1.5 align-top">
                          <button
                            type="button"
                            onClick={() => onExtendSubscription(soc.id)}
                            className="text-[10px] bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black py-1.5 px-3 rounded-lg block w-full text-center transition uppercase tracking-wider shadow"
                          >
                            Extend Subscription
                          </button>
                          <button
                            type="button"
                            onClick={() => onSendRenewalReminder(soc.id)}
                            className="text-[9.5px] bg-[#121c43] hover:bg-[#1a2961] border border-[#233575] text-slate-300 font-extrabold py-1 px-2 rounded block w-full text-center transition uppercase"
                          >
                            Send Invoice Alert
                          </button>
                          <button
                            type="button"
                            onClick={() => onTerminateTenant(soc.id, soc.name)}
                            className="text-[9.5px] bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 text-rose-400 hover:text-white font-bold py-1 px-2 rounded block w-full text-center transition uppercase"
                          >
                            Suspend Partition
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* SECTION 2: PRICING PLANS MATRIX */}
      {/* ======================================================= */}
      {subTab === "plans" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400">GateKaru SaaS Billing Tiers</span>
              <p className="text-xs text-slate-300">Deploy customize pricing matrices, trial limitations, and core digital security gateways.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPlanForm(!showAddPlanForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider py-2 px-4 rounded-xl shadow transition"
            >
              {showAddPlanForm ? "Close Form" : "➕ Deploy Subscription Package"}
            </button>
          </div>

          {showAddPlanForm && (
            <form onSubmit={handleCreatePlan} className="bg-[#0b1029]/90 border border-[#21326d] p-5 rounded-2xl space-y-4 text-xs font-semibold animate-slideIn">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2 border-b border-[#21326d] pb-2">Deploy Pricing Package</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase block text-[10px]">Package Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. GateKaru Ultimate Pro" 
                    className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase block text-[10px]">Price (INR)</label>
                  <input 
                    type="number" 
                    required 
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                    className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase block text-[10px]">Billing Period</label>
                  <select
                    value={newPlanPeriod}
                    onChange={(e) => setNewPlanPeriod(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase block text-[10px]">Features (comma-separated list)</label>
                <input 
                  type="text" 
                  required 
                  value={newPlanFeatures}
                  onChange={(e) => setNewPlanFeatures(e.target.value)}
                  placeholder="e.g. 5 Guard Terminals, WhatsApp Integration, ERP Ledger Sync, AI Auto Notices" 
                  className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase block text-[10px]">Description</label>
                <input 
                  type="text" 
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Perfect for large townships with complex requirements" 
                  className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider transition"
              >
                Deploy Plan to Platform matrix
              </button>
            </form>
          )}

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const socWithPlan = societies.filter(s => s.plan === p.name).length;
              return (
                <div key={p.id} className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 hover:border-indigo-500 transition duration-150 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">GateKaru SaaS Tier</span>
                      <span className="text-[9.5px] bg-[#121c43] text-indigo-300 font-mono font-bold px-2 py-0.5 rounded border border-[#1e2e66]">Active Takers: {socWithPlan}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white">{p.name}</h3>
                      <p className="text-[10.5px] text-slate-400 mt-1 font-medium leading-normal">{p.desc || "Custom configured high-performance plan"}</p>
                    </div>

                    <div className="py-2">
                      <span className="text-xl font-black text-white font-mono">₹{p.price.toLocaleString()}</span>
                      <span className="text-slate-500 text-[10px] font-bold"> / {p.period === "Yearly" ? "yr" : "mo"}</span>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#1e2a5e]">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Bundled Features:</span>
                      <ul className="space-y-1 text-[10.5px] text-slate-300 font-semibold list-disc pl-3">
                        {p.features.split(",").map((feat: string, idx: number) => (
                          <li key={idx} className="leading-tight text-slate-300">{feat.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1e2a5e]/50 flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono text-slate-500">Tier ID: {p.id}</span>
                    {socWithPlan === 0 && (
                      <button 
                        type="button"
                        onClick={() => onDeletePlan(p.id, p.name)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* SECTION 3: INVOICE GENERATOR & REVENUE LEDGER */}
      {/* ======================================================= */}
      {subTab === "ledger" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Manual Invoice Dispatch Form */}
          <div className="lg:col-span-4 bg-[#0b1029]/80 border border-[#1e2a5e] p-5 rounded-2xl space-y-4">
            <div className="border-b border-[#21326d] pb-2">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5 text-indigo-400" /> Manual Invoice Dispatch
              </h3>
              <p className="text-[10px] text-slate-400">Generate and dispatch custom invoices, late fees, or maintenance packages.</p>
            </div>

            <form onSubmit={handleInvoiceFormSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase block text-[10px]">Select Debtor Tenant</label>
                <select
                  required
                  value={selectedInvoiceSoc}
                  onChange={(e) => {
                    setSelectedInvoiceSoc(e.target.value);
                    const selected = societies.find(s => s.id === e.target.value);
                    if (selected) setInvoiceAmount(selected.price);
                  }}
                  className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="" disabled>Select Target Society...</option>
                  {societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.plan})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase block text-[10px]">Billing Amount (INR)</label>
                <input 
                  type="number" 
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase block text-[10px]">Invoice Memorandum / Note</label>
                <input 
                  type="text" 
                  required
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  placeholder="e.g. Late fee adjustments or multi-gate setups"
                  className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-white font-medium"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider transition"
              >
                Dispatch Bill
              </button>
            </form>
          </div>

          {/* Global Revenue Ledger List (Compiled from all invoice fields in societies) */}
          <div className="lg:col-span-8 bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 bg-[#070b1d] border-b border-[#1e295d] flex justify-between items-center">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">🧾 Central Ledger & Clearing House</h3>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono font-black border border-[#1d2a5f]">Double Entry Audited</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#050817] text-[9.5px] font-black text-slate-400 border-b border-[#1d2a5f] uppercase tracking-wider">
                      <th className="px-4 py-3">Invoice ID</th>
                      <th className="px-4 py-3">Debtor Society</th>
                      <th className="px-4 py-3">Memo Log</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[#15214b]">
                    {(() => {
                      // Flatten all invoices
                      const allInvoices = societies.flatMap(soc => 
                        soc.invoices.map((inv: any) => ({
                          ...inv,
                          societyId: soc.id,
                          societyName: soc.name
                        }))
                      ).sort((a, b) => b.id.localeCompare(a.id));

                      if (allInvoices.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-500 italic font-medium">No invoice aggregates recorded in this partition.</td>
                          </tr>
                        );
                      }

                      return allInvoices.map((inv) => (
                        <tr key={`${inv.societyId}-${inv.id}`} className="hover:bg-[#0f173c]/35 transition">
                          <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{inv.id}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-white block truncate max-w-[150px]">{inv.societyName}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-medium">{inv.description}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{inv.date}</td>
                          <td className="px-4 py-3 font-black text-white font-mono">₹{inv.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {inv.status === "Paid" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                                Paid
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[9px] font-black uppercase tracking-wider border border-rose-500/20 animate-pulse">
                                  Unpaid
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onMarkInvoicePaid(inv.societyId, inv.id)}
                                  className="text-[8px] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-0.5 px-1.5 rounded transition uppercase"
                                >
                                  Clear Cash
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-[#070b1d] border-t border-[#1e2a5d] flex justify-between items-center text-[9.5px] font-mono text-slate-500">
              <span>UPI/NEFT Bank Direct settlement enabled</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Direct settlement certified
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
