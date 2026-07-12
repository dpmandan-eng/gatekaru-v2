import React, { useState } from "react";
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  PhoneCall, 
  Layers, 
  MessageSquare, 
  Briefcase, 
  Home, 
  UserCheck, 
  Truck, 
  Wrench,
  ChevronRight,
  Sparkles
} from "lucide-react";

// List of JobsKaru Pune App Ecosystem
export const JOBSKARU_APPS = [
  {
    name: "JobsKaru Pune Local Jobs",
    tagline: "Pune's #1 verified local job search & recruitment portal.",
    url: "https://pune.jobskaru.com",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    name: "GateKaru Smart Gatekeeper ERP",
    tagline: "This Platform: Enterprise security, visitor tracking & gate pass manager.",
    url: "#",
    icon: Home,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  {
    name: "MaidKaru Pune",
    tagline: "Find & hire verified daily maids, cooks, and helpers near Pune areas.",
    url: "https://maids.jobskaru.com",
    icon: UserCheck,
    color: "bg-pink-500/10 text-pink-400 border-pink-500/20"
  },
  {
    name: "DeliveryKaru Hyperlocal",
    tagline: "Superfast parcel, medicine & tiffin delivery across Pune city.",
    url: "https://delivery.jobskaru.com",
    icon: Truck,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  },
  {
    name: "ServiceKaru Pune",
    tagline: "On-demand plumbers, electricians, AC mechanics & carpenters.",
    url: "https://services.jobskaru.com",
    icon: Wrench,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
  }
];

interface FooterIntegrationsProps {
  globalLang: string;
}

export default function FooterIntegrations({ globalLang }: FooterIntegrationsProps) {
  const [activeModal, setActiveModal] = useState<"apps" | "terms" | "privacy" | "helpline" | null>(null);

  const getTranslation = (key: string, enVal: string) => {
    // Basic helper
    return enVal;
  };

  return (
    <>
      {/* Footer trigger bar */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <button 
          onClick={() => setActiveModal("apps")}
          className="hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Layers className="w-3 h-3 text-indigo-400" /> JobsKaru Pune Apps
        </button>
        <span className="text-slate-300 select-none">•</span>
        <button 
          onClick={() => setActiveModal("terms")}
          className="hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3 h-3 text-indigo-400" /> Terms & Conditions
        </button>
        <span className="text-slate-300 select-none">•</span>
        <button 
          onClick={() => setActiveModal("privacy")}
          className="hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Privacy Policy
        </button>
        <span className="text-slate-300 select-none">•</span>
        <button 
          onClick={() => setActiveModal("helpline")}
          className="hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <PhoneCall className="w-3 h-3 text-emerald-400 animate-pulse" /> Support Helpline
        </button>
      </div>

      {/* Interactive Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0b1029] border border-[#1e2a5e] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-300 select-none">
            
            {/* Header */}
            <div className="bg-[#0e163b] px-5 py-4 border-b border-[#213374] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                {activeModal === "apps" && <Layers className="w-4 h-4 text-indigo-400" />}
                {activeModal === "terms" && <FileText className="w-4 h-4 text-slate-400" />}
                {activeModal === "privacy" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {activeModal === "helpline" && <PhoneCall className="w-4 h-4 text-emerald-400" />}
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  {activeModal === "apps" && "JobsKaru Technology • Pune App Directory"}
                  {activeModal === "terms" && "GateKaru Terms & Conditions (T&C)"}
                  {activeModal === "privacy" && "GateKaru Privacy & Data Protection Policy"}
                  {activeModal === "helpline" && "24/7 Society Support & Security Helpline"}
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto max-h-[65vh] space-y-4 text-xs leading-relaxed">
              
              {/* MODULE 1: JOBSKARU APPS */}
              {activeModal === "apps" && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-950/40 to-blue-950/40 border border-indigo-500/20 rounded-xl p-4 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-xs uppercase tracking-wider">JobsKaru Technology Pune Ecosystem</h4>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        We build highly optimized local service apps and secure enterprise management systems tailored for Pune residents, guards, and businesses. Click any service to explore:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {JOBSKARU_APPS.map((app, idx) => {
                      const IconComp = app.icon;
                      return (
                        <a
                          key={idx}
                          href={app.url === "#" ? undefined : app.url}
                          target={app.url === "#" ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          className={`block p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                            app.url === "#" 
                              ? "bg-slate-900/60 border-slate-800 opacity-90 cursor-default" 
                              : "bg-[#0b1029] hover:bg-indigo-950/20 border-[#1e2a5e] hover:border-indigo-500/40 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${app.color}`}>
                              <IconComp className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-[11px] flex items-center gap-1.5">
                                {app.name}
                                {app.url === "#" && (
                                  <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase">Active App</span>
                                )}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{app.tagline}</p>
                            </div>
                          </div>
                          {app.url !== "#" && (
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-white shrink-0" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODULE 2: TERMS AND CONDITIONS */}
              {activeModal === "terms" && (
                <div className="space-y-4 text-slate-300 text-[11px] leading-relaxed max-h-[450px] overflow-y-auto pr-2">
                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">1. Acceptance of Terms</h4>
                    <p className="text-slate-400">
                      Welcome to <strong className="text-indigo-400">GateKaru Smart Gatekeeper ERP</strong>, owned and operated by <strong className="text-slate-300">JobsKaru Technology</strong>. By registering for, logging into, or interacting with the GateKaru web portal or mobile application as a resident, security guard, committee administrator, or super-administrator, you express your full and binding consent to these Terms and Conditions. If you do not agree, you must immediately cease accessing the portal.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">2. Scope of Services & Account Roles</h4>
                    <p className="text-slate-400">
                      GateKaru provides an integrated community management suite, which facilitates visitor pre-approvals, dynamic gate pass deliveries, community message logs, amenity reservation coordination, SOS guard alerting, and maintenance billing. Users must register under their true, verified roles:
                    </p>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400">
                      <li><strong className="text-slate-300">Residents:</strong> Responsible for verifying family member profiles, accurate vehicle registrations, and authorizing visitor entries.</li>
                      <li><strong className="text-slate-300">Security Guards:</strong> Authorized to log real-time vehicle entries, check-in guests, verify pre-approved passcode entries, and dispatch SOS alerts.</li>
                      <li><strong className="text-slate-300">Committee Admins:</strong> Entrusted with supervising resident rosters, managing society ledgers, adjusting local portal preferences, and handling general complaints.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">3. User Commitments & Security Guard Ethics</h4>
                    <p className="text-slate-400">
                      By holding a GateKaru account, you guarantee that all information provided (including names, mobile numbers, and unit ownership records) is accurate and updated. You agree to protect your temporary OTP credentials and login passcodes. 
                    </p>
                    <p className="text-slate-400 mt-1">
                      Security guards and society staff agree to handle the guard station console with absolute confidentiality, logging physical check-ins truthfully and refraining from sharing private visitor logs or resident details with third parties outside official society security incidents.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">4. Maintenance Billing & Token Handshakes</h4>
                    <p className="text-slate-400">
                      While GateKaru tracks society maintenance bills, invoices, and transaction logs, all financial payments processed through integrated gateways represent transactions exclusively between the resident and the respective cooperative housing society. JobsKaru Technology acts solely as an ERP software provider and is not liable for banking failures, double debits, or delays in physical society receipts.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">5. SMS OTP Dispatches & Communication Rules</h4>
                    <p className="text-slate-400">
                      GateKaru integrates premium telecom APIs (including JobsKaru SMS Gateway and Fast2SMS) to deliver OTP verifications, automatic visitor notifications, and safety emergency broadcasts. By utilizing this system, you agree to receive automated transactional dispatches. Standard delivery rates may apply according to your carrier, and we are not liable for transient network blockages or local DND configuration issues.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">6. Proprietary Rights</h4>
                    <p className="text-slate-400">
                      The GateKaru logo, user interface structures, smart gate algorithms, automated greeting databases, and compiled software artifacts are the exclusive intellectual property of JobsKaru Technology. You are strictly forbidden from reverse-engineering, crawling, or utilizing our APIs for unauthorized commercial data harvesting.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">7. Limit of Liability & System Fallbacks</h4>
                    <p className="text-slate-400">
                      GateKaru is provided on an <strong className="text-slate-300">"As-Is" and "As-Available"</strong> basis. JobsKaru Technology does not guarantee 100% uninterrupted platform access. Physical gate safety operations, security guard shifts, and emergency response times remain the sole responsibility of your housing society's management committee. Under no event shall JobsKaru Technology be held liable for third-party delays or hardware malfunctions.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">8. Modifications and Governing Law</h4>
                    <p className="text-slate-400">
                      JobsKaru Technology reserves the right to modify these Terms and Conditions at any time. Changes become active immediately upon being updated in this footer portal. These terms are governed by and construed in accordance with the laws of India, with exclusive jurisdiction assigned to the courts of Pune, Maharashtra.
                    </p>
                  </div>
                </div>
              )}

              {/* MODULE 3: PRIVACY POLICY */}
              {activeModal === "privacy" && (
                <div className="space-y-4 text-slate-300 text-[11px] leading-relaxed">
                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">1. Information We Collect</h4>
                    <p className="text-slate-400">
                      GateKaru operates under a strict data minimization principle. We only collect and process information necessary to maintain the safety, security, and administration of your residential community:
                    </p>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400">
                      <li><strong className="text-slate-300">Resident Records:</strong> Full name, verified mobile phone number, flat/unit number, email address (optional), and assigned user roles.</li>
                      <li><strong className="text-slate-300">Visitor & Gate Passes:</strong> Visitor names, purpose of visit, host resident name, vehicle numbers, temporary digital passcodes, and physical timestamp logs of entry/exit.</li>
                      <li><strong className="text-slate-300">Security & Vehicle Management:</strong> Vehicle license plates, RFID sticker numbers, and guard alert history (SOS and gate incidents).</li>
                      <li><strong className="text-slate-300">Society Administration:</strong> Maintenance ledgers, transaction records, documents uploaded by residents, community polls, and notice history.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">2. Purpose of Data Processing</h4>
                    <p className="text-slate-400">
                      Your personal data is strictly processed to power the core features of the GateKaru Smart Gatekeeper ERP:
                    </p>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400">
                      <li>Facilitating secure visitor pre-approvals and instant resident notifications.</li>
                      <li>Verifying automated gate access through digital passcode verification and vehicle license plate recognition.</li>
                      <li>Dispatching critical SMS OTPs and real-time security guard emergency alerts.</li>
                      <li>Allowing committee admins to manage society maintenance, resolve complaints, and broadcast notices.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">3. Storage, Encryption & Security</h4>
                    <p className="text-slate-400">
                      We treat your data with the highest enterprise-level protection standards:
                    </p>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400">
                      <li><strong className="text-slate-300">Local Sandbox Mode:</strong> Developers or local instances persist records in a securely hashed local JSON file (<code className="text-indigo-400 font-mono">gatekaru_db.json</code>).</li>
                      <li><strong className="text-slate-300">Production Cloud Storage:</strong> Production data is secured using a private MySQL instance (with SSL encryption) or Cloud SQL databases, authenticated via JSON Web Tokens (JWT) and secure cookie authorization.</li>
                      <li><strong className="text-slate-300">Zero Biometric Storage:</strong> We <span className="text-emerald-400 font-bold">never</span> store, collect, or process facial recognition data, fingerprint templates, or continuous GPS tracking telemetry.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">4. Data Retention and Deletion</h4>
                    <p className="text-slate-400">
                      We store records only for as long as required to fulfill society audits and security requirements:
                    </p>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-400">
                      <li><strong className="text-slate-300">Visitor Logs:</strong> Automatically anonymized or securely purged from the active database after <span className="text-white font-bold">180 days</span>.</li>
                      <li><strong className="text-slate-300">Resident Profiles:</strong> Deleted immediately upon unit transfer or when manually deactivated by the Committee Admin.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">5. Data Sharing and Ad Protection</h4>
                    <p className="text-slate-400">
                      GateKaru does <span className="text-rose-400 font-bold">not</span> monetize or sell your personal information. Gated partner promotions or local coupon feeds are managed completely inside the client-side portal, ensuring no private resident records or contact information are ever disclosed to external advertisers.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-1.5 uppercase tracking-wide">6. Your Rights and Contact</h4>
                    <p className="text-slate-400">
                      Under Indian DPDPA and global privacy regulations, residents hold full rights to view, rectify, or purge their family member profiles, vehicle listings, and uploaded document cards. For deletion requests or data audits, please contact your society committee or reach our Data Protection Officer directly at <a href="mailto:support@jobskaru.com" className="text-indigo-400 hover:underline font-mono font-bold">support@jobskaru.com</a>.
                    </p>
                  </div>
                </div>
              )}

              {/* MODULE 4: HELPLINE */}
              {activeModal === "helpline" && (
                <div className="space-y-4">
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
                    <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-xs uppercase tracking-wider">JobsKaru Technology Help Desk</h4>
                      <p className="text-[10.5px] text-emerald-200 mt-1">
                        For system emergencies, slow SMS deliveries, admin ledger discrepancies, or real-time guard training:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-[#1e2a5e]">
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">📞 System Support</span>
                      <a href="tel:+919920268194" className="text-white hover:text-emerald-400 transition font-mono font-black">+91 99202 68194</a>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">💬 WhatsApp Emergency</span>
                      <a href="https://wa.me/919920268194" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline transition font-mono font-black">+91 99202 68194</a>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">📧 Official Email</span>
                      <a href="mailto:support@jobskaru.com" className="text-indigo-400 hover:underline font-mono">support@jobskaru.com</a>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">⏱️ SLA Response Time</span>
                      <span className="text-white font-bold font-mono">Under 15 Minutes</span>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-500 text-center uppercase tracking-wider font-bold">
                    🛡️ Secured by GateKaru Multi-Tenant Secure Partition
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-[#0e163b] px-5 py-3 border-t border-[#213374] flex justify-between items-center shrink-0 text-[10px] font-mono text-slate-400">
              <span>JobsKaru Enterprise Support</span>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-white font-extrabold hover:text-rose-400 uppercase tracking-wider"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
