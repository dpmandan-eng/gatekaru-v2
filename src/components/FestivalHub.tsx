import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  DollarSign, 
  UserCheck, 
  FileText, 
  CheckCircle, 
  Plus, 
  Trash, 
  Users, 
  Sparkles, 
  Heart,
  TrendingUp, 
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "resident" | "guard" | "admin" | "super_admin" | "both";
  flat?: string;
  type?: string;
  society?: string;
  designation?: string;
}

interface Coordinator {
  id: string;
  name: string;
  flat: string;
  phone: string;
  society: string;
}

interface Financials {
  society: string;
  totalEstimatedExpense: number;
  varganiPerFlat: number;
  societyFundContribution: number;
  activeFestival: "Ganeshotsav" | "Navratri";
}

interface Quotation {
  id: string;
  item: string;
  vendor: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  submittedBy: string;
  society: string;
}

interface VarganiCollection {
  id: string;
  residentName: string;
  flat: string;
  amountPaid: number;
  status: "Paid" | "Pending";
  society: string;
}

interface FestivalHubProps {
  currentUser: User;
  onRefreshPrograms?: () => void;
}

export default function FestivalHub({ currentUser, onRefreshPrograms }: FestivalHubProps) {
  const currentSociety = currentUser.society || "Greenwood Heights Society";
  const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin" || currentUser.role === "both";

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "coordinators" | "vargani" | "quotations">("dashboard");

  // State loaded from Server
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [financials, setFinancials] = useState<Financials>({
    society: currentSociety,
    totalEstimatedExpense: 50000,
    varganiPerFlat: 500,
    societyFundContribution: 10000,
    activeFestival: "Ganeshotsav"
  });
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [varganiCollections, setVarganiCollections] = useState<VarganiCollection[]>([]);
  const [societyResidents, setSocietyResidents] = useState<User[]>([]);

  // Interactive Forms
  const [newCoordName, setNewCoordName] = useState("");
  const [newCoordFlat, setNewCoordFlat] = useState("");
  const [newCoordPhone, setNewCoordPhone] = useState("");
  const [isSubmittingCoord, setIsSubmittingCoord] = useState(false);

  // Financial Edit State (Admin Only)
  const [isEditingFinancials, setIsEditingFinancials] = useState(false);
  const [editTotalExpense, setEditTotalExpense] = useState(50000);
  const [editVarganiPerFlat, setEditVarganiPerFlat] = useState(500);
  const [editSocietyFund, setEditSocietyFund] = useState(10000);
  const [editFestival, setEditFestival] = useState<"Ganeshotsav" | "Navratri">("Ganeshotsav");
  const [isSavingFinancials, setIsSavingFinancials] = useState(false);

  // Quotation Submission Form
  const [quoteItem, setQuoteItem] = useState("");
  const [quoteVendor, setQuoteVendor] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Quick collection recording form modal
  const [selectedResidentForPayment, setSelectedResidentForPayment] = useState<User | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Fetch all Festival Hub data
  const fetchHubData = async () => {
    try {
      const res = await fetch(`/api/festival/hub?society=${encodeURIComponent(currentSociety)}`);
      if (res.ok) {
        const data = await res.json();
        setCoordinators(data.coordinators || []);
        if (data.financials) {
          setFinancials(data.financials);
          setEditTotalExpense(data.financials.totalEstimatedExpense);
          setEditVarganiPerFlat(data.financials.varganiPerFlat);
          setEditSocietyFund(data.financials.societyFundContribution);
          setEditFestival(data.financials.activeFestival || "Ganeshotsav");
        }
        setQuotations(data.quotations || []);
        setVarganiCollections(data.varganiCollections || []);
        setSocietyResidents(data.residents || []);
      }
    } catch (err) {
      console.error("Error fetching festival hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [currentSociety]);

  // Check if current user is one of the assigned coordinators
  const isUserCoordinator = coordinators.some(
    (c) => c.name.toLowerCase() === currentUser.name.toLowerCase() || c.phone === currentUser.phone
  );

  const canManageHub = isAdmin || isUserCoordinator;

  // Add a Coordinator
  const handleAddCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoordName.trim()) return;

    if (coordinators.length >= 2) {
      alert("⚠️ Maximum of 2 coordinators can be assigned to run the festival. Please remove an existing coordinator first.");
      return;
    }

    setIsSubmittingCoord(true);
    try {
      const res = await fetch("/api/festival/coordinators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCoordName,
          flat: newCoordFlat,
          phone: newCoordPhone,
          society: currentSociety
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add coordinator");
      
      alert(`🟢 ${data.message}`);
      setNewCoordName("");
      setNewCoordFlat("");
      setNewCoordPhone("");
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmittingCoord(false);
    }
  };

  // Remove a Coordinator
  const handleRemoveCoordinator = async (id: string) => {
    if (!confirm("Are you sure you want to remove this festival coordinator?")) return;

    try {
      const res = await fetch(`/api/festival/coordinators/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("🟢 Coordinator removed successfully.");
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Save Financial parameters
  const handleSaveFinancials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFinancials(true);
    try {
      const res = await fetch("/api/festival/financials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalEstimatedExpense: editTotalExpense,
          varganiPerFlat: editVarganiPerFlat,
          societyFundContribution: editSocietyFund,
          activeFestival: editFestival,
          society: currentSociety
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("🟢 Festival parameters and budget updated successfully!");
      setIsEditingFinancials(false);
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsSavingFinancials(false);
    }
  };

  // Submit Quotation
  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteItem.trim() || !quoteVendor.trim() || !quoteAmount) {
      alert("Please fill all required fields.");
      return;
    }

    setIsSubmittingQuote(true);
    try {
      const res = await fetch("/api/festival/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: quoteItem,
          vendor: quoteVendor,
          amount: quoteAmount,
          submittedBy: currentUser.name,
          society: currentSociety
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("🟢 Quotation submitted successfully for review!");
      setQuoteItem("");
      setQuoteVendor("");
      setQuoteAmount("");
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Update Quotation Status
  const handleUpdateQuoteStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/festival/quotations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      alert(`🟢 Quotation marked as ${status}!`);
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Delete Quotation
  const handleDeleteQuotation = async (id: string) => {
    if (!confirm("Are you sure you want to remove this quotation?")) return;
    try {
      const res = await fetch(`/api/festival/quotations/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("🟢 Quotation deleted.");
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Quick mark paid or set payment
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentForPayment) return;

    setIsRecordingPayment(true);
    try {
      // Find existing collection record to check if we are updating, or if we need to create
      const existing = varganiCollections.find(
        (v) => v.flat === selectedResidentForPayment.flat || v.residentName === selectedResidentForPayment.name
      );

      const amt = Number(paymentAmount);
      const isFull = amt >= financials.varganiPerFlat;

      const res = await fetch("/api/festival/vargani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existing?.id || undefined,
          residentName: selectedResidentForPayment.name,
          flat: selectedResidentForPayment.flat || "N/A",
          amountPaid: amt,
          status: isFull ? "Paid" : "Pending",
          society: currentSociety
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`🟢 Payment recorded for ${selectedResidentForPayment.name}!`);
      setSelectedResidentForPayment(null);
      setPaymentAmount("");
      fetchHubData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const openPaymentModal = (resident: User) => {
    const existing = varganiCollections.find(
      (v) => v.flat === resident.flat || v.residentName === resident.name
    );
    setSelectedResidentForPayment(resident);
    setPaymentAmount(existing ? existing.amountPaid.toString() : financials.varganiPerFlat.toString());
  };

  // Financial Calculations
  const approvedQuotesSum = quotations
    .filter((q) => q.status === "Approved")
    .reduce((sum, q) => sum + q.amount, 0);

  const totalVarganiReceived = varganiCollections.reduce((sum, v) => sum + v.amountPaid, 0);
  
  // Per flat dues logic
  const totalFlatsCount = societyResidents.length || 1;
  const theoreticalVarganiCollection = totalFlatsCount * financials.varganiPerFlat;
  const remainingExpectedVargani = Math.max(0, theoreticalVarganiCollection - totalVarganiReceived);

  // Total fund available = Vargani Collected + Society Fund Portion
  const totalFundAvailable = totalVarganiReceived + financials.societyFundContribution;
  const financialBalance = totalFundAvailable - approvedQuotesSum;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-xs font-bold font-mono">LOADING FESTIVAL HUB DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Festive Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-6 text-white shadow-lg border border-orange-500/30">
        {/* Festive Overlay elements */}
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-yellow-400/20 blur-xl animate-pulse"></div>
        <div className="absolute left-1/3 bottom-0 w-24 h-24 rounded-full bg-red-400/20 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-yellow-400 text-orange-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Combined Festival Central Hub / उत्सव समिति
              </span>
              <span className="text-[10px] bg-white/20 text-white font-mono font-bold px-2 py-0.5 rounded-md">
                {currentSociety}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
              {financials.activeFestival === "Ganeshotsav" ? "✨ Shree Ganeshotsav Central Hub (गणेशोत्सव)" : "🪔 Navratri Mahotsav Central Hub (नवरात्रि)"}
            </h2>
            <p className="text-xs text-orange-100 font-medium max-w-2xl leading-relaxed">
              Complete community sandbox model for planning society festivals. All residents collectively assign 2 coordinators, review quotations, collect chanda/vargani, track expenses, and audit final balance distributions.
            </p>
          </div>

          <div className="flex gap-2">
            {canManageHub ? (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-400 flex items-center gap-1 shadow-sm uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Coordinator Access Active
              </span>
            ) : (
              <span className="bg-white/10 text-orange-100 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1 uppercase">
                <Users className="w-3.5 h-3.5" /> Resident View Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "dashboard"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Festival Board & Analytics
        </button>
        <button
          onClick={() => setActiveTab("coordinators")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "coordinators"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Coordinators / ज़िम्मेदारी ({coordinators.length}/2)
        </button>
        <button
          onClick={() => setActiveTab("vargani")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "vargani"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Chanda / Vargani Ledger
        </button>
        <button
          onClick={() => setActiveTab("quotations")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "quotations"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Vendor Quotations & Expenses
        </button>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="space-y-6">
        
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* 4 Cards Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Estimated Budget</p>
                  <p className="text-lg font-black text-slate-800">₹{financials.totalEstimatedExpense.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Per Flat: ₹{financials.varganiPerFlat}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vargani Collected</p>
                  <p className="text-lg font-black text-emerald-600">₹{totalVarganiReceived.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">From {varganiCollections.filter(v => v.status === "Paid").length} flats paid</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Society Fund Share</p>
                  <p className="text-lg font-black text-indigo-600">₹{financials.societyFundContribution.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Contribution from RWA</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`${financialBalance >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"} p-3 rounded-lg`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hub Balance State</p>
                  <p className={`text-lg font-black ${financialBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{financialBalance.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {financialBalance >= 0 ? "Surplus (Deposit back to fund)" : "Deficit (Need more chanda)"}
                  </p>
                </div>
              </div>

            </div>

            {/* Financial Math Progress Chart & Setup Control Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial Status Chart Box */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    📊 Complete Financial Progress Ledger / उत्सव खाता बही
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Visual comparison of approved vendor expenses, collections status, and society backup funding.
                  </p>
                </div>

                {/* Progress bar of collections */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Fund Collected vs Budget (बजट पूरा हुआ):</span>
                    <span className="font-bold text-amber-600">
                      {Math.round((totalFundAvailable / (financials.totalEstimatedExpense || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all" 
                      style={{ width: `${Math.min(100, (totalVarganiReceived / (financials.totalEstimatedExpense || 1)) * 100)}%` }}
                      title="Vargani Collected"
                    ></div>
                    <div 
                      className="bg-indigo-500 h-full transition-all" 
                      style={{ width: `${Math.min(100, (financials.societyFundContribution / (financials.totalEstimatedExpense || 1)) * 100)}%` }}
                      title="Society Fund Contribution"
                    ></div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold mt-1 text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Vargani Collected: ₹{totalVarganiReceived}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span> Society Fund: ₹{financials.societyFundContribution}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> Remaining Target: ₹{Math.max(0, financials.totalEstimatedExpense - totalFundAvailable)}
                    </span>
                  </div>
                </div>

                {/* Financial Math table breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 text-xs">
                  <div className="border-b border-slate-200/60 pb-2 flex justify-between font-bold text-slate-700">
                    <span>Transaction Component</span>
                    <span>Amount (₹)</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-600">
                    <span>Total Target Budget (कुल बजट):</span>
                    <span className="font-bold">₹{financials.totalEstimatedExpense}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Approved Vendor Quotations (actual costs):</span>
                    <span className="font-bold text-orange-600">- ₹{approvedQuotesSum}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 border-t border-slate-200/50 pt-2">
                    <span>1. Chanda/Vargani Collected from Residents:</span>
                    <span className="font-bold text-emerald-600">+ ₹{totalVarganiReceived}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>2. Subsidized Society Fund portion:</span>
                    <span className="font-bold text-indigo-600">+ ₹{financials.societyFundContribution}</span>
                  </div>

                  <div className="flex justify-between font-black text-slate-800 border-t-2 border-dashed border-slate-300 pt-2 text-sm bg-amber-50/50 p-2 rounded-lg">
                    <span>Remaining Balance in Festival Wallet:</span>
                    <span className={financialBalance >= 0 ? "text-green-600" : "text-red-600"}>
                      ₹{financialBalance}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    * {financialBalance >= 0 
                      ? "Balance amount will be credited back / deposited into the primary Society Fund." 
                      : "Deficit detected. Society needs to either raise Vargani per flat, request more from Society Fund, or reject high expense vendor quotes."}
                  </p>
                </div>

              </div>

              {/* Edit Budget Config Box */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    ⚙️ Budget Configuration
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingFinancials(!isEditingFinancials)}
                      className="text-xs text-indigo-600 hover:underline font-bold"
                    >
                      {isEditingFinancials ? "Cancel" : "Edit / बदलें"}
                    </button>
                  )}
                </div>

                {!isEditingFinancials ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1.5">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Active Celebration</p>
                      <h5 className="font-black text-slate-800 flex items-center gap-1.5">
                        {financials.activeFestival === "Ganeshotsav" ? "🎪 Shree Ganeshotsav" : "🪔 Navratri Mahotsav"}
                      </h5>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">Estimated Expense:</span>
                        <strong className="text-slate-800">₹{financials.totalEstimatedExpense}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">Contribution per Flat:</span>
                        <strong className="text-slate-800">₹{financials.varganiPerFlat}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">Society Fund Contribution:</span>
                        <strong className="text-slate-800">₹{financials.societyFundContribution}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Society Flats:</span>
                        <strong className="text-slate-800">{totalFlatsCount} Flats</strong>
                      </div>
                    </div>
                    
                    {!isAdmin && (
                      <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-500 flex items-start gap-1.5 leading-normal">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Only Society Committee members are authorized to edit these budget parameters.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSaveFinancials} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Active Celebration</label>
                      <select
                        value={editFestival}
                        onChange={(e) => setEditFestival(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                      >
                        <option value="Ganeshotsav">🎪 Ganeshotsav (गणेशोत्सव)</option>
                        <option value="Navratri">🪔 Navratri (नवरात्रि)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Total Estimated Expense (₹)</label>
                      <input
                        type="number"
                        value={editTotalExpense}
                        onChange={(e) => setEditTotalExpense(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Vargani per Flat (₹)</label>
                      <input
                        type="number"
                        value={editVarganiPerFlat}
                        onChange={(e) => setEditVarganiPerFlat(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                        required
                      />
                      <p className="text-[9px] text-slate-400">Total expected chanda: ₹{totalFlatsCount * editVarganiPerFlat}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Society Fund Contribution (₹)</label>
                      <input
                        type="number"
                        value={editSocietyFund}
                        onChange={(e) => setEditSocietyFund(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingFinancials}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition uppercase"
                    >
                      {isSavingFinancials ? "Saving Parameters..." : "Save Configuration"}
                    </button>
                  </form>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: COORDINATORS (ZIMMEDARI) ==================== */}
        {activeTab === "coordinators" && (
          <div className="space-y-6">
            
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-850 flex gap-3 text-xs leading-relaxed">
              <span className="text-xl">🤝</span>
              <div>
                <strong className="block">collective Duty Assignment (ज़िम्मेदारी आवंटन):</strong>
                सभी सोसायटी वाले मिलकर किसी दो निवासियों को त्यौहार के सफल संचालन की जिम्मेदारी देते हैं। ये समन्वयक कार्यक्रम की रूपरेखा तैयार करेंगे, चंदा इकट्ठा करेंगे, और खर्चों का लेखा-जोखा रखेंगे।
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Assign Coordinator form (Admin Only) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Assign Coordinator / ज़िम्मेदारी सौंपें
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Select active residents to oversee festive transactions and programs.
                  </p>
                </div>

                {canManageHub ? (
                  <form onSubmit={handleAddCoordinator} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Coordinator Name / नाम *</label>
                      <select
                        value={newCoordName}
                        onChange={(e) => {
                          const res = societyResidents.find((r) => r.name === e.target.value);
                          if (res) {
                            setNewCoordName(res.name);
                            setNewCoordFlat(res.flat || "");
                            setNewCoordPhone(res.phone || "");
                          } else {
                            setNewCoordName(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700 cursor-pointer"
                        required
                      >
                        <option value="">-- Choose Resident --</option>
                        {societyResidents.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name} (Flat {r.flat})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Flat / फ्लैट</label>
                      <input
                        type="text"
                        value={newCoordFlat}
                        onChange={(e) => setNewCoordFlat(e.target.value)}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2"
                        placeholder="e.g. A-402"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Contact Phone / फोन</label>
                      <input
                        type="tel"
                        value={newCoordPhone}
                        onChange={(e) => setNewCoordPhone(e.target.value)}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono"
                        placeholder="e.g. +91 99999 88888"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingCoord || coordinators.length >= 2}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-2 rounded-lg text-[10px] tracking-wider uppercase transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingCoord ? "Assigning..." : "Assign as Coordinator"}
                    </button>
                    {coordinators.length >= 2 && (
                      <p className="text-[9px] text-red-500 font-bold text-center">
                        ⚠️ Maximum limit of 2 coordinators reached.
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg text-[11px] text-slate-500 text-center">
                    <p className="font-bold">Administrative Access Required</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Only RWA Committee members can change or assign coordinators.
                    </p>
                  </div>
                )}
              </div>

              {/* Coordinators List */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Active Assigned Festival Leaders
                  </h4>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {coordinators.length} / 2 Assigned
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coordinators.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-400">
                      <p className="text-xs font-bold">No coordinators have been chosen yet for {currentSociety}.</p>
                      <p className="text-[10px] mt-1">Please designate leaders to manage Ganeshotsav/Navratri.</p>
                    </div>
                  ) : (
                    coordinators.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[9px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ⭐ Lead Coordinator
                          </span>
                          <h5 className="font-extrabold text-slate-800 text-sm">{c.name}</h5>
                          <p className="text-[10px] text-slate-500 font-semibold">Flat Block: {c.flat}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Phone: {c.phone}</p>
                        </div>

                        {canManageHub && (
                          <button
                            onClick={() => handleRemoveCoordinator(c.id)}
                            className="mt-4 self-end text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                          >
                            Remove Responsibility
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: CHANDA / VARGANI LEDGER ==================== */}
        {activeTab === "vargani" && (
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  🪙 Resident Vargani Collection Ledger (चंदा रसीद एवं बहीखाता)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete list of society residents. Collect per flat target of <strong className="text-amber-600 font-black">₹{financials.varganiPerFlat}</strong>.
                </p>
              </div>

              <div className="flex bg-amber-50 border border-amber-100 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold gap-4">
                <div>
                  <span className="block text-[9px] text-amber-600 uppercase font-bold">Total Collected</span>
                  <span className="text-sm font-black">₹{totalVarganiReceived}</span>
                </div>
                <div className="border-l border-amber-200 pl-4">
                  <span className="block text-[9px] text-amber-600 uppercase font-bold">Expected Balance</span>
                  <span className="text-sm font-black">₹{remainingExpectedVargani}</span>
                </div>
              </div>
            </div>

            {/* Resident Table with Vargani tracking */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  🏘️ Roster Allocation & Payment Register
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  Showing {societyResidents.length} Approved Flats
                </span>
              </div>

              <div className="divide-y divide-slate-150 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                      <th className="p-4">Resident / Flat</th>
                      <th className="p-4">Status / स्थिति</th>
                      <th className="p-4">Amount Paid / जमा</th>
                      <th className="p-4">Remaining Balance / बकाया</th>
                      {canManageHub && <th className="p-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {societyResidents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                          No registered residents found in this society. Add residents first!
                        </td>
                      </tr>
                    ) : (
                      societyResidents.map((res) => {
                        const rec = varganiCollections.find(
                          (v) => v.flat === res.flat || v.residentName === res.name
                        );
                        
                        const paidAmount = rec ? rec.amountPaid : 0;
                        const target = financials.varganiPerFlat;
                        const balance = Math.max(0, target - paidAmount);
                        const isFullyPaid = paidAmount >= target;

                        return (
                          <tr key={res.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{res.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Flat {res.flat || "N/A"} • {res.phone}
                              </div>
                            </td>
                            <td className="p-4">
                              {isFullyPaid ? (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                                  <CheckCircle className="w-3.5 h-3.5" /> Fully Paid / जमा
                                </span>
                              ) : paidAmount > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                                  ⚡ Partial Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                                  ⏳ Unpaid / शेष
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-black text-slate-700">
                              ₹{paidAmount}
                            </td>
                            <td className="p-4 font-bold text-slate-500">
                              {balance > 0 ? (
                                <span className="text-rose-600">₹{balance} pending</span>
                              ) : (
                                <span className="text-emerald-600">₹0</span>
                              )}
                            </td>
                            {canManageHub && (
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => openPaymentModal(res)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider transition active:scale-95"
                                >
                                  Update Collection / जमा करें
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: VENDOR QUOTATIONS ==================== */}
        {activeTab === "quotations" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Submit Quotation Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    📥 Submit Festival Quotation (निविदा प्रविष्टि)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Coordinators and residents can submit quotations from decorators, DJs, caterers, or pandals.
                  </p>
                </div>

                <form onSubmit={handleSubmitQuotation} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Item / Work Name *</label>
                    <input
                      type="text"
                      value={quoteItem}
                      onChange={(e) => setQuoteItem(e.target.value)}
                      placeholder="e.g. DJ Sound & Lights (10 Days)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Vendor / Contractor Name *</label>
                    <input
                      type="text"
                      value={quoteVendor}
                      onChange={(e) => setQuoteVendor(e.target.value)}
                      placeholder="e.g. Swara DJ Services Pune"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Quote Amount (₹) *</label>
                    <input
                      type="number"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition"
                  >
                    {isSubmittingQuote ? "Submitting quote..." : "Submit Quotation"}
                  </button>
                </form>
              </div>

              {/* Quotations List / Review Panel */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Vendor Quotations Pool
                  </h4>
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Approved Expenses: ₹{approvedQuotesSum}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {quotations.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-xs font-bold">No vendor quotations submitted yet.</p>
                      <p className="text-[10px] mt-1">Submit quotes from decor, sound, and catering vendors to start planning.</p>
                    </div>
                  ) : (
                    quotations.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded">
                              {q.vendor}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              q.status === "Approved" 
                                ? "bg-green-100 text-green-800" 
                                : q.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              ● {q.status}
                            </span>
                          </div>
                          
                          <h5 className="font-extrabold text-slate-800 text-xs">{q.item}</h5>
                          <p className="text-[10px] text-slate-400">
                            Submitted by: {q.submittedBy}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="font-mono text-sm font-black text-slate-800">
                            ₹{q.amount.toLocaleString()}
                          </span>

                          {canManageHub && (
                            <div className="flex gap-1.5">
                              {q.status !== "Approved" && (
                                <button
                                  onClick={() => handleUpdateQuoteStatus(q.id, "Approved")}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold p-1 rounded transition text-[10px] px-2"
                                  title="Approve this expense"
                                >
                                  Approve
                                </button>
                              )}
                              {q.status !== "Rejected" && (
                                <button
                                  onClick={() => handleUpdateQuoteStatus(q.id, "Rejected")}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1 rounded transition text-[10px] px-2"
                                  title="Reject quotation"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteQuotation(q.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Delete"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Quick Collection recording Modal */}
      <AnimatePresence>
        {selectedResidentForPayment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 relative"
            >
              <button
                onClick={() => setSelectedResidentForPayment(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Record Vargani Collection
                </span>
                <h4 className="font-extrabold text-slate-800 text-base">
                  Receive Vargani from {selectedResidentForPayment.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Flat: <strong className="text-slate-700">{selectedResidentForPayment.flat || "N/A"}</strong> • Target: <strong className="text-amber-600 font-bold">₹{financials.varganiPerFlat}</strong>
                </p>
              </div>

              <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Amount Received (₹) *</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="Enter amount paid"
                    required
                  />
                  <p className="text-[9px] text-slate-400">
                    If equal to or greater than ₹{financials.varganiPerFlat}, status will automatically mark as fully paid.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedResidentForPayment(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecordingPayment}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
                  >
                    {isRecordingPayment ? "Saving Payment..." : "Record Payment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
