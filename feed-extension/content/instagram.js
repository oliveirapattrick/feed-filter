// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = `
  .sf-btn-container {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    z-index: 9999;
    opacity: 1;
    pointer-events: all;
  }
  .sf-btn-container.sf-modal-btns {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    pointer-events: all;
    opacity: 1;
  }
  .sf-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(10,10,15,0.92);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(124,106,247,0.3);
    color: #e8e8f0;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    padding: 0;
    line-height: 1;
    pointer-events: all;
  }
  .sf-btn:hover { border-color: #7c6af7; background: rgba(124,106,247,0.15); }
  .sf-btn:disabled { opacity: 0.5; cursor: default; }
  .sf-btn.sf-success { border-color: #5adb7a; animation: none; }
  .sf-btn.sf-error   { border-color: #ff6b6b; animation: none; }
  .sf-btn.sf-loading { border-color: #7c6af7; animation: sf-pulse-border 1s ease-in-out infinite; }
  @keyframes sf-pulse-border {
    0%, 100% { border-color: rgba(124,106,247,0.3); }
    50%       { border-color: #7c6af7; }
  }

  .sf-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    transform: translateX(calc(100% + 24px));
    background: #111118;
    color: #e8e8f0;
    border: 1px solid rgba(124,106,247,0.4);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1.5;
    z-index: 99999;
    pointer-events: none;
    max-width: 300px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    transition: transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.28s ease;
    opacity: 0;
    overflow: hidden;
  }
  .sf-toast.visible {
    transform: translateX(0);
    opacity: 1;
  }
  .sf-toast-bar {
    position: absolute;
    bottom: 0; left: 0;
    height: 2px;
    background: #7c6af7;
    width: 100%;
    transform-origin: left;
  }

  .sf-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 99999;
    background: rgba(124,106,247,0.2);
    overflow: hidden;
    pointer-events: none;
  }
  .sf-progress::after {
    content: "";
    display: block;
    height: 100%;
    width: 40%;
    background: #7c6af7;
    border-radius: 0 2px 2px 0;
    animation: sf-pulse 1.4s ease-in-out infinite;
  }
  @keyframes sf-pulse {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }

  .sf-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(4px);
    z-index: 99998;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sf-modal {
    background: #0a0a0f;
    border: 1px solid #2a2a3a;
    border-radius: 12px;
    max-width: 520px; width: 92vw;
    max-height: 75vh;
    display: flex; flex-direction: column;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    animation: sf-modal-in 0.2s ease forwards;
    overflow: hidden;
  }
  @keyframes sf-modal-in {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  .sf-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #2a2a3a;
    font-family: 'Syne', sans-serif;
    font-weight: 600; font-size: 16px;
    color: #e8e8f0;
  }
  .sf-modal-close {
    background: none; border: none; color: #666680;
    font-size: 20px; cursor: pointer; line-height: 1;
    padding: 0; transition: color 0.15s;
  }
  .sf-modal-close:hover { color: #e8e8f0; }
  .sf-modal-body {
    flex: 1; overflow-y: auto;
    padding: 16px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; line-height: 1.7;
    color: #c8c8e8;
    white-space: pre-wrap; word-break: break-word;
    user-select: text;
  }
  .sf-modal-body::-webkit-scrollbar { width: 4px; }
  .sf-modal-body::-webkit-scrollbar-track { background: transparent; }
  .sf-modal-body::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
  .sf-modal-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #2a2a3a;
  }
  .sf-modal-wordcount { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #666680; }
  .sf-modal-actions { display: flex; gap: 8px; }
  .sf-modal-btn {
    background: #1e1e2e; color: #e8e8f0;
    border: 1px solid #2a2a3a; border-radius: 6px;
    padding: 7px 14px; font-size: 12px; cursor: pointer;
    transition: background 0.15s;
  }
  .sf-modal-btn:hover { background: #2a2a3e; }
  .sf-modal-btn.primary { border-color: #7c6af7; color: #7c6af7; }
  .sf-modal-btn.primary:hover { background: #7c6af7; color: #fff; }
`;

(function injectStyles() {
  if (document.getElementById("sf-styles")) return;
  const el = document.createElement("style");
  el.id = "sf-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
})();

// ─── Toast ────────────────────────────────────────────────────────────────────

let toastEl = null;
let toastTimer = null;

function showToast(msg, duration = 5000) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "sf-toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add("visible");

  // Progress bar
  let bar = toastEl.querySelector(".sf-toast-bar");
  if (!bar) { bar = document.createElement("div"); bar.className = "sf-toast-bar"; toastEl.appendChild(bar); }
  bar.style.transition = "none";
  bar.style.transform = "scaleX(1)";
  requestAnimationFrame(() => {
    bar.style.transition = `transform ${duration}ms linear`;
    bar.style.transform = "scaleX(0)";
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("visible"), duration);
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

let progressEl = null;
let progressCount = 0;

function showProgress() {
  progressCount++;
  if (!progressEl) {
    progressEl = document.createElement("div");
    progressEl.className = "sf-progress";
    document.body.appendChild(progressEl);
  }
}

function hideProgress() {
  progressCount = Math.max(0, progressCount - 1);
  if (progressCount === 0 && progressEl) {
    progressEl.remove();
    progressEl = null;
  }
}

// ─── Transcription Modal ──────────────────────────────────────────────────────

function showModal(text) {
  const overlay = document.createElement("div");
  overlay.className = "sf-overlay";

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const modal = document.createElement("div");
  modal.className = "sf-modal";
  modal.innerHTML = `
    <div class="sf-modal-header">
      <span>📝 Transcrição</span>
      <button class="sf-modal-close" title="Fechar">×</button>
    </div>
    <div class="sf-modal-body">${safeText}</div>
    <div class="sf-modal-footer">
      <span class="sf-modal-wordcount">${wordCount} palavras</span>
      <div class="sf-modal-actions">
        <button class="sf-modal-btn" id="sf-save">💾 Salvar</button>
        <button class="sf-modal-btn primary" id="sf-copy">📋 Copiar</button>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const copyBtn = modal.querySelector("#sf-copy");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "✅ Copiado!";
      setTimeout(() => { copyBtn.innerHTML = "📋 Copiar"; }, 2000);
    });
  });

  const saveBtn = modal.querySelector("#sf-save");
  saveBtn.addEventListener("click", () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "⏳ Salvando...";
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `transcricao_${ts}.txt`;
    chrome.runtime.sendMessage({ action: "saveTranscription", text, filename }, (res) => {
      if (res?.status === "ok") {
        saveBtn.textContent = "✅ Salvo!";
      } else {
        saveBtn.textContent = "❌ Erro";
        saveBtn.disabled = false;
      }
      setTimeout(() => { saveBtn.innerHTML = "💾 Salvar"; saveBtn.disabled = false; }, 3000);
    });
  });

  const close = () => overlay.remove();
  modal.querySelector(".sf-modal-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
}

// ─── XHR interception — injected into page context (like Sort Feed) ──────────
// Content scripts can't intercept XHR from the page. We inject a <script> tag
// that runs in the page context, intercepts XHR, and sends data via postMessage.

const apiPostData = {};

(function injectXHRInterceptor() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("content/xhr_interceptor.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();

// Listen for XHR data sent from page context
window.addEventListener("message", (e) => {
  if (!e.data?.ff_api_posts) return;
  for (const post of e.data.ff_api_posts) {
    if (!apiPostData[post.code]) {
      apiPostData[post.code] = post;
    }
  }
});

// ─── Metric extraction ────────────────────────────────────────────────────────

function extractURL(el) {
  let node = el;
  for (let i = 0; i < 8; i++) {
    if (!node || !node.parentElement) break;
    node = node.parentElement;
    const link = node.querySelector('a[href*="/p/"], a[href*="/reel/"]');
    if (link) return link.href;
  }
  return null;
}

function extractCodeFromUrl(url) {
  if (!url) return null;
  const m = url.match(/\/(p|reel)\/([^/?#]+)/);
  return m ? m[2] : null;
}

function extractMetrics(article) {
  const url = extractURL(article);
  const code = extractCodeFromUrl(url);
  const api = code ? (apiPostData[code] || {}) : {};
  return {
    url,
    likes:    api.likes    ?? 0,
    views:    api.views    ?? 0,
    comments: api.comments ?? 0,
    mediaType: api.mediaType ?? 1,
    taken_at:  api.taken_at  ?? 0,
  };
}

// ─── Media collection ─────────────────────────────────────────────────────────

const CDN_PATTERNS = ["cdninstagram.com", "fbcdn.net"];

function isCDNUrl(url) {
  return url && CDN_PATTERNS.some((p) => url.includes(p));
}

function isThumbUrl(url) {
  return /s150x150|s320x320|s240x240|\/s\d+x\d+\//.test(url);
}

function bestSrc(img) {
  if (img.srcset) {
    const entries = img.srcset.split(",").map((s) => {
      const [url, w] = s.trim().split(/\s+/);
      return { url, w: parseInt(w) || 0 };
    });
    entries.sort((a, b) => b.w - a.w);
    if (entries[0]?.url) return entries[0].url;
  }
  return img.src || null;
}

function findMediaScope(root) {
  let scope = root;
  for (let i = 0; i < 6; i++) {
    const imgs = scope.querySelectorAll("img[src], img[srcset]");
    const vids = scope.querySelectorAll("video[src], video source[src]");
    if (imgs.length > 0 || vids.length > 0) break;
    if (!scope.parentElement) break;
    scope = scope.parentElement;
  }
  return scope;
}

function collectVisibleMedia(root) {
  const scope = findMediaScope(root);
  const urls = new Set();

  scope.querySelectorAll("img[src], img[srcset]").forEach((img) => {
    const src = bestSrc(img);
    if (src && isCDNUrl(src) && !isThumbUrl(src)) urls.add(src);
  });

  scope.querySelectorAll("video[src], video source[src]").forEach((el) => {
    const src = el.src || el.getAttribute("src") || "";
    if (src && isCDNUrl(src)) urls.add(src);
  });

  return [...urls];
}

// ─── Button injection ─────────────────────────────────────────────────────────

function injectButtons(article, url) {
  const container = document.createElement("div");
  container.className = "sf-btn-container";

  const dlBtn = document.createElement("button");
  dlBtn.className = "sf-btn";
  dlBtn.title = "Baixar";
  dlBtn.textContent = "⬇";

  const txBtn = document.createElement("button");
  txBtn.className = "sf-btn";
  txBtn.title = "Transcrever";
  txBtn.textContent = "📝";

  function stopAll(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function resetBtn(btn, delay = 3000) {
    setTimeout(() => {
      btn.classList.remove("sf-loading", "sf-success", "sf-error");
      btn.disabled = false;
    }, delay);
  }

  function onDownloadResult(res) {
    dlBtn.classList.remove("sf-loading");
    if (!res || res.status === "error") {
      dlBtn.classList.add("sf-error");
      const msg = res ? res.message : "Erro desconhecido";
      if (msg.includes("rodando")) showToast("Inicie o Feed Filter App para usar esta função");
      else showToast("❌ " + msg);
    } else {
      dlBtn.classList.add("sf-success");
      const count = res.files ? res.files.length : 1;
      const filename = res.file ? res.file.split(/[\\/]/).pop() : "";
      const label = count > 1 ? `${count} arquivos salvos` : `Downloads/FeedFilter/${filename}`;
      showToast("✅ Salvo: " + label);
    }
    resetBtn(dlBtn);
  }

  dlBtn.addEventListener("click", (e) => {
    stopAll(e);
    dlBtn.disabled = true;
    dlBtn.classList.add("sf-loading");

    // Case 1: Reel — identified by URL, always use yt-dlp, never touch DOM
    if (url && url.includes("/reel/")) {
      chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
      return;
    }

    // Cases 2 & 3: /p/ post — inspect DOM
    const domUrls = collectVisibleMedia(article);
    const hasVideo = !!findMediaScope(article).querySelector("video");

    // Case 2: carousel — multiple CDN media, ask to open fullscreen
    if (domUrls.length > 1) {
      dlBtn.classList.remove("sf-loading");
      dlBtn.disabled = false;
      showToast("🖼️ Carrossel: abra o post em tela cheia e clique em ⬇ novamente para baixar todos os slides.");
      return;
    }

    // Case 3a: single video → yt-dlp
    if (hasVideo) {
      chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
      return;
    }

    // Case 3b: single image → download-direct
    if (domUrls.length === 1) {
      chrome.runtime.sendMessage({ action: "downloadCarousel", urls: domUrls }, onDownloadResult);
      return;
    }

    // Fallback → yt-dlp
    chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
  });

  txBtn.addEventListener("click", (e) => {
    stopAll(e);
    txBtn.disabled = true;
    txBtn.classList.add("sf-loading");
    showProgress();
    chrome.runtime.sendMessage({ action: "transcribe", url }, (res) => {
      hideProgress();
      txBtn.classList.remove("sf-loading");
      if (!res || res.status === "error") {
        txBtn.classList.add("sf-error");
        const msg = res ? res.message : "Erro desconhecido";
        if (msg.includes("rodando")) showToast("Inicie o Feed Filter App para usar esta função");
        else showToast("❌ " + msg);
        resetBtn(txBtn);
      } else {
        txBtn.classList.add("sf-success");
        resetBtn(txBtn);
        showModal(res.text);
      }
    });
  });

  container.appendChild(dlBtn);
  container.appendChild(txBtn);

  if (getComputedStyle(article).position === "static") {
    article.style.position = "relative";
  }
  article.appendChild(container);
}

// ─── Process articles ─────────────────────────────────────────────────────────

let _articleIndex = 0;

function processArticle(article) {
  if (article.dataset.sfProcessed) return;
  article.dataset.sfProcessed = "true";
  article.dataset.sfIndex = _articleIndex++;

  const { url, likes, views, comments, mediaType, taken_at } = extractMetrics(article);
  article.dataset.sfLikes     = likes;
  article.dataset.sfViews     = views;
  article.dataset.sfComments  = comments;
  article.dataset.sfMediaType = mediaType;
  article.dataset.sfTakenAt   = taken_at;
  if (url) article.dataset.sfUrl = url;

  if (url) injectButtons(article, url);
}

// ─── Selector probe ───────────────────────────────────────────────────────────

const CANDIDATE_SELECTORS = [
  "article",
  "main article",
  "div._aagv",
  "div[class*='x1lliihq'] > div > div > article",
  "div[style*='flex-direction'] > div > div > article",
];

function findArticles() {
  for (const sel of CANDIDATE_SELECTORS) {
    try {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) return found;
    } catch (_) {}
  }
  return [];
}

const PROCESS_BATCH = 20;

function processAll() {
  const articles = findArticles();
  let newCount = 0;
  for (const a of articles) {
    if (a.dataset.sfProcessed) continue;
    processArticle(a);
    if (++newCount >= PROCESS_BATCH) break;
  }
}

// ─── Modal (fullscreen post) button injection ─────────────────────────────────

let modalBtns = null;

function injectModalButtons(dialog) {
  if (modalBtns) { modalBtns.remove(); modalBtns = null; }

  const link = dialog.querySelector('a[href*="/p/"], a[href*="/reel/"]');
  const url = link ? link.href : null;
  if (!url) return;

  const article = dialog.querySelector("article") || dialog;

  const container = document.createElement("div");
  container.className = "sf-btn-container sf-modal-btns";

  const dlBtn = document.createElement("button");
  dlBtn.className = "sf-btn";
  dlBtn.title = "Baixar";
  dlBtn.textContent = "⬇";

  const txBtn = document.createElement("button");
  txBtn.className = "sf-btn";
  txBtn.title = "Transcrever";
  txBtn.textContent = "📝";

  function stopAll(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function resetBtn(btn, delay = 3000) {
    setTimeout(() => { btn.classList.remove("sf-loading", "sf-success", "sf-error"); btn.disabled = false; }, delay);
  }

  function onDownloadResult(res) {
    dlBtn.classList.remove("sf-loading");
    if (!res || res.status === "error") {
      dlBtn.classList.add("sf-error");
      showToast("❌ " + (res ? res.message : "Erro desconhecido"));
    } else {
      dlBtn.classList.add("sf-success");
      const count = res.files ? res.files.length : 1;
      const filename = res.file ? res.file.split(/[\\/]/).pop() : "";
      showToast("✅ Salvo: " + (count > 1 ? `${count} arquivos` : `Downloads/FeedFilter/${filename}`));
    }
    resetBtn(dlBtn);
  }

  dlBtn.addEventListener("click", (e) => {
    stopAll(e);
    dlBtn.disabled = true;
    dlBtn.classList.add("sf-loading");

    if (url.includes("/reel/")) {
      chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
      return;
    }

    const domUrls = collectVisibleMedia(article);
    const hasVideo = !!findMediaScope(article).querySelector("video");

    if (domUrls.length > 1) {
      chrome.runtime.sendMessage({ action: "downloadCarousel", urls: domUrls }, onDownloadResult);
      return;
    }
    if (hasVideo || domUrls.length === 0) {
      chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
      return;
    }
    chrome.runtime.sendMessage({ action: "downloadCarousel", urls: domUrls }, onDownloadResult);
  });

  txBtn.addEventListener("click", (e) => {
    stopAll(e);
    txBtn.disabled = true;
    txBtn.classList.add("sf-loading");
    showProgress();
    chrome.runtime.sendMessage({ action: "transcribe", url }, (res) => {
      hideProgress();
      txBtn.classList.remove("sf-loading");
      if (!res || res.status === "error") {
        txBtn.classList.add("sf-error");
        showToast("❌ " + (res ? res.message : "Erro desconhecido"));
        resetBtn(txBtn);
      } else {
        txBtn.classList.add("sf-success");
        resetBtn(txBtn);
        showModal(res.text);
      }
    });
  });

  container.appendChild(dlBtn);
  container.appendChild(txBtn);
  document.body.appendChild(container);
  modalBtns = container;
}

function removeModalButtons() {
  if (modalBtns) { modalBtns.remove(); modalBtns = null; }
}

let dialogDebounce = null;

function syncModalState() {
  const dialog = document.querySelector('[role="dialog"]');
  if (dialog) {
    // Hide feed buttons so they don't show through the modal
    document.querySelectorAll(".sf-btn-container:not(.sf-modal-btns)").forEach((el) => {
      el.style.visibility = "hidden";
    });
    if (!modalBtns) setTimeout(() => injectModalButtons(dialog), 400);
  } else {
    document.querySelectorAll(".sf-btn-container:not(.sf-modal-btns)").forEach((el) => {
      el.style.visibility = "";
    });
    removeModalButtons();
  }
}

const dialogObserver = new MutationObserver(() => {
  clearTimeout(dialogDebounce);
  dialogDebounce = setTimeout(syncModalState, 150);
});
dialogObserver.observe(document.body, { childList: true, subtree: true });

// ─── MutationObserver ─────────────────────────────────────────────────────────

let debounceTimer = null;
const observer = new MutationObserver((mutations) => {
  if (!mutations.some((m) => m.addedNodes.length > 0)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processAll, 300);
});
observer.observe(document.body, { childList: true, subtree: true });

console.log("[FeedFilter] instagram.js carregado ✓");
processAll();

// ─── Filters — Sort Feed architecture ────────────────────────────────────────
//
// Exact same flow as Sort Feed:
//   1. Intercept XHR (already done above in apiPostData)
//   2. While scrolling, for each post: find DOM tile by code, capture outerHTML
//   3. Sort the collected items
//   4. Hide original grid, inject new div with sorted outerHTML rows
//   (No page reload needed — we build a parallel grid just like Sort Feed does)

// Finds the Instagram profile grid container — the div that wraps rows of tiles.
// Sort Feed uses: main > div[0] > tablist parentElement > nextElementSibling
// We replicate that logic with a DOM walk fallback.
function findGridSection() {
  try {
    const main = document.getElementsByTagName("main")[0];
    const tablist = main?.getElementsByTagName("div")[0]
      ?.querySelector('[role="tablist"]');
    if (tablist) {
      let el = tablist.parentElement?.nextElementSibling;
      while (el && el.tagName !== "DIV") el = el.nextElementSibling;
      if (el) return el;
    }
  } catch (_) {}
  // Fallback: find div that directly contains 3-column post rows
  const anchors = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
  for (const a of anchors) {
    let node = a.parentElement;
    for (let i = 0; i < 8 && node; i++) {
      if (node.children.length >= 3) return node.parentElement || node;
      node = node.parentElement;
    }
  }
  return null;
}

// Returns the grid tile element for a given anchor — the direct child of the
// row div (the element that sits alongside 2 other tiles in a 3-column row).
// Sort Feed uses anchor.closest("div") which happens to land on the right level
// because the tile IS the first div wrapping the anchor. We walk up until we
// find a node whose parent has multiple children (i.e. is a row or grid).
function getTileFromAnchor(anchor) {
  let node = anchor;
  while (node.parentElement) {
    const parent = node.parentElement;
    // A row in the Instagram grid has 3 tile children (or spacers)
    if (parent.children.length >= 2) return node;
    node = parent;
  }
  return anchor.closest("div");
}

// Waits for a tile with `code` to appear in DOM, scrolls it into view,
// returns { element: outerHTML, userName } — mirrors find_element_instagram_again_posts
function collectTile(code, retries = 40, interval = 150) {
  return new Promise((resolve) => {
    const tryFind = (left) => {
      const anchor = document.querySelector(`a[href*="/${code}/"]`);
      if (anchor) {
        const tile = getTileFromAnchor(anchor);
        if (tile) {
          tile.scrollIntoView({ behavior: "auto", block: "center" });
          const m = anchor.getAttribute("href")?.match(/^\/([^/]+)\/(p|reel)\//);
          const userName = m ? m[1] : "";
          resolve({ element: tile.outerHTML, userName });
          return;
        }
      }
      if (left > 0) setTimeout(() => tryFind(left - 1), interval);
      else resolve(null);
    };
    tryFind(retries);
  });
}

// Renders sorted items exactly like Sort Feed's rn() function:
// hides original grid, creates #ff-sorted-grid div with same className,
// injects rows of 4 tiles using the captured outerHTML.
function renderSortedGrid(items, sortLabel) {
  // Remove any previous sorted grid
  document.getElementById("ff-sorted-grid")?.remove();
  document.getElementById("ff-sort-banner")?.remove();

  const gridSection = findGridSection();
  console.log("[FeedFilter] gridSection:", gridSection, "items:", items.length);
  if (!gridSection) {
    showToast("❌ Grid não encontrado. Tente recarregar a página.");
    return;
  }

  if (items.length === 0) {
    showToast("❌ Nenhum tile capturado. Verifique o console para detalhes.");
    return;
  }

  // Hide original grid (same as Sort Feed: n.style.display = "none")
  gridSection.style.display = "none";

  // Create replacement div with same class
  const newGrid = document.createElement("div");
  newGrid.id = "ff-sorted-grid";
  newGrid.className = gridSection.className;
  newGrid.style.cssText = "display:flex;flex-direction:column;padding-bottom:0;padding-top:0;position:relative;";
  gridSection.after(newGrid);

  // Instagram profile grid uses rows of 3 tiles (not 4 like Sort Feed uses for reels)
  const ROW_SIZE = 3;
  const SPACER_CLASS = "x11i5rnm x1ntc13c x9i3mqj x2pgyrj"; // Sort Feed spacer class
  const ROW_CLASS = "_ac7v xat24cr x1f01sob xcghwft xzboxd6"; // Sort Feed row class

  for (let i = 0; i < items.length; i += ROW_SIZE) {
    const row = document.createElement("div");
    row.className = ROW_CLASS;

    const batch = items.slice(i, i + ROW_SIZE);
    for (const item of batch) {
      if (!item.element) continue;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = item.element;
      const tile = wrapper.firstElementChild;
      if (!tile) continue;

      // Inject download/transcribe buttons directly using known URL
      const url = item.mediaType === 2
        ? `https://www.instagram.com/${item.userName}/reel/${item.code}/`
        : `https://www.instagram.com/${item.userName}/p/${item.code}/`;
      if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
      injectButtons(tile, url);

      row.appendChild(tile);
    }

    // Pad row with spacers if < ROW_SIZE (Sort Feed pattern)
    while (row.children.length < ROW_SIZE) {
      const spacer = document.createElement("div");
      spacer.className = SPACER_CLASS;
      row.appendChild(spacer);
    }

    newGrid.appendChild(row);
  }

  // Banner above grid
  const banner = document.createElement("div");
  banner.id = "ff-sort-banner";
  banner.style.cssText = `
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 20px;margin-bottom:4px;
    background:#0a0a0f;border:1px solid #2a2a3e;border-radius:8px;
    color:#e8e8f0;font-size:13px;font-family:sans-serif;
  `;
  banner.innerHTML = `
    <span>✅ <strong>${items.length}</strong> posts — <em>${sortLabel}</em></span>
    <button id="ff-reset-btn" style="
      background:#1e1e2e;color:#e8e8f0;border:1px solid #7c6af7;
      border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;
    ">Resetar</button>
  `;
  newGrid.before(banner);

  document.getElementById("ff-reset-btn")?.addEventListener("click", () => {
    document.getElementById("ff-sorted-grid")?.remove();
    document.getElementById("ff-sort-banner")?.remove();
    gridSection.style.display = "";
  });

  // Scroll to top like Sort Feed does
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Main collection + sort loop — mirrors sort_item_posts / sort_not_all_reels
async function applyFilters(config) {
  const { quantity, contentType, sortBy } = config;

  let collected = []; // { code, likes, views, comments, mediaType, taken_at }
  let lastCount = 0;
  let stuckCycles = 0;

  showToast(`⏳ Coletando posts... 0/${quantity}`, 60000);

  // Phase 1: scroll and collect metadata from XHR
  while (true) {
    // Pull new entries from apiPostData
    for (const [code, data] of Object.entries(apiPostData)) {
      if (collected.some((c) => c.code === code)) continue;
      collected.push({ code, ...data });
    }

    // Also pull from already-processed articles in DOM
    document.querySelectorAll("[data-sf-processed]").forEach((el) => {
      const code = extractCodeFromUrl(el.dataset.sfUrl || "");
      if (!code || collected.some((c) => c.code === code)) return;
      collected.push({
        code,
        likes:     parseInt(el.dataset.sfLikes,    10) || 0,
        views:     parseInt(el.dataset.sfViews,    10) || 0,
        comments:  parseInt(el.dataset.sfComments, 10) || 0,
        mediaType: parseInt(el.dataset.sfMediaType,10) || 1,
        taken_at:  parseInt(el.dataset.sfTakenAt,  10) || 0,
      });
    });

    const filtered = collected.filter((c) => {
      if (contentType === "all") return true;
      return (c.mediaType === 2 ? "reels" : "posts") === contentType;
    });

    showToast(`⏳ Coletando posts... ${filtered.length}/${quantity}`, 60000);
    if (filtered.length >= quantity) break;

    if (filtered.length === lastCount) {
      stuckCycles++;
      if (stuckCycles >= 4) { showToast(`⚠️ Fim do feed. ${filtered.length} posts coletados.`, 3000); break; }
    } else {
      stuckCycles = 0;
    }
    lastCount = filtered.length;

    window.scrollBy(0, window.innerHeight * 2);
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("[FeedFilter] apiPostData keys:", Object.keys(apiPostData).length, Object.keys(apiPostData).slice(0,3));
  console.log("[FeedFilter] collected total:", collected.length, "sample:", collected.slice(0,2));

  // Phase 2: filter + sort metadata
  let toRender = collected.filter((c) => {
    if (contentType === "all") return true;
    return (c.mediaType === 2 ? "reels" : "posts") === contentType;
  }).slice(0, quantity);

  const scoreOf = {
    likes:    (c) =>  (c.likes    || 0),
    views:    (c) =>  (c.views    || 0),
    comments: (c) =>  (c.comments || 0),
    newest:   (c) =>  (c.taken_at || 0),
    oldest:   (c) => -(c.taken_at || 0),
  }[sortBy];
  if (scoreOf) toRender.sort((a, b) => scoreOf(b) - scoreOf(a));

  showToast(`⏳ Capturando HTML dos tiles... 0/${toRender.length}`, 60000);

  // Phase 3: capture outerHTML for each tile (mirrors find_element_instagram_again_posts)
  // First scroll back to top so tiles are in DOM order
  window.scrollTo({ top: 0, behavior: "instant" });
  await new Promise((r) => setTimeout(r, 600));

  const withHTML = [];
  for (let i = 0; i < toRender.length; i++) {
    const item = toRender[i];
    showToast(`⏳ Capturando HTML dos tiles... ${i}/${toRender.length}`, 60000);
    const result = await collectTile(item.code);
    console.log(`[FeedFilter] tile ${item.code}:`, result ? `OK (${result.element?.length} chars)` : "NOT FOUND");
    withHTML.push({ ...item, ...(result || { element: null, userName: "" }) });
  }
  console.log("[FeedFilter] withHTML:", withHTML.length, "com elemento:", withHTML.filter(i => i.element).length);

  // Phase 4: render sorted grid (mirrors rn() in Sort Feed content.js)
  const sortLabel = {
    likes: "mais curtidas", views: "mais views", comments: "mais comentários",
    newest: "mais recentes", oldest: "mais antigos",
  }[sortBy] || sortBy;

  const finalItems = withHTML.filter((i) => i.element);
  renderSortedGrid(finalItems, sortLabel);

  // Persist batch list so popup can show it in "Baixar em Lote" tab
  const batchList = finalItems.map((i) => ({
    code:      i.code,
    userName:  i.userName,
    mediaType: i.mediaType,
    likes:     i.likes,
    views:     i.views,
    url: i.mediaType === 2
      ? `https://www.instagram.com/${i.userName}/reel/${i.code}/`
      : `https://www.instagram.com/${i.userName}/p/${i.code}/`,
  }));
  chrome.storage.local.set({ ffBatchList: batchList });
}

// ─── Batch download / transcribe ─────────────────────────────────────────────

async function batchDownload(codes) {
  const list = await chrome.storage.local.get("ffBatchList").then(d => d.ffBatchList || []);
  const items = codes
    ? list.filter(i => codes.includes(i.code))
    : list;

  let done = 0;
  for (const item of items) {
    showToast(`⬇ Baixando ${done + 1}/${items.length}...`, 60000);
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "download", url: item.url }, () => resolve());
    });
    done++;
    await new Promise(r => setTimeout(r, 300));
  }
  showToast(`✅ ${done} arquivos baixados.`);
}

async function batchTranscribe(codes) {
  const list = await chrome.storage.local.get("ffBatchList").then(d => d.ffBatchList || []);
  const items = (codes ? list.filter(i => codes.includes(i.code)) : list)
    .filter(i => i.mediaType === 2);

  if (items.length === 0) {
    showToast("Nenhum vídeo/reel na seleção para transcrever.");
    return;
  }

  let saved = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    showToast(`📝 Transcrevendo ${i + 1}/${items.length}: ${item.code}...`, 120000);

    // Step 1: transcribe (can take 30-120s)
    const transcribeRes = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "transcribe", url: item.url }, (res) => {
        if (chrome.runtime.lastError) { resolve(null); return; }
        resolve(res);
      });
    });

    if (!transcribeRes || transcribeRes.status !== "ok" || !transcribeRes.text) {
      failed++;
      showToast(`❌ Falhou (${i + 1}/${items.length}): ${item.code}`, 3000);
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    // Step 2: save the transcription file
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `transcricao_${item.code}_${ts}.txt`;

    const saveRes = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "saveTranscription", text: transcribeRes.text, filename },
        (res) => {
          if (chrome.runtime.lastError) { resolve(null); return; }
          resolve(res);
        }
      );
    });

    if (saveRes?.status === "ok") {
      saved++;
    } else {
      failed++;
      showToast(`❌ Erro ao salvar (${i + 1}/${items.length}): ${item.code}`, 3000);
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  if (failed === 0) {
    showToast(`✅ ${saved} transcrições salvas em Downloads/FeedFilter/`);
  } else {
    showToast(`✅ ${saved} salvas, ❌ ${failed} falharam`);
  }
}

function resetGrid() {
  const sorted = document.getElementById("ff-sorted-grid");
  const banner = document.getElementById("ff-sort-banner");
  if (sorted) sorted.remove();
  if (banner) banner.remove();
  const gridSection = findGridSection();
  if (gridSection) gridSection.style.display = "";
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "applyFilters")    applyFilters(message.config);
  if (message.action === "batchDownload")   batchDownload(message.codes);
  if (message.action === "batchTranscribe") batchTranscribe(message.codes);
  if (message.action === "resetGrid")       resetGrid();
});
