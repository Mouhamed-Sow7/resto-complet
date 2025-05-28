const { Pool } = require("pg");
const crypto = require("crypto");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "reservation_app",
  password: "M1976D", // Ton mot de passe DB
  port: 5432,
});

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // Convertit la clé hex en Buffer de 32 octets
if (key.length !== 32) {
  throw new Error(
    "d582d8128eadc0f6ad9f418aba43126e8c392b2ae61962383b1910f18d150638"
  );
}

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, email FROM reservations_archive"
    );
    for (const row of result.rows) {
      if (row.email && !row.email.includes(":")) {
        // Vérifie si l'email n'est pas déjà crypté
        const encryptedEmail = encrypt(row.email);
        await client.query(
          "UPDATE reservations_archive SET email = $1 WHERE id = $2",
          [encryptedEmail, row.id]
        );
        console.log(`Email crypté pour ID ${row.id}: ${encryptedEmail}`);
      }
    }
    console.log("Emails mis à jour avec succès.");
    await client.release();
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await pool.end();
  }
})();
