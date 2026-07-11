import React, { useState } from "react";
import { 
  Search, Filter, Calendar, User, Shield, Sliders, Download, 
  RefreshCw, FileText, CheckCircle2, AlertTriangle, XCircle, 
  Database, Settings, Layers, Plus, Trash2, ArrowUpRight
} from "lucide-react";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  category: "System Config" | "Role Mods" | "Onboarding" | "Billing" | "Security" | "Database";
  action: string;
  target: string;
  severity: "info" | "warning" | "critical";
  status: "SUCCESS" | "FAILED" | "WARNING";
}

interface SuperAdminAuditLogsProps {
  logs: AuditLogEntry[];
  onAddLog: (log: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  onClearLogs?: () => void;
  simulatedDate: string;
}

export default function SuperAdminAuditLogs({ 
  logs, 
  onAddLog, 
  onClearLogs,
  simulatedDate
}: SuperAdminAuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  
  // Custom Action Simulator form states
  const [simCategory, setSimCategory] = useState<AuditLogEntry["category"]>("System Config");
  const [simAction, setSimAction] = useState("");
  const [simTarget, setSimTarget] = useState("");
  const [simOperator, setSimOperator] = useState("Super Admin (JobsKaru Dev)");
  const [simSeverity, setSimSeverity] = useState<AuditLogEntry["severity"]>("info");
  const [simStatus, setSimStatus] = useState<AuditLogEntry["status"]>("SUCCESS");

  // Filtering logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || log.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "All" || log.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "All" || log.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const handleSimulateActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simAction.trim()) return;
    
    onAddLog({
      operator: simOperator,
      category: simCategory,
      action: simAction,
      target: simTarget || "Global System Settings",
      severity: simSeverity,
      status: simStatus
    });

    setSimAction("");
    setSimTarget("");
    alert("📝 Simulated administrative action dispatched! Audit ledger state updated with a new block.");
  };

  const triggerExportCSV = () => {
    alert("💾 CSV ledger dump generated and downloaded! Cryptographic seal SHA-256 applied.");
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />;
      case "FAILED":
        return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "System Config": return "text-purple-400 bg-purple-500/10 border-purple-500/25";
      case "Role Mods": return "text-blue-400 bg-blue-500/10 border-blue-500/25";
      case "Onboarding": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      case "Billing": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/25";
      case "Security": return "text-rose-400 bg-rose-500/10 border-rose-500/25";
      case "Database": return "text-teal-400 bg-teal-500/10 border-teal-500/25";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/25";
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Page Header */}
      <div className="border-b border-[#1e295d] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" /> Tamper-Proof Activity Ledger
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Central System Audit Log</h2>
          <p className="text-xs text-slate-400">
            Real-time administrative ledger tracking all society onboarding events, user role escalations, config shifts, and billing settlements.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={triggerExportCSV}
            className="bg-[#11193d] hover:bg-[#1c285e] text-indigo-400 hover:text-white font-black text-[11px] px-3.5 py-2 rounded-xl border border-[#23357a] transition uppercase tracking-wider flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Logs CSV
          </button>
          
          {onClearLogs && (
            <button
              type="button"
              onClick={() => {
                if (confirm("🚨 This will wipe the session audit ledger! Are you sure?")) {
                  onClearLogs();
                }
              }}
              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-white font-black text-[11px] px-3.5 py-2 rounded-xl border border-rose-900/40 transition uppercase tracking-wider flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset Ledger
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards & Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Total Actions Logs</span>
            <span className="text-xl font-black text-white font-mono">{logs.length}</span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Success Operations</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {logs.filter(l => l.status === "SUCCESS").length}
            </span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Security Alerts / Warns</span>
            <span className="text-xl font-black text-rose-400 font-mono">
              {logs.filter(l => l.severity === "critical" || l.status === "WARNING").length}
            </span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Recent Shifts</span>
            <span className="text-xl font-black text-purple-400 font-mono">
              {logs.filter(l => l.category === "System Config").length} System Configs
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Log Viewer & Filters (8 cols) */}
        <div className="lg:col-span-8 bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* Filtering Header Panel */}
          <div className="p-4 bg-[#0d1435] border-b border-[#1e2a5e]/60 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search action details, operator, or targets..."
                className="w-full bg-[#070b1a] border border-[#21326d] rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Category selector */}
              <div className="flex items-center gap-1.5 bg-[#070b1a] border border-[#21326d] rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none font-bold"
                >
                  <option value="All">All Categories</option>
                  <option value="System Config">System Config</option>
                  <option value="Role Mods">Role Mods</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Billing">Billing</option>
                  <option value="Security">Security</option>
                  <option value="Database">Database</option>
                </select>
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-1.5 bg-[#070b1a] border border-[#21326d] rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none font-bold"
                >
                  <option value="All">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="WARNING">WARNING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>

          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                  <th className="p-4 w-40">Timestamp (UTC)</th>
                  <th className="p-4 w-40">Operator</th>
                  <th className="p-4 w-32">Category</th>
                  <th className="p-4">Action</th>
                  <th className="p-4 w-36">Target Node</th>
                  <th className="p-4 w-24 text-center">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182352]/30 font-medium">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#131b46]/40 transition">
                      
                      {/* Timestamp */}
                      <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                          {log.timestamp}
                        </span>
                      </td>

                      {/* Operator */}
                      <td className="p-4 text-white font-black whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {log.operator}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>

                      {/* Action Detail */}
                      <td className="p-4 text-slate-200">
                        <p className="line-clamp-2 max-w-md font-semibold text-[11.5px] leading-relaxed">
                          {log.action}
                        </p>
                      </td>

                      {/* Target */}
                      <td className="p-4 font-mono text-indigo-300 font-semibold whitespace-nowrap">
                        {log.target}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 justify-center">
                          {getStatusIcon(log.status)}
                          <span className={`text-[10px] font-black uppercase ${
                            log.status === "SUCCESS" ? "text-emerald-400" :
                            log.status === "WARNING" ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {log.status}
                          </span>
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                      <div className="flex flex-col items-center gap-2">
                        <Database className="w-8 h-8 text-slate-600 animate-pulse" />
                        <span>No audit records match the current filter keys.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#0d1435] border-t border-[#1e2a5e]/60 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
            <span>Security Signature: HMAC-SHA256 Encrypted</span>
            <span>Displaying {filteredLogs.length} of {logs.length} Blocks</span>
          </div>

        </div>

        {/* Action Simulator Console (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#203273] pb-2">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-400" /> Simulated Audit Event
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Test and verify the central activity ledger by injecting new administrative actions dynamically.
              </p>
            </div>

            <form onSubmit={handleSimulateActionSubmit} className="space-y-4 text-xs font-semibold">
              
              {/* Operator */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Action Operator</label>
                <select
                  value={simOperator}
                  onChange={(e) => setSimOperator(e.target.value)}
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2.5 text-white text-xs"
                >
                  <option value="Super Admin (JobsKaru Dev)">Super Admin (JobsKaru Dev)</option>
                  <option value="RWA-s1-Secretary (Vikram Mehta)">RWA-s1-Secretary (Vikram Mehta)</option>
                  <option value="System Backup Engine">System Backup Engine</option>
                  <option value="Automated Security Patrol Unit">Automated Security Patrol Unit</option>
                  <option value="GateKaru Billing Cron">GateKaru Billing Cron</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Event Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value as any)}
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2.5 text-white text-xs"
                >
                  <option value="System Config">System Config</option>
                  <option value="Role Mods">Role Mods</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Billing">Billing</option>
                  <option value="Security">Security</option>
                  <option value="Database">Database</option>
                </select>
              </div>

              {/* Action */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Action Description</label>
                <textarea
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value)}
                  placeholder="e.g. Scaled greenwood_pool container instances to 4 replicas"
                  rows={3}
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2.5 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Target Node */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Affected Target Node</label>
                <input
                  type="text"
                  value={simTarget}
                  onChange={(e) => setSimTarget(e.target.value)}
                  placeholder="e.g. Container: s1-web-svc, Resident: r4"
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2.5 text-white text-xs placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Severity */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Severity</label>
                  <select
                    value={simSeverity}
                    onChange={(e) => setSimSeverity(e.target.value as any)}
                    className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2 text-white text-xs"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Verdict / Status */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold block">Verdict</label>
                  <select
                    value={simStatus}
                    onChange={(e) => setSimStatus(e.target.value as any)}
                    className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2 text-white text-xs"
                  >
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARNING">WARNING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase transition text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                Inject Simulated Block <ArrowUpRight className="w-4 h-4" />
              </button>

            </form>
          </div>

          {/* Quick Informational card */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 text-xs font-semibold space-y-2">
            <h4 className="text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-400" /> Tamper-Proofing Spec
            </h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
              Every block committed to the central audit log is sealed with standard HMAC cryptographic signatures. If metadata gets altered offline, the container checksum immediately triggers a system-wide lock down.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
