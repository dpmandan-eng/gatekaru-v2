import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  Send,
  Zap,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileText,
  Activity,
  UserCheck,
  Eye,
  Radio,
  Siren,
  HelpCircle
} from "lucide-react";

export interface AIAnomalyItem {
  id: string;
  category: "Unauthorized Badge Scan" | "High Footfall Spike" | "Frequent SOS Zone" | "Late Night Entry Cluster";
  riskScore: number;
  location: string;
  detectedAt: string;
  aiExplanation: string;
  recommendedAction: string;
}

const INITIAL_AI_ANOMALIES: AIAnomalyItem[] = [
  {
    id: "AI-ANO-401",
    category: "Unauthorized Badge Scan",
    riskScore: 78,
    location: "Basement B1 Parking Gate 2",
    detectedAt: "Today, 02:14 AM",
    aiExplanation: "3 consecutive invalid RFID card taps detected within 45 seconds from unrecognized vehicle.",
    recommendedAction: "Dispatch Basement Patrol Guard to inspect vehicle plate MH-02-CD-9981."
  },
  {
    id: "AI-ANO-402",
    category: "High Footfall Spike",
    riskScore: 62,
    location: "Main Entry Terminal 1",
    detectedAt: "Today, 07:30 PM",
    aiExplanation: "Visitor entry rate exceeded standard 90th percentile by 140% during festival pre-approvals.",
    recommendedAction: "Activate secondary QR scanner kiosk and assign 1 additional guard to Gate 1."
  },
  {
    id: "AI-ANO-403",
    category: "Frequent SOS Zone",
    riskScore: 85,
    location: "Wing C (Tower Charlie)",
    detectedAt: "This Week",
    aiExplanation: "Wing C accounts for 40% of all monthly medical panic alarms (high senior citizen density).",
    recommendedAction: "Position permanent paramedic kit & rapid guard station at Wing C ground lobby."
  }
];

interface AISecurityFeaturesProps {
  darkMode?: boolean;
}

export default function AISecurityFeatures({ darkMode = true }: AISecurityFeaturesProps) {
  const [anomalies, setAnomalies] = useState<AIAnomalyItem[]>(INITIAL_AI_ANOMALIES);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAnalyzing(true);
    setAiAnswer(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAiAnswer(
        `🤖 GateKaru AI Security Analysis for: "${aiPrompt}"\n\n` +
          `• System Safety Index: 96.4% (Optimal Integrity)\n` +
          `• Threat Vector Check: No critical breaches detected in active 24-hour window.\n` +
          `• Recommendation: All 8 CCTV feeds in Wing C & Main Gate are streaming cleanly. Maintain current shift rotation.`
      );
    }, 1000);
  };

  const cardBg = darkMode
    ? "bg-[#0b1029]/90 border border-[#1e2a5e] text-white shadow-2xl"
    : "bg-white border border-slate-200 text-slate-800 shadow-md";

  return (
    <div className={`${cardBg} rounded-2xl p-5 space-y-6 transition-all select-none`}>
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#1f2e63] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/40 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              ✨ GateKaru AI Security Intelligence (AI सुरक्षा विश्लेषण)
            </span>
          </div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            AI Threat Forecast, Anomaly Detector & Committee Summarizer
          </h2>
          <p className="text-xs text-slate-400">
            Machine learning analysis of society footfall patterns, panic alarm correlations, and automatic incident briefing generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Safety Score: 96 / 100</span>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Anomaly Detector Cards & AI Incident Summarizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Detected AI Security Anomalies */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1a2858] pb-2">
            <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" /> Detected AI Security Anomalies ({anomalies.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Updated Every 60 Seconds</span>
          </div>

          <div className="space-y-3">
            {anomalies.map(item => (
              <div
                key={item.id}
                className="bg-[#060a19] border border-[#182654] hover:border-indigo-500/50 p-4 rounded-xl space-y-2 transition shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.id}</span>
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {item.category} ({item.location})
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border ${
                      item.riskScore >= 75
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    Risk Score: {item.riskScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#030612] p-2.5 rounded-lg border border-[#131f45]">
                  <strong className="text-indigo-300 font-extrabold">AI Pattern: </strong>
                  {item.aiExplanation}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> Action: {item.recommendedAction}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{item.detectedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: AI Query Box & Executive Report Generator */}
        <div className="space-y-4 bg-[#060a19] border border-[#182654] p-4 rounded-xl">
          
          {/* Executive Committee Summarizer */}
          <div className="space-y-3 border-b border-[#1a2858] pb-4">
            <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Automated Committee Briefing
            </h3>
            <p className="text-xs text-slate-400">
              Generate instant bilingual AI security report for RWA WhatsApp group & monthly committee audit.
            </p>

            <button
              type="button"
              onClick={() => setSummaryGenerated(prev => !prev)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{summaryGenerated ? "Hide AI Executive Brief" : "Generate AI Executive Report"}</span>
            </button>

            {summaryGenerated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-[#030612] border border-indigo-500/40 p-3 rounded-xl text-xs space-y-2 text-slate-200 font-sans"
              >
                <div className="flex items-center justify-between text-indigo-400 font-extrabold text-[11px] border-b border-indigo-500/20 pb-1">
                  <span>📋 GateKaru Weekly RWA Executive Summary</span>
                  <span>Aug 2026</span>
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300">
                  <li><strong>Total Visitors:</strong> 4,890 verified pre-approvals via GateKaru App.</li>
                  <li><strong>Emergency SOS:</strong> 3 panic alarms resolved within 90 seconds. No injuries.</li>
                  <li><strong>Maintenance:</strong> 98.2% maintenance bills settled electronically.</li>
                </ul>
              </motion.div>
            )}
          </div>

          {/* Interactive AI Query Terminal */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Ask GateKaru AI Security Engine
            </h3>

            <form onSubmit={handleAskAI} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Check CCTV feeds in Wing C or summarize visitor spikes..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full bg-[#030612] border border-[#1e2a5e] rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={analyzing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {analyzing && (
              <div className="p-3 bg-[#030612] border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2 animate-pulse">
                <BrainCircuit className="w-4 h-4 animate-spin text-indigo-400" />
                <span>AI analyzing society telemetry...</span>
              </div>
            )}

            {aiAnswer && (
              <div className="p-3 bg-[#030612] border border-indigo-500/40 rounded-xl text-xs text-slate-200 whitespace-pre-line leading-relaxed font-mono">
                {aiAnswer}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
