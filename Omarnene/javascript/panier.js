const cart = [];
const cartPopup = document.getElementById("cart-popup");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-btn");

let currentPlat = {};

// Fonction pour masquer tous les autres pop-ups
function hideAllPopups(exceptPopup = null) {
  const popups = document.querySelectorAll(".popup");
  popups.forEach((popup) => {
    if (popup !== exceptPopup && !popup.classList.contains("hidden")) {
      popup.classList.add("hidden");
    }
  });
}

// Gestion des boutons "Commander"
document.querySelectorAll(".btn-commande").forEach((button) => {
  button.addEventListener("click", () => {
    const nom = button.dataset.nom;
    const prix = parseInt(button.dataset.prix);
    const image = button.dataset.image;

    currentPlat = { nom, prix, image };

    document.getElementById("platNom").textContent = nom;
    document.getElementById("platImage").src = image;
    document.getElementById("platPrix").textContent = prix;
    document.getElementById("quantite").value = 1;
    document.getElementById("total").textContent = prix;

    const commandePopup = document.getElementById("commandePopup");
    hideAllPopups(commandePopup);
    commandePopup.classList.remove("hidden");
  });
});

// Gestion du bouton "Ajouter au panier"
document.getElementById("btnAjouter").addEventListener("click", () => {
  const quantite = parseInt(document.getElementById("quantite").value);
  const nom = currentPlat.nom;
  const prix = currentPlat.prix;
  const image = currentPlat.image;
  const existingItem = cart.find((item) => item.nom === nom);
  if (existingItem) {
    existingItem.quantite += quantite;
  } else {
    cart.push({ nom, prix, image, quantite });
  }

  updateCartDisplay();
  document.getElementById("commandePopup").classList.add("hidden"); // Fermer après ajout
});

// Mettre à jour l’affichage du panier
function updateCartDisplay() {
  cartItemsContainer.innerHTML = "";
  let total = 0;
  let itemCount = 0;

  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item-colonne";
    itemDiv.innerHTML = `
      <div class="divider"></div>
      <img src="${item.image}" style="width:40px;height:40px;" />
      <p>${item.nom}</p>
      <input type="number" min="1" value="${
        item.quantite
      }" data-index="${index}" class="quantity-input" />
      <p class="item-total" data-index="${index}">${
      item.prix * item.quantite
    } FCFA</p>
      <button class="remove-item" data-index="${index}">Supprimer</button>
    `;
    cartItemsContainer.appendChild(itemDiv);

    total += item.prix * item.quantite;
    itemCount += item.quantite;
  });

  cartTotal.textContent = `${total} FCFA`;
  cartCount.textContent = `Panier (${itemCount})`;

  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = e.target.getAttribute("data-index");
      let value = parseInt(e.target.value);
      if (isNaN(value) || value < 1) value = 1;
      cart[idx].quantite = value;

      const itemTotal = document.querySelector(
        `.item-total[data-index="${idx}"]`
      );
      if (itemTotal) {
        itemTotal.textContent = `${cart[idx].prix * cart[idx].quantite} FCFA`;
      }

      let newTotal = 0;
      let newCount = 0;
      cart.forEach((item) => {
        newTotal += item.prix * item.quantite;
        newCount += item.quantite;
      });
      cartTotal.textContent = `${newTotal} FCFA`;
      cartCount.textContent = `Panier (${newCount})`;
    });
  });

  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      cart.splice(idx, 1);
      updateCartDisplay();
    });
  });
}

// Gestion des boutons du panier
const cartBtn = document.getElementById("cart-btn");
const closeBtn = document.getElementById("close-cart");
const confirmBtn = document.getElementById("confirm-cart");

cartBtn.addEventListener("click", () => {
  if (!localStorage.getItem("token")) {
    showPopup("Veuillez vous connecter pour accéder au panier.", true);
    // Afficher le pop-up de login après l’alerte
    setTimeout(() => {
      const loginModal = document.getElementById("login");
      if (loginModal) {
        hideAllPopups(loginModal);
        loginModal.classList.remove("hidden");
      }
    }, 3000); // Délai pour laisser l’alerte visible
    return;
  }
  hideAllPopups(cartPopup);
  cartPopup.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  cartPopup.classList.add("hidden");
});

// Gestion de la confirmation de la commande
confirmBtn.addEventListener("click", async () => {
  if (cart.length === 0) {
    showPopup("Votre panier est vide !", true);
    return;
  }

  const orderData = {
    items: cart,
    total: cart.reduce((sum, item) => sum + item.prix * item.quantite, 0),
    paymentMethod: selectedPaymentMethod || "Non spécifié",
    clientNom: document.getElementById("clientNom").value || "Anonyme",
    clientTel: document.getElementById("clientTel").value || "Non fourni",
    commentaire: document.getElementById("commentaire").value || "",
  };

  console.log("Données envoyées au serveur:", orderData);

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
      `Commande confirmée avec succès ! Méthode de paiement: ${orderData.paymentMethod}`,
      false
    );

    cart.length = 0;
    updateCartDisplay();
    cartPopup.classList.add("hidden");
  } catch (error) {
    console.error("Erreur lors de la confirmation:", error);
    showPopup(`Erreur: ${error.message}`, true);
  }
});

// Fonction pour afficher une notification pop-up
function showPopup(message, isError) {
  const popup = document.createElement("div");
  popup.className = "pop-up";
  popup.textContent = message;
  if (isError) popup.style.backgroundColor = "#e63946";
  document.body.appendChild(popup);
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
    popup.remove();
  }, 3000);
}
