import React, { useState, useEffect } from "react";
import { 
  Cpu, HardDrive, Database, Server, RefreshCw, Radio, 
  Terminal, ShieldCheck, CheckCircle2, CloudLightning, Activity, AlertTriangle,
  Settings, Save, Check, ShieldAlert, Sliders, AlertCircle
} from "lucide-react";

interface SuperAdminPlatformHealthProps {
  systemUptime: string;
  isBackupInProcess: boolean;
  latestBackupTime: string;
  onBackupDb: () => void;
}

export default function SuperAdminPlatformHealth({
  systemUptime,
  isBackupInProcess,
  latestBackupTime,
  onBackupDb
}: SuperAdminPlatformHealthProps) {
  
  // Interactive platform config states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [errorReporting, setErrorReporting] = useState("errors_only");
  const [rateLimit, setRateLimit] = useState(150);
  const [maxSocietiesLimit, setMaxSocietiesLimit] = useState(50);
  const [techSupportPhone, setTechSupportPhone] = useState("+91 99000 11223");
  const [techSupportEmail, setTechSupportEmail] = useState("support@gatekaru.com");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fluctuating hardware logs/telemetry
  const [cpuVal, setCpuVal] = useState(19);
  const [ramVal, setRamVal] = useState(58);
  const [diskVal, setDiskVal] = useState(44);
  const [latencyVal, setLatencyVal] = useState(17);

  // Fluctuating metric simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuVal(prev => Math.max(10, Math.min(45, prev + Math.floor(Math.random() * 7) - 3)));
      setLatencyVal(prev => Math.max(10, Math.min(28, prev + Math.floor(Math.random() * 5) - 2)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      alert("⚙️ Platform Config Saved! System metadata variables and live rate-limits successfully synced with GateKaru cloud nodes.");
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  // Verification Checklist
  const systemStatus = [
    { name: "Hostinger MySQL Database Server", status: "Optimal", desc: "Write throughput 14k/sec", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Redis Cache Clusters (Session Store)", status: "Online", desc: "Hits: 99.82% / Mem: 1.2GB", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "SSL Certificate (Secure TLS 1.3)", status: "Verified", desc: "Valid until Nov 2028", color: "text-indigo-400 bg-indigo-500/10" },
    { name: "Cloudflare Edge CDN Node", status: "Active (Global)", desc: "100% Cache hit ratio (Edge)", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "GCP Storage Bucket Partition", status: "Synced", desc: "asia-southeast1 regional archive", color: "text-indigo-400 bg-indigo-500/10" },
    { name: "GateKaru Firewall (WAF Protection)", status: "Defending", desc: "Zero SQL injection/XSS flags", color: "text-purple-400 bg-purple-500/10" },
  ];

  return (
    <div id="super-admin-platform-settings" className="space-y-6 animate-fadeIn text-slate-300">
      
      {/* Title */}
      <div className="border-b border-[#1e295d] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} /> System Control Panel
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Platform & Configuration Settings</h2>
          <p className="text-xs text-slate-400">Configure global metadata variables, rate limiting constraints, error logging verbosity, and monitor live system metrics.</p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#15204d] px-3.5 py-1.5 rounded-xl text-indigo-300 border border-indigo-900/40">
          Uptime Node: {systemUptime}
        </span>
      </div>

      {/* Main Stats: CPU, RAM, Disk, Latency */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CPU */}
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">CPU Allocation</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{cpuVal}%</span>
            <span className="text-[9px] text-emerald-400 font-bold">Standard Load</span>
          </div>
          <div className="w-full bg-[#11193d] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${cpuVal}%` }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">16 Virtual Cores Assigned</p>
        </div>

        {/* RAM */}
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Memory (RAM) Heap</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{ramVal}%</span>
            <span className="text-[9px] text-slate-400 font-bold font-mono">7.42 GB / 12.0 GB</span>
          </div>
          <div className="w-full bg-[#11193d] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${ramVal}%` }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Docker Container memory pool</p>
        </div>

        {/* Disk Usage */}
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Multi-Tenant SSD Space</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{diskVal}%</span>
            <span className="text-[9px] text-emerald-400 font-bold font-mono">442 GB / 1.0 TB</span>
          </div>
          <div className="w-full bg-[#11193d] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${diskVal}%` }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Auto-expand partition enabled</p>
        </div>

        {/* Latency */}
        <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">API Response Latency</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{latencyVal}ms</span>
            <span className="text-[9px] text-emerald-400 font-bold">Optimal Speed</span>
          </div>
          <div className="w-full bg-[#11193d] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all duration-1000" style={{ width: `${(latencyVal / 40) * 100}%` }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Ping: edge-cloudflare-router</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Hardware Status Checklist (SSL, CDN, etc) - 5 cols */}
        <div className="lg:col-span-5 bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
          <div className="border-b border-[#203273] pb-2">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" /> System Verification Log
            </h3>
            <p className="text-[10px] text-slate-400">Core software services healthcheck and encryption checkmarks.</p>
          </div>

          <div className="space-y-3">
            {systemStatus.map((sys, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 bg-[#070b1a]/95 rounded-xl border border-[#16214d]">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white block">{sys.name}</span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block">{sys.desc}</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${sys.color}`}>
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Platform configuration options - 7 cols */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveConfig} className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-5">
            <div className="border-b border-[#203273] pb-2 flex items-center gap-1.5">
              <Sliders className="w-4.5 h-4.5 text-indigo-400" />
              <div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Global Configuration Settings</h3>
                <p className="text-[10px] text-slate-400">Modify global application thresholds, maintenance gates, and support metadata.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Maintenance Mode Trigger */}
              <div className="bg-[#050816]/70 border border-[#1d2b5c]/70 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-extrabold text-white block flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Maintenance Gate
                  </span>
                  <span className="text-[9.5px] text-slate-400 block leading-snug">Reroutes active tenants to "System Upgrading" alert screen.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${maintenanceMode ? 'bg-rose-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${maintenanceMode ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Developer Sandbox Mode Trigger */}
              <div className="bg-[#050816]/70 border border-[#1d2b5c]/70 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-extrabold text-white block flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Sandbox Sandbox
                  </span>
                  <span className="text-[9.5px] text-slate-400 block leading-snug">Skips multi-tenant billing calculations for quick RWA testing.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSandboxMode(!sandboxMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${sandboxMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${sandboxMode ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Rate Limiter */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-bold text-slate-300 block uppercase">Client Rate Limiter (req/min)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="25"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#050816] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="font-mono text-xs font-black text-indigo-400 bg-[#070b1a] px-2 py-1 rounded border border-[#192657] shrink-0">
                    {rateLimit}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block">Restricts maximum API handshake payload limits per socket.</span>
              </div>

              {/* Error Reporting Level */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-bold text-slate-300 block uppercase">Syslog Verbosity Level</label>
                <select
                  value={errorReporting}
                  onChange={(e) => setErrorReporting(e.target.value)}
                  className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">DEBUG (All logs & payloads)</option>
                  <option value="errors_only">INFO & WARNING (Standard)</option>
                  <option value="critical">CRITICAL (Fatal crashes only)</option>
                </select>
                <span className="text-[9px] text-slate-500 block">Controls diagnostic log storage sizes.</span>
              </div>

              {/* Global limits */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-bold text-slate-300 block uppercase">Maximum SaaS Tenants Limit</label>
                <input
                  type="number"
                  value={maxSocietiesLimit}
                  onChange={(e) => setMaxSocietiesLimit(Number(e.target.value))}
                  className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
                <span className="text-[9px] text-slate-500 block">Hard limit of active RWA society database nodes.</span>
              </div>

              {/* Support Details */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-bold text-slate-300 block uppercase">Central Support Tech Email</label>
                <input
                  type="email"
                  value={techSupportEmail}
                  onChange={(e) => setTechSupportEmail(e.target.value)}
                  className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-300 block uppercase">Central Support Emergency Hotline</label>
                <input
                  type="text"
                  value={techSupportPhone}
                  onChange={(e) => setTechSupportPhone(e.target.value)}
                  className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
                <span className="text-[9.5px] text-slate-500 block leading-snug">This number displays as the default developer hotline in tenant guard panels when cloud networks are disconnected.</span>
              </div>

            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#1a285d]">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/10 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Core Config...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
              
              {saveSuccess && (
                <span className="text-xs font-black text-emerald-400 animate-pulse">
                  ✓ Core variables updated!
                </span>
              )}
            </div>
          </form>
        </div>

      </div>

      {/* Dynamic Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-xl">
        <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Note on Database Schema Updates (डाटाबेस स्कीमा अपडेट)</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            अगर आप डेटाबेस का स्कीमा, नए टेबल्स या फील्ड्स मॉडिफाई करना चाहते हैं, तो कृपया प्रोजेक्ट फाइल्स में <code className="text-amber-400 font-mono">/src/db/schema.ts</code> में बदलाव करें और फिर लिनक्स कंसोल में स्कीमा माइग्रेशन चलाएं। यह लाइव प्लेटफॉर्म सेटिंग्स पेज केवल ग्लोबल रनटाइम वेरिएबल्स और क्रेडेंशियल्स को प्रबंधित करने के लिए है।
          </p>
        </div>
      </div>

    </div>
  );
}
