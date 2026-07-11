import React, { useState } from "react";
import { 
  User, Visitor, MaintenanceBill, Complaint, Notice, ChatMessage, StaffMember, ParkingSpot, Poll, GuardAlert
} from "../types";
import { getTranslation } from "../utils/translations";
import { 
  Plus, Sparkles, ClipboardList, Send, Users, Activity, FileText, Check, 
  HelpCircle, Trash, AlertTriangle, Play, ChevronRight, Eye, RefreshCw, BarChart, Volume2, Globe,
  Video, Shield, Server, Wifi, Search, X, Mail, Phone, Car, Building, User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALERT_TEMPLATES, INDIAN_LANGUAGES } from "../utils/alertTemplates";
import { SmartSurveillanceConfig } from "./SmartSurveillanceConfig";

interface AdminPortalProps {
  currentUser: User;
  users: User[];
  onApproveResident?: (userId: string) => void;
  visitors: Visitor[];
  bills: MaintenanceBill[];
  complaints: Complaint[];
  onUpdateComplaint: (id: string, status: "Pending" | "Assigned" | "Resolved", assignedTo?: string, note?: string) => void;
  notices: Notice[];
  onAddNotice: (newNotice: Notice) => void;
  onGenerateNoticeAi: (topic: string, category: string, callback: (data: { title: string; content: string }) => void) => void;
  polls: Poll[];
  onAddPoll?: (newPoll: Poll) => void;
  staff: StaffMember[];
  parking: ParkingSpot[];
  onGetAiAnalytics: (callback: (data: { summary: string; stats: any }) => void) => void;
  alerts: GuardAlert[];
  onTriggerSOS: (msg: string, type?: string) => void;
  onResolveAlert: (id: string) => void;
  globalLang?: string;
}

export default function AdminPortal({
  currentUser,
  users,
  onApproveResident,
  visitors,
  bills,
  complaints,
  onUpdateComplaint,
  notices,
  onAddNotice,
  onGenerateNoticeAi,
  polls,
  onAddPoll,
  staff,
  parking,
  onGetAiAnalytics,
  alerts,
  onTriggerSOS,
  onResolveAlert,
  globalLang = "en"
}: AdminPortalProps) {
  const t = (key: string, def: string) => getTranslation(globalLang, key, def);
  // Admin Tabs
  const [activeTab, setActiveTab] = useState<"flats" | "complaints" | "notices" | "polls" | "analytics" | "erp" | "sos" | "cctv">("flats");

  // Committee SOS Broadcast States
  const [selectedAlertTemplate, setSelectedAlertTemplate] = useState<string>("fire_emergency");
  const [customAlertMessage, setCustomAlertMessage] = useState<string>("");
  const [sosLoading, setSosLoading] = useState(false);

  // Notice states
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("Maintenance");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeAiTopic, setNoticeAiTopic] = useState("");
  const [isGeneratingNotice, setIsGeneratingNotice] = useState(false);

  // Poll creation
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOpt1, setPollOpt1] = useState("");
  const [pollOpt2, setPollOpt2] = useState("");
  const [pollOpt3, setPollOpt3] = useState("");

  // Complaint updates
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<"Pending" | "Assigned" | "Resolved">("Assigned");
  const [ticketTech, setTicketTech] = useState("Vikas Sharma (Electrician)");
  const [ticketNote, setTicketNote] = useState("");

  // Click/Search Details state
  const [selectedDetail, setSelectedDetail] = useState<{
    type: "resident" | "notice" | "complaint";
    data: any;
  } | null>(null);

  // Search inside Roster
  const [rosterSearch, setRosterSearch] = useState("");

  // AI Security Report
  const [aiReportText, setAiReportText] = useState("");
  const [aiReportStats, setAiReportStats] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // ERP water and fuel log
  const [waterTankers, setWaterTankers] = useState([
    { id: "wt1", capacity: "10,000L", provider: "Delhi Water Board", time: "09:00 AM", status: "Delivered & Filled" },
    { id: "wt2", capacity: "12,000L", provider: "Metro Water Supply", time: "01:30 PM", status: "Delivered & Filled" }
  ]);
  const [generatorFuel, setGeneratorFuel] = useState("84% (Approx. 42 hours backup time remaining)");

  // Add a water tanker log
  const logWaterTanker = () => {
    const capacities = ["10,000L", "12,000L", "8,000L"];
    const providers = ["Delhi Water Board", "Metro Water Supply", "Balaji Tankers"];
    const randomCap = capacities[Math.floor(Math.random() * capacities.length)];
    const randomProv = providers[Math.floor(Math.random() * providers.length)];
    
    setWaterTankers(prev => [
      ...prev,
      {
        id: `wt${Date.now()}`,
        capacity: randomCap,
        provider: randomProv,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Delivered & Filled"
      }
    ]);
  };

  // Trigger notice drafting with AI
  const handleGenerateNoticeWithAi = () => {
    if (!noticeAiTopic) return;
    setIsGeneratingNotice(true);
    onGenerateNoticeAi(noticeAiTopic, noticeCategory, (data) => {
      setNoticeTitle(data.title);
      setNoticeContent(data.content);
      setIsGeneratingNotice(false);
    });
  };

  // Submit Notice Form
  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    onAddNotice({
      id: `notice${Date.now()}`,
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      date: new Date().toISOString().split('T')[0],
      author: currentUser.name || "Society Admin Vikram Mehta"
    });

    setNoticeTitle("");
    setNoticeContent("");
    setNoticeAiTopic("");
    alert("Notice broadcasted and posted to all resident notice boards!");
  };

  // Update Ticket Action
  const handleSaveTicketUpdate = () => {
    if (!updatingTicketId) return;
    onUpdateComplaint(updatingTicketId, ticketStatus, ticketTech, ticketNote);
    setUpdatingTicketId(null);
    setTicketNote("");
    alert("Complaint status and technician assignment updated.");
  };

  // Trigger Gemini Visitor Analytics Report
  const handleGenerateSecurityReport = () => {
    setIsLoadingAnalytics(true);
    onGetAiAnalytics((data) => {
      setAiReportText(data.summary);
      setAiReportStats(data.stats);
      setIsLoadingAnalytics(false);
    });
  };

  // Add manual dummy poll
  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion || !pollOpt1 || !pollOpt2) return;

    if (onAddPoll) {
      onAddPoll({
        id: `pl${Date.now()}`,
        question: pollQuestion,
        options: [
          { id: "o1", text: pollOpt1, votes: 0 },
          { id: "o2", text: pollOpt2, votes: 0 },
          ...(pollOpt3 ? [{ id: "o3", text: pollOpt3, votes: 0 }] : [])
        ],
        votedUsers: [],
        totalVotes: 0,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
      setPollQuestion("");
      setPollOpt1("");
      setPollOpt2("");
      setPollOpt3("");
      alert("New Society poll created for resident voting!");
    }
  };

  return (
    <div id="admin-portal" className="flex flex-col h-full bg-slate-50 font-sans">
      
      {/* Horizontal Nav */}
      <div className="flex bg-white border-b border-slate-200 px-6 py-2 gap-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("flats")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "flats" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Users className="w-3.5 h-3.5" /> Flats & Resident Roster
        </button>
        <button 
          onClick={() => setActiveTab("complaints")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "complaints" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <ClipboardList className="w-3.5 h-3.5" /> Helpdesk Tickets Assign
        </button>
        <button 
          onClick={() => setActiveTab("notices")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "notices" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <FileText className="w-3.5 h-3.5" /> Notice Board Builder
        </button>
        <button 
          onClick={() => setActiveTab("polls")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "polls" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Activity className="w-3.5 h-3.5" /> Community Polls
        </button>
        <button 
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "analytics" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Visitor Analytics
        </button>
        <button 
          onClick={() => setActiveTab("erp")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "erp" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Activity className="w-3.5 h-3.5" /> Utility ERP (Water/Fuel)
        </button>
        <button 
          onClick={() => setActiveTab("cctv")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "cctv" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Video className="w-3.5 h-3.5" /> Smart Surveillance Config
        </button>
        <button 
          onClick={() => setActiveTab("sos")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "sos" ? "bg-red-600 text-white shadow-sm animate-pulse" : "text-red-600 hover:bg-red-50"}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Emergency SOS Dispatcher
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* ==================================== */}
        {/* TAB 1: FLATS & RESIDENT ROSTER */}
        {/* ==================================== */}
        {activeTab === "flats" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm">Greenwood Heights Flat Allocation Directory</h3>
              <p className="text-xs text-slate-500 mt-1">Management of registered resident owners, tenants, and vetting status.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase">Resident Roster ({
                    users.filter(u => u.role === "resident").filter(u => {
                      if (!rosterSearch) return true;
                      const term = rosterSearch.toLowerCase();
                      return u.name.toLowerCase().includes(term) || (u.flat && u.flat.toLowerCase().includes(term)) || (u.phone && u.phone.toLowerCase().includes(term));
                    }).length
                  } Found)</span>
                  <span className="text-[10px] text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded font-bold uppercase">Biometric Database Verified</span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search name, flat, phone..."
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Flat Number</th>
                      <th className="px-4 py-2.5">Enrollment Category</th>
                      <th className="px-4 py-2.5">Phone Address</th>
                      <th className="px-4 py-2.5">Vehicle RFID</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {users.filter(u => u.role === "resident").filter(u => {
                      if (!rosterSearch) return true;
                      const term = rosterSearch.toLowerCase();
                      return u.name.toLowerCase().includes(term) || (u.flat && u.flat.toLowerCase().includes(term)) || (u.phone && u.phone.toLowerCase().includes(term));
                    }).map((resUser) => (
                      <tr 
                        key={resUser.id} 
                        onClick={() => setSelectedDetail({ type: "resident", data: resUser })}
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-700">{resUser.name}</td>
                        <td className="px-4 py-3 font-bold text-slate-600">{resUser.flat || "N/A"}</td>
                        <td className="px-4 py-3 text-slate-500">{resUser.type || "Owner"}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{resUser.phone}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{resUser.vehicleNo || "No RFID Tagged"}</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            Approved
                          </span>
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
        {/* TAB 2: HELPDESK TICKET ASSIGNMENT */}
        {/* ==================================== */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm">Complaint Helpdesk & Ticket Dispatch</h3>
              <p className="text-xs text-slate-500 mt-1">Assign technicians (Plumbers, Electricians) and update resident tickets.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Live Helpdesk Pipeline</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {complaints.map((comp) => (
                  <div key={comp.id} className="p-4 hover:bg-slate-50 transition space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs">{comp.title}</h5>
                        <p className="text-[10px] text-slate-400">Flat: {comp.flat} • Raised by: {comp.residentName} • On: {new Date(comp.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        comp.status === "Pending" ? "bg-red-100 text-red-700 animate-pulse" :
                        comp.status === "Assigned" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {comp.assignedTo ? (
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                          👨🏽‍🔧 Dispatched Tech: {comp.assignedTo}
                        </p>
                      ) : (
                        <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Unassigned</span>
                      )}

                      <button 
                        onClick={() => {
                          setUpdatingTicketId(comp.id);
                          setTicketStatus(comp.status);
                          setTicketTech(comp.assignedTo || "Vikas Sharma (Electrician)");
                        }}
                        className="bg-indigo-600 text-white font-bold px-3 py-1 rounded text-[10px]"
                      >
                        DISPATCH / UPDATE TICKET
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Update Modal dialog */}
            {updatingTicketId && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200">
                  <div className="bg-slate-900 text-white p-5">
                    <h3 className="font-bold text-xs uppercase tracking-wider">Update Complaint Ticket</h3>
                    <p className="text-xs text-slate-400 mt-1">ID: {updatingTicketId}</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Set Ticket Status</label>
                      <select 
                        value={ticketStatus} 
                        onChange={(e: any) => setTicketStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      >
                        <option value="Pending">Pending Validation</option>
                        <option value="Assigned">Assigned & Dispatched</option>
                        <option value="Resolved">Resolved & Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign Technical Partner / Partner-Name</label>
                      <select 
                        value={ticketTech} 
                        onChange={(e) => setTicketTech(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      >
                        <option value="Vikas Sharma (Electrician)">Vikas Sharma (Electrician)</option>
                        <option value="Ramesh Prasad (Plumber)">Ramesh Prasad (Plumber)</option>
                        <option value="Karan Johar (Elevator Tech)">Karan Johar (Elevator Tech)</option>
                        <option value="Sanjay Gupta (Estate Supervisor)">Sanjay Gupta (Estate Supervisor)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Note / Commitee comment (E.g. water leakage fixed)</label>
                      <input 
                        type="text"
                        value={ticketNote}
                        onChange={(e) => setTicketNote(e.target.value)}
                        placeholder="E.g., Plumbing partner has isolated the B block pipeline joint..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setUpdatingTicketId(null)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveTicketUpdate}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm"
                      >
                        SAVE UPDATE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 3: NOTICE BOARD BUILDER (AI GENERATED) */}
        {/* ==================================== */}
        {activeTab === "notices" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Draft notice */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">Draft Society Notice</h4>
                
                {/* AI Assistant helper */}
                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-lg space-y-2">
                  <p className="text-xs text-indigo-900 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Auto-Generate Draft using Gemini AI
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={noticeAiTopic}
                      onChange={(e) => setNoticeAiTopic(e.target.value)}
                      placeholder="E.g. Lift maintenance scheduled for Friday block A"
                      className="flex-1 bg-white border border-indigo-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button 
                      type="button"
                      onClick={handleGenerateNoticeWithAi}
                      disabled={isGeneratingNotice || !noticeAiTopic}
                      className="bg-slate-900 text-indigo-400 font-bold px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap"
                    >
                      {isGeneratingNotice ? "Drafting..." : "GENERATE NOTICE"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitNotice} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notice Category</label>
                    <select 
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    >
                      <option value="Maintenance">Maintenance & Infrastructure</option>
                      <option value="Safety">Safety & Guard Advisory</option>
                      <option value="General Notice">General Society Circular</option>
                      <option value="Billing Circular">Billing / Fine Circular</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Headline Title</label>
                    <input 
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="Headline..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detailed Circular Copy</label>
                    <textarea 
                      rows={6}
                      required
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      placeholder="Write Notice Circular content..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-sans"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    BROADCAST NOTICE COPY TO ALL RESIDENTS
                  </button>
                </form>
              </div>

              {/* Active Notices Board */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Circular Bulletin Feed</h4>
                <div className="space-y-4 overflow-y-auto flex-1">
                  {notices.map(nt => (
                    <div 
                      key={nt.id} 
                      onClick={() => setSelectedDetail({ type: "notice", data: nt })}
                      className="border-l-4 border-indigo-600 bg-slate-50 p-3.5 rounded-r-lg space-y-1.5 cursor-pointer hover:bg-slate-100 transition text-left"
                    >
                      <div className="flex justify-between items-start">
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{nt.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{nt.date}</span>
                      </div>
                      <h5 className="font-bold text-slate-800 text-xs">{nt.title}</h5>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{nt.content}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Authorized: {nt.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 4: COMMUNITY POLLS MANAGER */}
        {/* ==================================== */}
        {activeTab === "polls" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Create Poll */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">Launch new Society Poll</h4>
              <form onSubmit={handleCreatePoll} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Voting Agenda / Question</label>
                  <input 
                    type="text"
                    required
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="E.g. Install shared solar panels on block roofs?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Option 1</label>
                  <input 
                    type="text"
                    required
                    value={pollOpt1}
                    onChange={(e) => setPollOpt1(e.target.value)}
                    placeholder="Yes, fully approve"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Option 2</label>
                  <input 
                    type="text"
                    required
                    value={pollOpt2}
                    onChange={(e) => setPollOpt2(e.target.value)}
                    placeholder="No, too expensive"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Option 3 (Optional)</label>
                  <input 
                    type="text"
                    value={pollOpt3}
                    onChange={(e) => setPollOpt3(e.target.value)}
                    placeholder="Defer to next AGM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition">
                  PUBLISH FOR RESIDENT CASTS
                </button>
              </form>
            </div>

            {/* View live polls */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">Live Active Ballot Polls</h4>
                <div className="space-y-4">
                  {polls.map(p => (
                    <div key={p.id} className="border border-slate-100 p-4 rounded-xl bg-slate-50 space-y-3">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs">{p.question}</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">Total votes cast: {p.totalVotes} • Deadline: {new Date(p.endsAt).toLocaleDateString()}</p>
                      </div>

                      <div className="space-y-2">
                        {p.options.map(o => {
                          const percentage = p.totalVotes > 0 ? Math.round((o.votes / p.totalVotes) * 100) : 0;
                          return (
                            <div key={o.id} className="text-xs">
                              <div className="flex justify-between text-slate-700 font-medium mb-1">
                                <span>{o.text}</span>
                                <span>{o.votes} votes ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-1.5" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 5: AI VISITOR ANALYTICS */}
        {/* ==================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            
            {/* AI report summary */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase text-indigo-300">GateKaru AI Visitor Security Auditor</span>
                </div>
                <h3 className="text-lg font-bold mt-1">Audit guest logs, peak hours and risk profile automatically.</h3>
                <p className="text-xs text-slate-400 mt-1">Compile comprehensive security intelligence report utilizing deep analytical insights from Gemini AI.</p>
              </div>
              <button 
                onClick={handleGenerateSecurityReport}
                disabled={isLoadingAnalytics}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs shrink-0 transition"
              >
                {isLoadingAnalytics ? "Compiling..." : "COMPILE REPORT NOW"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Analytics report metrics */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">System Analytics Overview</h4>
                
                {aiReportStats ? (
                  <div className="space-y-3.5">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-600">Total Enrolled Logins</span>
                      <span className="text-sm font-bold text-slate-800">{visitors.length} visitors</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-600">Checked-In Inside</span>
                      <span className="text-sm font-bold text-slate-800">{aiReportStats.checkedIn || 0} checked-in</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-600">Pre-Approved codes</span>
                      <span className="text-sm font-bold text-slate-800">{aiReportStats.preApproved || 0} active</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-600">Checked-Out successfully</span>
                      <span className="text-sm font-bold text-slate-800">{aiReportStats.checkedOut || 0} logs</span>
                    </div>
                    <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-indigo-900">Delivery Density Percentage</span>
                        <span className="text-indigo-900">{aiReportStats.deliveryPercentage || 30}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-1.5" style={{ width: `${aiReportStats.deliveryPercentage || 30}%` }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-12 text-xs">Press **Compile Report** to fetch security audit stats.</div>
                )}
              </div>

              {/* Analytical output markup */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">AI Deep-Dive Intelligence Digest</h4>
                {aiReportText ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                    <pre className="text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed">{aiReportText}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                    <p className="text-xs">No compiled digest has been rendered yet. Click compile report above to trigger auditor insights.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 6: UTILITY ERP STATUS (WATER / GENERATOR) */}
        {/* ==================================== */}
        {activeTab === "erp" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Water Tanker ERP logs */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Daily Water Tanker Delivery Register</h4>
                <button 
                  onClick={logWaterTanker}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  + LOG DELIVERY ARRIVAL
                </button>
              </div>

              <div className="space-y-2.5">
                {waterTankers.map((wt) => (
                  <div key={wt.id} className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{wt.capacity} water tanker</h5>
                      <p className="text-[10px] text-slate-500">Provider: {wt.provider} • Logged at: {wt.time}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {wt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CCTV streams & generator log */}
            <div className="space-y-6">
              
              {/* Generator and fuel gauge */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">Power Grid Generator Backup Status</h4>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">DG SET 1 (250 KVA)</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{generatorFuel}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setGeneratorFuel("98% (Refueling completed just now. 48+ hours run limit available.)");
                      alert("Diesel log updated. Generator tank fully refueled to 98%.");
                    }}
                    className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded"
                  >
                    LOG FUEL REFILL
                  </button>
                </div>
              </div>

              {/* CCTV streaming feeds - QUICK LINK */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-900/50">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide">Smart Surveillance System</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time network transcoder & security camera gateway.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The on-premises CCTV relay network has been migrated to the dedicated <strong className="text-indigo-400">Smart Surveillance Configuration</strong> dashboard. From there, you can whitelist RTSP gateways, inspect active TLS streams, and run real-time diagnostic handshakes.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("cctv")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" /> Go to Surveillance Dashboard
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB: SMART SURVEILLANCE CONFIGURATION */}
        {/* ==================================== */}
        {activeTab === "cctv" && (
          <SmartSurveillanceConfig />
        )}

        {/* ==================================== */}
        {/* TAB 7: EMERGENCY SOS DISPATCHER */}
        {/* ==================================== */}
        {activeTab === "sos" && (
          <div className="space-y-6">
            
            {/* Main Header Card */}
            <div className="bg-red-950 text-red-100 p-6 rounded-xl border border-red-900 shadow-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                <h3 className="font-bold text-lg">Greenwood Society Committee Emergency Control Center</h3>
              </div>
              <p className="text-xs text-red-300 mt-1 max-w-3xl">
                Authorized Panel for Committee Members. From this dashboard you can trigger high-importance community notices, water alerts, and critical security alarms that broadcast instantly over resident speakers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Selector & Broadcast Form (7/12) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">📣 BROADCAST NEW EMERGENCY NOTICE</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Select an emergency preset or draft a custom message to broadcast.</p>
                </div>

                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">1. CHOOSE EMERGENCY EVENT / श्रेणी चुनें</label>
                    <select
                      value={selectedAlertTemplate}
                      onChange={(e) => setSelectedAlertTemplate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-black text-slate-800 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      id="committee-sos-category-selector"
                    >
                      {ALERT_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>
                          ⚠️ {t.icon} {t.translations["en"].title} ({t.translations["hi"].title})
                        </option>
                      ))}
                      <option value="custom">✍️ Custom Announcement Message (मनचाहा संदेश लिखें)</option>
                    </select>
                  </div>

                  {/* Custom Message (only active when 'custom' is selected) */}
                  <div className={`space-y-1.5 transition-all duration-300 ${selectedAlertTemplate === "custom" ? "opacity-100 scale-100" : "opacity-40 pointer-events-none scale-95"}`}>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">2. ENTER CUSTOM DISPATCH ANNOUNCEMENT / संदेश दर्ज करें</label>
                    <textarea
                      disabled={selectedAlertTemplate !== "custom"}
                      value={customAlertMessage}
                      onChange={(e) => setCustomAlertMessage(e.target.value)}
                      rows={3}
                      placeholder="E.g. Committee Announcement: Water pumps are back online! Tankers filled successfully. Supply will resume shortly."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                      id="committee-sos-custom-text"
                    />
                  </div>

                  {/* Dispatch Action Button */}
                  <button
                    onClick={() => {
                      setSosLoading(true);
                      setTimeout(() => {
                        if (selectedAlertTemplate === "custom") {
                          const text = customAlertMessage.trim() || "SOS Alert: Announcement from Committee members!";
                          onTriggerSOS(text, "custom");
                        } else {
                          const template = ALERT_TEMPLATES.find(t => t.id === selectedAlertTemplate);
                          const text = template ? template.translations["en"].message : "SOS Alert triggered!";
                          onTriggerSOS(text, selectedAlertTemplate);
                        }
                        setSosLoading(false);
                        setCustomAlertMessage("");
                        alert("Emergency broadcast triggered successfully! All resident apps will instantly ring and play audio voice instructions in their localized Indian language.");
                      }, 800);
                    }}
                    disabled={sosLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs uppercase shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {sosLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> BROADCASTING LIVE MESSAGE...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4.5 h-4.5 animate-pulse" /> DISPATCH BROADCAST ANNOUNCEMENT
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live SOS Dispatch Feed (5/12) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">📊 LIVE SOS EMERGENCY LOG</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Real-time status tracking and clearance control of triggered alerts.</p>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {alerts.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                      No active emergency alerts recorded.
                    </div>
                  ) : (
                    alerts.map((al) => (
                      <div key={al.id} className="p-3 border border-slate-100 rounded-lg space-y-2 hover:bg-slate-50 transition">
                        <div className="flex justify-between items-start">
                          <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            {al.type}
                          </span>
                          <span className="text-[9px] text-slate-400">{new Date(al.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{al.message}</p>
                        <p className="text-[9.5px] text-slate-500 font-medium">Broadcasted by: {al.sender}</p>

                        {al.status === "Active" ? (
                          <button
                            onClick={() => onResolveAlert(al.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded text-[10px] transition"
                          >
                            MARK RESOLVED & STAND DOWN
                          </button>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-800 text-[9.5px] font-bold text-center py-1 rounded border border-emerald-100 uppercase">
                            Resolved & Cleared ✅
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
                    Community Record Inspector
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
                {selectedDetail.type === "resident" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-850 text-base">{selectedDetail.data.name}</h4>
                        <p className="text-xs text-indigo-600 font-semibold">Flat {selectedDetail.data.flat} • RWA Member</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Enrollment Type</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block">{selectedDetail.data.type || "Owner"}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered Phone</span>
                        <span className="text-xs font-mono font-bold text-slate-700 mt-1 block">{selectedDetail.data.phone}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 block break-all">{selectedDetail.data.email || "No Email Provided"}</span>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle RFID Code</span>
                        <span className="text-xs font-mono font-bold text-indigo-600 mt-1 block">{selectedDetail.data.vehicleNo || "No Tags Registered"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetail.type === "notice" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-850 text-base">{selectedDetail.data.title}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{selectedDetail.data.category} • Posted: {selectedDetail.data.date}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Official Circular Content</span>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedDetail.data.content}</p>
                    </div>

                    <div className="bg-indigo-50/30 p-3 rounded-lg border border-indigo-50 flex justify-between items-center text-xs">
                      <span className="text-indigo-950 font-bold">Authorized Dispatch Officer:</span>
                      <span className="text-indigo-700 font-extrabold">{selectedDetail.data.author || "RWA Committee Core"}</span>
                    </div>
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
      </AnimatePresence>
    </div>
  );
}
