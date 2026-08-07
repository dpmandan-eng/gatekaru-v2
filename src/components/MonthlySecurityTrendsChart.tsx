import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import {
  ShieldAlert,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Siren,
  Download
} from "lucide-react";

// Monthly Security & Footfall Data Model
export interface MonthlySecurityData {
  month: string;
  shortMonth: string;
  visitorInflux: number;
  guests: number;
  deliveries: number;
  cabsAndVendors: number;
  emergencyAlerts: number;
  sosAlerts: number;
  unauthorizedEntries: number;
  perimeterBreaches: number;
  avgResponseSec: number;
  resolutionRatePct: number;
}

// 12-Month Comprehensive Security & Visitor Influx Dataset
const FULL_YEAR_SECURITY_DATA: MonthlySecurityData[] = [
  {
    month: "January 2026",
    shortMonth: "Jan",
    visitorInflux: 3420,
    guests: 1120,
    deliveries: 1850,
    cabsAndVendors: 450,
    emergencyAlerts: 14,
    sosAlerts: 6,
    unauthorizedEntries: 5,
    perimeterBreaches: 3,
    avgResponseSec: 110,
    resolutionRatePct: 98.2
  },
  {
    month: "February 2026",
    shortMonth: "Feb",
    visitorInflux: 3180,
    guests: 980,
    deliveries: 1720,
    cabsAndVendors: 480,
    emergencyAlerts: 11,
    sosAlerts: 4,
    unauthorizedEntries: 5,
    perimeterBreaches: 2,
    avgResponseSec: 95,
    resolutionRatePct: 99.0
  },
  {
    month: "March 2026",
    shortMonth: "Mar",
    visitorInflux: 3650,
    guests: 1250,
    deliveries: 1910,
    cabsAndVendors: 490,
    emergencyAlerts: 18,
    sosAlerts: 8,
    unauthorizedEntries: 7,
    perimeterBreaches: 3,
    avgResponseSec: 120,
    resolutionRatePct: 97.5
  },
  {
    month: "April 2026",
    shortMonth: "Apr",
    visitorInflux: 3900,
    guests: 1380,
    deliveries: 2010,
    cabsAndVendors: 510,
    emergencyAlerts: 15,
    sosAlerts: 5,
    unauthorizedEntries: 8,
    perimeterBreaches: 2,
    avgResponseSec: 105,
    resolutionRatePct: 98.7
  },
  {
    month: "May 2026",
    shortMonth: "May",
    visitorInflux: 4250,
    guests: 1620,
    deliveries: 2100,
    cabsAndVendors: 530,
    emergencyAlerts: 22,
    sosAlerts: 10,
    unauthorizedEntries: 9,
    perimeterBreaches: 3,
    avgResponseSec: 130,
    resolutionRatePct: 96.8
  },
  {
    month: "June 2026",
    shortMonth: "Jun",
    visitorInflux: 3820,
    guests: 1310,
    deliveries: 1980,
    cabsAndVendors: 530,
    emergencyAlerts: 16,
    sosAlerts: 7,
    unauthorizedEntries: 6,
    perimeterBreaches: 3,
    avgResponseSec: 108,
    resolutionRatePct: 98.4
  },
  {
    month: "July 2026",
    shortMonth: "Jul",
    visitorInflux: 4100,
    guests: 1450,
    deliveries: 2120,
    cabsAndVendors: 530,
    emergencyAlerts: 19,
    sosAlerts: 9,
    unauthorizedEntries: 7,
    perimeterBreaches: 3,
    avgResponseSec: 115,
    resolutionRatePct: 97.9
  },
  {
    month: "August 2026",
    shortMonth: "Aug",
    visitorInflux: 4890,
    guests: 2050,
    deliveries: 2240,
    cabsAndVendors: 600,
    emergencyAlerts: 28,
    sosAlerts: 14,
    unauthorizedEntries: 10,
    perimeterBreaches: 4,
    avgResponseSec: 142,
    resolutionRatePct: 96.2
  },
  {
    month: "September 2026",
    shortMonth: "Sep",
    visitorInflux: 4520,
    guests: 1820,
    deliveries: 2150,
    cabsAndVendors: 550,
    emergencyAlerts: 21,
    sosAlerts: 9,
    unauthorizedEntries: 8,
    perimeterBreaches: 4,
    avgResponseSec: 118,
    resolutionRatePct: 98.1
  },
  {
    month: "October 2026",
    shortMonth: "Oct",
    visitorInflux: 5640,
    guests: 2650,
    deliveries: 2380,
    cabsAndVendors: 610,
    emergencyAlerts: 34,
    sosAlerts: 18,
    unauthorizedEntries: 11,
    perimeterBreaches: 5,
    avgResponseSec: 155,
    resolutionRatePct: 95.8
  },
  {
    month: "November 2026",
    shortMonth: "Nov",
    visitorInflux: 5120,
    guests: 2210,
    deliveries: 2310,
    cabsAndVendors: 600,
    emergencyAlerts: 25,
    sosAlerts: 11,
    unauthorizedEntries: 9,
    perimeterBreaches: 5,
    avgResponseSec: 125,
    resolutionRatePct: 97.6
  },
  {
    month: "December 2026",
    shortMonth: "Dec",
    visitorInflux: 5890,
    guests: 2820,
    deliveries: 2420,
    cabsAndVendors: 650,
    emergencyAlerts: 31,
    sosAlerts: 16,
    unauthorizedEntries: 11,
    perimeterBreaches: 4,
    avgResponseSec: 138,
    resolutionRatePct: 97.1
  }
];

interface MonthlySecurityTrendsChartProps {
  darkMode?: boolean;
}

export default function MonthlySecurityTrendsChart({ darkMode = true }: MonthlySecurityTrendsChartProps) {
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "ytd">("12m");
  const [metricView, setMetricView] = useState<"all" | "visitors" | "alerts">("all");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Filter dataset based on selected time range
  const filteredData = useMemo(() => {
    if (timeRange === "6m") {
      return FULL_YEAR_SECURITY_DATA.slice(6);
    }
    if (timeRange === "ytd") {
      return FULL_YEAR_SECURITY_DATA.slice(0, 8); // Jan to Aug YTD
    }
    return FULL_YEAR_SECURITY_DATA;
  }, [timeRange]);

  // Aggregated KPIs
  const totalVisitors = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.visitorInflux, 0),
    [filteredData]
  );
  const totalAlerts = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.emergencyAlerts, 0),
    [filteredData]
  );
  const totalSos = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.sosAlerts, 0),
    [filteredData]
  );
  const avgResponseTimeSec = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, item) => sum + item.avgResponseSec, 0);
    return Math.round(total / filteredData.length);
  }, [filteredData]);

  const avgResolutionRate = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, item) => sum + item.resolutionRatePct, 0);
    return (total / filteredData.length).toFixed(1);
  }, [filteredData]);

  // Peak month determination
  const peakVisitorItem = useMemo(() => {
    return [...filteredData].sort((a, b) => b.visitorInflux - a.visitorInflux)[0];
  }, [filteredData]);

  const peakAlertItem = useMemo(() => {
    return [...filteredData].sort((a, b) => b.emergencyAlerts - a.emergencyAlerts)[0];
  }, [filteredData]);

  // Styling Variables
  const cardBg = darkMode
    ? "bg-[#0b1029]/90 border border-[#1e2a5e] text-white shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-md";

  const subTextColor = darkMode ? "text-slate-400" : "text-slate-500";
  const pillBg = darkMode ? "bg-[#070b1a] border-[#1f2e63]" : "bg-slate-100 border-slate-200";

  // Recharts Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlySecurityData = payload[0].payload;
      return (
        <div
          className={`p-4 rounded-xl border shadow-2xl space-y-3 font-sans text-xs ${
            darkMode
              ? "bg-[#060a18] border-indigo-500/40 text-white"
              : "bg-white border-slate-300 text-slate-900 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="font-extrabold text-sm text-indigo-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" /> {data.month}
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {data.resolutionRatePct}% Resolved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Visitor Footfall breakdown */}
            <div className="space-y-1.5 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <span className="text-[10px] font-extrabold text-indigo-300 uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" /> Visitor Footfall
              </span>
              <p className="text-base font-black font-mono text-indigo-300">
                {data.visitorInflux.toLocaleString()}
              </p>
              <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-indigo-500/20">
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <strong className="text-slate-200 font-mono">{data.guests}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Deliveries:</span>
                  <strong className="text-slate-200 font-mono">{data.deliveries}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cabs & Vendors:</span>
                  <strong className="text-slate-200 font-mono">{data.cabsAndVendors}</strong>
                </div>
              </div>
            </div>

            {/* Emergency Alerts breakdown */}
            <div className="space-y-1.5 p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <span className="text-[10px] font-extrabold text-rose-300 uppercase flex items-center gap-1">
                <Siren className="w-3 h-3 text-rose-400 animate-pulse" /> Emergency Alerts
              </span>
              <p className="text-base font-black font-mono text-rose-400">
                {data.emergencyAlerts} Incidents
              </p>
              <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-rose-500/20">
                <div className="flex justify-between">
                  <span>SOS Panic:</span>
                  <strong className="text-rose-300 font-mono">{data.sosAlerts}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Unauthorized:</span>
                  <strong className="text-amber-300 font-mono">{data.unauthorizedEntries}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Perimeter Breaches:</span>
                  <strong className="text-red-300 font-mono">{data.perimeterBreaches}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-1 text-[10px] flex justify-between items-center text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" /> Avg Response Speed:
            </span>
            <strong className="text-emerald-400 font-mono">{data.avgResponseSec} sec</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${cardBg} rounded-2xl p-5 space-y-5 transition-all select-none`}>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#1d2a5a] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/30">
              <Siren className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              Security Operations Intelligence & Safety Monitor
            </span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            Monthly Security Trends & Emergency Alert Influx
          </h2>
          <p className="text-xs text-slate-400">
            Multi-layered longitudinal correlation between total community footfall and emergency security triggers.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Time Range Selector */}
          <div className={`flex p-1 rounded-xl border ${pillBg} text-[10px] font-black uppercase`}>
            {(["6m", "12m", "ytd"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range === "6m" ? "Last 6 Months" : range === "12m" ? "12 Months" : "YTD 2026"}
              </button>
            ))}
          </div>

          {/* Metric Filter */}
          <div className={`flex p-1 rounded-xl border ${pillBg} text-[10px] font-black uppercase`}>
            {(["all", "visitors", "alerts"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setMetricView(view)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  metricView === view
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {view === "all" ? "Combined" : view === "visitors" ? "Visitors" : "Alerts"}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <button
            type="button"
            onClick={() => setChartType(prev => (prev === "area" ? "bar" : "area"))}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              darkMode
                ? "bg-[#11193c] border-[#20326d] text-indigo-300 hover:bg-[#182554]"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
            title="Toggle Area/Bar Chart Style"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-black">{chartType === "area" ? "Area" : "Bar"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#070b1a] border border-[#182552] p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Visitor Footfall
            </span>
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center">
              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-lg font-black text-white font-mono">{totalVisitors.toLocaleString()}</p>
          <p className="text-[9.5px] text-slate-500 truncate">
            Peak: <strong className="text-indigo-300">{peakVisitorItem?.shortMonth}</strong> ({peakVisitorItem?.visitorInflux.toLocaleString()})
          </p>
        </div>

        <div className="bg-[#070b1a] border border-[#182552] p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Security Triggers
            </span>
            <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono">
              {totalSos} SOS
            </span>
          </div>
          <p className="text-lg font-black text-rose-400 font-mono">{totalAlerts} Incidents</p>
          <p className="text-[9.5px] text-slate-500 truncate">
            Peak: <strong className="text-rose-300">{peakAlertItem?.shortMonth}</strong> ({peakAlertItem?.emergencyAlerts} alerts)
          </p>
        </div>

        <div className="bg-[#070b1a] border border-[#182552] p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Response
            </span>
            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Fast Dispatch
            </span>
          </div>
          <p className="text-lg font-black text-amber-300 font-mono">{avgResponseTimeSec} Seconds</p>
          <p className="text-[9.5px] text-slate-500">Security guard patrol response</p>
        </div>

        <div className="bg-[#070b1a] border border-[#182552] p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resolution Rate
            </span>
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              High Safety
            </span>
          </div>
          <p className="text-lg font-black text-emerald-400 font-mono">{avgResolutionRate}%</p>
          <p className="text-[9.5px] text-slate-500">Resolved without escalation</p>
        </div>
      </div>

      {/* Main Recharts Composed Chart Plot */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} vertical={false} />

            <XAxis
              dataKey="shortMonth"
              stroke={darkMode ? "#64748b" : "#94a3b8"}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={6}
              fontFamily="inherit"
              fontWeight="bold"
            />

            {/* Left Y-Axis for Visitor Influx */}
            {(metricView === "all" || metricView === "visitors") && (
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#818cf8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight="bold"
                tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(1) + "k" : val}`}
              />
            )}

            {/* Right Y-Axis for Emergency Alerts */}
            {(metricView === "all" || metricView === "alerts") && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f43f5e"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="inherit"
                fontWeight="bold"
                dx={2}
              />
            )}

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: darkMode ? "#334155" : "#cbd5e1", strokeWidth: 1.5 }} />

            <Legend
              verticalAlign="bottom"
              height={32}
              iconSize={8}
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                paddingTop: "12px",
                fontFamily: "inherit"
              }}
            />

            {/* Visitor Influx Series (Left Y-Axis) */}
            {(metricView === "all" || metricView === "visitors") &&
              (chartType === "area" ? (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="visitorInflux"
                  name="Monthly Visitor Influx (आगमन)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#visitorGradient)"
                />
              ) : (
                <Bar
                  yAxisId="left"
                  dataKey="visitorInflux"
                  name="Monthly Visitor Influx (आगमन)"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              ))}

            {/* Emergency Alerts Series (Right Y-Axis) */}
            {(metricView === "all" || metricView === "alerts") && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="emergencyAlerts"
                name="Emergency Security Alerts (आपातकालीन अलर्ट)"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#060a18" }}
                activeDot={{ r: 7, fill: "#fb7185", stroke: "#ffffff", strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Security Insights Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#070b1a] border border-[#182552] rounded-xl text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-snug">
            <strong>Predictive Correlation Analysis:</strong> Emergency alert surges align directly with high festival season visitor spikes (October & December). Swat security patrols are automatically scheduled to scale 30% higher during these months.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const jsonStr = JSON.stringify(filteredData, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `monthly_security_trends_${timeRange}.json`;
            a.click();
          }}
          className="bg-[#131d45] hover:bg-[#1c2c66] text-indigo-200 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#283b82] transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Download className="w-3 h-3 text-indigo-400" /> Export Security Audit Data
        </button>
      </div>
    </div>
  );
}
