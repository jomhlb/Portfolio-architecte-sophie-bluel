document.addEventListener("DOMContentLoaded", () => {
  // SÉLECTION DES ÉLÉMENTS HTML
  const gallery = document.querySelector(".gallery");
  const filtresContainer = document.querySelector(".filtres-galery");
  const adminBanner = document.getElementById("admin-banner");
  const modifierBtn = document.getElementById("open-modal-btn");
  const loginLink = document.querySelector('nav ul li a.login-link');

  const modal = document.getElementById("modal");
  const closeModalBtn = document.querySelector(".modal-close");

  const modalViewGallery = document.getElementById("modal-view-gallery");
  const modalViewAddPhoto = document.getElementById("modal-view-add-photo");

  const toAddPhotoViewBtn = document.getElementById("to-add-photo-view");
  const backToGalleryBtn = document.getElementById("back-to-gallery");

  const form = document.getElementById("add-photo-form");

  // FORMULAIRE : éléments spécifiques pour l'ajout de photo
  const fileInput = document.getElementById("file-photo");
  const previewImage = document.getElementById("image-preview");
  const label = document.getElementById("photo-file");
  const info = document.querySelector(".upload-info");
  const uploadZone = document.querySelector(".upload-zone");

// Filtrage & affichage des projets
  // FONCTION POUR AFFICHER LES PROJETS PAR CATÉGORIE 
  function afficherProjets(data, categorie) {
    gallery.innerHTML = "";
    data.forEach(item => {
      if (categorie === "Tous" || item.category.name === categorie) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.title;
        img.setAttribute("data-id", item.id);

        const caption = document.createElement("figcaption");
        caption.textContent = item.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
      }
    });
  }

  // RÉCUPÉRATION DES CATÉGORIES POUR FORMULAIRE
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

  // RÉCUPÉRATION DES PROJETS + CRÉATION DES BOUTONS FILTRES
  fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(data => {
      // Création des filtres
      const categories = new Set(data.map(item => item.category.name));
      const categoriesArray = ["Tous", ...categories];

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

      // Affichage initial
      afficherProjets(data, "Tous");
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des travaux :", error);
    });

// -----------------------------------------------------------------------------------------------------------------------------

// Mise en place du système de connexion
  // MODE ÉDITION SI CONNECTÉ
  const token = localStorage.getItem("token");

  if (token) {
    console.log("Utilisateur connecté, affichage bannière admin");
    if (adminBanner) {
      adminBanner.style.display = "block";
      adminBanner.classList.remove("hidden");
      document.body.classList.add("with-banner");
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

    if (adminBanner) adminBanner.style.display = "none";
  }

// -----------------------------------------------------------------------------------------------------------------------------

// Fonctionnement de l’ajout de travaux à la galerie
  // ÉVÉNEMENTS DE LA MODALE
    // Ouvrir modale
    modifierBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      modalViewGallery.classList.remove("hidden");
      modalViewAddPhoto.classList.add("hidden");

    // Nettoyer galerie modale
    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = "";

    // Recréer les images
    document.querySelectorAll(".gallery figure").forEach(figure => {
      const clone = figure.cloneNode(true);
      const caption = clone.querySelector("figcaption");
      if (caption) caption.remove();

      const img = figure.querySelector("img");
      const workId = img?.dataset?.id;
      clone.dataset.id = workId;
      clone.classList.add("modal-thumbnail");

      // Bouton suppression
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
      deleteBtn.setAttribute("aria-label", "Supprimer le projet");

      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = confirm("Voulez-vous vraiment supprimer ce projet ?");
        if (!confirmed) return;

        try {
          const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            clone.remove();
            const imageToRemove = document.querySelector(`.gallery img[data-id="${workId}"]`);
            if (imageToRemove) imageToRemove.closest("figure").remove();
          } else {
            alert("Erreur lors de la suppression du projet.");
          }
        } catch (error) {
          console.error("Erreur réseau lors de la suppression :", error);
          alert("Une erreur est survenue.");
        }
      });

      clone.appendChild(deleteBtn);
      modalGallery.appendChild(clone);
    });
  });

  // Fermer modale (croix)
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  });

  // Fermer modale en cliquant à l’extérieur
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  });

  // Aller à l'ajout de photo
  toAddPhotoViewBtn.addEventListener("click", () => {
    resetImagePreview();
    modalViewGallery.classList.add("hidden");
    modalViewAddPhoto.classList.remove("hidden");
  });

  // Retour galerie depuis ajout photo
  backToGalleryBtn.addEventListener("click", () => {
    resetImagePreview();
    modalViewAddPhoto.classList.add("hidden");
    modalViewGallery.classList.remove("hidden");
  });

  // Aperçu image dans formulaire ajout photo
  function afficherImagePreview(src) {
  previewImage.src = src;
  previewImage.style.display = "block";

  label.style.display = "none";
  fileInput.style.display = "none";
  info.style.display = "none";
  uploadZone.style.display = "none";
}

  // RESET Aperçu image + input fichier dans le formulaire ajout photo
  function resetImagePreview() {
    previewImage.src = "";
    previewImage.style.display = "none";

    label.style.display = "inline-block";
    fileInput.style.display = "none";
    info.style.display = "block";
    uploadZone.style.display = "block";

    fileInput.value = "";
  }

  fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.onload = (e) => {
      afficherImagePreview(e.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    resetImagePreview();
  }
});

  // Soumission du formulaire d'ajout de photo
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const file = fileInput.files[0];
    const title = document.getElementById("photo-title").value.trim();
    const categoryId = document.getElementById("photo-category").value;

    if (!file || !title || !categoryId) {
      alert("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Le fichier sélectionné doit être une image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", categoryId);

    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          alert("Projet ajouté avec succès !");
          form.reset();
          resetImagePreview();

          // Rafraîchir la galerie
          return response.json();
        } else {
          throw new Error("Erreur lors de l'ajout du projet.");
        }
      })
      .then(newWork => {
        // Ajouter la nouvelle image à la galerie visible
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = newWork.imageUrl;
        img.alt = newWork.title;
        img.setAttribute("data-id", newWork.id);

        img.classList.add("gallery-img");

        const caption = document.createElement("figcaption");
        caption.textContent = newWork.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
        
        // Ajouter la nouvelle image à la galerie de la modale
        const modalGallery = document.querySelector(".modal-gallery");

        const modalFigure = document.createElement("figure");
        modalFigure.classList.add("modal-thumbnail");
        modalFigure.dataset.id = newWork.id;

        const modalImg = document.createElement("img");
        modalImg.src = newWork.imageUrl;
        modalImg.alt = newWork.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
        deleteBtn.setAttribute("aria-label", "Supprimer le projet");

        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const confirmed = confirm("Voulez-vous vraiment supprimer ce projet ?");
          if (!confirmed) return;

          try {
            const response = await fetch(`http://localhost:5678/api/works/${newWork.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              modalFigure.remove();
              const imageToRemove = document.querySelector(`.gallery img[data-id="${newWork.id}"]`);
              if (imageToRemove) imageToRemove.closest("figure").remove();
            } else {
              alert("Erreur lors de la suppression du projet.");
            }
          } catch (error) {
            console.error("Erreur réseau lors de la suppression :", error);
            alert("Une erreur est survenue.");
          }
        });

        modalFigure.appendChild(modalImg);
        modalFigure.appendChild(deleteBtn);
        modalGallery.appendChild(modalFigure);

        // Retour à la vue galerie dans la modale
        modalViewAddPhoto.classList.add("hidden");
        modalViewGallery.classList.remove("hidden");
      })
      .catch(error => {
        console.error(error);
        alert("Une erreur est survenue lors de l'ajout du projet.");
      });
  });
});