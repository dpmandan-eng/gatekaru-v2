import React, { useState, useMemo } from "react";
import { 
  Plus, Sparkles, Users, FileText, Check, Trash, AlertTriangle, 
  Search, RefreshCw, DollarSign, Calendar, Shield, Info, Send, UserPlus, Sliders, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SecurityDesk from "./SecurityDesk";
import GateAnalyticsChart from "./GateAnalyticsChart";
import MonthlySecurityTrendsChart from "./MonthlySecurityTrendsChart";

// custom types specified in instructions
interface ResidentRecord {
  id: string;
  name: string;
  flat: string;
  wing: string;
  category: "Owner" | "Tenant";
  phone: string;
  vehicleRfid: string;
  varganiPaid: number;
  status: "Paid" | "Partial" | "Defaulter";
}

interface ExpenseQuotation {
  id: string;
  serviceType: "Decoration" | "Lighting" | "Catering / Food" | "Pooja Samagri" | "Garlands & Flowers" | "Visarjan Arrangement";
  vendor: string;
  quotedAmount: number;
  advancePaid: number;
  status: "Approved" | "Pending" | "Rejected";
}

// Keep full compatibility with App.tsx props
interface AdminPortalProps {
  currentUser: any;
  users?: any[];
  onApproveResident?: (userId: string) => void;
  visitors?: any[];
  bills?: any[];
  complaints?: any[];
  onUpdateComplaint?: any;
  notices?: any[];
  onAddNotice?: any;
  onGenerateNoticeAi?: any;
  polls?: any[];
  onAddPoll?: any;
  staff?: any[];
  parking?: any[];
  onGetAiAnalytics?: any;
  alerts?: any[];
  onTriggerSOS?: any;
  onResolveAlert?: any;
  globalLang?: string;
  programs?: any[];
  onRefreshPrograms?: any;
}

export default function AdminPortal({
  currentUser,
  users: initialUsers = [],
  onApproveResident,
  visitors = [],
  bills = [],
  complaints = [],
  onUpdateComplaint,
  notices = [],
  onAddNotice,
  onGenerateNoticeAi,
  polls = [],
  onAddPoll,
  staff = [],
  parking = [],
  onGetAiAnalytics,
  alerts = [],
  onTriggerSOS,
  onResolveAlert,
  globalLang = "en",
  programs = [],
  onRefreshPrograms
}: AdminPortalProps) {

  // 1. Live States for Interlinked Math Engine
  const [totalFlats, setTotalFlats] = useState<number>(35);
  const [societyContribution, setSocietyContribution] = useState<number>(15000);
  const [activeTab, setActiveTab] = useState<"quotation" | "vargani" | "roster" | "securitydesk">("quotation");

  // 2. Custom Secure State Initialization with complex mock profiles as requested
  const [residents, setResidents] = useState<ResidentRecord[]>([
    {
      id: "res-1",
      name: "Jethalal Champaklal Gada",
      flat: "101",
      wing: "A",
      category: "Owner",
      phone: "+91 98220 11111",
      vehicleRfid: "RFID-A101-JG",
      varganiPaid: 3000,
      status: "Paid"
    },
    {
      id: "res-2",
      name: "Taarak Janubhai Mehta",
      flat: "502",
      wing: "B",
      category: "Owner",
      phone: "+91 98220 22222",
      vehicleRfid: "RFID-B502-TM",
      varganiPaid: 800,
      status: "Partial"
    },
    {
      id: "res-3",
      name: "Dr. Hansraj Baldev Hathi",
      flat: "303",
      wing: "A",
      category: "Tenant",
      phone: "+91 98220 33333",
      vehicleRfid: "RFID-A303-HH",
      varganiPaid: 2000,
      status: "Paid"
    },
    {
      id: "res-4",
      name: "Krishnan Subramaniam Iyer",
      flat: "601",
      wing: "C",
      category: "Owner",
      phone: "+91 98220 44444",
      vehicleRfid: "RFID-C601-KI",
      varganiPaid: 0,
      status: "Defaulter"
    },
    {
      id: "res-5",
      name: "Popatlal Bhagwatiprasad Pandey",
      flat: "202",
      wing: "D",
      category: "Tenant",
      phone: "+91 98220 55555",
      vehicleRfid: "RFID-D202-PP",
      varganiPaid: 450,
      status: "Partial"
    }
  ]);

  const [quotations, setQuotations] = useState<ExpenseQuotation[]>([
    {
      id: "quote-1",
      serviceType: "Decoration",
      vendor: "Gada Electronics & Decorators",
      quotedAmount: 22000,
      advancePaid: 10000,
      status: "Approved"
    },
    {
      id: "quote-2",
      serviceType: "Lighting",
      vendor: "Rana Electricals & Sound",
      quotedAmount: 12000,
      advancePaid: 5000,
      status: "Approved"
    },
    {
      id: "quote-3",
      serviceType: "Catering / Food",
      vendor: "Padmavati Mahila Gruh Udyog",
      quotedAmount: 25000,
      advancePaid: 8000,
      status: "Pending"
    },
    {
      id: "quote-4",
      serviceType: "Pooja Samagri",
      vendor: "Shreenathji Pooja Bhandar",
      quotedAmount: 5000,
      advancePaid: 5000,
      status: "Approved"
    },
    {
      id: "quote-5",
      serviceType: "Garlands & Flowers",
      vendor: "Phoolchand Florist Terminal",
      quotedAmount: 4000,
      advancePaid: 2000,
      status: "Approved"
    },
    {
      id: "quote-6",
      serviceType: "Visarjan Arrangement",
      vendor: "Girgaon Chaupati Beach Organizers",
      quotedAmount: 15000,
      advancePaid: 0,
      status: "Pending"
    }
  ]);

  // For Adding new entries in UI
  const [newQuoteType, setNewQuoteType] = useState<ExpenseQuotation["serviceType"]>("Decoration");
  const [newQuoteVendor, setNewQuoteVendor] = useState("");
  const [newQuoteAmount, setNewQuoteAmount] = useState("");
  const [newQuoteAdvance, setNewQuoteAdvance] = useState("");

  const [newResName, setNewResName] = useState("");
  const [newResFlat, setNewResFlat] = useState("");
  const [newResWing, setNewResWing] = useState("A");
  const [newResCategory, setNewResCategory] = useState<"Owner" | "Tenant">("Owner");
  const [newResPhone, setNewResPhone] = useState("");
  const [newResRfid, setNewResRfid] = useState("");
  const [newResPaid, setNewResPaid] = useState("");

  // Search Filter for Roster Tab
  const [rosterSearch, setRosterSearch] = useState("");

  // Alert & Info Modal state
  const [activeNoticeAlert, setActiveNoticeAlert] = useState<{ name: string; flat: string } | null>(null);

  // 3. FULLY AUTOMATED INTER-LINKED MATH ENGINE (via useMemo)
  // Expense Aggregation: Calculate the absolute sum of all vendor 'quotedAmount' parameters directly from the quotations array state
  const totalVendorQuotesSum = useMemo(() => {
    return quotations.reduce((acc, q) => acc + q.quotedAmount, 0);
  }, [quotations]);

  // Vargani Cost Allocation Formula: Math.ceil((Total Vendor Quotes Sum - Society Fund Contribution) / Total Flats Count)
  const perFlatVarganiAllocation = useMemo(() => {
    const amount = (totalVendorQuotesSum - societyContribution) / totalFlats;
    return Math.max(0, Math.ceil(amount));
  }, [totalVendorQuotesSum, societyContribution, totalFlats]);

  // Total Realized Vargani Collections
  const totalVarganiRealized = useMemo(() => {
    return residents.reduce((acc, r) => acc + r.varganiPaid, 0);
  }, [residents]);

  // Deficit & Surplus Ledger: (Total Vargani Realized Collections + Society Fund Contribution) - Total Vendor Quotes Sum
  const deficitSurplusBalance = useMemo(() => {
    return (totalVarganiRealized + societyContribution) - totalVendorQuotesSum;
  }, [totalVarganiRealized, societyContribution, totalVendorQuotesSum]);

  // Absolute combined outstanding balances remaining to pay the vendors (Quoted - Advance)
  const totalVendorOutstanding = useMemo(() => {
    return quotations.reduce((acc, q) => acc + (q.quotedAmount - q.advancePaid), 0);
  }, [quotations]);

  // Sync resident payment statuses dynamically based on target
  const updatedResidentsWithStatus = useMemo(() => {
    return residents.map(r => {
      let status: "Paid" | "Partial" | "Defaulter" = "Defaulter";
      if (r.varganiPaid >= perFlatVarganiAllocation) {
        status = "Paid";
      } else if (r.varganiPaid > 0) {
        status = "Partial";
      }
      return {
        ...r,
        status
      };
    });
  }, [residents, perFlatVarganiAllocation]);

  // Filtered residents for Roster Directory Search
  const filteredResidents = useMemo(() => {
    const term = rosterSearch.toLowerCase().trim();
    if (!term) return updatedResidentsWithStatus;
    return updatedResidentsWithStatus.filter(
      r =>
        r.name.toLowerCase().includes(term) ||
        r.flat.includes(term) ||
        r.phone.includes(term)
    );
  }, [updatedResidentsWithStatus, rosterSearch]);

  // 4. Interactive Action Handlers
  const handleAddQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteVendor.trim() || !newQuoteAmount) return;

    const newQuote: ExpenseQuotation = {
      id: `quote-${Date.now()}`,
      serviceType: newQuoteType,
      vendor: newQuoteVendor,
      quotedAmount: parseFloat(newQuoteAmount),
      advancePaid: parseFloat(newQuoteAdvance) || 0,
      status: "Approved"
    };

    setQuotations(prev => [...prev, newQuote]);
    setNewQuoteVendor("");
    setNewQuoteAmount("");
    setNewQuoteAdvance("");
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName.trim() || !newResFlat.trim() || !newResPhone.trim()) return;

    const paidVal = parseFloat(newResPaid) || 0;
    const newResident: ResidentRecord = {
      id: `res-${Date.now()}`,
      name: newResName,
      flat: newResFlat,
      wing: newResWing,
      category: newResCategory,
      phone: newResPhone,
      vehicleRfid: newResRfid || `RFID-${newResWing}${newResFlat}`,
      varganiPaid: paidVal,
      status: paidVal >= perFlatVarganiAllocation ? "Paid" : paidVal > 0 ? "Partial" : "Defaulter"
    };

    setResidents(prev => [...prev, newResident]);
    setNewResName("");
    setNewResFlat("");
    setNewResPhone("");
    setNewResRfid("");
    setNewResPaid("");
  };

  const handleDeleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const handleUpdateResidentVargani = (id: string, amount: number) => {
    setResidents(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          varganiPaid: Math.max(0, amount)
        };
      }
      return r;
    }));
  };

  const handleToggleQuotationStatus = (id: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        const nextStatus: ExpenseQuotation["status"] = 
          q.status === "Approved" ? "Pending" : q.status === "Pending" ? "Rejected" : "Approved";
        return { ...q, status: nextStatus };
      }
      return q;
    }));
  };

  const triggerDefaulterNotice = (name: string, flat: string) => {
    setActiveNoticeAlert({ name, flat });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. HEADER & LIVE SYNC INFRASTRUCTURE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Shield className="w-5 h-5 text-indigo-200" />
              </span>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">
                Greenwood Heights Society Committee Suite
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              त्योहार बजट, चंदा (वर्गणी) ट्रैकर एवं रेजिडेंट डायरेक्टरी मैनेजमेंट मॉड्यूल
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black tracking-wider text-emerald-400 font-mono">
              DATABASE LIVE SYNC • OPTIMAL
            </span>
          </div>
        </header>

        {/* 2. DYNAMIC INPUT PARAMETERS (Live Configuration Panel) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-black tracking-wider text-slate-300 uppercase">
                Live Configuration parameters / बजट व्यवस्थापन
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Total Building Flats (कुल फ्लैट्स)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={totalFlats}
                    onChange={(e) => setTotalFlats(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-semibold">Flats</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Society Fund Share (सोसाइटी योगदान)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={societyContribution}
                    onChange={(e) => setSocietyContribution(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-7 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute left-3 top-3 text-xs text-slate-500 font-black">₹</span>
                </div>
              </div>
            </div>

            {/* Quick overview metric pills */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Aggregated Quotes</span>
                <span className="text-sm font-extrabold text-indigo-400">₹{totalVendorQuotesSum.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Realized Vargani</span>
                <span className="text-sm font-extrabold text-emerald-400">₹{totalVarganiRealized.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-700/60 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Ledger State</span>
                <span className={`text-sm font-extrabold ${deficitSurplusBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {deficitSurplusBalance >= 0 ? '+' : ''}₹{deficitSurplusBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic evaluated target badge */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-orange-500/40 p-6 rounded-2xl flex flex-col justify-between shadow-inner">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                <Sparkles className="w-3 h-3 text-orange-300" /> Auto-Evaluated Allocation
              </span>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Per Flat Vargani target (तय वर्गणी)
              </h3>
            </div>

            <div className="my-3">
              <span className="text-[11px] text-amber-400/80 font-mono block">Formula: Math.ceil((Quotes - RWA Fund) / Flats)</span>
              <span className="text-3xl font-black text-amber-400 tracking-tight">
                ₹{perFlatVarganiAllocation.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-semibold block mt-1">Per Building Housing Unit</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Every resident collection target scales dynamically upon adding or removing contractor quotes or updating building specifications.
            </p>
          </div>
        </section>

        {/* Gate Peak Hour Analytics & Monthly Security Trends Visualizers */}
        <section id="admin-gate-analytics" className="w-full space-y-6">
          <GateAnalyticsChart darkMode={true} />
          <MonthlySecurityTrendsChart darkMode={true} />
        </section>

        {/* 3. TRIPLE-TABBED DATAGRID ROUTING MATRIX */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          
          {/* Navigation Tab Heads */}
          <div className="bg-slate-800/80 p-2 border-b border-slate-700 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("quotation")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === "quotation"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <FileText className="w-4 h-4" /> 🧾 वेंडर कोटेशन एवं खर्च बही
            </button>
            <button
              onClick={() => setActiveTab("vargani")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === "vargani"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <DollarSign className="w-4 h-4" /> 💰 उत्सव वर्गणी (चंदा) लेज़र
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === "roster"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Users className="w-4 h-4" /> 📂 Resident Roster Directory
            </button>
            <button
              onClick={() => setActiveTab("securitydesk")}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === "securitydesk"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Shield className="w-4 h-4" /> 🛡️ सुरक्षा ऑपरेशन्स (Security Desk)
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: VENDOR QUOTATIONS */}
              {activeTab === "quotation" && (
                <motion.div
                  key="tab-quotation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Quotations Master Table */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          Active vendor quotations / ठेकेदार विवरण सूची
                        </h3>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30">
                          {quotations.length} Active Services
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-800/50 text-slate-400 uppercase text-[9px] font-black tracking-wider border-b border-slate-700">
                                <th className="p-3.5">खर्च का प्रकार</th>
                                <th className="p-3.5">वेंडर का नाम</th>
                                <th className="p-3.5 text-right">कुल कोटेशन राशि</th>
                                <th className="p-3.5 text-right">एडवान्स (Paid)</th>
                                <th className="p-3.5 text-right">बकाया राशि</th>
                                <th className="p-3.5 text-center">स्थिति</th>
                                <th className="p-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {quotations.map((q) => {
                                const balance = q.quotedAmount - q.advancePaid;
                                return (
                                  <tr key={q.id} className="hover:bg-slate-800/40 transition">
                                    <td className="p-3.5 font-bold text-indigo-300">
                                      {q.serviceType}
                                    </td>
                                    <td className="p-3.5 font-semibold text-slate-200">
                                      {q.vendor}
                                    </td>
                                    <td className="p-3.5 text-right font-bold text-slate-100">
                                      ₹{q.quotedAmount.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-right font-medium text-emerald-400">
                                      ₹{q.advancePaid.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-right font-bold text-amber-500">
                                      ₹{balance.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-center">
                                      <button
                                        onClick={() => handleToggleQuotationStatus(q.id)}
                                        className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition hover:scale-105 ${
                                          q.status === "Approved"
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : q.status === "Pending"
                                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                                        }`}
                                      >
                                        {q.status}
                                      </button>
                                    </td>
                                    <td className="p-3.5 text-right">
                                      <button
                                        onClick={() => handleDeleteQuotation(q.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded-lg transition"
                                        title="Delete Quotation"
                                      >
                                        <Trash className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Combined Outstanding Balance Micro-Indicator */}
                        <div className="bg-slate-850 p-4 border-t border-slate-700 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            Absolute Outstanding combined Vendor Balances:
                          </span>
                          <span className="text-xs font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg">
                            ₹{totalVendorOutstanding.toLocaleString()} Remaining Dues
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quotation Submission Sidebar */}
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                      <div>
                        <h4 className="text-xs font-black tracking-wider text-slate-300 uppercase">
                          Add vendor quotation / नयी कोटेशन प्रविष्टि
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                          Insert competitive quotations to recalculate the dynamic allocation model immediately.
                        </p>
                      </div>

                      <form onSubmit={handleAddQuotation} className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Service Category</label>
                          <select
                            value={newQuoteType}
                            onChange={(e) => setNewQuoteType(e.target.value as any)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-semibold cursor-pointer"
                          >
                            <option value="Decoration">Decoration (सजावट)</option>
                            <option value="Lighting">Lighting (लाइटिंग)</option>
                            <option value="Catering / Food">Catering / Food (भोजन)</option>
                            <option value="Pooja Samagri">Pooja Samagri (पूजा सामग्री)</option>
                            <option value="Garlands & Flowers">Garlands & Flowers (फूल-माला)</option>
                            <option value="Visarjan Arrangement">Visarjan Arrangement (विसर्जन)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Vendor Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Pandal & Decorators"
                            value={newQuoteVendor}
                            onChange={(e) => setNewQuoteVendor(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Quoted Amount (₹)</label>
                            <input
                              type="number"
                              required
                              placeholder="₹"
                              value={newQuoteAmount}
                              onChange={(e) => setNewQuoteAmount(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Advance Paid (₹)</label>
                            <input
                              type="number"
                              placeholder="₹"
                              value={newQuoteAdvance}
                              onChange={(e) => setNewQuoteAdvance(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Register Vendor Quotation
                        </button>
                      </form>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 2: VARGANI COLLECTIONS */}
              {activeTab === "vargani" && (
                <motion.div
                  key="tab-vargani"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Residents Chanda Collection Ledger / उत्सव वर्गणी बहीखाता
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Track payments against the dynamic per flat target of <strong className="text-amber-400 font-bold">₹{perFlatVarganiAllocation.toLocaleString()}</strong>.
                      </p>
                    </div>

                    <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs gap-4 font-mono">
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase">Total Realized</span>
                        <span className="text-sm font-black text-emerald-400">₹{totalVarganiRealized.toLocaleString()}</span>
                      </div>
                      <div className="border-l border-slate-700 pl-4">
                        <span className="block text-[9px] text-slate-400 uppercase">Target Total</span>
                        <span className="text-sm font-black text-slate-300">₹{(totalFlats * perFlatVarganiAllocation).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/50 text-slate-400 uppercase text-[9px] font-black tracking-wider border-b border-slate-700">
                            <th className="p-3.5">फ्लैट</th>
                            <th className="p-3.5">नाम</th>
                            <th className="p-3.5 text-right">तय वर्गणी (Auto)</th>
                            <th className="p-3.5 text-right">प्राप्त राशि</th>
                            <th className="p-3.5 text-right">बाकी Balance</th>
                            <th className="p-3.5 text-center">पेमेंट स्टेटस</th>
                            <th className="p-3.5 text-right">त्वरित संपादन (Update Paid)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {updatedResidentsWithStatus.map((r) => {
                            const balance = Math.max(0, perFlatVarganiAllocation - r.varganiPaid);
                            const isPaid = r.varganiPaid >= perFlatVarganiAllocation;
                            const isPartial = r.varganiPaid > 0 && r.varganiPaid < perFlatVarganiAllocation;

                            return (
                              <tr key={r.id} className="hover:bg-slate-800/40 transition">
                                <td className="p-3.5 font-bold font-mono text-indigo-400">
                                  {r.wing}-{r.flat}
                                </td>
                                <td className="p-3.5 font-extrabold text-slate-100">
                                  {r.name}
                                </td>
                                <td className="p-3.5 text-right font-bold text-slate-300 font-mono">
                                  ₹{perFlatVarganiAllocation.toLocaleString()}
                                </td>
                                <td className="p-3.5 text-right font-black text-emerald-400 font-mono">
                                  ₹{r.varganiPaid.toLocaleString()}
                                </td>
                                <td className="p-3.5 text-right font-bold text-red-400 font-mono">
                                  ₹{balance.toLocaleString()}
                                </td>
                                <td className="p-3.5 text-center">
                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                      ✓ पूर्ण जमा
                                    </span>
                                  ) : isPartial ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                      ⚠ आंशिक
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                                      ⏳ बाकी है
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <input
                                      type="number"
                                      className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-right font-mono font-bold text-slate-100 text-[11px]"
                                      value={r.varganiPaid}
                                      min="0"
                                      onChange={(e) => handleUpdateResidentVargani(r.id, parseFloat(e.target.value) || 0)}
                                    />
                                    <button
                                      onClick={() => handleUpdateResidentVargani(r.id, perFlatVarganiAllocation)}
                                      className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded transition font-bold"
                                    >
                                      Set Full
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: RESIDENT ROSTER DIRECTORY */}
              {activeTab === "roster" && (
                <motion.div
                  key="tab-roster"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Directory list */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Search bar & filter controls */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="relative w-full sm:max-w-xs">
                          <span className="absolute left-3 top-2.5 text-slate-500">
                            <Search className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="खोजें (Name, Flat or Phone...)"
                            value={rosterSearch}
                            onChange={(e) => setRosterSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <span className="text-[10px] text-slate-400 font-bold">
                          Showing {filteredResidents.length} of {residents.length} Roster Entities
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-800/50 text-slate-400 uppercase text-[9px] font-black tracking-wider border-b border-slate-700">
                                <th className="p-3.5">Name</th>
                                <th className="p-3.5">Flat Number</th>
                                <th className="p-3.5">Enrollment Category</th>
                                <th className="p-3.5">Phone Address</th>
                                <th className="p-3.5">Vehicle RFID</th>
                                <th className="p-3.5 text-center">Status/Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {filteredResidents.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold italic">
                                    No matching resident records found.
                                  </td>
                                </tr>
                              ) : (
                                filteredResidents.map((r) => {
                                  const isDefaulter = r.status === "Defaulter";
                                  return (
                                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                                      <td className="p-3.5">
                                        <div className="font-bold text-slate-100">{r.name}</div>
                                      </td>
                                      <td className="p-3.5">
                                        <span className="font-black text-indigo-400 font-mono">
                                          {r.wing}-{r.flat}
                                        </span>
                                      </td>
                                      <td className="p-3.5">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                          r.category === "Owner"
                                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                            : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                        }`}>
                                          {r.category}
                                        </span>
                                      </td>
                                      <td className="p-3.5 font-mono text-slate-300">
                                        {r.phone}
                                      </td>
                                      <td className="p-3.5 font-mono text-slate-400">
                                        {r.vehicleRfid}
                                      </td>
                                      <td className="p-3.5 text-center">
                                        {isDefaulter ? (
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 border border-red-500/30 text-[9px] font-bold rounded uppercase">
                                              Defaulter
                                            </span>
                                            <button
                                              onClick={() => triggerDefaulterNotice(r.name, `${r.wing}-${r.flat}`)}
                                              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2.5 py-1 rounded text-[9px] uppercase tracking-wider transition active:scale-95 flex items-center gap-1"
                                            >
                                              <Send className="w-3 h-3" /> 🚨 नोटिस भेजें
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="bg-green-500/10 text-green-400 border border-green-500/25 px-2 py-0.5 text-[9px] font-bold rounded uppercase">
                                            Compliant
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Roster Add Form Sidebar */}
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                      <div>
                        <h4 className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-1">
                          <UserPlus className="w-4 h-4 text-indigo-400" /> New Resident Enrollment
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                          Register an incoming resident owner or tenant, assign parking RFIDs, and allocate initial chanda contributions.
                        </p>
                      </div>

                      <form onSubmit={handleAddResident} className="space-y-3.5 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Babita Krishnan Iyer"
                            value={newResName}
                            onChange={(e) => setNewResName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Wing</label>
                            <select
                              value={newResWing}
                              onChange={(e) => setNewResWing(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                            >
                              <option value="A">Wing A</option>
                              <option value="B">Wing B</option>
                              <option value="C">Wing C</option>
                              <option value="D">Wing D</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Flat No.</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 104"
                              value={newResFlat}
                              onChange={(e) => setNewResFlat(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-semibold font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Category</label>
                            <select
                              value={newResCategory}
                              onChange={(e) => setNewResCategory(e.target.value as any)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold cursor-pointer"
                            >
                              <option value="Owner">Owner</option>
                              <option value="Tenant">Tenant</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">RFID Tag</label>
                            <input
                              type="text"
                              placeholder="e.g. RFID-B104-BI"
                              value={newResRfid}
                              onChange={(e) => setNewResRfid(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 90001 22222"
                            value={newResPhone}
                            onChange={(e) => setNewResPhone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-semibold"
                          />
                        </div>

                        <div className="space-y-1 bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                          <label className="block text-[10px] font-bold text-amber-400 uppercase">Initial Vargani Paid (₹)</label>
                          <input
                            type="number"
                            placeholder="₹ Paid Contribution"
                            value={newResPaid}
                            onChange={(e) => setNewResPaid(e.target.value)}
                            className="w-full bg-slate-850 border border-slate-700 rounded p-2 text-white font-mono font-black text-amber-300 mt-1"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Add Resident to Roster
                        </button>
                      </form>
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTab === "securitydesk" && (
                <motion.div
                  key="tab-securitydesk"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700">
                    <SecurityDesk />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Elegant Alert/Modal overlay for sending Notice to Defaulters */}
      <AnimatePresence>
        {activeNoticeAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center relative"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                🚨
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Dispatch Payment Default Notice
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Sending secure SMS & Mobile Push Alert to defaulter:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-xs font-mono text-slate-100">
                  <span className="block font-bold text-indigo-400">{activeNoticeAlert.name}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Flat Number: {activeNoticeAlert.flat}</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] p-3 rounded-lg text-left leading-relaxed font-semibold">
                🔔 Notice Draft: "Urgent. Please clear your remaining pending Shree Ganeshotsav/Navratri festival vargani amount to balance the society's event planning portfolio."
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    alert(`🟢 Notice dispatched successfully to ${activeNoticeAlert.name}!`);
                    setActiveNoticeAlert(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wide transition active:scale-95"
                >
                  Send Notice / भेजें
                </button>
                <button
                  onClick={() => setActiveNoticeAlert(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition"
                >
                  Cancel / निरस्त
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
