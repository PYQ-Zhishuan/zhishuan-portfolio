const sourceData = window.PORTFOLIO_DATA || { series: [], works: [] };
const data = sourceData;

const FEEDBACK_KEY = "capsule-portfolio-feedback-v2";
const EMOTION_POOL = [
  "像做梦",
  "被安慰",
  "有点孤独",
  "很自由",
  "想收藏",
  "有故事",
  "怪可爱的",
  "安静",
  "轻飘飘",
  "像童年",
  "想住进去",
  "有点痛",
  "很温柔",
  "不太懂但喜欢",
  "有画面感",
  "像一首歌",
  "有点荒诞",
  "想继续看",
  "适合做墙绘",
  "适合做绘本",
  "像秘密",
  "有风",
  "很柔软",
  "像旅行",
  "有点不安",
  "像夜晚",
  "想变成明信片",
  "很之栓",
];

const EMOTION_COLORS = [
  "#e8ff44",
  "#7ee7d8",
  "#ff8a6b",
  "#b9a7ff",
  "#ffd66b",
  "#9bd36a",
  "#ff9ed2",
  "#8ec8ff",
];

const imagePreloadCache = new Map();

const state = {
  filter: "all",
  query: "",
  visibleWorks: [],
  activeIndex: -1,
  heroIndex: 0,
  heroTimer: null,
};

const els = {
  heroImage: document.getElementById("heroImage"),
  heroSeries: document.getElementById("heroSeries"),
  heroTitle: document.getElementById("heroTitle"),
  heroMood: document.getElementById("heroMood"),
  heroStage: document.getElementById("heroStage"),
  heroDots: document.getElementById("heroDots"),
  randomWork: document.getElementById("randomWork"),
  seriesGrid: document.getElementById("seriesGrid"),
  filters: document.getElementById("filters"),
  searchInput: document.getElementById("searchInput"),
  resultMeta: document.getElementById("resultMeta"),
  gallery: document.getElementById("gallery"),
  modal: document.getElementById("workModal"),
  modalImage: document.getElementById("modalImage"),
  modalTitle: document.getElementById("modalTitle"),
  openOriginal: document.getElementById("openOriginal"),
  openPdf: document.getElementById("openPdf"),
  emotionVotes: document.getElementById("emotionVotes"),
  feedbackText: document.getElementById("feedbackText"),
  saveFeedback: document.getElementById("saveFeedback"),
  exportFeedback: document.getElementById("exportFeedback"),
  feedbackStatus: document.getElementById("feedbackStatus"),
  feedbackList: document.getElementById("feedbackList"),
  prevWork: document.getElementById("prevWork"),
  nextWork: document.getElementById("nextWork"),
};

const heroWorks = data.works.filter((work) => work.featured).slice(0, 8);

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getHeroWork() {
  return heroWorks[state.heroIndex % heroWorks.length] || data.works[0];
}

function getFeedbackStore() {
  try {
    return JSON.parse(window.localStorage.getItem(FEEDBACK_KEY)) || {};
  } catch {
    return {};
  }
}

function saveFeedbackStore(store) {
  window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(store));
}

function getWorkFeedback(workId) {
  const store = getFeedbackStore();
  return store[workId] || { votes: {}, notes: [] };
}

function updateWorkFeedback(workId, updater) {
  const store = getFeedbackStore();
  const current = store[workId] || { votes: {}, notes: [] };
  store[workId] = updater(current);
  saveFeedbackStore(store);
  return store[workId];
}

function setFeedbackStatus(text) {
  els.feedbackStatus.textContent = text || "";
}

function getActiveWork() {
  return state.visibleWorks[state.activeIndex];
}

function hashString(value) {
  return String(value || "").split("").reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

function getEmotionSet(work) {
  const available = [...EMOTION_POOL];
  let seed = hashString(work.id || work.title);
  const picked = [];
  while (picked.length < 9 && available.length) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const index = seed % available.length;
    picked.push(available.splice(index, 1)[0]);
  }
  return picked;
}

function preloadWorkImage(work) {
  if (!work || !work.image || imagePreloadCache.has(work.image)) return;
  const image = new Image();
  image.decoding = "async";
  image.src = work.image;
  imagePreloadCache.set(work.image, image);
}

function renderHero() {
  const work = getHeroWork();
  if (!work) return;

  els.heroImage.classList.remove("is-swapping");
  window.requestAnimationFrame(() => els.heroImage.classList.add("is-swapping"));
  els.heroImage.src = work.image;
  els.heroImage.alt = work.title;
  els.heroSeries.textContent = work.seriesName;
  els.heroTitle.textContent = work.title;
  els.heroMood.textContent = "你会怎么读它";

  els.heroDots.innerHTML = heroWorks
    .map(
      (_, index) =>
        `<span class="${index === state.heroIndex % heroWorks.length ? "active" : ""}"></span>`
    )
    .join("");
}

function startHeroLoop() {
  if (heroWorks.length < 2) return;
  window.clearInterval(state.heroTimer);
  state.heroTimer = window.setInterval(() => {
    state.heroIndex = (state.heroIndex + 1) % heroWorks.length;
    renderHero();
  }, 5200);
}

function renderSeries() {
  const introCards = [
    {
      title: "先看图",
      text: "我先不替作品解释太多。你可以按自己的感觉看，也可以点开慢慢放大。",
    },
    {
      title: "选一种感觉",
      text: "如果某张图让你停住，可以点一个情绪按钮。它会帮我知道哪些画面真的被感受到了。",
    },
    {
      title: "和我说一句",
      text: "留言不用专业。你可以说喜欢哪里、不懂哪里，或者它让你想到谁和什么地方。",
    },
  ];

  els.seriesGrid.innerHTML = introCards
    .map(
      (card) => `
        <article class="series-card reveal">
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.text)}</p>
        </article>
      `
    )
    .join("");
}

function getSeriesCount(seriesId) {
  return data.works.filter((work) => work.seriesId === seriesId).length;
}

function renderFilters() {
  const filters = [
    { id: "all", name: "全部", count: data.works.length },
    ...data.series.map((series) => ({
      id: series.id,
      name: series.short || series.name,
      count: getSeriesCount(series.id),
    })),
  ];

  els.filters.innerHTML = filters
    .map(
      (filter) => `
        <button
          class="filter-button ${filter.id === state.filter ? "active" : ""}"
          type="button"
          data-filter="${escapeHtml(filter.id)}"
          role="tab"
          aria-selected="${filter.id === state.filter ? "true" : "false"}"
        >
          ${escapeHtml(filter.name)} · ${filter.count}
        </button>
      `
    )
    .join("");

  els.filters.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderGallery();
      observeReveal();
    });
  });
}

function matchesQuery(work, query) {
  if (!query) return true;
  const haystack = [work.title, work.seriesName, work.seriesShort].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function getVisibleWorks() {
  return data.works.filter((work) => {
    const matchesFilter = state.filter === "all" || work.seriesId === state.filter;
    return matchesFilter && matchesQuery(work, state.query.trim());
  });
}

function renderGallery() {
  state.visibleWorks = getVisibleWorks();
  els.resultMeta.textContent = `当前显示 ${state.visibleWorks.length} / ${data.works.length} 件作品`;

  if (!state.visibleWorks.length) {
    els.gallery.innerHTML = '<p class="section-note">没有找到匹配的作品。</p>';
    return;
  }

  els.gallery.classList.remove("is-ready");
  els.gallery.innerHTML = state.visibleWorks
    .map(
      (work, index) => `
        <button
          class="work-card ${work.featured ? "featured" : ""}"
          type="button"
          data-index="${index}"
          aria-label="查看 ${escapeHtml(work.title)}"
          style="--card-delay: ${Math.min(index * 26, 360)}ms"
        >
          <span class="work-media">
            <img src="${escapeHtml(work.thumb)}" alt="${escapeHtml(work.title)}" loading="lazy" />
            <span class="work-overlay">查看作品</span>
          </span>
          <span class="work-info">
            <h3>${escapeHtml(work.title)}</h3>
          </span>
        </button>
      `
    )
    .join("");

  els.gallery.querySelectorAll("[data-index]").forEach((card) => {
    const index = Number(card.dataset.index);
    card.addEventListener("mouseenter", () => preloadWorkImage(state.visibleWorks[index]));
    card.addEventListener("focus", () => preloadWorkImage(state.visibleWorks[index]));
    card.addEventListener("click", () => openModal(index));
  });
  window.requestAnimationFrame(() => els.gallery.classList.add("is-ready"));
}

function renderEmotionVotes(work) {
  const feedback = getWorkFeedback(work.id);
  const votes = feedback.votes || {};
  const emotions = getEmotionSet(work);
  const repeated = [...emotions, ...emotions];
  els.emotionVotes.innerHTML = `
    <div class="emotion-track">
      ${repeated
        .map((emotion, index) => {
          const color = EMOTION_COLORS[index % EMOTION_COLORS.length];
          return `
            <button
              class="emotion-button"
              type="button"
              data-emotion="${escapeHtml(emotion)}"
              style="--emotion-color: ${color}"
            >
              <span>${escapeHtml(emotion)}</span>
              <strong>${votes[emotion] || 0}</strong>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  els.emotionVotes.querySelectorAll("[data-emotion]").forEach((button) => {
    button.addEventListener("click", () => {
      voteEmotion(work, button.dataset.emotion);
    });
  });
}

function renderFeedback(work) {
  renderEmotionVotes(work);
  const feedback = getWorkFeedback(work.id);
  const notes = feedback.notes || [];
  if (!notes.length) {
    els.feedbackList.innerHTML = '<p class="empty-feedback">这张作品还没有文字反馈。</p>';
    return;
  }

  els.feedbackList.innerHTML = notes
    .slice()
    .reverse()
    .map((note) => {
      const date = new Date(note.at);
      const time = Number.isNaN(date.getTime()) ? "" : date.toLocaleString("zh-CN");
      return `
        <article class="feedback-item">
          <p>${escapeHtml(note.text)}</p>
          <time>${escapeHtml(time)}</time>
        </article>
      `;
    })
    .join("");
}

function voteEmotion(work, emotion) {
  try {
    updateWorkFeedback(work.id, (feedback) => ({
      votes: {
        ...(feedback.votes || {}),
        [emotion]: ((feedback.votes || {})[emotion] || 0) + 1,
      },
      notes: feedback.notes || [],
      title: work.title,
    }));
    renderFeedback(work);
    setFeedbackStatus(`已记录：${emotion}`);
  } catch {
    setFeedbackStatus("当前浏览器不允许保存反馈。");
  }
}

function saveTextFeedback() {
  const work = getActiveWork();
  if (!work) return;
  const text = els.feedbackText.value.trim();
  if (!text) {
    setFeedbackStatus("先写一句反馈，再保存。");
    return;
  }

  try {
    updateWorkFeedback(work.id, (feedback) => ({
      votes: feedback.votes || {},
      notes: [
        ...(feedback.notes || []),
        {
          text,
          at: new Date().toISOString(),
        },
      ],
      title: work.title,
    }));
    els.feedbackText.value = "";
    renderFeedback(work);
    setFeedbackStatus("谢谢你，我已经在当前浏览器里记下来了。");
  } catch {
    setFeedbackStatus("当前浏览器不允许保存反馈。");
  }
}

function exportAllFeedback() {
  const store = getFeedbackStore();
  const payload = {
    exportedAt: new Date().toISOString(),
    note: "这些反馈来自当前浏览器本机保存的数据。",
    works: store,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `作品反馈_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setFeedbackStatus("已导出当前浏览器里的反馈。");
}

function openModal(index) {
  const work = state.visibleWorks[index];
  if (!work) return;
  state.activeIndex = index;
  els.modalImage.classList.add("is-loading");
  els.modalImage.src = work.thumb || work.image;
  els.modalImage.alt = work.title;
  els.modalTitle.textContent = work.title;
  els.feedbackText.value = "";
  setFeedbackStatus("");
  renderFeedback(work);

  if (work.image) {
    const image = imagePreloadCache.get(work.image) || new Image();
    image.decoding = "async";
    image.onload = () => {
      const activeWork = getActiveWork();
      if (activeWork && activeWork.id === work.id) {
        els.modalImage.src = work.image;
        els.modalImage.classList.remove("is-loading");
      }
    };
    image.onerror = () => {
      els.modalImage.classList.remove("is-loading");
    };
    if (!imagePreloadCache.has(work.image)) {
      imagePreloadCache.set(work.image, image);
      image.src = work.image;
    } else if (image.complete && image.naturalWidth > 0) {
      els.modalImage.src = work.image;
      els.modalImage.classList.remove("is-loading");
    }
  }

  if (work.original || work.image) {
    els.openOriginal.href = work.original || work.image;
    els.openOriginal.textContent = work.original ? "打开高清图" : "打开展示图";
    els.openOriginal.hidden = false;
  } else {
    els.openOriginal.hidden = true;
  }

  if (work.pdf) {
    els.openPdf.href = work.pdf;
    els.openPdf.hidden = false;
  } else {
    els.openPdf.hidden = true;
  }

  els.modal.classList.add("open");
  els.modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  els.openOriginal.focus();
}

function closeModal() {
  els.modal.classList.remove("open");
  els.modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  state.activeIndex = -1;
}

function moveModal(delta) {
  if (state.activeIndex < 0 || !state.visibleWorks.length) return;
  const nextIndex =
    (state.activeIndex + delta + state.visibleWorks.length) % state.visibleWorks.length;
  openModal(nextIndex);
}

function randomOpenWork() {
  state.visibleWorks = getVisibleWorks();
  const pool = state.visibleWorks.length ? state.visibleWorks : data.works;
  const work = pool[Math.floor(Math.random() * pool.length)];
  state.filter = "all";
  state.query = "";
  els.searchInput.value = "";
  renderFilters();
  renderGallery();
  const index = state.visibleWorks.findIndex((item) => item.id === work.id);
  openModal(Math.max(index, 0));
}

function observeReveal() {
  const items = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderGallery();
    observeReveal();
  });

  els.heroStage.addEventListener("click", () => {
    const heroWork = getHeroWork();
    state.filter = "all";
    state.query = "";
    els.searchInput.value = "";
    renderFilters();
    renderGallery();
    const index = state.visibleWorks.findIndex((work) => work.id === heroWork.id);
    openModal(Math.max(index, 0));
  });

  els.randomWork.addEventListener("click", randomOpenWork);
  els.saveFeedback.addEventListener("click", saveTextFeedback);
  els.exportFeedback.addEventListener("click", exportAllFeedback);

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  els.prevWork.addEventListener("click", () => moveModal(-1));
  els.nextWork.addEventListener("click", () => moveModal(1));

  document.addEventListener("keydown", (event) => {
    if (!els.modal.classList.contains("open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") moveModal(-1);
    if (event.key === "ArrowRight") moveModal(1);
  });
}

function init() {
  if (!sourceData || !Array.isArray(sourceData.works)) {
    els.gallery.innerHTML = '<p class="section-note">作品数据没有加载成功。</p>';
    return;
  }

  renderHero();
  renderSeries();
  renderFilters();
  renderGallery();
  bindEvents();
  startHeroLoop();
  observeReveal();

  const params = new URLSearchParams(window.location.search);
  const workIndex = params.has("work") ? Number(params.get("work")) : -1;
  if (Number.isInteger(workIndex) && workIndex >= 0 && workIndex < state.visibleWorks.length) {
    window.setTimeout(() => openModal(workIndex), 120);
  }
}

init();
