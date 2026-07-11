import React, { useState, useEffect } from "react";
import { 
  Building, RefreshCw, Layers, ShieldCheck, Activity, DollarSign, Database, 
  HardDrive, Server, Calendar, Sparkles, AlertTriangle, Plus, Users, 
  CreditCard, Clock, Receipt, CheckCircle, Trash2, ArrowUpRight, TrendingUp, Send,
  Globe, Search, Bell, Moon, Sun, LogOut, Cpu, Settings, ShieldAlert, Terminal,
  Wifi, Cloud, FileText, Check, HelpCircle, Key, Lock, Radio, ChevronDown, User,
  Building2, Car, Wrench, Shield, CheckCircle2, UserCheck, Eye, ToggleLeft, Phone, Mail, ToggleRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import SuperAdminDashboardTab from "./SuperAdminDashboardTab";
import SuperAdminAIControl from "./SuperAdminAIControl";
import SuperAdminPlatformHealth from "./SuperAdminPlatformHealth";
import SuperAdminDevTools from "./SuperAdminDevTools";
import SuperAdminDeveloperProfile from "./SuperAdminDeveloperProfile";
import SuperAdminBackupRestore from "./SuperAdminBackupRestore";
import SuperAdminBilling from "./SuperAdminBilling";
import SuperAdminSupportSecurity from "./SuperAdminSupportSecurity";
import SuperAdminAuditLogs, { AuditLogEntry } from "./SuperAdminAuditLogs";
import SuperAdminRevenue from "./SuperAdminRevenue";
import SuperAdminReports from "./SuperAdminReports";
import SuperAdminPushNotifications from "./SuperAdminPushNotifications";
import { getTranslation } from "../utils/translations";

interface SuperAdminPortalProps {
  settings: {
    promotionalAdsEnabled: boolean;
    activeThemeOverride: string;
    simulatedDate: string;
  };
  onUpdateSettings: (newSettings: Partial<{
    promotionalAdsEnabled: boolean;
    activeThemeOverride: string;
    simulatedDate: string;
  }>) => void;
  onSwitchPortal?: (portal: "resident" | "guard" | "admin" | "super_admin") => void;
  onLogout?: () => void;
  currentUser?: any;
  globalLang?: string;
  users?: any[];
}

export default function SuperAdminPortal({ 
  settings, 
  onUpdateSettings,
  onSwitchPortal,
  onLogout,
  currentUser,
  globalLang = "en",
  users = []
}: SuperAdminPortalProps) {
  const t = (key: string, def: string) => getTranslation(globalLang, key, def);
  // Active sections matching the sidebar spec!
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [activeSocietyId, setActiveSocietyId] = useState<string>("s1");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Live telemetry mock states
  const [systemUptime, setSystemUptime] = useState("99.98%");
  const [isBackupInProcess, setIsBackupInProcess] = useState(false);
  const [latestBackupTime, setLatestBackupTime] = useState("2026-07-08 02:00:14 UTC");

  // Multi-tenant registered Societies with detailed subscription details
  const [societies, setSocieties] = useState([
    { 
      id: "s1", 
      name: "Greenwood Heights Society", 
      address: "Sector 45, Gurugram, Haryana", 
      plan: "GateKaru Premium Enterprise", 
      price: 3500, 
      status: "Active", 
      flatsCount: 120,
      usersCount: 384,
      purchasedAt: "2026-06-15",
      expiresAt: "2026-07-15",
      billingCycle: "Monthly",
      contactName: "Vikram Mehta (Secretary)",
      contactPhone: "+91 65432 10987",
      contactEmail: "vikram.mehta@greenwoodsec.in",
      lastReminderSentAt: null as string | null,
      invoices: [
        { id: "INV-2026-101", amount: 3500, date: "2026-06-15", status: "Paid", description: "Standard Monthly subscription" }
      ]
    },
    { 
      id: "s2", 
      name: "Palm Heights Phase II", 
      address: "Mumbai West, Maharashtra", 
      plan: "GateKaru Premium Enterprise", 
      price: 35000, 
      status: "Active", 
      flatsCount: 480,
      usersCount: 1420,
      purchasedAt: "2026-01-10",
      expiresAt: "2027-01-10",
      billingCycle: "Yearly",
      contactName: "Rohit Deshmukh (President)",
      contactPhone: "+91 98200 45123",
      contactEmail: "rohit.deshmukh@palmheights2.org",
      lastReminderSentAt: null as string | null,
      invoices: [
        { id: "INV-2026-102", amount: 35000, date: "2026-01-10", status: "Paid", description: "Premium Enterprise Yearly package" }
      ]
    },
    { 
      id: "s3", 
      name: "Royal Orchids Estate", 
      address: "Whitefield, Bengaluru, Karnataka", 
      plan: "GateKaru Essential", 
      price: 1500, 
      status: "Active", 
      flatsCount: 90,
      usersCount: 210,
      purchasedAt: "2026-07-02",
      expiresAt: "2026-08-02",
      billingCycle: "Monthly",
      contactName: "Kalyani Nair (Treasurer)",
      contactPhone: "+91 80234 56789",
      contactEmail: "kalyani.nair@royalorchids.com",
      lastReminderSentAt: null as string | null,
      invoices: [
        { id: "INV-2026-103", amount: 1500, date: "2026-07-02", status: "Paid", description: "Essential Monthly subscription" }
      ]
    },
    { 
      id: "s4", 
      name: "Silver Maple Heights", 
      address: "Rajarhat, Kolkata, West Bengal", 
      plan: "GateKaru Essential", 
      price: 1500, 
      status: "Pending Verification", 
      flatsCount: 65,
      usersCount: 0,
      purchasedAt: "2026-07-08",
      expiresAt: "2026-08-08",
      billingCycle: "Monthly",
      contactName: "Amit Bhattacharya (Secretary)",
      contactPhone: "+91 90070 12345",
      contactEmail: "amit.b@silvermaple.co.in",
      lastReminderSentAt: null as string | null,
      invoices: [
        { id: "INV-2026-104", amount: 1500, date: "2026-07-08", status: "Unpaid", description: "Verification Pending - Trial Invoice" }
      ]
    },
    {
      id: "s5",
      name: "Saraswati Gardens Complex",
      address: "Kothrud, Pune, Maharashtra",
      plan: "GateKaru Essential",
      price: 1500,
      status: "Active",
      flatsCount: 110,
      usersCount: 295,
      purchasedAt: "2026-06-05",
      expiresAt: "2026-07-05", 
      billingCycle: "Monthly",
      contactName: "Prakash Joshi (President)",
      contactPhone: "+91 94220 98765",
      contactEmail: "prakash.joshi@saraswatigardens.net",
      lastReminderSentAt: null as string | null,
      invoices: [
        { id: "INV-2026-095", amount: 1500, date: "2026-06-05", status: "Paid", description: "Monthly essential subscription" }
      ]
    }
  ]);

  // Pricing plans configuration
  const [plans, setPlans] = useState([
    { 
      id: "pln1", 
      name: "GateKaru Essential", 
      price: 1500, 
      period: "Monthly", 
      features: "Visitor Pre-Approval, Notice Board, SOS Panic Trigger, 2 Guard Terminals",
      desc: "Perfect for budget societies seeking core digital security gateways."
    },
    { 
      id: "pln2", 
      name: "GateKaru Premium Enterprise", 
      price: 3500, 
      period: "Monthly", 
      features: "All Essentials, ERP Ledger System, Automated AI Assistants, WhatsApp API Integration, Multi-gate RTSP Stream relays",
      desc: "Best suited for large complexes requiring total automated governance and billing."
    },
    {
      id: "pln3",
      name: "GateKaru Corporate Special",
      price: 10000,
      period: "Monthly",
      features: "All Premium features, dedicated white-labeled mobile apps, direct database tunnel APIs, priority 24/7 technical node sync SLA",
      desc: "For ultra-premium residential townships needing custom domain branding."
    }
  ]);

  // High Fidelity Database Entities across Multi-Tenant Architecture
  const [residents, setResidents] = useState([
    { id: "r1", name: "Aarav Sharma", flat: "Alpha-101", phone: "+91 98765 43210", email: "aarav.sharma@gmail.com", role: "Owner", status: "Approved", rfId: "RF-8820A" },
    { id: "r2", name: "Meera Nair", flat: "Alpha-404", phone: "+91 98200 11223", email: "meera.nair@yahoo.com", role: "Owner", status: "Approved", rfId: "RF-1029F" },
    { id: "r3", name: "Rohan Das", flat: "Beta-502", phone: "+91 90022 33445", email: "rohan.das@outlook.com", role: "Tenant", status: "Approved", rfId: "RF-3345X" },
    { id: "r4", name: "Priya Patel", flat: "Beta-1201", phone: "+91 88877 66554", email: "priya.p@gmail.com", role: "Owner", status: "Suspended", rfId: "RF-5621B" },
    { id: "r5", name: "Vikram Sen", flat: "Gamma-801", phone: "+91 91234 56789", email: "vikram.sen@gmail.com", role: "Tenant", status: "Approved", rfId: "RF-9012K" }
  ]);

  const [guards, setGuards] = useState([
    { id: "g1", name: "Suresh Kumar", gate: "Main Gate (Gate 1)", biometric: "08:00 AM", status: "On Duty", cabin: "Cabin A", sosTriggered: false },
    { id: "g2", name: "Rajesh Yadav", gate: "Service Gate (Gate 2)", biometric: "08:15 AM", status: "On Duty", cabin: "Cabin B", sosTriggered: false },
    { id: "g3", name: "Amit Pal", gate: "Emergency Gate (Gate 3)", biometric: "08:00 AM", status: "Patrolling", cabin: "Mobile Roving", sosTriggered: false },
    { id: "g4", name: "Vikash Singh", gate: "Visitor Gate (Gate 4)", biometric: "08:30 AM", status: "On Duty", cabin: "Cabin D", sosTriggered: false }
  ]);

  const [committee, setCommittee] = useState([
    { id: "c1", name: "Vikram Mehta", role: "Secretary", authorityLimit: "₹1,50,000", term: "2025 - 2027", society: "Greenwood Heights" },
    { id: "c2", name: "Kalyani Nair", role: "Treasurer", authorityLimit: "₹2,00,000", term: "2024 - 2026", society: "Royal Orchids Estate" },
    { id: "c3", name: "Rohit Deshmukh", role: "President", authorityLimit: "₹5,00,000", term: "2026 - 2028", society: "Palm Heights Phase II" }
  ]);

  const [visitors, setVisitors] = useState([
    { id: "v1", name: "Ramesh Swamy", type: "Delivery (Zomato)", plate: "DL-3C-AQ-4412", gate: "Gate 1", time: "11:15 AM", status: "Inside" },
    { id: "v2", name: "Tanya Kapoor", type: "Guest", plate: "HR-26-BV-9010", gate: "Gate 1", time: "11:02 AM", status: "Inside" },
    { id: "v3", name: "Urban Company (Electrician)", type: "Service", plate: "No Vehicle", gate: "Gate 2", time: "10:45 AM", status: "Completed" },
    { id: "v4", name: "Rohan Mehra", type: "Cab (Ola)", plate: "MH-02-ER-3392", gate: "Gate 4", time: "10:30 AM", status: "Completed" },
    { id: "v5", name: "Unknown Visitor", type: "Intruder Alert", plate: "UP-16-XX-0000", gate: "Gate 3", time: "09:12 AM", status: "Blocked" }
  ]);

  // NEW: Towers and Flats telemetry
  const towers = [
    { name: "Tower Alpha", code: "TA", floors: 14, flatsPerFloor: 8, liftCount: 3, totalFlats: 112, occupancy: "92%" },
    { name: "Tower Beta", code: "TB", floors: 12, flatsPerFloor: 6, liftCount: 2, totalFlats: 72, occupancy: "85%" },
    { name: "Tower Gamma", code: "TG", floors: 16, flatsPerFloor: 8, liftCount: 4, totalFlats: 128, occupancy: "95%" }
  ];

  // NEW: Vehicles state
  const vehicles = [
    { id: "vh1", owner: "Aarav Sharma", num: "DL-3C-AN-1204", type: "SUV", tagId: "RFID-88120", status: "Inside" },
    { id: "vh2", owner: "Meera Nair", num: "HR-26-CZ-9912", type: "Sedan", tagId: "RFID-44102", status: "Outside" },
    { id: "vh3", owner: "Priya Patel", num: "MH-12-PQ-4456", type: "Hatchback", tagId: "RFID-90231", status: "Inside" }
  ];

  // NEW: Staff list
  const staffList = [
    { id: "st1", name: "Ramu Lal", role: "Electrician", phone: "+91 91122 33445", status: "Checked In", lastCheck: "08:14 AM" },
    { id: "st2", name: "Geeta Bai", role: "Housekeeping", phone: "+91 93344 55667", status: "Checked In", lastCheck: "07:55 AM" },
    { id: "st3", name: "Mohan Kumar", role: "Plumber", phone: "+91 95566 77889", status: "Absent", lastCheck: "Yesterday" }
  ];

  // NEW: Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "LOG-010",
      timestamp: "2026-07-09 00:42:15",
      operator: "Super Admin (JobsKaru Dev)",
      category: "System Config",
      action: "Updated platform theme override config to Cosmic Night",
      target: "Global Settings",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-009",
      timestamp: "2026-07-09 00:30:11",
      operator: "Super Admin (JobsKaru Dev)",
      category: "Onboarding",
      action: "Completed onboarding sequence for Saraswati Gardens Complex",
      target: "Society s5",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-008",
      timestamp: "2026-07-08 23:15:00",
      operator: "System Cron",
      category: "Billing",
      action: "Automated nightly invoice processing finished. 5 tenants processed.",
      target: "SaaS Billing Engine",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-007",
      timestamp: "2026-07-08 19:44:22",
      operator: "Super Admin (JobsKaru Dev)",
      category: "Role Mods",
      action: "Suspended resident 'Priya Patel' access privileges due to security review",
      target: "Resident r4",
      severity: "warning",
      status: "SUCCESS"
    },
    {
      id: "LOG-006",
      timestamp: "2026-07-08 18:00:14",
      operator: "System Backups",
      category: "Security",
      action: "Encrypted DB backup snapshot 'snap-20260708' committed to GCP Bucket",
      target: "Cloud Storage",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-005",
      timestamp: "2026-07-08 14:10:55",
      operator: "RWA Admin (s1)",
      category: "Role Mods",
      action: "Approved resident 'Vikram Sen' registration request",
      target: "Resident r5",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-004",
      timestamp: "2026-07-07 11:05:30",
      operator: "Super Admin (JobsKaru Dev)",
      category: "System Config",
      action: "Whitelisted IP address 10.42.0.1 for developer shell tunnel",
      target: "Security Policy",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-003",
      timestamp: "2026-07-07 09:30:00",
      operator: "Super Admin (JobsKaru Dev)",
      category: "Onboarding",
      action: "Registered Silver Maple Heights tenant portal under Essential Plan",
      target: "Society s4",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-002",
      timestamp: "2026-07-06 15:40:12",
      operator: "Super Admin (JobsKaru Dev)",
      category: "Billing",
      action: "Upgraded Greenwood Heights Society billing tier to Premium Enterprise",
      target: "Society s1",
      severity: "info",
      status: "SUCCESS"
    },
    {
      id: "LOG-001",
      timestamp: "2026-07-05 08:22:19",
      operator: "System Cron",
      category: "Security",
      action: "Intruder block trigger on Gate 3. IP whitelisting guidelines enforced.",
      target: "Gate Access Nodes",
      severity: "critical",
      status: "WARNING"
    }
  ]);

  // Detailed view modal state
  const [selectedDetail, setSelectedDetail] = useState<{
    type: "resident" | "visitor" | "society";
    data: any;
  } | null>(null);

  const handleAddAuditLog = (newLog: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const timeStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const nextLog: AuditLogEntry = {
      ...newLog,
      id: `LOG-${String(auditLogs.length + 1).padStart(3, "0")}`,
      timestamp: timeStr
    };
    setAuditLogs(prev => [nextLog, ...prev]);
  };

  // Active Tenant management logic
  const handleExtendSubscription = (id: string) => {
    let socName = "";
    setSocieties(prev => prev.map(s => {
      if (s.id === id) {
        socName = s.name;
        const nextExpiry = new Date(s.expiresAt);
        nextExpiry.setMonth(nextExpiry.getMonth() + 1);
        return {
          ...s,
          expiresAt: nextExpiry.toISOString().split('T')[0]
        };
      }
      return s;
    }));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Billing",
      action: `Extended subscription lease for '${socName || id}' by 30 days`,
      target: `Society ${id}`,
      severity: "info",
      status: "SUCCESS"
    });
    alert("📅 Subscription extension succeeded! Database lease extended by 30 days.");
  };

  const handleSendRenewalReminder = (id: string) => {
    let socName = "";
    setSocieties(prev => prev.map(s => {
      if (s.id === id) {
        socName = s.name;
        return {
          ...s,
          lastReminderSentAt: new Date().toISOString().split('T')[0]
        };
      }
      return s;
    }));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Billing",
      action: `Sent automated subscription renewal notice to administrators of '${socName || id}'`,
      target: `Society ${id}`,
      severity: "info",
      status: "SUCCESS"
    });
    alert("✉️ Automated WhatsApp & SMS renewal reminder nudge dispatched to society administrator.");
  };

  const handleTerminateTenant = (id: string) => {
    const soc = societies.find(s => s.id === id);
    if (confirm("🚨 WARNING: This will immediately cut cloud container routing to this society. Are you absolutely sure?")) {
      setSocieties(prev => prev.map(s => {
        if (s.id === id) return { ...s, status: "Terminated" };
        return s;
      }));
      handleAddAuditLog({
        operator: "Super Admin (JobsKaru Dev)",
        category: "Security",
        action: `Decommissioned tenant container and routed traffic off for '${soc?.name || id}'`,
        target: `Society ${id}`,
        severity: "critical",
        status: "SUCCESS"
      });
      alert("💀 Tenant container decommissioned. Domain entry pointing to JobsKaru cluster deleted.");
    }
  };

  const handleUpgradePackage = (socId: string, newPlanName: string) => {
    const selectedPlan = plans.find(p => p.name === newPlanName);
    if (!selectedPlan) return;
    const soc = societies.find(s => s.id === socId);
    setSocieties(prev => prev.map(s => {
      if (s.id === socId) {
        return {
          ...s,
          plan: selectedPlan.name,
          price: selectedPlan.price
        };
      }
      return s;
    }));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Billing",
      action: `Upgraded tenant '${soc?.name || socId}' plan tier to '${newPlanName}'`,
      target: `Society ${socId}`,
      severity: "info",
      status: "SUCCESS"
    });
    alert(`🚀 Tenant upgraded to ${newPlanName}! Billing schedules adjusted.`);
  };

  const handleAddNewSociety = (newSoc: any) => {
    const generatedId = `s_${Date.now()}`;
    setSocieties(prev => [
      ...prev,
      {
        id: generatedId,
        name: newSoc.name,
        address: newSoc.address || "Sector 101, Gurugram",
        plan: newSoc.plan || "GateKaru Essential",
        price: plans.find(p => p.name === newSoc.plan)?.price || 1500,
        status: "Active",
        flatsCount: Number(newSoc.flatsCount) || 120,
        usersCount: 0,
        purchasedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billingCycle: "Monthly",
        contactName: newSoc.contactName || "Aravind Swami",
        contactPhone: newSoc.contactPhone || "+91 99000 99000",
        contactEmail: newSoc.contactEmail || "admin@society.in",
        lastReminderSentAt: null,
        invoices: [
          { id: `INV-${Date.now().toString().slice(-4)}`, amount: plans.find(p => p.name === newSoc.plan)?.price || 1500, date: new Date().toISOString().split('T')[0], status: "Unpaid", description: "First subscription invoice" }
        ]
      }
    ]);
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Onboarding",
      action: `Registered & onboarded new housing society '${newSoc.name}' under '${newSoc.plan || "GateKaru Essential"}'`,
      target: `Society ${generatedId}`,
      severity: "info",
      status: "SUCCESS"
    });
  };

  const handleAddNewPlan = (newPln: any) => {
    const generatedId = `pln_${Date.now()}`;
    setPlans(prev => [
      ...prev,
      {
        id: generatedId,
        name: newPln.name,
        price: Number(newPln.price),
        period: newPln.period || "Monthly",
        features: newPln.features || "All features",
        desc: newPln.desc || "Plan description"
      }
    ]);
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "System Config",
      action: `Created new subscription package '${newPln.name}' priced at ₹${newPln.price}/${newPln.period || "Monthly"}`,
      target: "Billing Config",
      severity: "info",
      status: "SUCCESS"
    });
    alert("💎 New SaaS Subscription pricing scheme registered successfully.");
  };

  const handleDeletePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    setPlans(prev => prev.filter(p => p.id !== id));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "System Config",
      action: `Deleted subscription package scheme '${plan?.name || id}'`,
      target: "Billing Config",
      severity: "warning",
      status: "SUCCESS"
    });
    alert("🗑️ Plan configuration deleted.");
  };

  const handleGenerateInvoice = (socId: string, invoiceAmount: number, description: string) => {
    const soc = societies.find(s => s.id === socId);
    setSocieties(prev => prev.map(s => {
      if (s.id === socId) {
        return {
          ...s,
          invoices: [
            ...s.invoices,
            {
              id: `INV-${Date.now().toString().slice(-4)}`,
              amount: invoiceAmount,
              date: new Date().toISOString().split('T')[0],
              status: "Unpaid",
              description: description || "Custom manual invoice"
            }
          ]
        };
      }
      return s;
    }));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Billing",
      action: `Invoiced tenant '${soc?.name || socId}' amount of ₹${invoiceAmount} for '${description || "Custom manual invoice"}'`,
      target: `Society ${socId}`,
      severity: "info",
      status: "SUCCESS"
    });
    alert("🧾 Manual transaction invoice successfully injected into tenant ledger.");
  };

  const handleMarkInvoicePaid = (socId: string, invId: string) => {
    const soc = societies.find(s => s.id === socId);
    setSocieties(prev => prev.map(soc => {
      if (soc.id !== socId) return soc;
      const updatedInvoices = soc.invoices.map(inv => {
        if (inv.id === invId) {
          return { ...inv, status: "Paid" };
        }
        return inv;
      });
      return {
        ...soc,
        invoices: updatedInvoices
      };
    }));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Billing",
      action: `Marked invoice '${invId}' as fully PAID for tenant '${soc?.name || socId}'`,
      target: `Society ${socId}`,
      severity: "info",
      status: "SUCCESS"
    });
    alert("💰 Payment received! Invoice updated to PAID.");
  };

  // Backup snapshot simulator
  const handleBackupDb = () => {
    setIsBackupInProcess(true);
    setTimeout(() => {
      const timestamp = new Date().toISOString();
      setLatestBackupTime(timestamp);
      setIsBackupInProcess(false);
      handleAddAuditLog({
        operator: "System Backups",
        category: "Database",
        action: "Successfully triggered manual database snapshot commit to secure GCP bucket storage",
        target: "Cloud Storage",
        severity: "info",
        status: "SUCCESS"
      });
      alert("Database snapshot backup completed successfully. GateKaru multi-tenant partition backup image committed to secure GCP cloud bucket.");
    }, 1500);
  };

  // Compute stats
  const totalFlats = societies.reduce((sum, s) => sum + s.flatsCount, 0);
  const totalUsers = societies.reduce((sum, s) => sum + s.usersCount, 0);
  const monthlyRevenue = societies.reduce((sum, s) => {
    if (s.status !== "Active") return sum;
    const val = s.billingCycle === "Yearly" ? s.price / 12 : s.price;
    return sum + val;
  }, 0);

  // Update simulated date from header
  const handleUpdateSimulatedDate = (newDateStr: string) => {
    onUpdateSettings({ simulatedDate: newDateStr });
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "System Config",
      action: `Simulated date override updated to: ${newDateStr}`,
      target: "Global Settings",
      severity: "info",
      status: "SUCCESS"
    });
  };

  // Toggle resident status
  const toggleResidentStatus = (id: string) => {
    let rName = "";
    let nextStatus = "";
    setResidents(prev => prev.map(r => {
      if (r.id === id) {
        rName = r.name;
        nextStatus = r.status === "Approved" ? "Suspended" : "Approved";
        return { ...r, status: nextStatus };
      }
      return r;
    }));
    handleAddAuditLog({
      operator: "Super Admin (JobsKaru Dev)",
      category: "Role Mods",
      action: `Toggled resident '${rName || id}' access status to '${nextStatus}'`,
      target: `Resident ${id}`,
      severity: nextStatus === "Suspended" ? "warning" : "info",
      status: "SUCCESS"
    });
  };

  // Filter data lists based on global searchQuery
  const filteredResidents = residents.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.flat && r.flat.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.role && r.role.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q)) ||
      (r.rfId && r.rfId.toLowerCase().includes(q))
    );
  });

  const filteredGuards = guards.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.gate && g.gate.toLowerCase().includes(q)) ||
      (g.shift && g.shift.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q)) ||
      (g.status && g.status.toLowerCase().includes(q)) ||
      (g.assignedGate && g.assignedGate.toLowerCase().includes(q))
    );
  });

  const filteredCommittee = committee.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      (c.flat && c.flat.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const filteredVisitors = visitors.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.flat && v.flat.toLowerCase().includes(q)) ||
      (v.purpose && v.purpose.toLowerCase().includes(q)) ||
      (v.phone && v.phone.toLowerCase().includes(q)) ||
      (v.guardName && v.guardName.toLowerCase().includes(q)) ||
      (v.status && v.status.toLowerCase().includes(q)) ||
      (v.type && v.type.toLowerCase().includes(q)) ||
      (v.plate && v.plate.toLowerCase().includes(q))
    );
  });

  const filteredVehicles = vehicles.filter(vh => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (vh.num && vh.num.toLowerCase().includes(q)) ||
      (vh.owner && vh.owner.toLowerCase().includes(q)) ||
      (vh.tagId && vh.tagId.toLowerCase().includes(q)) ||
      (vh.status && vh.status.toLowerCase().includes(q)) ||
      (vh.type && vh.type.toLowerCase().includes(q))
    );
  });

  const filteredStaff = staffList.filter(st => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.role && st.role.toLowerCase().includes(q)) ||
      (st.phone && st.phone.toLowerCase().includes(q)) ||
      (st.status && st.status.toLowerCase().includes(q)) ||
      (st.lastCheck && st.lastCheck.toLowerCase().includes(q))
    );
  });

  const filteredSocieties = societies.filter(soc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      soc.name.toLowerCase().includes(q) ||
      soc.id.toLowerCase().includes(q) ||
      (soc.address && soc.address.toLowerCase().includes(q)) ||
      (soc.plan && soc.plan.toLowerCase().includes(q))
    );
  });

  return (
    <div id="super-admin-portal" className="flex h-screen w-full bg-[#070b19] overflow-hidden font-sans text-slate-300">
      
      {/* Collapsible left sidebar */}
      <SuperAdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        currentUser={{ name: "JobsKaru Dev", role: "Super Admin" }}
        onLogout={() => {
          if (onLogout) onLogout();
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main viewport frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070b1a]">
        
        {/* Top Header with search, indicators, selectors, clocks, etc. */}
        <SuperAdminHeader 
          simulatedDate={settings.simulatedDate || "2026-07-08"} 
          onUpdateSimulatedDate={handleUpdateSimulatedDate}
          onSearchQuery={setSearchQuery}
          societies={societies}
          residents={residents}
          visitors={visitors}
          activeSocietyId={activeSocietyId}
          setActiveSocietyId={setActiveSocietyId}
          onSwitchPortal={onSwitchPortal}
          onLogout={onLogout}
          currentUser={currentUser}
          onViewDetails={(type, item) => setSelectedDetail({ type, data: item })}
        />

        {/* Content canvas viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070b1a] custom-scrollbar pb-16">
          
          {/* Section: Global Dashboard */}
          {activeSection === "dashboard" && (
            <SuperAdminDashboardTab 
              societiesCount={societies.length}
              totalFlats={totalFlats}
              totalUsers={totalUsers}
              monthlyRevenue={monthlyRevenue}
              users={users}
              onSelectSection={setActiveSection}
            />
          )}

          {/* Section: AI Control Center */}
          {activeSection === "ai_control" && (
            <SuperAdminAIControl />
          )}

          {/* Section: Push Notifications */}
          {activeSection === "push" && (
            <SuperAdminPushNotifications societies={societies} />
          )}

          {/* Section: Platform Settings, GCP Storage */}
          {(activeSection === "settings" || activeSection === "cloud") && (
            <SuperAdminPlatformHealth 
              systemUptime={systemUptime}
              isBackupInProcess={isBackupInProcess}
              latestBackupTime={latestBackupTime}
              onBackupDb={handleBackupDb}
            />
          )}

          {/* Section: Backup & Restore */}
          {activeSection === "backup" && (
            <SuperAdminBackupRestore 
              isBackupInProcess={isBackupInProcess}
              latestBackupTime={latestBackupTime}
              onBackupDb={handleBackupDb}
            />
          )}

          {/* Section: API & Integrations */}
          {activeSection === "api" && (
            <SuperAdminDevTools />
          )}

          {/* Section: Developer Profile */}
          {activeSection === "developer_profile" && (
            <SuperAdminDeveloperProfile />
          )}

          {/* Section: Billing & Subscription, Societies */}
          {(activeSection === "billing" || activeSection === "societies") && (
            <SuperAdminBilling 
              societies={filteredSocieties}
              plans={plans}
              settings={settings}
              onExtendSubscription={handleExtendSubscription}
              onSendRenewalReminder={handleSendRenewalReminder}
              onTerminateTenant={handleTerminateTenant}
              onUpgradePackage={handleUpgradePackage}
              onAddNewSociety={handleAddNewSociety}
              onAddNewPlan={handleAddNewPlan}
              onDeletePlan={handleDeletePlan}
              onGenerateInvoice={handleGenerateInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
            />
          )}

          {/* Section: Revenue Analytics */}
          {activeSection === "revenue" && (
            <SuperAdminRevenue 
              societies={filteredSocieties}
              plans={plans}
            />
          )}

          {/* Section: Platform Reports */}
          {activeSection === "reports" && (
            <SuperAdminReports 
              societies={filteredSocieties}
              residents={residents}
            />
          )}

          {/* Section: Support Tickets, Security Center */}
          {(activeSection === "tickets" || activeSection === "security_center") && (
            <SuperAdminSupportSecurity activeSection={activeSection} />
          )}

          {/* Section: System Audit Logs */}
          {activeSection === "audit_logs" && (
            <SuperAdminAuditLogs 
              logs={auditLogs}
              onAddLog={handleAddAuditLog}
              onClearLogs={() => setAuditLogs([])}
              simulatedDate={settings.simulatedDate || "2026-07-08"}
            />
          )}

          {/* NEW: Residents Directory View */}
          {activeSection === "residents" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" /> Multi-Tenant Registry
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Residents Directory</h2>
                <p className="text-xs text-slate-400">Database query view displaying all registered apartments and owner-tenant credentials.</p>
              </div>

              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#1e2a5e]/60 flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#0d1435]">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Active Residents list</span>
                  <button 
                    onClick={() => {
                      const name = prompt("Enter Resident Name:");
                      if (name) {
                        setResidents(prev => [
                          ...prev,
                          {
                            id: `r_${Date.now()}`,
                            name,
                            flat: "Alpha-902",
                            phone: "+91 99221 12233",
                            email: `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
                            role: "Owner",
                            status: "Approved",
                            rfId: `RF-${Math.floor(1000 + Math.random() * 9000)}B`
                          }
                        ]);
                        alert("Resident registered successfully in the active workspace node!");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Enroll Resident
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                        <th className="p-4">Resident Name</th>
                        <th className="p-4">Apartment / Flat</th>
                        <th className="p-4">Contact credentials</th>
                        <th className="p-4">Occupancy Type</th>
                        <th className="p-4">RFID Tag ID</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182352]/30">
                      {filteredResidents.map((res) => (
                        <tr 
                          key={res.id} 
                          onClick={() => setSelectedDetail({ type: "resident", data: res })}
                          className="hover:bg-[#131b46]/60 cursor-pointer transition font-medium text-left"
                        >
                          <td className="p-4 text-white font-black">{res.name}</td>
                          <td className="p-4 text-indigo-300 font-mono">{res.flat}</td>
                          <td className="p-4 space-y-0.5">
                            <p className="text-[11px] text-slate-300">{res.phone}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{res.email}</p>
                          </td>
                          <td className="p-4 text-slate-400">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${res.role === "Owner" ? "bg-indigo-500/15 text-indigo-400" : "bg-purple-500/15 text-purple-400"}`}>
                              {res.role}
                            </span>
                          </td>
                          <td className="p-4 text-indigo-400 font-mono font-bold">{res.rfId}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${res.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleResidentStatus(res.id);
                                alert(`Status toggled for ${res.name}. Access privileges updated across gateways.`);
                              }}
                              className="bg-[#121c46] hover:bg-indigo-600/20 text-slate-300 hover:text-white font-bold text-[10px] px-2.5 py-1 rounded-lg border border-[#23357a] transition uppercase tracking-wider"
                            >
                              {res.status === "Approved" ? "Suspend" : "Approve"}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`WhatsApp nudge dispatched to resident at ${res.phone} with current active gate credentials.`);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] px-2.5 py-1 rounded-lg transition uppercase tracking-wider"
                            >
                              Nudge
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Guards Patrol Console View */}
          {activeSection === "guards" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" /> Security Operations
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Guards Patrol Console</h2>
                <p className="text-xs text-slate-400">Monitor active on-duty security guards, biometric logs, roving patrols, and instant SOS panic triggers.</p>
              </div>

              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#1e2a5e]/60 flex justify-between items-center bg-[#0d1435]">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Live Security Guard Fleet</span>
                  <button 
                    onClick={() => {
                      const name = prompt("Enter Guard Name:");
                      if (name) {
                        setGuards(prev => [
                          ...prev,
                          {
                            id: `g_${Date.now()}`,
                            name,
                            gate: "Loading Gate (Gate 5)",
                            biometric: "09:00 AM",
                            status: "On Duty",
                            cabin: "Cabin E",
                            sosTriggered: false
                          }
                        ]);
                        alert("Guard details enrolled. Multi-gate terminal sync successful!");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Enroll Guard Node
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                        <th className="p-4">Guard Name</th>
                        <th className="p-4">Assigned Location</th>
                        <th className="p-4">Biometric Clock-In</th>
                        <th className="p-4">Roster Status</th>
                        <th className="p-4">Cabin Station</th>
                        <th className="p-4 text-center">SOS Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182352]/30">
                      {filteredGuards.map((g) => (
                        <tr key={g.id} className="hover:bg-[#131b46]/40 transition font-medium">
                          <td className="p-4 text-white font-black flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {g.name}
                          </td>
                          <td className="p-4 text-indigo-300 font-mono">{g.gate}</td>
                          <td className="p-4 text-slate-300 font-mono font-bold">{g.biometric}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${g.status === "On Duty" ? "bg-emerald-500/15 text-emerald-400" : "bg-purple-500/15 text-purple-400"}`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">{g.cabin}</td>
                          <td className="p-4 text-center">
                            {g.sosTriggered ? (
                              <span className="bg-rose-500/25 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-black uppercase text-[9px] animate-pulse">
                                Active Alert
                              </span>
                            ) : (
                              <span className="bg-[#111c3a] text-slate-500 px-2 py-0.5 rounded font-bold text-[9px]">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => alert(`Initiating full video audit for ${g.name} terminal feed (Cabin Stream: Live).`)}
                              className="bg-[#121c46] hover:bg-indigo-600/20 text-indigo-300 hover:text-white font-black text-[10px] px-2.5 py-1 rounded-lg border border-[#23357a] transition uppercase tracking-wider"
                            >
                              Audit Feed
                            </button>
                            <button 
                              onClick={() => {
                                setGuards(prev => prev.map(item => {
                                  if (item.id === g.id) return { ...item, sosTriggered: !item.sosTriggered };
                                  return item;
                                }));
                                alert(`SOS Toggle processed. RWA safety broadcast triggered for ${g.name}.`);
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] px-2.5 py-1 rounded-lg transition uppercase tracking-wider shadow shadow-rose-600/20"
                            >
                              Toggle Alert
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Committee ERP View */}
          {activeSection === "committee" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Tenant Governance
                </span>
                <h2 className="text-2xl font-black text-white mt-1">RWA Committee ERP</h2>
                <p className="text-xs text-slate-400">RWA representatives tracking, designation matrices, financial signing limits, and operational tenures.</p>
              </div>

              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#1e2a5e]/60 flex justify-between items-center bg-[#0d1435]">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Designated RWA Board Representatives</span>
                  <button 
                    onClick={() => {
                      const name = prompt("Enter Committee Member Name:");
                      if (name) {
                        setCommittee(prev => [
                          ...prev,
                          {
                            id: `c_${Date.now()}`,
                            name,
                            role: "Joint Secretary",
                            authorityLimit: "₹50,000",
                            term: "2026 - 2028",
                            society: "Palm Heights Phase II"
                          }
                        ]);
                        alert("Board representative successfully recorded in the central tenant directory!");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Elect Representative
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                        <th className="p-4">Representative Name</th>
                        <th className="p-4">RWA Office Role</th>
                        <th className="p-4">Tenant Workspace</th>
                        <th className="p-4">Signing Budget Cap</th>
                        <th className="p-4">Active Office Term</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182352]/30">
                      {filteredCommittee.map((c) => (
                        <tr key={c.id} className="hover:bg-[#131b46]/40 transition font-medium">
                          <td className="p-4 text-white font-black">{c.name}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded font-black text-[9.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {c.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-semibold">{c.society}</td>
                          <td className="p-4 text-emerald-400 font-mono font-bold">{c.authorityLimit}</td>
                          <td className="p-4 text-slate-400 font-mono">{c.term}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => alert(`Reviewing signed ledger approvals and audit logs for representative ${c.name}.`)}
                              className="bg-[#121c46] hover:bg-[#1a2558] border border-[#23357a] text-slate-300 font-extrabold px-3 py-1.5 rounded-lg transition uppercase tracking-wider text-[10px]"
                            >
                              Review Audits
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Visitors & Parcels Log View */}
          {activeSection === "visitors" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-indigo-400" /> Visitor Transit Gateway
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Visitors & Parcels Log</h2>
                <p className="text-xs text-slate-400">Automatic gate triggers, ANPR license plate detections, visitor clearance logs, and AI threat blockades.</p>
              </div>

              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#1e2a5e]/60 flex justify-between items-center bg-[#0d1435]">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Real-time Gate Access Streams</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setVisitors(prev => [
                          {
                            id: `v_${Date.now()}`,
                            name: "Swiggy Delivery",
                            type: "Delivery",
                            plate: "DL-3S-Z-9981",
                            gate: "Gate 1",
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            status: "Inside"
                          },
                          ...prev
                        ]);
                        alert("ANPR Cam 1 Triggered: Auto-approved Zomato delivery rider.");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition uppercase tracking-wider"
                    >
                      Trigger ANPR Cam
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                        <th className="p-4">Visitor Identity</th>
                        <th className="p-4">Transit Type</th>
                        <th className="p-4">License Plate</th>
                        <th className="p-4">Check-in Gate</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4 text-center">Access Verdict</th>
                        <th className="p-4 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182352]/30">
                      {filteredVisitors.map((v) => (
                        <tr 
                          key={v.id} 
                          onClick={() => setSelectedDetail({ type: "visitor", data: v })}
                          className="hover:bg-[#131b46]/60 cursor-pointer transition font-medium text-left"
                        >
                          <td className="p-4 text-white font-black">{v.name}</td>
                          <td className="p-4 text-slate-300">{v.type}</td>
                          <td className="p-4 text-indigo-400 font-mono font-bold">{v.plate}</td>
                          <td className="p-4 text-slate-400">{v.gate}</td>
                          <td className="p-4 text-indigo-300 font-mono">{v.time}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              v.status === "Inside" ? "bg-indigo-500/10 text-indigo-400" :
                              v.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/15 text-red-400 animate-pulse"
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Auditing credential token GK-TKN-${v.id.toUpperCase()} • Photo proof match confirmed.`);
                              }}
                              className="bg-[#121c46] hover:bg-[#1a275f] border border-[#23357a] text-slate-300 font-extrabold px-2.5 py-1 rounded-lg transition uppercase tracking-wider text-[9px]"
                            >
                              Verify Proof
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Flats & Towers View */}
          {activeSection === "flats_towers" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Infrastructure Nodes
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Towers & Flats Configuration</h2>
                <p className="text-xs text-slate-400">Configure tower matrices, elevators, floors, and occupancy benchmarks in the active workspace context.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {towers.map((tow, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-[#0c1439] to-[#080d28] border border-[#203273] rounded-2xl p-5 shadow-xl hover:border-indigo-500/50 transition">
                    <div className="flex justify-between items-center border-b border-[#1e2a5e]/50 pb-2 mb-4">
                      <div>
                        <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">{tow.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Segment Code: {tow.code}</p>
                      </div>
                      <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded font-black text-[10px]">
                        {tow.occupancy} Occupancy
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Floors:</span>
                        <span className="text-white font-mono">{tow.floors} Floors</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Flats Per Floor:</span>
                        <span className="text-white font-mono">{tow.flatsPerFloor} Units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Digital Smart Elevators:</span>
                        <span className="text-emerald-400 font-mono">{tow.liftCount} Elevators Online</span>
                      </div>
                      <div className="border-t border-[#1e2a5e]/30 pt-2 flex justify-between font-black text-white">
                        <span>Total Apartment Pods:</span>
                        <span className="text-indigo-400 font-mono">{tow.totalFlats} Apartments</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Editing configuration schema for ${tow.name}.`)}
                      className="w-full mt-4 bg-[#121c46] hover:bg-indigo-600/25 text-slate-200 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider border border-[#23357a] transition"
                    >
                      Configure Layout
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW: Vehicle Management View */}
          {activeSection === "vehicles" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-indigo-400" /> Multi-Tenant Registry
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Vehicle Management</h2>
                <p className="text-xs text-slate-400">Track and monitor resident vehicles, registered smart RFID tags, and active gate triggers.</p>
              </div>

              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#1e2a5e]/60 flex justify-between items-center bg-[#0d1435]">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Registered Resident Vehicles</span>
                  <button 
                    onClick={() => {
                      const owner = prompt("Enter Owner Name:");
                      if (owner) {
                        alert("Vehicle database updated! RFID sticker tag registered.");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition uppercase tracking-wider"
                  >
                    Add Vehicle RFID Tag
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                        <th className="p-4">Owner Name</th>
                        <th className="p-4">Vehicle Number</th>
                        <th className="p-4">Classification</th>
                        <th className="p-4">RFID Tag Code</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182352]/30">
                      {filteredVehicles.map((vh, i) => (
                        <tr key={i} className="hover:bg-[#131b46]/40 transition font-medium">
                          <td className="p-4 text-white font-black">{vh.owner}</td>
                          <td className="p-4 text-indigo-400 font-mono font-black">{vh.num}</td>
                          <td className="p-4 text-slate-300">{vh.type}</td>
                          <td className="p-4 text-purple-400 font-mono font-bold">{vh.tagId}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${vh.status === "Inside" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700/20 text-slate-500"}`}>
                              {vh.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => alert(`Reviewing gate pass log charts for ${vh.num}`)}
                              className="bg-[#121c46] hover:bg-indigo-600/20 text-slate-200 font-bold px-2.5 py-1 rounded-lg border border-[#23357a] transition uppercase text-[10px] tracking-wider"
                            >
                              Gate Logs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Staff & Vendors View */}
          {activeSection === "staff_vendors" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#1e295d] pb-4">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-400" /> Facility Support
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Staff & Vendors Registry</h2>
                <p className="text-xs text-slate-400">Manage support staff, maintenance vendors, plumbers, electricians, and their daily biometric check-in pings.</p>
              </div>

              <div className="bg-[#0b1029]/80 border border-[#1e2a5e] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#1e2a5e]/60 flex justify-between items-center bg-[#0d1435]">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">Active Staff & Vendor Logs</span>
                  <button 
                    onClick={() => {
                      const name = prompt("Enter Staff/Vendor Name:");
                      if (name) {
                        alert("Vendor registered successfully and biometric card authorized!");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition uppercase tracking-wider"
                  >
                    Authorize New Staff
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#101944]/45 text-indigo-300 font-extrabold uppercase tracking-wider border-b border-[#1e2a5e]">
                        <th className="p-4">Staff Name</th>
                        <th className="p-4">Service Specialty</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Duty Check-In Time</th>
                        <th className="p-4 text-center">Biometric Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182352]/30">
                      {filteredStaff.map((st) => (
                        <tr key={st.id} className="hover:bg-[#131b46]/40 transition font-medium">
                          <td className="p-4 text-white font-black">{st.name}</td>
                          <td className="p-4 text-indigo-300 font-bold">{st.role}</td>
                          <td className="p-4 text-slate-400 font-mono">{st.phone}</td>
                          <td className="p-4 text-indigo-400 font-mono">{st.lastCheck}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${st.status === "Checked In" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {st.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => alert(`Overriding attendance status for ${st.name}`)}
                              className="bg-[#121c46] hover:bg-indigo-600/20 text-slate-200 font-bold px-2.5 py-1 rounded-lg border border-[#23357a] transition uppercase text-[10px] tracking-wider"
                            >
                              Override Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global Footer */}
        <footer className="h-12 bg-[#090e21] border-t border-[#1e295d] px-6 flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider shrink-0 select-none z-10">
          <span>GateKaru Secure Society ERP • Powered by JobsKaru Technologies</span>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-emerald-400" /> Regional Sync ACTIVE</span>
            <span className="text-emerald-400 font-extrabold">● Version 3.1 Enterprise</span>
          </div>
        </footer>

        <AnimatePresence>
          {selectedDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="fixed inset-0 bg-[#040612]/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0b1236] border border-[#203274] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-left"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-[#203274]/60 flex justify-between items-center bg-[#0e1742]">
                  <div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      System Entity Inspector
                    </span>
                    <h3 className="text-sm font-black text-white mt-1 uppercase tracking-wide">
                      {selectedDetail.type} Overview Details
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedDetail(null)}
                    className="p-1.5 rounded-lg bg-[#142055] hover:bg-[#1a296e] text-slate-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {selectedDetail.type === "resident" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-[#10194a] p-4 rounded-xl border border-[#203274]/50">
                        <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{selectedDetail.data.name}</h4>
                          <p className="text-xs text-indigo-300 font-semibold">Flat {selectedDetail.data.flat} • {selectedDetail.data.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Contact Phone</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedDetail.data.phone}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Email Address</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 block break-all">{selectedDetail.data.email || "N/A"}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">RFID Tag ID</span>
                          <span className="text-xs font-mono font-bold text-indigo-400 mt-1 block">{selectedDetail.data.rfId || "No Tag Linked"}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Access Status</span>
                          <span className="mt-1 block">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedDetail.data.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {selectedDetail.data.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDetail.type === "visitor" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-[#10194a] p-4 rounded-xl border border-[#203274]/50">
                        <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Car className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{selectedDetail.data.name}</h4>
                          <p className="text-xs text-emerald-300 font-semibold">{selectedDetail.data.type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">License Plate</span>
                          <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">{selectedDetail.data.plate || "No Vehicle (Walk-in)"}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Transit Gate</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedDetail.data.gate}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Check-in Time</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedDetail.data.time}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Transit Status</span>
                          <span className="mt-1 block">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedDetail.data.status === "Inside" ? "bg-indigo-500/10 text-indigo-400" : selectedDetail.data.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {selectedDetail.data.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDetail.type === "society" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-[#10194a] p-4 rounded-xl border border-[#203274]/50">
                        <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <Building className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{selectedDetail.data.name}</h4>
                          <p className="text-xs text-indigo-300 font-semibold">{selectedDetail.data.address}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Subscription Plan</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 block uppercase font-black text-indigo-400">{selectedDetail.data.plan}</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
                          <span className="mt-1 block">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedDetail.data.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {selectedDetail.data.status}
                            </span>
                          </span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Flat Count</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 block">{selectedDetail.data.flatsCount || 120} units</span>
                        </div>
                        <div className="bg-[#0c143d] p-3 rounded-lg border border-[#1d2b63]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Subscription Renewal</span>
                          <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">{selectedDetail.data.expiresAt}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-[#0a0f30] border-t border-[#203274]/50 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedDetail(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#141b45] hover:bg-[#1a235c] transition border border-[#23337a]"
                  >
                    Close Inspector
                  </button>
                  {selectedDetail.type === "resident" && (
                    <button
                      onClick={() => {
                        alert(`WhatsApp alert sent to ${selectedDetail.data.name} regarding profile details.`);
                        setSelectedDetail(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                      WhatsApp Nudge
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
