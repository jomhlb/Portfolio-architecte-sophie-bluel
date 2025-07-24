// Mise en place du système de connexion
// FORMULAIRE
const form = document.getElementById("login-form");
const error = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("mdp").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Connexion réussie
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      // Connexion échouée
      error.textContent = "E-mail ou mot de passe incorrect.";
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    error.textContent = "Une erreur est survenue. Réessayez plus tard.";
  }
});


