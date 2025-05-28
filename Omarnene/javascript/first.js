// menu burger
const test_one = document.querySelector(".nav-drop");
const menuButton = document.querySelector(".menu-btn");

function ToggleMenu() {
  test_one.classList.toggle("open-off");
}
menuButton.addEventListener("click", ToggleMenu);

// Ajout d'un style active pour chaque lien
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-drop a:not(.login a)");

  navLinks.forEach((lien) => {
    lien.addEventListener("click", function () {
      navLinks.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

// Animation de section (désactivée car hidden est géré par auth.js)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

// Récupère tous les liens d'ancre
const links = document.querySelectorAll('a[href^="#"]');
const offset = 120;

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const href = this.getAttribute("href");
    // Vérifier si href est juste "#" ou vide
    if (href === "#" || href === "") {
      console.warn("Lien avec href invalide détecté :", href);
      return; // Arrête l'exécution pour éviter l'erreur
    }

    const target = document.querySelector(href);
    if (target) {
      const position = target.offsetTop - offset;

      window.scrollTo({
        top: position,
        behavior: "smooth",
      });
    } else {
      console.warn("Cible non trouvée pour href :", href);
    }
  });
});

// Pop-up
let selectedPaymentMethod = "cash";

function showPopup(message, isError = false) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "custom-alert-order";
  const iconClass = isError
    ? "fas fa-exclamation-circle"
    : "fas fa-check-circle";
  alertDiv.innerHTML = `<i class="${iconClass}"></i><p>${message}</p>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => {
    if (document.body.contains(alertDiv)) {
      document.body.removeChild(alertDiv);
    }
  }, 3000);
}

// Gestion de #commandePopup avec vérification de connexion
document.querySelectorAll(".btn-commande").forEach((button) => {
  button.addEventListener("click", () => {
    if (!localStorage.getItem("token")) {
      showPopup("Veuillez vous connecter pour commander.", true);
      return;
    }
    document.getElementById("commandePopup").classList.remove("hidden");
  });
});

document
  .querySelector("#commandePopup .close-btn")
  .addEventListener("click", () => {
    document.getElementById("commandePopup").classList.add("hidden");
  });

function generateTicket(orderData) {
  console.log("Données pour le ticket:", orderData);

  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.top = "0";
  tempContainer.style.left = "0";
  tempContainer.style.width = "100%";
  tempContainer.style.height = "100%";
  tempContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  tempContainer.style.zIndex = "1000";
  tempContainer.style.display = "flex";
  tempContainer.style.justifyContent = "center";
  tempContainer.style.alignItems = "center";

  const ticketDiv = document.createElement("div");
  ticketDiv.style.padding = "20px";
  ticketDiv.style.fontFamily = "Arial, sans-serif";
  ticketDiv.style.width = "300px";
  ticketDiv.style.border = "1px solid #ccc";
  ticketDiv.style.backgroundColor = "#ffffff";
  ticketDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";

  let itemsHtml = "";
  orderData.items.forEach((item) => {
    itemsHtml += `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
        <span>${item.nom} (x${item.quantite})</span>
        <span>${(item.prix * item.quantite).toLocaleString()} FCFA</span>
      </div>
    `;
  });

  ticketDiv.innerHTML = `
    <h2 style="text-align: center; font-size: 18px; margin-bottom: 10px;">Ticket de Commande</h2>
    <p style="font-size: 14px;"><strong>Client:</strong> ${
      orderData.clientNom
    }</p>
    <p style="font-size: 14px;"><strong>Téléphone:</strong> ${
      orderData.clientTel
    }</p>
    <p style="font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p style="font-size: 14px;"><strong>Heure:</strong> ${new Date().toLocaleTimeString()}</p>
    <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;">
    ${itemsHtml}
    <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;">
    <p style="text-align: right; font-size: 14px;"><strong>Total:</strong> ${orderData.total.toLocaleString()} FCFA</p>
    <p style="font-size: 14px;"><strong>Méthode de paiement:</strong> ${
      orderData.paymentMethod
    }</p>
    <p style="text-align: center; margin-top: 20px; font-size: 14px;">Merci pour votre commande !</p>
  `;

  tempContainer.appendChild(ticketDiv);
  document.body.appendChild(tempContainer);

  setTimeout(() => {
    const opt = {
      margin: 0.5,
      filename: `ticket_${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(ticketDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempContainer);
      })
      .catch((error) => {
        console.error("Erreur lors de la génération du PDF:", error);
        document.body.removeChild(tempContainer);
      });
  }, 500);
}

class Commande {
  constructor(nom, prix, image) {
    this.nom = nom;
    this.prix = prix;
    this.image = image;
    this.ajouterHandler = this.ajouterHandler.bind(this);
  }

  ouvrirPopup() {
    document.getElementById("platNom").textContent = this.nom;
    document.getElementById("platPrix").textContent = this.prix;
    document.getElementById("platImage").src = this.image;
    document.getElementById("total").textContent = this.prix;

    document.getElementById("quantite").value = 1;
    document.getElementById("commandePopup").classList.remove("hidden");

    this.gererCalcul();
    this.gererPaiement();
  }

  gererCalcul() {
    const quantiteInput = document.getElementById("quantite");
    const totalDisplay = document.getElementById("total");
    quantiteInput.removeEventListener("input", quantiteInput._handler);

    const handler = () => {
      const quantite = parseInt(quantiteInput.value);
      const total =
        this.prix * (isNaN(quantite) || quantite < 1 ? 1 : quantite);
      totalDisplay.textContent = total;
    };

    quantiteInput._handler = handler;
    quantiteInput.addEventListener("input", handler);
  }

  gererPaiement() {
    const paiementSelect = document.getElementById("paiement");
    paiementSelect.removeEventListener("change", paiementSelect._handler);

    const handler = () => {
      selectedPaymentMethod = paiementSelect.value;
    };

    paiementSelect._handler = handler;
    paiementSelect.addEventListener("change", handler);
  }

  ajouterHandler() {
    const quantite = parseInt(document.getElementById("quantite").value);
    // Ajouter à cart (à implémenter si nécessaire)
  }
}

document.querySelectorAll(".btn-commande").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!localStorage.getItem("token")) {
      showPopup("Veuillez vous connecter pour commander.", true);
      return;
    }
    const nom = btn.dataset.nom;
    const prix = parseInt(btn.dataset.prix);
    const image = btn.dataset.image;

    const commande = new Commande(nom, prix, image);
    commande.ouvrirPopup();
  });
});

document
  .querySelector("#commandePopup .close-btn")
  .addEventListener("click", () => {
    document.getElementById("commandePopup").classList.add("hidden");
  });

document
  .getElementById("confirmerCommande")
  .addEventListener("click", async () => {
    const quantite = parseInt(document.getElementById("quantite").value);
    const clientNom = document.getElementById("clientNom").value || "Anonyme";
    const clientTel =
      document.getElementById("clientTel").value || "Non fourni";

    if (isNaN(quantite) || quantite < 1) {
      showPopup(
        "Quantité invalide ! Veuillez entrer une quantité supérieure à 0.",
        true
      );
      return;
    }

    if (!clientNom.trim() || !clientTel.trim()) {
      showPopup(
        "Veuillez entrer un nom et un numéro de téléphone valides.",
        true
      );
      return;
    }

    const orderData = {
      items: [
        {
          nom: document.getElementById("platNom").textContent,
          prix: parseInt(document.getElementById("platPrix").textContent),
          quantite: quantite,
          image: document.getElementById("platImage").src,
        },
      ],
      total: parseInt(document.getElementById("total").textContent),
      paymentMethod: selectedPaymentMethod || "Non spécifié",
      clientNom: clientNom,
      clientTel: clientTel,
      commentaire: document.getElementById("commentaire").value || "",
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("Réponse brute du serveur:", text);
        throw new Error(
          `Erreur HTTP: ${response.status} - ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Réponse du serveur:", result);

      generateTicket(orderData);

      showPopup(
        `Commande de ${orderData.items[0].nom} confirmée avec succès ! Total: ${orderData.total} FCFA`,
        false
      );

      document.getElementById("commandePopup").classList.add("hidden");
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      showPopup(`Erreur: ${error.message}`, true);
    }
  });
