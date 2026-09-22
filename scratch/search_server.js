import fs from "fs";

const content = fs.readFileSync("c:/Users/PRASANNA/Freelancing/et-media-hub/backend/src/server.ts", "utf-8");
const lines = content.split("\n");

const keywords = ["ensureGalleryTable", "gallery_items", "CREATE TABLE", "app.put(\"/api/admin/gallery"];

lines.forEach((line, idx) => {
  keywords.forEach(kw => {
    if (line.toLowerCase().includes(kw.toLowerCase())) {
      console.log(`Line ${idx + 1} [${kw}]: ${line.trim().slice(0, 120)}`);
    }
  });
});
