import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Home, 
  UserCheck, 
  Truck, 
  Wrench, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Layers,
  Sparkles
} from "lucide-react";

// Map string icons to Lucide components
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Briefcase,
  Home,
  UserCheck,
  Truck,
  Wrench
};

// Color mapping for different categories
const ColorMap: { [key: string]: { bg: string; text: string; border: string; accent: string } } = {
  Recruitment: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    accent: "group-hover:border-blue-500/40"
  },
  "Society ERP": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    accent: "group-hover:border-emerald-500/40"
  },
  "Domestic Help": {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/20",
    accent: "group-hover:border-pink-500/40"
  },
  Logistics: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    accent: "group-hover:border-amber-500/40"
  },
  "Home Services": {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    accent: "group-hover:border-indigo-500/40"
  }
};

interface JobskaruApp {
  id: string;
  name: string;
  tagline: string;
  url: string;
  category: string;
  icon: string;
}

export default function ApplicationList() {
  const [apps, setApps] = useState<JobskaruApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchApplications = async (showRefreshGlow = false) => {
    if (showRefreshGlow) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/jobskaru-applications");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApps(data);
    } catch (err: any) {
      console.error("Error fetching Jobskaru applications:", err);
      setError("Failed to sync applications list. Please check your internet connection.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div id="jobskaru-apps-hub" className="bg-[#0b1029] border border-[#1e2a5e] rounded-2xl p-5 shadow-xl relative overflow-hidden text-slate-300">
      {/* Visual background gradient accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center pb-3.5 border-b border-[#213374] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
            <Layers className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>JobsKaru Ecosystem Hub</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
              Pune Smart Local Utilities Network
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchApplications(true)}
          disabled={loading || isRefreshing}
          className="w-7 h-7 rounded-lg bg-slate-900 border border-[#1e2a5e] hover:border-indigo-500/50 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Refresh Applications List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synchronizing Eco-Systems...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-40">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 animate-pulse h-24"></div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 flex gap-3 items-start my-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-black text-rose-400 text-xs uppercase tracking-wider">Sync Disrupted</h5>
            <p className="text-[10px] text-slate-400 mt-1">{error}</p>
            <button
              type="button"
              onClick={() => fetchApplications()}
              className="mt-2.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition active:scale-95 cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        </div>
      )}

      {/* Apps Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {apps.map((app) => {
            const IconComp = IconMap[app.icon] || Layers;
            const colors = ColorMap[app.category] || {
              bg: "bg-slate-500/10",
              text: "text-slate-400",
              border: "border-slate-500/20",
              accent: "group-hover:border-slate-500/40"
            };

            return (
              <a
                key={app.id}
                href={app.url === "#" ? undefined : app.url}
                target={app.url === "#" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`group p-4 rounded-xl border bg-slate-950/20 border-[#1e2a5e] transition-all duration-300 flex flex-col justify-between h-[120px] ${
                  app.url === "#" 
                    ? "opacity-95 cursor-default" 
                    : "hover:bg-indigo-950/10 " + colors.accent + " cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {app.category}
                    </span>
                    {app.url !== "#" && (
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2.5 mt-2.5">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-white text-[11px] group-hover:text-indigo-400 transition-colors leading-tight">
                        {app.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {app.tagline}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Footer support prompt */}
      <div className="mt-4 pt-3.5 border-t border-[#1e2a5e] flex flex-wrap justify-between items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
        <span>Part of JobsKaru Pune City Smart ERP Infrastructure</span>
        <span className="text-indigo-400 font-bold">Verified Digital Services</span>
      </div>
    </div>
  );
}
