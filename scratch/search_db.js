import fs from "fs";

const content = fs.readFileSync("c:/Users/PRASANNA/Freelancing/et-media-hub/backend/src/db.ts", "utf-8");
const lines = content.split("\n");

lines.forEach((line, idx) => {
  if (line.includes("gallery_items") || line.includes("ensureGalleryTable")) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
