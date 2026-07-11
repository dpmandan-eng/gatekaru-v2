import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeDatabase, saveDb, runDbDiagnostics } from "./db_store";
import jwt from "jsonwebtoken";
import AdmZip from "adm-zip";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "gatekaru_fallback_secret_for_jwt";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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
    { id: "s1", name: "Greenwood Heights Society", address: "Sector 45, Gurugram, Haryana, India", totalFlats: 120, billingCycle: "Monthly" }
  ],
  users: [
    // Resident Owner
    { id: "u1", name: "Aarav Sharma", phone: "+91 98765 43210", email: "aarav@example.com", role: "resident", flat: "A-402", type: "Owner", vehicleNo: "DL-3C-AB-1234" },
    // Resident Tenant
    { id: "u2", name: "Priya Patel", phone: "+91 87654 32109", email: "priya@example.com", role: "resident", flat: "B-105", type: "Tenant", vehicleNo: "HR-26-CD-5678" },
    // Security Guard
    { id: "u3", name: "Mahendra Singh", phone: "+91 76543 21098", email: "singh.guard@example.com", role: "guard", shift: "Day Shift (08:00 AM - 08:00 PM)", gate: "Gate 1", idCard: "SG-882" },
    // Society Admin
    { id: "u4", name: "Vikram Mehta", phone: "+91 65432 10987", email: "admin.mehta@example.com", role: "admin", designation: "General Secretary", committee: "Greenwood Management Committee" },
    // Super Admin
    { id: "u5", name: "Rajesh GateKaru", phone: "+91 99999 88888", email: "super@gatekaru.com", role: "super_admin", organization: "GateKaru Corporate" },
    // Developer Super Admin
    { id: "u6", name: "GateKaru Developer", phone: "+91 99999 12345", email: "jaiganeshdp@gmail.com", role: "super_admin", organization: "GateKaru Corporate" }
  ],
  visitors: [
    {
      id: "v1",
      name: "Sanjay Kumar",
      type: "Guest",
      purpose: "Meeting Friend",
      flat: "A-402",
      hostName: "Aarav Sharma",
      company: "Personal",
      vehicleNumber: "DL-10-X-9988",
      passcode: "G-49201",
      qrCode: "QR-G-49201",
      status: "Pre-Approved",
      requestedAt: "2026-07-08T09:30:00Z",
      checkedInAt: null,
      checkedOutAt: null
    },
    {
      id: "v2",
      name: "Amit Patel",
      type: "Delivery",
      purpose: "Food Delivery",
      flat: "B-105",
      hostName: "Priya Patel",
      company: "Zomato",
      vehicleNumber: "HR-26-Y-1122",
      passcode: "D-88124",
      qrCode: "QR-D-88124",
      status: "Checked-In",
      requestedAt: "2026-07-08T11:45:00Z",
      checkedInAt: "2026-07-08T11:50:00Z",
      checkedOutAt: null
    },
    {
      id: "v3",
      name: "Ramesh Kumar",
      type: "Cab",
      purpose: "Ola Pickup",
      flat: "A-402",
      hostName: "Aarav Sharma",
      company: "Ola Cabs",
      vehicleNumber: "DL-1C-Z-4545",
      passcode: "C-20911",
      qrCode: "QR-C-20911",
      status: "Checked-Out",
      requestedAt: "2026-07-08T08:00:00Z",
      checkedInAt: "2026-07-08T08:10:00Z",
      checkedOutAt: "2026-07-08T08:35:00Z"
    },
    {
      id: "v4",
      name: "Vikram Soni",
      type: "Service",
      purpose: "Water Purifier Service",
      flat: "A-402",
      hostName: "Aarav Sharma",
      company: "Kent RO",
      vehicleNumber: "No Vehicle",
      passcode: "S-55102",
      qrCode: "QR-S-55102",
      status: "Pre-Approved",
      requestedAt: "2026-07-08T12:00:00Z",
      checkedInAt: null,
      checkedOutAt: null
    }
  ],
  maintenance: [
    { id: "m1", flat: "A-402", title: "Monthly Maintenance - July 2026", amount: 4500, dueDate: "2026-07-15", status: "Unpaid", category: "Maintenance Fee", paidAt: null, transactionId: null },
    { id: "m2", flat: "B-105", title: "Monthly Maintenance - July 2026", amount: 4500, dueDate: "2026-07-15", status: "Paid", category: "Maintenance Fee", paidAt: "2026-07-05T10:30:00Z", transactionId: "TXN99281726" },
    { id: "m3", flat: "A-402", title: "Monthly Maintenance - June 2026", amount: 4500, dueDate: "2026-06-15", status: "Paid", category: "Maintenance Fee", paidAt: "2026-06-12T14:22:00Z", transactionId: "TXN88201931" },
    { id: "m4", flat: "A-402", title: "Clubhouse Party Booking Fee", amount: 2000, dueDate: "2026-07-10", status: "Paid", category: "Amenity Utility", paidAt: "2026-07-06T11:00:00Z", transactionId: "TXN91827411" }
  ],
  complaints: [
    {
      id: "c1",
      flat: "A-402",
      residentName: "Aarav Sharma",
      title: "Block A lift door sticking",
      category: "Lifts & Elevators",
      description: "The ground floor elevator door for Block A sticks when opening and takes more than 15 seconds. Please look into it.",
      status: "Assigned",
      createdAt: "2026-07-06T09:15:00Z",
      assignedTo: "Karan Johar (Elevator Tech)",
      updates: [
        { date: "2026-07-06T10:00:00Z", note: "Ticket acknowledged and assigned to technical partner." }
      ]
    },
    {
      id: "c2",
      flat: "B-105",
      residentName: "Priya Patel",
      title: "Water seepage in B-Block lobby",
      category: "Plumbing",
      description: "Seepage observed in the ceiling of B-Block basement parking and ground floor lobby near the lift core.",
      status: "Resolved",
      createdAt: "2026-07-05T14:30:00Z",
      assignedTo: "Ramesh Prasad (Plumber)",
      updates: [
        { date: "2026-07-05T15:30:00Z", note: "Plumbing team inspected. Main leak from line joint repaired." },
        { date: "2026-07-06T11:00:00Z", note: "Inspection done. Seepage dried. Complaint marked as resolved." }
      ]
    }
  ],
  notices: [
    { id: "n1", title: "Water Supply Interruption Notice", category: "Maintenance", content: "Dear Residents, water supply will be suspended on 10th July from 10:00 AM to 02:00 PM for water tank cleaning. Please plan accordingly.", date: "2026-07-08", author: "Vikram Mehta (General Secretary)" },
    { id: "n2", title: "EV Charger Installation Proposal", category: "General Notice", content: "The management committee is proposing to install shared EV charging docks in the visitor parking area. Feedback and votes can be cast via the Polls section on the app.", date: "2026-07-07", author: "Committee Office" },
    { id: "n3", title: "Monsoon Preparedness Drive", category: "Safety", content: "Residents are requested to secure balcony pots and ensure screen doors are closed to avoid rainwater seepage. Guards have been instructed to clear storm drains hourly.", date: "2026-07-06", author: "Estate Manager" }
  ],
  chats: [
    { id: "ch1", sender: "Aarav Sharma", role: "Resident", flat: "A-402", message: "Hi neighbors, does anyone have a recommendation for an AC technician? Ours stopped cooling today.", timestamp: "2026-07-08T10:15:00Z" },
    { id: "ch2", sender: "Priya Patel", role: "Resident", flat: "B-105", message: "Hey Aarav! You can call Mr. Verma (+91 99201 22817). He is the society's regular tech, very reliable.", timestamp: "2026-07-08T10:30:00Z" },
    { id: "ch3", sender: "Vikram Mehta", role: "Admin", flat: "Committee", message: "Gentle reminder to all residents: please cast your vote on the EV Charging station poll by this Sunday.", timestamp: "2026-07-08T11:00:00Z" }
  ],
  amenities: [
    { id: "a1", name: "Clubhouse / Community Hall", capacity: 100, costPerHour: 500, description: "Fully air-conditioned hall with seating and sound system." },
    { id: "a2", name: "Gymnasium", capacity: 15, costPerHour: 0, description: "State-of-the-art weights and cardio equipment." },
    { id: "a3", name: "Badminton Court", capacity: 4, costPerHour: 100, description: "Indoor wooden court. Slots require pre-booking." }
  ],
  amenityBookings: [
    { id: "ab1", amenityId: "a1", amenityName: "Clubhouse / Community Hall", residentName: "Aarav Sharma", flat: "A-402", date: "2026-07-12", timeSlot: "18:00 - 21:00", cost: 1500, status: "Confirmed" }
  ],
  staff: [
    { id: "st1", name: "Kamla Devi", type: "Maid", phone: "+91 99201 88273", rating: 4.8, flats: "A-402, B-105, B-101", status: "Checked-In", checkedInAt: "2026-07-08T07:45:00Z", code: "H-881" },
    { id: "st2", name: "Rajinder Singh", type: "Driver", phone: "+91 88271 66152", rating: 4.5, flats: "A-402", status: "Checked-Out", checkedInAt: "2026-07-08T08:15:00Z", checkedOutAt: "2026-07-08T12:00:00Z", code: "H-192" },
    { id: "st3", name: "Suresh Malik", type: "Milkman", phone: "+91 77123 44556", rating: 4.2, flats: "Multiple Blocks", status: "Checked-In", checkedInAt: "2026-07-08T06:10:00Z", code: "H-002" }
  ],
  parking: [
    { id: "p1", slotNumber: "A-P45", flat: "A-402", owner: "Aarav Sharma", vehicleNumber: "DL-3C-AB-1234", vehicleType: "4-Wheeler" },
    { id: "p2", slotNumber: "B-P09", flat: "B-105", owner: "Priya Patel", vehicleNumber: "HR-26-CD-5678", vehicleType: "4-Wheeler" },
    { id: "p3", slotNumber: "A-P99", flat: "A-402", owner: "Aarav Sharma", vehicleNumber: "DL-3C-MM-5566", vehicleType: "2-Wheeler" }
  ],
  polls: [
    {
      id: "pl1",
      question: "Should we install EV charging stations in the visitor parking area?",
      options: [
        { id: "o1", text: "Yes, immediately", votes: 42 },
        { id: "o2", text: "Yes, but users should pay usage fees", votes: 28 },
        { id: "o3", text: "No, unnecessary expense", votes: 5 }
      ],
      votedUsers: ["u1", "u2"],
      totalVotes: 75,
      endsAt: "2026-07-12T18:00:00Z"
    },
    {
      id: "pl2",
      question: "Proposed Independence Day celebration budget approval (INR 50,000)",
      options: [
        { id: "o4", text: "Approve budget", votes: 56 },
        { id: "o5", text: "Reduce budget to 30,000", votes: 12 },
        { id: "o6", text: "Cancel celebration", votes: 2 }
      ],
      votedUsers: ["u2"],
      totalVotes: 70,
      endsAt: "2026-08-01T18:00:00Z"
    }
  ],
  guardAlerts: [
    { id: "al1", sender: "Mahendra Singh (Guard)", type: "SOS / Emergency", message: "SOS Alert triggered from Block A elevator - resident trapped.", timestamp: "2026-07-08T12:15:00Z", status: "Active" }
  ],
  superAdminPlans: [
    { id: "pln1", name: "GateKaru Essential", price: 1500, period: "Monthly", societies: 12, features: ["Visitor Pre-Approval", "Notice Board", "SOS Alerts"] },
    { id: "pln2", name: "GateKaru Premium Enterprise", price: 3500, period: "Monthly", societies: 38, features: ["All Essentials", "Society Accounting & ERP", "Maintenance Payments", "AI Assistants Suite"] }
  ],
  approvals: [
    {
      id: "app-1",
      visitorName: "Vijay Prasad",
      type: "Delivery",
      company: "Swiggy",
      flat: "A-402",
      hostName: "Aarav Sharma",
      vehicleNumber: "DL-3C-S-5544",
      status: "Waiting",
      timestamp: "2026-07-08T21:10:00.000Z"
    },
    {
      id: "app-2",
      visitorName: "Sonia Grewal",
      type: "Guest",
      company: "Personal",
      flat: "B-105",
      hostName: "Priya Patel",
      vehicleNumber: "HR-26-Z-9898",
      status: "Waiting",
      timestamp: "2026-07-08T21:12:00.000Z"
    }
  ],
  vehicles: [
    { plate: "DL-3C-AB-1234", type: "Car (Sedan)", rfidTag: "UHF-TAG-8821", owner: "Aarav Sharma", flat: "A-402", slot: "A-P45", insuranceExpiry: "2026-07-21", pucExpiry: "2026-07-14", rcFile: "rc_dl3cab1234.pdf", insuranceFile: "ins_dl3cab1234.pdf", pucFile: "puc_dl3cab1234.pdf", isEV: false, secondary: false, category: "Primary Vehicle" },
    { plate: "DL-3C-MM-5566", type: "Two-Wheeler", rfidTag: "UHF-TAG-5529", owner: "Aarav Sharma", flat: "A-402", slot: "A-P99", insuranceExpiry: "2026-08-15", pucExpiry: "2026-07-14", rcFile: "rc_dl3cmm5566.pdf", insuranceFile: "ins_dl3cmm5566.pdf", pucFile: null, isEV: false, secondary: true, category: "Secondary Vehicle" },
    { plate: "MH-12-PQ-9988", type: "Two-Wheeler (EV Scooter)", rfidTag: "UHF-TAG-2211", owner: "Aarav Sharma", flat: "A-402", slot: "A-P99", insuranceExpiry: "2027-01-10", pucExpiry: "2026-12-30", rcFile: null, insuranceFile: null, pucFile: null, isEV: true, secondary: false, category: "Two Wheeler" },
    { plate: "HR-26-CD-5678", type: "Car (SUV/EV)", rfidTag: "UHF-TAG-1011", owner: "Priya Patel", flat: "B-105", slot: "B-P09", insuranceExpiry: "2026-10-02", pucExpiry: "2026-10-15", rcFile: "rc_hr26cd5678.pdf", insuranceFile: null, pucFile: null, isEV: true, secondary: false, category: "Primary Vehicle" }
  ],
  gateLogs: [
    { id: "glog-1", date: "2026-07-09", time: "10:30:15 AM", gate: "Main Gate 1", type: "Entry", rfid: "UHF-TAG-8821", vehicleNo: "DL-3C-AB-1234", ownerName: "Aarav Sharma", flat: "A-402", status: "Success" },
    { id: "glog-2", date: "2026-07-09", time: "11:15:22 AM", gate: "Main Gate 1", type: "Exit", rfid: "UHF-TAG-8821", vehicleNo: "DL-3C-AB-1234", ownerName: "Aarav Sharma", flat: "A-402", status: "Success" },
    { id: "glog-3", date: "2026-07-08", time: "09:12:44 AM", gate: "Back Gate 2", type: "Entry", rfid: "UHF-TAG-5529", vehicleNo: "DL-3C-MM-5566", ownerName: "Aarav Sharma", flat: "A-402", status: "Success" },
    { id: "glog-4", date: "2026-07-08", time: "12:45:10 PM", gate: "Back Gate 2", type: "Exit", rfid: "UHF-TAG-5529", vehicleNo: "DL-3C-MM-5566", ownerName: "Aarav Sharma", flat: "A-402", status: "Success" },
    { id: "glog-5", date: "2026-07-07", time: "08:10:00 AM", gate: "Main Gate 1", type: "Entry", rfid: "UHF-TAG-1011", vehicleNo: "HR-26-CD-5678", ownerName: "Priya Patel", flat: "B-105", status: "Success" },
    { id: "glog-6", date: "2026-07-06", time: "07:22:15 PM", gate: "Main Gate 1", type: "Entry", rfid: "UNKNOWN", vehicleNo: "DL-10-X-9988", ownerName: "Sanjay Kumar", flat: "A-402", status: "Success" },
    { id: "glog-7", date: "2026-07-05", time: "04:45:00 PM", gate: "Main Gate 1", type: "Entry", rfid: "UHF-TAG-8821", vehicleNo: "DL-3C-AB-1234", ownerName: "Aarav Sharma", flat: "A-402", status: "Flagged" }
  ],
  coupons: [
    { id: "cp1", code: "ZOMATOGATE", title: "Craving Hot, Delicious Food? 🍔", description: "60% OFF + Free Delivery exclusively for Greenwood Heights residents.", brand: "Zomato", expiryDate: "2026-12-31", usageLimit: 50, redeemCount: 0 },
    { id: "cp2", code: "SWIGGYKARU", title: "Groceries & Gourmet in 10m! 🍕", description: "Save ₹150 on Instamart with free delivery on essentials.", brand: "Swiggy", expiryDate: "2026-10-31", usageLimit: 100, redeemCount: 0 }
  ],
  family: [
    { id: "fam1", flat: "A-402", name: "Suman Sharma", relation: "Spouse" },
    { id: "fam2", flat: "A-402", name: "Karan Sharma", relation: "Son" }
  ],
  documents: [
    { id: "doc1", flat: "A-402", title: "Rent Agreement Greenwood Block A.pdf", type: "Rent Deed", uploadDate: "2026-07-01", verified: true, verifiedBy: "Admin Vikram Mehta" },
    { id: "doc2", flat: "A-402", title: "Electricity Bill May 2026.pdf", type: "Utility Bill", uploadDate: "2026-07-05", verified: true, verifiedBy: "System Auto-Check" }
  ]
};

let db: any = defaultDb;

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
  const user = db.users.find((u: any) => {
    const uPhone = u.phone.replace(/[^0-9]/g, "");
    return uPhone.includes(cleanPhone) || cleanPhone.includes(uPhone);
  });

  if (!user) {
    return res.status(444).json({ error: "This mobile number is not registered on GateKaru ERP. Please register as a new member." });
  }

  // Generate standard 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[cleanPhone] = otp;

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

  delete activeOtps[cleanPhone];

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "OTP verified successfully.",
    user,
    token
  });
});

app.post("/api/register", (req, res) => {
  const { name, phone, email, role, flat, type, vehicleNo, shift, gate, idCard, designation, committee, organization } = req.body;
  if (!name || !phone || !role) {
    return res.status(400).json({ error: "Name, phone, and role are required." });
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
  saveDb(db); // Explicitly save too

  const welcomeOtp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[cleanPhone] = welcomeOtp;

  const token = jwt.sign(
    { id: newUser.id, phone: newUser.phone, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    success: true,
    message: "Registration completed successfully.",
    user: newUser,
    otp: welcomeOtp,
    token
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
    return res.status(444).json({ error: "User profile not found. Please register." });
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
    { expiresIn: "7d" }
  );

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
