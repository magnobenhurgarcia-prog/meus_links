const state = {
  profile: {
    image: "assets/magno.png",
  },
  featured: [],
  quickLinks: [],
};

const featuredEditor = document.querySelector("#featured-editor");
const quickEditor = document.querySelector("#quick-editor");
const featuredTemplate = document.querySelector("#featured-template");
const quickTemplate = document.querySelector("#quick-template");
const statusMessage = document.querySelector("#status-message");
const profilePreview = document.querySelector("#profile-preview");
const profileImageInput = document.querySelector("#profile-image-input");
const profileImagePicker = document.querySelector("#profile-image-picker");
const featuredThemes = ["green", "purple", "blue", "gold", "red", "dark"];
const githubConfig = {
  owner: "magnobenhurgarcia-prog",
  repo: "meus_links",
  branch: "main",
  path: "content.json",
};

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

function getToken() {
  return localStorage.getItem("magnoMiniSiteGithubToken") || "";
}

function setToken(token) {
  localStorage.setItem("magnoMiniSiteGithubToken", token);
}

function clearToken() {
  localStorage.removeItem("magnoMiniSiteGithubToken");
}

function utf8ToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function updateImagePreview(card, item) {
  const preview = card.querySelector(".image-preview");
  if (!preview) return;
  preview.src = item.image || "";
}

function updateProfilePreview() {
  profileImageInput.value = state.profile.image || "";
  profilePreview.src = state.profile.image || "assets/magno.png";
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
    profile: {
      image: content.profile?.image || "assets/magno.png",
    },
    featured: Array.isArray(content.featured) ? content.featured.map(cloneItem) : [],
    quickLinks: Array.isArray(content.quickLinks) ? content.quickLinks.map(cloneItem) : [],
  };
}

function setContent(content) {
  const normalized = normalizeContent(content);
  state.profile = normalized.profile;
  state.featured = normalized.featured;
  state.quickLinks = normalized.quickLinks;
  updateProfilePreview();
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

async function githubRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Cole e salve um token do GitHub antes de publicar.");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Erro no GitHub: ${response.status}`);
  }
  return data;
}

async function publishToGithub() {
  const { owner, repo, branch, path } = githubConfig;
  const encodedPath = encodeURIComponent(path);
  setStatus("Publicando no GitHub...");

  const currentFile = await githubRequest(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`);
  const content = JSON.stringify(state, null, 2);

  await githubRequest(`/repos/${owner}/${repo}/contents/${encodedPath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: "Atualiza conteúdo pelo editor online",
      content: utf8ToBase64(content),
      sha: currentFile.sha,
      branch,
    }),
  });

  setStatus("Publicado no GitHub. O Cloudflare deve atualizar o site em alguns instantes.");
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
  setStatus("Novo destaque adicionado. Preencha os campos e clique em Salvar alterações.");
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
  setStatus("Novo link adicionado. Preencha os campos e clique em Salvar alterações.");
});

profileImageInput.addEventListener("input", () => {
  state.profile.image = profileImageInput.value;
  updateProfilePreview();
});

profileImagePicker.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  state.profile.image = await readFileAsDataUrl(file);
  updateProfilePreview();
  setStatus("Foto do cabeçalho adicionada. Clique em Salvar alterações para publicar.");
});

document.querySelector("#save-token").addEventListener("click", () => {
  const tokenInput = document.querySelector("#github-token");
  const token = tokenInput.value.trim();
  if (!token) {
    setStatus("Cole um token antes de salvar.");
    return;
  }
  setToken(token);
  tokenInput.value = "";
  setStatus("Token salvo neste navegador.");
});

document.querySelector("#clear-token").addEventListener("click", () => {
  clearToken();
  setStatus("Token apagado deste navegador.");
});

document.querySelector("#save-changes").addEventListener("click", async () => {
  try {
    await publishToGithub();
  } catch (error) {
    setStatus(error.message);
  }
});

loadContent().catch((error) => {
  setContent({ profile: { image: "assets/magno.png" }, featured: [], quickLinks: [] });
  setStatus(`${error.message}. Recarregue a página ou tente novamente em alguns instantes.`);
});
