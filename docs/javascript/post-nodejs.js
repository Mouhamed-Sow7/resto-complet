document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("reservationForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const tableSelect = document.getElementById("table");
      const selectedOption = tableSelect.options[tableSelect.selectedIndex];
      const tableNumber = selectedOption.value;
      const tableSection = selectedOption.parentElement.label.includes(
        "En Haut"
      )
        ? "En Haut (VIP)"
        : "En Bas (Normal)";

      const reservationData = {
        name: document.getElementById("prenom").value,
        email: document.getElementById("email").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        table_number: tableNumber,
        table_section: tableSection,
        tel: document.getElementById("tel").value,
        personnes: document.getElementById("personnes").value,
      };

      try {
        const response = await fetch("http://localhost:5000/api/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "admin123",
          },
          body: JSON.stringify(reservationData),
        });

        const result = await response.json();
        const responseDiv = document.getElementById("response");
        if (response.ok) {
          responseDiv.className = "success";
          responseDiv.textContent = result.message || "Réservation réussie !";
          responseDiv.style.display = "block";
          setTimeout(() => (responseDiv.style.display = "none"), 3000);
          loadReservations();
          document.getElementById("reservationForm").reset();
        } else {
          responseDiv.className = "error";
          responseDiv.textContent = result.error || "Erreur inconnue";
          responseDiv.style.display = "block";
          setTimeout(() => (responseDiv.style.display = "none"), 3000);
        }
      } catch (error) {
        console.error("Erreur:", error);
        const responseDiv = document.getElementById("response");
        responseDiv.className = "error";
        responseDiv.textContent = "Erreur de connexion au serveur.";
        responseDiv.style.display = "block";
        setTimeout(() => (responseDiv.style.display = "none"), 3000);
      }
    });

  async function loadReservations() {
    try {
      console.log("Chargement des réservations...");
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "GET",
        headers: {
          Authorization: "admin123",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Erreur HTTP : ${response.status} - ${response.statusText}`
        );
      }
      const reservations = await response.json();
      console.log("Réservations récupérées:", reservations);

      const tbody = document.getElementById("reservationsBody");
      tbody.innerHTML = "";
      if (reservations.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="7">Aucune réservation trouvée.</td></tr>';
        return;
      }

      reservations.forEach((res) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${res.name || "N/A"}</td>
          <td>${res.email || "N/A"}</td>
          <td>${res.date ? new Date(res.date).toLocaleDateString() : "N/A"}</td>
          <td>${res.time || "N/A"}</td>
          <td>${res.table_number || "N/A"}</td>
          <td>${res.table_section || "N/A"}</td>
          <td><button class="cancel-btn" data-id="${
            res.id || ""
          }">Annuler</button></td>
        `;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".cancel-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-id");
          await showCancelConfirmation(id);
        });
      });
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      const tbody = document.getElementById("reservationsBody");
      tbody.innerHTML = `<tr><td colspan="7">Erreur: ${error.message}</td></tr>`;
    }
  }

  function showCancelConfirmation(id) {
    const confirmationDiv = document.createElement("div");
    confirmationDiv.className = "custom-confirmation";
    confirmationDiv.innerHTML = `
      <div class="confirmation-content">
        <p>Voulez-vous annuler cette réservation ?</p>
        <div class="confirmation-buttons">
          <button class="confirm-yes" data-id="${id}"><i class="fas fa-check"></i> Oui</button>
          <button class="confirm-no"><i class="fas fa-times"></i> Non</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmationDiv);

    document
      .querySelector(".confirm-yes")
      .addEventListener("click", async () => {
        await cancelReservation(id);
        document.body.removeChild(confirmationDiv);
      });

    document.querySelector(".confirm-no").addEventListener("click", () => {
      document.body.removeChild(confirmationDiv);
    });
  }

  async function cancelReservation(id) {
    console.log(`Tentative d'annulation de la réservation ID: ${id}`);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "admin123",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const result = await response.json();
      const successAlert = document.getElementById("successAlert");
      successAlert.style.display = "block";
      setTimeout(() => {
        successAlert.style.display = "none";
      }, 3000);
      loadReservations();
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      const responseDiv = document.getElementById("response");
      responseDiv.className = "error";
      responseDiv.textContent = "Erreur lors de l'annulation: " + error.message;
      responseDiv.style.display = "block";
      setTimeout(() => (responseDiv.style.display = "none"), 3000);
    }
  }

  loadReservations();
  // Commenté pour éviter des déclenchements inattendus
  // setInterval(loadReservations, 5000);
});
document.addEventListener("DOMContentLoaded", () => {
  const reservationForm = document.getElementById("reservationForm");
  const responseElement = document.getElementById("response");

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const validatePrenom = (value) => value.trim().length >= 2;
  const validateTel = (value) => {
    const telPattern = /^\+?\d{9,15}$/;
    return telPattern.test(value.trim());
  };
  const validateEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value.trim());
  };
  const validatePersonnes = (value) => !!value;
  const validateDate = (value) => !!value;
  const validateTime = (value) => !!value;
  const validateTable = (value) => !!value;

  const validateField = (input, validateFn) => {
    const inputWrapper = input.closest(".input-wrapper");
    const isValid = validateFn(input.value);
    if (!isValid) {
      inputWrapper.classList.add("error");
    } else {
      inputWrapper.classList.remove("error");
    }
    return isValid;
  };

  const inputs = {
    prenom: document.getElementById("prenom"),
    tel: document.getElementById("tel"),
    email: document.getElementById("email"),
    personnes: document.getElementById("personnes"),
    date: document.getElementById("date"),
    time: document.getElementById("time"),
    table: document.getElementById("table"),
  };

  const validators = {
    prenom: validatePrenom,
    tel: validateTel,
    email: validateEmail,
    personnes: validatePersonnes,
    date: validateDate,
    time: validateTime,
    table: validateTable,
  };

  Object.keys(inputs).forEach((key) => {
    const input = inputs[key];
    const validateWithDebounce = debounce(() => {
      validateField(input, validators[key]);
    }, 500);

    input.addEventListener("input", validateWithDebounce);
    if (input.tagName === "SELECT") {
      input.addEventListener("change", validateWithDebounce);
    }
  });

  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputWrappers = document.querySelectorAll(".input-wrapper");
    inputWrappers.forEach((wrapper) => wrapper.classList.remove("error"));

    let hasError = false;
    Object.keys(inputs).forEach((key) => {
      const input = inputs[key];
      const isValid = validateField(input, validators[key]);
      if (!isValid) hasError = true;
    });

    if (!hasError) {
      const formData = new FormData(reservationForm);
      try {
        const response = await fetch("http://localhost:5000/api/reservations", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (response.ok) {
          responseElement.classList.add("success");
          responseElement.textContent = "Réservation réussie !";
        } else {
          responseElement.classList.add("error");
          responseElement.textContent = "Erreur lors de la réservation.";
        }
      } catch (error) {
        console.error("Erreur:", error);
        responseElement.classList.add("error");
        responseElement.textContent = "Erreur réseau.";
      }
    }
  });
});
