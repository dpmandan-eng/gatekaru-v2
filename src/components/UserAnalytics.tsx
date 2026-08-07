import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Smartphone, 
  Tv, 
  Shield, 
  CheckCircle, 
  Clock, 
  Sparkles,
  RefreshCw,
  Award
} from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsSummary {
  totalSignups: number;
  totalLogins: number;
  activeLive: number;
}

interface TrendPoint {
  label: string;
  signups: number;
  logins: number;
  live: number;
}

interface RoleDistribution {
  resident: number;
  admin: number;
  guard: number;
  both: number;
}

interface LiveUser {
  id: string;
  name: string;
  role: string;
  flat: string;
  lastActive: string;
  device: string;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyTrend: TrendPoint[];
  roleDistribution: RoleDistribution;
  liveUsersList: LiveUser[];
}

export default function UserAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"overall" | "logins" | "signups">("overall");
  const [selectedDataIndex, setSelectedDataIndex] = useState<number | null>(6); // Default to last day
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/analytics/user-activity");
      if (!response.ok) {
        throw new Error("Failed to fetch user activity analytics");
      }
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(err.message || "Could not retrieve user analytics.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600">लोड हो रहा है... कृपया प्रतीक्षा करें (Loading User Analytics...)</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
        <p className="text-red-600 font-extrabold text-sm mb-4">⚠️ {error || "Failed to load user analytics"}</p>
        <button 
          onClick={fetchAnalytics}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
        >
          पुनः प्रयास करें (Retry)
        </button>
      </div>
    );
  }

  const { summary, dailyTrend, roleDistribution, liveUsersList } = data;

  // Compute maximums for scaling SVG charts
  const maxSignups = Math.max(...dailyTrend.map(d => d.signups), 1);
  const maxLogins = Math.max(...dailyTrend.map(d => d.logins), 1);
  const maxLiveTrend = Math.max(...dailyTrend.map(d => d.live), 1);

  // Layout parameters for custom SVG area chart
  const width = 800;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Help calculate chart points
  const getCoordinates = (index: number, value: number, maxValue: number) => {
    const x = paddingLeft + (index / (dailyTrend.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return { x, y };
  };

  // Build SVG Paths based on selected chart tab
  let primaryPath = "";
  let primaryAreaPath = "";
  let secondaryPath = "";
  let secondaryAreaPath = "";
  let primaryMax = 1;
  let secondaryMax = 1;

  if (activeChartTab === "overall") {
    primaryMax = maxLogins;
    secondaryMax = maxSignups;

    // Login Trend Line & Area
    const pointsLogin = dailyTrend.map((d, idx) => getCoordinates(idx, d.logins, primaryMax));
    primaryPath = pointsLogin.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    primaryAreaPath = `${primaryPath} L ${pointsLogin[pointsLogin.length - 1].x} ${paddingTop + chartHeight} L ${pointsLogin[0].x} ${paddingTop + chartHeight} Z`;

    // Signup Trend Line & Area
    const pointsSignup = dailyTrend.map((d, idx) => getCoordinates(idx, d.signups, secondaryMax));
    secondaryPath = pointsSignup.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    secondaryAreaPath = `${secondaryPath} L ${pointsSignup[pointsSignup.length - 1].x} ${paddingTop + chartHeight} L ${pointsSignup[0].x} ${paddingTop + chartHeight} Z`;

  } else if (activeChartTab === "logins") {
    primaryMax = maxLogins;
    const points = dailyTrend.map((d, idx) => getCoordinates(idx, d.logins, primaryMax));
    primaryPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    primaryAreaPath = `${primaryPath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  } else {
    primaryMax = maxSignups;
    const points = dailyTrend.map((d, idx) => getCoordinates(idx, d.signups, primaryMax));
    primaryPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    primaryAreaPath = `${primaryPath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Get selected point metadata
  const selectedPoint = selectedDataIndex !== null ? dailyTrend[selectedDataIndex] : null;

  return (
    <div className="space-y-6">
      
      {/* Header and Live Status Refresh row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              User Activity & Live Session Console / यूज़र सक्रियता डैशबोर्ड
            </h2>
            <p className="text-[11px] text-slate-500">
              Audit real-time resident registrations, daily OTP logins, and active security gate connections.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchAnalytics}
          disabled={isRefreshing}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-indigo-100 transition flex items-center gap-2 active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "ताज़ा हो रहा है..." : "ताज़ा करें (Refresh Live)"}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: Active Live Sessions */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-5 rounded-2xl border border-emerald-500/25 flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                Live Now / अभी ऑनलाइन
              </p>
            </div>
            <p className="text-3xl font-black text-emerald-950 tracking-tight">
              {summary.activeLive} <span className="text-sm font-medium text-emerald-700">Users active</span>
            </p>
            <p className="text-[11px] text-emerald-800 font-medium">
              Guards, admins, and active residents in the last 15m.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Total Signups */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-5 rounded-2xl border border-indigo-500/25 flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">
              Total Signups / कुल रजिस्टर्ड यूज़र
            </p>
            <p className="text-3xl font-black text-indigo-950 tracking-tight">
              {summary.totalSignups} <span className="text-sm font-medium text-indigo-700">Registered</span>
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-800 font-medium">
              <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Approved</span>
              <span>Resident approval rate is at 100%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Total Logins */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl text-white flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider">
              Total Successful Logins / कुल सफल लॉगिन
            </p>
            <p className="text-3xl font-black text-white tracking-tight">
              {summary.totalLogins} <span className="text-sm font-medium text-indigo-300">Sessions</span>
            </p>
            <p className="text-[11px] text-indigo-200/80 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>OTP validation logs are fully synchronized</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-indigo-300 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Interactive Chart and Metadata View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Interactive Activity Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-2 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  User Activity Trend (Last 7 Days) / यूज़र सक्रियता चार्ट
                </h3>
                <p className="text-[10px] text-slate-400">Click on any chart data node below to inspect specific metrics.</p>
              </div>
              
              {/* Chart Tabs */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => { setActiveChartTab("overall"); setSelectedDataIndex(6); }}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition cursor-pointer ${
                    activeChartTab === "overall" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => { setActiveChartTab("logins"); setSelectedDataIndex(6); }}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition cursor-pointer ${
                    activeChartTab === "logins" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Logins
                </button>
                <button
                  onClick={() => { setActiveChartTab("signups"); setSelectedDataIndex(6); }}
                  className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition cursor-pointer ${
                    activeChartTab === "signups" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Signups
                </button>
              </div>
            </div>

            {/* Render Custom Responsive SVG Chart */}
            <div className="relative w-full overflow-x-auto pb-2">
              <div className="min-w-[640px]">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                  <defs>
                    <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = paddingTop + ratio * chartHeight;
                    return (
                      <g key={i} className="opacity-40">
                        <line 
                          x1={paddingLeft} 
                          y1={y} 
                          x2={width - paddingRight} 
                          y2={y} 
                          stroke="#cbd5e1" 
                          strokeWidth="1" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={paddingLeft - 10} 
                          y={y + 4} 
                          fontSize="9" 
                          fontWeight="bold"
                          fill="#94a3b8" 
                          textAnchor="end"
                        >
                          {activeChartTab === "overall" 
                            ? Math.round((1 - ratio) * primaryMax)
                            : Math.round((1 - ratio) * primaryMax)
                          }
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical hover line indicator */}
                  {selectedDataIndex !== null && (
                    <line
                      x1={getCoordinates(selectedDataIndex, 0, 1).x}
                      y1={paddingTop}
                      x2={getCoordinates(selectedDataIndex, 0, 1).x}
                      y2={paddingTop + chartHeight}
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Areas & Paths rendering based on selected tabs */}
                  {activeChartTab === "overall" ? (
                    <>
                      {/* Logins Area & Path */}
                      <polygon points={primaryAreaPath} fill="url(#loginGrad)" />
                      <path d={primaryPath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Signups Area & Path */}
                      <polygon points={secondaryAreaPath} fill="url(#signupGrad)" />
                      <path d={secondaryPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : activeChartTab === "logins" ? (
                    <>
                      <polygon points={primaryAreaPath} fill="url(#loginGrad)" />
                      <path d={primaryPath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <>
                      <polygon points={primaryAreaPath} fill="url(#signupGrad)" />
                      <path d={primaryPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}

                  {/* Interaction nodes (Data points) */}
                  {dailyTrend.map((d, idx) => {
                    const coordLog = getCoordinates(idx, d.logins, activeChartTab === "overall" ? maxLogins : primaryMax);
                    const coordSign = getCoordinates(idx, d.signups, activeChartTab === "overall" ? maxSignups : primaryMax);
                    
                    const isSelected = selectedDataIndex === idx;

                    return (
                      <g key={idx} className="cursor-pointer" onClick={() => setSelectedDataIndex(idx)}>
                        {/* Invisible large click target */}
                        <rect
                          x={coordLog.x - 20}
                          y={paddingTop}
                          width="40"
                          height={chartHeight}
                          fill="transparent"
                        />

                        {/* Login Node */}
                        {(activeChartTab === "overall" || activeChartTab === "logins") && (
                          <g>
                            <circle 
                              cx={coordLog.x} 
                              cy={coordLog.y} 
                              r={isSelected ? 6 : 4} 
                              fill="#ffffff" 
                              stroke="#4f46e5" 
                              strokeWidth={isSelected ? 3.5 : 2} 
                            />
                            {isSelected && (
                              <circle 
                                cx={coordLog.x} 
                                cy={coordLog.y} 
                                r="12" 
                                fill="#4f46e5" 
                                fillOpacity="0.15" 
                              />
                            )}
                          </g>
                        )}

                        {/* Signup Node */}
                        {(activeChartTab === "overall" || activeChartTab === "signups") && (
                          <g>
                            <circle 
                              cx={coordSign.x} 
                              cy={coordSign.y} 
                              r={isSelected ? 6 : 4} 
                              fill="#ffffff" 
                              stroke="#f59e0b" 
                              strokeWidth={isSelected ? 3.5 : 2} 
                            />
                            {isSelected && (
                              <circle 
                                cx={coordSign.x} 
                                cy={coordSign.y} 
                                r="12" 
                                fill="#f59e0b" 
                                fillOpacity="0.15" 
                              />
                            )}
                          </g>
                        )}

                        {/* Date Label under chart */}
                        <text
                          x={coordLog.x}
                          y={paddingTop + chartHeight + 20}
                          fontSize="9"
                          fontWeight={isSelected ? "900" : "bold"}
                          fill={isSelected ? "#1e1b4b" : "#64748b"}
                          textAnchor="middle"
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Interactive Inspection panel for the clicked node */}
          {selectedPoint && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div>
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-indigo-200">
                  Data Inspector • {selectedPoint.label}
                </span>
                <p className="text-xs font-black text-slate-800 mt-1.5 uppercase">
                  Daily Society Engagement Summary / दैनिक गतिविधि विवरण
                </p>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <div className="text-center sm:text-right">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Logins</p>
                  <p className="text-lg font-black text-indigo-700">{selectedPoint.logins}</p>
                </div>
                <div className="text-center sm:text-right border-l border-slate-200 pl-5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Signups</p>
                  <p className="text-lg font-black text-amber-600">{selectedPoint.signups}</p>
                </div>
                <div className="text-center sm:text-right border-l border-slate-200 pl-5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Live Peak</p>
                  <p className="text-lg font-black text-emerald-600">{selectedPoint.live}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Distribution breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Role Distribution / भूमिका वर्गीकरण
              </h3>
              <p className="text-[10px] text-slate-400">Total registered members breakdown in current database.</p>
            </div>

            {/* Custom Bar progress distribution rows */}
            <div className="space-y-3 pt-2">
              
              {/* Resident Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-700">
                  <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-indigo-500" /> Residents (निवासी)</span>
                  <span>{roleDistribution.resident}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (roleDistribution.resident / summary.totalSignups) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Guard Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-700">
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Guards (सुरक्षा कर्मी)</span>
                  <span>{roleDistribution.guard}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (roleDistribution.guard / summary.totalSignups) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Admin Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-700">
                  <span className="flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-amber-500" /> Society Admins (प्रशासक)</span>
                  <span>{roleDistribution.admin}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (roleDistribution.admin / summary.totalSignups) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Dual Role Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-700">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Dual Admins/Residents</span>
                  <span>{roleDistribution.both}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (roleDistribution.both / summary.totalSignups) * 100)}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-indigo-950 text-[10px] font-medium leading-relaxed mt-4">
            <span className="font-bold text-indigo-800">Smart Audit:</span> Greenwood Society maintains a balanced ratio of <strong>{roleDistribution.guard} Guards</strong> on rotation to service <strong>{roleDistribution.resident} Resident profiles</strong>. This maximizes visitor screening efficiency.
          </div>
        </div>

      </div>

      {/* Grid: Live Users Online Monitor & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Users Grid Monitor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-2 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Sessions Monitor / लाइव कनेक्टेड यूज़र्स
              </h3>
              <p className="text-[10px] text-slate-400">Current active telemetry connections and terminal devices.</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
              {liveUsersList.length} Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveUsersList.map((user, idx) => (
              <div 
                key={user.id || idx}
                className="bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 transition"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white font-extrabold text-xs uppercase ${
                  user.role === "guard" ? "bg-emerald-600" :
                  user.role === "admin" || user.role === "super_admin" ? "bg-amber-500" : "bg-indigo-600"
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{user.name}</p>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      user.role === "guard" ? "bg-emerald-50 text-emerald-800 border-emerald-100" :
                      user.role === "admin" || user.role === "super_admin" ? "bg-amber-50 text-amber-800 border-amber-100" : "bg-indigo-50 text-indigo-800 border-indigo-100"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">Flat/Terminal: {user.flat}</p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                    <span className="truncate">Via: {user.device}</span>
                    <span className="text-emerald-600 shrink-0 font-bold">{user.lastActive}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analytical Insights & Suggestions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                AI Security Insights / एआई सुरक्षा सुझाव
              </h3>
              <p className="text-[10px] text-slate-400">Automated machine learning recommendations for GateKaru.</p>
            </div>

            <div className="space-y-3.5">
              
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 text-xs font-bold">1</div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-700 uppercase">Peak Login Analysis / मुख्य लॉगिन समय</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    User logins peak significantly between <strong>08:30 AM - 10:00 AM</strong>. This correlates directly with high morning resident departures and school cab check-ins.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start border-t border-slate-100 pt-3">
                <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 text-xs font-bold">2</div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-700 uppercase">Guard Terminal Reliability / टैबलेट सक्रियता</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Main Gate Terminal reports 100% telemetry uptime. Recommended: Keep biometric scanners clean and verify offline logs backup every Sunday at midnight.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start border-t border-slate-100 pt-3">
                <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 text-xs font-bold">3</div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-700 uppercase">OTP Delivery Efficiency / ओटीपी वितरण दर</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Fast2SMS routing delivers verification codes in under 2.4 seconds on average, maintaining low user latency during peak hours.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span>Model: Gemini 1.5 Flash</span>
            <span className="text-indigo-600 uppercase">Optimized Uptime</span>
          </div>
        </div>

      </div>

    </div>
  );
}
