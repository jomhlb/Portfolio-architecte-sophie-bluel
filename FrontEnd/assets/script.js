// RECUPERATION DES ELEMENTS HTML
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const filtresContainer = document.querySelector(".filtres-galery");
  const adminBanner = document.getElementById("admin-banner");
  const modifierBtn = document.getElementById("open-modal-btn");
  const loginLink = document.querySelector('nav ul li a.login-link');

  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("open-modal-btn");
  const closeModalBtn = document.querySelector(".modal-close");

  const modalViewGallery = document.getElementById("modal-view-gallery");
  const modalViewAddPhoto = document.getElementById("modal-view-add-photo");

  const toAddPhotoViewBtn = document.getElementById("to-add-photo-view");
  const backToGalleryBtn = document.getElementById("back-to-gallery");

  // RÉCUPÉRATION DES CATÉGORIES POUR LE FORMULAIRE D'AJOUT
fetch("http://localhost:5678/api/categories")
  .then(response => response.json())
  .then(categories => {
    const categorySelect = document.getElementById("photo-category");
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des catégories :", error);
  });
  
  // OUVERTURE DE LA MODALE
  openModalBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    modalViewGallery.classList.remove("hidden");
    modalViewAddPhoto.classList.add("hidden");
  });

    // FERMETURE MODALE AVEC LA CROIX
    closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  });

    // FERMETURE DE LA MODALE EN CLIQUANT EN DEHORS
    modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  });

    // AJOUT PHOTO
    toAddPhotoViewBtn.addEventListener("click", () => {
    modalViewGallery.classList.add("hidden");
    modalViewAddPhoto.classList.remove("hidden");
  });

    // GALERIE PHOTO
    // Retour en arrière dans la galerie photo
    backToGalleryBtn.addEventListener("click", () => {
    modalViewAddPhoto.classList.add("hidden");
    modalViewGallery.classList.remove("hidden");
  });

    // Ouverture de la modale sur galerie photo
    openModalBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    modalViewGallery.classList.remove("hidden");
    modalViewAddPhoto.classList.add("hidden");

    // Vider la galerie modale
    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = "";

    // Récupération des images dans la galerie + clônage des images dans la modale
    document.querySelectorAll(".gallery figure").forEach(figure => {
    const clone = figure.cloneNode(true);

    // Suppression des descriptions images
    const caption = clone.querySelector("figcaption");
    if (caption) caption.remove();

    clone.classList.add("modal-thumbnail")
    modalGallery.appendChild(clone);
  });
});

  // AFFICHAGE DES PROJETS DANS CATEGORIES
  function afficherProjets(data, categorie) {
    gallery.innerHTML = "";
    data.forEach(item => {
      if (categorie === "Tous" || item.category.name === categorie) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.title;

        const caption = document.createElement("figcaption");
        caption.textContent = item.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
      }
    });
  }

  // RECUPERATION DES DONNEES VIA API
  fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(data => {
      // RECUPERATION DES CATEGORIES
      const categories = new Set(data.map(item => item.category.name));
      const categoriesArray = ["Tous", ...categories];

      // BOUTONS FILTRES
      filtresContainer.innerHTML = "";
      categoriesArray.forEach((categorie, index) => {
        const button = document.createElement("button");
        button.textContent = categorie;
        button.classList.add("filtre-btn");
        if (index === 0) button.classList.add("active");

        button.addEventListener("click", () => {
          afficherProjets(data, categorie);
          document.querySelectorAll(".filtre-btn").forEach(btn => btn.classList.remove("active"));
          button.classList.add("active");
        });

        filtresContainer.appendChild(button);
      });

      // AFFICHAGE TOUS PAR DEFAUT
      afficherProjets(data, "Tous");
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des travaux :", error);
    });

  // AFFICHAGE MODE EDITION SI CONNEXION REUSSIE
  const token = localStorage.getItem("token");
  console.log("Token dans localStorage :", token);

  if (token) {
    console.log("Utilisateur connecté, affichage bannière admin");
    if (adminBanner) {
      adminBanner.style.display = "block";
      console.log("Bannière admin trouvée et affichée");
      document.getElementById("admin-banner").classList.remove("hidden");
      document.body.classList.add("with-banner");
    } else {
      console.warn("Bannière admin NON trouvée dans le DOM");
    }

    if (modifierBtn) modifierBtn.style.display = "inline-block";
    if (filtresContainer) filtresContainer.style.display = "none";

    if (loginLink) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.classList.remove("login-link");
      loginLink.classList.add("logout-style");
      loginLink.addEventListener("click", e => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "index.html";
      });
    }
  } else {
    console.log("Utilisateur non connecté, masquage bannière admin");

    if (modifierBtn) modifierBtn.style.display = "none";
    if (filtresContainer) filtresContainer.style.display = "block";

    if (loginLink) {
      loginLink.textContent = "login";
      loginLink.href = "login.html";
      loginLink.classList.add("login-link");
    }

    if (adminBanner) {
      adminBanner.style.display = "none";
      console.log("Bannière admin masquée");
    } else {
      console.warn("Bannière admin NON trouvée dans le DOM");
    }
  }
});
