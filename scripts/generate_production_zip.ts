import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

function generateAndVerifyZip() {
  const rootDir = process.cwd();
  const zipPath = path.join(rootDir, "gatekaru-hostinger-production.zip");

  // If a previous zip exists, remove it first to avoid any lockups or recursive packing issues
  if (fs.existsSync(zipPath)) {
    try {
      fs.unlinkSync(zipPath);
      console.log("🗑️ Cleared existing gatekaru-hostinger-production.zip to avoid nested corruption.");
    } catch (err: any) {
      console.warn("⚠️ Warning: Could not delete existing ZIP file on disk:", err.message);
    }
  }

  const zip = new AdmZip();

  // Root files to include in the ZIP (exclude other temporary/zip files)
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

  console.log("📦 Packaging individual files...");
  filesToInclude.forEach((file) => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      zip.addLocalFile(filePath);
      console.log(`  + File added: ${file}`);
    } else {
      console.warn(`  - File not found: ${file}`);
    }
  });

  // Folders to include (exclude .git, node_modules, etc.)
  const foldersToInclude = [
    { localName: "dist", zipName: "dist" },
    { localName: "src", zipName: "src" },
    { localName: "public", zipName: "public" },
    { localName: "android", zipName: "android" },
    { localName: "uploads", zipName: "uploads" }
  ];

  console.log("📁 Packaging directories...");
  foldersToInclude.forEach(({ localName, zipName }) => {
    const folderPath = path.join(rootDir, localName);
    if (fs.existsSync(folderPath)) {
      // Ensure we don't pack any nested corrupted zip file if it ended up inside any of these folders
      zip.addLocalFolder(folderPath, zipName);
      console.log(`  + Directory added: ${localName}`);
    } else {
      console.warn(`  - Directory not found: ${localName}`);
    }
  });

  console.log("💾 Writing ZIP file to disk...");
  zip.writeZip(zipPath);

  // --- INTEGRITY & CONTENTS VERIFICATION ---
  console.log("🔍 Verifying ZIP integrity...");
  try {
    const verifiedZip = new AdmZip(zipPath);
    const entries = verifiedZip.getEntries();
    
    if (entries.length === 0) {
      throw new Error("Generated ZIP is empty!");
    }

    let distFileCount = 0;
    let hasCorruptedZipInside = false;
    const rootItems = new Set<string>();

    entries.forEach((entry) => {
      const entryName = entry.entryName;
      const parts = entryName.split("/");
      if (parts[0]) {
        rootItems.add(parts[0]);
      }

      if (entryName.startsWith("dist/")) {
        distFileCount++;
      }

      // Check if there is any nested .zip file inside
      if (entryName.endsWith(".zip")) {
        hasCorruptedZipInside = true;
      }
    });

    const stats = fs.statSync(zipPath);
    const sizeMB = stats.size / (1024 * 1024);

    if (distFileCount === 0) {
      throw new Error("CRITICAL ERROR: 'dist' folder is empty or was not included inside the ZIP!");
    }

    if (hasCorruptedZipInside) {
      throw new Error("CRITICAL ERROR: Nested zip file detected inside the generated package!");
    }

    console.log("\n==============================================");
    console.log("🎉 SUCCESS: ZIP PASSED INTEGRITY VERIFICATION!");
    console.log(`📁 ZIP Destination: ${zipPath}`);
    console.log(`📊 ZIP Size: ${sizeMB.toFixed(3)} MB`);
    console.log(`📄 Total File/Folder Entries inside ZIP: ${entries.length}`);
    console.log(`⚡ Compiled files in 'dist/' inside ZIP: ${distFileCount}`);
    console.log("🗺️ ZIP Root-level Contents:");
    rootItems.forEach(item => console.log(`  - ${item}`));
    console.log("==============================================\n");

  } catch (err: any) {
    console.error("\n❌ INTEGRITY VERIFICATION FAILED:", err.message);
    process.exit(1);
  }
}

generateAndVerifyZip();
