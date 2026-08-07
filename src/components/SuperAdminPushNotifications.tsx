import React, { useState } from "react";
import { 
  Send, Users, Bell, Megaphone, Clock, Search, ShieldAlert,
  Sparkles, FileText, Smartphone, Volume2, AlertCircle, Trash2, CheckCircle2
} from "lucide-react";

export interface PushNotificationTemplate {
  id: string;
  title: string;
  body: string;
  category: string;
}

export interface PushNotificationLog {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  targetSociety: string;
  targetRole: string;
  status: "SENT" | "DELIVERED" | "FAILED";
  priority: "info" | "high";
  deliveredCount: number;
  openRate: string;
}

interface SuperAdminPushNotificationsProps {
  societies: any[];
}

export default function SuperAdminPushNotifications({ societies }: SuperAdminPushNotificationsProps) {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [targetSociety, setTargetSociety] = useState("All");
  const [targetRole, setTargetRole] = useState("All");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["push", "email", "whatsapp", "telegram", "sms"]);
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [alertSound, setAlertSound] = useState("Default Chirp");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Default templates list
  const templates: PushNotificationTemplate[] = [
    {
      id: "temp-1",
      title: "🚨 URGENT: Scheduled Maintenance Power Outage",
      body: "Please note that grid maintenance will be carried out this afternoon from 2:00 PM to 4:00 PM. Inverters and backup lifts will remain active.",
      category: "Maintenance"
    },
    {
      id: "temp-2",
      title: "📅 Reminder: Monthly Society Meeting Tomorrow",
      body: "The annual general body budget review meeting is scheduled for tomorrow at 10:00 AM in the Main Clubhouse. Attendance of all flat owners is requested.",
      category: "Governance"
    },
    {
      id: "temp-3",
      title: "💰 Action Required: Maintenance Invoice Pending",
      body: "This is a friendly reminder that maintenance dues for this month are outstanding. Please clear payments via the GateKaru App to avoid late charges.",
      category: "Billing"
    },
    {
      id: "temp-4",
      title: "🐕 Community Notice: Stray Animal Regulations",
      body: "Residents are requested to strictly adhere to animal safety guidelines at gates. Pets must be leashed in common green zones at all times.",
      category: "Security"
    }
  ];

  // Dispatch history states
  const [history, setHistory] = useState<PushNotificationLog[]>([
    {
      id: "PUSH-101",
      timestamp: "2026-07-08 11:22:15",
      title: "⚡ Maintenance Update: Elevators Restored",
      body: "The elevator maintenance on Block C is complete and fully functional. Thank you for your patience.",
      targetSociety: "Greenwood Heights Society",
      targetRole: "All Residents",
      status: "DELIVERED",
      priority: "info",
      deliveredCount: 384,
      openRate: "92.4%"
    },
    {
      id: "PUSH-100",
      timestamp: "2026-07-07 18:40:00",
      title: "🚨 SECURITY ALERT: Unexpected Entry Breach Test",
      body: "JobsKaru automated security protocols successfully tested gate override sirens. Normalcy remains active.",
      targetSociety: "All Registered Societies",
      targetRole: "RWA Admins & Guards",
      status: "DELIVERED",
      priority: "high",
      deliveredCount: 42,
      openRate: "100%"
    },
    {
      id: "PUSH-099",
      timestamp: "2026-07-05 09:30:11",
      title: "🛠️ Water Pipe Repair Completed",
      body: "Main water supply valves have been opened. Kindly let the taps run for 30 seconds to flush initial sediment.",
      targetSociety: "Palm Heights Phase II",
      targetRole: "All Residents",
      status: "DELIVERED",
      priority: "info",
      deliveredCount: 1420,
      openRate: "88.1%"
    }
  ]);

  const selectTemplate = (template: PushNotificationTemplate) => {
    setNotificationTitle(template.title);
    setNotificationBody(template.body);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      alert("Please fill in both the title and message body.");
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      // Find name of society
      const selectedSocName = targetSociety === "All" 
        ? "All Registered Societies" 
        : (societies.find(s => s.id === targetSociety)?.name || targetSociety);

      // Create new log entry
      const newLog: PushNotificationLog = {
        id: `PUSH-${String(history.length + 102).padStart(3, "0")}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        title: notificationTitle,
        body: notificationBody,
        targetSociety: selectedSocName,
        targetRole: targetRole === "All" ? "All Residents & Guards" : targetRole,
        status: "DELIVERED",
        priority: isHighPriority ? "high" : "info",
        deliveredCount: targetSociety === "All" ? 2100 : Math.floor(Math.random() * 300 + 100),
        openRate: `${Math.floor(Math.random() * 15 + 85)}%`
      };

      setHistory(prev => [newLog, ...prev]);
      setIsSending(false);
      
      // Clear inputs
      setNotificationTitle("");
      setNotificationBody("");
      setIsHighPriority(false);

      alert(`🚀 Push notification broadcast dispatched successfully! Channels secure. Simulated devices notified.`);
    }, 1500);
  };

  const clearHistory = () => {
    if (confirm("🚨 Are you sure you want to clear the notification logs history?")) {
      setHistory([]);
    }
  };

  // Filtered Logs
  const filteredHistory = history.filter(item => {
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetSociety.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Intro Header */}
      <div className="border-b border-[#1e295d] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-emerald-400 animate-bounce" /> GateKaru Real-time Cloud Push
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Push Notifications Console</h2>
          <p className="text-xs text-slate-400">
            Dispatch urgent real-time push alerts, community templates, and security guidelines directly to resident and guard mobile applications.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-white font-black text-[11px] px-3.5 py-2 rounded-xl border border-rose-900/40 transition uppercase tracking-wider flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Wipe Log Archive
          </button>
        )}
      </div>

      {/* Grid: 3 metrics stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Broadcasts Sent</span>
            <span className="text-xl font-black text-white font-mono">{history.length} active</span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Simulated Active Receivers</span>
            <span className="text-xl font-black text-indigo-400 font-mono">2,309 devices</span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Avg Open Interaction Rate</span>
            <span className="text-xl font-black text-purple-400 font-mono">94.1% Live</span>
          </div>
        </div>
      </div>

      {/* Main split: Creator Form vs Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Creator Form (7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-[#21326d] pb-2">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-400" /> Dispatch New Push Broadcast
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Publish instantaneous high-delivery cloud notifications to selected resident and gate guards.</p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Housing Society */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Target Complex Partition</label>
                  <select
                    value={targetSociety}
                    onChange={(e) => setTargetSociety(e.target.value)}
                    className="w-full bg-[#070b1a] border border-[#21326d] rounded-xl p-2.5 text-white text-xs font-bold focus:outline-none"
                    disabled={isSending}
                  >
                    <option value="All">All Registered Societies</option>
                    {societies.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Target User Roles */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Recipient Audience Roles</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-[#070b1a] border border-[#21326d] rounded-xl p-2.5 text-white text-xs font-bold focus:outline-none"
                    disabled={isSending}
                  >
                    <option value="All">All Residents & Guards</option>
                    <option value="Residents">Residents Only</option>
                    <option value="Guards">Security Guards Only</option>
                    <option value="RWA Admins">RWA Committee Admins Only</option>
                  </select>
                </div>
              </div>

              {/* Multi-Channel Delivery Selector */}
              <div className="space-y-2 pt-1 border-t border-[#182552]">
                <label className="text-slate-300 font-extrabold text-xs flex items-center justify-between">
                  <span>Dispatch Delivery Channels</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {selectedChannels.length} Channels Active
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "push", label: "Push", icon: "🔔", color: "border-indigo-500 bg-indigo-500/20 text-indigo-300" },
                    { id: "email", label: "Email", icon: "✉️", color: "border-sky-500 bg-sky-500/20 text-sky-300" },
                    { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "border-emerald-500 bg-emerald-500/20 text-emerald-300" },
                    { id: "telegram", label: "Telegram", icon: "✈️", color: "border-blue-500 bg-blue-500/20 text-blue-300" },
                    { id: "sms", label: "SMS", icon: "📱", color: "border-amber-500 bg-amber-500/20 text-amber-300" },
                  ].map((ch) => {
                    const active = selectedChannels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          if (active) {
                            if (selectedChannels.length > 1) {
                              setSelectedChannels(prev => prev.filter(c => c !== ch.id));
                            } else {
                              alert("At least one dispatch channel must remain active.");
                            }
                          } else {
                            setSelectedChannels(prev => [...prev, ch.id]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          active 
                            ? ch.color + " shadow-md" 
                            : "bg-[#070b1a] border-[#1f2e63] text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <span>{ch.icon}</span>
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Title */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Notification Title Accent</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g. 🚨 EMERGENCY: Short Water Supply Interruption"
                  maxLength={65}
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-xl p-2.5 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                  disabled={isSending}
                />
                <span className="text-[9px] text-slate-500 block text-right font-mono">
                  {notificationTitle.length}/65 chars
                </span>
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Notification Message Body</label>
                <textarea
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  placeholder="Write clear, informative announcements for device delivery..."
                  rows={4}
                  maxLength={200}
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-xl p-2.5 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-medium"
                  required
                  disabled={isSending}
                />
                <span className="text-[9px] text-slate-500 block text-right font-mono">
                  {notificationBody.length}/200 chars
                </span>
              </div>

              {/* Advanced Sound Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2 border-t border-[#192652]">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <div className="space-y-0.5">
                    <span className="text-white block font-bold text-[11px]">System Notification Tone</span>
                    <select
                      value={alertSound}
                      onChange={(e) => setAlertSound(e.target.value)}
                      className="bg-transparent text-slate-400 text-[10px] border-none font-bold p-0 focus:outline-none"
                    >
                      <option value="Default Chirp">Default GateKaru Chirp</option>
                      <option value="Emergency Alarm">Loud Emergency Alarm</option>
                      <option value="Standard Bell">Standard Chime Bell</option>
                      <option value="Silent Push">Silent (No Sound Override)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-slate-400 text-[11px] font-bold">Override System Do-Not-Disturb</span>
                  <button
                    type="button"
                    onClick={() => setIsHighPriority(!isHighPriority)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition ${
                      isHighPriority 
                        ? "bg-rose-950/60 border-rose-500 text-rose-400" 
                        : "bg-[#070b1a] border-[#21326d] text-slate-500"
                    }`}
                  >
                    {isHighPriority ? "⚠️ PRIORITY: ON" : "STANDARD"}
                  </button>
                </div>
              </div>

              {/* Submit Dispatch */}
              {!isSending ? (
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black py-3 rounded-xl uppercase transition text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                >
                  Broadcast Push Notification <Send className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="bg-[#05081c] border border-emerald-950 p-3.5 rounded-xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Transmitting payload through multi-tenant websockets...</span>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Quick template library shortcut */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-3.5 shadow-xl">
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-indigo-400" /> Fast-Draft Announcements Library
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Click any standard template below to instantly load the push dispatch engine variables.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => selectTemplate(tpl)}
                  className="p-3 bg-[#070b1a]/90 hover:bg-[#121c4b]/50 border border-[#1b2b64] hover:border-indigo-500 rounded-xl text-left transition flex flex-col justify-between h-24"
                >
                  <span className="text-[8.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-extrabold self-start mb-1.5">
                    {tpl.category}
                  </span>
                  <h5 className="text-white text-[11px] font-bold line-clamp-1 mb-1">{tpl.title}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal font-medium">{tpl.body}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live Mobile Preview Screen (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smartphone device Mockup */}
          <div className="bg-[#070b1a]/95 border-4 border-[#1c295c] rounded-[2.5rem] p-4 pt-10 pb-6 relative shadow-2xl mx-auto max-w-[280px]">
            
            {/* Camera notch cutout */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1c295c] rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-black rounded-full mr-2" />
              <span className="w-12 h-1 bg-[#233575] rounded-full" />
            </div>

            {/* Simulated Phone Screen Interface */}
            <div className="bg-[#090d23] rounded-[1.8rem] min-h-[380px] p-4 flex flex-col justify-between overflow-hidden relative border border-[#19275d]">
              
              {/* Phone Header Status Bar */}
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500 border-b border-slate-900 pb-2 mb-4 uppercase">
                <span>08:42 AM</span>
                <span className="text-emerald-400">● JobsKaru Net</span>
                <span>🔋 98%</span>
              </div>

              {/* Dynamic Notification Bubble */}
              <div className="space-y-4 flex-1 flex flex-col justify-start">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block text-center mb-1">
                  Active Feed Simulation
                </span>

                {/* The dynamic card */}
                <div className="bg-[#10173c]/95 border border-indigo-500/30 rounded-2xl p-3 shadow-lg space-y-1.5 animate-fadeIn">
                  
                  {/* Top identifier */}
                  <div className="flex justify-between items-center pb-1 border-b border-indigo-950/45">
                    <span className="flex items-center gap-1 text-[8.5px] font-black text-indigo-400 uppercase tracking-widest">
                      <Smartphone className="w-3 h-3 text-indigo-400" /> GateKaru App
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">JUST NOW</span>
                  </div>

                  {/* Title & Body */}
                  <h4 className="text-white font-extrabold text-[11px] leading-tight break-words">
                    {notificationTitle || "👉 Enter A Notification Title"}
                  </h4>
                  <p className="text-slate-400 font-medium text-[10px] leading-relaxed break-words line-clamp-3">
                    {notificationBody || "Write a message body inside the broadcast creator panel to see how it renders instantly on client devices."}
                  </p>

                  {/* Sound indicator badge */}
                  <div className="flex justify-between items-center pt-1.5 border-t border-indigo-950/45 text-[8.5px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-2.5 h-2.5 text-emerald-400" /> {alertSound}
                    </span>
                    {isHighPriority && (
                      <span className="text-rose-400 flex items-center gap-0.5 font-mono">
                        ⚠️ HIGH-PRIORITY
                      </span>
                    )}
                  </div>

                </div>

                {/* Hint */}
                <p className="text-[9.5px] text-slate-500 text-center px-4 leading-normal mt-2">
                  This mock device displays the exact UI layout which will flash on resident Android & iOS screens when published.
                </p>
              </div>

              {/* Lock screen swipe bar */}
              <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-4" />

            </div>

            {/* Bottom speaker grilles */}
            <div className="flex justify-center gap-1 mt-4">
              <span className="w-2 h-1 bg-[#1c295c] rounded-full" />
              <span className="w-2 h-1 bg-[#1c295c] rounded-full" />
              <span className="w-2 h-1 bg-[#1c295c] rounded-full" />
            </div>

          </div>

          {/* Quick info card on real-time delivery protocol */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 text-xs font-semibold space-y-2">
            <h4 className="text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Firebase Cloud Delivery (FCM)
            </h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
              We leverage GCP-integrated FCM microservices using encrypted SSL handshake protocols. If a mobile device remains offline, the notification payload is securely queued in cache memory for up to 72 hours.
            </p>
          </div>

        </div>

      </div>

      {/* Section: Live Dispatch Log (Table at the bottom) */}
      <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Filtering Header Panel */}
        <div className="p-4 bg-[#0d1435] border-b border-[#1e2a5e]/60 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Broadcasting Audit</span>
            <h4 className="font-extrabold text-white text-sm uppercase mt-0.5">Dispatched Push Archive Log</h4>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sent alerts title, target society, etc..."
              className="w-full bg-[#070b1a] border border-[#21326d] rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                <th className="p-3.5 w-40">Timestamp</th>
                <th className="p-3.5">Society target</th>
                <th className="p-3.5 w-32">Audience Role</th>
                <th className="p-3.5">Alert Title Accent</th>
                <th className="p-3.5 w-28 text-center font-mono">Delivered Reach</th>
                <th className="p-3.5 w-24 text-center">Verdict Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182352]/30 font-medium">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#131b46]/40 transition">
                    
                    {/* Timestamp */}
                    <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {item.timestamp}
                      </span>
                    </td>

                    {/* Target Society */}
                    <td className="p-3.5 text-white font-black whitespace-nowrap">
                      {item.targetSociety}
                    </td>

                    {/* Target Role */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold border bg-slate-900 text-slate-300 border-slate-800">
                        {item.targetRole}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="p-3.5 text-slate-200">
                      <div className="max-w-xs font-semibold leading-relaxed">
                        <p className="font-bold text-[11px] text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{item.body}</p>
                      </div>
                    </td>

                    {/* Delivered Count */}
                    <td className="p-3.5 text-center font-mono text-indigo-400 font-black">
                      {item.deliveredCount} units <span className="text-[9px] text-slate-500">({item.openRate} open)</span>
                    </td>

                    {/* Status badge */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-black uppercase text-emerald-400">
                          {item.status}
                        </span>
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    <span>No notifications matching your search criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0d1435] border-t border-[#1e2a5e]/60 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
          <span>Active Websocket Gateway: CONNECTED</span>
          <span>Archived: {filteredHistory.length} Transmission Blocks</span>
        </div>

      </div>

    </div>
  );
}
