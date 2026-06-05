const state = {
  featured: [],
  quickLinks: [],
};

const featuredEditor = document.querySelector("#featured-editor");
const quickEditor = document.querySelector("#quick-editor");
const featuredTemplate = document.querySelector("#featured-template");
const quickTemplate = document.querySelector("#quick-template");
const statusMessage = document.querySelector("#status-message");
const featuredThemes = ["green", "purple", "blue", "gold", "red", "dark"];

function cloneItem(item) {
  return JSON.parse(JSON.stringify(item));
}

function updateHeading(card, item, fallback) {
  card.querySelector("h3").textContent = item.title || fallback;
}

function setStatus(message) {
  statusMessage.textContent = message;
  window.clearTimeout(setStatus.timeout);
  setStatus.timeout = window.setTimeout(() => {
    statusMessage.textContent = "";
  }, 4200);
}

function updateImagePreview(card, item) {
  const preview = card.querySelector(".image-preview");
  if (!preview) return;
  preview.src = item.image || "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function bindFields(card, item, listName, index, fallback) {
  card.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    field.value = item[key] || "";
    field.addEventListener("input", () => {
      state[listName][index][key] = field.value;
      updateHeading(card, state[listName][index], fallback);
      if (key === "image") updateImagePreview(card, state[listName][index]);
    });
  });

  updateImagePreview(card, item);

  card.querySelector("[data-image-picker]")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    state[listName][index].image = dataUrl;
    card.querySelector('[data-field="image"]').value = dataUrl;
    updateImagePreview(card, state[listName][index]);
    setStatus(`Imagem adicionada em "${state[listName][index].title || fallback}". Baixe o content.json para salvar.`);
  });

  card.querySelector(".remove").addEventListener("click", () => {
    state[listName].splice(index, 1);
    render();
  });
}

function renderFeatured() {
  featuredEditor.innerHTML = "";
  state.featured.forEach((item, index) => {
    const card = featuredTemplate.content.cloneNode(true).querySelector(".item-card");
    updateHeading(card, item, `Destaque ${index + 1}`);
    bindFields(card, item, "featured", index, `Destaque ${index + 1}`);
    featuredEditor.append(card);
  });
}

function renderQuickLinks() {
  quickEditor.innerHTML = "";
  state.quickLinks.forEach((item, index) => {
    const card = quickTemplate.content.cloneNode(true).querySelector(".item-card");
    updateHeading(card, item, `Link ${index + 1}`);
    bindFields(card, item, "quickLinks", index, `Link ${index + 1}`);
    quickEditor.append(card);
  });
}

function render() {
  renderFeatured();
  renderQuickLinks();
}

function normalizeContent(content) {
  return {
    featured: Array.isArray(content.featured) ? content.featured.map(cloneItem) : [],
    quickLinks: Array.isArray(content.quickLinks) ? content.quickLinks.map(cloneItem) : [],
  };
}

function setContent(content) {
  const normalized = normalizeContent(content);
  state.featured = normalized.featured;
  state.quickLinks = normalized.quickLinks;
  render();
}

async function loadContent() {
  const response = await fetch("content.json");
  if (!response.ok) throw new Error("Não foi possível carregar content.json");
  const content = await response.json();
  setContent(content);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#add-featured").addEventListener("click", () => {
  const theme = featuredThemes[state.featured.length % featuredThemes.length];
  state.featured.push({
    title: "Novo destaque",
    description: "Descrição do destaque.",
    cta: "Acessar",
    url: "https://",
    image: "assets/nova-imagem.png",
    tag: "Novo",
    theme,
  });
  render();
  featuredEditor.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
  setStatus("Novo destaque adicionado. Preencha os campos e baixe o content.json para salvar.");
});

document.querySelector("#add-quick").addEventListener("click", () => {
  state.quickLinks.push({
    title: "Novo link",
    description: "Descrição do link.",
    url: "https://",
    image: "assets/nova-imagem.png",
  });
  render();
  quickEditor.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
  setStatus("Novo link adicionado. Preencha os campos e baixe o content.json para salvar.");
});

document.querySelector("#download-json").addEventListener("click", downloadJson);

document.querySelector("#import-json").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  setContent(JSON.parse(text));
  setStatus("content.json importado com sucesso.");
});

loadContent().catch((error) => {
  setContent({ featured: [], quickLinks: [] });
  setStatus(`${error.message}. Use "Importar content.json" ou adicione novos itens manualmente.`);
});
