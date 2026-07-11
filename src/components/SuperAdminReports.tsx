import React, { useState } from "react";
import { 
  FileBarChart, FileText, Download, CheckCircle2, Clock, 
  RefreshCw, Play, Filter, Calendar, Settings, Mail, 
  MessageSquare, User, Shield, AlertTriangle, Cloud, HelpCircle
} from "lucide-react";

interface SuperAdminReportsProps {
  societies: any[];
  residents: any[];
}

export default function SuperAdminReports({ societies, residents }: SuperAdminReportsProps) {
  const [selectedReportType, setSelectedReportType] = useState("Security Logs");
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  // Automated notification schedules state
  const [scheduleEmail, setScheduleEmail] = useState(true);
  const [scheduleWhatsApp, setScheduleWhatsApp] = useState(false);
  const [scheduleWeeklyLogs, setScheduleWeeklyLogs] = useState(true);

  // Reports directory
  const preCompiledReports = [
    { name: "Multi-Tenant Subscription Audit Ledger", date: "2026-07-08", size: "142 KB", format: "CSV", category: "Billing" },
    { name: "Active Gated Society Population census", date: "2026-07-07", size: "2.1 MB", format: "PDF", category: "Onboarding" },
    { name: "JobsKaru Central security Patrol Records", date: "2026-07-06", size: "844 KB", format: "CSV", category: "Security" },
    { name: "Weekly IGST Taxation Reconciliation", date: "2026-07-05", size: "1.1 MB", format: "PDF", category: "Billing" },
    { name: "Database Health & API Request logs", date: "2026-07-04", size: "14.2 MB", format: "JSON", category: "Infrastructure" },
  ];

  const handleTriggerCompile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);
    setCompilationProgress(5);
    setGeneratedReport(null);

    const interval = setInterval(() => {
      setCompilationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompiling(false);
            setGeneratedReport({
              id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
              name: `GateKaru ${selectedReportType} Compilation`,
              timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
              format: selectedFormat,
              size: `${(Math.random() * 3.5 + 0.5).toFixed(2)} MB`,
              checksum: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
            });
            alert(`🎉 Report successfully compiled and saved to GCP cloud partition bucket!`);
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 150);
  };

  const handleDownloadGenerated = () => {
    alert("📥 Mock binary chunk download initiated. Filename: " + generatedReport.name + "." + generatedReport.format.toLowerCase());
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Header */}
      <div className="border-b border-[#1e295d] pb-4">
        <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
          <FileBarChart className="w-4 h-4 text-indigo-400" /> Platform Report Center
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Multi-Tenant Platform Reports</h2>
        <p className="text-xs text-slate-400">
          Synthesize complex data logs, trigger manual compliance report compilations, and program automate daily report dispatches.
        </p>
      </div>

      {/* Grid overview metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Reports Compiled Today</span>
            <span className="text-xl font-black text-white font-mono">14 Ledger Blocks</span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Average Compile Speed</span>
            <span className="text-xl font-black text-purple-400 font-mono">1.82 seconds</span>
          </div>
        </div>

        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-xl p-4 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Cloud Storage Occupied</span>
            <span className="text-xl font-black text-emerald-400 font-mono">428.4 GB</span>
          </div>
        </div>

      </div>

      {/* Main split: Compiler Console & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Compile Engine Console (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-[#21326d] pb-2">
              <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1">
                <Play className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Compilation Engine v3.1
              </span>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-tight mt-0.5">Synthesize Platform Report</h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Query multi-tenant databases and compile cryptographically sealed audit PDFs or CSV spreadsheets.
              </p>
            </div>

            <form onSubmit={handleTriggerCompile} className="space-y-4 text-xs font-semibold">
              
              {/* Report Category */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Target Report Category</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full bg-[#070b1a] border border-[#21326d] rounded-lg p-2.5 text-white text-xs"
                  disabled={isCompiling}
                >
                  <option value="Security Logs">Society Security Guard Patrol Logs</option>
                  <option value="Billing Reconciliation">Billing & IGST Taxation Reconciliation</option>
                  <option value="Tenant Demographic">Society Onboarding Census & Flats Population</option>
                  <option value="Server Metrics">Database Health & API Load Metrics</option>
                  <option value="Support Tickets">Helpdesk Ticketing Resolution Velocity</option>
                </select>
              </div>

              {/* Layout format */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Output Compilation Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PDF", "CSV", "JSON"].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-black uppercase transition text-center ${
                        selectedFormat === fmt 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/30" 
                          : "bg-[#070b1a] border-[#21326d] text-slate-400 hover:text-slate-200"
                      }`}
                      disabled={isCompiling}
                    >
                      {fmt} Format
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Scope */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Time-series Scope Window</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-indigo-500" />
                  <input 
                    type="text" 
                    value="Last 30 Days (2026-06-09 to 2026-07-09)" 
                    disabled 
                    className="w-full bg-[#070b1a]/50 border border-[#21326d] rounded-lg py-2 pl-9 pr-3 text-[10.5px] text-slate-400 font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Trigger Submit */}
              {!isCompiling ? (
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl uppercase transition text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  Compile New Report <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="space-y-2.5 bg-[#05081c] border border-indigo-950 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" /> Compiling telemetry blocks...
                    </span>
                    <span>{compilationProgress}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${compilationProgress}%` }}
                    />
                  </div>
                </div>
              )}

            </form>

            {/* Generated Report Output card */}
            {generatedReport && (
              <div className="bg-slate-950/40 border border-emerald-950 p-4 rounded-xl space-y-3.5 animate-slideIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">Compilation Complete</span>
                    <span className="text-[11px] text-white font-bold">{generatedReport.id} Successfully Sealed</span>
                  </div>
                </div>

                <div className="text-[10.5px] font-mono space-y-1 text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-900">
                  <p>• File: <span className="text-white font-bold">{generatedReport.name}.{generatedReport.format.toLowerCase()}</span></p>
                  <p>• Size: <span className="text-white">{generatedReport.size}</span></p>
                  <p>• Sealed: <span className="text-white">{generatedReport.timestamp}</span></p>
                  <p className="truncate">• Hash: <span className="text-indigo-400">{generatedReport.checksum}</span></p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadGenerated}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-lg text-[11px] uppercase transition flex items-center justify-center gap-1.5 shadow shadow-emerald-700/20"
                >
                  <Download className="w-3.5 h-3.5" /> Download Report File
                </button>
              </div>
            )}

          </div>

          {/* Automated dispatcher scheduler config */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-[#21326d] pb-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-400" /> Automate Notification Logs
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Programmatic triggers to dispatch compliance logs directly to society admins.</p>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              {/* Toggle 1 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-white flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> Weekly Billing Summary
                  </span>
                  <p className="text-[9px] text-slate-500 font-medium leading-none">Auto-email billing reconciliation logs to RWA Treasurers.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-white flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Security WhatsApp Alerts
                  </span>
                  <p className="text-[9px] text-slate-500 font-medium leading-none">Dispatch daily visitor SOS anomaly logs via automated WhatsApp.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={scheduleWhatsApp}
                  onChange={(e) => setScheduleWhatsApp(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Toggle 3 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-white flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-400" /> Weekly Cloud Health
                  </span>
                  <p className="text-[9px] text-slate-500 font-medium leading-none">Backup database cluster logs dispatches directly to dev operators.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={scheduleWeeklyLogs}
                  onChange={(e) => setScheduleWeeklyLogs(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Reports Directory (7/12 cols) */}
        <div className="lg:col-span-7 bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          
          <div>
            {/* Header filters */}
            <div className="p-4 bg-[#0d1435] border-b border-[#1e2a5e]/60 flex justify-between items-center">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider">Reports Archive Bucket</span>
              <span className="text-[9px] font-mono text-indigo-300">GCP CLOUD SNAPSHOTS AVAILABLE</span>
            </div>

            {/* List */}
            <div className="divide-y divide-[#182352]/30">
              {preCompiledReports.map((row, i) => (
                <div key={i} className="p-4 hover:bg-[#131b46]/40 transition flex justify-between items-center gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase ${
                        row.category === "Billing" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        row.category === "Security" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        row.category === "Onboarding" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {row.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{row.date}</span>
                    </div>

                    <h4 className="text-white text-xs font-black">{row.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Format: <b className="text-slate-300">{row.format}</b> • Size: <b className="text-slate-300">{row.size}</b></p>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`📥 Download initiated for pre-compiled report: ${row.name}.${row.format.toLowerCase()}`)}
                    className="p-2.5 rounded-xl bg-[#070b1a] hover:bg-indigo-600 border border-[#21326d] hover:border-indigo-500 text-slate-400 hover:text-white transition shrink-0"
                    title="Download Report File"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#0d1435] border-t border-[#1e2a5e]/60 text-center text-[10px] font-mono text-slate-500 uppercase">
            Platform Logs Sealed with SHA-256 HMAC & Cloud-Synced
          </div>

        </div>

      </div>

    </div>
  );
}
