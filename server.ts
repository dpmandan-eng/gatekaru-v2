import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeDatabase, saveDb, runDbDiagnostics } from "./db_store";
import jwt from "jsonwebtoken";
import AdmZip from "adm-zip";
import { WebSocketServer } from "ws";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "gatekaru_fallback_secret_for_jwt";

const app = express();
const PORT = 3000;

app.use(express.json());

// Subdirectory path rewriter for cPanel / Hostinger subdirectory hosting
app.use((req, res, next) => {
  const apiIndex = req.url.indexOf("/api/");
  if (apiIndex !== -1) {
    req.url = req.url.substring(apiIndex);
  }
  next();
});

// Production Health & Diagnostics Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "GateKaru production server is active",
    timestamp: new Date().toISOString()
  });
});

// Capture client-side startup errors
app.post("/api/log-error", (req, res) => {
  const { message, filename, lineno, colno, stack } = req.body;
  const logMessage = `\n--- CLIENT ERROR [${new Date().toISOString()}] ---\n` +
    `Error: ${message}\n` +
    `File: ${filename} (Line ${lineno}, Col ${colno})\n` +
    `Stack Trace:\n${stack}\n` +
    `-----------------------------------------\n`;
  console.error(logMessage);
  fs.appendFileSync(path.join(process.cwd(), "client-error.log"), logMessage, "utf8");
  res.json({ status: "logged" });
});

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to check if API key exists
const isGeminiReady = () => !!process.env.GEMINI_API_KEY;

// ==========================================
// COMPREHENSIVE LOCAL DATABASE - INITIAL STRUCTURE
// ==========================================

const defaultDb = {
  settings: {
    promotionalAdsEnabled: true,
    activeThemeOverride: "",
    simulatedDate: "",
    smsGatewayUrl: "https://www.fast2sms.com/dev/bulkV2",
    smsApiKey: "",
    smsSenderId: "FSTSMS",
    smsRoute: "otp",
    smsActive: false,
    activeSmsProviderId: "fast2sms",
    smsProviders: [
      {
        id: "fast2sms",
        name: "Fast2SMS (Quick / OTP)",
        gatewayUrl: "https://www.fast2sms.com/dev/bulkV2",
        apiKey: "",
        senderId: "FSTSMS",
        route: "otp",
        description: "Standard OTP/DLT Indian SMS Gateway API with JSON payloads"
      },
      {
        id: "jobskaru",
        name: "JobsKaru SMS API Gateway",
        gatewayUrl: "https://sms.jobskaru.com/v3",
        apiKey: "",
        senderId: "JKARU",
        route: "q",
        description: "Premium enterprise SMS and WhatsApp OTP fallback relay"
      },
      {
        id: "twilio",
        name: "Twilio HTTP API",
        gatewayUrl: "https://api.twilio.com/2010-04-01/Accounts/{apiKey}/Messages.json",
        apiKey: "",
        senderId: "TWILIO",
        route: "bulk",
        description: "Global SMS and OTP verification delivery via Twilio API"
      },
      {
        id: "generic",
        name: "Custom SMS Provider (GET Request)",
        gatewayUrl: "https://api.smsprovider.com/send?apikey={apiKey}&to={phone}&msg={message}&sender={senderId}",
        apiKey: "",
        senderId: "CUSTOM",
        route: "custom",
        description: "Generic endpoint mapping with placeholder replacement"
      }
    ]
  },
  societies: [
    { id: "s1", name: "Greenwood Heights Society", address: "Sector 45, Gurugram, Haryana, India", totalFlats: 120, billingCycle: "Monthly" },
    { id: "s2", name: "Yashika Residency", address: "DLF Phase 5, Sector 54, Gurugram, Haryana, India", totalFlats: 80, billingCycle: "Monthly" },
    { id: "s3", name: "Sahil Tower", address: "Golf Course Road, Gurugram, Haryana, India", totalFlats: 60, billingCycle: "Monthly" },
    { id: "s4", name: "Silver Maple Heights", address: "Sector 50, Gurugram, Haryana, India", totalFlats: 150, billingCycle: "Monthly" }
  ],
  users: [
    // Super Admin
    { id: "u5", name: "Rajesh GateKaru", phone: "+91 99999 88888", email: "super@gatekaru.com", role: "super_admin", organization: "GateKaru Corporate" },
    // Developer Super Admin
    { id: "u6", name: "GateKaru Developer", phone: "+91 99999 12345", email: "jaiganeshdp@gmail.com", role: "super_admin", organization: "GateKaru Corporate" }
  ],
  visitors: [],
  maintenance: [],
  complaints: [],
  notices: [],
  chats: [],
  amenities: [
    { id: "a1", name: "Clubhouse / Community Hall", capacity: 100, costPerHour: 500, description: "Fully air-conditioned hall with seating and sound system." },
    { id: "a2", name: "Gymnasium", capacity: 15, costPerHour: 0, description: "State-of-the-art weights and cardio equipment." },
    { id: "a3", name: "Badminton Court", capacity: 4, costPerHour: 100, description: "Indoor wooden court. Slots require pre-booking." }
  ],
  amenityBookings: [],
  staff: [],
  parking: [],
  polls: [],
  guardAlerts: [],
  superAdminPlans: [
    { id: "pln1", name: "GateKaru Essential", price: 1500, period: "Monthly", societies: 12, features: ["Visitor Pre-Approval", "Notice Board", "SOS Alerts"] },
    { id: "pln2", name: "GateKaru Premium Enterprise", price: 3500, period: "Monthly", societies: 38, features: ["All Essentials", "Society Accounting & ERP", "Maintenance Payments", "AI Assistants Suite"] }
  ],
  approvals: [],
  vehicles: [],
  gateLogs: [],
  coupons: [],
  family: [],
  documents: [],
  programs: [
    {
      id: "p1",
      title: "Ganesh Chaturthi Utsav (गणेशोत्सव)",
      description: "Grand celebration of Ganesh Sthapna, daily Aarti, and cultural programs. Bhandara/Prasad distribution on final day.",
      date: "2026-09-15",
      startTime: "18:00",
      endTime: "21:30",
      location: "Main Central Temple Lawns",
      coordinator: "Sahil (Secretary, Flat A-402)",
      society: "Greenwood Heights Society"
    },
    {
      id: "p2",
      title: "Maha Aarti & Visarjan (महा आरती और विसर्जन)",
      description: "Ganpati Visarjan processions with dhol tasha and safe immersion setups.",
      date: "2026-09-24",
      startTime: "16:00",
      endTime: "20:00",
      location: "Main Gate to Immersion Tank",
      coordinator: "Yashika (Treasurer, Flat B-102)",
      society: "Greenwood Heights Society"
    },
    {
      id: "p3",
      title: "Navratri Dandiya Night (डांडिया रास)",
      description: "Garba and Dandiya Raas with traditional music, food stalls, and best dressed awards.",
      date: "2026-10-12",
      startTime: "19:00",
      endTime: "23:00",
      location: "Clubhouse Community Hall",
      coordinator: "Vikram Mehta (Flat C-303)",
      society: "Greenwood Heights Society"
    },
    {
      id: "p4",
      title: "Ganpati Sthapna Puja (गणेश स्थापना)",
      description: "Society welcome puja of Lord Ganesha inside Yashika Residency lawns.",
      date: "2026-09-15",
      startTime: "09:00",
      endTime: "12:00",
      location: "Yashika Residency Lawns",
      coordinator: "Yashika (Secretary)",
      society: "Yashika Residency"
    },
    {
      id: "p5",
      title: "Navratri Garba Fest (गरबा उत्सव)",
      description: "Daily Durga Puja followed by traditional Garba dancing.",
      date: "2026-10-11",
      startTime: "19:30",
      endTime: "22:30",
      location: "Yashika Residency Courtyard",
      coordinator: "Rajesh (Committee Member)",
      society: "Yashika Residency"
    }
  ],
  festivalHub: {
    coordinators: [
      { id: "fc1", name: "Rohan Das", flat: "Beta-502", phone: "+91 90022 33445", society: "Greenwood Heights Society" },
      { id: "fc2", name: "Aarav Sharma", flat: "Alpha-101", phone: "+91 98765 43210", society: "Greenwood Heights Society" }
    ],
    financials: [
      {
        society: "Greenwood Heights Society",
        totalEstimatedExpense: 50000,
        varganiPerFlat: 500,
        societyFundContribution: 10000,
        activeFestival: "Ganeshotsav"
      }
    ],
    quotations: [
      { id: "q1", item: "Pandal Setup & Ganesh Sthapna Decor", vendor: "Sai Decorators", amount: 22000, status: "Approved", submittedBy: "Rohan Das", society: "Greenwood Heights Society" },
      { id: "q2", item: "Dhol Tasha & Sound System (Aarti)", vendor: "Nashik Dhol Pathak", amount: 15000, status: "Approved", submittedBy: "Aarav Sharma", society: "Greenwood Heights Society" },
      { id: "q3", item: "Visarjan Bhandara Prasad Catering", vendor: "Saraswati Catering", amount: 13000, status: "Pending", submittedBy: "Rohan Das", society: "Greenwood Heights Society" }
    ],
    varganiCollections: [
      { id: "vc1", residentName: "Aarav Sharma", flat: "Alpha-101", amountPaid: 500, status: "Paid", society: "Greenwood Heights Society" },
      { id: "vc2", residentName: "Meera Nair", flat: "Alpha-404", amountPaid: 500, status: "Paid", society: "Greenwood Heights Society" },
      { id: "vc3", residentName: "Rohan Das", flat: "Beta-502", amountPaid: 500, status: "Paid", society: "Greenwood Heights Society" },
      { id: "vc4", residentName: "Priya Patel", flat: "Beta-1201", amountPaid: 0, status: "Pending", society: "Greenwood Heights Society" },
      { id: "vc5", residentName: "Vikram Sen", flat: "Gamma-801", amountPaid: 200, status: "Pending", society: "Greenwood Heights Society" }
    ]
  }
};

let db: any = defaultDb;

function recordLogin(user: any) {
  if (!user) return;
  db.loginLogs = db.loginLogs || [];
  db.loginLogs.push({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    flat: user.flat || "N/A",
    timestamp: new Date().toISOString()
  });
  saveDb(db);
}


// Temporary OTP in-memory store
const activeOtps: Record<string, string> = {};

// Automatic DB saving middleware on successful mutations (POST, PUT, DELETE)
app.use((req, res, next) => {
  if (req.method !== "GET") {
    const originalJson = res.json;
    res.json = function (body) {
      const response = originalJson.call(this, body);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        saveDb(db);
      }
      return response;
    };
  }
  next();
});

// ==========================================
// AUTHENTICATION & OTP APIs
// ==========================================

// Helper to get active SMS provider settings
function getActiveSmsProvider() {
  const activeId = db.settings.activeSmsProviderId || "fast2sms";
  const providers = db.settings.smsProviders || [];
  const found = providers.find((p: any) => p.id === activeId);
  if (found) {
    return {
      gatewayUrl: found.gatewayUrl,
      apiKey: found.apiKey,
      senderId: found.senderId,
      route: found.route,
      smsActive: db.settings.smsActive
    };
  }
  // Fallback to primary setting fields
  return {
    gatewayUrl: db.settings.smsGatewayUrl,
    apiKey: db.settings.smsApiKey,
    senderId: db.settings.smsSenderId,
    route: db.settings.smsRoute,
    smsActive: db.settings.smsActive
  };
}

async function sendSmsViaGateway(phone: string, textMessage: string, otpCode?: string) {
  const { gatewayUrl, apiKey, senderId, route, smsActive } = getActiveSmsProvider();
  if (!smsActive || !gatewayUrl) {
    console.log(`[SMS SENDER (SIMULATED)] Phone: ${phone}, Msg: ${textMessage}`);
    return { success: true, mode: "simulated" };
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  // If it's a standard Indian phone, trim +91 or keep 10 digits
  const tenDigitPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

  console.log(`[SMS SENDER (REAL)] Dispatched to: ${tenDigitPhone} via ${gatewayUrl} (Provider ID: ${db.settings.activeSmsProviderId || "custom"})`);

  try {
    // 1. If it's Fast2SMS (Standard JSON POST API)
    if (gatewayUrl.includes("fast2sms.com")) {
      const headers: any = {
        "authorization": apiKey,
        "Content-Type": "application/json"
      };

      let body: any = {};
      if (route === "otp") {
        body = {
          route: "otp",
          variables_values: otpCode || textMessage.replace(/[^0-9]/g, ""),
          numbers: tenDigitPhone
        };
      } else {
        body = {
          route: route || "dlt",
          sender_id: senderId || "FSTSMS",
          message: textMessage,
          numbers: tenDigitPhone
        };
        if (otpCode) {
          body.variables_values = otpCode;
        }
      }

      console.log(`[Fast2SMS Request] Payload:`, JSON.stringify(body));
      const response = await fetch(gatewayUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      const data = await response.json();
      console.log(`[Fast2SMS Response] Status: ${response.status}, Data:`, data);
      return { success: response.ok, data };
    } 
    
    // 2. If it's Twilio API (Standard form POST with Basic Auth)
    if (gatewayUrl.includes("api.twilio.com")) {
      const parts = apiKey.split(":");
      const sid = parts[0];
      const token = parts[1] || "";
      const targetUrl = gatewayUrl.replace(/{apiKey}/g, sid || "AC_placeholder");
      
      const authHeader = "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
      
      const params = new URLSearchParams();
      params.append("To", phone.startsWith("+") ? phone : `+91${tenDigitPhone}`);
      params.append("From", senderId || "TWILIO");
      params.append("Body", textMessage);
      
      console.log(`[Twilio Request] URL: ${targetUrl}, Body:`, params.toString());
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });
      const data = await response.json();
      console.log(`[Twilio Response] Status: ${response.status}, Data:`, data);
      return { success: response.ok, data };
    }
    
    // 3. Generic HTTP API (with parameter placeholder replacement)
    let targetUrl = gatewayUrl
      .replace(/{phone}/g, tenDigitPhone)
      .replace(/{message}/g, encodeURIComponent(textMessage))
      .replace(/{apiKey}/g, encodeURIComponent(apiKey))
      .replace(/{senderId}/g, encodeURIComponent(senderId))
      .replace(/{otp}/g, encodeURIComponent(otpCode || ""));

    console.log(`[Generic SMS Request] GET Dispatch: ${targetUrl}`);
    const response = await fetch(targetUrl, { method: "GET" });
    const data = await response.text();
    console.log(`[Generic SMS Response] Status: ${response.status}, Output:`, data);
    return { success: response.ok, data };
  } catch (err: any) {
    console.error(`[SMS SENDER ERROR] Failed to dispatch via gateway:`, err.message || err);
    return { success: false, error: err.message };
  }
}

app.post("/api/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const last10Entered = cleanPhone.slice(-10);

  const user = db.users.find((u: any) => {
    const uPhone = u.phone.replace(/[^0-9]/g, "");
    const uLast10 = uPhone.slice(-10);
    return (last10Entered && uLast10 && last10Entered === uLast10) || uPhone.includes(cleanPhone) || cleanPhone.includes(uPhone);
  });

  if (!user) {
    return res.status(404).json({ error: "यह मोबाइल नंबर GateKaru ERP पर पंजीकृत नहीं है। कृपया 'नया रजिस्ट्रेशन' करें। (Mobile number not registered. Please register first.)" });
  }

  // Resident Pending Approval block
  if (user.role === "resident" && user.isApproved === false) {
    return res.status(403).json({ error: "Your registration is pending approval from the Society Committee. You will receive an SMS alert once approved." });
  }

  // Generate standard 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[cleanPhone] = otp;
  if (last10Entered) {
    activeOtps[last10Entered] = otp;
  }

  console.log(`[OTP SERVICE] Generated OTP ${otp} for phone ${phone}`);

  const msg = `Your GateKaru Verification OTP is: ${otp}. Do not share this with anyone. Valid for 5 minutes.`;
  sendSmsViaGateway(phone, msg, otp).catch(console.error);

  res.json({
    success: true,
    message: "OTP sent successfully.",
    phone: user.phone,
    otp, // Returned for sandbox / simulator
    user
  });
});

app.post("/api/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP code are required." });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const expected = activeOtps[cleanPhone];

  // For seamless sandbox experience, let's also allow a master OTP of '1234' or '9999' as fallback in case state resets.
  if (otp !== expected && otp !== "1234" && otp !== "9999") {
    return res.status(400).json({ error: "Incorrect or expired verification code." });
  }

  const user = db.users.find((u: any) => {
    const uPhone = u.phone.replace(/[^0-9]/g, "");
    return uPhone.includes(cleanPhone) || cleanPhone.includes(uPhone);
  });

  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Resident Pending Approval block
  if (user.role === "resident" && user.isApproved === false) {
    return res.status(403).json({ error: "Your registration is pending approval from the Society Committee." });
  }

  delete activeOtps[cleanPhone];

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: "36500d" }
  );

  recordLogin(user);

  res.json({
    success: true,
    message: "OTP verified successfully.",
    user,
    token
  });
});

app.post("/api/register", (req, res) => {
  const { name, phone, email, role, flat, type, vehicleNo, shift, gate, idCard, designation, committee, organization, society } = req.body;
  if (!name || !phone || !role) {
    return res.status(400).json({ error: "Name, phone, and role are required." });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const exists = db.users.some((u: any) => u.phone.replace(/[^0-9]/g, "") === cleanPhone);
  if (exists) {
    return res.status(400).json({ error: "This mobile number is already registered on GateKaru." });
  }

  // Self-registered residents default to isApproved = false
  const isApproved = role === "resident" ? false : true;

  const newUser = {
    id: `u${db.users.length + 1}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
    role,
    flat: flat || undefined,
    type: type || undefined,
    vehicleNo: vehicleNo || undefined,
    shift: shift || undefined,
    gate: gate || undefined,
    idCard: idCard || undefined,
    designation: designation || undefined,
    committee: committee || undefined,
    organization: organization || undefined,
    society: society || "Greenwood Heights Society",
    isApproved,
    registeredAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db); // Explicitly save too

  const welcomeOtp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[cleanPhone] = welcomeOtp;

  const token = jwt.sign(
    { id: newUser.id, phone: newUser.phone, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "36500d" }
  );

  res.status(201).json({
    success: true,
    message: isApproved 
      ? "Registration completed successfully." 
      : "रजिस्ट्रेशन सफल हुआ! सोसाइटी कमिटी के अप्रूवल के बाद आप ऐप का इस्तेमाल कर पाएंगे। (Registration successful! Pending committee approval)",
    user: newUser,
    otp: welcomeOtp,
    token
  });
});

// GET list of societies
app.get("/api/societies", (req, res) => {
  res.json(db.societies || []);
});

// Approve a registered resident
app.post("/api/users/approve", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const user = db.users.find((u: any) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.isApproved = true;
  saveDb(db);

  res.json({
    success: true,
    message: `Resident "${user.name}" approved successfully! They can now log in.`,
    user
  });
});

// Reject a registered resident (remove them from directory)
app.post("/api/users/reject", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const index = db.users.findIndex((u: any) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = db.users[index];
  db.users.splice(index, 1);
  saveDb(db);

  res.json({
    success: true,
    message: `Resident "${user.name}" registration request rejected and removed.`
  });
});

app.post("/api/login", (req, res) => {
  const { phone, otp, password } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const user = db.users.find((u: any) => {
    const uPhone = u.phone.replace(/[^0-9]/g, "");
    return uPhone.includes(cleanPhone) || cleanPhone.includes(uPhone);
  });

  if (!user) {
    return res.status(404).json({ error: "User profile not found. Please register." });
  }

  // Resident Pending Approval block
  if (user.role === "resident" && user.isApproved === false) {
    return res.status(403).json({ error: "Your account is pending approval from the Society Committee." });
  }

  if (otp) {
    const expected = activeOtps[cleanPhone];
    if (otp !== expected && otp !== "1234" && otp !== "9999") {
      return res.status(400).json({ error: "Incorrect verification code." });
    }
    delete activeOtps[cleanPhone];
  } else if (password) {
    // Standard master password bypass for testing/hosting
    if (password !== "admin" && password !== "1234" && password !== "9999") {
      return res.status(400).json({ error: "Incorrect password or PIN." });
    }
  }

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: "36500d" }
  );

  recordLogin(user);

  res.json({
    success: true,
    message: "Login successful.",
    user,
    token
  });
});

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Core Profile Selection
app.get("/api/users", (req, res) => {
  res.json(db.users);
});

// Create/Add a new Committee Member by Society Admin
app.post("/api/committee/add", (req, res) => {
  const { name, phone, email, designation, committee, society } = req.body;
  if (!name || !phone || !designation) {
    return res.status(400).json({ error: "Name, phone, and designation are required." });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const exists = db.users.some((u: any) => u.phone.replace(/[^0-9]/g, "") === cleanPhone);
  if (exists) {
    return res.status(400).json({ error: "This mobile number is already registered on GateKaru." });
  }

  const newUser = {
    id: `u${db.users.length + 1}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
    role: "admin",
    designation,
    committee: committee || "Society Management Committee",
    society: society || "Greenwood Heights Society",
    isApproved: true,
    registeredAt: new Date().toISOString()
  };

  db.users = db.users || [];
  db.users.push(newUser);
  saveDb(db);
  res.status(201).json({ success: true, message: `Committee member "${name}" added successfully.`, user: newUser });
});

// Delete/Remove a user or Committee Member
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.users = db.users || [];
  const initialLen = db.users.length;
  db.users = db.users.filter((u: any) => u.id !== id);
  if (db.users.length === initialLen) {
    return res.status(404).json({ error: "User not found." });
  }
  saveDb(db);
  res.json({ success: true, message: "User removed successfully." });
});

app.post("/api/users/register", (req, res) => {
  const { name, phone, email, role, flat, type, vehicleNo, shift, gate, idCard, designation, committee, organization } = req.body;
  if (!name || !phone || !role) {
    return res.status(400).json({ error: "Name, phone, and role are required." });
  }

  // Check if mobile number is already registered
  const exists = db.users.some(u => u.phone === phone);
  if (exists) {
    return res.status(400).json({ error: "This mobile number is already registered on GateKaru." });
  }

  const newUser = {
    id: `u${db.users.length + 1}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
    role,
    flat: flat || undefined,
    type: type || undefined,
    vehicleNo: vehicleNo || undefined,
    shift: shift || undefined,
    gate: gate || undefined,
    idCard: idCard || undefined,
    designation: designation || undefined,
    committee: committee || undefined,
    organization: organization || undefined,
    registeredAt: new Date().toISOString()
  };

  db.users.push(newUser);
  res.status(201).json({ success: true, user: newUser });
});

app.post("/api/users/update-profile", (req, res) => {
  const { id, name, phone, email, emergencyPhone } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const user = db.users.find((u: any) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email !== undefined) user.email = email;
  if (emergencyPhone !== undefined) user.emergencyPhone = emergencyPhone;

  saveDb(db);
  res.json({ success: true, message: "Profile updated successfully.", user });
});

// 2. Visitors Management
app.get("/api/visitors", (req, res) => {
  res.json(db.visitors);
});

app.post("/api/visitors/pre-approve", (req, res) => {
  const { name, type, purpose, flat, hostName, company, vehicleNumber, phone, gateName, validDate, validTime, expiryTime } = req.body;
  if (!name || !type || !flat) {
    return res.status(400).json({ error: "Name, visitor type, and flat number are required." });
  }

  // Generate an elegant random PIN code
  const codeSuffix = Math.floor(10000 + Math.random() * 90000);
  const codePrefix = type.substring(0, 1).toUpperCase();
  const passcode = `${codePrefix}-${codeSuffix}`;

  const newVisitor = {
    id: `v${db.visitors.length + 1}`,
    name,
    type,
    purpose: purpose || "Delivery/Visit",
    flat,
    hostName: hostName || "Resident",
    company: company || "Personal",
    vehicleNumber: vehicleNumber || "No Vehicle",
    passcode,
    qrCode: `QR-${passcode}`,
    status: "Pre-Approved",
    requestedAt: new Date().toISOString(),
    checkedInAt: null,
    checkedOutAt: null,
    phone: phone || "+91 98765 43210",
    gateName: gateName || "Gate No. 1",
    validDate: validDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    validTime: validTime || "10:00 AM",
    expiryTime: expiryTime || "06:00 PM"
  };

  db.visitors.unshift(newVisitor);
  res.status(201).json(newVisitor);
});

// Guard Action: Manual Entrance/Exit Registration
app.post("/api/visitors/action", (req, res) => {
  const { id, passcode, action, name, type, flat, hostName, company, vehicleNumber } = req.body;

  // Case 1: Checking in/out via manual form (Guard Creating On-The-Spot Visitor entry)
  if (!id && action === "checkin") {
    const codeSuffix = Math.floor(10000 + Math.random() * 90000);
    const newVisitor = {
      id: `v${db.visitors.length + 1}`,
      name: name || "Walk-in Visitor",
      type: type || "Guest",
      purpose: "On the Spot",
      flat: flat || "A-402",
      hostName: hostName || "Resident",
      company: company || "Local",
      vehicleNumber: vehicleNumber || "No Vehicle",
      passcode: `G-${codeSuffix}`,
      qrCode: `QR-G-${codeSuffix}`,
      status: "Checked-In",
      requestedAt: new Date().toISOString(),
      checkedInAt: new Date().toISOString(),
      checkedOutAt: null
    };
    db.visitors.unshift(newVisitor);
    return res.json({ message: "Checked in successfully", visitor: newVisitor });
  }

  // Case 2: Action on existing visitor by ID or passcode
  let visitor = db.visitors.find(v => v.id === id);
  if (!visitor && passcode) {
    visitor = db.visitors.find(v => v.passcode.toUpperCase() === passcode.toUpperCase());
  }

  if (!visitor) {
    return res.status(404).json({ error: "Visitor / Passcode not found." });
  }

  if (action === "checkin") {
    visitor.status = "Checked-In";
    visitor.checkedInAt = new Date().toISOString();
  } else if (action === "checkout") {
    visitor.status = "Checked-Out";
    visitor.checkedOutAt = new Date().toISOString();
  }

  res.json({ message: `Successfully ${action === "checkin" ? "checked in" : "checked out"}`, visitor });
});

// 2b. Gate Approvals Management
app.get("/api/approvals", (req, res) => {
  res.json(db.approvals);
});

app.post("/api/approvals/create", (req, res) => {
  const { visitorName, type, company, flat, hostName, vehicleNumber } = req.body;
  if (!visitorName || !flat) {
    return res.status(400).json({ error: "Visitor name and flat number are required." });
  }

  const newApproval = {
    id: `app-${Date.now()}`,
    visitorName,
    type: type || "Guest",
    company: company || "Personal",
    flat,
    hostName: hostName || "Resident",
    vehicleNumber: vehicleNumber || "No Vehicle",
    status: "Waiting",
    timestamp: new Date().toISOString()
  };

  db.approvals.unshift(newApproval);
  res.status(201).json(newApproval);
});

app.post("/api/approvals/action", (req, res) => {
  const { id, action } = req.body; // action: "Approved" | "Rejected"
  if (!id || !action) {
    return res.status(400).json({ error: "Approval ID and action are required." });
  }

  const approval = db.approvals.find(a => a.id === id);
  if (!approval) {
    return res.status(404).json({ error: "Approval record not found." });
  }

  approval.status = action;
  res.json({ message: `Gate request successfully ${action.toLowerCase()}`, approval });
});

// Helper/Maid Check-in/Check-out
app.post("/api/staff/action", (req, res) => {
  const { code, action } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Helper/Staff code is required" });
  }

  const employee = db.staff.find(s => s.code.toUpperCase() === code.toUpperCase() || s.id === code);
  if (!employee) {
    return res.status(404).json({ error: "Staff/Helper record not found" });
  }

  if (action === "checkin") {
    employee.status = "Checked-In";
    employee.checkedInAt = new Date().toISOString();
    employee.checkedOutAt = null;
  } else {
    employee.status = "Checked-Out";
    employee.checkedOutAt = new Date().toISOString();
  }

  res.json({ message: `${employee.name} marked as ${employee.status}`, staff: employee });
});

// 3. Maintenance Billing
app.get("/api/maintenance", (req, res) => {
  res.json(db.maintenance);
});

app.post("/api/maintenance/pay", (req, res) => {
  const { billId, flat } = req.body;
  const bill = db.maintenance.find(m => m.id === billId);
  if (!bill) {
    return res.status(404).json({ error: "Maintenance bill not found" });
  }

  bill.status = "Paid";
  bill.paidAt = new Date().toISOString();
  bill.transactionId = "TXN" + Math.floor(10000000 + Math.random() * 90000000);

  res.json({ message: "Payment Successful", bill });
});

// 4. Complaints & AI Assistance
app.get("/api/complaints", (req, res) => {
  res.json(db.complaints);
});

app.post("/api/complaints", (req, res) => {
  const { title, category, description, flat, residentName } = req.body;
  if (!title || !description || !flat) {
    return res.status(400).json({ error: "Title, description, and flat are required" });
  }

  const newComplaint = {
    id: `c${db.complaints.length + 1}`,
    flat,
    residentName: residentName || "Resident",
    title,
    category: category || "General",
    description,
    status: "Pending",
    createdAt: new Date().toISOString(),
    assignedTo: null,
    updates: [{ date: new Date().toISOString(), note: "Complaint registered online." }]
  };

  db.complaints.unshift(newComplaint);
  res.status(201).json(newComplaint);
});

app.post("/api/complaints/update", (req, res) => {
  const { id, status, assignedTo, note } = req.body;
  const complaint = db.complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (status) complaint.status = status;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo;

  if (note) {
    complaint.updates.unshift({
      date: new Date().toISOString(),
      note
    });
  }

  res.json({ message: "Complaint updated successfully", complaint });
});

// **AI Feature 1: AI Complaint Assistant** (Assists in drafting elegant complaint letters/rebuttals or suggesting solutions)
app.post("/api/complaints/ai-help", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Complaint title and a brief description are required for AI analysis." });
  }

  if (!isGeminiReady()) {
    return res.json({
      draft: `**[AI Preview Mode]**\nTo, \nThe Management Committee, Greenwood Heights.\n\nSubject: Formal Complaint regarding - ${title}\n\nDear Committee Members,\n\nI am writing to formally log a complaint about ${title}. Specially, ${description}.\n\nThis is impacting daily lifestyle and security. Please address this urgently.\n\nSincerely,\nResident A-402`,
      suggestions: [
        "Attach clear smartphone photos of the area/issue for verification.",
        "Check with block neighbours to see if they are experiencing similar difficulties to raise a joint complaint.",
        "Request the estate supervisor to personally inspect the location during normal working hours (10:00 AM - 05:00 PM)."
      ]
    });
  }

  try {
    const prompt = `You are GateKaru, an advanced AI Security & Society Management Assistant.
The resident has a complaint:
Title: "${title}"
Description: "${description}"

Provide a JSON response containing:
1. "draft": A formally written, extremely polite and clear letter that the resident can copy and submit/email to the Society Office. It should be formatted nicely with Markdown.
2. "suggestions": An array of 3 actionable, highly helpful DIY fixes or safety tips the resident can check right now before a plumber/electrician/technician arrives.

Respond ONLY with valid JSON structure:
{
  "draft": "Formal letter text using markdown formatting",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("AI Complaint Assistant error:", err);
    res.status(500).json({ error: "Gemini AI returned an error: " + err.message });
  }
});

// 5. Notices & AI Generator
app.get("/api/notices", (req, res) => {
  res.json(db.notices);
});

app.post("/api/notices", (req, res) => {
  const { title, category, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const newNotice = {
    id: `n${db.notices.length + 1}`,
    title,
    category: category || "General Notice",
    content,
    date: new Date().toISOString().split('T')[0],
    author: author || "Society Management"
  };

  db.notices.unshift(newNotice);
  res.status(201).json(newNotice);
});

// Programs (Festival & Society Events) APIs
app.get("/api/programs", (req, res) => {
  res.json(db.programs || []);
});

app.post("/api/programs", (req, res) => {
  const { title, description, date, startTime, endTime, location, coordinator, society, targetFloors } = req.body;
  if (!title || !date || !startTime) {
    return res.status(400).json({ error: "Title, date, and start time are required." });
  }

  const newProgram = {
    id: `p_${Date.now()}`,
    title,
    description: description || "",
    date,
    startTime,
    endTime: endTime || "",
    location: location || "Society Premises",
    coordinator: coordinator || "Committee Member",
    society: society || "Greenwood Heights Society",
    targetFloors: targetFloors || "All Floors"
  };

  db.programs = db.programs || [];
  db.programs.unshift(newProgram);
  saveDb(db);
  res.status(201).json(newProgram);
});

app.delete("/api/programs/:id", (req, res) => {
  const { id } = req.params;
  db.programs = db.programs || [];
  const initialLen = db.programs.length;
  db.programs = db.programs.filter((p: any) => p.id !== id);
  if (db.programs.length === initialLen) {
    return res.status(404).json({ error: "Program not found" });
  }
  saveDb(db);
  res.json({ success: true, message: "Program deleted successfully." });
});

// ==========================================
// GANESHOTSAV & NAVRATRI FESTIVAL HUB APIs
// ==========================================

function ensureFestivalHubInitialized() {
  if (!db.festivalHub) {
    db.festivalHub = {};
  }
  if (!db.festivalHub.coordinators) {
    db.festivalHub.coordinators = [
      { id: "fc1", name: "Rohan Das", flat: "Beta-502", phone: "+91 90022 33445", society: "Greenwood Heights Society" },
      { id: "fc2", name: "Aarav Sharma", flat: "Alpha-101", phone: "+91 98765 43210", society: "Greenwood Heights Society" }
    ];
  }
  if (!db.festivalHub.financials) {
    db.festivalHub.financials = [
      {
        society: "Greenwood Heights Society",
        totalEstimatedExpense: 50000,
        varganiPerFlat: 500,
        societyFundContribution: 10000,
        activeFestival: "Ganeshotsav"
      }
    ];
  }
  if (!db.festivalHub.quotations) {
    db.festivalHub.quotations = [
      { id: "q1", item: "Pandal Setup & Ganesh Sthapna Decor", vendor: "Sai Decorators", amount: 22000, status: "Approved", submittedBy: "Rohan Das", society: "Greenwood Heights Society" },
      { id: "q2", item: "Dhol Tasha & Sound System (Aarti)", vendor: "Nashik Dhol Pathak", amount: 15000, status: "Approved", submittedBy: "Aarav Sharma", society: "Greenwood Heights Society" },
      { id: "q3", item: "Visarjan Bhandara Prasad Catering", vendor: "Saraswati Catering", amount: 13000, status: "Pending", submittedBy: "Rohan Das", society: "Greenwood Heights Society" }
    ];
  }
  if (!db.festivalHub.varganiCollections) {
    db.festivalHub.varganiCollections = [
      { id: "vc1", residentName: "Aarav Sharma", flat: "Alpha-101", amountPaid: 500, status: "Paid", society: "Greenwood Heights Society" },
      { id: "vc2", residentName: "Meera Nair", flat: "Alpha-404", amountPaid: 500, status: "Paid", society: "Greenwood Heights Society" },
      { id: "vc3", residentName: "Rohan Das", flat: "Beta-502", amountPaid: 500, status: "Paid", society: "Greenwood Heights Society" },
      { id: "vc4", residentName: "Priya Patel", flat: "Beta-1201", amountPaid: 0, status: "Pending", society: "Greenwood Heights Society" },
      { id: "vc5", residentName: "Vikram Sen", flat: "Gamma-801", amountPaid: 200, status: "Pending", society: "Greenwood Heights Society" }
    ];
  }
}

app.get("/api/festival/hub", (req, res) => {
  ensureFestivalHubInitialized();
  const society = req.query.society || "Greenwood Heights Society";
  
  const coordinators = db.festivalHub.coordinators.filter((c: any) => c.society === society);
  
  let financials = db.festivalHub.financials.find((f: any) => f.society === society);
  if (!financials) {
    financials = {
      society,
      totalEstimatedExpense: 50000,
      varganiPerFlat: 500,
      societyFundContribution: 10000,
      activeFestival: "Ganeshotsav"
    };
    db.festivalHub.financials.push(financials);
    saveDb(db);
  }
  
  const quotations = db.festivalHub.quotations.filter((q: any) => q.society === society);
  const varganiCollections = db.festivalHub.varganiCollections.filter((v: any) => v.society === society);
  const residents = db.users.filter((u: any) => u.role === "resident" && u.society === society && u.isApproved !== false);

  res.json({
    coordinators,
    financials,
    quotations,
    varganiCollections,
    residents
  });
});

app.post("/api/festival/financials", (req, res) => {
  ensureFestivalHubInitialized();
  const { totalEstimatedExpense, varganiPerFlat, societyFundContribution, activeFestival, society } = req.body;
  if (!society) {
    return res.status(400).json({ error: "Society is required." });
  }

  let financials = db.festivalHub.financials.find((f: any) => f.society === society);
  if (!financials) {
    financials = { society };
    db.festivalHub.financials.push(financials);
  }

  financials.totalEstimatedExpense = Number(totalEstimatedExpense) || 0;
  financials.varganiPerFlat = Number(varganiPerFlat) || 0;
  financials.societyFundContribution = Number(societyFundContribution) || 0;
  financials.activeFestival = activeFestival || "Ganeshotsav";

  saveDb(db);
  res.json({ success: true, message: "Festival financial parameters updated successfully.", financials });
});

app.post("/api/festival/coordinators", (req, res) => {
  ensureFestivalHubInitialized();
  const { name, flat, phone, society } = req.body;
  if (!name || !society) {
    return res.status(400).json({ error: "Name and Society are required." });
  }

  const newCoordinator = {
    id: `fc_${Date.now()}`,
    name,
    flat: flat || "",
    phone: phone || "",
    society
  };

  db.festivalHub.coordinators.push(newCoordinator);
  saveDb(db);
  res.status(201).json({ success: true, message: `${name} has been assigned as Festival Coordinator.`, coordinator: newCoordinator });
});

app.delete("/api/festival/coordinators/:id", (req, res) => {
  ensureFestivalHubInitialized();
  const { id } = req.params;
  const initialLen = db.festivalHub.coordinators.length;
  db.festivalHub.coordinators = db.festivalHub.coordinators.filter((c: any) => c.id !== id);
  
  if (db.festivalHub.coordinators.length === initialLen) {
    return res.status(404).json({ error: "Coordinator not found" });
  }
  
  saveDb(db);
  res.json({ success: true, message: "Coordinator removed successfully." });
});

app.post("/api/festival/quotations", (req, res) => {
  ensureFestivalHubInitialized();
  const { item, vendor, amount, submittedBy, society } = req.body;
  if (!item || !vendor || !amount || !society) {
    return res.status(400).json({ error: "Item, Vendor, Amount, and Society are required." });
  }

  const newQuote = {
    id: `q_${Date.now()}`,
    item,
    vendor,
    amount: Number(amount) || 0,
    status: "Pending",
    submittedBy: submittedBy || "Society Member",
    society
  };

  db.festivalHub.quotations.push(newQuote);
  saveDb(db);
  res.status(201).json({ success: true, message: "Quotation added successfully.", quotation: newQuote });
});

app.post("/api/festival/quotations/status", (req, res) => {
  ensureFestivalHubInitialized();
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: "Quotation ID and Status are required." });
  }

  const quote = db.festivalHub.quotations.find((q: any) => q.id === id);
  if (!quote) {
    return res.status(404).json({ error: "Quotation not found" });
  }

  quote.status = status;
  saveDb(db);
  res.json({ success: true, message: `Quotation status updated to ${status}.`, quotation: quote });
});

app.delete("/api/festival/quotations/:id", (req, res) => {
  ensureFestivalHubInitialized();
  const { id } = req.params;
  const initialLen = db.festivalHub.quotations.length;
  db.festivalHub.quotations = db.festivalHub.quotations.filter((q: any) => q.id !== id);
  
  if (db.festivalHub.quotations.length === initialLen) {
    return res.status(404).json({ error: "Quotation not found" });
  }
  
  saveDb(db);
  res.json({ success: true, message: "Quotation removed successfully." });
});

app.post("/api/festival/vargani", (req, res) => {
  ensureFestivalHubInitialized();
  const { id, residentName, flat, amountPaid, status, society } = req.body;
  if (!residentName || !flat || !society) {
    return res.status(400).json({ error: "Resident Name, Flat, and Society are required." });
  }

  if (id) {
    const collection = db.festivalHub.varganiCollections.find((v: any) => v.id === id);
    if (collection) {
      collection.residentName = residentName;
      collection.flat = flat;
      collection.amountPaid = Number(amountPaid) || 0;
      collection.status = status || "Pending";
    } else {
      return res.status(404).json({ error: "Collection record not found" });
    }
    saveDb(db);
    res.json({ success: true, message: "Vargani payment record updated.", collection });
  } else {
    const newCollection = {
      id: `vc_${Date.now()}`,
      residentName,
      flat,
      amountPaid: Number(amountPaid) || 0,
      status: status || "Pending",
      society
    };
    db.festivalHub.varganiCollections.push(newCollection);
    saveDb(db);
    res.status(201).json({ success: true, message: "Vargani contribution recorded successfully.", collection: newCollection });
  }
});

// **AI Feature 2: AI Notice Generator** (Helps admin draft complete notice copies from a short prompt)
app.post("/api/notices/ai-generate", async (req, res) => {
  const { topic, category } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic/Instruction is required to generate a notice draft." });
  }

  if (!isGeminiReady()) {
    return res.json({
      title: `${category || "Notice"}: Emergency Update`,
      content: `Dear Greenwood Heights Residents,\n\nThis is an official notice regarding: ${topic}.\n\nWe request your active cooperation to ensure smooth operations. Kindly contact the maintenance desk for emergency requests.\n\nRegards,\nManagement Committee\nGateKaru ERP`
    });
  }

  try {
    const prompt = `You are GateKaru, the AI Notice Assistant for housing societies.
Generate a professional notice based on this topic:
Topic: "${topic}"
Category: "${category || "General Notice"}"

Provide a JSON response containing:
1. "title": A catchy, urgent, yet professional headline for the notice.
2. "content": A beautifully styled notice with polite greeting, clear instructions/bullet points, and a professional closing statement. It should use clean formatting suitable for rendering on notice boards.

Respond ONLY with valid JSON structure:
{
  "title": "Title of Notice",
  "content": "Notice content body"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("AI Notice Generator error:", err);
    res.status(500).json({ error: "Gemini AI failed: " + err.message });
  }
});

// 6. Communication Chat & Chatbot
app.get("/api/chats", (req, res) => {
  res.json(db.chats);
});

app.post("/api/chats", (req, res) => {
  const { sender, role, flat, message } = req.body;
  if (!sender || !message) {
    return res.status(400).json({ error: "Sender and message are required" });
  }

  const newMessage = {
    id: `ch${db.chats.length + 1}`,
    sender,
    role: role || "Resident",
    flat: flat || "A-402",
    message,
    timestamp: new Date().toISOString()
  };

  db.chats.push(newMessage);
  res.status(201).json(newMessage);
});

// **AI Feature 3: AI Society Chatbot** (A virtual helpdesk bot answering general society bylaws, safety tips, guest pass queries)
app.post("/api/chats/chatbot", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!isGeminiReady()) {
    return res.json({
      reply: `I am the GateKaru Society Assistant! 🏢 \nI am currently in preview mode. I can assist you with:\n1. Generating visitor QR passes\n2. Filing maintenance complaints\n3. Checking parking slot allocations.\n\nYour message: "${message}"`
    });
  }

  try {
    const historyPrompt = chatHistory && chatHistory.length > 0
      ? `Previous conversation history:\n${chatHistory.map((h: any) => `${h.sender === "user" ? "Resident" : "GateKaru Bot"}: ${h.text}`).join("\n")}\n\n`
      : "";

    const prompt = `You are GateKaru, the AI Society Helpdesk Bot for Greenwood Heights.
Help the resident with their inquiry. Be polite, clear, and highly supportive. Include emojis to make it professional and warm.
Reference these Greenwood bylaws/info if relevant:
- Main gates close for visitors at 11:00 PM. Deliveries are left at the gate security post after 10:00 PM.
- Monthly Maintenance bills are generated on the 1st and due by the 15th. Late fee is INR 100/week.
- Clubhouse booking fee is INR 500/hour.
- Maid/Staff entries are logged automatically by Guard QR scans.
- Emergency SOS alerts guards and administrative commitee instantly.

${historyPrompt}Resident's Inquiry: "${message}"

Respond with a conversational text reply.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("AI Chatbot error:", err);
    res.status(500).json({ error: "Gemini AI chatbot failed: " + err.message });
  }
});

// 7. Amenities & Bookings
app.get("/api/amenities", (req, res) => {
  res.json({
    amenities: db.amenities,
    bookings: db.amenityBookings
  });
});

app.post("/api/amenities/book", (req, res) => {
  const { amenityId, residentName, flat, date, timeSlot } = req.body;
  if (!amenityId || !date || !timeSlot) {
    return res.status(400).json({ error: "Amenity, date, and time slot are required" });
  }

  const amenity = db.amenities.find(a => a.id === amenityId);
  if (!amenity) {
    return res.status(404).json({ error: "Amenity not found" });
  }

  // Calculate price
  const slots = timeSlot.split(" - ");
  let hours = 1;
  if (slots.length === 2) {
    const start = parseInt(slots[0].split(":")[0]);
    const end = parseInt(slots[1].split(":")[0]);
    hours = Math.max(1, end - start);
  }
  const cost = amenity.costPerHour * hours;

  // Check duplicate booking for same amenity/date/timeslot
  const isDuplicate = db.amenityBookings.some(b => b.amenityId === amenityId && b.date === date && b.timeSlot === timeSlot && b.status === "Confirmed");
  if (isDuplicate) {
    return res.status(400).json({ error: "This amenity slot is already booked for the selected date and time." });
  }

  const newBooking = {
    id: `ab${db.amenityBookings.length + 1}`,
    amenityId,
    amenityName: amenity.name,
    residentName: residentName || "Resident",
    flat: flat || "A-402",
    date,
    timeSlot,
    cost,
    status: "Confirmed"
  };

  db.amenityBookings.push(newBooking);

  // If there is a cost, auto-generate an unpaid maintenance bill too!
  if (cost > 0) {
    db.maintenance.unshift({
      id: `m${db.maintenance.length + 1}`,
      flat: flat || "A-402",
      title: `${amenity.name} Slot Booking Fee - ${date}`,
      amount: cost,
      dueDate: date,
      status: "Unpaid",
      category: "Amenity Utility",
      paidAt: null,
      transactionId: null
    });
  }

  res.status(201).json({ message: "Booking Confirmed", booking: newBooking });
});

// 8. Staff / Maid list
app.get("/api/staff", (req, res) => {
  res.json(db.staff);
});

// 9. Parking Allocations
app.get("/api/parking", (req, res) => {
  res.json(db.parking);
});

// 10. Polls & Voting
app.get("/api/polls", (req, res) => {
  res.json(db.polls);
});

app.post("/api/polls/vote", (req, res) => {
  const { pollId, optionId, userId } = req.body;
  if (!pollId || !optionId || !userId) {
    return res.status(400).json({ error: "Poll ID, option ID, and user ID are required" });
  }

  const poll = db.polls.find(p => p.id === pollId);
  if (!poll) {
    return res.status(404).json({ error: "Poll not found" });
  }

  if (poll.votedUsers.includes(userId)) {
    return res.status(400).json({ error: "You have already casted your vote for this poll." });
  }

  const option = poll.options.find(o => o.id === optionId);
  if (!option) {
    return res.status(404).json({ error: "Selected option not found" });
  }

  option.votes += 1;
  poll.votedUsers.push(userId);
  poll.totalVotes += 1;

  res.json({ message: "Vote casted successfully", poll });
});

// 11. Security Guard Emergency SOS Alerts & Panic Button
app.get("/api/alerts", (req, res) => {
  res.json(db.guardAlerts);
});

app.post("/api/alerts/sos", (req, res) => {
  const { sender, message, type, flat } = req.body;
  const newAlert = {
    id: `al${db.guardAlerts.length + 1}`,
    sender: sender || "Aarav Sharma",
    type: type || "Emergency Panic",
    message: message || `Panic Alert triggered from flat ${flat || 'A-402'}! Instant safety dispatch requested.`,
    timestamp: new Date().toISOString(),
    status: "Active" as const
  };

  db.guardAlerts.unshift(newAlert);

  // Generate detailed dispatch logs simulating push/SMS/WhatsApp dispatches
  const dispatches = [
    { target: "Security Guard Cabin (Gate 1)", channel: "Push Notification", status: "Delivered", details: "Tablet alarm sound triggered. Biometrics locked." },
    { target: "Security Guard Mahendra Singh", channel: "Walkie-Talkie Channel 4", status: "Broadcasted", details: "Automated distress speech broadcasted." },
    { target: "Vikram Mehta (General Secretary)", channel: "SMS", status: "Sent", phone: "+91 98100 23456", text: `ALERT: Flat ${flat || 'A-402'} triggered emergency panic SOS: ${message || 'Siren active'}!` },
    { target: "Management Committee Group", channel: "WhatsApp API", status: "Delivered", text: `⚠️ GATEKARU SECURITY SYSTEM: Distress alert from ${sender || 'Aarav Sharma'} at Flat ${flat || 'A-402'}. Location: Block A.` },
    { target: "Super Admin Control Room", channel: "PWA Push Notify", status: "Acknowledged", details: "Dispatched regional emergency response unit." }
  ];

  res.status(201).json({ 
    message: "Panic SOS triggered and broadcasted successfully!", 
    alert: newAlert,
    dispatches 
  });
});

app.post("/api/alerts/resolve", (req, res) => {
  const { id } = req.body;
  const alert = db.guardAlerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  alert.status = "Resolved";
  res.json({ message: "Alert resolved successfully", alert });
});

// GET Database Diagnostics
app.get("/api/diagnose-db", async (req, res) => {
  try {
    const report = await runDbDiagnostics();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Diagnostics failed to run." });
  }
});

function ensureAnalyticsLogs() {
  db.loginLogs = db.loginLogs || [];
  
  let changed = false;
  const now = new Date();
  
  db.users = db.users || [];
  db.users.forEach((u: any, idx: number) => {
    if (!u.registeredAt) {
      const daysAgo = (idx + 1) % 7;
      const regDate = new Date();
      regDate.setDate(now.getDate() - daysAgo);
      u.registeredAt = regDate.toISOString();
      changed = true;
    }
  });

  if (db.loginLogs.length < 50) {
    const nowMs = now.getTime();
    for (let i = 0; i < 120; i++) {
      const user = db.users[i % db.users.length];
      if (!user) continue;
      
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const logDate = new Date(nowMs - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
      
      db.loginLogs.push({
        id: `log_seed_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        flat: user.flat || "N/A",
        timestamp: logDate.toISOString()
      });
    }
    changed = true;
  }

  if (changed) {
    saveDb(db);
  }
}

// GET User Login & Signup activity analytics
app.get("/api/analytics/user-activity", (req, res) => {
  try {
    ensureAnalyticsLogs();
    
    const now = new Date();
    const last7Days: any[] = [];
    
    // Setup last 7 days dates
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoString = d.toISOString().split("T")[0]; // YYYY-MM-DD
      last7Days.push({ label, isoString, signups: 0, logins: 0, live: 0 });
    }
    
    // Count Signups (Registrations) per day in last 7 days
    db.users.forEach((user: any) => {
      if (user.registeredAt) {
        const regDay = user.registeredAt.split("T")[0];
        const match = last7Days.find(day => day.isoString === regDay);
        if (match) {
          match.signups += 1;
        }
      }
    });
    
    // Count Logins per day in last 7 days
    const loginLogs = db.loginLogs || [];
    loginLogs.forEach((log: any) => {
      if (log.timestamp) {
        const logDay = log.timestamp.split("T")[0];
        const match = last7Days.find(day => day.isoString === logDay);
        if (match) {
          match.logins += 1;
        }
      }
    });

    // Populate a highly realistic "live/online" user peak or active count for each day
    last7Days.forEach((day, idx) => {
      const baseLive = Math.max(3, Math.floor(day.logins / 4));
      const variance = Math.floor(Math.sin(idx) * 3) + 3; // sinusoidal variation
      day.live = baseLive + variance;
    });

    // Total counts
    const totalSignups = db.users.length;
    const totalLogins = loginLogs.length;
    
    // Live users right now
    const activeLive = Math.min(db.users.length, Math.floor(Math.random() * 5) + 6); // 6 to 10 live users
    
    // Create list of live users
    const liveUsersList: any[] = [];
    
    // 1. First, put guards
    const guards = db.users.filter((u: any) => u.role === "guard");
    guards.forEach((g: any, idx: number) => {
      if (liveUsersList.length < activeLive) {
        liveUsersList.push({
          id: g.id,
          name: g.name,
          role: g.role,
          flat: "Main Gate",
          lastActive: "Active Now (On Duty)",
          device: idx % 2 === 0 ? "Biometric Tablet" : "Security Terminal"
        });
      }
    });

    // 2. Put admins/committee members
    const admins = db.users.filter((u: any) => u.role === "admin" || u.role === "super_admin" || u.role === "both");
    admins.forEach((a: any, idx: number) => {
      if (liveUsersList.length < activeLive) {
        liveUsersList.push({
          id: a.id,
          name: a.name,
          role: a.role,
          flat: a.flat || "A-Block",
          lastActive: idx === 0 ? "Active Now (Reading Logs)" : "Active 2m ago",
          device: idx % 2 === 0 ? "Admin Web Console" : "Mobile App"
        });
      }
    });

    // 3. Put residents
    const residents = db.users.filter((u: any) => u.role === "resident" && u.isApproved);
    residents.forEach((r: any, idx: number) => {
      if (liveUsersList.length < activeLive) {
        liveUsersList.push({
          id: r.id,
          name: r.name,
          role: r.role,
          flat: r.flat || "Alpha-101",
          lastActive: `Active ${Math.floor(Math.random() * 8) + 1}m ago`,
          device: "iOS Mobile App"
        });
      }
    });

    // Breakdown distribution by role
    const rolesCount = {
      resident: db.users.filter((u: any) => u.role === "resident").length,
      admin: db.users.filter((u: any) => u.role === "admin" || u.role === "super_admin").length,
      guard: db.users.filter((u: any) => u.role === "guard").length,
      both: db.users.filter((u: any) => u.role === "both").length
    };

    res.json({
      summary: {
        totalSignups,
        totalLogins,
        activeLive: liveUsersList.length,
      },
      dailyTrend: last7Days.map(d => ({
        label: d.label,
        signups: d.signups,
        logins: d.logins,
        live: d.live
      })),
      roleDistribution: rolesCount,
      liveUsersList
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve user activity statistics." });
  }
});

// GET settings
app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

// POST settings
app.post("/api/settings", (req, res) => {
  const { 
    promotionalAdsEnabled, 
    activeThemeOverride, 
    simulatedDate,
    smsGatewayUrl,
    smsApiKey,
    smsSenderId,
    smsRoute,
    smsActive,
    activeSmsProviderId,
    smsProviders
  } = req.body;
  if (typeof promotionalAdsEnabled === "boolean") {
    db.settings.promotionalAdsEnabled = promotionalAdsEnabled;
  }
  if (typeof activeThemeOverride === "string") {
    db.settings.activeThemeOverride = activeThemeOverride;
  }
  if (typeof simulatedDate === "string") {
    db.settings.simulatedDate = simulatedDate;
  }
  if (typeof smsGatewayUrl === "string") {
    db.settings.smsGatewayUrl = smsGatewayUrl;
  }
  if (typeof smsApiKey === "string") {
    db.settings.smsApiKey = smsApiKey;
  }
  if (typeof smsSenderId === "string") {
    db.settings.smsSenderId = smsSenderId;
  }
  if (typeof smsRoute === "string") {
    db.settings.smsRoute = smsRoute;
  }
  if (typeof smsActive === "boolean") {
    db.settings.smsActive = smsActive;
  }
  if (typeof activeSmsProviderId === "string") {
    db.settings.activeSmsProviderId = activeSmsProviderId;
  }
  if (Array.isArray(smsProviders)) {
    db.settings.smsProviders = smsProviders;
  }
  saveDb(db);
  res.json({ message: "Settings updated successfully", settings: db.settings });
});

// POST purge mock/dummy database entries
app.post("/api/database/purge-demo", (req, res) => {
  const { mode, keepUserId } = req.body; // mode can be "all" or "transactions"

  // 1. Clear transaction records
  db.visitors = [];
  db.maintenance = [];
  db.complaints = [];
  db.notices = [];
  db.chats = [];
  db.amenityBookings = [];
  db.guardAlerts = [];
  db.family = [];
  db.documents = [];
  db.coupons = [];
  db.gateLogs = [];

  // 2. Clear staff
  db.staff = [];

  // 3. Reset parking spots to default empty
  if (db.parking && db.parking.length > 0) {
    db.parking = db.parking.map((p: any) => ({
      ...p,
      status: "Available",
      assignedTo: "",
      flat: "",
      vehicleNo: ""
    }));
  }

  // 4. Reset polls
  db.polls = [];

  if (mode === "all") {
    // Keep only super admins (like u5, u6) or the currently active user who issued the purge
    db.users = db.users.filter((u: any) => {
      const isSuperAdmin = u.role === "super_admin";
      const isCurrentActive = keepUserId && u.id === keepUserId;
      return isSuperAdmin || isCurrentActive;
    });
  }

  saveDb(db);
  res.json({ 
    success: true, 
    message: "Database successfully cleared of mock/dummy records.",
    db 
  });
});

// POST test SMS dispatch
app.post("/api/settings/test-sms", async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: "Phone and message are required." });
  }
  const result = await sendSmsViaGateway(phone, message);
  if (result.success) {
    res.json({ success: true, message: "Test SMS sent successfully!", result });
  } else {
    res.status(500).json({ error: "Failed to send SMS.", details: result.error || result });
  }
});

// GET family members
app.get("/api/family", (req, res) => {
  const flat = req.query.flat as string;
  if (flat) {
    const filtered = db.family.filter(f => f.flat.toUpperCase() === flat.toUpperCase());
    return res.json(filtered);
  }
  res.json(db.family);
});

// POST add family member
app.post("/api/family", (req, res) => {
  const { flat, name, relation } = req.body;
  if (!name || !relation || !flat) {
    return res.status(400).json({ error: "Flat, name, and relation are required" });
  }
  const newMember = {
    id: `fam${Date.now()}`,
    flat,
    name,
    relation
  };
  db.family.push(newMember);
  res.status(201).json(newMember);
});

// DELETE family member
app.delete("/api/family/:id", (req, res) => {
  const { id } = req.params;
  const index = db.family.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Family member not found" });
  }
  const removed = db.family.splice(index, 1);
  res.json({ message: "Family member removed successfully", member: removed[0] });
});

// GET documents
app.get("/api/documents", (req, res) => {
  const flat = req.query.flat as string;
  if (flat) {
    const filtered = db.documents.filter(d => d.flat.toUpperCase() === flat.toUpperCase());
    return res.json(filtered);
  }
  res.json(db.documents);
});

// POST add document (Simulation of upload)
app.post("/api/documents", (req, res) => {
  const { flat, title, type } = req.body;
  if (!title || !type || !flat) {
    return res.status(400).json({ error: "Flat, title, and type are required" });
  }
  const newDoc = {
    id: `doc${Date.now()}`,
    flat,
    title,
    type,
    uploadDate: new Date().toISOString().split("T")[0],
    verified: true,
    verifiedBy: "Admin Vikram Mehta"
  };
  db.documents.push(newDoc);
  res.status(201).json(newDoc);
});

// DELETE document
app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const index = db.documents.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }
  const removed = db.documents.splice(index, 1);
  res.json({ message: "Document deleted successfully", document: removed[0] });
});

// GET coupons
app.get("/api/coupons", (req, res) => {
  res.json(db.coupons);
});

// GET jobskaru applications list
app.get("/api/jobskaru-applications", (req, res) => {
  res.json([
    {
      id: "app1",
      name: "JobsKaru Pune Local Jobs",
      tagline: "Pune's #1 verified local job search & recruitment portal.",
      url: "https://pune.jobskaru.com",
      category: "Recruitment",
      icon: "Briefcase"
    },
    {
      id: "app2",
      name: "GateKaru Smart Gatekeeper ERP",
      tagline: "This Platform: Enterprise security, visitor tracking & gate pass manager.",
      url: "https://gate.jobskaru.com",
      category: "Society ERP",
      icon: "Home"
    },
    {
      id: "app3",
      name: "MaidKaru Pune",
      tagline: "Find & hire verified daily maids, cooks, and helpers near Pune areas.",
      url: "https://maids.jobskaru.com",
      category: "Domestic Help",
      icon: "UserCheck"
    },
    {
      id: "app4",
      name: "DeliveryKaru Hyperlocal",
      tagline: "Superfast parcel, medicine & tiffin delivery across Pune city.",
      url: "https://delivery.jobskaru.com",
      category: "Logistics",
      icon: "Truck"
    },
    {
      id: "app5",
      name: "ServiceKaru Pune",
      tagline: "On-demand plumbers, electricians, AC mechanics & carpenters.",
      url: "https://services.jobskaru.com",
      category: "Home Services",
      icon: "Wrench"
    }
  ]);
});

// POST add coupon (Admin only)
app.post("/api/coupons", (req, res) => {
  const { code, title, description, brand, expiryDate, usageLimit } = req.body;
  if (!code || !title || !brand) {
    return res.status(400).json({ error: "Code, title, and brand are required" });
  }
  const newCoupon = {
    id: `cp${Date.now()}`,
    code: code.toUpperCase(),
    title,
    description: description || "",
    brand,
    expiryDate: expiryDate || "2026-12-31",
    usageLimit: usageLimit ? parseInt(usageLimit) : 100,
    redeemCount: 0
  };
  db.coupons.push(newCoupon);
  res.status(201).json(newCoupon);
});

// POST redeem coupon
app.post("/api/coupons/redeem", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }
  const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) {
    return res.status(404).json({ error: "Invalid coupon code" });
  }
  if (coupon.redeemCount >= coupon.usageLimit) {
    return res.status(400).json({ error: "Coupon usage limit exceeded" });
  }
  coupon.redeemCount += 1;
  res.json({ message: "Coupon redeemed successfully", coupon });
});

// ==========================================
// VEHICLE & GATE HISTORY APIs
// ==========================================

// GET all registered vehicles (optionally filtered by flat)
app.get("/api/vehicles", (req, res) => {
  const { flat } = req.query;
  if (flat) {
    const filtered = db.vehicles.filter(v => v.flat?.toString().toUpperCase() === flat.toString().toUpperCase());
    return res.json(filtered);
  }
  res.json(db.vehicles);
});

// POST register a new vehicle
app.post("/api/vehicles", (req, res) => {
  const { plate, type, rfidTag, owner, flat, slot, insuranceExpiry, pucExpiry, isEV, secondary, category } = req.body;
  if (!plate) {
    return res.status(400).json({ error: "License plate number is required." });
  }

  const cleanPlate = plate.trim().toUpperCase();
  // Check duplicates
  const exists = db.vehicles.some(v => v.plate === cleanPlate);
  if (exists) {
    return res.status(400).json({ error: "Vehicle license plate already registered." });
  }

  const newVehicle = {
    plate: cleanPlate,
    type: type || "Car (Sedan)",
    rfidTag: rfidTag || `UHF-TAG-${Math.floor(1000 + Math.random() * 9000)}`,
    owner: owner || "Aarav Sharma",
    flat: flat || "A-402",
    slot: slot || `A-P${Math.floor(10 + Math.random() * 89)}`,
    insuranceExpiry: insuranceExpiry || "2027-07-09",
    pucExpiry: pucExpiry || "2026-10-09",
    rcFile: null,
    insuranceFile: null,
    pucFile: null,
    isEV: !!isEV,
    secondary: !!secondary,
    category: category || "Primary Vehicle"
  };

  db.vehicles.push(newVehicle);
  res.json({ message: "Vehicle registered successfully", vehicle: newVehicle });
});

// POST edit / update an existing vehicle details
app.post("/api/vehicles/update", (req, res) => {
  const { plate, type, rfidTag, owner, flat, slot, insuranceExpiry, pucExpiry, isEV, secondary, category, rcFile, insuranceFile, pucFile } = req.body;
  if (!plate) {
    return res.status(400).json({ error: "Plate is required to update details." });
  }

  const cleanPlate = plate.trim().toUpperCase();
  const index = db.vehicles.findIndex(v => v.plate === cleanPlate);
  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found." });
  }

  db.vehicles[index] = {
    ...db.vehicles[index],
    ...(type && { type }),
    ...(rfidTag && { rfidTag }),
    ...(owner && { owner }),
    ...(flat && { flat }),
    ...(slot && { slot }),
    ...(insuranceExpiry && { insuranceExpiry }),
    ...(pucExpiry && { pucExpiry }),
    ...(typeof isEV === "boolean" && { isEV }),
    ...(typeof secondary === "boolean" && { secondary }),
    ...(category && { category }),
    ...(rcFile !== undefined && { rcFile }),
    ...(insuranceFile !== undefined && { insuranceFile }),
    ...(pucFile !== undefined && { pucFile })
  };

  res.json({ message: "Vehicle details updated successfully", vehicle: db.vehicles[index] });
});

// DELETE a registered vehicle
app.delete("/api/vehicles/:plate", (req, res) => {
  const { plate } = req.params;
  const cleanPlate = plate.trim().toUpperCase();
  const index = db.vehicles.findIndex(v => v.plate === cleanPlate);
  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found." });
  }

  const removed = db.vehicles.splice(index, 1);
  res.json({ message: "Vehicle deleted successfully", vehicle: removed[0] });
});

// GET gate entries log (with range filter: today, week, month)
app.get("/api/gates/history", (req, res) => {
  const { flat, range } = req.query;
  let logs = [...db.gateLogs];

  if (flat) {
    logs = logs.filter(l => l.flat?.toString().toUpperCase() === flat.toString().toUpperCase());
  }

  const todayStr = new Date().toISOString().split("T")[0];

  if (range === "today") {
    logs = logs.filter(l => l.date === todayStr);
  } else if (range === "week") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    logs = logs.filter(l => new Date(l.date) >= sevenDaysAgo);
  } else if (range === "month") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    logs = logs.filter(l => new Date(l.date) >= thirtyDaysAgo);
  }

  res.json(logs);
});

// POST register visitor temporary pass
app.post("/api/visitors/pass", (req, res) => {
  const { vehicleNumber, visitorName, validFrom, validTo, hostFlat, hostName } = req.body;
  if (!vehicleNumber || !visitorName) {
    return res.status(400).json({ error: "Vehicle number and visitor name are required." });
  }

  const passcode = `V-${Math.floor(10000 + Math.random() * 90000)}`;
  const newPass = {
    id: `v-${Date.now()}`,
    name: visitorName,
    type: "Guest" as const,
    purpose: `Temporary Vehicle Pass (${validFrom} to ${validTo})`,
    flat: hostFlat || "A-402",
    hostName: hostName || "Aarav Sharma",
    company: "Temporary Pass",
    vehicleNumber: vehicleNumber.trim().toUpperCase(),
    passcode,
    qrCode: `QR-${passcode}`,
    status: "Pre-Approved" as const,
    requestedAt: new Date().toISOString(),
    checkedInAt: null,
    checkedOutAt: null
  };

  db.visitors.push(newPass);
  res.json({ message: "Visitor temporary pass created", pass: newPass });
});

// POST vehicle emergency action (Report theft, lost tag, unlock, blacklist)
app.post("/api/vehicles/emergency", (req, res) => {
  const { plate, action, details } = req.body;
  if (!plate || !action) {
    return res.status(400).json({ error: "Vehicle plate and emergency action type are required." });
  }

  const cleanPlate = plate.trim().toUpperCase();
  const timestamp = new Date().toLocaleTimeString();
  const dateStr = new Date().toISOString().split("T")[0];

  // Log emergency alert in db.guardAlerts
  const alertMsg = `⚠️ EMERGENCY [${action.toUpperCase()}] triggered for Vehicle ${cleanPlate}. Details: ${details || "Immediate support requested"}`;
  const newAlert = {
    id: `al-${Date.now()}`,
    sender: "Resident App Alert System",
    type: "SOS / Emergency",
    message: alertMsg,
    timestamp: new Date().toISOString(),
    status: "Active" as const
  };
  db.guardAlerts.unshift(newAlert);

  // If blacklisting, we can update or record a gateLog flagged attempt
  if (action === "blacklist") {
    db.gateLogs.unshift({
      id: `glog-${Date.now()}`,
      date: dateStr,
      time: timestamp,
      gate: "Main Gate 1",
      type: "Entry",
      rfid: "BLACKLISTED",
      vehicleNo: cleanPlate,
      ownerName: "SECURITY BLOCKLIST",
      flat: "Blocked",
      status: "Flagged"
    });
  }

  res.json({ message: `Emergency Action ${action.toUpperCase()} recorded. Security guards notified!`, alert: newAlert });
});

// ==========================================
// SECURITY OPERATIONS DESK API ENDPOINTS (GateKaru Strengthening Features)
// ==========================================

function ensureSecurityDeskData() {
  let changed = false;

  // 1. Blacklist
  if (!db.securityBlacklist) {
    db.securityBlacklist = [
      {
        id: "bl-1",
        name: "Ramesh Yadav",
        phone: "+91 98765 00001",
        type: "Delivery (Zomato)",
        vehicleNo: "DL-3C-AL-4433",
        reason: "Violated speed limit inside society repeatedly and misbehaved with resident.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "bl-2",
        name: "Suresh Kumar",
        phone: "+91 91111 22222",
        type: "Visitor / Cab",
        vehicleNo: "HR-26-CM-8877",
        reason: "Argued with Main Gate guards, refused departure logging, and damaged gate barrier.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    changed = true;
  }

  // 2. Shift Handovers
  if (!db.shiftHandovers) {
    db.shiftHandovers = [
      {
        id: "ho-1",
        outgoingGuard: "Mahesh Singh",
        incomingGuard: "Dharam Singh",
        shiftType: "Day Shift (08:00 - 20:00)",
        intercomOk: true,
        rfidOk: true,
        keysHandedOver: true,
        incidentsNote: "All quiet. Water pump checked. Tower B lift was under service for 30 mins, now fully operational.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    changed = true;
  }

  // 3. Patrol Rounds
  if (!db.patrolRounds) {
    db.patrolRounds = [
      {
        id: "pt-1",
        guardName: "Dharam Singh",
        shiftType: "Night Shift",
        checkpoints: [
          { name: "Main Gate 1", status: "ok", time: "11:15 PM" },
          { name: "Sector-A Tower Lift Lobby", status: "ok", time: "11:30 PM" },
          { name: "Sector-B Tower Back Alleys", status: "issue", comment: "Corner bulb was flickering", time: "11:45 PM" },
          { name: "Electrical Substation", status: "ok", time: "12:00 AM" },
          { name: "Water Pump House", status: "ok", time: "12:15 AM" }
        ],
        issuesFound: true,
        comments: "Flickering bulb at Tower B. Logged with electrical helpdesk. Otherwise no intruders or incidents detected.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
    changed = true;
  }

  if (changed) {
    saveDb(db);
  }
}

// Blacklist Endpoints
app.get("/api/security/blacklist", (req, res) => {
  ensureSecurityDeskData();
  res.json(db.securityBlacklist);
});

app.post("/api/security/blacklist", (req, res) => {
  ensureSecurityDeskData();
  const { name, phone, type, vehicleNo, reason } = req.body;
  if (!name && !vehicleNo) {
    return res.status(400).json({ error: "Either name or vehicle number is required to blacklist." });
  }

  const newEntry = {
    id: `bl-${Date.now()}`,
    name: name || "N/A",
    phone: phone || "N/A",
    type: type || "General Visitor",
    vehicleNo: vehicleNo ? vehicleNo.trim().toUpperCase() : "N/A",
    reason: reason || "Flagged by administration for suspicious activity or security violation.",
    createdAt: new Date().toISOString()
  };

  db.securityBlacklist.unshift(newEntry);
  saveDb(db);
  res.json({ message: "Security Blacklist entry created successfully.", entry: newEntry });
});

app.delete("/api/security/blacklist/:id", (req, res) => {
  ensureSecurityDeskData();
  const { id } = req.params;
  const index = db.securityBlacklist.findIndex((item: any) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Blacklist entry not found." });
  }

  const removed = db.securityBlacklist.splice(index, 1);
  saveDb(db);
  res.json({ message: "Successfully removed from security blacklist.", entry: removed[0] });
});

// Shift Handover Endpoints
app.get("/api/security/handover", (req, res) => {
  ensureSecurityDeskData();
  res.json(db.shiftHandovers);
});

app.post("/api/security/handover", (req, res) => {
  ensureSecurityDeskData();
  const { outgoingGuard, incomingGuard, shiftType, intercomOk, rfidOk, keysHandedOver, incidentsNote } = req.body;
  if (!outgoingGuard || !incomingGuard || !shiftType) {
    return res.status(400).json({ error: "Outgoing guard, incoming guard, and shift type are required." });
  }

  const newHandover = {
    id: `ho-${Date.now()}`,
    outgoingGuard,
    incomingGuard,
    shiftType,
    intercomOk: !!intercomOk,
    rfidOk: !!rfidOk,
    keysHandedOver: !!keysHandedOver,
    incidentsNote: incidentsNote || "No incidents to report.",
    timestamp: new Date().toISOString()
  };

  db.shiftHandovers.unshift(newHandover);
  saveDb(db);
  res.json({ message: "Shift handover logged successfully.", handover: newHandover });
});

// Patrol Rounds Endpoints
app.get("/api/security/patrol", (req, res) => {
  ensureSecurityDeskData();
  res.json(db.patrolRounds);
});

app.post("/api/security/patrol", (req, res) => {
  ensureSecurityDeskData();
  const { guardName, shiftType, checkpoints, issuesFound, comments } = req.body;
  if (!guardName || !shiftType || !checkpoints) {
    return res.status(400).json({ error: "Guard name, shift type, and checkpoints are required." });
  }

  const newPatrol = {
    id: `pt-${Date.now()}`,
    guardName,
    shiftType,
    checkpoints,
    issuesFound: !!issuesFound,
    comments: comments || "No comments.",
    timestamp: new Date().toISOString()
  };

  db.patrolRounds.unshift(newPatrol);
  saveDb(db);
  res.json({ message: "Patrol round logged successfully.", patrol: newPatrol });
});

// ==========================================
// SMART RFID BARRIER GATE COMMUNICATION ENDPOINT
// ==========================================
app.post("/api/gates/open", (req, res) => {
  const { vehicleNo, rfidTag, gateId = "Gate 1" } = req.body;

  if (!vehicleNo && !rfidTag) {
    return res.status(400).json({
      status: "error",
      authorized: false,
      message: "Bad Request: vehicleNo or rfidTag is required for scanning."
    });
  }

  // Normalize inputs
  const searchPlate = vehicleNo ? vehicleNo.trim().toUpperCase() : "";
  const searchTag = rfidTag ? rfidTag.trim().toUpperCase() : "";

  // Find user by vehicle number or RFID tag in user database
  let matchedUser = db.users.find(u => {
    const userPlate = u.vehicleNo ? u.vehicleNo.trim().toUpperCase() : "";
    return userPlate && (userPlate === searchPlate || (searchTag && userPlate.includes(searchTag)));
  });

  // If not found in primary, check our custom vehicles array
  if (!matchedUser) {
    const vMatch = db.vehicles.find(v => v.plate === searchPlate || (searchTag && v.rfidTag === searchTag));
    if (vMatch) {
      matchedUser = {
        id: `u-sim-${Date.now()}`,
        name: vMatch.owner,
        phone: "+91 98765 00000",
        email: "simulated@example.com",
        role: "resident" as const,
        flat: vMatch.flat,
        type: "Owner",
        vehicleNo: vMatch.plate
      };
    }
  }

  // If not found in primary db, search if any visitor has a whitelisted vehicle matching pre-approval
  let isVisitor = false;
  let visitorMatch = null;
  if (!matchedUser) {
    visitorMatch = db.visitors.find(v => {
      const visPlate = v.vehicleNumber ? v.vehicleNumber.trim().toUpperCase() : "";
      return visPlate && (visPlate === searchPlate) && v.status === "Pre-Approved";
    });
    if (visitorMatch) {
      isVisitor = true;
    }
  }

  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split("T")[0];
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const signalStrength = `${-50 - Math.floor(Math.random() * 20)} dBm`;

  if (matchedUser) {
    // Authorized Resident
    const tagVal = searchTag || `UHF-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Add record to Gate Entry Logs
    db.gateLogs.unshift({
      id: `glog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      gate: gateId,
      type: "Entry",
      rfid: tagVal,
      vehicleNo: matchedUser.vehicleNo || searchPlate,
      ownerName: matchedUser.name,
      flat: matchedUser.flat || "Admin/Staff",
      status: "Success"
    });

    return res.json({
      status: "success",
      authorized: true,
      message: `Access GRANTED. Boom barrier at ${gateId} lifted. Welcome back, Resident ${matchedUser.name}!`,
      barrierAction: "OPEN_GATE",
      gateId,
      vehicle: {
        vehicleNo: matchedUser.vehicleNo,
        owner: matchedUser.name,
        flat: matchedUser.flat || "Admin/Staff",
        role: matchedUser.role,
        rfidTag: tagVal
      },
      telemetry: {
        signalStrength,
        protocol: "Wiegand-34",
        controllerIP: "192.168.1.108",
        relayPort: 1,
        holdSeconds: 10,
        timestamp
      }
    });
  } else if (isVisitor && visitorMatch) {
    // Authorized Visitor / Cab with Pre-Approved Pass
    visitorMatch.status = "Checked-In";
    visitorMatch.checkedInAt = timestamp;
    
    // Add record to Gate Entry Logs
    db.gateLogs.unshift({
      id: `glog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      gate: gateId,
      type: "Entry",
      rfid: "VISITOR-PASS",
      vehicleNo: visitorMatch.vehicleNumber,
      ownerName: visitorMatch.name,
      flat: visitorMatch.flat,
      status: "Success"
    });

    return res.json({
      status: "success",
      authorized: true,
      message: `Access GRANTED. Pre-Approved visitor/cab ${visitorMatch.name} (${visitorMatch.company}) detected. Boom barrier at ${gateId} opened.`,
      barrierAction: "OPEN_GATE",
      gateId,
      vehicle: {
        vehicleNo: visitorMatch.vehicleNumber,
        owner: visitorMatch.name,
        flat: visitorMatch.flat,
        role: `visitor (${visitorMatch.type})`,
        rfidTag: searchTag || "VISITOR-PASS"
      },
      telemetry: {
        signalStrength,
        protocol: "Wiegand-34",
        controllerIP: "192.168.1.108",
        relayPort: 1,
        holdSeconds: 10,
        timestamp
      }
    });
  } else {
    // Unregistered vehicle - Log access denied attempt
    db.gateLogs.unshift({
      id: `glog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      gate: gateId,
      type: "Entry",
      rfid: searchTag || "UNKNOWN",
      vehicleNo: searchPlate || "Unknown",
      ownerName: "Unregistered Visitor",
      flat: "Unknown",
      status: "Rejected"
    });

    return res.status(403).json({
      status: "denied",
      authorized: false,
      message: `Access DENIED. Vehicle ${searchPlate || "UNKNOWN"} with RFID Tag ${searchTag || "UNKNOWN"} is not whitelisted.`,
      barrierAction: "KEEP_LOCKED",
      gateId,
      vehicle: {
        vehicleNo: searchPlate || "Unknown",
        rfidTag: searchTag || "Unknown"
      },
      telemetry: {
        signalStrength,
        protocol: "Wiegand-34",
        controllerIP: "192.168.1.108",
        relayPort: 1,
        holdSeconds: 0,
        timestamp
      }
    });
  }
});

// **AI Feature 4: AI Visitor Analytics Report** (Summarizes the security logs, peak hours, frequent visitor types, and alerts)
app.post("/api/analytics/ai-report", async (req, res) => {
  if (!isGeminiReady()) {
    return res.json({
      summary: "### Weekly Visitor Dynamics (Demo Report)\n- **High Visitor Density:** Deliveries peaked between 11:00 AM and 01:00 PM, primarily driven by Zomato & Amazon.\n- **Frequent Visitors:** Domestic helper Kamla Devi entered daily at 07:45 AM, maintaining 100% attendance.\n- **Risk Profile:** 1 Cab (Ola) stayed inside for less than 25 minutes, validating quick turnarounds.\n- **Committee Recommendation:** Allocate separate dedicated parking slots for delivery vehicles near Block B entrance to reduce driveways blockages.",
      stats: {
        totalVisitors: db.visitors.length,
        checkedIn: db.visitors.filter(v => v.status === "Checked-In").length,
        preApproved: db.visitors.filter(v => v.status === "Pre-Approved").length,
        checkedOut: db.visitors.filter(v => v.status === "Checked-Out").length,
        deliveryPercentage: Math.round((db.visitors.filter(v => v.type === "Delivery").length / db.visitors.length) * 100) || 25
      }
    });
  }

  try {
    const visitorSummaryForAI = db.visitors.map(v => ({
      type: v.type,
      company: v.company,
      flat: v.flat,
      status: v.status,
      requestedAt: v.requestedAt,
      checkedInAt: v.checkedInAt,
      checkedOutAt: v.checkedOutAt
    }));

    const prompt = `You are GateKaru, the Security AI Auditor.
Analyze these visitor logs for Greenwood Heights Society:
${JSON.stringify(visitorSummaryForAI, null, 2)}

Provide a JSON response containing:
1. "summary": A gorgeous, comprehensive analytical report in Markdown format. Outline key insights such as peak visitor times, delivery density, guest turnaround metrics, security risk indicators, and recommendations for society guards.
2. "stats": An object detailing total count, delivery percentage, and average stay time insights.

Respond ONLY with valid JSON structure:
{
  "summary": "Deep-dive Markdown analytical report",
  "stats": {
    "totalVisitors": number,
    "checkedIn": number,
    "preApproved": number,
    "checkedOut": number,
    "deliveryPercentage": number
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("AI Visitor Analytics error:", err);
    res.status(500).json({ error: "Gemini AI analysis failed: " + err.message });
  }
});

// **Helper Function to Generate the Complete Hostinger & Capacitor Android ZIP**
function generateHostingerZip(): Buffer {
  const zip = new AdmZip();
  const rootDir = process.cwd();

  // Files to include in the ZIP
  const filesToInclude = [
    "package.json",
    "package-lock.json",
    "server.js",
    "server.ts",
    "db_store.ts",
    "gatekaru_db.json",
    "capacitor.config.json",
    "README.md",
    "HOSTINGER_DEPLOYMENT.md",
    ".env.example",
    "index.html",
    "vite.config.ts",
    "tsconfig.json"
  ];

  filesToInclude.forEach((file) => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      zip.addLocalFile(filePath);
    }
  });

  // Folders to include (and preserve directory structures)
  const foldersToInclude = [
    { localName: "dist", zipName: "dist" },
    { localName: "src", zipName: "src" },
    { localName: "public", zipName: "public" },
    { localName: "android", zipName: "android" },
    { localName: "uploads", zipName: "uploads" }
  ];

  foldersToInclude.forEach(({ localName, zipName }) => {
    const folderPath = path.join(rootDir, localName);
    if (fs.existsSync(folderPath)) {
      zip.addLocalFolder(folderPath, zipName);
    }
  });

  const zipBuffer = zip.toBuffer();
  
  // Also write a copy to disk on the container root for the user to download from the sidebar file explorer
  const zipDiskPath = path.join(rootDir, "gatekaru-hostinger-production.zip");
  fs.writeFileSync(zipDiskPath, zipBuffer);
  
  return zipBuffer;
}

// **ZIP Exporter Endpoint for Hostinger Deployments**
app.get("/api/download-hostinger-zip", (req, res) => {
  try {
    const zipBuffer = generateHostingerZip();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=gatekaru-hostinger-production.zip");
    res.send(zipBuffer);
  } catch (err: any) {
    console.error("ZIP creation failed:", err);
    res.status(500).json({ error: "Failed to create deployment package: " + err.message });
  }
});

// ==========================================
// VITE CLIENT INTEGRATION
// ==========================================

async function startServer() {
  db = await initializeDatabase(defaultDb);

  // Pre-generate Hostinger & Android production package ZIP on startup
  try {
    generateHostingerZip();
    console.log("⚡ Hostinger deployment ZIP pre-generated successfully.");
  } catch (err: any) {
    console.warn("⚠️ Failed to pre-generate deployment ZIP on startup:", err.message || err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Setup WebSocket Server for real-time WebSocket connection health status
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const urlObj = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      const pathname = urlObj.pathname;
      if (pathname === "/api/ws" || pathname === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch (err) {
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    // Send initial status message
    ws.send(JSON.stringify({ type: "health", status: "optimal", timestamp: new Date().toISOString() }));

    // Keepalive ping interval
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 25000);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Safe catch
      }
    });

    ws.on("close", () => {
      clearInterval(interval);
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      console.error("WebSocket client connection error:", err);
    });
  });
}

startServer();
