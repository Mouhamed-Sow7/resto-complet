const express = require("express");
const router = express.Router();

router.post("/orders", (req, res) => {
  console.log("Requête POST reçue sur /api/orders");
  const { items, total, paymentMethod, clientNom, clientTel, commentaire } =
    req.body;

  // Vérifie les données
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log("Erreur: panier vide ou invalide");
    return res.status(400).json({ error: "Le panier est vide ou invalide" });
  }

  // Logique pour sauvegarder la commande (ex : dans une base de données)
  console.log("Commande reçue:", {
    items,
    total,
    paymentMethod,
    clientNom,
    clientTel,
    commentaire,
  });

  res.status(200).json({ message: "Commande bien enregistrée !" });
});

module.exports = router;
