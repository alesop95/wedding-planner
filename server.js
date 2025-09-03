const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione: URL del webhook Apps Script e token
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://script.google.com/macros/s/YOUR_WEBHOOK_ID/exec";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "2f8c9c85-3d48-47d7-9a1d-91b032e67b4e";

// Middleware per JSON
app.use(bodyParser.json());

// Log semplice di tutte le richieste ricevute
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Endpoint per ricevere form dagli invitati
app.post("/api/form", async (req, res) => {
  try {
    const { sheet, values } = req.body;

    if (!sheet || !Array.isArray(values)) {
      return res.status(400).json({ ok: false, error: "Missing sheet or values array" });
    }

    // Invia dati al webhook Google Sheet
    const response = await axios.post(WEBHOOK_URL, {
      sheet,
      values
    }, {
      params: { token: WEBHOOK_TOKEN },
      headers: { "Content-Type": "application/json" }
    });

    console.log("Webhook response:", response.data);

    res.json({ ok: true, webhook: response.data });
  } catch (err) {
    console.error("Error sending to webhook:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Wedding backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

