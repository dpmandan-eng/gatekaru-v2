import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Bell, Globe, Moon, Sun, Cpu, Database, Calendar, Sparkles, 
  Terminal, ShieldCheck, Heart, Info, RefreshCw, ChevronDown, User, 
  LogOut, Shield, Layout, Radio, Clock, AlertTriangle, CheckCircle, Menu 
} from "lucide-react";

interface SuperAdminHeaderProps {
  simulatedDate: string;
  onUpdateSimulatedDate: (newDate: string) => void;
  onSearchQuery?: (q: string) => void;
  societies?: any[];
  residents?: any[];
  visitors?: any[];
  activeSocietyId?: string;
  setActiveSocietyId?: (id: string) => void;
  onSwitchPortal?: (portal: "resident" | "guard" | "admin" | "super_admin") => void;
  onLogout?: () => void;
  currentUser?: any;
  onViewDetails?: (type: "resident" | "visitor" | "society", item: any) => void;
  onToggleMobileMenu?: () => void;
}

export default function SuperAdminHeader({ 
  simulatedDate, 
  onUpdateSimulatedDate, 
  onSearchQuery,
  societies = [],
  residents = [],
  visitors = [],
  activeSocietyId = "s1",
  setActiveSocietyId,
  onSwitchPortal,
  onLogout,
  currentUser,
  onViewDetails,
  onToggleMobileMenu
}: SuperAdminHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [showAiConsole, setShowAiConsole] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Digital clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    // initial value
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulated AI Engine
  const handleAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");

    setTimeout(() => {
      const q = aiPrompt.toLowerCase();
      let reply = "I am the GateKaru Master Controller AI. ";
      if (q.includes("billing") || q.includes("revenue")) {
        reply += "Platform billing metrics indicate Greenwood Heights has renewed, while Silver Maple Heights is pending initial verification deposit. Projected Monthly Run Rate is ₹51,500.";
      } else if (q.includes("status") || q.includes("health") || q.includes("server")) {
        reply += "All server nodes are fully functional. API gateway response latency is 14ms (asia-southeast1 Region). Database disk space is at 44.2%. CDN caches are cleared.";
      } else if (q.includes("security") || q.includes("audit") || q.includes("sos")) {
        reply += "Security partition is green. Standard two-factor checks are enforced on all 5 active client admin dashboards. No active SOS alerts.";
      } else {
        reply += "Telemetry is operational. I am tracking 5 enrolled societies, 865 apartments, and 2,309 registered resident logins. Let me know if you want to dispatch bulk reminders or provision new society pods!";
      }
      setAiResponse(reply);
      setIsAiLoading(false);
    }, 1000);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearchQuery) {
      onSearchQuery(val);
    }
  };

  const selectedSociety = societies.find(s => s.id === activeSocietyId) || societies[0];

  return (
    <header id="super-admin-header" className="h-16 bg-[#0a0f24] border-b border-[#1e295d] px-3 md:px-6 flex items-center justify-between shrink-0 select-none text-slate-200 z-30 sticky top-0 backdrop-blur-md bg-opacity-95">
      
      {/* LEFT: Mobile Menu Toggle, Active Society Switcher & Global Search */}
      <div className="flex items-center gap-2 md:gap-6 flex-1 max-w-2xl">
        
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#11193d] border border-[#23357a] text-indigo-300 hover:text-white transition cursor-pointer shrink-0"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Active Society & Switcher */}
        <div className="flex items-center gap-2 bg-[#10173a]/75 border border-[#1e2b60] rounded-xl px-2.5 py-1.5 shrink-0 max-w-[170px] sm:max-w-none">
          <div className="relative flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider hidden sm:inline">Node:</span>
          </div>
          <select 
            value={activeSocietyId}
            onChange={(e) => {
              if (setActiveSocietyId) {
                setActiveSocietyId(e.target.value);
                const name = societies.find(s => s.id === e.target.value)?.name || "";
                alert(`🌐 Switched SaaS database partition to: ${name}. Live telemetry stream established.`);
              }
            }}
            className="bg-transparent border-none text-xs font-black text-indigo-300 focus:outline-none cursor-pointer pr-1 py-0.5 truncate"
            title="Switch Society Node Context"
          >
            {societies.map((soc) => (
              <option key={soc.id} value={soc.id} className="bg-[#0f172a] text-slate-200">
                {soc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-xs xl:max-w-md hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search societies, logs, microservices, variables..."
            className="w-full bg-[#11193d]/80 border border-[#23357a] rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
          />

          {searchValue && (
            (() => {
              const matchingSocieties = societies.filter(s => 
                s.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                (s.address && s.address.toLowerCase().includes(searchValue.toLowerCase()))
              );
              const matchingResidents = residents.filter(r => 
                r.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                r.flat.toLowerCase().includes(searchValue.toLowerCase())
              );
              const matchingVisitors = visitors.filter(v => 
                v.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                (v.plate && v.plate.toLowerCase().includes(searchValue.toLowerCase()))
              );

              if (matchingSocieties.length === 0 && matchingResidents.length === 0 && matchingVisitors.length === 0) {
                return (
                  <div className="absolute left-0 right-0 mt-2 bg-[#0d1435] border border-[#203274] rounded-xl shadow-2xl p-4 z-50 text-center text-xs text-slate-400 font-medium">
                    No results found for "{searchValue}"
                  </div>
                );
              }

              return (
                <div className="absolute left-0 right-0 mt-2 bg-[#0d1435] border border-[#203274] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto p-2 space-y-3 custom-scrollbar text-xs">
                  {matchingSocieties.length > 0 && (
                    <div>
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase px-2 py-1 border-b border-[#203274]/40 tracking-wider">Societies ({matchingSocieties.length})</div>
                      <div className="space-y-1 mt-1">
                        {matchingSocieties.map(soc => (
                          <div 
                            key={soc.id} 
                            onClick={() => {
                              if (onViewDetails) onViewDetails("society", soc);
                              setSearchValue("");
                            }}
                            className="p-2 hover:bg-indigo-950/50 rounded-lg cursor-pointer transition flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-white text-[11px]">{soc.name}</p>
                              <p className="text-[10px] text-slate-400">{soc.address}</p>
                            </div>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{soc.plan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingResidents.length > 0 && (
                    <div>
                      <div className="text-[10px] text-purple-400 font-extrabold uppercase px-2 py-1 border-b border-[#203274]/40 tracking-wider">Residents ({matchingResidents.length})</div>
                      <div className="space-y-1 mt-1">
                        {matchingResidents.map(res => (
                          <div 
                            key={res.id} 
                            onClick={() => {
                              if (onViewDetails) onViewDetails("resident", res);
                              setSearchValue("");
                            }}
                            className="p-2 hover:bg-purple-950/50 rounded-lg cursor-pointer transition flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-white text-[11px]">{res.name}</p>
                              <p className="text-[10px] text-slate-400">Flat: {res.flat} • {res.phone}</p>
                            </div>
                            <span className="text-[9px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{res.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingVisitors.length > 0 && (
                    <div>
                      <div className="text-[10px] text-emerald-400 font-extrabold uppercase px-2 py-1 border-b border-[#203274]/40 tracking-wider">Visitors ({matchingVisitors.length})</div>
                      <div className="space-y-1 mt-1">
                        {matchingVisitors.map(vis => (
                          <div 
                            key={vis.id} 
                            onClick={() => {
                              if (onViewDetails) onViewDetails("visitor", vis);
                              setSearchValue("");
                            }}
                            className="p-2 hover:bg-emerald-950/50 rounded-lg cursor-pointer transition flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-white text-[11px]">{vis.name}</p>
                              <p className="text-[10px] text-slate-400">Plate: {vis.plate} • Type: {vis.type}</p>
                            </div>
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{vis.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* CENTER: Real-time Telemetry Indicators & Time */}
      <div className="hidden xl:flex items-center gap-4 text-[10.5px] font-mono mx-4 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#101b44]/80 px-2.5 py-1 rounded-lg border border-[#1e2d63]">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-slate-400">CPU:</span>
          <span className="text-emerald-400 font-bold">14.2%</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#101b44]/80 px-2.5 py-1 rounded-lg border border-[#1e2d63]">
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">DB Sync:</span>
          <span className="text-emerald-400 font-bold">100% OK</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#101b44]/80 px-3 py-1 rounded-lg border border-[#1e2d63] text-indigo-300 font-extrabold shadow shadow-slate-950/20">
          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>{currentTime || "00:00:00"}</span>
        </div>
      </div>

      {/* RIGHT: Language, Date Picker, Quick AI, Notifications, User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Language Selector */}
        <div className="bg-[#11193d] border border-[#23357a] text-slate-300 px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <select 
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none font-bold cursor-pointer"
          >
            <option value="EN" className="bg-[#0f172a] text-slate-200">EN (English)</option>
            <option value="HI" className="bg-[#0f172a] text-slate-200">HI (Hindi)</option>
            <option value="MH" className="bg-[#0f172a] text-slate-200">MH (Marathi)</option>
            <option value="KA" className="bg-[#0f172a] text-slate-200">KA (Kannada)</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#171e3d] border border-[#2d3f82] px-2.5 py-1 rounded-xl shrink-0">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <input 
            type="date" 
            value={simulatedDate}
            onChange={(e) => onUpdateSimulatedDate(e.target.value)}
            className="bg-transparent text-indigo-300 font-bold text-[10.5px] border-none focus:outline-none cursor-pointer w-[95px] font-mono"
            title="Adjust Simulated Date"
          />
        </div>

        {/* AI Quick Assistant */}
        <button 
          onClick={() => setShowAiConsole(!showAiConsole)}
          className={`p-2 rounded-xl border transition flex items-center justify-center relative shrink-0 ${
            showAiConsole 
              ? "bg-indigo-600 border-indigo-400 text-white shadow shadow-indigo-600/35" 
              : "bg-[#11193d]/80 border-[#23357a] text-indigo-400 hover:text-white"
          }`}
          title="GateKaru AI Terminal"
        >
          <Sparkles className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative shrink-0" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 bg-[#11193d]/80 border border-[#23357a] hover:bg-[#1a2558] hover:text-white rounded-xl text-slate-400 transition flex items-center justify-center relative"
            title="System alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-purple-500"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-[#0d1435] border border-[#203274] rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-[#23357a] pb-2 mb-2">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider">System Event Bus</span>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black">3 Alerts</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <div className="p-2 bg-indigo-950/40 rounded-lg border border-indigo-900/30 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">🔔</span>
                  <div>
                    <p className="font-bold text-slate-200 text-[11px]">New Tenant Onboarded</p>
                    <p className="text-[9.5px] text-slate-400">Silver Maple Heights successfully provisioned.</p>
                  </div>
                </div>
                <div className="p-2 bg-red-950/40 rounded-lg border border-red-900/30 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">⚠️</span>
                  <div>
                    <p className="font-bold text-slate-200 text-[11px]">Saraswati Gardens Expired</p>
                    <p className="text-[9.5px] text-slate-400">Subscription elapsed. Auto-notification triggered.</p>
                  </div>
                </div>
                <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/30 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">☁️</span>
                  <div>
                    <p className="font-bold text-slate-200 text-[11px]">GCP Auto-Backup OK</p>
                    <p className="text-[9.5px] text-slate-400">Database snapshot successfully archived.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Switcher */}
        <div className="relative shrink-0" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 bg-[#121c45] hover:bg-[#1a275c] border border-[#23377f] rounded-xl px-2.5 py-1 transition focus:outline-none shadow shadow-slate-950/20 cursor-pointer"
          >
            <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white">
              JD
            </div>
            <span className="text-xs font-bold text-slate-200 hidden sm:block truncate max-w-[80px]">JobsKaru</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-[#0d1435] border border-[#203274] rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn text-xs text-slate-300">
              <div className="px-3.5 py-2 border-b border-[#203274]">
                <p className="font-black text-white">JobsKaru Developer</p>
                <p className="text-[10px] text-slate-500 font-mono">dev@jobskaru.com</p>
              </div>
              
              <div className="p-1.5 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-indigo-400/80 px-2 block mt-1 mb-1">
                  Active Demographics
                </span>
                
                <div className="px-2.5 py-1.5 bg-[#10183b] rounded-lg border border-[#1e2a5d] mb-2 text-left">
                  <p className="font-bold text-slate-200 text-[10.5px] truncate">{selectedSociety?.name || "Greenwood Heights"}</p>
                  <p className="text-[9px] text-slate-400">{selectedSociety?.flatsCount || 120} Apartments</p>
                </div>

                <span className="text-[9px] font-black uppercase text-indigo-400/80 px-2 block mb-1">
                  Portal Switcher
                </span>
                
                <button 
                  onClick={() => {
                    if (onSwitchPortal) onSwitchPortal("resident");
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-indigo-600/20 transition flex items-center gap-2"
                >
                  <span>🏡</span> Resident Portal
                </button>
                <button 
                  onClick={() => {
                    if (onSwitchPortal) onSwitchPortal("admin");
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-indigo-600/20 transition flex items-center gap-2"
                >
                  <span>📊</span> Committee ERP Panel
                </button>
                <button 
                  onClick={() => {
                    if (onSwitchPortal) onSwitchPortal("guard");
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-indigo-600/20 transition flex items-center gap-2"
                >
                  <span>🛡️</span> Guard Patrol Terminal
                </button>
              </div>

              <div className="border-t border-[#203274] my-1"></div>
              
              <div className="p-1">
                <button 
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg font-black text-rose-400 hover:text-white hover:bg-rose-600/20 transition flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* AI Assistant Console Dropdown */}
      {showAiConsole && (
        <div className="fixed top-18 right-6 w-[450px] bg-[#0c1334]/95 border border-[#223577] rounded-2xl shadow-2xl p-5 z-50 backdrop-blur-md animate-slideIn">
          <div className="flex items-center justify-between border-b border-[#21326d] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">GateKaru Master AI Engine</h4>
            </div>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">JobsKaru Cognitive Suite</span>
          </div>

          <form onSubmit={handleAiQuery} className="space-y-3">
            <div className="flex gap-2">
              <input 
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI: 'how is server health?', 'revenue summary', etc..."
                className="flex-1 bg-[#121c46] border border-[#223471] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1 uppercase"
              >
                Send
              </button>
            </div>
          </form>

          {isAiLoading && (
            <div className="mt-4 py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Querying JobsKaru master neural models...</span>
            </div>
          )}

          {aiResponse && !isAiLoading && (
            <div className="mt-4 bg-[#0a102b]/90 border border-[#1f3069] rounded-xl p-3.5 space-y-2 text-xs text-slate-300 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-indigo-400">Response</span>
                <span className="text-[8px] text-slate-500 font-mono">14ms latency</span>
              </div>
              <p className="leading-relaxed font-semibold text-slate-200">{aiResponse}</p>
              <div className="pt-2 border-t border-indigo-900/40 text-[9px] text-slate-400 flex items-center justify-between">
                <span>Model: Gemini 3.5 Flash Dev Partition</span>
                <span>Accuracy: 99.8% Grounded</span>
              </div>
            </div>
          )}
        </div>
      )}

    </header>
  );
}
