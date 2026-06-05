const featuredContainer = document.querySelector("#featured-links");
const quickContainer = document.querySelector("#quick-links");

function createFeaturedCard(item) {
  const link = document.createElement("a");
  link.className = `feature-card feature-card--${item.theme || "green"}`;
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${item.title}: ${item.description}`);

  link.innerHTML = `
    <img class="feature-card__image" src="${item.image}" alt="" loading="lazy">
    <span class="feature-card__tag">${item.tag || "Destaque"}</span>
    <div class="feature-card__body">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <span class="feature-card__cta">${item.cta || "Acessar"} <span aria-hidden="true">↗</span></span>
    </div>
  `;

  return link;
}

function createQuickLink(item) {
  const link = document.createElement("a");
  link.className = "quick-card";
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${item.title}: ${item.description}`);

  link.innerHTML = `
    <img class="quick-card__image" src="${item.image}" alt="" loading="lazy">
    <span class="quick-card__content">
      <strong>${item.title}</strong>
      <small>${item.description}</small>
    </span>
    <span class="quick-card__arrow" aria-hidden="true">↗</span>
  `;

  return link;
}

async function loadContent() {
  const response = await fetch("content.json");
  if (!response.ok) {
    throw new Error("Não foi possível carregar content.json");
  }
  return response.json();
}

loadContent()
  .then((content) => {
    content.featured.forEach((item) => featuredContainer.append(createFeaturedCard(item)));
    content.quickLinks.forEach((item) => quickContainer.append(createQuickLink(item)));
  })
  .catch((error) => {
    document.body.classList.add("has-error");
    featuredContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
  });
