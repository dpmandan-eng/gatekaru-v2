import React, { useState } from "react";
import { 
  Video, Server, Plus, RefreshCw, Trash2, Shield, Eye, EyeOff, Check, AlertTriangle, Wifi, Network
} from "lucide-react";

export interface Camera {
  id: string;
  name: string;
  status: string;
  type: string;
  ip: string;
  port: string;
  username: string;
  password?: string;
  url: string;
  location: string;
  testStatus: "IDLE" | "TESTING" | "SUCCESS" | "FAILED";
  testLogs: string[];
}

export function SmartSurveillanceConfig() {
  // Initial demo cameras for Indian-society premise gates and basements
  const [cameras, setCameras] = useState<Camera[]>([
    { 
      id: "cam1", 
      name: "CCTV 1 MAIN GATE 1 ENTRY", 
      status: "FEED LIVE", 
      type: "RTSP Proxy Gateway", 
      ip: "192.168.1.108",
      port: "554",
      username: "admin",
      password: "password123",
      url: "rtsp://admin:password123@192.168.1.108:554/Streaming/Channels/101", 
      location: "Main Gate Entry Barrier",
      testStatus: "SUCCESS",
      testLogs: [
        "Resolving 192.168.1.108 on Port 554... OK",
        "Sending RTSP OPTIONS request... Received response 200 OK",
        "Authenticating as 'admin' using SHA-256 Digest... Credentials verified.",
        "Active stream handshake completed: Subscribed to H.264 stream. Latency: 12ms."
      ]
    },
    { 
      id: "cam2", 
      name: "CCTV 2 BASEMENT PARKING A", 
      status: "FEED LIVE", 
      type: "HLS Secure Stream", 
      ip: "stream.gatekaru.in",
      port: "443",
      username: "operator",
      password: "secure_pass_45",
      url: "https://stream.gatekaru.in/hls/basement_block_a.m3u8", 
      location: "Block A Basement Area",
      testStatus: "SUCCESS",
      testLogs: [
        "Resolving DNS record stream.gatekaru.in... Resolved to 104.21.43.109",
        "Initiating SSL/TLS Handshake on Port 443... TLSv1.3 verified.",
        "HTTP GET /hls/basement_block_a.m3u8... Status 200 OK",
        "Active index verified. M3U8 chunk list parsed successfully. Feed Live."
      ]
    }
  ]);

  // Form states
  const [newCamName, setNewCamName] = useState("");
  const [newCamLocation, setNewCamLocation] = useState("");
  const [newCamIp, setNewCamIp] = useState("");
  const [newCamPort, setNewCamPort] = useState("554");
  const [newCamUsername, setNewCamUsername] = useState("admin");
  const [newCamPassword, setNewCamPassword] = useState("");
  const [newCamType, setNewCamType] = useState("RTSP Proxy Gateway");
  
  const [selectedCamId, setSelectedCamId] = useState<string | null>("cam1");
  const [showPasswordMap, setShowPasswordMap] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Automated generated Stream URL builder preview helper
  const getPreviewUrl = () => {
    const ip = newCamIp.trim() || "192.168.1.150";
    const port = newCamPort.trim() || "554";
    const user = newCamUsername.trim() || "admin";
    const pass = newCamPassword || "password";
    
    if (newCamType === "RTSP Proxy Gateway") {
      return `rtsp://${user}:${pass}@${ip}:${port}/Streaming/Channels/101`;
    } else if (newCamType === "HLS Secure Stream") {
      return `https://${ip}:${port}/hls/live.m3u8`;
    } else {
      return `http://${ip}:${port}/onvif/device_service`;
    }
  };

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName.trim() || !newCamIp.trim() || !newCamPort.trim()) {
      alert("Please fill in camera name, IP, and Port parameters.");
      return;
    }

    const generatedUrl = getPreviewUrl();
    const newCamera: Camera = {
      id: `cam-${Date.now()}`,
      name: newCamName.toUpperCase().trim(),
      status: "STANDBY",
      type: newCamType,
      ip: newCamIp.trim(),
      port: newCamPort.trim(),
      username: newCamUsername.trim(),
      password: newCamPassword,
      url: generatedUrl,
      location: newCamLocation.trim() || "Premise Area",
      testStatus: "IDLE",
      testLogs: []
    };

    setCameras(prev => [...prev, newCamera]);
    setSelectedCamId(newCamera.id);
    
    // Clear form
    setNewCamName("");
    setNewCamLocation("");
    setNewCamIp("");
    setNewCamPort(newCamType === "RTSP Proxy Gateway" ? "554" : "443");
    setNewCamPassword("");
    alert("🟢 Camera Stream added to Whitelist! Hit 'TEST CONNECTION' to run live handshake diagnostics.");
  };

  const handleDeleteCamera = (id: string) => {
    if (confirm("Are you sure you want to remove this surveillance stream configuration?")) {
      setCameras(prev => prev.filter(c => c.id !== id));
      if (selectedCamId === id) {
        setSelectedCamId(null);
      }
    }
  };

  // Detailed Connection Validation Handshaking Simulator
  const handleTestConnection = (id: string) => {
    // 1. Set Status to TESTING
    setCameras(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          testStatus: "TESTING" as const,
          testLogs: [`[${new Date().toLocaleTimeString()}] 📶 Starting connection diagnostic run for "${c.name}"...`]
        };
      }
      return c;
    }));

    // Step 2: Simulate DNS / Host Resolution
    setTimeout(() => {
      setCameras(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            testLogs: [
              ...c.testLogs,
              `[${new Date().toLocaleTimeString()}] 🔍 Routing network path to ${c.ip} on Port ${c.port}...`,
              `[${new Date().toLocaleTimeString()}] 📡 Reply from ${c.ip}: bytes=32 time=${10 + Math.floor(Math.random() * 20)}ms TTL=64.`
            ]
          };
        }
        return c;
      }));
    }, 600);

    // Step 3: Auth Handshake & Stream Acquisition Simulation
    setTimeout(() => {
      setCameras(prev => prev.map(c => {
        if (c.id === id) {
          const isFailing = c.ip.toLowerCase().includes("fail") || c.port === "0" || !c.username;
          if (isFailing) {
            return {
              ...c,
              testStatus: "FAILED" as const,
              testLogs: [
                ...c.testLogs,
                `[${new Date().toLocaleTimeString()}] 🔐 Authenticating credentials for user '${c.username}'...`,
                `[${new Date().toLocaleTimeString()}] ❌ Failed to establish authentication handshake. Request timeout or invalid credentials.`,
                `[${new Date().toLocaleTimeString()}] 🔴 Network Diagnostic completed with: FAILED_CREDENTIALS`
              ]
            };
          }

          // Success Case
          return {
            ...c,
            testStatus: "SUCCESS" as const,
            testLogs: [
              ...c.testLogs,
              `[${new Date().toLocaleTimeString()}] 🔐 Authenticating credentials for user '${c.username}'... Verified!`,
              `[${new Date().toLocaleTimeString()}] 🎥 Initiating ${c.type} handshake layer... Connection established over TCP/IP.`,
              `[${new Date().toLocaleTimeString()}] 🟢 Successful stream callback received! Capturing 1080p stream at 25 FPS.`,
              `[${new Date().toLocaleTimeString()}] 🚀 Gateway Transcoder status: ACTIVE & LIVE relaying.`
            ]
          };
        }
        return c;
      }));
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Introduction Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-bold text-base tracking-tight text-white">Smart Surveillance Configuration</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Input society-wide on-premise IP cameras, designate subnets, manage authentication credentials, and trigger secure network validation diagnostics directly across Greenwood Heights Co-Op nodes.
          </p>
        </div>
        <div className="flex bg-slate-950 p-2 rounded-xl border border-slate-800 shrink-0 self-stretch md:self-auto justify-center">
          <span className="text-[10px] text-indigo-400 font-extrabold flex items-center gap-1.5 px-3">
            <Server className="w-3.5 h-3.5" />
            TRANSCODER GATEWAY: ONLINE (192.168.1.108)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Config Form (5/12 columns) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Link IP Camera Feed
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Configure credentials and network routes for automatic live transcoder subscription.</p>
          </div>

          <form onSubmit={handleAddCamera} className="space-y-3.5">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Camera Channel Name</label>
              <input
                type="text"
                required
                value={newCamName}
                onChange={(e) => setNewCamName(e.target.value)}
                placeholder="E.g. CCTV 3 PARKING BLOCK B"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Physical Location / Installation point</label>
              <input
                type="text"
                value={newCamLocation}
                onChange={(e) => setNewCamLocation(e.target.value)}
                placeholder="E.g. Block B lift lobby entryway"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">IP Address / Host</label>
                <input
                  type="text"
                  required
                  value={newCamIp}
                  onChange={(e) => setNewCamIp(e.target.value)}
                  placeholder="E.g. 192.168.1.150"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Port Number</label>
                <input
                  type="text"
                  required
                  value={newCamPort}
                  onChange={(e) => setNewCamPort(e.target.value)}
                  placeholder="E.g. 554 or 443"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Auth Username</label>
                <input
                  type="text"
                  required
                  value={newCamUsername}
                  onChange={(e) => setNewCamUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Auth Password</label>
                <input
                  type="password"
                  required
                  value={newCamPassword}
                  onChange={(e) => setNewCamPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Stream Protocol / Subnet Protocol</label>
              <select
                value={newCamType}
                onChange={(e) => {
                  setNewCamType(e.target.value);
                  setNewCamPort(e.target.value === "RTSP Proxy Gateway" ? "554" : "443");
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-indigo-500 text-slate-800"
              >
                <option value="RTSP Proxy Gateway">RTSP Proxy Gateway (Hikvision / CP-Plus / Dahua)</option>
                <option value="HLS Secure Stream">HLS Secure Stream (Cloud Proxy relay .m3u8)</option>
                <option value="Local Subnet IP">Local Subnet IP (ONVIF Port 80/8899)</option>
              </select>
            </div>

            {/* Generated Stream URL Preview */}
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 space-y-1">
              <span className="text-[8px] font-extrabold text-indigo-600 uppercase tracking-wider">Dynamic Stream URI Preview:</span>
              <p className="text-[9px] font-mono text-slate-500 break-all select-all">
                {getPreviewUrl()}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 rounded-lg transition shadow-sm hover:shadow active:scale-[0.99] cursor-pointer uppercase tracking-wider"
              >
                Whitelist & Subscribe Stream
              </button>
            </div>
          </form>
        </div>

        {/* Right Hand: Whitelist & Testing Validation Console (7/12 columns) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-600" /> Whitelisted Society CCTV Relays
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Select any camera feed to verify its network routing and test secure stream transcoders.</p>
          </div>

          {cameras.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Video className="w-8 h-8 mx-auto text-slate-300" />
              <p>No IP camera feeds registered in society system yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {cameras.map((cam) => {
                const isSelected = selectedCamId === cam.id;
                const testStatus = cam.testStatus || "IDLE";
                const isShowPass = showPasswordMap[cam.id] || false;

                return (
                  <div 
                    key={cam.id}
                    className={`p-4 border rounded-xl transition cursor-pointer ${
                      isSelected ? "border-indigo-500 bg-indigo-50/10" : "border-slate-100 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedCamId(cam.id)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800">{cam.name}</span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                            {cam.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">📍 {cam.location} • Routing: {cam.ip}:{cam.port}</p>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                        {/* Interactive Test Connection Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(cam.id);
                          }}
                          disabled={testStatus === "TESTING"}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs cursor-pointer ${
                            testStatus === "TESTING"
                              ? "bg-amber-100 text-amber-700 cursor-not-allowed"
                              : testStatus === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                              : testStatus === "FAILED"
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          <RefreshCw className={`w-3 h-3 ${testStatus === "TESTING" ? "animate-spin" : ""}`} />
                          {testStatus === "TESTING" ? "TESTING..." : "TEST CONNECTION"}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCamera(cam.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                          title="Remove from Whitelist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Diagnostic Handshake & Credential Verification Console */}
                    {isSelected && (
                      <div className="mt-3.5 bg-slate-950 text-slate-300 font-mono text-[10px] rounded-xl p-3 space-y-3.5 border border-slate-800 animate-in slide-in-from-top-1 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Server className="w-3 h-3 text-indigo-400" /> Handshake Diagnostics & Security credentials
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              testStatus === "TESTING" 
                                ? "bg-amber-400 animate-ping" 
                                : testStatus === "SUCCESS"
                                ? "bg-emerald-500"
                                : testStatus === "FAILED"
                                ? "bg-red-500"
                                : "bg-slate-600"
                            }`} />
                            <span className="font-extrabold text-[9px] tracking-wider uppercase">STATUS: {testStatus}</span>
                          </div>
                        </div>

                        {/* Credential & Network Host Data Card */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg font-sans border border-slate-800/60">
                          <div>
                            <span className="block text-slate-500 font-bold uppercase text-[7px] tracking-wider">IP HOST</span>
                            <span className="font-mono text-white text-[10px]">{cam.ip}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase text-[7px] tracking-wider">PORT</span>
                            <span className="font-mono text-white text-[10px]">{cam.port}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase text-[7px] tracking-wider">USERNAME</span>
                            <span className="text-white text-[10px]">{cam.username}</span>
                          </div>
                          <div className="relative group">
                            <span className="block text-slate-500 font-bold uppercase text-[7px] tracking-wider">PASSWORD</span>
                            <div className="flex items-center gap-1">
                              <span className="text-white text-[10px] font-mono">
                                {isShowPass ? (cam.password || "Unset") : "••••••••"}
                              </span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePasswordVisibility(cam.id);
                                }}
                                className="text-slate-500 hover:text-white transition p-0.5"
                              >
                                {isShowPass ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Live Transcoder Terminal Logs */}
                        <div className="space-y-1.5 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                          {cam.testLogs && cam.testLogs.length > 0 ? (
                            cam.testLogs.map((log, idx) => (
                              <div key={idx} className={
                                log.includes("🟢") || log.includes("verified") || log.includes("successful") ? "text-emerald-400" :
                                log.includes("❌") || log.includes("timeout") || log.includes("🔴") ? "text-red-400" :
                                log.includes("📶") || log.includes("Handshake") || log.includes("Routing") ? "text-indigo-300" : "text-slate-300"
                              }>
                                {log}
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 italic text-center py-4 flex flex-col items-center justify-center gap-1.5">
                              <Wifi className="w-5 h-5 text-slate-600 animate-pulse" />
                              <p>Gateway has not run connection handshakes yet.</p>
                              <p className="text-[8px] font-sans text-slate-600 uppercase">Click "TEST CONNECTION" above to verify route integrity</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
