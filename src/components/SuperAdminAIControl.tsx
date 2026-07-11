import React, { useState } from "react";
import { 
  Sparkles, Bot, MessageSquare, AlertTriangle, Cpu, Radio, 
  FileText, ShieldCheck, Check, Settings, ToggleLeft, ToggleRight
} from "lucide-react";

export default function SuperAdminAIControl() {
  // AI Module Toggles
  const [modules, setModules] = useState([
    { id: "chatbot", name: "AI Chatbot Engine", desc: "Replies to residents regarding amenities and visitor regulations", status: true, version: "v2.1", type: "NLP" },
    { id: "complaints", name: "AI Complaint Assistant", desc: "Auto-tags, clusters, and escalates civil maintenance complaints", status: true, version: "v1.9", type: "Classifier" },
    { id: "risk", name: "AI Visitor Risk Detection", desc: "Identifies anomalies in blacklist registrations or unexpected cab entries", status: false, version: "v3.0", type: "Security Vision" },
    { id: "security", name: "AI Security Guard Guarding Monitor", desc: "Correlates guard patrol RFID pings with optimal patrol timelines", status: true, version: "v2.5", type: "Heuristics" },
    { id: "billing", name: "AI Billing Assistant", desc: "Auto-adjusts invoice generation for late fees based on history", status: true, version: "v1.2", type: "Ledger Logic" },
    { id: "notice", name: "AI Notice Generator", desc: "Generates fully compliance-ready society flyers and notifications", status: true, version: "v3.2", type: "LLM (Gemini 3.5)" },
    { id: "reports", name: "AI Auto Reporting Engine", desc: "Compiles weekly multi-tenant financial summary reports", status: false, version: "v2.0", type: "Analytics" }
  ]);

  // Notice Generator States
  const [noticeTopic, setNoticeTopic] = useState("Water Maintenance Cutoff");
  const [noticeTone, setNoticeTone] = useState("Polite but Urgent");
  const [noticeContent, setNoticeContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto Report states
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState("");

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) return { ...m, status: !m.status };
      return m;
    }));
  };

  const handleGenerateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setNoticeContent("");

    setTimeout(() => {
      let result = `🚨 NOTICE: URGENT ${noticeTopic.toUpperCase()} 🚨\n\n`;
      result += `Date: 2026-07-09\n`;
      result += `Audience: All Residents & Staff\n\n`;
      result += `Dear Gated Residents,\n\n`;
      result += `Please be informed that the Managing Committee, in sync with JobsKaru AI automated municipal sensors, has flagged a maintenance schedule for the topic: "${noticeTopic}".\n\n`;
      result += `We will be carrying out comprehensive service checks. The tone of this undertaking is ${noticeTone.toLowerCase()}. We advise all resident apartments to stock up on necessary reserves ahead of the scheduled window (10:00 AM to 02:00 PM).\n\n`;
      result += `We deeply regret any temporary inconvenience caused. Your safety and community balance is our highest priority.\n\n`;
      result += `Issued By,\nGateKaru automated ERP Notice Hub\n[For & On Behalf of the Resident Welfare Association]`;
      
      setNoticeContent(result);
      setIsGenerating(false);
    }, 1200);
  };

  const handleGenerateAutoReport = () => {
    setIsGeneratingReport(true);
    setReportResult("");

    setTimeout(() => {
      const summary = `========================================================\n` +
                      `    GATEKARU ERP MULTI-TENANT WEEKLY AUDIT REPORT       \n` +
                      `========================================================\n` +
                      `Timestamp: 2026-07-09T07:12:00Z\n` +
                      `Region: asia-southeast1 (GCP Container Node)\n` +
                      `Platform Status: HEALTHY (99.98% Uptime)\n\n` +
                      `1. TENANT INGESTION INDEX:\n` +
                      `   - Total Active Societies: 5 Gated Townships\n` +
                      `   - Total Flats Under ERP Lease: 865 apartments\n` +
                      `   - Total Registered Users: 2,309 accounts\n\n` +
                      `2. FINANCIAL RUN-RATE MEMO:\n` +
                      `   - Monthly Recurring Revenue (MRR): ₹43,000\n` +
                      `   - Total Collection Efficiency: 92.4% (Direct Bank Sync)\n` +
                      `   - Overdue/Pending Verification: 1 Client pod (Silver Maple Heights)\n\n` +
                      `3. COGNITIVE HEURISTICS FEEDBACK:\n` +
                      `   - AI notice generator pipeline: 124 dispatches this week\n` +
                      `   - AI complaint classifier: 88.5% automated resolution rate\n` +
                      `   - AI Visitor risk checks: 0 security breaches flag\n\n` +
                      `================[ END OF LOG TRANSMISSION ]================`;
      
      setReportResult(summary);
      setIsGeneratingReport(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn text-slate-300">
      
      {/* Intro Header */}
      <div className="border-b border-[#1e295d] pb-4">
        <span className="text-xs uppercase font-black tracking-widest text-purple-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} /> 
          Cognitive Automation Division
        </span>
        <h2 className="text-2xl font-black text-white mt-1">AI Control Center</h2>
        <p className="text-xs text-slate-400">Configure core Large Language Models, heuristic security risk predictors, and auto-generative resident communication channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: AI Module Matrix (7 Modules) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5">
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Bot className="w-4.5 h-4.5 text-purple-400" /> JobsKaru AI Engine Matrix
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Toggle live containerized neural nets inside the current master partition.</p>
            
            <div className="space-y-3">
              {modules.map((m) => (
                <div 
                  key={m.id} 
                  className="p-3.5 bg-[#070b1a]/95 border border-[#17214e] rounded-xl flex items-center justify-between hover:border-[#25367c] transition duration-150"
                >
                  <div className="space-y-0.5 max-w-[75%]">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-xs">{m.name}</span>
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-extrabold">{m.type}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-medium">{m.desc}</p>
                    <span className="text-[9px] text-slate-500 font-bold block">Engine Version: {m.version}</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => toggleModule(m.id)}
                    className="p-1 focus:outline-none transition duration-150"
                  >
                    {m.status ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ACTIVE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        <span>DISABLED</span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Generative Tools (Notice & Auto Reports) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* generative notice board */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#1f2c69] pb-2">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-indigo-400" /> AI Notice Board Generator
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Draft instant society welfare flyers and water/parking cutoffs with LLM precision.</p>
            </div>

            <form onSubmit={handleGenerateNotice} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notice Core Topic</label>
                  <select 
                    value={noticeTopic}
                    onChange={(e) => setNoticeTopic(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Water Maintenance Cutoff">Water Cutoff</option>
                    <option value="Elevator Cable Servicing">Elevator Servicing</option>
                    <option value="Annual General Body Meeting (AGM)">AGM Meeting</option>
                    <option value="Festival Decoration Levies">Festive Decor Charge</option>
                    <option value="Stray Animal Security Protocol">Stray Animals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notice Brand Tone</label>
                  <select 
                    value={noticeTone}
                    onChange={(e) => setNoticeTone(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-[#21326d] rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Polite but Urgent">Polite but Urgent</option>
                    <option value="Extremely Stern & Legal">Extremely Stern / Legal</option>
                    <option value="Warm & Festive Celebration">Warm & Festive</option>
                    <option value="Regulatory Policy Compliance">Policy Compliance</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow shadow-indigo-600/25 transition duration-150 flex items-center justify-center gap-1.5"
              >
                {isGenerating ? "Synthesizing with LLM Engine..." : "⚡ Deploy AI Notice Draft"}
              </button>
            </form>

            {noticeContent && (
              <div className="bg-[#070b1a]/95 border border-[#20306c] rounded-xl p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#21316b]/40 pb-1.5 mb-2">
                  <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">AI Generated Notice Output</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(noticeContent);
                      alert("Copied draft notice to developer clipboard!");
                    }}
                    className="text-[8px] text-slate-400 hover:text-white uppercase font-bold"
                  >
                    Copy Notice Text
                  </button>
                </div>
                <pre className="text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {noticeContent}
                </pre>
              </div>
            )}
          </div>

          {/* AI Auto Reports */}
          <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#1f2c69] pb-2">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4.5 h-4.5 text-purple-400" /> AI Auto-Reporting Hub
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Synthesize systemic logs, collection rates, and tenant usage metrics into standard audits.</p>
            </div>

            <button 
              type="button"
              onClick={handleGenerateAutoReport}
              disabled={isGeneratingReport}
              className="w-full bg-[#11183c] hover:bg-[#1a2559] border border-[#24377c] text-slate-200 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5"
            >
              {isGeneratingReport ? "Compiling platform variables..." : "📊 Compile Weekly System Audit"}
            </button>

            {reportResult && (
              <div className="bg-[#050816] border border-[#1b2a5d] rounded-xl p-4 space-y-1 animate-fadeIn">
                <div className="flex justify-between items-center text-[8.5px] text-purple-400 font-black uppercase tracking-wider pb-1.5 mb-2 border-b border-[#1a285a]/40">
                  <span>SHA-512 System Seal</span>
                  <span>JobsKaru Enterprise Node</span>
                </div>
                <pre className="text-[9.5px] text-emerald-400 font-mono whitespace-pre-wrap leading-normal overflow-x-auto max-h-56">
                  {reportResult}
                </pre>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
