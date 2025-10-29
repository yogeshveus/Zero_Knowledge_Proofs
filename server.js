// server.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Required for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from frontendnew
const staticPath = path.join(__dirname, "frontendnew");
app.use(express.static(staticPath));
console.log("Serving static files from:", staticPath);

// Parse JSON for POST requests (e.g., updating itemIds.json)
app.use(express.json());

// Generic route to serve any HTML file by name (e.g., /manufacturer -> manufacturer.html)
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(staticPath, `${page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Page not found");
  }
});

// Example route for saving itemIds.json
app.post("/save-itemids", (req, res) => {
  const data = req.body;
  const filePath = path.join(staticPath, "itemIds.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Failed to save itemIds.json:", err);
      return res.status(500).send("Failed to save itemIds.json");
    }
    console.log("itemIds.json updated successfully");
    res.send("OK");
  });
});

// Optional: fallback for root
app.get("/manufacturer", (req, res) => {
  res.sendFile(path.join(__dirname, "frontendnew", "manufacturer.html"));
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
