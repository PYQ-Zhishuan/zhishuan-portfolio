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
  "像一场梦",
  "轻微失重",
  "潮湿的蓝色",
  "像小房间",
  "有一点亮",
  "像走进雾里",
  "心里软了一下",
  "像夏天傍晚",
  "像下课路上",
  "有点离谱但喜欢",
  "想摸摸它",
  "像旧照片",
  "有点倔强",
  "很适合贴纸",
  "像一页绘本",
  "想知道后续",
  "像没人说出口的话",
  "有一点冷",
  "有一点热闹",
  "像躲起来",
  "像被看见",
  "像在漂流",
  "适合挂在墙上",
  "想做成书签",
  "有电影感",
  "像梦醒之前",
  "有点幼稚但可爱",
  "像一个入口",
  "情绪很满",
  "很轻",
  "很慢",
  "很安稳",
  "像风吹过",
  "有点发光",
  "像一个拥抱",
  "像独处",
  "像在等人",
  "像迷路",
  "像突然开心",
  "像一颗糖",
  "像雨后",
  "有点透明",
  "像另一个世界",
  "适合做海报",
  "适合做封面",
  "适合做明信片",
  "像儿童剧场",
  "有空间感",
  "想走进去看看",
  "像一段旋律",
  "颜色很舒服",
  "角色很有记忆点",
  "画面很会呼吸",
  "像一个小岛",
  "像夜里的灯",
  "像午睡醒来",
  "像某种告别",
  "像重新开始",
  "有点笨拙",
  "有点勇敢",
  "有点脆弱",
  "有点浪漫",
  "有点顽皮",
  "很适合空间视觉",
  "想看它动起来",
  "像一张梦境地图",
  "像童话背面",
  "像心情天气",
  "像一封没寄出的信",
  "像海底散步",
  "像云里迷路",
  "像被轻轻接住",
  "像小声说话",
  "像秘密基地",
  "像逃跑计划",
  "像慢慢靠近",
  "像柔软的怪念头",
  "像孤单但不难过",
  "像一个奇怪朋友",
  "像窗边发呆",
  "像今天的心情",
  "像梦里见过",
  "想发给朋友",
  "想放在房间里",
  "想做成周边",
  "想看系列故事",
  "适合做展览墙",
  "适合做公共艺术",
  "适合儿童空间",
  "有一点神秘",
  "有一点荒凉",
  "有一点甜",
  "有一点怪",
  "有一点轻松",
  "有一点想哭",
  "很像情绪标本",
  "很像记忆碎片",
  "很像梦的封面",
  "很像心里的角落",
  "很像路过的风景",
  "很像另一个自己",
  "看完会停一下",
  "越看越喜欢",
  "第一眼记住了",
  "想知道名字",
  "像在讲悄悄话",
  "像一场小冒险",
  "像未来的绘本",
  "像一面墙的开始",
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
  "#ffa6a6",
  "#c6f67d",
  "#f7b7ff",
  "#80d8ff",
  "#ffcf8a",
  "#a6e3a1",
  "#f5a3c7",
  "#d7c4ff",
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
  modalMedia: document.querySelector(".modal-media"),
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
  while (picked.length < 15 && available.length) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const index = seed % available.length;
    picked.push(available.splice(index, 1)[0]);
  }
  return picked;
}

function chunkItems(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function preloadWorkImage(work) {
  if (!work || !work.image || imagePreloadCache.has(work.image)) return;
  const image = new Image();
  image.decoding = "async";
  image.src = work.image;
  imagePreloadCache.set(work.image, image);
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
    hue *= 60;
  }

  return { hue, saturation, lightness };
}

function mixColor(color, target, amount) {
  return {
    r: Math.round(color.r * (1 - amount) + target.r * amount),
    g: Math.round(color.g * (1 - amount) + target.g * amount),
    b: Math.round(color.b * (1 - amount) + target.b * amount),
  };
}

function colorToRgb(color) {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function getImageMoodColor(image) {
  const canvas = document.createElement("canvas");
  const size = 56;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context || !image.naturalWidth || !image.naturalHeight) return null;

  context.drawImage(image, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const buckets = new Map();
  let fallback = { r: 0, g: 0, b: 0, weight: 0 };

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];
    if (alpha < 180) continue;

    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const { hue, saturation, lightness } = rgbToHsl(r, g, b);
    if (lightness < 0.1 || lightness > 0.95) continue;

    const fallbackWeight = 1 - Math.abs(lightness - 0.58);
    fallback.r += r * fallbackWeight;
    fallback.g += g * fallbackWeight;
    fallback.b += b * fallbackWeight;
    fallback.weight += fallbackWeight;

    if (saturation < 0.08 || lightness < 0.16 || lightness > 0.9) continue;

    const hueBucket = Math.round(hue / 18) * 18;
    const key = String(hueBucket);
    const weight = (0.45 + saturation) * (1.15 - Math.abs(lightness - 0.6));
    const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, weight: 0 };
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
    bucket.weight += weight;
    buckets.set(key, bucket);
  }

  const best = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0];
  const source = best && best.weight > 0 ? best : fallback;
  if (!source || source.weight <= 0) return null;

  return {
    r: Math.round(source.r / source.weight),
    g: Math.round(source.g / source.weight),
    b: Math.round(source.b / source.weight),
  };
}

function setModalMediaTone(color) {
  if (!els.modalMedia) return;
  const base = color || { r: 205, g: 216, b: 208 };
  const soft = mixColor(base, { r: 255, g: 252, b: 241 }, 0.5);
  const glow = mixColor(base, { r: 255, g: 255, b: 255 }, 0.74);
  const deep = mixColor(base, { r: 255, g: 250, b: 235 }, 0.26);

  els.modalMedia.style.setProperty("--media-bg", colorToRgb(soft));
  els.modalMedia.style.setProperty("--media-bg-glow", colorToRgb(glow));
  els.modalMedia.style.setProperty("--media-bg-deep", colorToRgb(deep));
}

function setModalMediaImage(src) {
  if (!els.modalMedia || !src) return;
  els.modalMedia.style.setProperty("--media-image", `url("${src.replaceAll('"', "%22")}")`);
}

function applyModalMediaTone(image, workId) {
  const activeWork = getActiveWork();
  if (!activeWork || activeWork.id !== workId) return;

  try {
    setModalMediaTone(getImageMoodColor(image));
  } catch {
    setModalMediaTone(null);
  }
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
  els.emotionVotes.innerHTML = `
    ${chunkItems(emotions, 5)
      .map((row, rowIndex) => {
        const repeated = [...row, ...row];
        return `
          <div class="emotion-row ${rowIndex === 1 ? "reverse" : ""}" style="--row-speed: ${30 + rowIndex * 7}s">
            <div class="emotion-track">
              ${repeated
                .map((emotion, index) => {
                  const color = EMOTION_COLORS[(rowIndex * 5 + index) % EMOTION_COLORS.length];
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
          </div>
        `;
      })
      .join("")}
  `;

  els.emotionVotes.dataset.workId = work.id;
}

function renderFeedback(work, options = {}) {
  const { renderVotes = true } = options;
  if (renderVotes) {
    renderEmotionVotes(work);
  }

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

function updateEmotionVoteCount(emotion, count) {
  els.emotionVotes.querySelectorAll("[data-emotion]").forEach((button) => {
    if (button.dataset.emotion !== emotion) return;

    const counter = button.querySelector("strong");
    if (counter) {
      counter.textContent = count;
    }
    button.classList.add("just-voted");
    window.setTimeout(() => button.classList.remove("just-voted"), 450);
  });
}

function voteEmotion(work, emotion) {
  try {
    let nextCount = 0;
    updateWorkFeedback(work.id, (feedback) => {
      nextCount = ((feedback.votes || {})[emotion] || 0) + 1;
      return {
        votes: {
          ...(feedback.votes || {}),
          [emotion]: nextCount,
        },
        notes: feedback.notes || [],
        title: work.title,
      };
    });
    updateEmotionVoteCount(emotion, nextCount);
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
    renderFeedback(work, { renderVotes: false });
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
  setModalMediaTone(null);
  setModalMediaImage(work.thumb || work.image);
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
        applyModalMediaTone(image, work.id);
        setModalMediaImage(work.image);
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
      applyModalMediaTone(image, work.id);
      setModalMediaImage(work.image);
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
  els.emotionVotes.addEventListener("click", (event) => {
    const button = event.target.closest("[data-emotion]");
    const work = getActiveWork();
    if (!button || !work || work.id !== els.emotionVotes.dataset.workId) return;
    voteEmotion(work, button.dataset.emotion);
  });

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
