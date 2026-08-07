import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Siren,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  UserCheck,
  AlertTriangle,
  Download,
  Volume2,
  VolumeX,
  FileText,
  FileSpreadsheet,
  Radio,
  Flame,
  Activity,
  ChevronDown,
  RefreshCw,
  Bell,
  Sparkles
} from "lucide-react";

export interface EmergencyLogItem {
  id: string;
  incidentType: "Medical SOS" | "Fire Alarm" | "Unauthorized Entry" | "Elevator Stuck" | "Gas Leak" | "General Panic";
  severity: "Critical" | "High" | "Medium";
  flat: string;
  wing: string;
  residentName: string;
  residentPhone: string;
  timestamp: string;
  assignedGuard: string;
  guardPhone: string;
  responseTimeSeconds: number;
  status: "Active" | "Guard Dispatched" | "Resolved" | "False Alarm";
  audioProofRecorded?: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
}

const INITIAL_EMERGENCY_LOGS: EmergencyLogItem[] = [
  {
    id: "EMG-2026-091",
    incidentType: "Medical SOS",
    severity: "Critical",
    flat: "A-402",
    wing: "Wing A",
    residentName: "Rameshwar Prasad (Senior Citizen)",
    residentPhone: "+91 98200 11223",
    timestamp: "2026-08-07 15:42",
    assignedGuard: "Rajesh Kumar (Command 1)",
    guardPhone: "+91 98110 99887",
    responseTimeSeconds: 85,
    status: "Guard Dispatched",
    audioProofRecorded: true,
    resolutionNotes: "Paramedics contacted. Guard Rajesh at flat location assisting resident."
  },
  {
    id: "EMG-2026-090",
    incidentType: "Fire Alarm",
    severity: "Critical",
    flat: "C-1104",
    wing: "Wing C",
    residentName: "Meenakshi Sundaram",
    residentPhone: "+91 98331 44556",
    timestamp: "2026-08-07 14:15",
    assignedGuard: "Vikram Singh (Fire Response Lead)",
    guardPhone: "+91 98221 77665",
    responseTimeSeconds: 110,
    status: "Active",
    audioProofRecorded: true
  },
  {
    id: "EMG-2026-089",
    incidentType: "Unauthorized Entry",
    severity: "High",
    flat: "Main Gate 1",
    wing: "Security Terminal",
    residentName: "Gate Guard System",
    residentPhone: "+91 11-4020-8888",
    timestamp: "2026-08-07 11:30",
    assignedGuard: "Suraj Bhan",
    guardPhone: "+91 98440 22110",
    responseTimeSeconds: 45,
    status: "Resolved",
    audioProofRecorded: false,
    resolutionNotes: "Delivery agent attempted forced gate pass bypass. Intercepted and verified.",
    resolvedAt: "2026-08-07 11:35"
  },
  {
    id: "EMG-2026-088",
    incidentType: "Elevator Stuck",
    severity: "Medium",
    flat: "Lift 2 (Wing B)",
    wing: "Wing B",
    residentName: "Aarav Sharma",
    residentPhone: "+91 98220 11111",
    timestamp: "2026-08-06 20:10",
    assignedGuard: "Anil Deshmukh",
    guardPhone: "+91 98330 55443",
    responseTimeSeconds: 120,
    status: "Resolved",
    audioProofRecorded: true,
    resolutionNotes: "OTIS Technician dispatched. Door manually opened within 10 minutes. Resident safe.",
    resolvedAt: "2026-08-06 20:25"
  },
  {
    id: "EMG-2026-087",
    incidentType: "Gas Leak",
    severity: "High",
    flat: "D-301",
    wing: "Wing D",
    residentName: "Pooja Malhotra",
    residentPhone: "+91 98550 66778",
    timestamp: "2026-08-05 18:22",
    assignedGuard: "Vikram Singh",
    guardPhone: "+91 98221 77665",
    responseTimeSeconds: 95,
    status: "Resolved",
    audioProofRecorded: false,
    resolutionNotes: "MGL PNG Gas Line valve shut off at main meter riser. Leak fixed.",
    resolvedAt: "2026-08-05 18:40"
  }
];

interface EmergencyLogTabProps {
  darkMode?: boolean;
}

export default function EmergencyLogTab({ darkMode = true }: EmergencyLogTabProps) {
  const [logs, setLogs] = useState<EmergencyLogItem[]>(INITIAL_EMERGENCY_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New incident form state
  const [newIncidentType, setNewIncidentType] = useState<EmergencyLogItem["incidentType"]>("Medical SOS");
  const [newFlat, setNewFlat] = useState("");
  const [newWing, setNewWing] = useState("Wing A");
  const [newResident, setNewResident] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSirenToggle = () => {
    if (!sirenPlaying) {
      setSirenPlaying(true);
      try {
        const speech = new SpeechSynthesisUtterance("Emergency SOS Panic Siren Test Triggered on GateKaru Terminal.");
        speech.rate = 1.0;
        window.speechSynthesis?.speak(speech);
      } catch (e) {
        // Speech synthesis fallback
      }
      showToast("🚨 Audio Panic Siren Siren Test Started! (Local Alarm Test)");
    } else {
      setSirenPlaying(false);
      window.speechSynthesis?.cancel();
      showToast("🔇 Panic Siren Siren Test Silenced.");
    }
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlat || !newResident) return;

    const newItem: EmergencyLogItem = {
      id: `EMG-2026-${Math.floor(100 + Math.random() * 900)}`,
      incidentType: newIncidentType,
      severity: newIncidentType === "Medical SOS" || newIncidentType === "Fire Alarm" ? "Critical" : "High",
      flat: newFlat,
      wing: newWing,
      residentName: newResident,
      residentPhone: newPhone || "+91 98000 00000",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      assignedGuard: "Rajesh Kumar (Command 1)",
      guardPhone: "+91 98110 99887",
      responseTimeSeconds: 60,
      status: "Active",
      audioProofRecorded: true
    };

    setLogs([newItem, ...logs]);
    setShowNewModal(false);
    setNewFlat("");
    setNewResident("");
    setNewPhone("");
    showToast(`🚨 Emergency Panic Log ${newItem.id} Broadcasted for Flat ${newItem.flat}!`);
  };

  const handleResolveIncident = (id: string) => {
    setLogs(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: "Resolved",
            resolvedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            resolutionNotes: "Resolved and cleared by Guard Command Terminal."
          };
        }
        return item;
      })
    );
    showToast(`✅ Emergency Incident ${id} marked as RESOLVED.`);
  };

  const handleDispatchGuard = (id: string) => {
    setLogs(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: "Guard Dispatched"
          };
        }
        return item;
      })
    );
    showToast(`🚨 Security Guard Dispatched to Incident ${id}!`);
  };

  // Filtered emergency log items
  const filteredLogs = logs.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedGuard.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "All" || item.incidentType === typeFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = logs.filter(l => l.status === "Active" || l.status === "Guard Dispatched").length;

  const cardBg = darkMode
    ? "bg-[#0b1029]/90 border border-[#1e2a5e] text-white shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-md";

  return (
    <div className={`${cardBg} rounded-2xl p-5 space-y-5 transition-all select-none`}>
      {/* Top Bar Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#1f2e63] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40 animate-pulse">
              <Siren className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              Emergency & Panic Log Manager (🚨 आपातकालीन लॉग प्रबंधन)
            </span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            Society SOS Incident Command Directory
          </h2>
          <p className="text-xs text-slate-400">
            Audit-grade dispatch log tracking resident panic alarms, guard response latency, audio sirens, and resolution timelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Siren Tester */}
          <button
            type="button"
            onClick={handleSirenToggle}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              sirenPlaying
                ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                : "bg-[#101738] text-rose-300 border-[#253673] hover:bg-[#182352]"
            }`}
          >
            {sirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
            <span>{sirenPlaying ? "Stop Siren Test" : "Test Audio Siren"}</span>
          </button>

          {/* New Incident Manual Log */}
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-rose-400/50 shadow-lg shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Emergency Log</span>
          </button>

          {/* Export to PDF */}
          <button
            type="button"
            onClick={() => {
              const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
              const rowsHtml = logs.map(l => `
                <tr>
                  <td style="padding:8px; border:1px solid #cbd5e1; font-family:monospace; font-weight:bold;">${l.id}</td>
                  <td style="padding:8px; border:1px solid #cbd5e1; color:#991b1b; font-weight:bold;">${l.incidentType}</td>
                  <td style="padding:8px; border:1px solid #cbd5e1;">Flat ${l.flat} (${l.residentName})</td>
                  <td style="padding:8px; border:1px solid #cbd5e1;">${l.residentPhone}</td>
                  <td style="padding:8px; border:1px solid #cbd5e1;">${l.timestamp}</td>
                  <td style="padding:8px; border:1px solid #cbd5e1;">${l.assignedGuard}</td>
                  <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">${l.status}</td>
                </tr>
              `).join("");

              const printHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>GateKaru_Emergency_Incident_Logs_${dateStr}</title>
                  <style>
                    body { font-family: sans-serif; padding: 25px; color: #0f172a; }
                    .title { font-size: 20px; font-weight: 800; color: #991b1b; border-bottom: 2px solid #ef4444; padding-bottom: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                    th { background: #7f1d1d; color: white; padding: 8px; text-align: left; }
                  </style>
                </head>
                <body>
                  <div class="title">🚨 GateKaru Emergency & Panic Incident Logs Report</div>
                  <p style="font-size: 11px; color: #64748b;">Generated: ${dateStr} | Society Security Patrol Audit</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Log ID</th>
                        <th>Incident Category</th>
                        <th>Location / Resident</th>
                        <th>Contact Phone</th>
                        <th>Timestamp</th>
                        <th>Assigned Guard</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                  </table>
                  <script>window.onload = function() { window.print(); }</script>
                </body>
                </html>
              `;
              const win = window.open("", "_blank");
              if (win) {
                win.document.write(printHtml);
                win.document.close();
                showToast("📄 Printable Emergency PDF Report generated!");
              }
            }}
            className="bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-rose-500/50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-300" /> Export PDF
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={() => {
              let csv = "\uFEFFID,Incident Type,Flat,Resident Name,Phone,Timestamp,Assigned Guard,Status\n";
              logs.forEach(l => {
                csv += `"${l.id}","${l.incidentType}","${l.flat}","${l.residentName}","${l.residentPhone}","${l.timestamp}","${l.assignedGuard}","${l.status}"\n`;
              });
              const blob = new Blob([csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `GateKaru_Emergency_Logs_${new Date().toISOString().split("T")[0]}.xlsx`;
              a.click();
              showToast("📊 Emergency Incident Logs exported to Excel (.xlsx)!");
            }}
            className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-500/50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" /> Export Excel
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Siren className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Active Panic
          </span>
          <p className="text-lg font-black text-rose-400 font-mono">{activeCount} Incidents</p>
          <p className="text-[9.5px] text-slate-500">Requires guard attention</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resolved Today
          </span>
          <p className="text-lg font-black text-emerald-400 font-mono">
            {logs.filter(l => l.status === "Resolved").length} Resolved
          </p>
          <p className="text-[9.5px] text-slate-500">Cleared with notes</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Dispatch Speed
          </span>
          <p className="text-lg font-black text-amber-300 font-mono">72 Seconds</p>
          <p className="text-[9.5px] text-slate-500">Fast guard arrival</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-400" /> Total Log Volume
          </span>
          <p className="text-lg font-black text-white font-mono">{logs.length} Total</p>
          <p className="text-[9.5px] text-slate-500">Archived in database</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-[#070b1a] border border-[#192756] p-3 rounded-xl">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Flat, Resident, Guard, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Incident Type Dropdown */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-[#030612] border border-[#1e2a5e] text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Medical SOS">Medical SOS</option>
            <option value="Fire Alarm">Fire Alarm</option>
            <option value="Unauthorized Entry">Unauthorized Entry</option>
            <option value="Elevator Stuck">Elevator Stuck</option>
            <option value="Gas Leak">Gas Leak</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#030612] border border-[#1e2a5e] text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Guard Dispatched">Guard Dispatched</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Emergency Logs Master Table */}
      <div className="bg-[#060a19] border border-[#182654] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0a1029] text-indigo-300 uppercase text-[10px] font-black tracking-wider border-b border-[#1c2a5e]">
                <th className="p-3.5">Incident Ref</th>
                <th className="p-3.5">Type & Severity</th>
                <th className="p-3.5">Flat / Location</th>
                <th className="p-3.5">Resident Details</th>
                <th className="p-3.5">Guard Patrol Lead</th>
                <th className="p-3.5">Dispatch Speed</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131e42]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No emergency logs match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => {
                  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                  if (item.status === "Active") {
                    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
                  } else if (item.status === "Guard Dispatched") {
                    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#0a112e]/60 transition">
                      <td className="p-3.5 font-mono font-bold text-indigo-300 flex items-center gap-2">
                        <Siren className={`w-3.5 h-3.5 ${item.status === "Active" ? "text-rose-400 animate-pulse" : "text-slate-400"}`} />
                        <span>{item.id}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white">{item.incidentType}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              item.severity === "Critical"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {item.severity}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-white bg-indigo-950/60 border border-indigo-700/40 px-2 py-1 rounded-md text-xs">
                          {item.flat} ({item.wing})
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-200">{item.residentName}</p>
                          <a
                            href={`tel:${item.residentPhone}`}
                            className="text-[10px] text-indigo-400 font-mono hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-2.5 h-2.5" /> {item.residentPhone}
                          </a>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-300">{item.assignedGuard}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{item.guardPhone}</p>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        {item.responseTimeSeconds}s
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${badgeColor}`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5">
                        {item.status === "Active" && (
                          <button
                            type="button"
                            onClick={() => handleDispatchGuard(item.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition"
                          >
                            Dispatch Guard
                          </button>
                        )}
                        {item.status !== "Resolved" && (
                          <button
                            type="button"
                            onClick={() => handleResolveIncident(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition"
                          >
                            Resolve
                          </button>
                        )}
                        {item.status === "Resolved" && (
                          <span className="text-[10px] text-slate-500 font-mono">Resolved</span>
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

      {/* Modal for Raising New Emergency Log */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b1029] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-[#1c2858] pb-3">
                <div className="flex items-center gap-2">
                  <Siren className="w-5 h-5 text-rose-400 animate-pulse" />
                  <h3 className="font-extrabold text-sm text-white">Raise Manual Emergency Incident Log</h3>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-slate-400 hover:text-white font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddIncident} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-extrabold mb-1">Emergency Category</label>
                  <select
                    value={newIncidentType}
                    onChange={e => setNewIncidentType(e.target.value as any)}
                    className="w-full bg-[#030612] border border-[#1e2a5e] p-2.5 rounded-xl text-white focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="Medical SOS">Medical SOS (चिकित्सा आपात)</option>
                    <option value="Fire Alarm">Fire Alarm (अग्नि अलार्म)</option>
                    <option value="Unauthorized Entry">Unauthorized Entry (अनधिकृत प्रवेश)</option>
                    <option value="Elevator Stuck">Elevator Stuck (लिफ्ट फंसना)</option>
                    <option value="Gas Leak">Gas Leak (गैस रिसाव)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1">Flat / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. A-402 or Main Gate"
                      required
                      value={newFlat}
                      onChange={e => setNewFlat(e.target.value)}
                      className="w-full bg-[#030612] border border-[#1e2a5e] p-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1">Wing</label>
                    <select
                      value={newWing}
                      onChange={e => setNewWing(e.target.value)}
                      className="w-full bg-[#030612] border border-[#1e2a5e] p-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Wing A">Wing A</option>
                      <option value="Wing B">Wing B</option>
                      <option value="Wing C">Wing C</option>
                      <option value="Wing D">Wing D</option>
                      <option value="Common Area">Common Area</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-extrabold mb-1">Resident / Reporter Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={newResident}
                    onChange={e => setNewResident(e.target.value)}
                    className="w-full bg-[#030612] border border-[#1e2a5e] p-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-extrabold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-[#030612] border border-[#1e2a5e] p-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="w-1/2 bg-[#121a3a] hover:bg-[#1a2550] text-slate-300 font-bold py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-rose-600/30"
                  >
                    Broadcast Emergency Log
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
