import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  MapPin,
  Siren,
  Radio,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Flame,
  Eye,
  Navigation,
  Info,
  RefreshCw,
  PhoneCall
} from "lucide-react";

export interface SOSLocationZone {
  id: string;
  name: string;
  code: string;
  category: "Residential" | "Amenities" | "Gate" | "Parking" | "Utility";
  gridX: number; // 0-100 percentage layout position
  gridY: number; // 0-100 percentage layout position
  riskLevel: "Critical" | "Moderate" | "Low" | "Safe";
  incidentCount: number;
  lastIncidentTime: string;
  assignedGuards: number;
  cctvCount: number;
  nearestGuardPost: string;
  activeSosAlert?: {
    id: string;
    flat: string;
    type: string;
    resident: string;
    time: string;
  };
}

const INITIAL_SOCIETY_ZONES: SOSLocationZone[] = [
  {
    id: "zone-wing-a",
    name: "Wing A (Tower Alpha - 18 Floors)",
    code: "WING-A",
    category: "Residential",
    gridX: 22,
    gridY: 28,
    riskLevel: "Moderate",
    incidentCount: 5,
    lastIncidentTime: "12 mins ago",
    assignedGuards: 3,
    cctvCount: 16,
    nearestGuardPost: "Post 1 (Main Gate)",
    activeSosAlert: {
      id: "SOS-8821",
      flat: "A-402",
      type: "Medical Panic",
      resident: "Rameshwar Prasad",
      time: "2 mins ago"
    }
  },
  {
    id: "zone-wing-b",
    name: "Wing B (Tower Bravo - 18 Floors)",
    code: "WING-B",
    category: "Residential",
    gridX: 48,
    gridY: 28,
    riskLevel: "Low",
    incidentCount: 2,
    lastIncidentTime: "2 days ago",
    assignedGuards: 2,
    cctvCount: 14,
    nearestGuardPost: "Post 2 (Central Plaza)"
  },
  {
    id: "zone-wing-c",
    name: "Wing C (Tower Charlie - 22 Floors)",
    code: "WING-C",
    category: "Residential",
    gridX: 74,
    gridY: 30,
    riskLevel: "Critical",
    incidentCount: 8,
    lastIncidentTime: "Just now",
    assignedGuards: 4,
    cctvCount: 22,
    nearestGuardPost: "Post 3 (North Tower Lobby)",
    activeSosAlert: {
      id: "SOS-8824",
      flat: "C-1104",
      type: "Fire Siren Trigger",
      resident: "Meenakshi Sundaram",
      time: "1 min ago"
    }
  },
  {
    id: "zone-wing-d",
    name: "Wing D (Tower Delta - 16 Floors)",
    code: "WING-D",
    category: "Residential",
    gridX: 86,
    gridY: 62,
    riskLevel: "Safe",
    incidentCount: 1,
    lastIncidentTime: "1 week ago",
    assignedGuards: 2,
    cctvCount: 12,
    nearestGuardPost: "Post 3 (North Tower Lobby)"
  },
  {
    id: "zone-main-gate",
    name: "Main Gate Entry Terminal 1 & 2",
    code: "GATE-01",
    category: "Gate",
    gridX: 18,
    gridY: 78,
    riskLevel: "Moderate",
    incidentCount: 6,
    lastIncidentTime: "45 mins ago",
    assignedGuards: 6,
    cctvCount: 10,
    nearestGuardPost: "Main Control Room (Gate 1)"
  },
  {
    id: "zone-clubhouse",
    name: "Royal Clubhouse & Swimming Arena",
    code: "CLUB-01",
    category: "Amenities",
    gridX: 52,
    gridY: 68,
    riskLevel: "Safe",
    incidentCount: 0,
    lastIncidentTime: "None recorded",
    assignedGuards: 2,
    cctvCount: 8,
    nearestGuardPost: "Post 2 (Central Plaza)"
  },
  {
    id: "zone-parking-b1",
    name: "Basement B1 Underground Parking",
    code: "PARK-B1",
    category: "Parking",
    gridX: 38,
    gridY: 48,
    riskLevel: "Critical",
    incidentCount: 9,
    lastIncidentTime: "3 hours ago",
    assignedGuards: 3,
    cctvCount: 28,
    nearestGuardPost: "Basement Patrol Unit 1"
  },
  {
    id: "zone-rear-gate",
    name: "Rear Service Gate 2 (Vendor Exit)",
    code: "GATE-02",
    category: "Gate",
    gridX: 80,
    gridY: 82,
    riskLevel: "Low",
    incidentCount: 3,
    lastIncidentTime: "Yesterday",
    assignedGuards: 3,
    cctvCount: 6,
    nearestGuardPost: "Post 4 (Rear Gate)"
  }
];

interface SOSHeatmapProps {
  darkMode?: boolean;
  onDispatchGuard?: (zoneId: string, zoneName: string) => void;
}

export default function SOSHeatmap({ darkMode = true, onDispatchGuard }: SOSHeatmapProps) {
  const [zones, setZones] = useState<SOSLocationZone[]>(INITIAL_SOCIETY_ZONES);
  const [selectedZone, setSelectedZone] = useState<SOSLocationZone>(INITIAL_SOCIETY_ZONES[0]);
  const [filterRisk, setFilterRisk] = useState<"All" | "Critical" | "Active_SOS">("All");
  const [simulatingSOS, setSimulatingSOS] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeAlertsCount = zones.filter(z => z.activeSosAlert).length;

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSimulateSOS = () => {
    setSimulatingSOS(true);
    setTimeout(() => {
      const targetIndex = Math.floor(Math.random() * zones.length);
      const updated = [...zones];
      const target = updated[targetIndex];
      const newAlertId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
      
      target.activeSosAlert = {
        id: newAlertId,
        flat: target.code,
        type: "Simulated SOS Alarm Test",
        resident: "System Automated Beacon",
        time: "Just now"
      };
      target.riskLevel = "Critical";
      target.incidentCount += 1;
      target.lastIncidentTime = "Just now";

      setZones(updated);
      setSelectedZone(target);
      setSimulatingSOS(false);
      showNotification(`🚨 SIMULATED EMERGENCY SOS TRIGGERED IN ${target.name}! Guard dispatched automatically.`);
    }, 1200);
  };

  const handleResolveAlert = (zoneId: string) => {
    setZones(prev =>
      prev.map(z => {
        if (z.id === zoneId) {
          const { activeSosAlert, ...rest } = z;
          return {
            ...rest,
            riskLevel: "Safe" as const
          };
        }
        return z;
      })
    );
    if (selectedZone.id === zoneId) {
      setSelectedZone(prev => {
        const { activeSosAlert, ...rest } = prev;
        return { ...rest, riskLevel: "Safe" as const };
      });
    }
    showNotification("✅ Emergency alert marked as RESOLVED. Security status reset to Safe.");
  };

  // Filtered list of zones
  const displayedZones = zones.filter(z => {
    if (filterRisk === "Critical") return z.riskLevel === "Critical";
    if (filterRisk === "Active_SOS") return !!z.activeSosAlert;
    return true;
  });

  const cardBg = darkMode
    ? "bg-[#0b1029]/90 border border-[#1e2a5e] text-white shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-md";

  return (
    <div className={`${cardBg} rounded-2xl p-5 space-y-6 transition-all select-none relative overflow-hidden`}>
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#1f2e63] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40 animate-pulse">
              <Siren className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
              Live Panic Beacon & Emergency Risk Zones (SOS मैप एवं सुरक्षा ज़ोन)
            </span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            Society SOS Heatmap & Spatial Emergency Visualizer
          </h2>
          <p className="text-xs text-slate-400">
            Real-time geospatial plotting of resident panic triggers, CCTV density, high-risk security blocks, and guard response radii.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active SOS Badge */}
          {activeAlertsCount > 0 && (
            <div className="bg-rose-500/20 text-rose-300 border border-rose-500/50 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 animate-bounce">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>{activeAlertsCount} ACTIVE SOS ALERTS</span>
            </div>
          )}

          {/* Filter Options */}
          <div className="flex p-1 rounded-xl bg-[#070b1a] border border-[#1d2a58] text-[10px] font-black uppercase">
            {(["All", "Critical", "Active_SOS"] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterRisk(f)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterRisk === f
                    ? "bg-rose-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f === "All" ? "All Zones" : f === "Critical" ? "🔥 High Risk" : "🚨 Active SOS"}
              </button>
            ))}
          </div>

          {/* SOS Test Simulator Button */}
          <button
            type="button"
            onClick={handleSimulateSOS}
            disabled={simulatingSOS}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-rose-400/50 shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${simulatingSOS ? "animate-spin" : "animate-bounce"}`} />
            <span>{simulatingSOS ? "Simulating..." : "Test SOS Beacon"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-bold p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
              <span>{feedback}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs font-mono px-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Content: Left Map Canvas, Right Selected Zone Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive 2D Heatmap Map Canvas (2 Columns) */}
        <div className="lg:col-span-2 bg-[#060a19] border border-[#192756] rounded-2xl p-4 space-y-4 relative overflow-hidden min-h-[380px] flex flex-col justify-between shadow-inner">
          
          {/* Map Blueprint Grid overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />

          {/* Top Canvas Status overlay */}
          <div className="relative z-10 flex items-center justify-between text-xs bg-[#0b1029]/80 border border-[#1e2a5e] p-2.5 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="font-extrabold uppercase text-[11px] text-indigo-300">
                GateKaru Spatial Master Blueprint 2026
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Critical Risk
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe Zone
              </span>
            </div>
          </div>

          {/* Map Plot Canvas Area */}
          <div className="relative z-10 w-full h-[280px] bg-[#030612]/60 rounded-xl border border-[#121c3d] overflow-hidden">
            
            {/* Background Map Graphic (Roadways, Central Lawn, Perimeter) */}
            <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-12 bg-slate-800/20 border-y border-slate-700/30 rounded-full flex items-center justify-center text-[10px] font-mono text-slate-600 uppercase tracking-widest pointer-events-none">
              Central Promenade Roadway
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-10 bg-slate-800/20 border-x border-slate-700/30 rounded-full pointer-events-none" />

            {/* Render Heatmap Pins for Zone Locations */}
            {displayedZones.map(zone => {
              const isSelected = selectedZone.id === zone.id;
              const hasSOS = !!zone.activeSosAlert;

              let pinColor = "bg-emerald-500 text-emerald-950 border-emerald-300 shadow-emerald-500/50";
              let ringColor = "border-emerald-500/30";

              if (zone.riskLevel === "Critical" || hasSOS) {
                pinColor = "bg-rose-600 text-white border-rose-300 shadow-rose-600/80 animate-pulse";
                ringColor = "border-rose-500/60";
              } else if (zone.riskLevel === "Moderate") {
                pinColor = "bg-amber-500 text-amber-950 border-amber-300 shadow-amber-500/50";
                ringColor = "border-amber-500/30";
              }

              return (
                <div
                  key={zone.id}
                  style={{ left: `${zone.gridX}%`, top: `${zone.gridY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  onClick={() => setSelectedZone(zone)}
                >
                  {/* Radar Ripple Circle for Active SOS */}
                  {hasSOS && (
                    <div className="absolute -inset-6 rounded-full border-2 border-rose-500 animate-ping opacity-75 pointer-events-none" />
                  )}

                  {/* Guard Response Radius preview on select */}
                  {isSelected && (
                    <div className={`absolute -inset-10 rounded-full border border-dashed ${ringColor} bg-indigo-500/5 animate-spin pointer-events-none`} />
                  )}

                  {/* Map Marker Pin */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-xl transition-all flex items-center gap-1.5 ${pinColor} ${
                      isSelected ? "ring-2 ring-white scale-110 z-30" : "hover:scale-105"
                    }`}
                  >
                    {hasSOS ? (
                      <Siren className="w-3.5 h-3.5 text-white animate-bounce" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                    <span>{zone.code}</span>
                  </div>

                  {/* Hover Tooltip card */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-[#050816] border border-indigo-500/40 rounded-xl text-white text-[10px] space-y-1 shadow-2xl pointer-events-none z-40">
                    <p className="font-extrabold text-indigo-300">{zone.name}</p>
                    <p className="text-slate-400">Incidents: {zone.incidentCount} | Guards: {zone.assignedGuards}</p>
                    {hasSOS && (
                      <p className="text-rose-400 font-bold animate-pulse">🚨 {zone.activeSosAlert?.type}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Canvas Footer Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Click any spatial zone pin on the map to inspect guard response radius and panic telemetry.
            </span>
            <button
              onClick={() => setSelectedZone(INITIAL_SOCIETY_ZONES[0])}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Map Focus
            </button>
          </div>
        </div>

        {/* Selected Zone Details & Action Panel (1 Column) */}
        <div className="bg-[#060a19] border border-[#192756] rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1f2e63] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">
                  Selected Zone Telemetry
                </span>
                <h3 className="text-sm font-black text-white">{selectedZone.name}</h3>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  selectedZone.riskLevel === "Critical" || selectedZone.activeSosAlert
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : selectedZone.riskLevel === "Moderate"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {selectedZone.riskLevel} Risk
              </span>
            </div>

            {/* Active SOS Panel if triggered in this zone */}
            {selectedZone.activeSosAlert ? (
              <div className="bg-rose-950/80 border border-rose-500/60 p-3.5 rounded-xl space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-rose-300 flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-rose-400 animate-spin" /> Live Emergency Alert
                  </span>
                  <span className="text-[10px] font-mono text-rose-200">{selectedZone.activeSosAlert.time}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-white text-sm">
                    {selectedZone.activeSosAlert.type} ({selectedZone.activeSosAlert.flat})
                  </p>
                  <p className="text-rose-200">Resident: {selectedZone.activeSosAlert.resident}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveAlert(selectedZone.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-lg transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Incident as Resolved
                </button>
              </div>
            ) : (
              <div className="bg-[#0a0f26] border border-[#1a2754] p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No active emergency alarms triggered in this location.</span>
              </div>
            )}

            {/* Zone Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#070b1a] border border-[#16234b] p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" /> Guards On Duty
                </span>
                <p className="text-base font-black text-white font-mono">{selectedZone.assignedGuards} Guards</p>
                <p className="text-[9px] text-slate-500">Patrol shift active</p>
              </div>

              <div className="bg-[#070b1a] border border-[#16234b] p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Eye className="w-3 h-3 text-indigo-400" /> Live CCTV Feed
                </span>
                <p className="text-base font-black text-white font-mono">{selectedZone.cctvCount} Cameras</p>
                <p className="text-[9px] text-emerald-400">100% Operational</p>
              </div>

              <div className="bg-[#070b1a] border border-[#16234b] p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" /> Historic Panic Log
                </span>
                <p className="text-base font-black text-rose-300 font-mono">{selectedZone.incidentCount} Alerts</p>
                <p className="text-[9px] text-slate-500">Last: {selectedZone.lastIncidentTime}</p>
              </div>

              <div className="bg-[#070b1a] border border-[#16234b] p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-indigo-400" /> Dispatch Hub
                </span>
                <p className="text-[11px] font-bold text-slate-200 truncate">{selectedZone.nearestGuardPost}</p>
                <p className="text-[9px] text-indigo-300">Fast Response Radius</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#1f2e63]">
            <button
              type="button"
              onClick={() => {
                if (onDispatchGuard) {
                  onDispatchGuard(selectedZone.id, selectedZone.name);
                }
                showNotification(`🚨 Emergency Security Patrol Unit dispatched to ${selectedZone.name}!`);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Radio className="w-4 h-4 animate-pulse" /> Dispatch SWAT Guard Patrol to {selectedZone.code}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
