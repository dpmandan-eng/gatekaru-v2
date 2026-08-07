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
  Briefcase,
  BarChart2,
  TrendingUp,
  Activity,
  Smartphone,
  Tv,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Siren,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Visitor, MaintenanceBill, Complaint, Notice, Poll, GuardAlert } from "../types";
import UserAnalytics from "./UserAnalytics";
import GateAnalyticsChart from "./GateAnalyticsChart";
import MonthlySecurityTrendsChart from "./MonthlySecurityTrendsChart";
import EmergencyLogTab from "./EmergencyLogTab";
import SOSHeatmap from "./SOSHeatmap";
import AISecurityFeatures from "./AISecurityFeatures";
import { StatCardSkeleton, ListCardSkeleton, ChartCardSkeleton, DashboardGridSkeleton } from "./Skeleton";

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
  // Tabs: Summary Hub, My Home, Committee Desk, Activity Logs, User Analytics
  const [activeTab, setActiveTab] = useState<"summary" | "home" | "committee" | "logs" | "analytics">("summary");
  const [logScope, setLogScope] = useState<"mine" | "all">("mine");
  const [logTypeFilter, setLogTypeFilter] = useState<"all" | "gate_entry" | "approval" | "alert">("all");
  const [logSearch, setLogSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshDashboard = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };
  
  // Modals / Form toggles
  const [showPreapproveModal, setShowPreapproveModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showQuickDialModal, setShowQuickDialModal] = useState(false);
  const [pendingDispatchTemplate, setPendingDispatchTemplate] = useState<any>(null);
  const [quickDialResult, setQuickDialResult] = useState<any>(null);
  const [isQuickDialing, setIsQuickDialing] = useState(false);

  const quickDialTemplates = [
    {
      id: "medical",
      label: "Medical Emergency",
      hindiLabel: "चिकित्सा आपातकाल",
      icon: "🚑",
      badge: "Priority 1",
      color: "from-red-600 to-rose-700 text-white",
      type: "Medical Emergency",
      defaultText: "Urgent medical assistance requested at Flat " + (currentUser?.flat || "A-402") + "! Please dispatch first-aid and coordinate ambulance."
    },
    {
      id: "fire",
      label: "Fire / Smoke Hazard",
      hindiLabel: "आग / धुआँ चेतावनी",
      icon: "🔥",
      badge: "High Alert",
      color: "from-amber-600 to-orange-700 text-white",
      type: "Fire Hazard",
      defaultText: "Fire / Smoke outbreak reported near Flat " + (currentUser?.flat || "A-402") + "! Guard desk inspect immediately with extinguishers."
    },
    {
      id: "intruder",
      label: "Intruder / Threat",
      hindiLabel: "सुरक्षा / संदिग्ध खतरा",
      icon: "🛡️",
      badge: "Security",
      color: "from-purple-600 to-indigo-800 text-white",
      type: "Security Threat",
      defaultText: "Unidentified intruder or suspicious movement near Flat " + (currentUser?.flat || "A-402") + "! Immediate guard deployment requested."
    },
    {
      id: "lift",
      label: "Lift Stuck / Trapped",
      hindiLabel: "लिफ्ट आपातकाल",
      icon: "⚡",
      badge: "Facility",
      color: "from-blue-600 to-cyan-700 text-white",
      type: "Elevator Emergency",
      defaultText: "Resident trapped inside elevator near Block A! Dispatched technician team & guard desk."
    },
    {
      id: "gate_block",
      label: "Gate Path Obstruction",
      hindiLabel: "द्वार मार्ग अवरोध",
      icon: "🚗",
      badge: "Access Gate",
      color: "from-slate-700 to-slate-900 text-white",
      type: "Gate Obstruction",
      defaultText: "Emergency vehicle or driveway route blocked at Main Gate. Guard clear obstruction immediately."
    }
  ];

  const handleQuickDialDispatchUnified = async (template: typeof quickDialTemplates[0]) => {
    setIsQuickDialing(true);
    setQuickDialResult(null);
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
        setQuickDialResult({
          message: fullMsg,
          type: template.type,
          dispatches: data.dispatches || [],
          timestamp: new Date().toLocaleTimeString()
        });
        if (onTriggerSOS) {
          onTriggerSOS(template.type, fullMsg);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuickDialing(false);
    }
  };

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

  // -------------------------------------------------------------
  // Chronological Activity Logs Calculations
  // -------------------------------------------------------------
  const isMultiRoleUser = currentUser.role === "admin" || currentUser.role === "super_admin" || currentUser.role === "guard" || currentUser.role === "both";

  const allLogs = React.useMemo(() => {
    interface LogItem {
      id: string;
      type: "gate_entry" | "approval" | "alert";
      title: string;
      titleHindi?: string;
      description: string;
      timestamp: string;
      status?: string;
      flat?: string;
      badgeColor: string;
    }
    const logs: LogItem[] = [];

    // 1. Gate Entries (Checked-In/Checked-Out visitors)
    const activeVisitorScope = logScope === "all" ? visitors : myVisitors;
    activeVisitorScope.forEach(v => {
      if (v.status === "Checked-In" && v.checkedInAt) {
        logs.push({
          id: `gate_in_${v.id}`,
          type: "gate_entry",
          title: `Gate Entry: ${v.name} Checked-In`,
          titleHindi: `गेट प्रवेश: ${v.name} अंदर आए`,
          description: `Type: ${v.type} • Purpose: ${v.purpose} • Gate: ${v.gateName || "Main Gate"} ${v.vehicleNumber ? `• Vehicle: ${v.vehicleNumber}` : ""}`,
          timestamp: v.checkedInAt,
          status: "Checked-In",
          flat: v.flat,
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        });
      } else if (v.status === "Checked-Out" && v.checkedOutAt) {
        // Render both if we have timestamps for both
        if (v.checkedInAt) {
          logs.push({
            id: `gate_in_${v.id}`,
            type: "gate_entry",
            title: `Gate Entry: ${v.name} Checked-In`,
            titleHindi: `गेट प्रवेश: ${v.name} अंदर आए`,
            description: `Type: ${v.type} • Purpose: ${v.purpose} • Gate: ${v.gateName || "Main Gate"} ${v.vehicleNumber ? `• Vehicle: ${v.vehicleNumber}` : ""}`,
            timestamp: v.checkedInAt,
            status: "Checked-In",
            flat: v.flat,
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
          });
        }
        logs.push({
          id: `gate_out_${v.id}`,
          type: "gate_entry",
          title: `Gate Exit: ${v.name} Checked-Out`,
          titleHindi: `गेट निकास: ${v.name} बाहर गए`,
          description: `Type: ${v.type} • Handled at: ${v.gateName || "Main Gate"}`,
          timestamp: v.checkedOutAt,
          status: "Checked-Out",
          flat: v.flat,
          badgeColor: "bg-slate-100 text-slate-800 border-slate-200"
        });
      }
    });

    // 2. Approvals & Pre-Approvals
    const activePreapprovedScope = logScope === "all" ? visitors : myVisitors;
    activePreapprovedScope.forEach(v => {
      if (v.status === "Pre-Approved") {
        logs.push({
          id: `approve_pre_${v.id}`,
          type: "approval",
          title: `Visitor Invite Pre-Approved: ${v.name}`,
          titleHindi: `आगंतुक आमंत्रण पूर्व-स्वीकृत: ${v.name}`,
          description: `Pre-approved guest invite passcode issued for Flat ${v.flat}. Code: ${v.passcode || "N/A"}`,
          timestamp: v.requestedAt,
          status: "Pre-Approved",
          flat: v.flat,
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        });
      }
    });

    // Maintenance Bills Paid
    const activeBillsScope = logScope === "all" ? bills : myBills;
    activeBillsScope.forEach(b => {
      if (b.status === "Paid" && b.paidAt) {
        logs.push({
          id: `approve_bill_${b.id}`,
          type: "approval",
          title: `Maintenance Bill Paid: ${b.title}`,
          titleHindi: `रखरखाव शुल्क का भुगतान: ${b.title}`,
          description: `Payment of ₹${b.amount} completed for Flat ${b.flat}. Ref: ${b.transactionId || "Online transaction"}`,
          timestamp: b.paidAt,
          status: "Paid",
          flat: b.flat,
          badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200"
        });
      }
    });

    // Complaints resolved or assigned
    const activeComplaintsScope = logScope === "all" ? complaints : myComplaints;
    activeComplaintsScope.forEach(c => {
      if (c.status === "Resolved") {
        const lastUpdate = c.updates && c.updates.length > 0 ? c.updates[c.updates.length - 1] : null;
        logs.push({
          id: `approve_complaint_${c.id}`,
          type: "approval",
          title: `Complaint Resolved: ${c.title}`,
          titleHindi: `शिकायत का समाधान: ${c.title}`,
          description: `Ticket regarding ${c.category} filed by ${c.residentName} (Flat ${c.flat}) is marked Resolved. ${lastUpdate ? `Comment: "${lastUpdate.note}"` : ""}`,
          timestamp: lastUpdate ? lastUpdate.date : c.createdAt,
          status: "Resolved",
          flat: c.flat,
          badgeColor: "bg-teal-100 text-teal-800 border-teal-200"
        });
      } else if (c.status === "Assigned") {
        logs.push({
          id: `assign_complaint_${c.id}`,
          type: "approval",
          title: `Complaint Ticket Assigned: ${c.title}`,
          titleHindi: `शिकायत टिकट आवंटित: ${c.title}`,
          description: `Ticket regarding ${c.category} (Flat ${c.flat}) was assigned to our technical field team.`,
          timestamp: c.createdAt,
          status: "Assigned",
          flat: c.flat,
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
        });
      }
    });

    // 3. System Alerts
    // Alerts are global security broadcasts
    alerts.forEach(a => {
      logs.push({
        id: `alert_${a.id}`,
        type: "alert",
        title: `Security Broadcast: ${a.type}`,
        titleHindi: `सुरक्षा प्रसारण: ${a.type}`,
        description: `${a.message} (Logged by ${a.sender || "Staff Guard"})`,
        timestamp: a.timestamp,
        status: a.status,
        badgeColor: a.status === "Active" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-slate-100 text-slate-800 border-slate-200"
      });
    });

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [visitors, myVisitors, bills, myBills, complaints, myComplaints, alerts, logScope]);

  const filteredLogs = React.useMemo(() => {
    return allLogs.filter(item => {
      if (logTypeFilter !== "all" && item.type !== logTypeFilter) return false;

      if (logSearch.trim()) {
        const query = logSearch.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query) || (item.titleHindi && item.titleHindi.toLowerCase().includes(query));
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesFlat = item.flat && item.flat.toLowerCase().includes(query);
        const matchesStatus = item.status && item.status.toLowerCase().includes(query);
        return !!(matchesTitle || matchesDesc || matchesFlat || matchesStatus);
      }
      return true;
    });
  }, [allLogs, logTypeFilter, logSearch]);

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
              onClick={handleRefreshDashboard}
              className="bg-indigo-950 hover:bg-indigo-900 text-indigo-200 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl border border-indigo-700/60 transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Refresh dashboard data and show skeleton loading"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => setShowQuickDialModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/60 animate-pulse hover:animate-none flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-300"
            >
              <PhoneCall className="w-4 h-4 text-slate-950 animate-bounce" /> Quick Dial SOS
            </button>
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
              onClick={() => setShowQuickDialModal(true)}
              className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-lg shadow-red-600/15 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" /> Trigger SOS
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 shrink-0 shadow-xs overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex gap-2 sm:gap-4 min-w-max">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "summary" 
                ? "border-indigo-600 text-indigo-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" /> Summary Hub (एकीकृत संक्षेप)
          </button>
          <button
            onClick={() => setActiveTab("emergencylog")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "emergencylog" 
                ? "border-rose-600 text-rose-700 font-extrabold bg-rose-50/50" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Siren className="w-4 h-4 text-rose-500 animate-pulse" /> Emergency Log (आपातकालीन लॉग)
          </button>
          <button
            onClick={() => setActiveTab("sosheatmap")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "sosheatmap" 
                ? "border-amber-600 text-amber-700 font-extrabold bg-amber-50/50" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-500" /> SOS Heatmap (SOS मैप)
          </button>
          <button
            onClick={() => setActiveTab("aifeatures")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "aifeatures" 
                ? "border-purple-600 text-purple-700 font-extrabold bg-purple-50/50" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 animate-spin" /> ✨ AI Features (AI सुरक्षा)
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
          <button
            onClick={() => setActiveTab("logs")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "logs" 
                ? "border-indigo-600 text-indigo-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" /> Activity Logs (गतिविधि लॉग)
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "analytics" 
                ? "border-indigo-600 text-indigo-700" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart2 className="w-4 h-4" /> User Analytics (यूज़र विश्लेषिकी)
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

          {isLoading ? (
            <DashboardGridSkeleton />
          ) : (
            <>
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

              {/* Peak Hour Gate Security Analytics & Monthly Security Trends */}
              <div className="lg:col-span-3 space-y-6">
                <GateAnalyticsChart darkMode={false} />
                <MonthlySecurityTrendsChart darkMode={false} />
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

          {/* ========================================================== */}
          {/* TAB 4: ACTIVITY LOGS (गतिविधि लॉग) */}
          {/* ========================================================== */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              {/* Header card with rich metadata */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl text-slate-600 shrink-0">
                    📋
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">
                      Comprehensive Activity Logs & Audit Trail / गतिविधि लॉग विवरण
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Real-time chronological ledger of visitor entries, pre-approvals, resolved complaints, paid bills, and security alerts.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Logged in as <span className="font-bold text-slate-600">{currentUser.name}</span> • Flat <span className="font-bold text-slate-600">{myFlat}</span> • Role: <span className="font-bold uppercase text-indigo-600">{currentUser.role}</span>
                    </p>
                  </div>
                </div>

                {/* Scope selector shown only to multi-role users */}
                {isMultiRoleUser && (
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shrink-0 self-stretch md:self-auto">
                    <button
                      onClick={() => setLogScope("mine")}
                      className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition cursor-pointer ${
                        logScope === "mine"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      My Flat Logs
                    </button>
                    <button
                      onClick={() => setLogScope("all")}
                      className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition cursor-pointer ${
                        logScope === "all"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      All Society Logs
                    </button>
                  </div>
                )}
              </div>

              {/* Filters Panel */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search by visitor name, flat number, alert message, passcode..."
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-300 transition"
                    />
                    <div className="absolute left-3 top-3.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {logSearch && (
                      <button
                        onClick={() => setLogSearch("")}
                        className="absolute right-2.5 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter category chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setLogTypeFilter("all")}
                      className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${
                        logTypeFilter === "all"
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      All ({allLogs.length})
                    </button>
                    <button
                      onClick={() => setLogTypeFilter("gate_entry")}
                      className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center gap-1.5 ${
                        logTypeFilter === "gate_entry"
                          ? "bg-emerald-800 border-emerald-800 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" /> Gate Entries ({allLogs.filter(l => l.type === "gate_entry").length})
                    </button>
                    <button
                      onClick={() => setLogTypeFilter("approval")}
                      className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center gap-1.5 ${
                        logTypeFilter === "approval"
                          ? "bg-indigo-800 border-indigo-800 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-600" /> Approvals & Actions ({allLogs.filter(l => l.type === "approval").length})
                    </button>
                    <button
                      onClick={() => setLogTypeFilter("alert")}
                      className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center gap-1.5 ${
                        logTypeFilter === "alert"
                          ? "bg-rose-800 border-rose-800 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Security Alerts ({allLogs.filter(l => l.type === "alert").length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed List */}
              <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto text-xl">
                      🔍
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-700">No activity logs matching your filter criteria / कोई गतिविधि लॉग नहीं मिला</p>
                      <p className="text-[10px] text-slate-400">Try refining your search text or switching the log type category.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLogs.map((item, idx) => {
                      const logDate = new Date(item.timestamp);
                      const dateStr = logDate.toLocaleDateString(globalLang === "hi" ? "hi-IN" : "en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      });
                      const timeStr = logDate.toLocaleTimeString(globalLang === "hi" ? "hi-IN" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <div
                          key={item.id}
                          className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-slate-300 transition duration-150"
                        >
                          {/* Log category icon wrapper */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                            item.type === "gate_entry" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                            item.type === "approval" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                            "bg-rose-50 border-rose-100 text-rose-600"
                          }`}>
                            {item.type === "gate_entry" && <ArrowRight className="w-4 h-4" />}
                            {item.type === "approval" && <CheckCircle className="w-4 h-4" />}
                            {item.type === "alert" && <AlertTriangle className="w-4 h-4" />}
                          </div>

                          {/* Log item details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-[11px] font-black text-slate-800 leading-tight">
                                  {item.title}
                                </h4>
                                {globalLang === "hi" && item.titleHindi && (
                                  <p className="text-[9px] text-slate-400 italic">
                                    {item.titleHindi}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] font-extrabold text-slate-700">{dateStr}</p>
                                <p className="text-[9px] text-slate-400">{timeStr}</p>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-600 italic">
                              "{item.description}"
                            </p>

                            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-400">
                              {item.flat && (
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold uppercase">
                                  Flat {item.flat}
                                </span>
                              )}
                              <span className="bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-sm capitalize">
                                Category: {item.type.replace("_", " ")}
                              </span>
                              {item.status && (
                                <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase border text-[8px] ${item.badgeColor}`}>
                                  {item.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB: EMERGENCY LOG (🚨 आपातकालीन लॉग) */}
          {/* ========================================================== */}
          {activeTab === "emergencylog" && (
            <div className="space-y-6">
              <EmergencyLogTab darkMode={false} />
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB: SOS HEATMAP & EMERGENCY RISK MAP (🗺️ SOS हीटमैप) */}
          {/* ========================================================== */}
          {activeTab === "sosheatmap" && (
            <div className="space-y-6">
              <SOSHeatmap darkMode={false} />
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB: AI SECURITY FEATURES (✨ AI सुरक्षा) */}
          {/* ========================================================== */}
          {activeTab === "aifeatures" && (
            <div className="space-y-6">
              <AISecurityFeatures darkMode={false} />
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: USER ANALYTICS & SECURITY TRENDS (यूज़र विश्लेषिकी) */}
          {/* ========================================================== */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <MonthlySecurityTrendsChart darkMode={false} />
              <GateAnalyticsChart darkMode={false} />
              <UserAnalytics />
            </div>
          )}

            </>
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

        {/* Quick Dial Emergency SOS Modal */}
        {showQuickDialModal && (
          <div className="fixed inset-0 bg-[#040612]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-red-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left my-8"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 text-white relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-amber-200">
                      <PhoneCall className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        🚨 Quick Dial Emergency Console
                      </span>
                      <h3 className="text-lg font-black tracking-tight mt-0.5">
                        Direct Guard & Admin Simultaneous Alert
                      </h3>
                      <p className="text-xs text-red-100 font-medium mt-0.5">
                        Flat {myFlat} • Greenwood Heights Society Admin & Guard Desk
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
                {/* Intercom Direct Call Buttons */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-red-600" />
                    <span>Direct Intercom Quick Dial Contacts</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">Gate 1 Guard</span>
                        <h5 className="font-extrabold text-slate-900 text-xs mt-2">Main Gate Cabin</h5>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">+91 98765 43210</p>
                      </div>
                      <a href="tel:+919876543210" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition">
                        <PhoneCall className="w-3.5 h-3.5" /> CALL GUARD
                      </a>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase">Admin Office</span>
                        <h5 className="font-extrabold text-slate-900 text-xs mt-2">Vikram Mehta (Admin)</h5>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">+91 98100 23456</p>
                      </div>
                      <a href="tel:+919810023456" className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition">
                        <PhoneCall className="w-3.5 h-3.5" /> CALL ADMIN
                      </a>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">Control Room</span>
                        <h5 className="font-extrabold text-slate-900 text-xs mt-2">Emergency Control</h5>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">+91 11-4020-8888</p>
                      </div>
                      <a href="tel:+911140208888" className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition">
                        <PhoneCall className="w-3.5 h-3.5" /> CALL DESK
                      </a>
                    </div>
                  </div>
                </div>

                {/* Pre-Configured Alert Triggers */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>1-Tap Pre-Configured Alert Triggers (Simultaneous Guard + Admin)</span>
                  </h4>
                  <div className="space-y-2.5">
                    {quickDialTemplates.map((template) => (
                      <div key={template.id} className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 bg-slate-100 rounded-xl">{template.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-slate-900 text-xs">{template.label}</h5>
                              <span className="text-[10px] text-slate-500 font-bold">({template.hindiLabel})</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">"{template.defaultText}"</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isQuickDialing}
                          onClick={() => setPendingDispatchTemplate(template)}
                          className={`bg-gradient-to-r ${template.color} hover:brightness-110 text-xs font-black px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50`}
                        >
                          <Send className="w-3.5 h-3.5" /> 1-TAP DISPATCH
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Dispatch Log */}
                {quickDialResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                        <span>ALERT DISPATCHED TO GUARD & ADMIN SIMULTANEOUSLY!</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">{quickDialResult.timestamp}</span>
                    </div>

                    <p className="text-xs text-emerald-950 font-bold bg-white/80 p-2 rounded-lg border border-emerald-100">
                      {quickDialResult.message}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {quickDialResult.dispatches.map((d: any, idx: number) => (
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

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold">GateKaru Emergency Protocol Operational</span>
                <button
                  type="button"
                  onClick={() => setShowQuickDialModal(false)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Console
                </button>
              </div>
            </motion.div>
          </div>
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
                    handleQuickDialDispatchUnified(template);
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
