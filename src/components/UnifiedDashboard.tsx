import React, { useState } from "react";
import { 
  Home, 
  Shield, 
  Sparkles, 
  Users, 
  CheckCircle, 
  Clock, 
  Plus, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight, 
  PlusCircle, 
  Send, 
  ThumbsUp, 
  Check, 
  X,
  FileText, 
  Megaphone,
  Vote,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Visitor, MaintenanceBill, Complaint, Notice, Poll, GuardAlert } from "../types";

interface UnifiedDashboardProps {
  currentUser: User;
  users: User[];
  visitors: Visitor[];
  onVisitorAction?: (visitorId: string, action: "approve" | "reject" | "checkout" | "checkin") => void;
  bills: MaintenanceBill[];
  onPayBill?: (billId: string) => void;
  complaints: Complaint[];
  onAddComplaint?: (newComp: Complaint) => void;
  onUpdateComplaint?: (id: string, status: "Pending" | "Assigned" | "Resolved", comment?: string) => void;
  notices: Notice[];
  onAddNotice?: (newNotice: Notice) => void;
  polls: Poll[];
  onVotePoll?: (pollId: string, optionId: string) => void;
  onAddPoll?: (newPoll: Poll) => void;
  alerts: GuardAlert[];
  onTriggerSOS?: (type: string, note?: string) => void;
  onResolveAlert?: (id: string) => void;
  globalLang: string;
  onApproveResident?: () => void;
}

export default function UnifiedDashboard({
  currentUser,
  users,
  visitors,
  onVisitorAction,
  bills,
  onPayBill,
  complaints,
  onAddComplaint,
  onUpdateComplaint,
  notices,
  onAddNotice,
  polls,
  onVotePoll,
  onAddPoll,
  alerts,
  onTriggerSOS,
  onResolveAlert,
  globalLang,
  onApproveResident
}: UnifiedDashboardProps) {
  // Tabs: Summary Hub, My Home, Committee Desk
  const [activeTab, setActiveTab] = useState<"summary" | "home" | "committee">("summary");
  
  // Modals / Form toggles
  const [showPreapproveModal, setShowPreapproveModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  // Form states - Pre-approve
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorType, setVisitorType] = useState("Guest");
  const [visitorVehicle, setVisitorVehicle] = useState("");

  // Form states - File Complaint
  const [compTitle, setCompTitle] = useState("");
  const [compCategory, setCompCategory] = useState("Plumbing");
  const [compDesc, setCompDesc] = useState("");
  const [compPriority, setCompPriority] = useState("Medium");

  // Form states - Add Notice
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("General");

  // Form states - Add Poll
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Yes", "No"]);

  // Local state for actions feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // -------------------------------------------------------------
  // Filtered lists for Resident role
  // -------------------------------------------------------------
  const myFlat = currentUser.flat || "Alpha-101";
  const myVisitors = visitors.filter(v => v.flat === myFlat);
  const myBills = bills.filter(b => b.flat === myFlat);
  const myComplaints = complaints.filter(c => c.flat === myFlat);

  // -------------------------------------------------------------
  // Committee Admin lists
  // -------------------------------------------------------------
  const pendingResidents = users.filter(u => u.role === "resident" && !u.isApproved);
  const activeSOS = alerts.filter(a => a.status === "Active");
  const societyComplaints = complaints.filter(c => c.status !== "Resolved");

  // Handle Approve Resident
  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to approve resident.");
      showFeedback("Resident account approved successfully! / निवासी को सफलतापूर्वक स्वीकृत किया गया।");
      if (onApproveResident) onApproveResident();
    } catch (err: any) {
      showFeedback(err.message || "Failed to approve.", "error");
    }
  };

  // Handle Pre-approve Visitor Submission
  const handlePreapproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) return;

    try {
      const response = await fetch("/api/visitors/preapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: visitorName,
          phone: visitorPhone,
          type: visitorType,
          flat: myFlat,
          vehicleNo: visitorVehicle,
          purpose: "Guest Visit",
          residentPhone: currentUser.phone
        })
      });

      if (!response.ok) throw new Error("Could not pre-approve.");
      
      showFeedback("Visitor pre-approved successfully & SMS notification queued! / अतिथि को पहले से स्वीकृत किया गया।");
      setShowPreapproveModal(false);
      setVisitorName("");
      setVisitorPhone("");
      setVisitorVehicle("");
      if (onApproveResident) onApproveResident(); // refresh
    } catch (err: any) {
      showFeedback(err.message || "Failed to pre-approve.", "error");
    }
  };

  // Handle File Complaint
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle || !compDesc) return;
    if (onAddComplaint) {
      const newComp: Complaint = {
        id: "c_" + Date.now(),
        flat: currentUser.flat || "Alpha-101",
        residentName: currentUser.name,
        title: compTitle,
        category: compCategory,
        description: compDesc,
        status: "Pending",
        createdAt: new Date().toISOString(),
        assignedTo: null,
        updates: []
      };
      onAddComplaint(newComp);
      showFeedback("Complaint filed successfully! Tracking has started. / शिकायत सफलतापूर्वक दर्ज की गई।");
      setShowComplaintModal(false);
      setCompTitle("");
      setCompDesc("");
    }
  };

  // Handle Add Notice
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    if (onAddNotice) {
      const newNotice: Notice = {
        id: "n_" + Date.now(),
        title: noticeTitle,
        category: noticeCategory,
        content: noticeContent,
        date: new Date().toLocaleDateString(),
        author: currentUser.name
      };
      onAddNotice(newNotice);
      showFeedback("Notice published & broadcasted to all residents! / सूचना सभी निवासियों को प्रसारित की गई।");
      setShowNoticeModal(false);
      setNoticeTitle("");
      setNoticeContent("");
    }
  };

  // Handle Add Poll
  const handlePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion || pollOptions.some(o => !o.trim())) return;
    if (onAddPoll) {
      const newPoll: Poll = {
        id: "p_" + Date.now(),
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim() !== "").map((text, i) => ({ id: `opt_${i}`, text, votes: 0 })),
        votedUsers: [],
        totalVotes: 0,
        endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };
      onAddPoll(newPoll);
      showFeedback("New voting poll created successfully! / नया पोल सफलतापूर्वक शुरू किया गया।");
      setShowPollModal(false);
      setPollQuestion("");
      setPollOptions(["Yes", "No"]);
    }
  };

  // Resolve SOS Alert
  const handleResolveAlertClick = (alertId: string) => {
    if (onResolveAlert) {
      onResolveAlert(alertId);
      showFeedback("SOS Incident marked as resolved. All stations cleared. / सुरक्षा अलर्ट हल कर दिया गया।");
    }
  };

  // Update Complaint Status
  const handleUpdateComplaintClick = (complaintId: string, status: "Pending" | "Assigned" | "Resolved") => {
    if (onUpdateComplaint) {
      onUpdateComplaint(complaintId, status, `Committee updated status to ${status}`);
      showFeedback(`Complaint status updated to ${status}!`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Banner / Header Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 shadow-md border-b border-indigo-800/40 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Core Multi-Role Suite
              </span>
              <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
                💎 Unified Account
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5">
              Dual Resident & Committee Dashboard
              <span className="text-sm font-semibold text-indigo-200">({currentUser.name})</span>
            </h1>
            <p className="text-xs text-indigo-200 font-medium">
              You possess full administrative committee rights while residing in Flat <span className="font-extrabold text-white">{myFlat}</span>. No portal switching required!
            </p>
          </div>
          
          {/* Quick Actions Header Trigger */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button 
              onClick={() => setShowPreapproveModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Pre-approve Guest
            </button>
            <button 
              onClick={() => setShowNoticeModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-lg shadow-emerald-600/15 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Megaphone className="w-4 h-4" /> Post Notice
            </button>
            <button 
              onClick={() => onTriggerSOS && onTriggerSOS("Medical Distress", "Initiated from Unified Dashboard")}
              className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-lg shadow-red-600/15 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" /> Trigger SOS
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "summary" 
                ? "border-indigo-600 text-indigo-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Summary Hub (एकीकृत संक्षेप)
          </button>
          <button
            onClick={() => setActiveTab("home")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "home" 
                ? "border-indigo-600 text-indigo-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-4 h-4" /> My Home / Resident (मेरा घर)
          </button>
          <button
            onClick={() => setActiveTab("committee")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "committee" 
                ? "border-indigo-600 text-indigo-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Committee Desk (प्रबंध समिति)
          </button>
        </div>
      </div>

      {/* Feedback Alert Overlay */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={`px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 border ${
              feedbackMsg.type === "success" 
                ? "bg-emerald-900 border-emerald-700 text-emerald-100" 
                : "bg-red-900 border-red-700 text-red-100"
            }`}>
              <span>{feedbackMsg.type === "success" ? "✓" : "⚠️"}</span>
              <span>{feedbackMsg.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ========================================================== */}
          {/* TAB 1: SUMMARY HUB (Bento Grid combining both worlds) */}
          {/* ========================================================== */}
          {activeTab === "summary" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Critical Alerts Row (SOS alerts if active, pending resident approvals) */}
              {(activeSOS.length > 0 || pendingResidents.length > 0) && (
                <div className="lg:col-span-3 space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">⚠️ Action Required (सोसायटी सुरक्षा एवं स्वीकृतियाँ)</h3>
                  
                  {/* SOS Box */}
                  {activeSOS.map(alert => (
                    <div key={alert.id} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-lg shrink-0">
                          🚨
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-red-800 uppercase">Emergency SOS Alert! {alert.type}</h4>
                          <p className="text-[10px] text-red-600 font-semibold">Logged by: {alert.sender} • {alert.message}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleResolveAlertClick(alert.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0"
                      >
                        Resolve Alert / बंद करें
                      </button>
                    </div>
                  ))}

                  {/* Pending Registrations Box */}
                  {pendingResidents.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-lg shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-amber-800 uppercase">New Resident Approvals Pending ({pendingResidents.length})</h4>
                          <p className="text-[10px] text-amber-600 font-semibold">New gate registrations awaiting committee verification and flat assignment.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveTab("committee")}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer"
                        >
                          Review List ({pendingResidents.length})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STATS OVERVIEW CARDS (BENTO) */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Flat Bills</p>
                    <p className="text-lg font-black text-slate-800 mt-1">
                      ₹{myBills.reduce((acc, b) => acc + (b.status === "Unpaid" ? b.amount : 0), 0)}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">Outstanding amount</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Pre-approvals</p>
                    <p className="text-lg font-black text-slate-800 mt-1">
                      {myVisitors.filter(v => v.status === "Pre-Approved").length} Active
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">Invites sent for {myFlat}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Society Defaulters</p>
                    <p className="text-lg font-black text-rose-600 mt-1">
                      {bills.filter(b => b.status === "Unpaid").length} Flats
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">Outstanding maintenance</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Complaints</p>
                    <p className="text-lg font-black text-slate-800 mt-1">
                      {complaints.filter(c => c.status !== "Resolved").length} Total
                    </p>
                    <p className="text-[9px] text-indigo-600 font-semibold">{myComplaints.filter(c => c.status !== "Resolved").length} filed by you</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* COLUMN 1: Resident Fast Desk */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">🏡 Resident Quick Access (घर नियंत्रण)</h3>
                  <button onClick={() => setActiveTab("home")} className="text-[10px] text-indigo-600 font-black hover:underline flex items-center gap-0.5">
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Outstanding Bills widget */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wide">My Flat Bills</h4>
                  {myBills.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-slate-400">No maintenance bills found for {myFlat}.</div>
                  ) : (
                    <div className="space-y-2">
                      {myBills.map(bill => (
                        <div key={bill.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{bill.title}</p>
                            <p className="text-[10px] text-slate-400">Due: {bill.dueDate || "Immediate"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-800">₹{bill.amount}</span>
                            {bill.status === "Unpaid" ? (
                              <button 
                                onClick={() => onPayBill && onPayBill(bill.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-1 rounded">PAID</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pre-approved visitors summary */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wide">Recent Invites ({myFlat})</h4>
                    <button 
                      onClick={() => setShowPreapproveModal(true)}
                      className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black px-2 py-1 rounded-lg transition"
                    >
                      + Create Invite
                    </button>
                  </div>
                  {myVisitors.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-slate-400">No pre-approved visitors registered.</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {myVisitors.slice(0, 3).map(v => (
                        <div key={v.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{v.name}</p>
                            <p className="text-[9px] text-slate-400">{v.type} • {v.phone}</p>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${
                            v.status === "Checked-In" ? "bg-emerald-100 text-emerald-800" :
                            v.status === "Pre-Approved" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: Committee Action Desk */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">📊 Committee Admin Desk (समिति नियंत्रण)</h3>
                  <button onClick={() => setActiveTab("committee")} className="text-[10px] text-indigo-600 font-black hover:underline flex items-center gap-0.5">
                    View Desk <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pending Approvals quick action */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wide">Pending Registrations ({pendingResidents.length})</h4>
                  {pendingResidents.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-emerald-600 font-semibold bg-emerald-50/50 rounded-xl border border-dashed border-emerald-100">
                      ✓ No pending resident signups.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingResidents.slice(0, 3).map(res => (
                        <div key={res.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{res.name}</p>
                            <p className="text-[9px] text-slate-400">Flat {res.flat || "Unassigned"} • {res.phone}</p>
                          </div>
                          <button 
                            onClick={() => handleApproveUser(res.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase px-2 py-1.5 rounded-lg transition shrink-0"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Society Complaints */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wide">Society Complaints ({societyComplaints.length})</h4>
                  {societyComplaints.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-slate-400">No unresolved complaints across society.</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {societyComplaints.slice(0, 3).map(c => (
                        <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{c.title}</p>
                              <p className="text-[9px] text-slate-400">Flat {c.flat} • {c.category}</p>
                            </div>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                              c.status === "Pending" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-100">
                            <button 
                              onClick={() => handleUpdateComplaintClick(c.id, "Assigned")}
                              className="text-[8px] font-bold uppercase text-amber-700 hover:bg-amber-50 px-2 py-1 rounded"
                            >
                              Assign Ticket
                            </button>
                            <button 
                              onClick={() => handleUpdateComplaintClick(c.id, "Resolved")}
                              className="text-[8px] font-bold uppercase text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 3: Broadcasts, notices & polls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">📢 Society Broadcasts (घोषणाएं और वोट)</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setShowPollModal(true)}
                      className="text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black px-2 py-1 rounded-lg transition"
                    >
                      + Start Poll
                    </button>
                  </div>
                </div>

                {/* Latest notices */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wide">Notice Board</h4>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto">
                    {notices.slice(0, 3).map(notice => (
                      <div key={notice.id} className="p-3 bg-slate-50/55 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                            {notice.category}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">{notice.date.split("T")[0]}</span>
                        </div>
                        <h5 className="text-xs font-extrabold text-slate-800">{notice.title}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Polls */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wide">Active Polls</h4>
                  {polls.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-slate-400">No active polls running.</div>
                  ) : (
                    <div className="space-y-3">
                      {polls.slice(0, 2).map(poll => {
                        const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                        return (
                          <div key={poll.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-xs font-black text-slate-800 leading-snug">{poll.question}</p>
                            <div className="space-y-1.5">
                              {poll.options.map((opt, idx) => {
                                const percentage = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => onVotePoll && onVotePoll(poll.id, opt.id)}
                                    className="w-full text-left p-2 rounded-lg border border-slate-100 bg-white hover:bg-indigo-50/20 text-[10px] font-bold text-slate-700 transition flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Vote className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{opt.text}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-600 h-full" style={{ width: `${percentage}%` }}></div>
                                      </div>
                                      <span className="font-extrabold">{percentage}%</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{totalVotes} residents voted</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: MY HOME (RESIDENT VIEW COMPARTMENT) */}
          {/* ========================================================== */}
          {activeTab === "home" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Resident Household profile summary */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
                      🏡
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">{currentUser.name}</h3>
                      <p className="text-xs text-slate-400">Flat {myFlat} • Greenwood Heights</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Resident Status:</span>
                      <span className="text-indigo-600 font-extrabold">{currentUser.type || "Owner Resident"}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Phone:</span>
                      <span className="text-slate-800">{currentUser.phone}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Vehicle Registered:</span>
                      <span className="text-slate-800">{currentUser.vehicleNo || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">Quick Operations</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setShowPreapproveModal(true)}
                      className="w-full py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left px-4 text-xs font-bold text-slate-700 hover:text-indigo-700 transition flex items-center justify-between"
                    >
                      <span>✨ Pre-approve Guest (अतिथि अनुमति)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setShowComplaintModal(true)}
                      className="w-full py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left px-4 text-xs font-bold text-slate-700 hover:text-indigo-700 transition flex items-center justify-between"
                    >
                      <span>🛠️ File Maintenance Complaint (शिकायत करें)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resident visitors logs & complaints tracker */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* My pre-approved and active visitors list */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">My Visitors / अतिथि लॉग</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Manage temporary guest passes and pre-approved security check-ins.</p>
                    </div>
                    <button 
                      onClick={() => setShowPreapproveModal(true)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-extrabold px-3 py-1.5 rounded-xl transition"
                    >
                      + Add Pre-approval
                    </button>
                  </div>
                  
                  {myVisitors.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No visitors have visited or been pre-approved for Flat {myFlat}.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {myVisitors.map(v => (
                        <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-base">
                              👤
                            </div>
                            <div>
                              <h5 className="text-xs font-extrabold text-slate-800">{v.name}</h5>
                              <p className="text-[10px] text-slate-400">{v.type} • {v.phone} • {v.requestedAt || "Scheduled"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${
                              v.status === "Checked-In" ? "bg-emerald-100 text-emerald-800" :
                              v.status === "Pre-Approved" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-600"
                            }`}>
                              {v.status}
                            </span>
                            {v.status === "Pre-Approved" && (
                              <button 
                                onClick={() => onVisitorAction && onVisitorAction(v.id, "reject")}
                                className="text-[10px] font-bold text-red-600 hover:bg-red-50 p-1 rounded"
                                title="Cancel Invite"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* My Registered complaints */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase">My Complaints / मेरी शिकायतें</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Track your individual flat repair or services tickets.</p>
                    </div>
                    <button 
                      onClick={() => setShowComplaintModal(true)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-extrabold px-3 py-1.5 rounded-xl transition"
                    >
                      + File Complaint
                    </button>
                  </div>

                  {myComplaints.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No complaints registered by Flat {myFlat}. Society maintenance is currently perfect!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myComplaints.map(c => (
                        <div key={c.id} className="py-4 space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-extrabold text-slate-800">{c.title}</h5>
                              <p className="text-[10px] text-slate-400">{c.category} • Filed on {c.createdAt.split("T")[0]}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              c.status === "Resolved" ? "bg-emerald-100 text-emerald-800" :
                              c.status === "Assigned" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: COMMITTEE DESK (ADMIN DUTIES COMPARTMENT) */}
          {/* ========================================================== */}
          {activeTab === "committee" && (
            <div className="space-y-6">
              
              {/* Committee Welcome Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl text-indigo-600 shrink-0">
                    👑
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">Management Committee Executive Desk</h3>
                    <p className="text-xs text-slate-400">Greenwood Heights Society Administrative control room. Review audit approvals and notice boards.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowNoticeModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold uppercase px-3.5 py-2 rounded-xl transition"
                  >
                    + Publish Notice
                  </button>
                  <button 
                    onClick={() => setShowPollModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold uppercase px-3.5 py-2 rounded-xl transition"
                  >
                    + Create Poll
                  </button>
                </div>
              </div>

              {/* Pending Approvals & Security alerts detail */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pending Members Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-3 mb-4">
                    Member Registration Approvals ({pendingResidents.length})
                  </h3>
                  
                  {pendingResidents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No residents are currently awaiting committee approval.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingResidents.map(res => (
                        <div key={res.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{res.name}</p>
                            <p className="text-[10px] text-slate-400">Flat {res.flat || "Unassigned"} • Phone: {res.phone}</p>
                            <p className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1 font-bold">
                              Type: {res.type || "Owner"}
                            </p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button 
                              onClick={() => handleApproveUser(res.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase px-3 py-2 rounded-lg transition"
                            >
                              Approve / स्वीकृत
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Global Society Complaints Review */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-3 mb-4">
                    All Active Society Tickets ({societyComplaints.length})
                  </h3>
                  
                  {societyComplaints.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      All society-wide complaints are completely resolved. Amazing work!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {societyComplaints.map(c => (
                        <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{c.title}</p>
                              <p className="text-[10px] text-slate-500">Flat {c.flat} • {c.category} • Status: {c.status}</p>
                            </div>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                              c.status === "Pending" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 italic">"{c.description}"</p>
                          <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/50">
                            {c.status !== "Assigned" && (
                              <button 
                                onClick={() => handleUpdateComplaintClick(c.id, "Assigned")}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[9px] font-black uppercase px-2.5 py-1 rounded"
                              >
                                Assign Ticket
                              </button>
                            )}
                            <button 
                              onClick={() => handleUpdateComplaintClick(c.id, "Resolved")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* ========================================================== */}
      {/* MODAL 1: PRE-APPROVE GUEST (निवासी गेस्ट पास) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showPreapproveModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                  <span>🏡 Pre-Approve Guest Entry</span>
                </h3>
                <button onClick={() => setShowPreapproveModal(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePreapproveSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Guest Full Name (अतिथि का नाम)</label>
                  <input 
                    type="text" 
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="E.g., Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Mobile Number (मोबाइल नंबर)</label>
                  <input 
                    type="text" 
                    required
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="E.g., +91 98989 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Visitor Type</label>
                    <select 
                      value={visitorType}
                      onChange={(e) => setVisitorType(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Guest">Guest (मेहमान)</option>
                      <option value="Delivery">Delivery (डिलीवरी)</option>
                      <option value="Cab Driver">Cab (कैब)</option>
                      <option value="House Help">House Help / Maid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Vehicle No (Optional)</label>
                    <input 
                      type="text" 
                      value={visitorVehicle}
                      onChange={(e) => setVisitorVehicle(e.target.value)}
                      placeholder="E.g., HR-26-CD-1111"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow-lg shadow-indigo-600/15"
                  >
                    Generate Entry Code / कोड बनाएं
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL 2: FILE COMPLAINT (शिकायत दर्ज) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showComplaintModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                  <span>🛠️ File Maintenance Ticket</span>
                </h3>
                <button onClick={() => setShowComplaintModal(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleComplaintSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Ticket Title / विषय</label>
                  <input 
                    type="text" 
                    required
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    placeholder="E.g., Leakage in Washroom pipeline"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Category</label>
                    <select 
                      value={compCategory}
                      onChange={(e) => setCompCategory(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Plumbing">Plumbing (नलसाजी)</option>
                      <option value="Electricity">Electricity (बिजली)</option>
                      <option value="Elevator">Elevator (लिफ्ट)</option>
                      <option value="Security">Security (सुरक्षा)</option>
                      <option value="Cleanliness">Cleanliness (सफाई)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Priority Level</label>
                    <select 
                      value={compPriority}
                      onChange={(e) => setCompPriority(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Low">Low (सामान्य)</option>
                      <option value="Medium">Medium (मध्यम)</option>
                      <option value="High">High (तत्काल)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Detailed Description (पूरा विवरण)</label>
                  <textarea 
                    required
                    rows={3}
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Provide details of the problem so maintenance staff can bring correct parts..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow-lg"
                  >
                    Submit Ticket / शिकायत दर्ज करें
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL 3: ADD NOTICE (प्रबंध समिति सूचना बोर्ड) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showNoticeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                  <span>📢 Broadcast Society Notice</span>
                </h3>
                <button onClick={() => setShowNoticeModal(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleNoticeSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Notice Title (सूचना का शीर्षक)</label>
                  <input 
                    type="text" 
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="E.g., Lift Repair Schedule Maintenance"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Notice Category</label>
                  <select 
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="General">General / सामान्य</option>
                    <option value="Maintenance">Maintenance / रखरखाव</option>
                    <option value="Billing">Billing & Accounting</option>
                    <option value="Festival">Festival & Events</option>
                    <option value="Security">Security Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Notice content (घोषणा विवरण)</label>
                  <textarea 
                    required
                    rows={4}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Dear Residents, please be informed that Block-C lift will remain unoperational between 1 PM to 5 PM today for routine checkup..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow-lg"
                  >
                    Publish Bulletin / नोटिस जारी करें
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL 4: START POLL (नया पोल शुरू करें) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showPollModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                  <span>📊 Open Voting Poll</span>
                </h3>
                <button onClick={() => setShowPollModal(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePollSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Voting Question (पोल का सवाल)</label>
                  <input 
                    type="text" 
                    required
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="E.g., Should we install solar panels in Block A?"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Voting Options</label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-extrabold">{idx + 1}.</span>
                      <input 
                        type="text" 
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      />
                      {pollOptions.length > 2 && (
                        <button 
                          type="button" 
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 rounded"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-[9px] text-indigo-600 font-black hover:underline mt-1 block"
                  >
                    + Add option
                  </button>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow-lg"
                  >
                    Launch Voting Poll / पोल शुरू करें
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
