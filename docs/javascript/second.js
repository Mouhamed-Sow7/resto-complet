// menu burger

const test_one = document.querySelector(".nav-drop");
const Mybutton = document.querySelector(".menu-btn");

function ToggleMenu() {
  test_one.classList.toggle("open-off");
}
Mybutton.addEventListener("click", ToggleMenu);

// ajout d'un style active pour chaque link
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-drop a:not(.login a)");

  navLinks.forEach((lien) => {
    lien.addEventListener("click", function () {
      navLinks.forEach((nav) => nav.classList.remove("active"));

      this.classList.add("active");
    });
  });
});
// animation de section
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

// Récupère tous les liens d'ancre
const links = document.querySelectorAll('a[href^="#"]');

// Hauteur de ton header fixe
const offset = 120; // ex : 80px de header

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const position = target.offsetTop - offset;

      window.scrollTo({
        top: position,
        behavior: "smooth",
      });
    }
  });
});
document.getElementById("mn-btn").addEventListener("click", () => {
  document.getElementById("commander").scrollIntoView({ behavior: "smooth" });
});

function ouvrirPopup(nom, prix, image) {
  document.getElementById("platNom").textContent = nom;
  document.getElementById("platPrix").textContent = prix;
  document.getElementById("platImage").src = image;
  document.getElementById("total").textContent = prix;

  document.getElementById("quantite").value = 1;
  document.getElementById("commandePopup").classList.remove("hidden");

  gererCalcul(prix);
}

function gererCalcul(prix) {
  const quantiteInput = document.getElementById("quantite");
  const totalDisplay = document.getElementById("total");

  // ⚠️ Pour éviter d'empiler les events à chaque ouverture
  quantiteInput.removeEventListener("input", quantiteInput._handler); // remove old handler if any

  const handler = () => {
    const quantite = parseInt(quantiteInput.value);
    const total = prix * (isNaN(quantite) ? 1 : quantite);
    totalDisplay.textContent = total;
  };

  quantiteInput._handler = handler; // attach it for removal
  quantiteInput.addEventListener("input", handler);
}

// 🧠 Gestion des boutons Commander
document.querySelectorAll(".btn-commande").forEach((btn) => {
  btn.addEventListener("click", () => {
    const nom = btn.dataset.nom;
    const prix = parseInt(btn.dataset.prix);
    const image = btn.dataset.image;

    ouvrirPopup(nom, prix, image);
  });
});

// ❌ Fermer le pop-up
document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("commandePopup").classList.add("hidden");
});
let panier = [];

function ajouterAuPanier(nom, prix, image, quantite = 1) {
  const existant = panier.find((item) => item.nom === nom);

  if (existant) {
    existant.quantite += quantite;
  } else {
    panier.push({ nom, prix, image, quantite });
  }

  afficherPanier();
}

function afficherPanier() {
  const panierContainer = document.getElementById("panierItems");
  panierContainer.innerHTML = "";
  let totalGlobal = 0;

  panier.forEach((item, index) => {
    const ligne = document.createElement("div");
    ligne.className = "item-panier";

    ligne.innerHTML = `
        <img src="${item.image}" width="50">
        <span>${item.nom}</span>
        <input type="number" min="1" value="${
          item.quantite
        }" data-index="${index}" class="input-quantite">
        <strong>${item.prix * item.quantite} FCFA</strong>
        <button class="btn-supprimer" data-index="${index}">❌</button>
      `;

    panierContainer.appendChild(ligne);
    totalGlobal += item.prix * item.quantite;
  });

  document.getElementById("totalPanier").textContent = totalGlobal + " FCFA";

  // Écouter les changements de quantité
  document.querySelectorAll(".input-quantite").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = e.target.dataset.index;
      const nouvelleQuantite = parseInt(e.target.value);
      if (nouvelleQuantite > 0) {
        panier[index].quantite = nouvelleQuantite;
        afficherPanier(); // re-render
      }
    });
  });

  // Écouter les suppressions
  document.querySelectorAll(".btn-supprimer").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      panier.splice(index, 1); // supprimer l'article
      afficherPanier();
    });
  });
}

function ouvrirPopup(nom, prix, image) {
  document.getElementById("platNom").textContent = nom;
  document.getElementById("platPrix").textContent = prix;
  document.getElementById("platImage").src = image;
  document.getElementById("quantite").value = 1;

  document.getElementById("commandePopup").classList.remove("hidden");

  // Bouton "Ajouter"
  const btnAjouter = document.getElementById("btnAjouter");
  const handler = () => {
    const quantite = parseInt(document.getElementById("quantite").value);
    ajouterAuPanier(nom, prix, image, quantite);
    document.getElementById("commandePopup").classList.add("hidden");
    btnAjouter.removeEventListener("click", handler);
  };

  btnAjouter.addEventListener("click", handler);
}

document.querySelectorAll(".btn-commande").forEach((btn) => {
  btn.addEventListener("click", () => {
    const nom = btn.dataset.nom;
    const prix = parseInt(btn.dataset.prix);
    const image = btn.dataset.image;
    ouvrirPopup(nom, prix, image);
  });
});

document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("commandePopup").classList.add("hidden");
});
//
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");
const cartPopup = document.getElementById("cart-popup");

openCartBtn.addEventListener("click", () => {
  cartPopup.classList.toggle("hiddend");
  console.log("Panier ouvert");
});

closeCartBtn.addEventListener("click", () => {
  cartPopup.classList.add("hiddend");
});
//
function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  cartItemsContainer.innerHTML = ""; // reset affichage
  let total = 0;

  panier.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <p>${item.name}</p>
      <p>${item.price} x 
        <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="quantity-input"/>
      </p>
      <button class="remove-btn" data-index="${index}">❌</button>
    `;

    cartItemsContainer.appendChild(itemEl);
    total += item.price * item.quantity;
  });

  cartCount.textContent = panier.length;
  cartTotal.textContent = `${total} CFA`;
}
//
document.getElementById("cart-items").addEventListener("input", function (e) {
  if (e.target.classList.contains("quantity-input")) {
    const index = e.target.getAttribute("data-index");
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 1) {
      panier[index].quantity = newQuantity;
      updateCartDisplay();
    }
  }
});

document.getElementById("cart-items").addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-btn")) {
    const index = e.target.getAttribute("data-index");
    panier.splice(index, 1);
    updateCartDisplay();
  }
});
//
let panier = [];

function ajouterAuPanier(nom, prix, image, quantite = 1) {
  const existant = panier.find((item) => item.nom === nom);

  if (existant) {
    existant.quantite += quantite;
  } else {
    panier.push({ nom, prix, image, quantite });
  }

  afficherPanier();
  updateCartDisplay();
}
// let cart = []; // anciennement "panier"

// function ajouterAuPanier(nom, prix, image, quantite = 1) {
//   const existant = cart.find((item) => item.name === nom);

//   if (existant) {
//     existant.quantity += quantite;
//   } else {
//     cart.push({ name: nom, price: prix, image: image, quantity: quantite });
//   }

//   updateCartDisplay(); // affiche le contenu dans le popup
//   cartPopup.classList.remove("hiddend"); // ouvre la popup
// }

function afficherPanier() {
  const panierContainer = document.getElementById("panierItems");
  panierContainer.innerHTML = "";
  let totalGlobal = 0;

  panier.forEach((item, index) => {
    const ligne = document.createElement("div");
    ligne.className = "item-panier";

    ligne.innerHTML = `
        <img src="${item.image}" width="50">
        <span>${item.nom}</span>
        <input type="number" min="1" value="${
          item.quantite
        }" data-index="${index}" class="input-quantite">
        <strong>${item.prix * item.quantite} FCFA</strong>
        <button class="btn-supprimer" data-index="${index}">❌</button>
      `;

    panierContainer.appendChild(ligne);
    totalGlobal += item.prix * item.quantite;
  });

  document.getElementById("totalPanier").textContent = totalGlobal + " FCFA";

  // Écouter les changements de quantité
  document.querySelectorAll(".input-quantite").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = e.target.dataset.index;
      const nouvelleQuantite = parseInt(e.target.value);
      if (nouvelleQuantite > 0) {
        panier[index].quantite = nouvelleQuantite;
        afficherPanier(); // re-render
      }
    });
  });

  // Écouter les suppressions
  document.querySelectorAll(".btn-supprimer").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      panier.splice(index, 1); // supprimer l'article
      afficherPanier();
    });
  });
}
// const boutonPanier = document.getElementById("boutonPanier"); // Le bouton qui ouvre le panier
