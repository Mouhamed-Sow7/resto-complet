// server.js
require("dotenv").config(); // Charge les variables d'environnement dès le début

const express = require("express");
const cors = require("cors");
const authRoutes = require("./authRoutes"); // Assure-toi que ce fichier existe
const reservationRoutes = require("./routes/reservationRoutes");
const orderRoutes = require("./routes/order");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/", authRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api", orderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
