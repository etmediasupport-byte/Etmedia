import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(__dirname, "../frontend/dist");
const backendPublic = path.resolve(__dirname, "public");

console.log(`[Build Sync] Syncing frontend dist from: ${frontendDist} to ${backendPublic}`);

if (fs.existsSync(frontendDist)) {
  if (fs.existsSync(backendPublic)) {
    fs.rmSync(backendPublic, { recursive: true, force: true });
  }
  fs.mkdirSync(backendPublic, { recursive: true });

  // Copy recursive
  fs.cpSync(frontendDist, backendPublic, { recursive: true, force: true });
  console.log("✅ [Build Sync] Successfully updated backend/public with latest frontend production build!");
} else {
  console.error("❌ [Build Sync] Error: ../frontend/dist directory does not exist!");
}
