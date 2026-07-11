export interface FestivalTheme {
  id: string;
  name: string;
  hindiName: string;
  startMonth: number; // 1-12
  startDay: number; // 1-31
  gradientClass: string; // Tailwind bg-gradient-to-...
  textAccentClass: string; // text color or highlight
  floatingEmojis: string[]; // Emojis that float in background
  accentColor: string; // HEX or slate color for buttons
  bannerImage: string; // Decorative text or description
  greeting: string; // Hindi greeting
  englishGreeting: string; // English greeting
  soundToneFreq: number; // custom pleasant frequency
}

export const FESTIVALS: FestivalTheme[] = [
  {
    id: "sawan",
    name: "Monsoon Sawan Festival",
    hindiName: "सावन उत्सव",
    startMonth: 7,
    startDay: 8, // Automatically active on current local time July 8!
    gradientClass: "from-sky-900 via-teal-800 to-emerald-950",
    textAccentClass: "text-emerald-300",
    floatingEmojis: ["☔", "🌧️", "⛈️", "🌱", "🐸", "🌸"],
    accentColor: "#059669",
    bannerImage: "🌧️ Sawan Somwar / Monsoon Rain Greetings!",
    greeting: "सभी निवासियों को पवित्र सावन मास की हार्दिक शुभकामनाएं! हर हर महादेव।",
    englishGreeting: "Wishing everyone a refreshing and peaceful Sawan and Monsoon season!",
    soundToneFreq: 330
  },
  {
    id: "diwali",
    name: "Diwali Festival of Lights",
    hindiName: "दीपावली महोत्सव",
    startMonth: 11,
    startDay: 8,
    gradientClass: "from-amber-950 via-orange-900 to-yellow-950",
    textAccentClass: "text-yellow-400",
    floatingEmojis: ["🪔", "✨", "💥", "🏵️", "🍯", "🌟"],
    accentColor: "#d97706",
    bannerImage: "🪔 Shubh Deepawali / festival of lights greetings!",
    greeting: "दीपावली के इस पावन पर्व पर आपके जीवन में सुख, समृद्धि और प्रकाश का संचार हो। शुभ दीपावली!",
    englishGreeting: "May the divine light of Diwali shine peace, prosperity, and happiness in your home!",
    soundToneFreq: 440
  },
  {
    id: "holi",
    name: "Holi Festival of Colors",
    hindiName: "होली उत्सव",
    startMonth: 3,
    startDay: 10,
    gradientClass: "from-pink-900 via-purple-900 to-rose-950",
    textAccentClass: "text-pink-300",
    floatingEmojis: ["🎨", "💦", "🎭", "🍿", "🍧", "🌟"],
    accentColor: "#db2777",
    bannerImage: "🎨 Happy Holi / Festival of Colors Greetings!",
    greeting: "होली के पावन अवसर पर आपके जीवन में खुशियों के सुंदर रंग बरसें। होली मुबारक!",
    englishGreeting: "May the splash of vibrant colors paint your life with boundless joy and harmony!",
    soundToneFreq: 523
  },
  {
    id: "eid",
    name: "Eid Mubarak",
    hindiName: "ईद मुबारक",
    startMonth: 4,
    startDay: 1,
    gradientClass: "from-emerald-950 via-teal-900 to-indigo-950",
    textAccentClass: "text-yellow-300",
    floatingEmojis: ["🌙", "✨", "🕌", "📿", "🕋", "🎁"],
    accentColor: "#0f766e",
    bannerImage: "🌙 Shubh Eid-ul-Fitr Greetings!",
    greeting: "आपको और आपके परिवार को ईद की दिली मुबारकबाद। ईद मुबारक!",
    englishGreeting: "Wishing you and your family a blessed, joyful, and peaceful Eid-ul-Fitr!",
    soundToneFreq: 392
  },
  {
    id: "independence",
    name: "Independence Day",
    hindiName: "स्वतंत्रता दिवस",
    startMonth: 8,
    startDay: 15,
    gradientClass: "from-orange-950 via-slate-900 to-emerald-950",
    textAccentClass: "text-orange-400",
    floatingEmojis: ["🇮🇳", "🎈", "🎖️", "🕊️", "🎶", "🦁"],
    accentColor: "#ea580c",
    bannerImage: "🇮🇳 79th Independence Day Greetings / जय हिन्द!",
    greeting: "समस्त देशवासियों को स्वतंत्रता दिवस की हार्दिक शुभकामनाएं। जय हिंद, जय भारत!",
    englishGreeting: "Saluting the heroes and celebrating the glorious spirit of freedom. Happy Independence Day!",
    soundToneFreq: 587
  },
  {
    id: "janmashtami",
    name: "Krishna Janmashtami",
    hindiName: "कृष्णा जन्माष्टमी",
    startMonth: 8,
    startDay: 25,
    gradientClass: "from-sky-950 via-indigo-950 to-emerald-950",
    textAccentClass: "text-amber-400",
    floatingEmojis: ["🪈", "🏺", "🦚", "🍯", "🌸", "✨"],
    accentColor: "#4f46e5",
    bannerImage: "🪈 Jai Shri Krishna / Janmashtami Greetings!",
    greeting: "श्री कृष्ण जन्माष्टमी की हार्दिक शुभकामनाएं! भगवान श्री कृष्ण आपको सुख, शांति और समृद्धि प्रदान करें।",
    englishGreeting: "Wishing you a butter-sweet and extremely blessed Krishna Janmashtami celebration!",
    soundToneFreq: 494
  },
  {
    id: "christmas",
    name: "Merry Christmas",
    hindiName: "क्रिसमस पर्व",
    startMonth: 12,
    startDay: 25,
    gradientClass: "from-red-950 via-slate-900 to-emerald-950",
    textAccentClass: "text-rose-400",
    floatingEmojis: ["🎄", "🎅", "❄️", "🎁", "🔔", "🌟"],
    accentColor: "#dc2626",
    bannerImage: "🎄 Merry Christmas & Happy New Year!",
    greeting: "प्रभु ईसा मसीह के जन्मदिवस क्रिसमस की आप सभी को हार्दिक बधाई एवं मंगलकामनाएं!",
    englishGreeting: "Wishing you a merry, bright, and delightful Christmas filled with sweet melodies!",
    soundToneFreq: 659
  }
];

/**
 * Returns the currently active festival based on simulatedDate or current system date.
 * If override is provided, returns that immediately.
 * A festival is active for EXACTLY 2 days (i.e. startDay and startDay + 1).
 */
export function getActiveFestival(simulatedDateStr?: string, activeOverride?: string): FestivalTheme | null {
  if (activeOverride && activeOverride !== "none") {
    const matched = FESTIVALS.find(f => f.id === activeOverride);
    if (matched) return matched;
  }

  // Parse check date
  let checkDate = new Date();
  if (simulatedDateStr) {
    const parsed = new Date(simulatedDateStr);
    if (!isNaN(parsed.getTime())) {
      checkDate = parsed;
    }
  }

  const checkYear = checkDate.getFullYear();
  
  for (const festival of FESTIVALS) {
    // Construct festival start Date for current check year
    const start = new Date(checkYear, festival.startMonth - 1, festival.startDay, 0, 0, 0);
    // End is start + 2 days (48 hours)
    const end = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    if (checkDate.getTime() >= start.getTime() && checkDate.getTime() < end.getTime()) {
      return festival;
    }
  }

  return null;
}
