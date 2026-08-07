import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  ComposedChart,
  Line
} from "recharts";
import { 
  Clock, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  Activity, 
  Info 
} from "lucide-react";

// Interactive datasets for different days
const hourlyDataToday = [
  { time: "12 AM", entries: 4, exits: 2, deliveries: 1 },
  { time: "2 AM", entries: 1, exits: 1, deliveries: 0 },
  { time: "4 AM", entries: 2, exits: 3, deliveries: 0 },
  { time: "6 AM", entries: 18, exits: 12, deliveries: 5 },
  { time: "8 AM", entries: 55, exits: 48, deliveries: 12 },
  { time: "10 AM", entries: 32, exits: 35, deliveries: 22 },
  { time: "12 PM", entries: 28, exits: 20, deliveries: 35 },
  { time: "2 PM", entries: 45, exits: 40, deliveries: 41 },
  { time: "4 PM", entries: 30, exits: 25, deliveries: 18 },
  { time: "6 PM", entries: 65, exits: 58, deliveries: 29 },
  { time: "8 PM", entries: 48, exits: 52, deliveries: 38 },
  { time: "10 PM", entries: 15, exits: 22, deliveries: 10 }
];

const hourlyDataYesterday = [
  { time: "12 AM", entries: 6, exits: 3, deliveries: 2 },
  { time: "2 AM", entries: 2, exits: 1, deliveries: 0 },
  { time: "4 AM", entries: 1, exits: 4, deliveries: 1 },
  { time: "6 AM", entries: 15, exits: 10, deliveries: 4 },
  { time: "8 AM", entries: 50, exits: 45, deliveries: 10 },
  { time: "10 AM", entries: 35, exits: 38, deliveries: 18 },
  { time: "12 PM", entries: 30, exits: 22, deliveries: 30 },
  { time: "2 PM", entries: 40, exits: 38, deliveries: 35 },
  { time: "4 PM", entries: 28, exits: 26, deliveries: 15 },
  { time: "6 PM", entries: 70, exits: 62, deliveries: 25 },
  { time: "8 PM", entries: 52, exits: 48, deliveries: 32 },
  { time: "10 PM", entries: 18, exits: 20, deliveries: 12 }
];

const hourlyDataWeeklyAvg = [
  { time: "12 AM", entries: 5, exits: 2, deliveries: 1 },
  { time: "2 AM", entries: 1, exits: 1, deliveries: 0 },
  { time: "4 AM", entries: 2, exits: 3, deliveries: 0 },
  { time: "6 AM", entries: 16, exits: 11, deliveries: 4 },
  { time: "8 AM", entries: 52, exits: 46, deliveries: 11 },
  { time: "10 AM", entries: 33, exits: 36, deliveries: 20 },
  { time: "12 PM", entries: 29, exits: 21, deliveries: 32 },
  { time: "2 PM", entries: 43, exits: 39, deliveries: 38 },
  { time: "4 PM", entries: 29, exits: 25, deliveries: 16 },
  { time: "6 PM", entries: 67, exits: 60, deliveries: 27 },
  { time: "8 PM", entries: 50, exits: 50, deliveries: 35 },
  { time: "10 PM", entries: 16, exits: 21, deliveries: 11 }
];

interface GateAnalyticsChartProps {
  darkMode?: boolean;
}

export default function GateAnalyticsChart({ darkMode = false }: GateAnalyticsChartProps) {
  const [dayFilter, setDayFilter] = useState<"today" | "yesterday" | "weekly">("today");
  const [metricFilter, setMetricFilter] = useState<"all" | "entries" | "exits" | "deliveries">("all");

  // Get active dataset
  const activeDataset = dayFilter === "today" 
    ? hourlyDataToday 
    : dayFilter === "yesterday" 
      ? hourlyDataYesterday 
      : hourlyDataWeeklyAvg;

  // Calculate high-level stats for display
  const totalEntries = activeDataset.reduce((sum, item) => sum + item.entries, 0);
  const totalExits = activeDataset.reduce((sum, item) => sum + item.exits, 0);
  const totalDeliveries = activeDataset.reduce((sum, item) => sum + item.deliveries, 0);
  const totalTraffic = totalEntries + totalExits;

  // Find peak hour and peak value
  const peakItem = [...activeDataset].sort((a, b) => (b.entries + b.exits) - (a.entries + a.exits))[0];
  const peakHour = peakItem ? peakItem.time : "6 PM";
  const peakValue = peakItem ? (peakItem.entries + peakItem.exits) : 123;

  // Theme-dependent colors
  const bgCardClass = darkMode 
    ? "bg-slate-900 border border-slate-700/60 text-white" 
    : "bg-white border border-slate-200 text-slate-800";
  const textMutedClass = darkMode ? "text-slate-400" : "text-slate-500";
  const textSubTitleClass = darkMode ? "text-slate-300" : "text-slate-700";
  const gridStrokeColor = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  
  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div id="gatechart-tooltip" className={`p-3.5 rounded-xl border ${
          darkMode 
            ? "bg-slate-950 border-slate-700 text-white shadow-2xl" 
            : "bg-white border-slate-200 text-slate-900 shadow-lg"
        } text-xs space-y-2 font-sans`}>
          <p className="font-extrabold tracking-wide text-[11px] uppercase border-b border-slate-500/20 pb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time Block: {label}
          </p>
          <div className="space-y-1.5 min-w-[120px]">
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                  <span className={`${darkMode ? "text-slate-400" : "text-slate-500"} capitalize font-semibold`}>
                    {p.name === "entries" ? "Entries (आगमन)" : p.name === "exits" ? "Exits (प्रस्थान)" : "Deliveries (पार्सल)"}:
                  </span>
                </div>
                <span className="font-black font-mono text-right">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="gate-analytics-card" className={`${bgCardClass} rounded-2xl p-5 shadow-sm space-y-5 transition-all`}>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-300">
              GATE SECURITY ANALYTICS & PEAK PATTERNS
            </h3>
          </div>
          <h2 className="text-sm font-black uppercase text-slate-800 dark:text-white">
            Daily Gate Peak Hours & Visitor Velocity (द्वार गतिशीलता विश्लेषण)
          </h2>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Day Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-[10px] font-black uppercase">
            {(["today", "yesterday", "weekly"] as const).map((day) => (
              <button
                key={day}
                onClick={() => setDayFilter(day)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  dayFilter === day 
                    ? "bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-white" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {day === "weekly" ? "Weekly Avg" : day}
              </button>
            ))}
          </div>

          {/* Series Filter */}
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value as any)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <option value="all">Combined View</option>
            <option value="entries">Entries Only</option>
            <option value="exits">Exits Only</option>
            <option value="deliveries">Deliveries Only</option>
          </select>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        
        {/* KPI Mini Sidebar */}
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 xl:border-r xl:border-slate-200 xl:dark:border-slate-800 xl:pr-5">
          
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Gate Footfall</span>
                <span className="text-emerald-500 text-[10px] font-black flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> Optimal
                </span>
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1.5 font-mono">
                {(totalEntries + totalExits).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/40 mt-2 text-[9px] font-bold text-slate-400">
              <span className="flex items-center gap-0.5 text-blue-500"><ArrowUpRight className="w-3 h-3" /> {totalEntries} IN</span>
              <span className="flex items-center gap-0.5 text-amber-500"><ArrowDownRight className="w-3 h-3" /> {totalExits} OUT</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Peak Rush Time</span>
                <span className="text-indigo-500 text-[10px] font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-full flex items-center">
                  <Clock className="w-3 h-3 mr-0.5" /> Peak Hour
                </span>
              </div>
              <p className="text-base font-black text-slate-800 dark:text-white mt-1.5">
                {peakHour} Block
              </p>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                Avg. {peakValue} concurrent movements
              </p>
            </div>
          </div>

          <div className="col-span-2 xl:col-span-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-1.5">
              <Package className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">E-Commerce Delivery Velocity</span>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white font-mono">
              {totalDeliveries} Parcels / Day
            </p>
            <p className="text-[9px] text-slate-400 font-semibold leading-normal mt-1">
              Mid-day delivery spikes occur around 12:00 PM and 2:00 PM (Zomato, Swiggy, Amazon).
            </p>
          </div>
        </div>

        {/* Recharts Chart Plot */}
        <div className="xl:col-span-3 w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={activeDataset} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke={darkMode ? "#64748b" : "#94a3b8"} 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                dy={8}
                fontFamily="inherit"
                fontWeight="bold"
              />
              
              <YAxis 
                stroke={darkMode ? "#64748b" : "#94a3b8"} 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                fontFamily="inherit"
                fontWeight="bold"
                dx={-2}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: darkMode ? "#475569" : "#e2e8f0", strokeWidth: 1.5 }} />

              <Legend 
                verticalAlign="bottom" 
                height={32} 
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: "9px", 
                  fontWeight: "bold", 
                  textTransform: "uppercase",
                  paddingTop: "15px",
                  fontFamily: "inherit"
                }} 
              />

              {/* Entries Series (Area / Line) */}
              {(metricFilter === "all" || metricFilter === "entries") && (
                <Area 
                  type="monotone" 
                  dataKey="entries" 
                  name="entries"
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorEntries)" 
                />
              )}

              {/* Exits Series (Area / Line) */}
              {(metricFilter === "all" || metricFilter === "exits") && (
                <Area 
                  type="monotone" 
                  dataKey="exits" 
                  name="exits"
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorExits)" 
                />
              )}

              {/* Deliveries Series (Area or Bar) */}
              {(metricFilter === "all" || metricFilter === "deliveries") && (
                <Area
                  type="monotone" 
                  dataKey="deliveries" 
                  name="deliveries"
                  stroke="#ec4899" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDeliveries)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Insight Footer */}
      <div className="flex items-center gap-2 p-3 bg-indigo-500/5 dark:bg-slate-950/20 border border-indigo-500/10 rounded-xl">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          <strong>Security Intelligence Pattern:</strong> Daily peaks concentrate around school bus drops / office departures (08:00 AM) and online deliveries / home returns (06:00 PM). Additional guards are deployed on double shifts to avoid bottlenecks.
        </p>
      </div>

    </div>
  );
}
