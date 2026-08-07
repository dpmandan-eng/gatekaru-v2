import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Plus,
  Lock,
  Globe,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  Filter,
  Terminal,
  Zap,
  Sliders,
  CheckCircle2,
  X,
  Edit2,
  Activity,
  Layers
} from "lucide-react";

export interface ApiKeyScope {
  id: string;
  name: string;
  category: "Gate Access" | "Visitors" | "Residents" | "Finance" | "SOS & Security" | "Admin";
  description: string;
}

export const AVAILABLE_SCOPES: ApiKeyScope[] = [
  // Gate Access
  { id: "read:gate_access", name: "Read Gate Telemetry", category: "Gate Access", description: "Query gate entry logs, RFID barrier states, and guard activity" },
  { id: "write:gate_barrier", name: "Trigger Gate Barrier", category: "Gate Access", description: "Send automated open/close signals to smart boom barriers" },
  { id: "execute:emergency_lockdown", name: "Initiate Gate Lockdown", category: "Gate Access", description: "Trigger site-wide perimeter gate lockdown in emergencies" },

  // Visitors
  { id: "read:visitors", name: "Read Visitor Records", category: "Visitors", description: "Fetch guest check-in logs, delivery passes, and cabs" },
  { id: "write:visitor_pass", name: "Issue Digital Visitor Pass", category: "Visitors", description: "Generate QR codes and pre-approval digital passes for guests" },
  { id: "revoke:visitor_approval", name: "Revoke Visitor Pass", category: "Visitors", description: "Blacklist or invalidate active visitor entry authorization" },

  // Residents
  { id: "read:residents", name: "Read Resident Directory", category: "Residents", description: "Fetch flat numbers, owner contact info, and family members" },
  { id: "write:resident_record", name: "Update Resident Data", category: "Residents", description: "Register new tenants, update contact details and parking slots" },

  // Finance
  { id: "read:ledger_transactions", name: "Read Maintenance Ledgers", category: "Finance", description: "View society dues, payment histories, and vendor invoices" },
  { id: "write:payment_webhook", name: "Execute Payment Webhook", category: "Finance", description: "Process automated payment settlements from UPI / Razorpay gateways" },

  // SOS & Security
  { id: "read:sos_alerts", name: "Read Live SOS Feeds", category: "SOS & Security", description: "Listen to real-time emergency broadcasts and panic button triggers" },
  { id: "trigger:emergency_broadcast", name: "Dispatch SOS Broadcast", category: "SOS & Security", description: "Trigger SMS/Push alerts to society security staff and residents" },

  // Admin
  { id: "admin:full_access", name: "Master Admin Permission", category: "Admin", description: "Unrestricted read and write access across all GateKaru ERP APIs" }
];

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string; // e.g. gk_live_9a4f
  secretKey?: string; // Full key (only visible upon creation)
  environment: "Production" | "Staging" | "Development";
  scopes: string[]; // Scope IDs
  ipWhitelist?: string;
  rateLimit: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  status: "Active" | "Rotated" | "Revoked";
  createdBy: string;
  requestCountMonth: number;
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: "key_101",
    name: "Main Gate RTSP & RFID Scanner Gateway",
    prefix: "gk_live_8f3a",
    environment: "Production",
    scopes: ["read:gate_access", "write:gate_barrier", "read:visitors"],
    ipWhitelist: "192.168.1.15, 10.42.0.1",
    rateLimit: "10,000 req/min",
    createdAt: "2026-01-15",
    lastUsedAt: "2 mins ago",
    expiresAt: "2027-01-15",
    status: "Active",
    createdBy: "Super Admin (dpmandan@gmail.com)",
    requestCountMonth: 482150
  },
  {
    id: "key_102",
    name: "Razorpay / UPI Payment Webhook Collector",
    prefix: "gk_live_7c2b",
    environment: "Production",
    scopes: ["read:ledger_transactions", "write:payment_webhook"],
    ipWhitelist: "52.66.101.42 (Razorpay IP)",
    rateLimit: "1,000 req/min",
    createdAt: "2026-03-01",
    lastUsedAt: "1 hour ago",
    expiresAt: "Never",
    status: "Active",
    createdBy: "Aarav Sharma (RWA Admin)",
    requestCountMonth: 12490
  },
  {
    id: "key_103",
    name: "Resident iOS/Android Mobile App SDK Token",
    prefix: "gk_live_3e91",
    environment: "Production",
    scopes: ["read:residents", "write:visitor_pass", "read:sos_alerts", "trigger:emergency_broadcast"],
    ipWhitelist: "0.0.0.0/0 (Global Mobile SDK)",
    rateLimit: "50,000 req/min",
    createdAt: "2026-02-10",
    lastUsedAt: "Active Now",
    expiresAt: "2027-02-10",
    status: "Active",
    createdBy: "Super Admin (dpmandan@gmail.com)",
    requestCountMonth: 890420
  },
  {
    id: "key_104",
    name: "Legacy Guard Terminal Node (Deprecated)",
    prefix: "gk_test_1b82",
    environment: "Staging",
    scopes: ["read:visitors"],
    ipWhitelist: "192.168.1.99",
    rateLimit: "500 req/min",
    createdAt: "2025-11-20",
    lastUsedAt: "14 days ago",
    expiresAt: "Expired (2026-05-01)",
    status: "Revoked",
    createdBy: "Dev Ops Team",
    requestCountMonth: 0
  }
];

interface ApiKeyManagerProps {
  darkMode?: boolean;
}

export default function ApiKeyManager({ darkMode = true }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);
  const [searchQuery, setSearchQuery] = useState("");
  const [envFilter, setEnvFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<ApiKeyItem["environment"]>("Production");
  const [newKeyExpiry, setNewKeyExpiry] = useState("1 Year");
  const [newKeyIp, setNewKeyIp] = useState("");
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("10,000 req/min");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "read:gate_access",
    "read:visitors"
  ]);

  // Newly Created Secret Modal
  const [createdSecretModal, setCreatedSecretModal] = useState<{
    name: string;
    secretKey: string;
    prefix: string;
  } | null>(null);

  // Edit Scopes Modal
  const [editingKey, setEditingKey] = useState<ApiKeyItem | null>(null);

  // Test API Key Sandbox State
  const [testKeyInput, setTestKeyInput] = useState("");
  const [testEndpoint, setTestEndpoint] = useState("read:gate_access");
  const [testResult, setTestResult] = useState<{
    authorized: boolean;
    keyName?: string;
    message: string;
    scopeMatched?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`📋 Copied ${label} to clipboard securely!`);
  };

  // Scope toggle helper
  const handleToggleScope = (scopeId: string) => {
    if (scopeId === "admin:full_access") {
      if (selectedScopes.includes("admin:full_access")) {
        setSelectedScopes([]);
      } else {
        setSelectedScopes(AVAILABLE_SCOPES.map(s => s.id));
      }
      return;
    }

    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(prev => prev.filter(s => s !== scopeId && s !== "admin:full_access"));
    } else {
      setSelectedScopes(prev => [...prev, scopeId]);
    }
  };

  // Generate new API Key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast("⚠️ Please enter a descriptive name for your API key.");
      return;
    }
    if (selectedScopes.length === 0) {
      showToast("⚠️ Select at least one scope permission for the API key.");
      return;
    }

    // Generate random secret key token
    const randomHex1 = Math.random().toString(36).substring(2, 10);
    const randomHex2 = Math.random().toString(36).substring(2, 10);
    const randomHex3 = Math.random().toString(36).substring(2, 10);
    const envPrefix = newKeyEnv === "Production" ? "gk_live" : "gk_test";
    const prefix = `${envPrefix}_${randomHex1.substring(0, 4)}`;
    const fullSecret = `${prefix}_sec_${randomHex1}${randomHex2}${randomHex3}`;

    let expDate = "Never";
    if (newKeyExpiry === "30 Days") {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      expDate = d.toISOString().split("T")[0];
    } else if (newKeyExpiry === "90 Days") {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      expDate = d.toISOString().split("T")[0];
    } else if (newKeyExpiry === "1 Year") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      expDate = d.toISOString().split("T")[0];
    }

    const newKeyObj: ApiKeyItem = {
      id: `key_${Math.floor(Math.random() * 900) + 100}`,
      name: newKeyName,
      prefix: prefix,
      secretKey: fullSecret,
      environment: newKeyEnv,
      scopes: selectedScopes,
      ipWhitelist: newKeyIp.trim() || "0.0.0.0/0 (Global Access)",
      rateLimit: newKeyRateLimit,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsedAt: "Never used yet",
      expiresAt: expDate,
      status: "Active",
      createdBy: "Super Admin (dpmandan@gmail.com)",
      requestCountMonth: 0
    };

    setApiKeys([newKeyObj, ...apiKeys]);
    setIsGenerateModalOpen(false);
    setCreatedSecretModal({
      name: newKeyName,
      prefix: prefix,
      secretKey: fullSecret
    });

    // Reset Form
    setNewKeyName("");
    setNewKeyIp("");
    setSelectedScopes(["read:gate_access", "read:visitors"]);
    showToast(`🔑 API Key "${newKeyName}" successfully provisioned with ${selectedScopes.length} granular scopes.`);
  };

  // Rotate Key Secret
  const handleRotateKey = (keyId: string) => {
    const targetKey = apiKeys.find(k => k.id === keyId);
    if (!targetKey) return;

    if (!confirm(`Are you sure you want to ROTATE the API Key for "${targetKey.name}"?\n\nThe current token prefix (${targetKey.prefix}) will be immediately invalidated and replaced with a new secret key token. Modern API integrations will require the new token.`)) {
      return;
    }

    const randomHex1 = Math.random().toString(36).substring(2, 10);
    const randomHex2 = Math.random().toString(36).substring(2, 10);
    const envPrefix = targetKey.environment === "Production" ? "gk_live" : "gk_test";
    const newPrefix = `${envPrefix}_${randomHex1.substring(0, 4)}`;
    const newFullSecret = `${newPrefix}_sec_${randomHex1}${randomHex2}`;

    setApiKeys(prev =>
      prev.map(k => {
        if (k.id === keyId) {
          return {
            ...k,
            prefix: newPrefix,
            secretKey: newFullSecret,
            lastUsedAt: "Rotated just now",
            status: "Active"
          };
        }
        return k;
      })
    );

    setCreatedSecretModal({
      name: `${targetKey.name} (ROTATED KEY)`,
      prefix: newPrefix,
      secretKey: newFullSecret
    });

    showToast(`🔄 KEY ROTATION COMPLETE: Invalidated old token for "${targetKey.name}". New token generated.`);
  };

  // Revoke Key
  const handleRevokeKey = (keyId: string) => {
    const targetKey = apiKeys.find(k => k.id === keyId);
    if (!targetKey) return;

    if (!confirm(`REVOKE AUTHORIZATION: Do you want to forcibly revoke "${targetKey.name}"?\n\nThis will permanently prevent all HTTP requests carrying bearer prefix ${targetKey.prefix} from reaching GateKaru ERP services.`)) {
      return;
    }

    setApiKeys(prev =>
      prev.map(k => {
        if (k.id === keyId) {
          return { ...k, status: "Revoked" };
        }
        return k;
      })
    );

    showToast(`🚫 REVOKED: API Key "${targetKey.name}" (${targetKey.prefix}) permanently invalidated.`);
  };

  // Save updated scopes
  const handleSaveUpdatedScopes = () => {
    if (!editingKey) return;

    setApiKeys(prev =>
      prev.map(k => {
        if (k.id === editingKey.id) {
          return { ...k, scopes: editingKey.scopes };
        }
        return k;
      })
    );

    showToast(`✏️ Updated scope permissions for "${editingKey.name}".`);
    setEditingKey(null);
  };

  // Run Test Key Authorization Sandbox
  const handleTestApiKeySandbox = () => {
    if (!testKeyInput.trim()) {
      setTestResult({
        authorized: false,
        message: "❌ Verification Failed: Please enter an API key or prefix token to evaluate."
      });
      return;
    }

    const cleanInput = testKeyInput.trim();
    // Find matching key by prefix or secret
    const matchedKey = apiKeys.find(k =>
      k.prefix.toLowerCase() === cleanInput.toLowerCase() ||
      (k.secretKey && k.secretKey.toLowerCase() === cleanInput.toLowerCase()) ||
      cleanInput.toLowerCase().startsWith(k.prefix.toLowerCase())
    );

    if (!matchedKey) {
      setTestResult({
        authorized: false,
        message: "❌ 401 Unauthorized: Invalid API Token. No matching credentials found in security vault."
      });
      return;
    }

    if (matchedKey.status === "Revoked") {
      setTestResult({
        authorized: false,
        keyName: matchedKey.name,
        message: `🚫 403 Forbidden: API Key "${matchedKey.name}" was REVOKED. Request rejected by gateway authentication filter.`
      });
      return;
    }

    const hasScope = matchedKey.scopes.includes(testEndpoint) || matchedKey.scopes.includes("admin:full_access");

    if (hasScope) {
      setTestResult({
        authorized: true,
        keyName: matchedKey.name,
        scopeMatched: testEndpoint,
        message: `✅ 200 OK Authorized: Access GRANTED for "${matchedKey.name}" [Environment: ${matchedKey.environment}]. Endpoint scope '${testEndpoint}' is verified.`
      });
    } else {
      setTestResult({
        authorized: false,
        keyName: matchedKey.name,
        scopeMatched: testEndpoint,
        message: `⚠️ 403 Insufficient Scope: API Key "${matchedKey.name}" is active, but lacks scope '${testEndpoint}'. Request blocked by fine-grained security rules.`
      });
    }
  };

  // Filter keys
  const filteredKeys = apiKeys.filter(k => {
    const matchesQuery =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.ipWhitelist?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEnv = envFilter === "All" || k.environment === envFilter;
    const matchesStatus = statusFilter === "All" || k.status === statusFilter;

    return matchesQuery && matchesEnv && matchesStatus;
  });

  const cardBg = darkMode
    ? "bg-[#0b1029]/95 border border-[#1e2a5e] text-white shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-md";

  return (
    <div className={`${cardBg} rounded-2xl p-5 space-y-6 select-none relative transition-all`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-indigo-950/95 border border-indigo-500/70 text-indigo-100 text-xs font-bold p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-2xl z-50 fixed top-6 right-6 max-w-md"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#1f2a58] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Key className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Security Center • API Scope & Governance Hub (एपीआई सुरक्षा केंद्र)
            </span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            Granular API Key Management & Token Lifecycle
          </h2>
          <p className="text-xs text-slate-400">
            Generate, rotate, scope-limit, and audit external API tokens for RTSP relays, payment webhooks, guard tablets, and resident SDKs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGenerateModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border border-indigo-400/50 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Security Telemetry Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-indigo-400" /> Active API Keys
          </span>
          <p className="text-lg font-black text-white font-mono">
            {apiKeys.filter(k => k.status === "Active").length} Provisioned
          </p>
          <p className="text-[9.5px] text-emerald-400">100% Granular Scoped</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Monthly API Traffic
          </span>
          <p className="text-lg font-black text-amber-300 font-mono">
            {(apiKeys.reduce((acc, k) => acc + k.requestCountMonth, 0) / 1000000).toFixed(2)}M Calls
          </p>
          <p className="text-[9.5px] text-slate-500">Avg 14ms latency</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Revoked Keys
          </span>
          <p className="text-lg font-black text-rose-300 font-mono">
            {apiKeys.filter(k => k.status === "Revoked").length} Invalidated
          </p>
          <p className="text-[9.5px] text-slate-500">Access tokens destroyed</p>
        </div>

        <div className="bg-[#070b1a] border border-[#172552] p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Defined Scopes
          </span>
          <p className="text-lg font-black text-purple-300 font-mono">
            {AVAILABLE_SCOPES.length} Permissions
          </p>
          <p className="text-[9.5px] text-slate-500">Zero hardcoded access</p>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-[#070b1a] border border-[#192756] p-3 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search API Key Name, Prefix Token, Creator..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={envFilter}
            onChange={e => setEnvFilter(e.target.value)}
            className="bg-[#030612] border border-[#1e2a5e] text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All Environments</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Development">Development</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#030612] border border-[#1e2a5e] text-xs font-bold text-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Revoked">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* API Key Items List */}
      <div className="space-y-4">
        {filteredKeys.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-[#060a19] border border-[#182654] rounded-xl">
            No API keys match your criteria. Click "Generate New API Key" to provision one.
          </div>
        ) : (
          filteredKeys.map(item => {
            const isRevoked = item.status === "Revoked";
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition space-y-3 shadow-xl ${
                  isRevoked
                    ? "bg-[#080b18]/60 border-rose-900/40 opacity-75"
                    : "bg-[#060a19] border-[#182654] hover:border-indigo-500/50"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-white">{item.name}</span>
                      
                      <span
                        className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                          item.environment === "Production"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {item.environment}
                      </span>

                      <span
                        className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                          isRevoked
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">Prefix Token:</span>
                      <code className="bg-[#030612] px-2 py-0.5 rounded border border-[#192756] text-amber-300 font-extrabold">
                        {item.prefix}••••••••••••
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.prefix, "Token Prefix")}
                        className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
                        title="Copy Prefix Token"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                    {!isRevoked && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingKey(item)}
                          className="bg-[#121c45] hover:bg-[#1c2c6d] text-indigo-200 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#283c85] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit Scopes
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRotateKey(item.id)}
                          className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-amber-500/40 transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Generate new secret token and invalidate old token"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Rotate Secret
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRevokeKey(item.id)}
                          className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-rose-500/40 transition flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Scope badges section */}
                <div className="bg-[#030612] p-2.5 rounded-xl border border-[#121f47] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase font-extrabold text-slate-400">
                    <span>Authorized Scopes ({item.scopes.length})</span>
                    <span>Rate Limit: {item.rateLimit}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.scopes.map(sId => {
                      const scopeObj = AVAILABLE_SCOPES.find(s => s.id === sId);
                      return (
                        <span
                          key={sId}
                          className="text-[10px] bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-lg font-mono flex items-center gap-1"
                        >
                          <Lock className="w-2.5 h-2.5 text-indigo-400" />
                          {scopeObj ? scopeObj.name : sId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Telemetry info footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono border-t border-[#142045] pt-2">
                  <div className="flex items-center gap-3">
                    <span>IP Whitelist: <strong className="text-slate-300">{item.ipWhitelist}</strong></span>
                    <span>Created: {item.createdAt}</span>
                    <span>Expires: {item.expiresAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Last Active: <strong className="text-emerald-400">{item.lastUsedAt}</strong></span>
                    <span>({item.requestCountMonth.toLocaleString()} calls/mo)</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live API Key Authorization Tester Sandbox */}
      <div className="bg-[#050816] border border-[#18285a] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
            Live API Key Authorization Testing Sandbox
          </h3>
        </div>

        <p className="text-[11px] text-slate-400">
          Simulate authorization requests against GateKaru security endpoints using your provisioned key tokens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-5">
            <input
              type="text"
              placeholder="Paste Token Prefix (e.g. gk_live_8f3a) or Secret Key..."
              value={testKeyInput}
              onChange={e => setTestKeyInput(e.target.value)}
              className="w-full bg-[#02040a] border border-[#1d2a5d] rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-5">
            <select
              value={testEndpoint}
              onChange={e => setTestEndpoint(e.target.value)}
              className="w-full bg-[#02040a] border border-[#1d2a5d] rounded-xl px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
            >
              {AVAILABLE_SCOPES.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.category}] {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleTestApiKeySandbox}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition cursor-pointer active:scale-95"
            >
              Test Scope
            </button>
          </div>
        </div>

        {/* Sandbox evaluation result */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
              testResult.authorized
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/40 border-rose-500/50 text-rose-200"
            }`}
          >
            <p className="font-bold">{testResult.message}</p>
          </div>
        )}
      </div>

      {/* MODAL: Generate API Key */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1029] border border-[#233575] text-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-[#1c2a5c] pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-base">Provision New Scoped API Key</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateApiKey} className="space-y-4">
                {/* Key Name & Env */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">API Key Label / Service Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Gate 2 RTSP Camera Relay"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Environment Partition</label>
                    <select
                      value={newKeyEnv}
                      onChange={e => setNewKeyEnv(e.target.value as any)}
                      className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl px-3 py-2 text-xs text-indigo-300 font-bold focus:outline-none"
                    >
                      <option value="Production">Production (Live Traffic)</option>
                      <option value="Staging">Staging (Testing)</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>
                </div>

                {/* Expiry & Rate Limit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Key Expiration Period</label>
                    <select
                      value={newKeyExpiry}
                      onChange={e => setNewKeyExpiry(e.target.value)}
                      className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="30 Days">30 Days</option>
                      <option value="90 Days">90 Days</option>
                      <option value="1 Year">1 Year (Recommended)</option>
                      <option value="Never">Never Expire</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">IP Origin Restriction (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.15, 10.42.0.1"
                      value={newKeyIp}
                      onChange={e => setNewKeyIp(e.target.value)}
                      className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Fine-grained Scope Selection Matrix */}
                <div className="space-y-2 pt-2 border-t border-[#1a2858]">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                      Fine-Grained Scope Permissions ({selectedScopes.length} Selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleScope("admin:full_access")}
                      className="text-[10px] text-indigo-300 hover:underline font-extrabold cursor-pointer"
                    >
                      {selectedScopes.includes("admin:full_access") ? "Deselect All" : "Select Master Access"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {AVAILABLE_SCOPES.map(scope => {
                      const isChecked = selectedScopes.includes(scope.id);
                      return (
                        <div
                          key={scope.id}
                          onClick={() => handleToggleScope(scope.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                            isChecked
                              ? "bg-indigo-950/80 border-indigo-500/70 text-white"
                              : "bg-[#040714] border-[#15234d] text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 accent-indigo-500 rounded cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                              <span>{scope.name}</span>
                              <span className="text-[9px] font-mono text-indigo-400">({scope.id})</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">{scope.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#1c2a5c]">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    Generate API Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Newly Created Secret Key Reveal (Show Once) */}
      <AnimatePresence>
        {createdSecretModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0b1029] border-2 border-amber-500/80 text-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-amber-400 animate-bounce" />
                  <h3 className="font-black text-lg text-white">Save Your API Secret Key</h3>
                </div>
                <p className="text-xs text-amber-200">
                  This secret key token will <strong>NEVER be displayed again</strong>. Copy and save it securely in your server configuration file.
                </p>
              </div>

              <div className="bg-[#03050f] p-4 rounded-xl border border-amber-500/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-amber-400">
                  {createdSecretModal.name}
                </span>

                <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 font-bold overflow-x-auto gap-2">
                  <span className="truncate">{createdSecretModal.secretKey}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdSecretModal.secretKey, "API Secret Key")}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-md transition shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Key
                  </button>
                </div>
              </div>

              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 text-[11px] text-amber-200 space-y-1">
                <p className="font-bold">🔒 Security Best Practices:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-amber-300">
                  <li>Never commit this secret key to public Git repositories.</li>
                  <li>Store in environment variable <code>GATEKARU_API_KEY</code>.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCreatedSecretModal(null)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg"
                >
                  I Have Secured My Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Edit Scopes */}
      <AnimatePresence>
        {editingKey && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1029] border border-[#233575] text-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-[#1c2a5c] pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-black text-base text-white">Modify API Scopes</h3>
                  <p className="text-xs text-slate-400">{editingKey.name} ({editingKey.prefix})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Check or Uncheck Scopes:
                </label>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {AVAILABLE_SCOPES.map(scope => {
                    const isChecked = editingKey.scopes.includes(scope.id);
                    return (
                      <div
                        key={scope.id}
                        onClick={() => {
                          const updated = isChecked
                            ? editingKey.scopes.filter(s => s !== scope.id)
                            : [...editingKey.scopes, scope.id];
                          setEditingKey({ ...editingKey, scopes: updated });
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                          isChecked
                            ? "bg-indigo-950/80 border-indigo-500/70 text-white"
                            : "bg-[#040714] border-[#15234d] text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 accent-indigo-500 rounded cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                            <span>{scope.name}</span>
                            <span className="text-[9px] font-mono text-indigo-400">({scope.id})</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{scope.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1c2a5c]">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUpdatedScopes}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Save Scope Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
