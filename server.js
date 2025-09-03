const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Legge variabili di ambiente
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN;

// Controllo rapido: se non settate, log errore
if (!WEBHOOK_URL || !WEBHOOK_TOKEN) {
  console.error("ERROR: WEBHOOK_URL o WEBHOOK_TOKEN non settati come environment variables");
  process.exit(1);
}

app.use(bodyParser.json());

// Log richieste
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Endpoint per ricevere dati dal frontend invitati
app.post("/api/form", async (req, res) => {
  try {
    const { sheet, values } = req.body;

    if (!sheet || !Array.isArray(values)) {
      return res.status(400).json({ ok: false, error: "Missing sheet or values array" });
    }

    // Invia al webhook Google Sheet
    const response = await axios.post(WEBHOOK_URL, { sheet, values }, {
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
app.get("/", (req, res) => res.send("Wedding backend running!"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
