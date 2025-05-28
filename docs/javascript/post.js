// gestion table
document
  .getElementById("reservationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // On empêche le rechargement

    const form = e.target;
    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        showPopup(data); // Appel de la fonction de popup
        form.reset(); // On vide le formulaire
      })
      .catch((error) => {
        showPopup("Erreur de réservation 😢");
        console.error(error);
      });
  });
// style table
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className = "pop-up";
  popup.innerHTML = `<p>${message}</p>`;
  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 100);
  setTimeout(() => popup.classList.remove("show"), 4000);
  setTimeout(() => popup.remove(), 5000);
}
