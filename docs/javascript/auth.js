document.addEventListener("DOMContentLoaded", () => {
  // Fonction pour masquer tous les autres pop-ups
  function hideAllPopups(exceptPopup = null) {
    const popups = document.querySelectorAll(".popup");
    popups.forEach((popup) => {
      if (popup !== exceptPopup && !popup.classList.contains("hidden")) {
        popup.classList.add("hidden");
      }
    });
  }

  // Fonction pour gérer la visibilité des sections et pop-ups
  function updateSectionVisibility(
    role,
    isLoggedIn,
    preserveLoginModal = false
  ) {
    const sections = document.querySelectorAll(".section");
    const popups = document.querySelectorAll(".popup:not(#login)");
    const loginModal = document.getElementById("login");

    // Masquer toutes les sections et popups par défaut, mais seulement si nécessaire
    sections.forEach((section) => {
      if (!section.classList.contains("hidden")) {
        section.classList.add("hidden");
      }
    });
    popups.forEach((popup) => {
      if (!popup.classList.contains("hidden")) {
        popup.classList.add("hidden");
      }
    });

    // Masquer explicitement la modale de login, sauf si preserveLoginModal est true
    if (
      loginModal &&
      !loginModal.classList.contains("hidden") &&
      !preserveLoginModal
    ) {
      loginModal.classList.add("hidden");
    }

    if (!isLoggedIn) {
      // Visiteur : voir toutes les sections publiques, sauf #login
      sections.forEach((section) => {
        if (section.classList.contains("public") && section !== loginModal) {
          section.classList.remove("hidden");
        }
      });
    } else {
      // Connecté (admin ou membre)
      sections.forEach((section) => {
        const isPublic = section.classList.contains("public");
        const isAdminOnly = section.classList.contains("admin-only");
        const isMemberOnly = section.classList.contains("member-only");

        if (
          isPublic ||
          (isAdminOnly && role === "admin") ||
          (isMemberOnly && role === "membre")
        ) {
          section.classList.remove("hidden");
        }
      });
    }
  }

  // Éléments de la modale
  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("login");
  const loginForm = document.getElementById("loginForm");
  const closeBtn = document.querySelector("#login .close-btn");
  const loginError = document.getElementById("loginError");

  // Vérification des éléments nécessaires
  if (!loginBtn || !loginModal || !loginForm || !closeBtn || !loginError) {
    console.error(
      "Un ou plusieurs éléments de la modale de connexion sont manquants."
    );
    return;
  }

  // Gestion de l'état initial du bouton de connexion/déconnexion
  if (localStorage.getItem("token")) {
    loginBtn.textContent = "Déconnexion";
    updateSectionVisibility(localStorage.getItem("role"), true);
  } else {
    loginBtn.textContent = "Se Connecter";
    updateSectionVisibility(null, false);
  }

  // Gestion du bouton de connexion/déconnexion
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Ajouté pour éviter tout comportement par défaut
    if (localStorage.getItem("token")) {
      // Déconnexion
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      loginBtn.textContent = "Se Connecter";
      showPopup("Déconnexion réussie !", false);
      updateSectionVisibility(null, false);
      window.location.reload(); // Recharge pour réinitialiser l'état
    } else {
      // Afficher la modale de connexion
      hideAllPopups(loginModal);
      loginModal.classList.remove("hidden");
      updateSectionVisibility(null, false, true);
      console.log("Pop-up login affiché :", loginModal.classList);
    }
  });

  // Fermer la modale au clic sur la croix
  closeBtn.addEventListener("click", () => {
    loginModal.classList.add("hidden");
  });

  // Soumission du formulaire de connexion
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Erreur de connexion");
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      loginModal.classList.add("hidden");
      showPopup("Connexion réussie !", false);

      loginBtn.textContent = "Déconnexion";
      updateSectionVisibility(data.role, true);
    } catch (error) {
      loginError.textContent = error.message;
      loginError.classList.remove("hidden");
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
});
