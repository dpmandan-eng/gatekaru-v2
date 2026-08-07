import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Lock,
  Globe,
  Clock,
  User,
  ShieldCheck,
  Plus,
  Key,
  Laptop
} from "lucide-react";

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: "Super Admin" | "Society Admin" | "Security Guard" | "Resident";
  flatOrLocation: string;
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Guard Kiosk";
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActiveTime: string;
  isCurrentSession?: boolean;
  status: "Active" | "Idle" | "Flagged";
}

const INITIAL_SESSIONS: UserSession[] = [
  {
    id: "sess_101",
    userId: "USR-001",
    userName: "System Super Admin (You)",
    userRole: "Super Admin",
    flatOrLocation: "Master Operations Command",
    deviceType: "Desktop",
    deviceName: "Apple MacBook Pro M3 Max",
    browser: "Chrome 126.0 (macOS)",
    ipAddress: "10.42.0.1 (VPN Whitelisted)",
    location: "Mumbai, MH (India)",
    loginTime: "Today, 09:15 AM",
    lastActiveTime: "Active Now",
    isCurrentSession: true,
    status: "Active"
  },
  {
    id: "sess_102",
    userId: "USR-042",
    userName: "Rajesh Kumar (Head Guard)",
    userRole: "Security Guard",
    flatOrLocation: "Main Gate Terminal 1",
    deviceType: "Guard Kiosk",
    deviceName: "Samsung Galaxy Tab Active 4 Pro",
    browser: "GateKaru Guard App v4.2",
    ipAddress: "192.168.1.15",
    location: "Gurugram, HR (Gate 1)",
    loginTime: "Today, 06:00 AM",
    lastActiveTime: "2 mins ago",
    status: "Active"
  },
  {
    id: "sess_103",
    userId: "USR-108",
    userName: "Aarav Sharma (RWA Secretary)",
    userRole: "Society Admin",
    flatOrLocation: "Flat A-402 (Greenwood Heights)",
    deviceType: "Desktop",
    deviceName: "Windows 11 Workstation",
    browser: "Edge 125.0 (Windows)",
    ipAddress: "122.180.20.12",
    location: "New Delhi, DL (India)",
    loginTime: "Today, 08:30 AM",
    lastActiveTime: "12 mins ago",
    status: "Active"
  },
  {
    id: "sess_104",
    userId: "USR-205",
    userName: "Meenakshi Sundaram",
    userRole: "Resident",
    flatOrLocation: "Flat C-1104 (Tower C)",
    deviceType: "Mobile",
    deviceName: "iPhone 15 Pro",
    browser: "GateKaru iOS App v3.8",
    ipAddress: "49.207.195.88",
    location: "Bengaluru, KA (Cellular)",
    loginTime: "Yesterday, 10:45 PM",
    lastActiveTime: "45 mins ago",
    status: "Idle"
  },
  {
    id: "sess_105",
    userId: "USR-312",
    userName: "Suraj Bhan (Gate 2 Patrol)",
    userRole: "Security Guard",
    flatOrLocation: "Basement B1 Guard Station",
    deviceType: "Tablet",
    deviceName: "Lenovo Tab M10",
    browser: "GateKaru Guard Kiosk v4.1",
    ipAddress: "192.168.1.42",
    location: "Gurugram, HR (B1 Gate)",
    loginTime: "Today, 07:00 AM",
    lastActiveTime: "1 hour ago",
    status: "Flagged"
  }
];

interface SessionManagerProps {
  darkMode?: boolean;
}

export default function SessionManager({ darkMode = true }: SessionManagerProps) {
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [deviceFilter, setDeviceFilter] = useState<string>("All");
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Revoke single user session
  const handleRevokeSession = (sessionId: string, userName: string, deviceName: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast(`🚫 REVOKED: Forced logout initiated for ${userName} on ${deviceName}. Session authorization token destroyed.`);
  };

  // Revoke all other sessions except current user session
  const handleRevokeAllOtherSessions = () => {
    const current = sessions.filter(s => s.isCurrentSession);
    const countRevoked = sessions.length - current.length;
    setSessions(current);
    showToast(`⚠️ SECURITY PURGE COMPLETE: Revoked ${countRevoked} active user sessions. Only your current session remains active.`);
  };

  // Add simulated session for testing
  const handleSimulateNewSession = () => {
    const roles: UserSession["userRole"][] = ["Resident", "Security Guard", "Society Admin"];
    const randRole = roles[Math.floor(Math.random() * roles.length)];
    const randId = `sess_${Math.floor(100 + Math.random() * 900)}`;

    const newSess: UserSession = {
      id: randId,
      userId: `USR-${Math.floor(100 + Math.random() * 900)}`,
      userName: randRole === "Resident" ? "Vikram Malhotra" : randRole === "Security Guard" ? "Deepak Singh Guard" : "Pooja Gupta Admin",
      userRole: randRole,
      flatOrLocation: randRole === "Resident" ? "Flat B-701" : "Gate Terminal",
      deviceType: randRole === "Resident" ? "Mobile" : randRole === "Security Guard" ? "Guard Kiosk" : "Desktop",
      deviceName: randRole === "Resident" ? "OnePlus 12 Android" : "Guard Handheld Scanner",
      browser: "GateKaru App v4.2",
      ipAddress: `192.168.1.${Math.floor(10 + Math.random() * 80)}`,
      location: "Delhi NCR, IN",
      loginTime: "Just now",
      lastActiveTime: "Active Now",
      status: "Active"
    };

    setSessions([newSess, ...sessions]);
    showToast(`📱 NEW ACTIVE SESSION DETECTED: ${newSess.userName} logged in from ${newSess.deviceName}.`);
  };

  // Filtered session list
  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.flatOrLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.browser.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || s.userRole === roleFilter;
    const matchesDevice = deviceFilter === "All" || s.deviceType === deviceFilter;

    return matchesSearch && matchesRole && matchesDevice;
  });

  const cardBg = darkMode
    ? "bg-[#0b1029]/90 border border-[#1e2a5e] text-white shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-md";

  return (
    <div className={`${cardBg} rounded-2xl p-5 space-y-5 transition-all select-none relative overflow-hidden`}>
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#1f2e63] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/40 animate-pulse">
              <Monitor className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Active Session Manager & Force Logout Terminal (सक्रिय सेशन प्रबंधन)
            </span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            Live Active User Sessions & Token Invalidation
          </h2>
          <p className="text-xs text-slate-400">
            Real-time session audit of signed-in RWA admins, on-duty gate guards, and resident mobile apps with one-click token revocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Simulate New Session */}
          <button
            type="button"
            onClick={handleSimulateNewSession}
            className="bg-[#121c45] hover:bg-[#1b2a63] text-indigo-200 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#283c85] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" /> Simulate Login
          </button>

          {/* Revoke All Other Sessions */}
          <button
            type="button"
            onClick={handleRevokeAllOtherSessions}
            disabled={sessions.length <= 1}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-rose-400/50 shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Revoke All Other Sessions</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-950/95 border border-indigo-500/60 text-indigo-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-mono text-xs">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-indigo-400" /> Active Sessions
          </span>
          <p className="text-lg font-black text-white font-mono">{sessions.length} Live</p>
          <p className="text-[9.5px] text-emerald-400">Tokens valid & active</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Tablet className="w-3.5 h-3.5 text-amber-400" /> Guard Terminals
          </span>
          <p className="text-lg font-black text-amber-300 font-mono">
            {sessions.filter(s => s.userRole === "Security Guard").length} Active
          </p>
          <p className="text-[9.5px] text-slate-500">On-duty gate scanners</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> Resident Apps
          </span>
          <p className="text-lg font-black text-indigo-300 font-mono">
            {sessions.filter(s => s.userRole === "Resident").length} Mobile
          </p>
          <p className="text-[9.5px] text-slate-500">Pre-approval passes active</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Current Session
          </span>
          <p className="text-lg font-black text-emerald-400 font-mono">Protected</p>
          <p className="text-[9.5px] text-slate-500">Master Super Admin token</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-[#070b1a] border border-[#192756] p-3 rounded-xl">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search User, Device, IP, Flat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-[#030612] border border-[#1e2a5e] text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All User Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Society Admin">Society Admin</option>
            <option value="Security Guard">Security Guard</option>
            <option value="Resident">Resident</option>
          </select>

          <select
            value={deviceFilter}
            onChange={e => setDeviceFilter(e.target.value)}
            className="bg-[#030612] border border-[#1e2a5e] text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All Device Types</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
            <option value="Guard Kiosk">Guard Kiosk</option>
          </select>
        </div>
      </div>

      {/* Session Cards & Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-[#060a19] border border-[#182654] rounded-xl">
            No active user sessions found matching your filters.
          </div>
        ) : (
          filteredSessions.map(sess => {
            let roleBadge = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
            if (sess.userRole === "Super Admin") roleBadge = "bg-purple-500/20 text-purple-300 border-purple-500/40";
            if (sess.userRole === "Security Guard") roleBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
            if (sess.userRole === "Resident") roleBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

            return (
              <div
                key={sess.id}
                className={`p-4 rounded-xl border transition space-y-3 flex flex-col justify-between shadow-xl ${
                  sess.isCurrentSession
                    ? "bg-[#080d26] border-indigo-500/70 ring-1 ring-indigo-500/30"
                    : "bg-[#060a19] border-[#182654] hover:border-indigo-500/40"
                }`}
              >
                <div className="space-y-2">
                  {/* Top user & status header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-white">{sess.userName}</span>
                        {sess.isCurrentSession && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-black uppercase">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{sess.flatOrLocation}</p>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${roleBadge}`}>
                      {sess.userRole}
                    </span>
                  </div>

                  {/* Device & Browser Info */}
                  <div className="bg-[#030612] p-2.5 rounded-xl border border-[#131f45] space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-200 font-bold">
                      {sess.deviceType === "Desktop" ? (
                        <Laptop className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      ) : sess.deviceType === "Guard Kiosk" ? (
                        <Tablet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{sess.deviceName}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                      <p className="truncate">Browser: {sess.browser}</p>
                      <p>IP Address: <strong className="text-slate-300">{sess.ipAddress}</strong></p>
                      <p className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-indigo-400" /> {sess.location}
                      </p>
                    </div>
                  </div>

                  {/* Login Time telemetry */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Login: {sess.loginTime}
                    </span>
                    <span className="text-emerald-400 font-bold">{sess.lastActiveTime}</span>
                  </div>
                </div>

                {/* Revoke Button Action */}
                <div className="pt-2 border-t border-[#182654]">
                  {sess.isCurrentSession ? (
                    <div className="text-center text-[10px] text-slate-500 font-mono py-1">
                      🔒 Master session protected from self-revocation
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id, sess.userName, sess.deviceName)}
                      className="w-full bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Revoke Session
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
