import fs from "fs";

const content = fs.readFileSync("c:/Users/PRASANNA/Freelancing/et-media-hub/frontend/src/pages/AdminDashboardPage.tsx", "utf-8");
const lines = content.split("\n");

const keywords = ["gallery", "GAL-", "Edit Media Asset", "Save Media Asset", "handleSaveGallery", "handleDeleteGallery", "/api/admin/gallery", "/api/gallery"];

lines.forEach((line, idx) => {
  keywords.forEach(kw => {
    if (line.toLowerCase().includes(kw.toLowerCase())) {
      console.log(`Line ${idx + 1} [${kw}]: ${line.trim().slice(0, 120)}`);
    }
  });
});
