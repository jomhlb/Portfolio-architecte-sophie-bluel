/** Formulaire */
  const form = document.getElementById("login-form");
  const error = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Empêche le rechargement

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
        // ✅ Connexion réussie
        localStorage.setItem("token", data.token); // on stocke le token
        window.location.href = "index.html"; // redirection vers la page d'accueil
      } else {
        // ❌ Connexion échouée
        error.textContent = "E-mail ou mot de passe incorrect.";
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      error.textContent = "Une erreur est survenue. Réessayez plus tard.";
    }
  });

const token = localStorage.getItem("token");
const adminBanner = document.getElementById("admin-banner");

if (token) {
  adminBanner.classList.remove("hidden");
}
    