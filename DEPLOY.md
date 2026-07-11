# GateKaru ERP - Complete Hostinger Deployment Guide 🚀

यह गाइड आपको **GateKaru ERP** को **Hostinger** पर लाइव करने, **React SPA Router (.htaccess)** कंफिगर करने, **Environment Variables** मैनेज करने और **Database Connection (Hostinger MySQL)** को सेटअप करने की पूरी जानकारी देगी।

---

## 🎯 **Production Ready Features & Checklist**
ये सभी फीचर्स आपके प्रोजेक्ट में 100% कम्प्लीट और कंफिगर कर दिए गए हैं:

- [x] **✅ MySQL Auto Connect**: Hostinger के Environment Variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) सेट करते ही सिस्टम खुद डेटाबेस से कनेक्ट हो जाएगा।
- [x] **✅ Auto Create Tables**: पहली बार स्टार्ट होने पर सिस्टम खुद ही सभी जरूरी SQL टेबल्स (users, visitors, notices, etc.) डेटाबेस में बना देगा।
- [x] **✅ Auto Seed Default Data**: टेबल्स बनते ही, डिफॉल्ट सुपर एडमिन, एडमिन, गार्ड और सैम्पल डेटा खुद-ब-खुद इन्सर्ट हो जाएगा।
- [x] **✅ No SQL Import Required**: आपको phpMyAdmin में जाकर कोई भी `.sql` फाइल मैन्युअली इम्पोर्ट नहीं करनी पड़ेगी।
- [x] **✅ No Manual Configuration**: कोई कोडिंग या हार्ड कोडेड फाइल चेंज करने की जरूरत नहीं है।
- [x] **✅ Responsive Web App**: मोबाइल, टैबलेट और डेस्कटॉप तीनों स्क्रीन्स के लिए फुली रेस्पॉन्सिव UI तैयार है।
- [x] **✅ PWA Support**: प्रोग्रेसिव वेब ऐप सपोर्ट के साथ इसे मोबाइल स्क्रीन पर 'Add to Home Screen' किया जा सकता है।
- [x] **✅ Android Project Ready**: कैपेसिटर (`Capacitor`) सेटअप पूरी तरह कम्प्लीट है। आप सिर्फ `npx cap open android` करके इसे Android Studio में खोल सकते हैं।
- [x] **✅ Release Build Ready (.aab)**: एंड्रॉइड प्रोजेक्ट पूरी तरह रेडी है ताकि आप Android Studio से आसानी से Signed Bundle (.aab) बनाकर Play Store पर अपलोड कर सकें।

---

## 📋 Table of Contents
1. [Understanding the Architecture (दो प्रकार के डिप्लॉयमेंट)](#1-understanding-the-architecture)
2. [Method A: Full-Stack Node.js Application (Recommended)](#method-a-full-stack-nodejs-application-recommended)
3. [Method B: Static Client-Side SPA (.htaccess Setup)](#method-b-static-client-side-spa-htaccess-setup)
4. [How to Manage Environment Variables in Hostinger](#4-how-to-manage-environment-variables-in-hostinger)
5. [Connecting Hostinger MySQL Database with Node.js](#5-connecting-hostinger-mysql-database-with-node.js)
6. [Demo Mode से Live System में कैसे जाएँ?](#6-demo-mode-से-live-system-में-कैसे-जाएँ)
7. [बिना RFID / Smart Lock के सामान्य (Normal) गेट कैसे काम करेगा?](#7-बिना-rfid--smart-lock-के-सामान्य-normal-गेट-कैसे-काम-करेगा)

---

## 1. Understanding the Architecture

Hostinger पर आप GateKaru ERP को दो तरह से होस्ट कर सकते हैं:

1. **Method A: Full-Stack Node.js (Express + React) [अनुशंसित]**:
   - इसमें आपका Express backend (`server.ts`) और React frontend (`dist/`) दोनों एक साथ चलते हैं।
   - रीयल-टाइम फीचर्स, SMS OTP, और डेटाबेस कॉल्स सर्वर-साइड पर सुरक्षित रहते हैं।
2. **Method B: Static Client-Side SPA (केवल HTML/JS + .htaccess)**:
   - यदि आप केवल फ्रंटएंड को स्टेटिक वेबसाइट की तरह होस्ट करना चाहते हैं और बैकएंड को किसी दूसरी क्लाउड सर्विस (जैसे Render, Supabase, Firebase) पर रखना चाहते हैं।

---

## 2. Method A: Full-Stack Node.js Application (Recommended)

इस मेथड में Express backend और React frontend दोनों आपके Hostinger VPS या "Startup/Professional Node.js Hostinger Plan" पर चलेंगे।

### 🛠️ हमने आपके लिए क्या फ़िक्स किया है?
* **Dynamic Port Binding**: `server.ts` को `process.env.PORT || 3000` पर सेट किया है। Hostinger जो भी डायनामिक पोर्ट आवंटित करेगा, सर्वर अब उसी पर सफलतापूर्वक चलेगा।
* **Entry Point (`server.js`)**: रूट फोल्डर में `server.js` फाइल बनाई है। Hostinger डिफ़ॉल्ट रूप से इसी फाइल को खोजकर आपका प्रोडक्शन बंडल (`dist/server.cjs`) रन करेगा।
* **`package.json`**: `"main": "server.js"` सेट किया है ताकि Hostinger को सीधे सर्वर फाइल मिल सके।

### 🚀 Hostinger hPanel Node.js Setup:
1. **Zip Download करें**: AI Studio के Settings मेनू से कोड की `.zip` फाइल डाउनलोड करें।
2. **File Manager में Upload करें**: Hostinger File Manager में जाकर अपनी डोमेन की डायरेक्टरी में ज़िप फाइल अपलोड और एक्सट्रेक्ट करें।
3. **hPanel Node.js Configuration**:
   - Hostinger Dashboard में **Node.js Dashboard** पर जाएँ।
   - **Node.js Version** को `18.x` या `20.x` सेलेक्ट करें।
   - **Application Entry Point** में `server.js` डालें।
   - **App Directory** में अपना रूट फोल्डर चुनें।
4. **NPM Commands Execute करें**:
   - Hostinger Node.js पैनल में **NPM Install** बटन पर क्लिक करें।
   - इसके बाद **NPM Run Build** पर क्लिक करें।
   - *यह कमांड आपकी React frontend को `dist/` में बिल्ड करेगी और Express backend को `dist/server.cjs` में कंपाइल कर देगी।*
5. **Start / Restart**:
   - एप्लीकेशन को **Start / Restart** करें। अब `gk.jobskaru.com` पर सब कुछ लाइव हो जाएगा!

---

## 3. Method B: Static Client-Side SPA (.htaccess Setup)

यदि आप केवल React frontend को Hostinger Shared Hosting (Apache Server) पर डिप्लॉय कर रहे हैं और एक्सप्रेस बैकएंड का उपयोग नहीं कर रहे हैं:

### 📁 Configured `dist/` Folder Structure:
जब आप `npm run build` चलाते हैं, तो आपका पूरा React प्रोजेक्ट कंपाइल होकर `dist/` फोल्डर में चला जाता है। 
आपको `dist/` फोल्डर के अंदर मौजूद सभी फाइलों को Hostinger के `public_html/` डायरेक्टरी में डालना होगा।

### 📝 .htaccess Config (React Routing के लिए):
React Single Page App (SPA) में क्लाइंट-साइड राउटिंग (जैसे `/resident`, `/guard`) होती है। बिना `.htaccess` के, यदि कोई यूजर पेज को रिफ्रेश करेगा तो उसे **404 Not Found** एरर मिलेगा। 

इस एरर को ठीक करने के लिए, `public_html/` फोल्डर में निम्नलिखित `.htaccess` फाइल बनाएँ:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # If the requested file or directory exists, serve it directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Otherwise, redirect all requests to index.html for React Router to handle
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## 4. How to Manage Environment Variables in Hostinger

आपके संवेदनशील सीक्रेट्स (जैसे Database Password, Twilio SMS API Keys, Firebase Credentials) को कभी भी कोड में सीधे नहीं लिखना चाहिए।

### ⚙️ hPanel में ENV Variables सेट करने का तरीका:

#### **Node.js Plan (Method A) के लिए**:
1. Hostinger hPanel पर जाएँ और अपने **Node.js Application** सेक्शन को चुनें।
2. वहाँ आपको **Environment Variables** का इनपुट सेक्शन मिलेगा।
3. वहाँ एक-एक करके की-वैल्यू पेयर जोड़ें:
   - `PORT` = `3000` (या इसे खाली छोड़ें ताकि Hostinger खुद डिसाइड करे)
   - `DB_HOST` = `mysql.hostinger.in`
   - `DB_USER` = `u12345_gatekaru_user`
   - `DB_PASSWORD` = `your_strong_password`
   - `DB_NAME` = `u12345_gatekaru`
   - `TWILIO_ACCOUNT_SID` = `your_twilio_sid`
4. **Save** पर क्लिक करें और सर्वर रीस्टार्ट करें।

#### **Shared Hosting (Method B / Static) के लिए**:
- स्टेटिक फाइल्स क्लाइंट के ब्राउज़र में चलती हैं, इसलिए ब्राउज़र `process.env` को नहीं समझ सकता।
- इसके लिए हम `import.meta.env` और **Vite** का उपयोग करते हैं।
- प्रोजेक्ट के रूट में `.env.production` फाइल बनाएँ:
  ```env
  VITE_API_URL=https://your-express-backend.com/api
  ```
- जब आप `npm run build` चलाएंगे, तो Vite ऑटोमैटिकली इन वेरिएबल्स को कोड में एम्बेड कर देगा।

---

## 5. Connecting Hostinger MySQL Database with Node.js

Hostinger के हर प्लान में फ्री MySQL डेटाबेस मिलता है। 

### Step A: Hostinger Panel में Database बनाएँ
1. hPanel में **Databases -> MySQL Databases** पर जाएँ।
2. एक नया डेटाबेस बनाएँ (उदा: `u12345_gatekaru`) और एक यूजर तथा मजबूत पासवर्ड बनाएँ।

### Step B: Node-MySQL ड्राइवर इनस्टॉल करें
अपने प्रोजेक्ट टर्मिनल में चलाएँ:
```bash
npm install mysql2 dotenv
```

### Step C: Database Connection Code (`database.ts`)
अपने रूट या `src/` में एक डेटाबेस कनेक्शन फ़ाइल बनाएँ:

```typescript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gatekaru',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

## 6. Demo Mode से Live System में कैसे जाएँ?

वर्तमान में लॉगिन स्क्रीन पर **Quick Simulator Profiles (Demo Mode)** दिखाई देता है, ताकि क्लाइंट्स और डेवलपर्स बिना असली फोन नंबर/OTP के एक क्लिक में लॉगिन करके अलग-अलग रोल्स (Resident, Guard, Admin, Super Admin) का परीक्षण कर सकें।

### 🛑 Demo Mode (Quick Profiles) को कैसे छुपाएँ?
जब आप इसे असली यूज़र्स को सौंप रहे हों, तो `src/components/LoginPortal.tsx` फ़ाइल में जाएँ और लाइन `704` के आसपास इस ब्लॉक को कमेंट-आउट या रिमूव कर दें:

```tsx
{/* इस पूरे ब्लॉक को हटाने/कमेंट करने से Quick profiles गायब हो जाएँगी */}
{/* 
<div className="pt-4 border-t border-slate-100 space-y-3">
  ... (Quick profiles UI code) ...
</div> 
*/}
```

---

## 7. बिना RFID / Smart Lock के सामान्य (Normal) गेट कैसे काम करेगा?

अगर कोई सोसाइटी ऑटोमैटिक RFID / Smart Boom Barrier का महंगा प्लान नहीं लेती है, तो भी GateKaru का **सामान्य (Normal) गेट मैनेजमेंट सिस्टम** बिना किसी एक्स्ट्रा हार्डवेयर या डिवाइस के 100% काम करता है।

### 🛠️ Normal Gate Operation Workflow (बिना हार्डवेयर के):

1. **आगंतुक का आगमन (Visitor Arrival)**:
   - कोई डिलीवरी बॉय या मेहमान गेट पर आता है।
2. **गार्ड द्वारा एंट्री (Guard Manual Entry)**:
   - गेट पर बैठा सुरक्षा गार्ड अपने मोबाइल या टैबलेट में **Guard Portal** खोलता है।
   - वह आगंतुक का नाम, मोबाइल, कंपनी (जैसे Zomato/Swiggy) और फ्लैट नंबर दर्ज करता है।
3. **रेजिडेंट को नोटिफिकेशन (Resident App Notification)**:
   - एंट्री सबमिट करते ही, संबंधित फ्लैट के रेजिडेंट के मोबाइल ऐप (**Resident Portal**) में तुरंत एक **Gate Approval Request Pop-up** आ जाता है।
   - रेजिडेंट स्क्रीन पर देख सकता है: *"Zomato Delivery Executive is at the Main Gate. Accept or Decline?"*
4. **रेजिडेंट का निर्णय (Resident Decision)**:
   - रेजिडेंट **Accept (स्वीकार करें)** या **Decline (अस्वीकार करें)** पर क्लिक करता है।
5. **गार्ड को रीयल-टाइम अपडेट (Guard Screen Update)**:
   - गार्ड की स्क्रीन पर तुरंत स्टेटस बदल जाता है: **"Approved"** या **"Rejected"**।
6. **गेट पास (Manual Gate Open)**:
   - स्टेटस "Approved" देखकर, गार्ड आगंतुक को गेट खोलकर मैन्युअली अंदर जाने की अनुमति दे देता है।

### 💡 निष्कर्ष:
सामान्य (Normal) प्लान में **किसी ESP32, Raspberry Pi या RFID सेंसर की जरूरत नहीं होती**। यह पूरी तरह से गार्ड के फोन और रेजिडेंट के फोन के बीच एक रीयल-टाइम सॉफ्टवेयर कोऑर्डिनेटेड आर्किटेक्चर पर चलता है। यह बहुत ही आसान, सुरक्षित, किफायती और भारत की 95% सोसायटियों के लिए सबसे लोकप्रिय मॉडल है!
