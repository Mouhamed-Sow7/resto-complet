const express = require("express");
const router = express.Router();
const {
  submitReservation,
  getReservations,
  cleanOldReservations,
  cancelReservation,
} = require("../controllers/reservationController");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader !== "admin123") {
    return res.status(401).json({ error: "Accès non autorisé." });
  }
  next();
};

router.post("/", submitReservation);
router.get("/", authMiddleware, getReservations);
router.get("/clean", authMiddleware, async (req, res) => {
  await cleanOldReservations();
  res
    .status(200)
    .json({ message: "Nettoyage des anciennes réservations effectué." });
});
router.delete("/:id", authMiddleware, cancelReservation);

module.exports = router;
