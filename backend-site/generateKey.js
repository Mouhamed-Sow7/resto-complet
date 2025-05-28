const crypto = require("crypto");

// Génère une clé aléatoire de 32 caractères (256 bits)
const secretKey = crypto.randomBytes(32).toString("hex");
console.log("Clé secrète générée :", secretKey);
