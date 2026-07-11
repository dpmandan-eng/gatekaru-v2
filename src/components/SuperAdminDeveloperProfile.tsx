import React, { useState } from "react";
import { 
  User, Mail, Shield, ShieldCheck, Terminal, Cpu, Clock, Key, Plus, Trash2, 
  Check, Copy, Database, Code, Eye, RefreshCw, Smartphone, Laptop, Globe
} from "lucide-react";

interface SshKey {
  id: string;
  label: string;
  key: string;
  addedAt: string;
}

interface DeveloperSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  activeSince: string;
  status: "Active" | "Expired";
}

export default function SuperAdminDeveloperProfile() {
  // Developer Profile info
  const [devInfo, setDevInfo] = useState({
    name: "JobsKaru Dev Operator",
    email: "dpmandan@gmail.com",
    role: "Lead Systems Architect & Principal Operator",
    clearance: "Level 4 (Full Root & Node Ingress Control)",
    bio: "Supervising deployment cluster for Greenwood Heights, Palm Heights Phase II, Royal Orchids Estate, and the unified Indian multi-tenant gate control systems.",
    avatarBg: "from-indigo-600 via-purple-600 to-pink-600",
    nodeRegion: "Asia-Southeast (Mumbai / Delhi Cluster)",
    github: "github.com/jobskaru-operator"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(devInfo.name);
  const [editedEmail, setEditedEmail] = useState(devInfo.email);
  const [editedBio, setEditedBio] = useState(devInfo.bio);
  const [editedRegion, setEditedRegion] = useState(devInfo.nodeRegion);

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // SSH Keys Registry
  const [sshKeys, setSshKeys] = useState<SshKey[]>([
    {
      id: "ssh-1",
      label: "JobsKaru Macbook Pro (Main Workstation)",
      key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQz/C9y9bJ7VjPz7D3... operator@jobskaru",
      addedAt: "2026-06-15"
    },
    {
      id: "ssh-2",
      label: "Secure Cloud Run Production Deployer Hook",
      key: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIInp3LgO9Xq9oYv177Z9... cloud-deployer@google",
      addedAt: "2026-07-01"
    }
  ]);

  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showAddKey, setShowAddKey] = useState(false);

  // Active Developer Sessions
  const [sessions, setSessions] = useState<DeveloperSession[]>([
    {
      id: "sess-1",
      device: "Google Chrome (macOS Sequoia)",
      ip: "103.241.12.98 (Current Session)",
      location: "Delhi NCR, India",
      activeSince: "2026-07-10 07:47 AM",
      status: "Active"
    },
    {
      id: "sess-2",
      device: "Capacitor Mobile Shell (Android 14)",
      ip: "103.241.12.99",
      location: "Delhi NCR, India",
      activeSince: "2026-07-09 11:22 PM",
      status: "Active"
    },
    {
      id: "sess-3",
      device: "Ubuntu Server SSH Console (Port 22)",
      ip: "10.42.0.1",
      location: "Cloud Cluster VPC Interceptor",
      activeSince: "2026-07-08 03:10 PM",
      status: "Expired"
    }
  ]);

  // Access Logs Specific to this Developer Profile
  const [accessLogs] = useState([
    { id: "AL-101", time: "07:54 AM", action: "Configured JOBSKARU_SMS_API_GATEWAY URL payload", ip: "103.241.12.98", status: "AUTHORIZED" },
    { id: "AL-100", time: "07:48 AM", action: "Saved SMS Service Provider config & enabled gateway relay", ip: "103.241.12.98", status: "AUTHORIZED" },
    { id: "AL-099", time: "07:12 AM", action: "Triggered cloud DB snapshot backup request 'snap-manual'", ip: "103.241.12.98", status: "AUTHORIZED" },
    { id: "AL-098", time: "06:40 AM", action: "Decoupled expired session cookie from terminal node TA-1", ip: "103.241.12.98", status: "AUTHORIZED" }
  ]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setDevInfo(prev => ({
      ...prev,
      name: editedName,
      email: editedEmail,
      bio: editedBio,
      nodeRegion: editedRegion
    }));
    setIsEditing(false);
    alert("✨ Developer Profile updated successfully across GateKaru cloud nodes!");
  };

  const handleAddSshKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel || !newKeyValue) return;
    setSshKeys(prev => [
      ...prev,
      {
        id: `ssh-${Date.now()}`,
        label: newKeyLabel,
        key: newKeyValue,
        addedAt: new Date().toISOString().split("T")[0]
      }
    ]);
    setNewKeyLabel("");
    setNewKeyValue("");
    setShowAddKey(false);
    alert("🔑 Public SSH security credentials successfully registered to authorize direct remote container handshakes!");
  };

  const handleDeleteSshKey = (id: string) => {
    setSshKeys(prev => prev.filter(k => k.id !== id));
    alert("🗑️ SSH Key deleted. Remote terminal handshake access revoked for this target.");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  return (
    <div id="super-admin-developer-profile" className="space-y-6 animate-fadeIn">
      
      {/* Header section with status */}
      <div className="border-b border-[#1e295d] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-400" /> Platform Operator Profile
          </span>
          <h2 className="text-2xl font-black text-white mt-1">SuperAdmin Developer Profile</h2>
          <p className="text-xs text-slate-400">View and update system credentials, registered public SSH keys, active sessions, and clearance level logs.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0c133a] border border-[#1d2963] px-4 py-2.5 rounded-2xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="font-mono text-xs">
            <p className="text-slate-400 font-bold">Node Access Level</p>
            <p className="text-emerald-400 font-extrabold tracking-wide uppercase">ROOT ADMINISTRATOR</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Profile card & editing form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Profile Info Card */}
          <div className="bg-[#0b1029]/80 border-2 border-[#1e2a5e] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            {/* Background glowing gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              {/* Profile Avatar with linear gradient */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${devInfo.avatarBg} flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 border-2 border-indigo-400/30 font-black text-3xl tracking-wider uppercase`}>
                {devInfo.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-wide">{devInfo.name}</h3>
                  <span className="inline-flex items-center gap-1 self-center sm:self-start bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Developer
                  </span>
                </div>
                
                <p className="text-indigo-300 font-semibold text-xs">{devInfo.role}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{devInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono text-[11px]">{devInfo.nodeRegion}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-2.5 border-t border-[#1b2554]/50">
                  {devInfo.bio}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-4 border-t border-[#1b2554]/50">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditedName(devInfo.name);
                    setEditedEmail(devInfo.email);
                    setEditedBio(devInfo.bio);
                    setEditedRegion(devInfo.nodeRegion);
                    setIsEditing(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition"
                >
                  Edit Profile Info
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-3xl p-6 space-y-4 animate-slideDown">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#21326d] pb-2">Update Credentials & Bios</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Developer / Operator Name</label>
                  <input
                    type="text"
                    required
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-[#050816] border border-[#21336e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified System Email</label>
                  <input
                    type="email"
                    required
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full bg-[#050816] border border-[#21336e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Cluster Region</label>
                <input
                  type="text"
                  required
                  value={editedRegion}
                  onChange={(e) => setEditedRegion(e.target.value)}
                  placeholder="e.g. Asia-Southeast (Mumbai / Delhi Cluster)"
                  className="w-full bg-[#050816] border border-[#21336e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Developer Bio & System Notes</label>
                <textarea
                  rows={3}
                  required
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full bg-[#050816] border border-[#21336e] rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition"
                >
                  Save Developer Config
                </button>
              </div>
            </form>
          )}

          {/* Registered Public SSH Keys */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#21326d] pb-3">
              <div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" /> Authorized SSH Public Keys
                </h3>
                <p className="text-[10px] text-slate-400">Configure public keys allowed to invoke remote container tunnels and file updates.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddKey(!showAddKey)}
                className="bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/25 text-indigo-400 hover:text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition uppercase tracking-wider"
              >
                {showAddKey ? "Hide Panel" : "Add SSH Key"}
              </button>
            </div>

            {showAddKey && (
              <form onSubmit={handleAddSshKey} className="space-y-3 bg-[#050816] border border-[#1a285d] p-4 rounded-2xl animate-slideDown">
                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Register New Key Node</h4>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400">Key Name / Description</label>
                  <input
                    type="text"
                    required
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. Workstation PC, staging server"
                    className="w-full bg-[#080d24] border border-[#21336e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400">SSH Public Key String (ssh-rsa, ssh-ed25519)</label>
                  <textarea
                    rows={3}
                    required
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder="Paste full public key content..."
                    className="w-full bg-[#080d24] border border-[#21336e] rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Confirm Registration
                </button>
              </form>
            )}

            <div className="space-y-3">
              {sshKeys.map((k) => (
                <div key={k.id} className="p-4 bg-[#070b1a]/95 border border-[#16214c] rounded-2xl hover:border-[#223371] transition space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">{k.label}</span>
                      <span className="text-[9.5px] text-indigo-400 font-semibold">Added on {k.addedAt}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(k.key, k.id)}
                        className="p-1.5 bg-[#0e173d] hover:bg-[#1a275e] text-slate-400 hover:text-indigo-400 border border-[#21336e]/40 rounded-lg transition"
                        title="Copy Key String"
                      >
                        {copiedKeyId === k.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSshKey(k.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-rose-400 rounded-lg transition"
                        title="Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#030510] p-2.5 rounded-xl border border-[#121c43] text-[10px] font-mono text-slate-400 break-all select-all leading-normal font-medium">
                    {k.key}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: active sessions, developer action logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Hardware & Environment Diagnostics */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-3xl p-5 space-y-3">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4.5 h-4.5 text-indigo-400" /> Developer Environment
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#070b1a] p-3 rounded-xl border border-[#15214c] space-y-0.5">
                <span className="text-slate-500 font-bold block text-[9px] uppercase">Node Engine</span>
                <span className="font-mono text-white font-extrabold text-[11px]">v20.11.0 (LTS)</span>
              </div>
              <div className="bg-[#070b1a] p-3 rounded-xl border border-[#15214c] space-y-0.5">
                <span className="text-slate-500 font-bold block text-[9px] uppercase">OS Platform</span>
                <span className="font-mono text-white font-extrabold text-[11px]">Linux Cloud Run</span>
              </div>
              <div className="bg-[#070b1a] p-3 rounded-xl border border-[#15214c] space-y-0.5">
                <span className="text-slate-500 font-bold block text-[9px] uppercase">DB Connector</span>
                <span className="font-mono text-white font-extrabold text-[11px]">Drizzle-MySQL</span>
              </div>
              <div className="bg-[#070b1a] p-3 rounded-xl border border-[#15214c] space-y-0.5">
                <span className="text-slate-500 font-bold block text-[9px] uppercase">AI Sync Model</span>
                <span className="font-mono text-white font-extrabold text-[11px]">Gemini 3.5 Flash</span>
              </div>
            </div>
            
            <div className="bg-[#0a0f2e] border border-indigo-500/25 p-3 rounded-xl space-y-2">
              <span className="font-extrabold text-indigo-400 text-[10px] uppercase tracking-wider block">Container Cluster status</span>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                <span>Active Core Workers:</span>
                <span className="text-emerald-400">4 / 4 ONLINE</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                <span>Memory Allocation:</span>
                <span className="text-indigo-300">512MB / 1024MB</span>
              </div>
            </div>
          </div>

          {/* Active Developer Sessions */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-3xl p-5 space-y-3.5">
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Active Workspace Sessions</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Live developer login nodes currently authorized to access system commands.</p>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="p-3 bg-[#070b1a]/95 rounded-2xl border border-[#15214c] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      {s.device.includes("Chrome") || s.device.includes("Sequoia") ? (
                        <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                      ) : s.device.includes("Mobile") ? (
                        <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{s.device}</span>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${s.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>IP: {s.ip}</span>
                    <span>Loc: {s.location}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> Login At: {s.activeSince}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Access Log events */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-3xl p-5 space-y-3.5">
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Access Clearance Audit Logs</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time trace logs detailing cryptographic actions initiated by this developer profile.</p>
            </div>

            <div className="space-y-2 font-mono text-[10px] max-h-56 overflow-y-auto pr-1">
              {accessLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-[#050816] rounded-xl border border-[#16224c] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-400 font-extrabold">{log.id}</span>
                    <span className="text-slate-500 font-medium">{log.time}</span>
                  </div>
                  <p className="text-slate-300 font-semibold">{log.action}</p>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                    <span>IP: {log.ip}</span>
                    <span className="text-emerald-500 font-bold">{log.status}</span>
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
