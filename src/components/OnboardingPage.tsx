import React, { useState } from "react";
import { User } from "../types";
import { Building2, Shield, Users, Compass, CheckCircle, ArrowRight, Sparkles, Globe } from "lucide-react";
import { getTranslation } from "../utils/translations";

interface OnboardingPageProps {
  currentUser: User;
  globalLang: string;
  onComplete: (selectedOption: string) => void;
  onLanguageChange: (lang: string) => void;
}

export default function OnboardingPage({ currentUser, globalLang, onComplete, onLanguageChange }: OnboardingPageProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (key: string, def: string) => getTranslation(globalLang, key, def);

  const onboardingTranslations: Record<string, Record<string, string>> = {
    en: {
      welcome_title: "Welcome to GateKaru ERP!",
      welcome_subtitle: "The Smart Security & Society Management System",
      para1: "Hello",
      para2: "We are setting up your workspace for",
      question: "What is your primary requirement for this application?",
      question_sub: "Choose how you plan to use GateKaru so we can customize your active dashboard.",
      
      opt1_title: "Residential Building & Housing Society Management",
      opt1_desc: "I need this for our entire residential building/society. This will help with managing residents, automated bills, gate guards, and visitor entries.",
      
      opt2_title: "Individual Flat Security & Pre-Approvals",
      opt2_desc: "I am a resident. I want to pre-approve my personal guests, pay maintenance bills, talk to the committee, and track my incoming visitors.",
      
      opt3_title: "Smart Gate Automation & Guard Patrol Console",
      opt3_desc: "I want to deploy this at the main entrance gate to monitor vehicle entries using ANPR, check-in guests, and track guard security logs.",
      
      opt4_title: "General Exploration & Feature Testing",
      opt4_desc: "I am just exploring and testing the capabilities, modules, and AI features of the GateKaru multitenant application.",
      
      btn_complete: "Complete Setup & Enter Dashboard",
      sms_title: "Welcome SMS Dispatched!",
      sms_desc: "A welcome SMS has been simulated and sent to your registered mobile number: ",
      footer: "Secure multitenant instance registered for Greenwood Heights."
    },
    hi: {
      welcome_title: "गेटकरू (GateKaru) ईआरपी में आपका स्वागत है!",
      welcome_subtitle: "स्मार्ट सुरक्षा और सोसाइटी प्रबंधन प्रणाली",
      para1: "नमस्ते",
      para2: "हम आपके लिए कार्यस्थान स्थापित कर रहे हैं",
      question: "इस एप्लिकेशन के लिए आपकी प्राथमिक आवश्यकता क्या है?",
      question_sub: "चुनें कि आप गेटकरू का उपयोग कैसे करना चाहते हैं ताकि हम आपके डैशबोर्ड को अनुकूलित कर सकें।",
      
      opt1_title: "आवासीय भवन और हाउसिंग सोसाइटी प्रबंधन",
      opt1_desc: "मुझे यह हमारी पूरी आवासीय बिल्डिंग/सोसाइटी के लिए चाहिए। यह निवासियों के प्रबंधन, स्वचालित बिलों, गेट गार्ड और आगंतुकों की प्रविष्टि में मदद करेगा।",
      
      opt2_title: "व्यक्तिगत फ्लैट सुरक्षा और पूर्व-स्वीकृतियां",
      opt2_desc: "मैं एक निवासी हूँ। मैं अपने व्यक्तिगत मेहमानों को पूर्व-स्वीकृत करना चाहता हूँ, बिलों का भुगतान करना चाहता हूँ, और अपने आगंतुकों को ट्रैक करना चाहता हूँ।",
      
      opt3_title: "स्मार्ट गेट ऑटोमेशन और गार्ड गश्ती कंसोल",
      opt3_desc: "मैं इसे मुख्य प्रवेश द्वार पर तैनात करना चाहता हूँ ताकि एएनपीआर (ANPR) का उपयोग करके वाहनों की निगरानी की जा सके और सुरक्षा लॉग ट्रैक किए जा सकें।",
      
      opt4_title: "सामान्य अन्वेषण और सुविधा परीक्षण",
      opt4_desc: "मैं सिर्फ गेटकरू मल्टीटेनेंट एप्लिकेशन की क्षमताओं, मॉड्यूल और एआई सुविधाओं की खोज और परीक्षण कर रहा हूँ।",
      
      btn_complete: "सेटअप पूरा करें और डैशबोर्ड में प्रवेश करें",
      sms_title: "स्वागत संदेश (Welcome SMS) भेजा गया!",
      sms_desc: "आपके पंजीकृत मोबाइल नंबर पर एक स्वागत एसएमएस भेजा गया है: ",
      footer: "ग्रीनवुड हाइट्स के लिए सुरक्षित मल्टीटेनेंट नोड पंजीकृत।"
    },
    mr: {
      welcome_title: "गेटकरू (GateKaru) ईआरपी मध्ये आपले स्वागत आहे!",
      welcome_subtitle: "स्मार्ट सुरक्षा आणि सोसायटी व्यवस्थापन प्रणाली",
      para1: "नमस्कार",
      para2: "आम्ही तुमच्यासाठी कार्यस्थान स्थापित करत आहोत",
      question: "या ॲप्लिकेशनसाठी तुमची प्राथमिक आवश्यकता काय आहे?",
      question_sub: "तुम्ही गेटकरूचा वापर कसा करू इच्छिता ते निवडा जेणेकरून आम्ही तुमचा सक्रिय डॅशबोर्ड सानुकूलित करू शकू.",
      
      opt1_title: "आवासीय इमारत आणि हाउसिंग सोसायटी व्यवस्थापन",
      opt1_desc: "मला हे आमच्या संपूर्ण इमारतीसाठी/सोसायटीसाठी हवे आहे. हे रहिवासी व्यवस्थापन, स्वयंचलित बिले, गेट गार्ड आणि अभ्यागत प्रवेशांमध्ये मदत करेल.",
      
      opt2_title: "वैयक्तिक फ्लॅट सुरक्षा आणि पूर्व-स्वीकृत्या",
      opt2_desc: "मी एक रहिवासी आहे. मला माझ्या वैयक्तिक पाहुण्यांना पूर्व-परवानगी द्यायची आहे, देखभाल बिले भरायची आहेत आणि येणाऱ्या पाहुण्यांचा मागोवा घ्यायचा आहे.",
      
      opt3_title: "स्मार्ट गेट ऑटोमेशन आणि रक्षक गस्त कंसोल",
      opt3_desc: "मला हे मुख्य प्रवेशद्वारावर तैनात करायचे आहे जेणेकरून एएनपीआर (ANPR) वापरून वाहनांवर लक्ष ठेवता येईल आणि सुरक्षा लॉग नोंदवता येतील.",
      
      opt4_title: "सामान्य अन्वेषण आणि वैशिष्ट्य चाचणी",
      opt4_desc: "मी फक्त गेटकरू मल्टीटेनंट ॲप्लिकेशनची क्षमता, मॉड्यूल्स आणि एआय वैशिष्ट्यांचे अन्वेषण आणि चाचणी करत आहे.",
      
      btn_complete: "सेटअप पूर्ण करा आणि डॅशबोर्डमध्ये प्रवेश करा",
      sms_title: "स्वागत संदेश (Welcome SMS) पाठवला गेला!",
      sms_desc: "तुमच्या नोंदणीकृत मोबाईल नंबरवर एक सिम्युलेटेड स्वागत एसएमएस पाठवला गेला आहे: ",
      footer: "ग्रीनवूड हाईट्ससाठी सुरक्षित मल्टीटेनंट नोड नोंदणीकृत."
    }
  };

  const ot = (key: string, def: string) => {
    const lang = (globalLang === "hi" || globalLang === "mr" ? globalLang : "en");
    return onboardingTranslations[lang]?.[key] || def;
  };

  const options = [
    {
      id: "society_management",
      title: ot("opt1_title", "Residential Building & Housing Society Management"),
      description: ot("opt1_desc", "I need this for our entire residential building/society. This will help with managing residents, automated bills, gate guards, and visitor entries."),
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      tag: "BUILDING / SOCIETY"
    },
    {
      id: "flat_security",
      title: ot("opt2_title", "Individual Flat Security & Pre-Approvals"),
      description: ot("opt2_desc", "I am a resident. I want to pre-approve my personal guests, pay maintenance bills, talk to the committee, and track my incoming visitors."),
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      tag: "FLAT SECURITY"
    },
    {
      id: "gate_security",
      title: ot("opt3_title", "Smart Gate Automation & Guard Patrol Console"),
      description: ot("opt3_desc", "I want to deploy this at the main entrance gate to monitor vehicle entries using ANPR, check-in guests, and track guard security logs."),
      icon: <Shield className="w-6 h-6 text-amber-600" />,
      tag: "GATE SECURITY"
    },
    {
      id: "exploration",
      title: ot("opt4_title", "General Exploration & Feature Testing"),
      description: ot("opt4_desc", "I am just exploring and testing the capabilities, modules, and AI features of the GateKaru multitenant application."),
      icon: <Compass className="w-6 h-6 text-slate-600" />,
      tag: "TESTING"
    }
  ];

  const handleSubmit = () => {
    if (!selectedGoal) {
      alert(globalLang === "hi" ? "कृपया आगे बढ़ने के लिए एक विकल्प चुनें!" : globalLang === "mr" ? "कृपया पुढे जाण्यासाठी एक पर्याय निवडा!" : "Please select an option to proceed!");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(selectedGoal);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans text-slate-100">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-5xl flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl italic text-white shadow-lg shadow-indigo-900/30">
            G
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white">{t("app.name", "GateKaru")}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("app.slogan", "Society ERP & Smart Security")}</p>
          </div>
        </div>

        {/* Quick Language Switcher specifically for this screen */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={globalLang}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-indigo-400 focus:outline-none cursor-pointer"
          >
            <option value="en" className="text-slate-900 bg-white font-medium">English</option>
            <option value="hi" className="text-slate-900 bg-white font-medium">हिंदी (Hindi)</option>
            <option value="mr" className="text-slate-900 bg-white font-medium">मराठी (Marathi)</option>
          </select>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 my-6 shadow-2xl z-10 flex flex-col gap-6">
        {/* User Greet Area */}
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-1 bg-indigo-950/80 border border-indigo-800 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>{ot("welcome_subtitle", "Smart Security & Society Management System")}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {ot("welcome_title", "Welcome to GateKaru ERP!")}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {ot("para1", "Hello")}, <strong className="text-indigo-400 font-black">{currentUser.name}</strong> ({currentUser.role}). {ot("para2", "We are setting up your workspace for")} <strong className="text-emerald-400 font-bold">Greenwood Heights Society</strong>.
          </p>
        </div>

        {/* Dynamic Simulated Welcome SMS Box */}
        <div className="bg-indigo-950/40 border border-indigo-900/60 p-4 rounded-2xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center text-xl shrink-0">
            💬
          </div>
          <div>
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider">{ot("sms_title", "Welcome SMS Dispatched!")}</h4>
            <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
              {ot("sms_desc", "A welcome SMS has been simulated and sent to your registered mobile number: ")}
              <span className="font-mono text-white font-bold">{currentUser.phone || "+91 98765 43210"}</span>
            </p>
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl text-[11px] font-mono text-emerald-400 mt-2 font-semibold">
              {globalLang === "hi" 
                ? `[SMS] "नमस्ते ${currentUser.name}! गेटकरू (GateKaru) में आपका स्वागत है। आपकी सोसाइटी Greenwood Heights के लिए डिजिटल गेट सुरक्षा और ईआरपी सक्रिय कर दी गई है।"`
                : globalLang === "mr"
                ? `[SMS] "नमस्कार ${currentUser.name}! गेटकरू (GateKaru) मध्ये आपले स्वागत आहे. तुमच्या सोसायटी Greenwood Heights साठी डिजिटल गेट सुरक्षा आणि ईआरपी सक्रिय केली गेली आहे।"`
                : `[SMS] "Hello ${currentUser.name}! Welcome to GateKaru ERP. Digital Gate Security & Society ERP are now active for Greenwood Heights."`}
            </div>
          </div>
        </div>

        {/* Questionnaire Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white">{ot("question", "What is your primary requirement for this application?")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{ot("question_sub", "Choose how you plan to use GateKaru so we can customize your active dashboard.")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((opt) => {
              const isSelected = selectedGoal === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedGoal(opt.id)}
                  className={`group relative p-4 rounded-2xl border-2 transition cursor-pointer select-none text-left flex flex-col justify-between h-40 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-900/15"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-indigo-900/50 text-white" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"}`}>
                        {opt.icon}
                      </div>
                      <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-500"
                      }`}>
                        {opt.tag}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white mt-3 group-hover:text-indigo-400 transition-colors">
                      {opt.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-3 text-indigo-400">
                      <CheckCircle className="w-5 h-5 fill-indigo-950" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-800 pt-5 flex items-center justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedGoal}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
              !selectedGoal
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-950/50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Setting up...</span>
              </span>
            ) : (
              <>
                <span>{ot("btn_complete", "Complete Setup & Enter Dashboard")}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="shrink-0 z-10 text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-widest text-center mt-3">
        {ot("footer", "Secure multitenant instance registered for Greenwood Heights.")}
      </div>
    </div>
  );
}
