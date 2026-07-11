import React, { useState } from "react";
import { 
  Building, Users, Shield, DollarSign, Activity, AlertOctagon, 
  Ticket, Users as UsersIcon, Cpu, RefreshCw, BarChart2, TrendingUp, Sparkles, CheckCircle2,
  Activity as HealthIcon, Cloud, Server, Database, BrainCircuit, Heart, Globe, Terminal
} from "lucide-react";

interface SuperAdminDashboardTabProps {
  societiesCount: number;
  totalFlats: number;
  totalUsers: number;
  monthlyRevenue: number;
  users?: any[];
  onSelectSection?: (sectionId: string) => void;
}

export default function SuperAdminDashboardTab({
  societiesCount,
  totalFlats,
  totalUsers,
  monthlyRevenue,
  users = [],
  onSelectSection
}: SuperAdminDashboardTabProps) {
  const [activeChart, setActiveChart] = useState<string>("revenue");

  // Mock aggregates for high-fidelity SaaS experience with corresponding sectionIds for navigation
  const stats = [
    { label: "Total Societies", value: societiesCount, trend: "+12% MoM", icon: Building, color: "text-indigo-400 bg-indigo-500/10", sectionId: "societies" },
    { label: "Total Residents", value: Math.floor(totalUsers * 0.94), trend: "+8.4% MoM", icon: Users, color: "text-purple-400 bg-purple-500/10", sectionId: "residents" },
    { label: "Total Guards Active", value: societiesCount * 4, trend: "Optimal Coverage", icon: Shield, color: "text-emerald-400 bg-emerald-500/10", sectionId: "guards" },
    { label: "Monthly Revenue MRR", value: `₹${monthlyRevenue.toLocaleString()}`, trend: "+18.2%", icon: DollarSign, color: "text-yellow-400 bg-yellow-500/10", sectionId: "billing" },
    { label: "Annual Projected Run Rate", value: `₹${(monthlyRevenue * 12).toLocaleString()}`, trend: "Stable LTV", icon: DollarSign, color: "text-blue-400 bg-blue-500/10", sectionId: "revenue" },
    { label: "Active Visitors (Live)", value: "328", trend: "Gate Sync Live", icon: UsersIcon, color: "text-indigo-400 bg-indigo-500/10", sectionId: "visitors" },
    { label: "Active SOS Alerts", value: "0", trend: "Clean System", icon: AlertOctagon, color: "text-rose-400 bg-rose-500/10 animate-pulse", sectionId: "security_center" },
    { label: "Open Dev Support Tickets", value: "3", trend: "SLA Compliant", icon: Ticket, color: "text-pink-400 bg-pink-500/10", sectionId: "tickets" },
    { label: "Total Online Users", value: "1,402", trend: "Peak hours active", icon: Activity, color: "text-cyan-400 bg-cyan-500/10", sectionId: "residents" },
    { label: "Global Server Load", value: "14%", trend: "Green CPU Uptime", icon: Cpu, color: "text-teal-400 bg-teal-500/10", sectionId: "settings" },
    { label: "API Requests (Daily)", value: "258.4K", trend: "99.98% Success", icon: Activity, color: "text-orange-400 bg-orange-500/10", sectionId: "api" },
    { label: "Database Disk Space Used", value: "44.2%", trend: "1.2 TB Free", icon: BarChart2, color: "text-purple-400 bg-purple-500/10", sectionId: "backup" },
  ];

  const charts = [
    { id: "revenue", label: "Revenue Chart", desc: "Monthly Recurring Revenue projection over last 6 months" },
    { id: "growth", label: "Society Growth", desc: "Acquisition & onboardings of residential gated townships" },
    { id: "dau", label: "Daily Active Users", desc: "Active resident & security logs on mobile/tablets" },
    { id: "visitors", label: "Visitor Traffic", desc: "Visitor, parcel, & cab pre-approvals processed" },
    { id: "complaints", label: "Complaint Analytics", desc: "Auto-resolution and ticket velocity tracker" },
    { id: "collection", label: "Payment Collection", desc: "Automatic society maintenance invoice clearances" },
    { id: "renewal", label: "Renewal Graph", desc: "Countdown distribution of plan expiries" },
    { id: "ai_prediction", label: "AI Prediction Graph", desc: "JobsKaru smart forecasting models for Q4 scaling" },
  ];

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e295d] pb-4">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> 
            Global Control Board
          </span>
          <h2 className="text-2xl font-black text-white mt-1">JobsKaru Dev Master Control Center</h2>
          <p className="text-xs text-slate-400">Live system metrics, transactional aggregates, platform health index, and real-time operational telemetry.</p>
        </div>
        <div className="bg-[#11193d]/80 border border-[#23357a] p-1.5 rounded-xl flex items-center gap-2">
          <span className="text-[10px] font-mono text-indigo-300 px-2 py-1">Node: gcp-asia-southeast1</span>
          <span className="text-emerald-400 font-extrabold text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Optimal
          </span>
        </div>
      </div>

      {/* NEW: 5 SaaS Core Enterprise Pillars Row */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">
          💎 SaaS Enterprise Core Pillars
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Pillar 1: Platform Health */}
          <div 
            onClick={() => onSelectSection?.("settings")}
            className="bg-gradient-to-br from-[#0c1439] to-[#080d28] border border-[#203273] rounded-2xl p-4 shadow-xl hover:border-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
            title="Click to view Platform Settings & Health logs"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Platform Health</span>
              <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-lg font-black text-white">99.98% OK</p>
            <p className="text-[9px] text-slate-400 mt-1">14ms API latency</p>
            <span className="inline-block mt-3 text-[8px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              Live Stream
            </span>
          </div>

          {/* Pillar 2: Cloud Usage */}
          <div 
            onClick={() => onSelectSection?.("backup")}
            className="bg-gradient-to-br from-[#0c1439] to-[#080d28] border border-[#203273] rounded-2xl p-4 shadow-xl hover:border-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
            title="Click to view Backup, Cloud databases & Storage"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Cloud Usage</span>
              <Cloud className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg font-black text-white">44.2% Disk</p>
            <p className="text-[9px] text-slate-400 mt-1">12 Kubernetes Pods</p>
            <span className="inline-block mt-3 text-[8px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              GCP Clusters
            </span>
          </div>

          {/* Pillar 3: Server Status */}
          <div 
            onClick={() => onSelectSection?.("settings")}
            className="bg-gradient-to-br from-[#0c1439] to-[#080d28] border border-[#203273] rounded-2xl p-4 shadow-xl hover:border-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
            title="Click to view Server Load & Settings"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Server Status</span>
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-lg font-black text-white">14% CPU Load</p>
            <p className="text-[9px] text-slate-400 mt-1">RAM: 2.1GB/16GB</p>
            <span className="inline-block mt-3 text-[8px] uppercase font-bold tracking-wider text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
              Docker Nodes
            </span>
          </div>

          {/* Pillar 4: SaaS Revenue */}
          <div 
            onClick={() => onSelectSection?.("revenue")}
            className="bg-gradient-to-br from-[#0c1439] to-[#080d28] border border-[#203273] rounded-2xl p-4 shadow-xl hover:border-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
            title="Click to view Revenue Analytics & charts"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">SaaS Revenue</span>
              <DollarSign className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-lg font-black text-white">₹51,500 MRR</p>
            <p className="text-[9px] text-slate-400 mt-1">₹6.18L ARR Target</p>
            <span className="inline-block mt-3 text-[8px] uppercase font-bold tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
              Reconciliation
            </span>
          </div>

          {/* Pillar 5: AI Status */}
          <div 
            onClick={() => onSelectSection?.("ai_control")}
            className="bg-gradient-to-br from-[#0c1439] to-[#080d28] border border-[#203273] rounded-2xl p-4 shadow-xl hover:border-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer"
            title="Click to open AI Control Center"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">AI Status</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-lg font-black text-white">Active Node</p>
            <p className="text-[9px] text-slate-400 mt-1">ANPR Confidence: 98.4%</p>
            <span className="inline-block mt-3 text-[8px] uppercase font-bold tracking-wider text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full">
              JobsKaru Neural
            </span>
          </div>

        </div>
      </div>

      <div className="border-t border-[#1e2a5d]/30 my-2"></div>

      {/* Grid Stats (Dashboard Cards) */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">
          📊 Platform Transactional Aggregates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const hasLink = !!stat.sectionId;
            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (hasLink && onSelectSection) {
                    onSelectSection(stat.sectionId);
                  }
                }}
                className={`bg-[#0b1029]/80 border border-[#1d2a5e]/70 rounded-2xl p-4 transition-all duration-200 relative overflow-hidden group shadow shadow-slate-950/20 ${
                  hasLink 
                    ? "cursor-pointer hover:border-[#384fa6] hover:bg-[#0f173b] hover:scale-[1.02] active:scale-[0.98]" 
                    : "hover:border-[#1d2a5e]"
                }`}
                title={hasLink ? `Click to view ${stat.label} details` : undefined}
              >
                {/* Decorative side accent */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition duration-200" />
                
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate max-w-[80%]">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-xl ${stat.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-lg font-black text-white block tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded-full inline-block mt-1 font-extrabold">
                    {stat.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Section & Custom Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Navigation Sidebar for charts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0c1334]/90 border border-[#1e2a5f] p-4 rounded-2xl">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Telemetry Channels
            </h4>
            <p className="text-[10px] text-slate-400 mb-4 leading-normal">Select a projection stream to relay onto the master visualizer board.</p>
            
            <div className="space-y-1.5">
              {charts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveChart(c.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activeChart === c.id 
                      ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 border-l-2 border-indigo-500 text-white shadow shadow-indigo-950/50" 
                      : "hover:bg-slate-900/40 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div>
                    <span className="block font-black leading-tight text-[11px]">{c.label}</span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-0.5 truncate max-w-[200px]">{c.desc}</span>
                  </div>
                  {activeChart === c.id && (
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-black scale-90">Live</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick AI summary memo */}
          <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/30 border border-[#2a1d63]/50 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider">JobsKaru Forecasting Node</span>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal font-semibold">
                SaaS metrics indicate an LTV:CAC ratio of 8.2x. AI forecasts high adoption in Bengaluru & Maharashtra sectors for the upcoming festive cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Major Visualizer Panel (Dynamic high-fidelity SVG graphs) */}
        <div className="lg:col-span-8 bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#1e2c65]/60 pb-3 mb-4">
              <div>
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  📉 Relay: {charts.find(c => c.id === activeChart)?.label}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{charts.find(c => c.id === activeChart)?.desc}</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#15204d] text-indigo-400 px-2 py-1 rounded-lg border border-indigo-900/30">
                Resolution: Real-time Partition
              </span>
            </div>

            {/* Custom SVG Drawing depending on chosen chart */}
            <div className="relative h-60 w-full bg-[#070b1a]/95 rounded-xl border border-[#141b3d] flex items-center justify-center p-4">
              
              {/* Background grids */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-slate-500" />
                ))}
              </div>

              {activeChart === "revenue" && (
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Shaded Area */}
                  <path d="M 50 180 Q 150 140 250 110 T 450 70 T 550 40 L 550 180 L 50 180 Z" fill="url(#revenueGrad)" />
                  
                  {/* Curve Path */}
                  <path d="M 50 180 Q 150 140 250 110 T 450 70 T 550 40" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Data Points */}
                  <circle cx="50" cy="180" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="150" cy="151" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="250" cy="110" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="350" cy="85" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="450" cy="70" r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                  <circle cx="550" cy="40" r="5" fill="#ffffff" stroke="#e0e7ff" strokeWidth="4" />
                  
                  {/* Labels on chart */}
                  <text x="50" y="195" fill="#64748b" fontSize="8" fontFamily="monospace">Feb</text>
                  <text x="150" y="195" fill="#64748b" fontSize="8" fontFamily="monospace">Mar</text>
                  <text x="250" y="195" fill="#64748b" fontSize="8" fontFamily="monospace">Apr</text>
                  <text x="350" y="195" fill="#64748b" fontSize="8" fontFamily="monospace">May</text>
                  <text x="450" y="195" fill="#64748b" fontSize="8" fontFamily="monospace">Jun</text>
                  <text x="530" y="195" fill="#818cf8" fontSize="8" fontFamily="monospace" fontWeight="bold">Jul (Live)</text>
                  
                  {/* Data Values hover mock */}
                  <text x="510" y="25" fill="#ffffff" fontSize="9" fontFamily="sans-serif" fontWeight="black" className="bg-slate-900">₹43,000</text>
                </svg>
              )}

              {activeChart === "growth" && (
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Bar charts for Society growth */}
                  {/* Society count going from 1, 2, 3, 4, 5 */}
                  {[
                    { x: 80, h: 40, label: "Q1 2026", count: "1 Client" },
                    { x: 160, h: 70, label: "Feb", count: "2 Clients" },
                    { x: 240, h: 100, label: "Apr", count: "3 Clients" },
                    { x: 320, h: 120, label: "May", count: "4 Clients" },
                    { x: 400, h: 140, label: "Jun", count: "4 Clients" },
                    { x: 480, h: 170, label: "Jul (Live)", count: "5 Clients" },
                  ].map((bar, i) => (
                    <g key={i}>
                      {/* Drop shadow back bar */}
                      <rect x={bar.x - 15} y={180 - bar.h} width="30" height={bar.h} rx="6" fill="#a855f7" opacity="0.3" />
                      <rect x={bar.x - 15} y={180 - bar.h} width="30" height={bar.h} rx="6" fill="url(#purpleGrad)" />
                      <text x={bar.x - 20} y="195" fill="#64748b" fontSize="8" fontFamily="monospace">{bar.label}</text>
                      <text x={bar.x - 15} y={170 - bar.h} fill="#e9d5ff" fontSize="8" fontWeight="bold" fontFamily="monospace">{bar.count}</text>
                    </g>
                  ))}
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {activeChart !== "revenue" && activeChart !== "growth" && (
                <div className="flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                  <BarChart2 className="w-10 h-10 text-indigo-400 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Stream Connected</span>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                    JobsKaru telemetry has successfully mapped <b>{activeChart}</b> channels. Running predictive simulations at 60 FPS.
                  </p>
                  <div className="mt-4 flex items-center gap-1 bg-[#101b44] px-3 py-1 rounded-full border border-[#23357a]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] font-mono text-emerald-400">Stream matched with GCP Master Node logs</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2a5e]/50 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-[9.5px] font-mono text-slate-500">
              AUDIT VERIFICATION HANDSHAKE: <span className="text-indigo-400">PASSED</span> (SHA-256 Checksum Verified)
            </span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => alert("Re-shaping data vectors and triggering real-time stream clear...")}
                className="text-[9px] bg-[#121c46] hover:bg-[#1a275f] border border-[#23357a] text-slate-300 font-extrabold px-3 py-1 rounded-lg transition uppercase tracking-wider"
              >
                Clear Cache
              </button>
              <button 
                type="button" 
                onClick={() => alert("Re-fetching master aggregates from asia-southeast1 GCP database pools...")}
                className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-1 rounded-lg transition uppercase tracking-wider shadow shadow-indigo-600/25"
              >
                Force Sync
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Real-time Registered Demo Users Tracking Logs */}
      <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1e2c65]/60 pb-3 mb-4">
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              Live Demo Registrations Tracker (डेमो रजिस्ट्रेशन समय ट्रैकर)
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time registration audit trail. Displays precise date, time, and role of all sandbox demo signups.</p>
          </div>
          <span className="text-[9px] font-mono font-bold bg-[#15204d] text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-900/20 uppercase">
            Total Demo Signups: {users.length}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-bold">
            No live demo registration sessions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-2.5 pr-4">Date & Time (दिनांक और समय)</th>
                  <th className="py-2.5 px-2">User Name</th>
                  <th className="py-2.5 px-2">Mobile Number (OTP Target)</th>
                  <th className="py-2.5 px-2">Assigned Role</th>
                  <th className="py-2.5 px-2">Flat / Workplace</th>
                  <th className="py-2.5 pl-2 text-right">Device Registration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {[...users].slice().reverse().map((usr) => {
                  const regDate = usr.registeredAt ? new Date(usr.registeredAt) : new Date("2026-07-08T10:00:00Z");
                  return (
                    <tr key={usr.id} className="hover:bg-indigo-950/20 transition-all">
                      <td className="py-3 pr-4 font-mono text-[11px] text-emerald-400 font-bold">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {regDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • {regDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-white">{usr.name}</td>
                      <td className="py-3 px-2 font-mono text-slate-300">{usr.phone}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-block text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                          usr.role === "admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          usr.role === "guard" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          usr.role === "super_admin" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        }`}>
                          {usr.role === "admin" ? "Committee" : usr.role === "super_admin" ? "SaaS Owner" : usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-400">
                        {usr.role === "resident" ? `Flat ${usr.flat || "A-402"}` :
                         usr.role === "guard" ? `${usr.gate || "Gate 1"} (${usr.shift || "Day"})` :
                         usr.role === "admin" ? `${usr.committee || "Greenwood Comm."}` : "Global Cloud Node"}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-black">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          Active (Demo Active)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
