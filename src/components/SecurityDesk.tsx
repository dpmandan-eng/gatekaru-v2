import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  UserX, 
  ClipboardCheck, 
  RotateCw, 
  Check, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  Shield, 
  Eye, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Lock, 
  MapPin, 
  Sliders, 
  ThumbsUp, 
  X,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BlacklistEntry {
  id: string;
  name: string;
  phone: string;
  type: string;
  vehicleNo: string;
  reason: string;
  createdAt: string;
}

interface HandoverEntry {
  id: string;
  outgoingGuard: string;
  incomingGuard: string;
  shiftType: string;
  intercomOk: boolean;
  rfidOk: boolean;
  keysHandedOver: boolean;
  incidentsNote: string;
  timestamp: string;
}

interface PatrolCheckpoint {
  name: string;
  status: "ok" | "issue";
  comment?: string;
  time?: string;
}

interface PatrolEntry {
  id: string;
  guardName: string;
  shiftType: string;
  checkpoints: PatrolCheckpoint[];
  issuesFound: boolean;
  comments: string;
  timestamp: string;
}

export default function SecurityDesk() {
  const [activeSubTab, setActiveSubTab] = useState<"blacklist" | "handover" | "patrol">("blacklist");
  
  // Data States
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [handovers, setHandovers] = useState<HandoverEntry[]>([]);
  const [patrols, setPatrols] = useState<PatrolEntry[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Blacklist form state
  const [blName, setBlName] = useState("");
  const [blPhone, setBlPhone] = useState("");
  const [blType, setBlType] = useState("Delivery (Zomato/Swiggy)");
  const [blVehicle, setBlVehicle] = useState("");
  const [blReason, setBlReason] = useState("");
  const [showBlForm, setShowBlForm] = useState(false);

  // Handover form state
  const [hoOutgoing, setHoOutgoing] = useState("");
  const [hoIncoming, setHoIncoming] = useState("");
  const [hoShift, setHoShift] = useState("Day Shift (08:00 - 20:00)");
  const [hoIntercom, setHoIntercom] = useState(true);
  const [hoRfid, setHoRfid] = useState(true);
  const [hoKeys, setHoKeys] = useState(true);
  const [hoNotes, setHoNotes] = useState("");
  const [showHoForm, setShowHoForm] = useState(false);

  // Patrol form state
  const [ptGuard, setPtGuard] = useState("");
  const [ptShift, setPtShift] = useState("Night Shift");
  const [ptCheckpoints, setPtCheckpoints] = useState<PatrolCheckpoint[]>([
    { name: "Main Gate 1 Terminal", status: "ok" },
    { name: "Sector-A Tower Lift Lobby", status: "ok" },
    { name: "Sector-B Tower Back Alleys", status: "ok" },
    { name: "Society Substation & Electrical Room", status: "ok" },
    { name: "Perimeter Boundary Fencing North", status: "ok" },
    { name: "Main Water Pump Station", status: "ok" }
  ]);
  const [ptComments, setPtComments] = useState("");
  const [showPtForm, setShowPtForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blRes, hoRes, ptRes] = await Promise.all([
        fetch("/api/security/blacklist"),
        fetch("/api/security/handover"),
        fetch("/api/security/patrol")
      ]);

      if (blRes.ok) setBlacklist(await blRes.json());
      if (hoRes.ok) setHandovers(await hoRes.json());
      if (ptRes.ok) setPatrols(await ptRes.json());
    } catch (e) {
      console.error("Error loading security desk data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Blacklist Submission
  const handleBlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blName && !blVehicle) {
      alert("Please provide at least a Name or a Vehicle Plate.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/security/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: blName,
          phone: blPhone,
          type: blType,
          vehicleNo: blVehicle,
          reason: blReason
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBlacklist(prev => [data.entry, ...prev]);
        setBlName("");
        setBlPhone("");
        setBlVehicle("");
        setBlReason("");
        setShowBlForm(false);
        alert("Visitor/Vehicle blacklisted successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete from Blacklist
  const handleBlDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this entry from the security blacklist?")) return;
    try {
      const res = await fetch(`/api/security/blacklist/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlacklist(prev => prev.filter(item => item.id !== id));
        alert("Removed from security blacklist.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handover Submission
  const handleHoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoOutgoing || !hoIncoming) {
      alert("Please specify outgoing and incoming security guards.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/security/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outgoingGuard: hoOutgoing,
          incomingGuard: hoIncoming,
          shiftType: hoShift,
          intercomOk: hoIntercom,
          rfidOk: hoRfid,
          keysHandedOver: hoKeys,
          incidentsNote: hoNotes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setHandovers(prev => [data.handover, ...prev]);
        setHoOutgoing("");
        setHoIncoming("");
        setHoNotes("");
        setShowHoForm(false);
        alert("Shift Handover Log recorded successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Patrol Submission
  const handlePtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptGuard) {
      alert("Please enter the patrolling guard's name.");
      return;
    }
    try {
      setSubmitting(true);
      const issuesFound = ptCheckpoints.some(c => c.status === "issue");
      const roundedCheckpoints = ptCheckpoints.map(cp => ({
        ...cp,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      const res = await fetch("/api/security/patrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardName: ptGuard,
          shiftType: ptShift,
          checkpoints: roundedCheckpoints,
          issuesFound,
          comments: ptComments
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPatrols(prev => [data.patrol, ...prev]);
        setPtGuard("");
        setPtComments("");
        // Reset status
        setPtCheckpoints(prev => prev.map(c => ({ ...c, status: "ok", comment: "" })));
        setShowPtForm(false);
        alert("Digital Guard Patrol Round logged successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCheckpointStatus = (idx: number) => {
    setPtCheckpoints(prev => prev.map((cp, i) => {
      if (i === idx) {
        return {
          ...cp,
          status: cp.status === "ok" ? "issue" : "ok"
        };
      }
      return cp;
    }));
  };

  const setCheckpointComment = (idx: number, comment: string) => {
    setPtCheckpoints(prev => prev.map((cp, i) => {
      if (i === idx) {
        return { ...cp, comment };
      }
      return cp;
    }));
  };

  // Filtered Blacklist
  const filteredBlacklist = blacklist.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.vehicleNo.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white border border-indigo-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 -translate-y-12 translate-x-12 text-indigo-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider font-mono">
              🛡️ GATEKARU FORTRESS CONTROL / गेटकारू सुरक्षा ऑपरेशन्स
            </span>
            <h2 className="text-lg font-black tracking-tight uppercase mt-2">
              Advanced Security Operations Desk / सुरक्षा सुदृढ़ीकरण प्रणाली
            </h2>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl font-medium">
              Reinforcing campus security with a live-monitored blacklist registry, formal duty shift handovers, and geo-checkpoint guard patrols audits.
            </p>
          </div>

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/10 transition flex items-center gap-2 active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Checking logs..." : "Sync Control Desk"}
          </button>
        </div>

        {/* Sub tabs bar */}
        <div className="flex border-t border-white/10 mt-6 pt-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("blacklist")}
            className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "blacklist" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserX className="w-3.5 h-3.5" /> Banned Blacklist (प्रतिबंधित सूची)
          </button>
          <button
            onClick={() => setActiveSubTab("handover")}
            className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "handover" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> Shift Handover (शिफ्ट हैंडओवर)
          </button>
          <button
            onClick={() => setActiveSubTab("patrol")}
            className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "patrol" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Guard Patrol (सुरक्षा गश्त लॉग)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-600">सिंक्रोनाइज़िंग डेटाबेस (Syncing Security Data...)</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ------------------------------------------------------------- */}
          {/* SUBTAB 1: BLACKLIST REGISTRY */}
          {/* ------------------------------------------------------------- */}
          {activeSubTab === "blacklist" && (
            <div className="space-y-6">
              
              {/* Controls and Search Row */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="खोजें: नाम, वाहन नंबर या मोबाइल..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <button
                  onClick={() => setShowBlForm(!showBlForm)}
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl border border-red-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  {showBlForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showBlForm ? "Close Form" : "Banned Entry (प्रतिबंधित जोड़ें)"}
                </button>
              </div>

              {/* Add Blacklist Entry Form */}
              {showBlForm && (
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-200 shadow-sm max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                    <UserX className="w-4 h-4 text-red-600" />
                    <h3 className="text-xs font-black text-red-950 uppercase tracking-wide">
                      Blacklist New Visitor or Vehicle / नई ब्लैकलिस्ट एंट्री दर्ज करें
                    </h3>
                  </div>

                  <form onSubmit={handleBlSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Name (व्यक्ति का नाम)</label>
                        <input
                          type="text"
                          value={blName}
                          onChange={(e) => setBlName(e.target.value)}
                          placeholder="E.g., Ramesh Yadav"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Plate (वाहन नंबर)</label>
                        <input
                          type="text"
                          value={blVehicle}
                          onChange={(e) => setBlVehicle(e.target.value)}
                          placeholder="E.g., DL-3C-AL-4433"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Phone (मोबाइल नंबर)</label>
                        <input
                          type="text"
                          value={blPhone}
                          onChange={(e) => setBlPhone(e.target.value)}
                          placeholder="E.g., +91 99999 00001"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visitor Category / श्रेणी</label>
                        <select
                          value={blType}
                          onChange={(e) => setBlType(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                        >
                          <option value="Delivery (Zomato/Swiggy)">Delivery (Zomato/Swiggy/Amazon)</option>
                          <option value="Cab Driver (Ola/Uber)">Cab Driver (Ola/Uber)</option>
                          <option value="Daily Helper / Maid">Daily Helper / Maid</option>
                          <option value="General Visitor / Guest">General Visitor / Guest</option>
                          <option value="Unknown Trespasser">Unknown Trespasser</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason for Blacklisting (प्रतिबंध का कारण)</label>
                      <textarea
                        required
                        value={blReason}
                        onChange={(e) => setBlReason(e.target.value)}
                        placeholder="Please write the clear reason (unruly behavior, speeding, unpaid bills, theft attempt)..."
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBlForm(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {submitting ? "Blacklisting..." : "Banish / Blacklist"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Blacklist List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    Banned Registry / ब्लैकलिस्टेड डेटाबेस ({filteredBlacklist.length} Records)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">GateKaru Safe Engine</span>
                </div>

                {filteredBlacklist.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold">No blacklisted records match your search criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/50 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                          <th className="py-3 px-4">Visitor/Target Details</th>
                          <th className="py-3 px-4">Vehicle Number</th>
                          <th className="py-3 px-4">Banned Category</th>
                          <th className="py-3 px-4">Reason & Violation Comment</th>
                          <th className="py-3 px-4">Date Banned</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBlacklist.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">Ph: {item.phone}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] font-black text-slate-700 bg-red-500/5 px-2.5 py-1 rounded inline-block mt-2">
                              {item.vehicleNo}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-red-50 text-red-800 border border-red-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs text-[11px] text-slate-600 font-medium leading-relaxed">
                              {item.reason}
                            </td>
                            <td className="py-3.5 px-4 text-[10px] text-slate-400 font-bold">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleBlDelete(item.id)}
                                className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"
                                title="Remove Banishment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SUBTAB 2: SHIFT HANDOVER LOG */}
          {/* ------------------------------------------------------------- */}
          {activeSubTab === "handover" && (
            <div className="space-y-6">
              
              {/* Controls and Header Row */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Shift Handover ledger</h3>
                  <p className="text-[10px] text-slate-400">Formal handover logs of keys, intercom connectivity, and gate barriers.</p>
                </div>

                <button
                  onClick={() => setShowHoForm(!showHoForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  {showHoForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showHoForm ? "Close Form" : "Log Handover (हैंडओवर दर्ज करें)"}
                </button>
              </div>

              {/* Add Handover Entry Form */}
              {showHoForm && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <RotateCw className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Formal Duty Handover Form / ड्यूटी शिफ्ट हैंडओवर विवरण
                    </h3>
                  </div>

                  <form onSubmit={handleHoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Outgoing Guard (हैंडओवर देने वाला)</label>
                        <input
                          type="text"
                          required
                          value={hoOutgoing}
                          onChange={(e) => setHoOutgoing(e.target.value)}
                          placeholder="E.g., Mahesh Singh"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Incoming Guard (ड्यूटी संभालने वाला)</label>
                        <input
                          type="text"
                          required
                          value={hoIncoming}
                          onChange={(e) => setHoIncoming(e.target.value)}
                          placeholder="E.g., Dharam Singh"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift Selection (शिफ्ट चुनें)</label>
                        <select
                          value={hoShift}
                          onChange={(e) => setHoShift(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Day Shift (08:00 - 20:00)">Day Shift (08:00 AM - 08:00 PM)</option>
                          <option value="Night Shift (20:00 - 08:00)">Night Shift (08:00 PM - 08:00 AM)</option>
                          <option value="Relief Shift (Custom)">Relief Shift (Temporary Duty Cover)</option>
                        </select>
                      </div>
                    </div>

                    {/* Operational Checklist */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest border-b pb-1.5">Operational Safety Checklist</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hoIntercom}
                            onChange={(e) => setHoIntercom(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-700">Intercom Active?</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hoRfid}
                            onChange={(e) => setHoRfid(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-700">RFID Barrier OK?</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hoKeys}
                            onChange={(e) => setHoKeys(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-700">All Keys Handed Over?</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Handover Comments & Incidents Log (रिमार्क्स)</label>
                      <textarea
                        value={hoNotes}
                        onChange={(e) => setHoNotes(e.target.value)}
                        placeholder="Detail any security system faults, key issues, unresolved visitors, pending deliveries or critical alerts..."
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowHoForm(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {submitting ? "Saving..." : "Record Handover Log"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Handover History timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Recent Shift Handover Audit Logs / शिफ्ट परिवर्तन इतिहास
                  </h3>
                  <span className="text-[10px] text-indigo-600 font-extrabold uppercase">Audit Trail Active</span>
                </div>

                {handovers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <RotateCw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold">No shift handovers logged yet.</p>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {handovers.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="border border-slate-200 rounded-xl p-4 hover:shadow-xs transition bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-800 border border-indigo-100 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                              {item.shiftType}
                            </span>
                            <span className="text-slate-400 text-xs">•</span>
                            <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Logged on {new Date(item.timestamp).toLocaleString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Handed Over By (outgoing)</p>
                              <p className="font-black text-slate-700">{item.outgoingGuard}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Taken Over By (incoming)</p>
                              <p className="font-black text-slate-700">{item.incomingGuard}</p>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Handover Notes</p>
                            {item.incidentsNote}
                          </div>
                        </div>

                        {/* Checklist statuses panel */}
                        <div className="md:w-52 flex flex-col justify-center gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b pb-1">Checks status</p>
                          
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>Intercom Active</span>
                            {item.intercomOk ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>RFID Barrier OK</span>
                            {item.rfidOk ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>Keys Handed Over</span>
                            {item.keysHandedOver ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SUBTAB 3: GUARD PATROL ROUNDS */}
          {/* ------------------------------------------------------------- */}
          {activeSubTab === "patrol" && (
            <div className="space-y-6">
              
              {/* Controls and Header Row */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Security Guard Patrol Audit</h3>
                  <p className="text-[10px] text-slate-400">Log checkpoints reached and incidents found during perimeter rounds.</p>
                </div>

                <button
                  onClick={() => setShowPtForm(!showPtForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  {showPtForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showPtForm ? "Close Form" : "Start Patrol Round (गश्त शुरू करें)"}
                </button>
              </div>

              {/* Add Patrol Round Form */}
              {showPtForm && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-indigo-600 animate-bounce" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Digital Patrol Round Logger / डिजिटल सुरक्षा गश्त चेकलिस्ट
                    </h3>
                  </div>

                  <form onSubmit={handlePtSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Patrolling Guard Name (गश्त कर्मी)</label>
                        <input
                          type="text"
                          required
                          value={ptGuard}
                          onChange={(e) => setPtGuard(e.target.value)}
                          placeholder="E.g., Dharam Singh"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current Shift (शिफ्ट)</label>
                        <select
                          value={ptShift}
                          onChange={(e) => setPtShift(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Day Shift">Day Shift</option>
                          <option value="Night Shift">Night Shift</option>
                          <option value="Evening Patrol">Evening Patrol</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive Checkpoints */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest border-b pb-1">
                        Society Geo-Checkpoints Verification / परिसर चेकपॉइंट्स जांचें
                      </label>
                      <p className="text-[10px] text-slate-400">Click on checkpoint status to toggle issue warning.</p>

                      <div className="grid grid-cols-1 gap-3">
                        {ptCheckpoints.map((cp, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                              cp.status === "ok" 
                                ? "bg-white border-slate-200" 
                                : "bg-amber-50 border-amber-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cp.status === "ok" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                              <span className="text-xs font-bold text-slate-800">{cp.name}</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              {cp.status === "issue" && (
                                <input
                                  type="text"
                                  value={cp.comment || ""}
                                  onChange={(e) => setCheckpointComment(idx, e.target.value)}
                                  placeholder="What is the issue? (e.g. bulb fused)"
                                  className="flex-1 sm:w-60 bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              )}

                              <button
                                type="button"
                                onClick={() => toggleCheckpointStatus(idx)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase shrink-0 cursor-pointer ${
                                  cp.status === "ok"
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                    : "bg-amber-500 text-white hover:bg-amber-600 border border-amber-500"
                                }`}
                              >
                                {cp.status === "ok" ? "✅ Clear (सुरक्षित)" : "⚠️ Issue (समस्या)"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Patrol Round Remarks (गश्त समीक्षा)</label>
                      <textarea
                        value={ptComments}
                        onChange={(e) => setPtComments(e.target.value)}
                        placeholder="Provide summary of patrol activity (e.g., all boundaries secure, met parking marshals, etc.)"
                        rows={2.5}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPtForm(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {submitting ? "Logging Patrol..." : "Submit Patrol Log"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Patrol Logs List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Recent Patrolling Rounds Ledger / दैनिक गश्त राउंड्स
                  </h3>
                  <span className="text-[10px] text-indigo-600 font-extrabold uppercase">Telemetry Synchronized</span>
                </div>

                {patrols.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold">No patrol rounds logged yet.</p>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {patrols.map((round, index) => (
                      <div 
                        key={round.id || index}
                        className="border border-slate-200 rounded-xl p-4 hover:shadow-xs transition bg-slate-50/50 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-indigo-600" />
                                {round.guardName}
                              </p>
                              <span className="text-slate-300 text-xs">•</span>
                              <span className="bg-slate-100 text-slate-700 border text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                {round.shiftType}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Patrolled on {new Date(round.timestamp).toLocaleString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {round.issuesFound ? (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                                ⚠️ Issues Identified (समस्या मिली)
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                                ✅ Clean Round (सुरक्षित)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Checkpoints Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-bold">
                          {round.checkpoints.map((cp, cidx) => (
                            <div 
                              key={cidx}
                              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                                cp.status === "ok" 
                                  ? "bg-white border-slate-200 text-slate-800" 
                                  : "bg-amber-50 border-amber-200 text-amber-900"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-black">{cp.name}</p>
                                {cp.comment && (
                                  <p className="text-[9px] font-semibold text-amber-700 italic mt-0.5 truncate">
                                    " {cp.comment} "
                                  </p>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 ml-2 shrink-0">{cp.time || "Clear"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Comments */}
                        {round.comments && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium leading-relaxed">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Patrol Notes & Recommendations</p>
                            {round.comments}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
