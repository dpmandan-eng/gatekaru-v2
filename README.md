# GateKaru - Smart Security & Gate ERP 🛡️🚪

GateKaru is an enterprise-grade Smart Society Security, Visitor Tracking, and Gate ERP Management System. Built using a modern, performant full-stack architecture, it operates with a desktop-first precision design that scales smoothly down to mobile touchpoints.

This project is fully production-ready, featuring automated MySQL schema migration, zero-configuration database seeding, PWA support, and pre-configured Capacitor integration for compiling native Android apps.

---

## 🚀 Key Production-Ready Accomplishments

- **✅ Hostinger MySQL Auto Connect**: Dynamic integration using environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- **✅ Automatic Table Creation**: The Node.js application auto-detects if tables (users, visitors, notices, complaints, etc.) are missing and builds them on the first startup.
- **✅ No manual SQL Imports**: You do not need to import any `.sql` schema files via phpMyAdmin. The application runs all schema setups programmatically.
- **✅ Zero-Config Admin Seeding**: Default Super Admin, Admin, Guard, and sample resident database profiles are automatically injected during first-run initialization.
- **✅ Responsive PWA Web App**: Implemented rich SVG branding (`/logo.svg`), full mobile app manifest config (`/public/manifest.json`), touch-optimized navigation targets (min 44px), and native PWA metadata.
- **✅ Android App (Capacitor Ready)**: Complete integration with `@capacitor/core` and `@capacitor/android`. Fully configured `capacitor.config.json` makes it ready to compile into a native `.aab` (Android App Bundle) or `.apk` in Android Studio.
- **✅ Secure Node.js Backend**: Uses safe server-side API endpoints (`/api/*`) to proxy database and Gemini AI operations, preventing client-side leak of keys or credentials.

---

## 🛠️ Technology Stack

- **Frontend**: React (v19) + Vite + Tailwind CSS + Framer Motion (for polished, lightweight animations)
- **Backend**: Node.js + Express (dynamic port binding, routing middleware)
- **Database**: Hostinger MySQL (native driver integration via `mysql2/promise`)
- **App Wrapper**: Ionic Capacitor for native iOS/Android packaging
- **AI Integration**: Server-Side `@google/genai` (secure gateway proxy)

---

## 📁 Core Folder & File Architecture

- `/server.ts` - Master Express server implementing REST APIs, API proxies, static web serving, and database initialization.
- `/db_store.ts` - Native MySQL connection pool management, database error diagnostic suite, programmatic schema builder, and table-seeding engine.
- `/src/App.tsx` - Main React entry point routing users to Super Admin, Society Admin, Resident, and Gate Guard portals.
- `/src/components/` - Highly polished modular UI portals (Super Admin panel, Guard, Resident dashboard, etc.) styled beautifully using Tailwind CSS.
- `/capacitor.config.json` - Native build configuration for Android Studio packaging.
- `/public/manifest.json` - PWA config allowing users to "Add to Home Screen" on Android & iOS.
- `/public/logo.svg` - Beautiful, high-resolution SVG security vector icon representing GateKaru.

---

## ⚡ Quick Start: Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   DB_HOST="localhost"
   DB_PORT=3306
   DB_USER="root"
   DB_PASSWORD="your_password"
   DB_NAME="gatekaru_db"
   GEMINI_API_KEY="your_optional_gemini_key"
   JWT_SECRET="your_custom_jwt_secret"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview the app.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📱 Mobile App (Android Studio & Play Store Ready)

To open the configured native Android project in Android Studio:
1. Ensure you have run a production build first to populate the `dist` directory:
   ```bash
   npm run build
   ```
2. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
3. To generate a signed bundle (`.aab`) for Google Play Store upload:
   - In Android Studio, go to **Build** > **Generate Signed Bundle / APK...**
   - Choose **Android App Bundle** and click Next.
   - Select or create your Keystore, fill in the credentials, select the **release** build variant, and click Finish.
   - Your Play Store ready `.aab` file will be generated in `android/app/release/`.

---

## 📝 Guides included in the workspace
* **`HOSTINGER_DEPLOYMENT.md`**: Hindi/English easy-to-follow guide for Hostinger Node.js deployment, MySQL credentials setup, and troubleshooting.
* **`DEPLOY.md`**: Extended reference detailing deployment methods (Method A full-stack vs. Method B frontend only).
