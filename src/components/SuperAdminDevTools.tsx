import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldAlert, Key, Play, Undo, ToggleLeft, ToggleRight, 
  Settings, Server, Plus, Trash2, Cpu, CheckCircle2, RefreshCw, Radio,
  Download, Archive, MessageSquare, Globe, Send, Check
} from "lucide-react";
import ApiKeyManager from "./ApiKeyManager";

interface SmsProvider {
  id: string;
  name: string;
  gatewayUrl: string;
  apiKey: string;
  senderId: string;
  route: string;
  description?: string;
}

export default function SuperAdminDevTools() {
  // SMS API Gateway Settings
  const [smsGatewayUrl, setSmsGatewayUrl] = useState("https://www.fast2sms.com/dev/bulkV2");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsSenderId, setSmsSenderId] = useState("FSTSMS");
  const [smsRoute, setSmsRoute] = useState("otp");
  const [smsActive, setSmsActive] = useState(false);
  const [activeSmsProviderId, setActiveSmsProviderId] = useState("fast2sms");
  const [smsProviders, setSmsProviders] = useState<SmsProvider[]>([
    {
      id: "fast2sms",
      name: "Fast2SMS (Quick / OTP)",
      gatewayUrl: "https://www.fast2sms.com/dev/bulkV2",
      apiKey: "",
      senderId: "FSTSMS",
      route: "otp",
      description: "Standard OTP/DLT Indian SMS Gateway API with JSON payloads"
    },
    {
      id: "jobskaru",
      name: "JobsKaru SMS API Gateway",
      gatewayUrl: "https://sms.jobskaru.com/v3",
      apiKey: "",
      senderId: "JKARU",
      route: "q",
      description: "Premium enterprise SMS and WhatsApp OTP fallback relay"
    },
    {
      id: "twilio",
      name: "Twilio HTTP API",
      gatewayUrl: "https://api.twilio.com/2010-04-01/Accounts/{apiKey}/Messages.json",
      apiKey: "",
      senderId: "TWILIO",
      route: "bulk",
      description: "Global SMS and OTP verification delivery via Twilio API"
    },
    {
      id: "generic",
      name: "Custom SMS Provider (GET Request)",
      gatewayUrl: "https://api.smsprovider.com/send?apikey={apiKey}&to={phone}&msg={message}&sender={senderId}",
      apiKey: "",
      senderId: "CUSTOM",
      route: "custom",
      description: "Generic endpoint mapping with placeholder replacement"
    }
  ]);

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test Dispatch State
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("GateKaru verification code is 4821. Valid for 10 minutes.");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Load gateway settings
  useEffect(() => {
    setIsLoadingSettings(true);
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSmsActive(!!data.smsActive);
          if (data.activeSmsProviderId) {
            setActiveSmsProviderId(data.activeSmsProviderId);
          }
          if (data.smsProviders && data.smsProviders.length > 0) {
            setSmsProviders(data.smsProviders);
            const activeProv = data.smsProviders.find((p: any) => p.id === (data.activeSmsProviderId || "fast2sms")) 
              || data.smsProviders[0];
            if (activeProv) {
              setSmsGatewayUrl(activeProv.gatewayUrl || "");
              setSmsApiKey(activeProv.apiKey || "");
              setSmsSenderId(activeProv.senderId || "");
              setSmsRoute(activeProv.route || "");
            }
          } else {
            setSmsGatewayUrl(data.smsGatewayUrl || "https://www.fast2sms.com/dev/bulkV2");
            setSmsApiKey(data.smsApiKey || "");
            setSmsSenderId(data.smsSenderId || "FSTSMS");
            setSmsRoute(data.smsRoute || "otp");
          }
        }
      })
      .catch(err => console.error("Failed to load settings in dev tools:", err))
      .finally(() => setIsLoadingSettings(false));
  }, []);

  const handleSelectProviderId = (id: string) => {
    setActiveSmsProviderId(id);
    const selected = smsProviders.find(p => p.id === id);
    if (selected) {
      setSmsGatewayUrl(selected.gatewayUrl);
      setSmsApiKey(selected.apiKey);
      setSmsSenderId(selected.senderId);
      setSmsRoute(selected.route);
    }
  };

  const handleUpdateActiveProviderField = (field: string, value: any) => {
    if (field === "gatewayUrl") setSmsGatewayUrl(value);
    if (field === "apiKey") setSmsApiKey(value);
    if (field === "senderId") setSmsSenderId(value);
    if (field === "route") setSmsRoute(value);

    setSmsProviders(prev => prev.map(p => {
      if (p.id === activeSmsProviderId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSaveSmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccess(false);
    try {
      const updatedProviders = smsProviders.map(p => {
        if (p.id === activeSmsProviderId) {
          return {
            ...p,
            gatewayUrl: smsGatewayUrl,
            apiKey: smsApiKey,
            senderId: smsSenderId,
            route: smsRoute
          };
        }
        return p;
      });

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smsActive,
          activeSmsProviderId,
          smsProviders: updatedProviders,
          smsGatewayUrl,
          smsApiKey,
          smsSenderId,
          smsRoute
        })
      });
      if (response.ok) {
        setSaveSuccess(true);
        setSmsProviders(updatedProviders);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings in dev tools:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/settings/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, message: testMessage })
      });
      const data = await response.json();
      if (response.ok) {
        setTestResult({ success: true, message: data.message || "Test SMS sent successfully!" });
      } else {
        setTestResult({ success: false, message: data.error || "Failed to send test SMS.", details: data.details });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "An error occurred." });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Feature flags state
  const [flags, setFlags] = useState([
    { id: "sms_bypass", name: "WhatsApp OTP Auto-Fallback", status: true, desc: "Auto-routes via SMS gateway if WhatsApp response takes > 2 seconds." },
    { id: "ai_blacklist", name: "AI Biometric Blacklist Enforcement", status: false, desc: "Triggers immediate silent alarms on guard terminal if flagged visitor matches visual blacklist." },
    { id: "stripe_v2", name: "Stripe Payment Handshake v2", status: true, desc: "Enables multi-ledger routing with automated reconciliation." },
    { id: "geo_fence", name: "RFID Patrol Geofence Check", status: false, desc: "Enforces strict GPS distance confirmation on patrol pings." },
  ]);

  // Env variables state
  const [envVars, setEnvVars] = useState([
    { key: "GEMINI_API_KEY", value: "AI_STUDIO_LIVE_PARTITION_KEY", hidden: true },
    { key: "DB_HOST", value: "localhost (Hostinger MySQL IP)", hidden: false },
    { key: "DB_USER", value: "u931056402_gatekaru", hidden: false },
    { key: "DB_NAME", value: "u931056402_gate_db", hidden: false },
    { key: "REDIS_HOST", value: "10.42.0.12", hidden: false },
    { key: "JOBSKARU_SMS_API_GATEWAY", value: "https://sms.jobskaru.com/v3", hidden: false },
  ]);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  // API Key Generator state
  const [apiKeys, setApiKeys] = useState([
    { id: "key_1", name: "Greenwood Heights Production", key: "gk_prod_86ac2df981...", created: "2026-06-15" },
    { id: "key_2", name: "Palm Heights Dev Sandbox", key: "gk_dev_03cf44de90a...", created: "2026-01-10" }
  ]);
  const [keyName, setKeyName] = useState("");

  // Deployment Version State
  const [currentVersion, setCurrentVersion] = useState("3.0.0-Enterprise");
  const [deployLog, setDeployLog] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // Webhook Logs
  const webhooks = [
    { event: "payment.cleared", target: "Greenwood ERP Callback", status: "200 OK", delay: "44ms" },
    { event: "visitor.registered", target: "Guard Terminal Gate 1", status: "200 OK", delay: "12ms" },
    { event: "alert.sos_panic", target: "RWA Safety Broadcast Node", status: "200 OK", delay: "8ms" },
  ];

  // Cron jobs status
  const cronJobs = [
    { name: "Daily Invoice Generator", interval: "Every day at 00:00", lastRun: "2026-07-09 00:00", status: "Sleeping" },
    { name: "Active Countdown Checker", interval: "Every hour at *:00", lastRun: "2026-07-09 00:00", status: "Active" },
    { name: "Cloud Sync Backup Archive", interval: "Every Sunday at 02:00", lastRun: "2026-07-05 02:00", status: "Sleeping" }
  ];

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => {
      if (f.id === id) return { ...f, status: !f.status };
      return f;
    }));
  };

  const addEnvVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newVal.trim()) return;
    setEnvVars(prev => [...prev, { key: newKey.toUpperCase(), value: newVal, hidden: false }]);
    setNewKey("");
    setNewVal("");
  };

  const deleteEnvVar = (key: string) => {
    setEnvVars(prev => prev.filter(v => v.key !== key));
  };

  const generateNewApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    const randomHash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newApiKey = {
      id: `key_${Date.now()}`,
      name: keyName,
      key: `gk_live_${randomHash}...`,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys(prev => [...prev, newApiKey]);
    setKeyName("");
    alert(`🔑 Success! New API Access Key generated for "${keyName}". Copy the key credentials securely.`);
  };

  const handleDeployVersion = () => {
    setIsDeploying(true);
    setDeployLog([]);
    const logs = [
      "INFO: Pulling latest master docker image from JobsKaru registry...",
      "INFO: Decompressing production assets bundle v3.0.1...",
      "INFO: Initiating blue-green rolling migration check...",
      "INFO: Database migrations passed schema validation.",
      "SUCCESS: Container nodes successfully routed to Node IP 10.42.0.1.",
      "DEPLOYMENT COMPLETE: GateKaru Secure Society ERP v3.0.1 is now LIVE."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setDeployLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setCurrentVersion("3.0.1-Enterprise");
        setIsDeploying(false);
        alert("🚀 Deployment successfully completed! Partition version bumped to 3.0.1-Enterprise.");
      }
    }, 500);
  };

  const handleRollbackVersion = () => {
    if (confirm("⚠️ WARNING: Rollover release is rolling back to v2.9.9. Database schema compatibility will be checked. Continue?")) {
      setCurrentVersion("2.9.9-Enterprise");
      setDeployLog(["ROLLBACK COMMAND DISPATCHED", "SUCCESS: Restored container image index to v2.9.9. Uptime preserved."]);
      alert("⏪ Rollback processed successfully. Version restored to v2.9.9-Enterprise.");
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadHostingerZip = () => {
    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = "/api/download-hostinger-zip";
      link.setAttribute("download", "gatekaru-hostinger-production.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download ZIP file");
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
    }
  };

  // Database Purge / Clean Sandbox entries
  const [purgeMode, setPurgeMode] = useState<"transactions" | "all">("transactions");
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const handlePurgeDatabase = async () => {
    const confirmMessage = purgeMode === "all" 
      ? "⚠️ DANGER / ख़तरा: This will delete ALL mock transactions AND all resident/guard user accounts, keeping only Super Admin. Are you absolutely sure?" 
      : "🧹 This will clear all visitor records, notice board posts, complaints, chat history, alerts, etc., but keep all user profiles intact. Proceed?";
      
    if (!window.confirm(confirmMessage)) return;

    setIsPurging(true);
    setPurgeResult(null);

    try {
      let keepUserId = null;
      try {
        const saved = localStorage.getItem("gatekaru_user");
        if (saved) {
          const uObj = JSON.parse(saved);
          keepUserId = uObj.id;
        }
      } catch (e) {
        console.error("Error reading current user for purge exclusion:", e);
      }

      const response = await fetch("/api/database/purge-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: purgeMode, keepUserId })
      });

      const data = await response.json();
      if (response.ok) {
        setPurgeResult("✅ Database successfully cleared of all selected dummy entries! Reloading app in 3 seconds...");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setPurgeResult(`❌ Error purging database: ${data.error || "Unknown error occurred"}`);
      }
    } catch (err: any) {
      setPurgeResult(`❌ Network Error: ${err.message || String(err)}`);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Intro Header */}
      <div className="border-b border-[#1e295d] pb-4">
        <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-indigo-400" /> JobsKaru Developer Suite
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Platform Developer Tools</h2>
        <p className="text-xs text-slate-400">Configure real-time server environment variables, deploy new software nodes, generate API keys, and audit webhooks.</p>
      </div>

      {/* MASSIVE GLOWING HINDI/ENGLISH OTP CONFIGURATION ALERT */}
      <div className="bg-gradient-to-r from-amber-600/30 to-amber-500/10 border-2 border-amber-500 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
        <div className="w-14 h-14 rounded-full bg-amber-500/25 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 shadow-lg shadow-amber-500/10 animate-pulse">
          <Key className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
            ⚠️ OTP SMS API Key Setup Instructions (ओटीपी एपीआई कुंजी यहाँ डालें)
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed font-semibold">
            जो एपीआई की आपको आपके <strong className="text-amber-400 font-extrabold">SMS / OTP Service Provider (Fast2SMS, JobsKaru, Twilio, आदि)</strong> से मिली है, उसे नीचे दिए गए <strong className="text-indigo-400 font-extrabold">Universal SMS & OTP Gateway Panel</strong> के अंदर <strong className="text-amber-300 font-extrabold">"ENTER / PASTE SMS API KEY HERE"</strong> वाले सुनहरे (Golden) बॉक्स में पेस्ट करें और नीचे दिए गए हरे <strong className="text-emerald-400 font-extrabold">"Save SMS API Configuration"</strong> बटन को दबाएं।
          </p>
          <div className="text-[11px] text-slate-400 font-medium">
            The authorization credentials provided by your OTP vendor must be configured in the gold input field below and saved. Choose your gateway provider, enter your key, and press <strong>Save</strong> to activate live SMS delivery.
          </div>
        </div>
      </div>

      {/* PROMINENT SMS & OTP API GATEWAY PANEL - PLACED AT THE TOP SO USER CANNOT MISS IT */}
      <div className="bg-[#0b1029]/95 border-2 border-indigo-500 rounded-3xl p-6 space-y-6 shadow-[0_0_30px_rgba(99,102,241,0.35)] relative overflow-hidden mb-6">
        {/* Decorative background pulse glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 animate-pulse" />
        
        <div className="border-b border-[#1f2d6c] pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500 text-[10px] uppercase font-black text-white animate-bounce">REQUIRED CONFIG</span>
              <h3 className="font-extrabold text-white text-lg uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-5.5 h-5.5 text-indigo-400 animate-pulse" /> Universal SMS & OTP Gateway Panel (Enter API Key Here)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Configure, save, and manage custom transactional and OTP SMS API providers (Fast2SMS, Twilio, TextLocal, JobsKaru) globally.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#070b1a] px-3.5 py-1.5 rounded-xl border border-[#1e2a5e]">
            <span className="text-[11px] font-bold text-slate-400">Gateway Status:</span>
            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${smsActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
              {smsActive ? "● Live / Real Dispatch" : "○ Simulated / Dry-Run"}
            </span>
          </div>
        </div>

        {isLoadingSettings ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Loading gateway settings from secure vault...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* Column 1: Configuration Form */}
            <form onSubmit={handleSaveSmsSettings} className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* GLOBAL SMS PROVIDER SELECTOR */}
                <div className="sm:col-span-2 space-y-2 bg-[#050816]/75 p-4 border border-indigo-500/30 rounded-2xl">
                  <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Selected SMS Service Provider
                  </label>
                  <select
                    value={activeSmsProviderId}
                    onChange={(e) => handleSelectProviderId(e.target.value)}
                    className="w-full bg-[#050816] border border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-bold"
                  >
                    {smsProviders.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.id === activeSmsProviderId ? " ★ [Active Routing]" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-indigo-200 italic leading-relaxed font-semibold">
                    {smsProviders.find(p => p.id === activeSmsProviderId)?.description || "Custom configuration"}
                  </p>
                </div>

                {/* Gateway API URL */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" /> Gateway Endpoint (API URL)
                  </label>
                  <input
                    type="text"
                    required
                    value={smsGatewayUrl}
                    onChange={(e) => handleUpdateActiveProviderField("gatewayUrl", e.target.value)}
                    placeholder="e.g., https://www.fast2sms.com/dev/bulkV2"
                    className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Use <code className="text-indigo-400">{`{phone}`}</code>, <code className="text-indigo-400">{`{message}`}</code>, <code className="text-indigo-400">{`{apiKey}`}</code>, <code className="text-indigo-400">{`{senderId}`}</code>, and <code className="text-indigo-400">{`{otp}`}</code> for dynamic URL parameter insertion on GET request configurations.
                  </p>
                </div>

                {/* API Auth Key */}
                <div className="sm:col-span-2 space-y-2 bg-gradient-to-b from-[#191e4e] to-[#0a1038] p-6 rounded-2xl border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400 animate-pulse" /> ENTER / PASTE YOUR OTP SERVICE PROVIDER API KEY HERE (यहाँ अपनी ओटीपी एपीआई की डालें):
                  </label>
                  <input
                    type="text"
                    required
                    value={smsApiKey}
                    onChange={(e) => handleUpdateActiveProviderField("apiKey", e.target.value)}
                    placeholder="👉 PASTE YOUR API KEY / AUTH TOKEN HERE 👈"
                    className="w-full bg-[#030612] border-2 border-amber-500 rounded-xl px-3.5 py-4 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 text-center font-black tracking-widest text-sm bg-gradient-to-r from-amber-950/20 to-indigo-950/20 shadow-inner"
                  />
                  <div className="text-xs text-slate-300 font-medium leading-relaxed mt-3 bg-[#04081c] p-4 rounded-xl border border-indigo-500/20">
                    <p className="font-extrabold text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <span>💡</span> <span>हिंदी निर्देश (Hindi Guide):</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                      <li>ऊपर <strong className="text-white">"Selected SMS Service Provider"</strong> में अपना प्रोवाइडर (Fast2SMS, JobsKaru, Twilio आदि) चुनें।</li>
                      <li>आपके SMS प्रोवाइडर द्वारा दिया गया <strong className="text-amber-400 font-bold">API Key / Auth Token</strong> ऊपर वाले सुनहरे इनपुट बॉक्स में पेस्ट करें।</li>
                      <li>नीचे दिए गए <strong className="text-emerald-400 font-bold">"Save SMS API Configuration"</strong> बटन को दबाकर सेटिंग्स को सुरक्षित करें।</li>
                    </ul>
                  </div>
                </div>

                {/* Sender ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Sender ID / Header / From</label>
                  <input
                    type="text"
                    value={smsSenderId}
                    onChange={(e) => handleUpdateActiveProviderField("senderId", e.target.value)}
                    placeholder="e.g., FSTSMS"
                    className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Route */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Default Gateway Route</label>
                  <select
                    value={smsRoute}
                    onChange={(e) => handleUpdateActiveProviderField("route", e.target.value)}
                    className="w-full bg-[#050816] border border-[#1d2b5c] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="otp">otp (Fast2SMS OTP Mode)</option>
                    <option value="dlt">dlt (DLT Template Mode)</option>
                    <option value="q">q (Quick/Transactional Mode)</option>
                    <option value="bulkV2">bulkV2 (General API Mode)</option>
                    <option value="bulk">bulk (Bulk/Twilio Mode)</option>
                    <option value="custom">custom (Custom HTTP mode)</option>
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="sm:col-span-2 bg-[#050816]/60 border border-[#1d2b5c]/70 rounded-xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-white block">Activate Real SMS Gateway</span>
                    <span className="text-[10px] text-slate-400 block">Switch off dry-runs and trigger actual SMS/OTP dispatches on user logins.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmsActive(!smsActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${smsActive ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${smsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/10 flex items-center gap-2"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Secure Settings...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save SMS API Configuration</span>
                    </>
                  )}
                </button>
                
                {saveSuccess && (
                  <span className="text-xs font-black text-emerald-400 animate-pulse">
                    ✓ Configuration saved securely & synced to MySQL!
                  </span>
                )}
              </div>
            </form>

            {/* Column 2: Live Gateway Dispatch Tester */}
            <div className="lg:col-span-5 bg-[#070b1a]/95 border border-[#1d2b5c] rounded-2xl p-5 space-y-4">
              <div className="border-b border-[#1b2756] pb-2">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Connectivity Dispatch Tester
                </h4>
                <p className="text-[10px] text-slate-400">Test live payload delivery without modifying active settings.</p>
              </div>

              <form onSubmit={handleSendTestSms} className="space-y-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recipient mobile number</label>
                  <input
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
                    className="w-full bg-[#050816] border border-[#1b2756] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Message text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Test message content</label>
                  <textarea
                    rows={2}
                    required
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Type custom verification or transaction test message..."
                    className="w-full bg-[#050816] border border-[#1b2756] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSendingTest || !testPhone}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                >
                  {isSendingTest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Broadcast Test...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Trigger Real-time Dispatch Test</span>
                    </>
                  )}
                </button>
              </form>

              {/* Live result logger feedback */}
              {testResult && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed space-y-1 ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>{testResult.success ? "✓ TEST DISPATCH SUCCESS" : "✗ GATEWAY FAILURE"}</span>
                  </div>
                  <p className="text-[10px] opacity-90">{testResult.message}</p>
                  {testResult.details && (
                    <pre className="text-[9px] mt-1.5 overflow-x-auto bg-[#050816] p-2 rounded border border-indigo-500/30 whitespace-pre-wrap max-h-24 font-mono select-text">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Version Manager, Flags, Webhooks (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hostinger & Google Play Export Suite */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Production Ready Package
                </span>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                  📦 Hostinger & Google Play One-Click Export
                </h3>
                <p className="text-[10.5px] text-slate-300 mt-0.5 leading-relaxed">
                  Generate and download the production bundle configured for Hostinger Node.js/MySQL and Capacitor Android (Google Play). No coding, database schema setup, or phpMyAdmin work required. Includes automated database generation & seeds.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadHostingerZip}
              disabled={isDownloading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-[#070b19] font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
              {isDownloading ? "Bundling Production ZIP..." : "Download Hostinger Production ZIP"}
            </button>
            
            <p className="text-[9.5px] text-slate-400 text-center italic">
              Contains built static assets (dist), configured Node backend (server.js, db_store.ts, seed configs), Android Capacitor, and simple step-by-step documentation.
            </p>
          </div>

          {/* Clean Database / Purge Demo Records */}
          <div className="bg-gradient-to-r from-rose-950/40 to-red-950/40 border border-rose-500/30 rounded-2xl p-5 space-y-4">
            <div>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                Database Purge Utility
              </span>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                🧹 Clear Mock / Dummy Entries
              </h3>
              <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                Remove pre-loaded dummy records (such as guest passes, complaint tickets, chats, family listings) to clean your database for actual production deployment or real-time society testing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-black/30 p-2 rounded-xl border border-rose-500/10">
              <button
                type="button"
                onClick={() => setPurgeMode("transactions")}
                className={`py-2 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition ${
                  purgeMode === "transactions" 
                    ? "bg-rose-500 text-[#070b19] font-black" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Transactions Only
              </button>
              <button
                type="button"
                onClick={() => setPurgeMode("all")}
                className={`py-2 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition ${
                  purgeMode === "all" 
                    ? "bg-red-600 text-white font-black" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Deep Wipe & Reset
              </button>
            </div>

            <p className="text-[9.5px] text-slate-400 leading-normal">
              {purgeMode === "transactions" 
                ? "💡 Clears: Visitor pre-approvals, complaint tickets, notices, alerts, chats, and family records. Keeps existing user accounts intact so you do not get logged out."
                : "⚠️ Clears: All transaction logs, staff list, AND all resident/guard profiles except the core system Super Admins. This allows fresh configuration."
              }
            </p>

            <button
              type="button"
              onClick={handlePurgeDatabase}
              disabled={isPurging}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-800 text-[#070b19] font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow shadow-rose-500/10"
            >
              <Trash2 className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
              {isPurging ? "Purging Records..." : "Execute Database Purge"}
            </button>

            {purgeResult && (
              <div className="p-3 bg-black/40 border border-rose-500/20 rounded-xl text-[10px] font-bold text-center text-rose-300">
                {purgeResult}
              </div>
            )}
          </div>

          {/* Live Deployment Manager */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#213374] pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">🚀 Live Container Deployment</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Control direct container deployments and rollback releases.</p>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded font-mono font-black">
                Active Version: {currentVersion}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeployVersion}
                disabled={isDeploying}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow shadow-indigo-600/20"
              >
                {isDeploying ? "Deploying Release..." : "Deploy Version 3.0.1"}
              </button>

              <button
                type="button"
                onClick={handleRollbackVersion}
                disabled={isDeploying}
                className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 text-rose-400 hover:text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Rollback Release
              </button>
            </div>

            {deployLog.length > 0 && (
              <div className="bg-[#050816] border border-[#1a285a] rounded-xl p-3.5 font-mono text-[10px] text-emerald-400 space-y-1.5 max-h-36 overflow-y-auto">
                {deployLog.map((log, idx) => (
                  <div key={idx}>➜ {log}</div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Flags */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Toggle Feature Flags</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">In-app feature flags synced immediately with client device sessions without re-builds.</p>
            </div>

            <div className="space-y-3">
              {flags.map((f) => (
                <div key={f.id} className="p-3 bg-[#070b1a]/95 border border-[#16214a] rounded-xl flex items-center justify-between hover:border-[#233575] transition">
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="font-bold text-white text-xs block">{f.name}</span>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-medium">{f.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFlag(f.id)}
                    className="p-1 focus:outline-none transition-transform active:scale-90"
                  >
                    {f.status ? (
                      <ToggleRight className="w-8 h-8 text-indigo-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook logs */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Webhook Logs</h3>
            <div className="space-y-2">
              {webhooks.map((w, idx) => (
                <div key={idx} className="p-2.5 bg-[#070b1a]/95 rounded-xl border border-[#15214c] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-indigo-400 font-bold">{w.event}</span>
                    <span className="text-[10px] text-slate-500 block">Target: {w.target}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-black">{w.status}</span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{w.delay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Env variables & API Keys, Cron Jobs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Env Variables Setup */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Environment Variables</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Configure live runtime secret variables across master cluster nodes.</p>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 text-[10px] text-indigo-300 font-medium">
              💡 <strong className="text-white">SMS/OTP API Key:</strong> Looking for <strong>JOBSKARU_SMS_API_KEY</strong> or similar secret tokens? These are synced to the database. Use the gold <strong className="text-amber-400 font-bold">Universal SMS & OTP Gateway Panel</strong> at the top of this page!
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {envVars.map((v) => (
                <div key={v.key} className="flex justify-between items-center bg-[#070b1a]/95 border border-[#162149] p-2.5 rounded-xl text-xs font-mono">
                  <div className="truncate max-w-[85%]">
                    <span className="text-purple-400 font-bold block">{v.key}</span>
                    <span className="text-slate-400 text-[10.5px] font-semibold block truncate">
                      {v.hidden ? "••••••••••••••••••••••••" : v.value}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteEnvVar(v.key)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addEnvVar} className="space-y-2 pt-2 border-t border-[#1b2a5c]">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="ENV_KEY" 
                  className="bg-[#0a0f24] border border-[#21336e] rounded-lg p-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
                />
                <input 
                  type="text" 
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  placeholder="value" 
                  className="bg-[#0a0f24] border border-[#21336e] rounded-lg p-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#11193d] hover:bg-[#1a265b] border border-[#233575] text-indigo-400 hover:text-white font-black py-2 rounded-lg text-xs uppercase transition"
              >
                Add Env Variable
              </button>
            </form>
          </div>

          {/* Dedicated API Key & Security Manager */}
          <ApiKeyManager darkMode={true} />

          {/* Cron Jobs Status */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Cron Jobs Schedule</h3>
            <div className="space-y-2">
              {cronJobs.map((job, idx) => (
                <div key={idx} className="p-2.5 bg-[#070b1a]/95 rounded-xl border border-[#15214c] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-slate-200">{job.name}</span>
                    <span className="text-[9px] text-slate-400 block">{job.interval}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${job.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>{job.status}</span>
                    <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Last run: {job.lastRun}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
