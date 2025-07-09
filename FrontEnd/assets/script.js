fetch("http://localhost:5678/api/works") 
  .then(response => response.json())
  .then(data => {
    const gallery = document.querySelector(".gallery");
    const filtresContainer = document.querySelector(".filtres-galery");

  /** Fonction pour afficher les projets selon la catégorie */
    function afficherProjets(categorie) {
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

  /** Récupération des catégories uniques */
    const categories = new Set();
    data.forEach(item => categories.add(item.category.name));
    const categoriesArray = ["Tous", ...categories];

  /** Génération dynamique des boutons filtres */
    filtresContainer.innerHTML = "";

    categoriesArray.forEach((categorie, index) => {
    const button = document.createElement("button");
    button.textContent = categorie;
    button.classList.add("filtre-btn");
      
  if (index === 0) {
    button.classList.add("active");
  }

    button.addEventListener("click", () => {
    afficherProjets(categorie);

    const boutons = document.querySelectorAll(".filtre-btn");
    boutons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });

    filtresContainer.appendChild(button);
  });

/** Afficher tous les projets par défaut */
  afficherProjets("Tous");
  })

  .catch(error => {
    console.error("Erreur lors de la récupération des travaux :", error);
  });
    
