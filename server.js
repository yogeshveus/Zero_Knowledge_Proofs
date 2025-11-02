// server.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticPath = path.join(__dirname, "frontendnew");
app.use(express.static(staticPath));
console.log("Serving static files from:", staticPath);

app.use(express.json());

app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(staticPath, `${page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Page not found");
  }
});

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

app.get("/manufacturer", (req, res) => {
  res.sendFile(path.join(__dirname, "frontendnew", "manufacturer.html"));
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
