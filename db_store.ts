import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

const DB_PATH = path.join(process.cwd(), "gatekaru_db.json");

// Connection pool reference
let pool: mysql.Pool | null = null;
let isMysqlActive = false;

// Check if MySQL env parameters are configured
const hasMysqlConfig = () => {
  return !!(
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME
  );
};

// Diagnostic function to return detailed connection info and tests
export async function runDbDiagnostics() {
  const envPath = path.join(process.cwd(), ".env");
  const envExists = fs.existsSync(envPath);
  
  const report = {
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    envFile: {
      path: envPath,
      exists: envExists,
    },
    config: {
      DB_HOST: process.env.DB_HOST || null,
      DB_USER: process.env.DB_USER || null,
      DB_NAME: process.env.DB_NAME || null,
      DB_PORT: process.env.DB_PORT || "3306",
      DB_PASSWORD_DEFINED: !!process.env.DB_PASSWORD,
      DB_PASSWORD_LENGTH: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0,
    },
    mysqlPoolStatus: {
      initialized: pool !== null,
      isActive: isMysqlActive
    },
    testConnection: {} as any
  };

  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });
    }
    
    const conn = await pool.getConnection();
    await conn.query("SELECT 1 as test");
    conn.release();
    
    report.testConnection = {
      status: "SUCCESS",
      message: "Successfully connected and queried database using the primary connection pool!"
    };
  } catch (err: any) {
    report.testConnection = {
      status: "FAILURE",
      message: err.message || String(err),
      code: err.code || null,
      errno: err.errno || null,
      sqlState: err.sqlState || null,
      recommendation: getRecommendation(err)
    };
  }

  return report;
}

function getRecommendation(err: any): string {
  const code = err.code || "";
  const msg = err.message || "";
  
  if (code === "ER_ACCESS_DENIED_ERROR") {
    return "Check your DB_USER and DB_PASSWORD. In Hostinger, usernames are often prefixed with your account ID, e.g., 'u931056402_gatekaru'. Ensure there are no extra spaces or line breaks in your .env values.";
  }
  if (code === "ECONNREFUSED" || msg.includes("ECONNREFUSED")) {
    return "The database server refused the connection on this port/host. Ensure DB_HOST is set to '127.0.0.1' or 'localhost'. If using Hostinger, 'localhost' is usually correct, but ensure the MySQL service is actually active.";
  }
  if (code === "ENOTFOUND" || msg.includes("ENOTFOUND")) {
    return "The database host could not be resolved. Double check DB_HOST in your .env file.";
  }
  if (code === "ER_BAD_DB_ERROR") {
    return "The database name specified by DB_NAME does not exist. Ensure you have created the database in your Hostinger hPanel and that the name is spelled exactly correct (often prefixed with your account ID).";
  }
  return "Verify your .env configuration parameters, database credentials, and firewall settings on your database server.";
}

// Initialize connection and schema
export async function initializeDatabase(defaultDb: any) {
  console.log("----------------------------------------");
  console.log("🔍 GATEKARU DATABASE DIAGNOSTICS STARTUP");
  console.log(`📂 Current Working Directory (cwd): ${process.cwd()}`);
  const envPath = path.join(process.cwd(), ".env");
  console.log(`📄 Checking .env file at ${envPath}: ${fs.existsSync(envPath) ? "Exists ✅" : "Missing ❌"}`);
  console.log("🔑 Environment variables loaded:");
  console.log(`   - DB_HOST: "${process.env.DB_HOST || "[NOT SET]"}"`);
  console.log(`   - DB_USER: "${process.env.DB_USER || "[NOT SET]"}"`);
  console.log(`   - DB_NAME: "${process.env.DB_NAME || "[NOT SET]"}"`);
  console.log(`   - DB_PORT: "${process.env.DB_PORT || "[NOT SET]"}"`);
  const pwd = process.env.DB_PASSWORD;
  const maskedPwd = pwd ? `Set (Length: ${pwd.length}, Starts: ${pwd[0]}... Ends: ${pwd[pwd.length-1]})` : "[NOT SET]";
  console.log(`   - DB_PASSWORD: "${maskedPwd}"`);
  console.log("----------------------------------------");

  if (!hasMysqlConfig()) {
    console.log("ℹ️ No MySQL environment variables detected. Running in Local JSON Mode.");
    return loadJsonDb(defaultDb);
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    // Test connection
    const conn = await pool.getConnection();
    console.log("✅ Successfully connected to Hostinger MySQL Database!");
    conn.release();
    isMysqlActive = true;

    // Build schema tables
    await createTables();
    
    // Load and return data
    const dbData = await loadFromMysql(defaultDb);
    return dbData;
  } catch (err: any) {
    console.warn("ℹ️ MySQL Connection/Init fell back to Local JSON Mode:", err.message || err);
    isMysqlActive = false;
    return loadJsonDb(defaultDb);
  }
}

async function createTables() {
  if (!pool) return;

  const queries = [
    `CREATE TABLE IF NOT EXISTS settings (
      id VARCHAR(50) PRIMARY KEY,
      promotionalAdsEnabled BOOLEAN DEFAULT TRUE,
      activeThemeOverride VARCHAR(255) DEFAULT '',
      simulatedDate VARCHAR(255) DEFAULT '',
      smsGatewayUrl VARCHAR(500) DEFAULT '',
      smsApiKey VARCHAR(500) DEFAULT '',
      smsSenderId VARCHAR(50) DEFAULT '',
      smsRoute VARCHAR(50) DEFAULT '',
      smsActive BOOLEAN DEFAULT FALSE,
      activeSmsProviderId VARCHAR(50) DEFAULT 'fast2sms',
      smsProviders TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255),
      role VARCHAR(255) NOT NULL,
      flat VARCHAR(255),
      type VARCHAR(255),
      vehicleNo VARCHAR(255),
      shift VARCHAR(255),
      gate VARCHAR(255),
      idCard VARCHAR(255),
      designation VARCHAR(255),
      committee VARCHAR(255),
      organization VARCHAR(255),
      isApproved BOOLEAN DEFAULT TRUE,
      society VARCHAR(255),
      registeredAt VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS visitors (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255),
      purpose VARCHAR(255),
      flat VARCHAR(255),
      hostName VARCHAR(255),
      company VARCHAR(255),
      vehicleNumber VARCHAR(255),
      passcode VARCHAR(255),
      qrCode VARCHAR(255),
      status VARCHAR(255),
      requestedAt VARCHAR(255),
      checkedInAt VARCHAR(255),
      checkedOutAt VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance (
      id VARCHAR(255) PRIMARY KEY,
      flat VARCHAR(255),
      title VARCHAR(255),
      amount DOUBLE,
      dueDate VARCHAR(255),
      status VARCHAR(255),
      category VARCHAR(255),
      paidAt VARCHAR(255),
      transactionId VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS complaints (
      id VARCHAR(255) PRIMARY KEY,
      flat VARCHAR(255),
      residentName VARCHAR(255),
      title VARCHAR(255),
      category VARCHAR(255),
      description TEXT,
      status VARCHAR(255),
      createdAt VARCHAR(255),
      assignedTo VARCHAR(255),
      updates TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS notices (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255),
      category VARCHAR(255),
      content TEXT,
      date VARCHAR(255),
      author VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS programs (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      date VARCHAR(255),
      startTime VARCHAR(255),
      endTime VARCHAR(255),
      location VARCHAR(255),
      coordinator VARCHAR(255),
      society VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS chats (
      id VARCHAR(255) PRIMARY KEY,
      sender VARCHAR(255),
      role VARCHAR(255),
      flat VARCHAR(255),
      message TEXT,
      timestamp VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS amenities (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      capacity INT,
      costPerHour INT,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS amenityBookings (
      id VARCHAR(255) PRIMARY KEY,
      amenityId VARCHAR(255),
      amenityName VARCHAR(255),
      residentName VARCHAR(255),
      flat VARCHAR(255),
      date VARCHAR(255),
      timeSlot VARCHAR(255),
      cost INT,
      status VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS staff (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      type VARCHAR(255),
      phone VARCHAR(255),
      rating DOUBLE,
      flats VARCHAR(255),
      status VARCHAR(255),
      checkedInAt VARCHAR(255),
      checkedOutAt VARCHAR(255),
      code VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS parking (
      id VARCHAR(255) PRIMARY KEY,
      slotNumber VARCHAR(255),
      flat VARCHAR(255),
      owner VARCHAR(255),
      vehicleNumber VARCHAR(255),
      vehicleType VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS polls (
      id VARCHAR(255) PRIMARY KEY,
      question VARCHAR(255),
      options TEXT,
      votedUsers TEXT,
      totalVotes INT,
      endsAt VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS guardAlerts (
      id VARCHAR(255) PRIMARY KEY,
      sender VARCHAR(255),
      type VARCHAR(255),
      message TEXT,
      timestamp VARCHAR(255),
      status VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS superAdminPlans (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      price DOUBLE,
      period VARCHAR(255),
      societies INT,
      features TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS approvals (
      id VARCHAR(255) PRIMARY KEY,
      visitorName VARCHAR(255),
      type VARCHAR(255),
      company VARCHAR(255),
      flat VARCHAR(255),
      hostName VARCHAR(255),
      vehicleNumber VARCHAR(255),
      status VARCHAR(255),
      timestamp VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS family (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      relationship VARCHAR(255),
      age INT,
      phone VARCHAR(255),
      accessGranted BOOLEAN,
      flat VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      category VARCHAR(255),
      uploadDate VARCHAR(255),
      size VARCHAR(255),
      url VARCHAR(255),
      privateToResident BOOLEAN,
      flat VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255),
      code VARCHAR(255),
      discount VARCHAR(255),
      validUntil VARCHAR(255),
      status VARCHAR(255),
      category VARCHAR(255),
      views INT DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      plate VARCHAR(255) PRIMARY KEY,
      type VARCHAR(255),
      ownerName VARCHAR(255),
      flatNo VARCHAR(255),
      checkInTime VARCHAR(255),
      checkedIn BOOLEAN,
      stickerNo VARCHAR(255),
      rfidTag VARCHAR(255),
      tagActive BOOLEAN,
      flat VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS gateLogs (
      id VARCHAR(255) PRIMARY KEY,
      direction VARCHAR(255),
      plate VARCHAR(255),
      timestamp VARCHAR(255),
      gate VARCHAR(255),
      success BOOLEAN,
      photoUrl VARCHAR(255),
      reason VARCHAR(255),
      details VARCHAR(255)
    )`
  ];

  for (const query of queries) {
    await pool.query(query);
  }

  // Gracefully add SMS settings columns if they don't already exist (DB Migrations)
  const columnsToMigrate = [
    { name: "smsGatewayUrl", type: "VARCHAR(500) DEFAULT ''" },
    { name: "smsApiKey", type: "VARCHAR(500) DEFAULT ''" },
    { name: "smsSenderId", type: "VARCHAR(50) DEFAULT ''" },
    { name: "smsRoute", type: "VARCHAR(50) DEFAULT ''" },
    { name: "smsActive", type: "BOOLEAN DEFAULT FALSE" },
    { name: "activeSmsProviderId", type: "VARCHAR(50) DEFAULT 'fast2sms'" },
    { name: "smsProviders", type: "TEXT" }
  ];

  for (const col of columnsToMigrate) {
    try {
      await pool.query(`ALTER TABLE settings ADD COLUMN ${col.name} ${col.type}`);
    } catch (e) {
      // Catch and ignore duplicate column errors
    }
  }
}

async function loadFromMysql(defaultDb: any): Promise<any> {
  if (!pool) return defaultDb;

  const db: any = {};

  // Settings
  const [settingsRows]: any = await pool.query("SELECT * FROM settings LIMIT 1");
  if (settingsRows.length === 0) {
    // Seed
    await pool.query(
      "INSERT INTO settings (id, promotionalAdsEnabled, activeThemeOverride, simulatedDate, smsGatewayUrl, smsApiKey, smsSenderId, smsRoute, smsActive, activeSmsProviderId, smsProviders) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "main", 
        defaultDb.settings.promotionalAdsEnabled, 
        defaultDb.settings.activeThemeOverride, 
        defaultDb.settings.simulatedDate,
        defaultDb.settings.smsGatewayUrl,
        defaultDb.settings.smsApiKey,
        defaultDb.settings.smsSenderId,
        defaultDb.settings.smsRoute,
        defaultDb.settings.smsActive ? 1 : 0,
        defaultDb.settings.activeSmsProviderId || "fast2sms",
        JSON.stringify(defaultDb.settings.smsProviders || [])
      ]
    );
    db.settings = { ...defaultDb.settings };
  } else {
    let parsedSmsProviders = defaultDb.settings.smsProviders;
    if (settingsRows[0].smsProviders) {
      try {
        parsedSmsProviders = JSON.parse(settingsRows[0].smsProviders);
      } catch (e) {
        console.error("Failed to parse smsProviders from settings table:", e);
      }
    }
    db.settings = {
      promotionalAdsEnabled: !!settingsRows[0].promotionalAdsEnabled,
      activeThemeOverride: settingsRows[0].activeThemeOverride || "",
      simulatedDate: settingsRows[0].simulatedDate || "",
      smsGatewayUrl: settingsRows[0].smsGatewayUrl || "https://www.fast2sms.com/dev/bulkV2",
      smsApiKey: settingsRows[0].smsApiKey || "",
      smsSenderId: settingsRows[0].smsSenderId || "FSTSMS",
      smsRoute: settingsRows[0].smsRoute || "otp",
      smsActive: !!settingsRows[0].smsActive,
      activeSmsProviderId: settingsRows[0].activeSmsProviderId || "fast2sms",
      smsProviders: parsedSmsProviders || defaultDb.settings.smsProviders || []
    };
  }

  // Helper loader
  const loadTable = async (tableName: string, defaultArray: any[], parseFields: string[] = []): Promise<any[]> => {
    const [rows]: any = await pool.query(`SELECT * FROM ${tableName}`);
    if (rows.length === 0 && defaultArray && defaultArray.length > 0) {
      // Seed table
      for (const item of defaultArray) {
        const keys = Object.keys(item);
        const values = keys.map(k => {
          const val = item[k];
          if (parseFields.includes(k) && (typeof val === "object" || Array.isArray(val))) {
            return JSON.stringify(val);
          }
          if (typeof val === "boolean") {
            return val ? 1 : 0;
          }
          return val;
        });
        const placeholders = keys.map(() => "?").join(", ");
        await pool.query(
          `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`,
          values
        );
      }
      return JSON.parse(JSON.stringify(defaultArray));
    }

    return rows.map((row: any) => {
      const item: any = { ...row };
      // Handle parsing fields
      for (const field of parseFields) {
        if (item[field]) {
          try {
            item[field] = JSON.parse(item[field]);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      }
      // Handle booleans
      for (const k of Object.keys(item)) {
        if (typeof item[k] === "number" && (k === "checkedIn" || k === "tagActive" || k === "accessGranted" || k === "privateToResident" || k === "success")) {
          item[k] = !!item[k];
        }
      }
      return item;
    });
  };

  db.societies = defaultDb.societies; // Keep in memory/static
  db.users = await loadTable("users", defaultDb.users);
  db.visitors = await loadTable("visitors", defaultDb.visitors);
  db.maintenance = await loadTable("maintenance", defaultDb.maintenance);
  db.complaints = await loadTable("complaints", defaultDb.complaints, ["updates"]);
  db.notices = await loadTable("notices", defaultDb.notices);
  db.programs = await loadTable("programs", defaultDb.programs || []);
  db.chats = await loadTable("chats", defaultDb.chats);
  db.amenities = await loadTable("amenities", defaultDb.amenities);
  db.amenityBookings = await loadTable("amenityBookings", defaultDb.amenityBookings);
  db.staff = await loadTable("staff", defaultDb.staff);
  db.parking = await loadTable("parking", defaultDb.parking);
  db.polls = await loadTable("polls", defaultDb.polls, ["options", "votedUsers"]);
  db.guardAlerts = await loadTable("guardAlerts", defaultDb.guardAlerts);
  db.superAdminPlans = await loadTable("superAdminPlans", defaultDb.superAdminPlans, ["features"]);
  db.approvals = await loadTable("approvals", defaultDb.approvals);
  db.family = await loadTable("family", defaultDb.family || []);
  db.documents = await loadTable("documents", defaultDb.documents || []);
  db.coupons = await loadTable("coupons", defaultDb.coupons || []);
  db.vehicles = await loadTable("vehicles", defaultDb.vehicles || []);
  db.gateLogs = await loadTable("gateLogs", defaultDb.gateLogs || []);

  return db;
}

export async function syncDbToMysql(db: any) {
  if (!isMysqlActive || !pool) return;

  try {
    // 1. Settings sync
    await pool.query(
      "UPDATE settings SET promotionalAdsEnabled = ?, activeThemeOverride = ?, simulatedDate = ?, smsGatewayUrl = ?, smsApiKey = ?, smsSenderId = ?, smsRoute = ?, smsActive = ?, activeSmsProviderId = ?, smsProviders = ? WHERE id = ?",
      [
        db.settings.promotionalAdsEnabled ? 1 : 0, 
        db.settings.activeThemeOverride, 
        db.settings.simulatedDate,
        db.settings.smsGatewayUrl,
        db.settings.smsApiKey,
        db.settings.smsSenderId,
        db.settings.smsRoute,
        db.settings.smsActive ? 1 : 0,
        db.settings.activeSmsProviderId || "fast2sms",
        JSON.stringify(db.settings.smsProviders || []),
        "main"
      ]
    );

    // Helper to sync whole collection
    const syncTable = async (tableName: string, array: any[], jsonFields: string[] = []) => {
      // Clean table first
      await pool.query(`DELETE FROM ${tableName}`);
      if (!array || array.length === 0) return;

      for (const item of array) {
        const keys = Object.keys(item);
        const values = keys.map(k => {
          const val = item[k];
          if (jsonFields.includes(k) && (typeof val === "object" || Array.isArray(val))) {
            return JSON.stringify(val);
          }
          if (typeof val === "boolean") {
            return val ? 1 : 0;
          }
          return val;
        });
        const placeholders = keys.map(() => "?").join(", ");
        await pool.query(
          `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`,
          values
        );
      }
    };

    await syncTable("users", db.users);
    await syncTable("visitors", db.visitors);
    await syncTable("maintenance", db.maintenance);
    await syncTable("complaints", db.complaints, ["updates"]);
    await syncTable("notices", db.notices);
    await syncTable("programs", db.programs || []);
    await syncTable("chats", db.chats);
    await syncTable("amenities", db.amenities);
    await syncTable("amenityBookings", db.amenityBookings);
    await syncTable("staff", db.staff);
    await syncTable("parking", db.parking);
    await syncTable("polls", db.polls, ["options", "votedUsers"]);
    await syncTable("guardAlerts", db.guardAlerts);
    await syncTable("approvals", db.approvals);
    await syncTable("family", db.family);
    await syncTable("documents", db.documents);
    await syncTable("coupons", db.coupons);
    await syncTable("vehicles", db.vehicles);
    await syncTable("gateLogs", db.gateLogs);

    console.log("⚡ Hostinger MySQL DB synchronized perfectly.");
  } catch (err: any) {
    console.warn("ℹ️ Failed to sync DB with MySQL:", err.message || err);
  }
}

// ---------------------------------------------------------
// Local JSON Storage fallback (sandbox / developer mode)
// ---------------------------------------------------------
function loadJsonDb(defaultDb: any): any {
  if (!fs.existsSync(DB_PATH)) {
    saveJsonDb(defaultDb);
    return defaultDb;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading gatekaru_db.json, using defaults:", err);
    return defaultDb;
  }
}

function saveJsonDb(db: any): void {
  try {
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), "utf-8");
    fs.renameSync(tempPath, DB_PATH);
  } catch (err) {
    console.error("Error saving gatekaru_db.json:", err);
  }
}

export function saveDb(db: any): void {
  if (isMysqlActive) {
    // Fire-and-forget async sync
    syncDbToMysql(db).catch(err => {
      console.warn("ℹ️ Async sync background fell back:", err.message || err);
    });
  } else {
    saveJsonDb(db);
  }
}
