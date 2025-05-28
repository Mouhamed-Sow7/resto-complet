const pool = require("../config/db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // Convertit la clé hex en Buffer de 32 octets
if (key.length !== 32) {
  throw new Error("Clé de cryptage invalide : doit être de 32 octets");
}

// Fonction pour crypter un texte
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

// Fonction pour décrypter un texte
const decrypt = (encryptedText) => {
  if (
    !encryptedText ||
    typeof encryptedText !== "string" ||
    !encryptedText.includes(":")
  ) {
    return "Email non crypté ou invalide";
  }
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(ivHex, "hex")
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Erreur lors du décryptage:", error.message);
    return "Erreur de décryptage";
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sowhamedou10@gmail.com",
    pass: "qshp wanl htbi kabu",
  },
  logger: true,
  debug: true,
});

// Fonction pour nettoyer les réservations de plus de 3 jours et les archiver
const cleanOldReservations = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];
    const oldReservationsQuery = `
      SELECT * FROM reservations
      WHERE DATE(created_at) < $1
    `;
    const oldReservationsResult = await pool.query(oldReservationsQuery, [
      threeDaysAgoStr,
    ]);
    if (oldReservationsResult.rows.length > 0) {
      for (const reservation of oldReservationsResult.rows) {
        const encryptedEmail = encrypt(reservation.email);
        const archiveQuery = `
          INSERT INTO reservations_archive (name, email, date, time, table_number, table_section, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await pool.query(archiveQuery, [
          reservation.name,
          encryptedEmail,
          reservation.date,
          reservation.time,
          reservation.table_number,
          reservation.table_section,
          reservation.created_at,
        ]);
      }
      const deleteQuery = `
        DELETE FROM reservations
        WHERE DATE(created_at) < $1
      `;
      const deleteResult = await pool.query(deleteQuery, [threeDaysAgoStr]);
      console.log(
        `Réservations supprimées et archivées : ${deleteResult.rowCount}`
      );
    } else {
      console.log("Aucune réservation à archiver.");
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage des réservations:", error);
  }
};

const submitReservation = async (req, res) => {
  const { name, email, date, time, table_number, table_section } = req.body;
  if (!name || !email || !date || !time || !table_number || !table_section) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires ne sont pas remplis." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email invalide." });
  }
  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    return res.status(400).json({ error: "La date doit être dans le futur." });
  }
  const timeParts = time.split(":");
  const hours = parseInt(timeParts[0], 10);
  console.log(`Heure soumise : ${hours}h - Vérification (9h-23h)`);
  if (hours < 9 || hours > 23) {
    return res
      .status(400)
      .json({
        error: "Les réservations sont autorisées uniquement entre 9h et 23h.",
      });
  }
  try {
    const conflictQuery = `
      SELECT * FROM reservations
      WHERE date = $1 AND time = $2 AND table_number = $3 AND table_section = $4
    `;
    const conflictValues = [date, time, table_number, table_section];
    const conflictResult = await pool.query(conflictQuery, conflictValues);
    if (conflictResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Cette table est déjà réservée à cet horaire." });
    }
    const query = `
      INSERT INTO reservations (name, email, date, time, table_number, table_section)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, date, time, table_number, table_section
    `;
    const values = [name, email, date, time, table_number, table_section];
    const result = await pool.query(query, values);
    await cleanOldReservations();
    await transporter.sendMail({
      from: "sowhamedou10@gmail.com",
      to: email,
      subject: "Confirmation de réservation - Adamane",
      html: `
        <h2 style="color: #4CAF50;">Bonjour ${name},</h2>
        <p>Votre réservation pour le <strong>${date}</strong> à <strong>${time}</strong> a été bien reçue !</p>
        <p>Vous avez réservé la <strong>Table ${table_number}</strong> située <strong>${table_section}</strong>.</p>
        <p style="color: #555;">Merci de votre confiance.</p>
        <p>L'équipe Adamane</p>
        <p style="font-size: 0.8em; color: #999;">Si vous n'êtes pas à l'origine de cette réservation, veuillez nous contacter.</p>
        <p style="font-size: 0.8em; color: #999;">Pour toute question, contactez-nous à <a href="mailto:sowhamedou10@gmail.com">Adamane</a>.</p>
        <p style="font-size: 0.8em; color: #999;">Vous pouvez également nous appeler au <strong>+221 78 122 03 91</strong>.</p>
      `,
    });
    res.status(200).json({
      message:
        "Réservation bien reçue ! Un email de confirmation vous a été envoyé.",
      reservation: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'enregistrement." });
  }
};

// Pour lister les réservations (ex : pour un admin)
const getReservations = async (req, res) => {
  try {
    console.log("1. Requête pour lister les réservations reçue.");
    const result = await pool.query(
      "SELECT * FROM reservations ORDER BY created_at DESC"
    );
    console.log("2. Résultat de la requête reservations:", result.rows);
    const archived = await pool.query(
      "SELECT * FROM reservations_archive ORDER BY archived_at DESC"
    );
    console.log(
      "3. Résultat de la requête reservations_archive:",
      archived.rows
    );
    const decryptedEmails = archived.rows.map((row) => ({
      ...row,
      email: decrypt(row.email),
    }));
    console.log("4. Emails décryptés:", decryptedEmails);
    console.log("5. Envoi des réservations au client:", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur dans getReservations:", error.message);
    res.status(500).json({ error: "Erreur serveur: " + error.message });
  }
};

// Pour annuler une réservation
const cancelReservation = async (req, res) => {
  const { id } = req.params;
  console.log(`Requête d'annulation pour la réservation ID: ${id}`);
  try {
    const findQuery = `
      SELECT * FROM reservations WHERE id = $1
    `;
    const findResult = await pool.query(findQuery, [id]);
    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: "Réservation non trouvée." });
    }
    const reservation = findResult.rows[0];
    const encryptedEmail = encrypt(reservation.email);
    const archiveQuery = `
      INSERT INTO reservations_archive (name, email, date, time, table_number, table_section, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(archiveQuery, [
      reservation.name,
      encryptedEmail,
      reservation.date,
      reservation.time,
      reservation.table_number,
      reservation.table_section,
      reservation.created_at,
    ]);
    const deleteQuery = `
      DELETE FROM reservations WHERE id = $1
    `;
    await pool.query(deleteQuery, [id]);
    await transporter.sendMail({
      from: "sowhamedou10@gmail.com",
      to: reservation.email,
      subject: "Annulation de votre réservation - Adamane",
      html: `
        <h2 style="color: #FF6347;">Bonjour ${reservation.name},</h2>
        <p>Votre réservation pour le <strong>${reservation.date}</strong> à <strong>${reservation.time}</strong> a été annulée.</p>
        <p>Table <strong>${reservation.table_number}</strong> située <strong>${reservation.table_section}</strong>.</p>
        <p style="color: #555;">Nous sommes désolés si cela vous cause un désagrément.</p>
        <p>L'équipe Adamane</p>
        <p style="font-size: 0.8em; color: #999;">Pour toute question, contactez-nous à <a href="mailto:sowhamedou10@gmail.com">Adamane</a>.</p>
        <p style="font-size: 0.8em; color: #999;">Vous pouvez également nous appeler au <strong>+221 78 122 03 91</strong>.</p>
      `,
    });
    res.status(200).json({ message: "Réservation annulée avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'annulation:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'annulation." });
  }
};

module.exports = {
  submitReservation,
  getReservations,
  cleanOldReservations,
  cancelReservation,
};
