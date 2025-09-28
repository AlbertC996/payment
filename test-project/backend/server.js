// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/currencies", async (req, res) => {
  try {
    const response = await fetch("https://lakiesha-nontautomeric-awestruckly.ngrok-free.dev/changenow/currencies");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    res.json(data); // برگردوندن JSON واقعی
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
