import React, { useState, useEffect } from "react";
import { 
  Ticket, MessageSquare, Shield, Monitor, Key, Lock, Eye, CheckCircle2, 
  Trash2, Plus, Terminal, RefreshCw, Send, Check
} from "lucide-react";
import SessionManager from "./SessionManager";
import ApiKeyManager from "./ApiKeyManager";

interface SuperAdminSupportSecurityProps {
  activeSection?: string;
}

export default function SuperAdminSupportSecurity({ activeSection }: SuperAdminSupportSecurityProps) {
  const [subTab, setSubTab] = useState<"support" | "security">("support");

  useEffect(() => {
    if (activeSection === "security_center") {
      setSubTab("security");
    } else if (activeSection === "tickets") {
      setSubTab("support");
    }
  }, [activeSection]);

  // Support desk states
  const [tickets, setTickets] = useState([
    { id: "TCK-402", society: "Greenwood Heights", issue: "RTSP Camera feed delay of 5s on Gate 2", status: "Open", date: "2026-07-08", priority: "High" },
    { id: "TCK-401", society: "Palm Heights Phase II", issue: "Monthly accounting ledger rounding off UPI paise", status: "Open", date: "2026-07-06", priority: "Medium" },
    { id: "TCK-395", society: "Royal Orchids Estate", issue: "RFID guard tag replacement lost sync", status: "Resolved", date: "2026-07-02", priority: "Low" }
  ]);
  const [newIssue, setNewIssue] = useState("");
  const [newSoc, setNewSoc] = useState("Greenwood Heights");

  // Live Chat simulation states
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: "JobsKaru Live Remote Support session opened. Type a query to talk to on-duty systems engineers.", time: "12:00 PM" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Screen share simulation status
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);

  // Security Center states
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(["127.0.0.1", "10.42.0.1", "192.168.1.100"]);
  const [newIp, setNewIp] = useState("");

  const [deviceSessions, setDeviceSessions] = useState([
    { id: "sess_1", device: "macOS Developer Workstation", location: "Mumbai, MH", active: "Now", ip: "10.42.0.1" },
    { id: "sess_2", device: "iPad Guard Console (Gate 1)", location: "Gurugram, HR", active: "12 mins ago", ip: "192.168.1.15" },
    { id: "sess_3", device: "Android Resident App", location: "Pune, MH", active: "1 hour ago", ip: "122.180.20.12" }
  ]);

  const closeTicket = (id: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) return { ...t, status: "Resolved" };
      return t;
    }));
    alert(`🎫 Ticket ${id} marked as RESOLVED.`);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.trim()) return;
    const newId = `TCK-${Math.floor(Math.random() * 900) + 100}`;
    setTickets(prev => [
      { id: newId, society: newSoc, issue: newIssue, status: "Open", date: "2026-07-09", priority: "High" },
      ...prev
    ]);
    setNewIssue("");
    alert(`🎫 Ticket ${newId} dispatched to JobsKaru level 2 priority queue.`);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "You", text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Query received by JobsKaru master command server. ";
      const q = userMsg.toLowerCase();
      if (q.includes("camera") || q.includes("stream") || q.includes("video")) {
        replyText += "We are re-shaping the RTSP video streams across asia-southeast1 relay paths. Expected resolution within 30 minutes.";
      } else if (q.includes("accounting") || q.includes("ledger") || q.includes("upi")) {
        replyText += "The ledger calculations have been re-validated with Razorpay / Stripe logs. Float decimal points are resolved.";
      } else {
        replyText += "A remote infrastructure engineer has been assigned to this thread and is auditing logs inside your partition.";
      }

      setChatMessages(prev => [...prev, { sender: "JobsKaru Support Bot", text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setIpWhitelist(prev => [...prev, newIp]);
    setNewIp("");
    alert(`🔐 IP Address ${newIp} successfully whitelisted for Master Portal access.`);
  };

  const deleteIp = (ip: string) => {
    setIpWhitelist(prev => prev.filter(i => i !== ip));
  };

  const revokeSession = (id: string, device: string) => {
    setDeviceSessions(prev => prev.filter(s => s.id !== id));
    alert(`⚠️ Session revoked on device: ${device}. Active authorization cookies invalidated.`);
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Header */}
      <div className="border-b border-[#1e295d] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" /> Administrative Support & Threat Mitigation
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Super Support & Security Center</h2>
          <p className="text-xs text-slate-400">Launch remote diagnostic assistance session, resolve critical tenant tickets, enforce 2FA login policies, and whitelist IP ranges.</p>
        </div>

        {/* Sub-tabs selector */}
        <div className="bg-[#11193d] border border-[#23357a] p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSubTab("support")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition tracking-wider ${subTab === "support" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Support Center
          </button>
          <button
            type="button"
            onClick={() => setSubTab("security")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition tracking-wider ${subTab === "security" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Security Center
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SUPPORT DESK VIEW */}
      {/* ======================================================= */}
      {subTab === "support" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Support Tickets Board */}
          <div className="lg:col-span-7 bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#203273] pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-4.5 h-4.5 text-indigo-400" /> Active RWA Support Tickets
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Urgent software queries submitted by society management committees.</p>
              </div>
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded font-bold">
                Tickets Open: {tickets.filter(t => t.status === "Open").length}
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-3.5 bg-[#070b1a]/95 border border-[#17214e] rounded-xl flex items-start justify-between hover:border-[#25367c] transition">
                  <div className="space-y-1 max-w-[75%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-indigo-400 font-extrabold text-xs">{t.id}</span>
                      <span className="text-[10px] bg-[#11193a] border border-[#20306c] px-1.5 py-0.5 rounded font-black text-white">{t.society}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${t.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" : "bg-slate-800 text-slate-400"}`}>{t.priority} Priority</span>
                    </div>
                    <p className="text-[11.5px] font-semibold text-slate-200 leading-normal">{t.issue}</p>
                    <span className="text-[9.5px] text-slate-500 font-bold block">Submitted: {t.date} • Status: <span className={t.status === "Open" ? "text-amber-400" : "text-emerald-400"}>{t.status}</span></span>
                  </div>

                  {t.status === "Open" ? (
                    <button
                      type="button"
                      onClick={() => closeTicket(t.id)}
                      className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1 px-2 rounded-lg transition uppercase tracking-wider"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs">✔ Solved</span>
                  )}
                </div>
              ))}
            </div>

            {/* Ticket Generator form */}
            <form onSubmit={handleCreateTicket} className="space-y-3 pt-3 border-t border-[#1a285a] text-xs font-semibold">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newSoc}
                  onChange={(e) => setNewSoc(e.target.value)}
                  className="bg-[#0a0f24] border border-[#21326d] rounded-lg p-2 text-white"
                >
                  <option value="Greenwood Heights">Greenwood Heights</option>
                  <option value="Palm Heights Phase II">Palm Heights Phase II</option>
                  <option value="Royal Orchids Estate">Royal Orchids Estate</option>
                </select>
                <input 
                  type="text" 
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Describe level 2 server issue..." 
                  className="bg-[#0a0f24] border border-[#21326d] rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-[#11193d] hover:bg-[#1a265b] border border-[#233575] text-indigo-400 hover:text-white font-black py-2 rounded-lg uppercase transition">
                Create Priority Ticket
              </button>
            </form>
          </div>

          {/* Live Diagnostic Chat and Screen Sharing (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live diagnostic chat */}
            <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-3 flex flex-col justify-between h-80">
              <div className="border-b border-[#1f2d6c] pb-2 flex justify-between items-center">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4.5 h-4.5 text-purple-400" /> Diagnostics Live Chat
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              {/* Message Log */}
              <div className="flex-1 bg-[#050816] rounded-xl p-3 border border-[#141c3f] overflow-y-auto space-y-3 text-[11px] custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                    <span className="text-[8.5px] text-slate-500 font-bold mb-0.5">{msg.sender} • {msg.time}</span>
                    <div className={`p-2 rounded-xl max-w-[85%] font-semibold leading-normal ${msg.sender === "You" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-300 border border-slate-800"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-[10px] text-slate-500 italic animate-pulse">JobsKaru Support is typing diagnostic reply...</div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask live engineer or trigger diagnostic queries..."
                  className="flex-1 bg-[#0a0f24] border border-[#21326d] rounded-xl p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-xl flex items-center justify-center transition">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Remote Diagnostics / Screen Share console */}
            <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-4.5 h-4.5 text-indigo-400" /> Diagnostics Remote Handshake
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">Allows direct debugger mounting on active client tablets at gate security partitions.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsScreenShared(!isScreenShared);
                    alert(isScreenShared ? "Screen mirroring terminated." : "Mirrored Greenwood Heights Active Gate terminal. Resolution 1080p.");
                  }}
                  className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${isScreenShared ? "bg-indigo-600 text-white" : "bg-[#11193d] border border-[#233575] text-indigo-400 hover:text-white"}`}
                >
                  {isScreenShared ? "Screen Shared ✔" : "Start Screen Share"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRemoteConnected(!isRemoteConnected);
                    alert(isRemoteConnected ? "Remote command session terminated." : "Remote shell tunnel opened. Host IP: 10.42.0.1.");
                  }}
                  className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${isRemoteConnected ? "bg-purple-600 text-white animate-pulse" : "bg-[#11193d] border border-[#233575] text-purple-400 hover:text-white"}`}
                >
                  {isRemoteConnected ? "Diagnostic Tunnel ✔" : "Remote Debug Hub"}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* SECURITY CENTER VIEW */}
      {/* ======================================================= */}
      {subTab === "security" && (
        <div className="space-y-6">
          {/* Dedicated Security Center API Key Manager */}
          <ApiKeyManager darkMode={true} />

          {/* Live Session Manager Component */}
          <SessionManager darkMode={true} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Policies Matrix */}
              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Global Security Handshake Policy</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-[#070b1a]/95 border border-[#16214a] rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Enforce 2FA Admin Login</span>
                    <button 
                      onClick={() => {
                        setIs2FaEnabled(!is2FaEnabled);
                        alert(`Two-factor configuration updated to: ${!is2FaEnabled ? "ENFORCED" : "OPTIONAL"}`);
                      }}
                      className="text-indigo-400 font-bold focus:outline-none"
                    >
                      {is2FaEnabled ? "✔ ACTIVE" : "DISABLED"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">Requires TOTP Google Authenticator token handshake on RWA committee logins.</p>
                </div>

                <div className="p-3 bg-[#070b1a]/95 border border-[#16214a] rounded-xl space-y-1">
                  <span className="text-white block">API Session TTL (Expiry)</span>
                  <p className="text-[10.5px] text-indigo-400 font-mono font-black pt-1">24 Hours (Rolling)</p>
                  <p className="text-[9px] text-slate-500">Automatically invalidates JWT tokens during inactivity periods.</p>
                </div>
              </div>
            </div>

          </div>

          {/* IP Whitelisting & Role Permissions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* IP Whitelist */}
            <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">IP Address Whitelist</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Enforce strict login constraints. Only whitelisted IPs can access developer tools.</p>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {ipWhitelist.map((ip) => (
                  <div key={ip} className="flex justify-between items-center bg-[#070b1a]/95 border border-[#152148] p-2.5 rounded-xl text-xs font-mono">
                    <span className="text-indigo-300 font-bold">{ip}</span>
                    <button 
                      onClick={() => deleteIp(ip)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddIp} className="flex gap-2">
                <input 
                  type="text" 
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="e.g. 192.168.1.50" 
                  className="flex-1 bg-[#0a0f24] border border-[#21326d] rounded-lg p-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 rounded-lg text-xs uppercase">
                  Whitelist
                </button>
              </form>
            </div>

            {/* Role Permissions Matrix */}
            <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Handshake Role Privileges</h3>
              <div className="space-y-2 font-semibold">
                <div className="p-2 bg-[#070b1a]/95 rounded-xl border border-[#152148] flex justify-between">
                  <span className="text-white">Developer Super Admin</span>
                  <span className="text-purple-400 font-bold">ALL_ACCESS</span>
                </div>
                <div className="p-2 bg-[#070b1a]/95 rounded-xl border border-[#152148] flex justify-between">
                  <span className="text-white">RWA Committee Admin</span>
                  <span className="text-indigo-400 font-bold">SOCIETY_LEDGER_WRITE</span>
                </div>
                <div className="p-2 bg-[#070b1a]/95 rounded-xl border border-[#152148] flex justify-between">
                  <span className="text-white">Security Guard Patrol</span>
                  <span className="text-emerald-400 font-bold">VISITOR_VISUAL_READ</span>
                </div>
              </div>
            </div>

            {/* API Keys Management */}
            <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#1c295c] pb-2">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" /> Multi-Tenant API Keys Vault
                </h3>
                <button 
                  type="button"
                  onClick={() => alert("🔑 New API secret generated: gk_live_sec_key_" + Math.random().toString(36).substring(2, 12))}
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition"
                >
                  + Generate Secret
                </button>
              </div>
              <div className="space-y-2 font-mono text-[10.5px]">
                <div className="p-2.5 bg-[#070b1a] border border-[#1a285a] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-amber-300 font-bold block">gk_live_8492019482104</span>
                    <span className="text-[9px] text-slate-500">Read/Write • Society Sync API</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert("Copied API key to clipboard!")}
                    className="text-[9px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-sans uppercase font-bold hover:bg-slate-700"
                  >
                    Copy Key
                  </button>
                </div>
                <div className="p-2.5 bg-[#070b1a] border border-[#1a285a] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-amber-300 font-bold block">gk_live_9921049102831</span>
                    <span className="text-[9px] text-slate-500">Read Only • CCTV Relay Endpoint</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert("Copied API key to clipboard!")}
                    className="text-[9px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-sans uppercase font-bold hover:bg-slate-700"
                  >
                    Copy Key
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    )}

  </div>
);
}
