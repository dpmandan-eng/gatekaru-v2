import React, { useState } from "react";
import { 
  Building, Layers, Users, Shield, BookOpen, Truck, CreditCard, 
  TrendingUp, FileBarChart, Sparkles, Send, Ticket, Lock, Link, 
  Settings, Database, Building2, Car, Wrench, User, ChevronLeft, 
  ChevronRight, LogOut, FileText, Key, X 
} from "lucide-react";

interface SuperAdminSidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  currentUser: { name: string; role: string } | null;
  onLogout: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (val: boolean) => void;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "operations" | "financials" | "governance" | "infrastructure";
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  // Operations & Tenants
  { id: "dashboard", label: "Global Dashboard", icon: Layers, category: "operations" },
  { id: "societies", label: "Society Management", icon: Building, category: "operations" },
  { id: "residents", label: "Residents Directory", icon: Users, category: "operations" },
  { id: "guards", label: "Guards Patrol Console", icon: Shield, category: "operations" },
  { id: "committee", label: "Committee ERP", icon: BookOpen, category: "operations" },
  { id: "visitors", label: "Visitors & Parcels", icon: Truck, category: "operations" },
  { id: "flats_towers", label: "Flats & Towers", icon: Building2, category: "operations" },
  { id: "vehicles", label: "Vehicle Management", icon: Car, category: "operations" },
  { id: "staff_vendors", label: "Staff & Vendors", icon: Wrench, category: "operations" },
  
  // Revenue & Financials
  { id: "billing", label: "Billing & Subscription", icon: CreditCard, category: "financials" },
  { id: "revenue", label: "Revenue Analytics", icon: TrendingUp, category: "financials" },
  { id: "reports", label: "Platform Reports", icon: FileBarChart, category: "financials" },
  
  // Governance & Support
  { id: "ai_control", label: "AI Control Center", icon: Sparkles, category: "governance" },
  { id: "push", label: "Push Notifications", icon: Send, category: "governance" },
  { id: "tickets", label: "Support Tickets", icon: Ticket, category: "governance" },
  { id: "security_center", label: "Security Center", icon: Lock, category: "governance" },
  { id: "audit_logs", label: "System Audit Logs", icon: FileText, category: "governance" },
  
  // Dev & Cloud Infrastructure
  { id: "settings", label: "Platform Settings", icon: Settings, category: "infrastructure" },
  { id: "api", label: "API & Integrations", icon: Link, category: "infrastructure" },
  { id: "backup", label: "Backup & Restore", icon: Database, category: "infrastructure" },
  { id: "developer_profile", label: "Developer Profile", icon: User, category: "infrastructure" },
];

export default function SuperAdminSidebar({ 
  activeSection, 
  setActiveSection, 
  currentUser, 
  onLogout,
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen
}: SuperAdminSidebarProps) {
  
  const [localIsCollapsed, localSetIsCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : localIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed !== undefined ? externalSetIsCollapsed : localSetIsCollapsed;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "operations": return "Core Operations";
      case "financials": return "Revenue & Financials";
      case "governance": return "Governance & Support";
      case "infrastructure": return "Dev & Cloud Infrastructure";
      default: return "";
    }
  };

  const categories: ("operations" | "financials" | "governance" | "infrastructure")[] = [
    "operations",
    "financials",
    "governance",
    "infrastructure"
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
        />
      )}

      <aside 
        id="super-admin-sidebar" 
        className={`
          bg-[#0a0f24] border-r border-[#1e295d] text-slate-300 flex flex-col justify-between shrink-0 h-full overflow-hidden select-none transition-all duration-300 ease-in-out
          fixed inset-y-0 left-0 z-50 ${mobileMenuOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full"}
          md:translate-x-0 md:static ${isCollapsed ? "md:w-[76px]" : "md:w-64"}
        `}
      >
        {/* Brand Section */}
        <div className={`p-4 border-b border-[#1e295d] bg-[#0c1330]/80 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black italic tracking-wider shadow-lg shadow-indigo-500/20 shrink-0">
                GK
              </div>
              <div className="truncate">
                <h1 className="text-xs font-black text-white uppercase tracking-wider leading-none">GateKaru</h1>
                <span className="text-[8px] text-indigo-400 font-extrabold tracking-widest block uppercase mt-1">SaaS Master Panel</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black italic tracking-wider shadow-lg shadow-indigo-500/20 shrink-0 animate-fadeIn">
              GK
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden md:block p-1.5 rounded-lg bg-[#11193d] border border-[#23357a] text-indigo-400 hover:text-white transition shrink-0 ${isCollapsed ? "mt-1" : ""}`}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            {/* Mobile Close Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-[#11193d] border border-[#23357a] text-indigo-300 hover:text-white transition cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
          {categories.map((cat, catIdx) => {
            const items = SIDEBAR_ITEMS.filter(i => i.category === cat);
            return (
              <div key={cat} className="space-y-1">
                {!isCollapsed ? (
                  <span className="text-[9px] font-black text-indigo-400/80 uppercase tracking-widest px-3 block mb-1 truncate">
                    {getCategoryLabel(cat)}
                  </span>
                ) : (
                  catIdx > 0 && <div className="border-t border-[#1e295d]/30 my-2 mx-1" />
                )}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSection(item.id);
                          if (setMobileMenuOpen) setMobileMenuOpen(false);
                        }}
                        title={item.label}
                        className={`w-full text-left px-3 py-2.5 md:py-2 rounded-lg text-xs font-bold transition flex items-center justify-between group ${
                          isActive 
                            ? "bg-gradient-to-r from-indigo-600/35 to-purple-600/25 border-l-2 border-indigo-500 text-white shadow-md shadow-indigo-950/40" 
                            : "hover:bg-slate-900/60 hover:text-white text-slate-400"
                        }`}
                      >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                        {!isCollapsed && <span className="truncate animate-fadeIn">{item.label}</span>}
                      </div>
                      {!isCollapsed && isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-glow animate-pulse shrink-0"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exit Console Action */}
      {currentUser && (
        <div className={`p-3 border-t border-[#1e295d] bg-[#070b1a]/95 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 truncate flex-1 mr-2 animate-fadeIn">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow shadow-indigo-600/20">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate text-slate-100">{currentUser.name}</p>
                <p className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Dev Operator</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className={`text-[9px] text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 rounded-md transition font-black uppercase tracking-wider shrink-0 ${isCollapsed ? "p-2" : "px-2 py-1"}`}
            title="Exit Master Console"
          >
            {isCollapsed ? <LogOut className="w-3.5 h-3.5" /> : "Exit"}
          </button>
        </div>
      )}
    </aside>
  </>
  );
}
