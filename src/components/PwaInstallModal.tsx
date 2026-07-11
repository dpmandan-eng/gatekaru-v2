import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Share, PlusSquare, ArrowUp, Download, Smartphone, CheckCircle, Info } from "lucide-react";

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAutomatedSupported: boolean;
  onInstallAutomated: () => void;
  globalLang: string;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  isAutomatedSupported,
  onInstallAutomated,
  globalLang
}) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Bilingual translation helper
  const t = (en: string, hi: string) => {
    return globalLang === "hi" ? hi : en;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-100 flex flex-col text-slate-800"
          >
            {/* Header with Logo */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src="/logo.svg"
                  alt="GateKaru Logo"
                  className="w-14 h-14 rounded-2xl bg-white p-1 shadow-inner object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                    GateKaru PWA App
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold px-2 py-0.5 rounded-full">
                      Offline Ready
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {t(
                      "Install as mobile app for quick access & real-time alerts",
                      "त्वरित उपयोग और अलर्ट के लिए मोबाइल ऐप के रूप में इंस्टॉल करें"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {isAutomatedSupported ? (
                // Automated browser installer available
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Download className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-base">
                      {t("One-Click Safe Install", "एक-क्लिक सुरक्षित इंस्टॉलेशन")}
                    </h4>
                    <p className="text-xs text-slate-500 px-4">
                      {t(
                        "Install GateKaru on your home screen. It uses minimal space and updates automatically.",
                        "अपने होम स्क्रीन पर GateKaru इंस्टॉल करें। यह कम जगह लेता है और स्वचालित रूप से अपडेट होता है।"
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onInstallAutomated();
                      onClose();
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    🚀 {t("INSTALL NOW (अभी इंस्टॉल करें)", "अभी इंस्टॉल करें")}
                  </button>
                </div>
              ) : isIOS ? (
                // iOS Custom Safari instructions
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 rounded-2xl text-amber-800 text-xs font-semibold border border-amber-100">
                    <Smartphone className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      {t(
                        "iOS Safari requires manual action to install applications.",
                        "iOS Safari में ऐप्स इंस्टॉल करने के लिए मैन्युअल प्रक्रिया की आवश्यकता होती है।"
                      )}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">
                      {t("How to Install on iPhone / iPad:", "iPhone / iPad पर कैसे इंस्टॉल करें:")}
                    </h4>

                    {/* Step 1 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {t("Click the Share button", "शेयर बटन (Share) पर क्लिक करें")}
                          <Share className="w-3.5 h-3.5 text-slate-500 inline" />
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t("Found at the bottom menu of Safari browser.", "Safari ब्राउज़र के निचले मेनू में पाया जाता है।")}
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {t("Choose 'Add to Home Screen'", "पसंद करें 'Add to Home Screen'")}
                          <PlusSquare className="w-3.5 h-3.5 text-slate-500 inline" />
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t("Scroll down the share list to find this option.", "इस विकल्प को खोजने के लिए शेयर सूची को नीचे स्क्रॉल करें।")}
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {t("Click 'Add' in the top right", "ऊपर दाईं ओर 'Add' पर क्लिक करें")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t("The GateKaru App will instantly appear on your home screen!", "GateKaru ऐप तुरंत आपकी होम स्क्रीन पर दिखाई देगा!")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer"
                  >
                    {t("Got it, let's do it!", "समझ गया, चलिए करते हैं!")}
                  </button>
                </div>
              ) : (
                // Fallback for Chrome/Firefox/Safari on desktop or other platforms where prompt hasn't fired yet
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 p-3 bg-indigo-50 rounded-2xl text-indigo-800 text-xs font-semibold border border-indigo-100">
                    <Info className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
                    <span>
                      {t(
                        "Install from your browser search bar or menu options directly.",
                        "सीधे अपने ब्राउज़र के सर्च बार या मेनू विकल्पों से इंस्टॉल करें।"
                      )}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">
                      {t("Instructions:", "निर्देश:")}
                    </h4>

                    {/* Desktop Step */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {t("Click the Install icon in the browser address bar", "ब्राउज़र एड्रेस बार में इंस्टॉल आइकन पर क्लिक करें")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t("Usually looks like a desktop/laptop monitor with an arrow, or (+) icon.", "आमतौर पर यह मॉनिटर के साथ तीर या (+) आइकन जैसा दिखता है।")}
                        </p>
                      </div>
                    </div>

                    {/* Menu Step */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {t("Or open the browser menu (⋮ / ⋯)", "या ब्राउज़र मेनू (⋮ / ⋯) खोलें")}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t("Click 'Save and Share' or 'Install app...' in the menu.", "मेनू में 'Save and Share' या 'Install app...' पर क्लिक करें।")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer"
                  >
                    {t("Close", "बंद करें")}
                  </button>
                </div>
              )}
            </div>

            {/* Footer / App Details */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>GateKaru Secure Ecosystem • V2.4.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
