// tiktok.js — content script para https://www.tiktok.com
// Mirrors the architecture of instagram.js: intercept the feed API, collect
// metadata, sort/filter, render a reordered grid, and download/transcribe
// media client-side using the logged-in session (no cookies.txt/yt-dlp).

// ─── Styles (same visual language as Instagram) ───────────────────────────────

const TT_STYLES = `
  .sf-btn-container {
    position: absolute; bottom: 8px; right: 8px;
    display: flex; gap: 4px; z-index: 9999;
    opacity: 1; pointer-events: all;
  }
  .sf-btn {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(10,10,15,0.92); backdrop-filter: blur(8px);
    border: 1px solid rgba(124,106,247,0.3); color: #e8e8f0;
    font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s ease; padding: 0; line-height: 1; pointer-events: all;
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
    position: fixed; top: 20px; right: 20px;
    transform: translateX(calc(100% + 24px));
    background: #111118; color: #e8e8f0;
    border: 1px solid rgba(124,106,247,0.4); border-radius: 10px;
    padding: 12px 16px; font-size: 13px; font-family: 'JetBrains Mono', monospace;
    line-height: 1.5; z-index: 99999; pointer-events: none; max-width: 300px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    transition: transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.28s ease;
    opacity: 0; overflow: hidden;
  }
  .sf-toast.visible { transform: translateX(0); opacity: 1; }
  .sf-toast-bar {
    position: absolute; bottom: 0; left: 0; height: 2px;
    background: #7c6af7; width: 100%; transform-origin: left;
  }
  .sf-modal-body::-webkit-scrollbar { width: 4px; }

  .sf-progress-banner {
    position: fixed; top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-16px);
    background: #111118; color: #e8e8f0;
    border: 1px solid rgba(124,106,247,0.4); border-radius: 12px;
    padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px;
    z-index: 999999; display: flex; align-items: center; gap: 12px;
    min-width: 320px; box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: all;
  }
  .sf-progress-banner.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
  .sf-progress-banner-icon { font-size: 16px; flex-shrink: 0; }
  .sf-progress-banner-body { flex: 1; min-width: 0; }
  .sf-progress-banner-msg { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sf-progress-banner-track {
    margin-top: 6px; height: 4px; border-radius: 2px;
    background: rgba(124,106,247,0.2); overflow: hidden;
  }
  .sf-progress-banner-fill {
    height: 100%; background: #7c6af7; border-radius: 2px; width: 0%;
    transition: width 0.25s ease;
  }
  .sf-progress-banner-stop {
    flex-shrink: 0; width: 26px; height: 26px; border-radius: 6px;
    background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.5);
    color: #ff6b6b; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 11px;
    transition: background 0.15s;
  }
  .sf-progress-banner-stop:hover { background: rgba(255,107,107,0.3); }
`;

(function injectStyles() {
  if (document.getElementById("sf-tt-styles")) return;
  const el = document.createElement("style");
  el.id = "sf-tt-styles";
  el.textContent = TT_STYLES;
  document.head.appendChild(el);
})();

// ─── Toast ────────────────────────────────────────────────────────────────────

let toastEl = null;
let toastTimer = null;

function showToast(msg, duration = 5000) {
  const minDuration = Math.max(duration, msg.length * 70);
  duration = minDuration;

  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "sf-toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add("visible");

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

// ─── Progress banner — "não role" card with a stop button ────────────────

let progressBannerEl = null;
let progressBannerStopRequested = false;
let progressBannerOnStop = null;

function showProgressBanner(msg, { icon = "⏳", percent = null, stoppable = true, onStop = null } = {}) {
  progressBannerOnStop = onStop;
  if (!progressBannerEl) {
    progressBannerEl = document.createElement("div");
    progressBannerEl.className = "sf-progress-banner";
    progressBannerEl.innerHTML = `
      <span class="sf-progress-banner-icon"></span>
      <div class="sf-progress-banner-body">
        <div class="sf-progress-banner-msg"></div>
        <div class="sf-progress-banner-track"><div class="sf-progress-banner-fill"></div></div>
      </div>
      <button class="sf-progress-banner-stop" title="Parar">■</button>
    `;
    document.body.appendChild(progressBannerEl);
    progressBannerEl.querySelector(".sf-progress-banner-stop").addEventListener("click", () => {
      progressBannerStopRequested = true;
      if (progressBannerOnStop) progressBannerOnStop();
    });
  }

  progressBannerEl.querySelector(".sf-progress-banner-icon").textContent = icon;
  progressBannerEl.querySelector(".sf-progress-banner-msg").textContent = msg;
  progressBannerEl.querySelector(".sf-progress-banner-fill").style.width =
    percent == null ? "0%" : `${Math.min(100, Math.max(0, percent))}%`;
  progressBannerEl.querySelector(".sf-progress-banner-stop").style.display = stoppable ? "" : "none";
  progressBannerEl.classList.add("visible");
}

function hideProgressBanner() {
  progressBannerEl?.classList.remove("visible");
}

function resetProgressBannerStop() {
  progressBannerStopRequested = false;
}

// ─── API interception — injected into page context ────────────────────────────
// Content scripts can't intercept fetch() made by the page itself, so we
// inject a <script> that runs in the page's own JS context.

const apiVideoData = {};

(function injectFetchInterceptor() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("content/tiktok_fetch_interceptor.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
})();

window.addEventListener("message", (e) => {
  if (!e.data?.ff_tt_items) return;
  for (const item of e.data.ff_tt_items) {
    if (!apiVideoData[item.id]) apiVideoData[item.id] = item;
  }
});

// ─── Media collection helpers ──────────────────────────────────────────────────

function extractCodeFromHref(href) {
  if (!href) return null;
  const m = href.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractCodeFromUrl(url) {
  return extractCodeFromHref(url);
}

// ─── Client-side download (mirrors Sort Feed's approach) ──────────────────────
// TikTok has no public media API — Sort Feed's technique is to fetch the
// video's own detail page HTML and parse the SSR JSON blob embedded in it
// (__UNIVERSAL_DATA_FOR_REHYDRATION__), which contains direct CDN URLs.
// credentials:"include" attaches the already-logged-in session automatically.

function safeName(name) {
  return (name || "feedfilter").replace(/[^a-zA-Z0-9_-]/g, "") || "feedfilter";
}

async function fetchBlob(url, signal) {
  const res = await fetch(url, { mode: "cors", credentials: "include", referrer: "https://www.tiktok.com/", signal });
  if (!res.ok) throw new Error(`Falha ao baixar mídia: ${res.status}`);
  return res.blob();
}

function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

async function fetchTikTokItemStruct(userName, videoId, signal) {
  const detailUrl = `https://www.tiktok.com/@${userName}/video/${videoId}`;
  const res = await fetch(detailUrl, { credentials: "include", mode: "cors", referrer: "https://www.tiktok.com/", signal });
  if (!res.ok) throw new Error(`Página do vídeo respondeu ${res.status}`);
  const html = await res.text();
  const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([^<]+)<\/script>/);
  if (!m) throw new Error("Não foi possível encontrar os dados do vídeo na página.");
  const data = JSON.parse(m[1]);
  const scope = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"];
  const itemStruct = scope?.itemInfo?.itemStruct
    || (scope?.ItemModule && (scope.ItemModule[videoId] || Object.values(scope.ItemModule)[0]));
  if (!itemStruct) throw new Error("Vídeo não encontrado (pode ter sido removido).");
  return itemStruct;
}

// Downloads a single TikTok video/photo post entirely client-side.
// Returns a result shaped like the backend's {status, files, file}.
async function downloadTikTokMedia(userName, videoId) {
  const item = await fetchTikTokItemStruct(userName, videoId);
  const user = safeName(userName);

  const images = item.imagePost?.images;
  if (Array.isArray(images) && images.length > 0) {
    const files = [];
    for (let i = 0; i < images.length; i++) {
      const srcUrl = images[i].imageURL?.urlList?.[0];
      if (!srcUrl) continue;
      const filename = `${user}_${videoId}_${i + 1}.jpeg`;
      const blob = await fetchBlob(srcUrl);
      triggerBlobDownload(blob, filename);
      files.push(filename);
    }
    if (files.length === 0) throw new Error("Nenhuma imagem encontrada nesse post.");
    return { status: "ok", files, file: files[0] };
  }

  const bitrateInfo = item.video?.bitrateInfo;
  const srcUrl = (Array.isArray(bitrateInfo) && bitrateInfo.length > 0 &&
      (bitrateInfo[0].PlayAddr?.UrlList?.[0] || bitrateInfo[0].PlayAddr))
    || item.video?.playAddr || item.video?.downloadAddr;
  if (!srcUrl) throw new Error("Não foi possível encontrar o vídeo para download.");

  const filename = `${user}_${videoId}.mp4`;
  const blob = await fetchBlob(srcUrl);
  triggerBlobDownload(blob, filename);
  return { status: "ok", files: [filename], file: filename };
}

const LOCAL_APP_URL = "http://localhost:5123";

// Transcribes a TikTok video: prefers the direct music/audio URL (much
// smaller download) when available, otherwise falls back to the full video.
async function transcribeTikTokMedia(userName, videoId) {
  const item = await fetchTikTokItemStruct(userName, videoId);
  if (item.imagePost?.images?.length) throw new Error("Posts de fotos não têm áudio para transcrever.");

  const musicUrl = item.music?.playUrl;
  const bitrateInfo = item.video?.bitrateInfo;
  const videoUrl = (Array.isArray(bitrateInfo) && bitrateInfo.length > 0 &&
      (bitrateInfo[0].PlayAddr?.UrlList?.[0] || bitrateInfo[0].PlayAddr))
    || item.video?.playAddr || item.video?.downloadAddr;

  const srcUrl = musicUrl || videoUrl;
  if (!srcUrl) throw new Error("Não foi possível encontrar áudio/vídeo para transcrever.");

  const blob = await fetchBlob(srcUrl);
  const form = new FormData();
  form.append("file", blob, `${videoId}.mp4`);

  const res = await fetch(`${LOCAL_APP_URL}/transcribe-blob`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`App local respondeu ${res.status}`);
  return res.json();
}

// ─── Outlier badge ──────────────────────────────────────────────────────────

function injectOutlierBadge(tile, score) {
  if (!score || score < 2) return;
  tile.querySelector(".sf-outlier-badge")?.remove();

  const badge = document.createElement("div");
  badge.className = "sf-outlier-badge";
  badge.textContent = `⚡ ${score.toFixed(1)}×`;
  badge.title = `${score.toFixed(1)}x mais que o normal da conta`;
  badge.style.cssText = `
    position: absolute; top: 8px; left: 8px; z-index: 9998;
    background: rgba(124,106,247,0.92); color: #fff;
    font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
    padding: 3px 7px; border-radius: 6px; pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  `;

  if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
  tile.appendChild(badge);
}

// ─── Button injection ─────────────────────────────────────────────────────────

function injectButtons(tile, userName, videoId) {
  if (tile.querySelector(".sf-btn-container")) return;

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
    setTimeout(() => { btn.classList.remove("sf-loading", "sf-success", "sf-error"); btn.disabled = false; }, delay);
  }

  dlBtn.addEventListener("click", async (e) => {
    stopAll(e);
    dlBtn.disabled = true;
    dlBtn.classList.add("sf-loading");
    try {
      const res = await downloadTikTokMedia(userName, videoId);
      dlBtn.classList.remove("sf-loading");
      dlBtn.classList.add("sf-success");
      const count = res.files.length;
      showToast("✅ Salvo: " + (count > 1 ? `${count} arquivos` : res.file));
    } catch (err) {
      dlBtn.classList.remove("sf-loading");
      dlBtn.classList.add("sf-error");
      showToast("❌ " + (err.message || "Falha ao baixar"));
    }
    resetBtn(dlBtn);
  });

  txBtn.addEventListener("click", async (e) => {
    stopAll(e);
    txBtn.disabled = true;
    txBtn.classList.add("sf-loading");
    try {
      const res = await transcribeTikTokMedia(userName, videoId);
      txBtn.classList.remove("sf-loading");
      if (!res || res.status === "error") {
        txBtn.classList.add("sf-error");
        const msg = res ? res.message : "Erro desconhecido";
        if (msg.includes("rodando")) showToast("Inicie o Feed Filter App para usar esta função");
        else showToast("❌ " + msg);
      } else {
        txBtn.classList.add("sf-success");
        showModal(res.text);
      }
    } catch (err) {
      txBtn.classList.remove("sf-loading");
      txBtn.classList.add("sf-error");
      showToast("❌ " + (err.message || "Falha ao transcrever"));
    }
    resetBtn(txBtn);
  });

  container.appendChild(dlBtn);
  container.appendChild(txBtn);

  if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
  tile.appendChild(container);
}

// ─── Transcription modal (shared visual with Instagram) ───────────────────────

function showModal(text) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(4px);z-index:99998;display:flex;align-items:center;justify-content:center;";

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const modal = document.createElement("div");
  modal.style.cssText = "background:#0a0a0f;border:1px solid #2a2a3a;border-radius:12px;max-width:520px;width:92vw;max-height:75vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;";
  modal.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #2a2a3a;font-family:sans-serif;font-weight:600;font-size:16px;color:#e8e8f0;">
      <span>📝 Transcrição</span>
      <button id="sf-tt-close" style="background:none;border:none;color:#666680;font-size:20px;cursor:pointer;line-height:1;">×</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px 20px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.7;color:#c8c8e8;white-space:pre-wrap;word-break:break-word;user-select:text;">${safeText}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-top:1px solid #2a2a3a;">
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#666680;">${wordCount} palavras</span>
      <div style="display:flex;gap:8px;">
        <button id="sf-tt-save" style="background:#1e1e2e;color:#e8e8f0;border:1px solid #2a2a3a;border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;">💾 Salvar</button>
        <button id="sf-tt-copy" style="background:#1e1e2e;color:#7c6af7;border:1px solid #7c6af7;border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;">📋 Copiar</button>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector("#sf-tt-copy").addEventListener("click", () => {
    navigator.clipboard.writeText(text).then(() => {
      const btn = modal.querySelector("#sf-tt-copy");
      btn.textContent = "✅ Copiado!";
      setTimeout(() => { btn.innerHTML = "📋 Copiar"; }, 2000);
    });
  });

  modal.querySelector("#sf-tt-save").addEventListener("click", () => {
    const saveBtn = modal.querySelector("#sf-tt-save");
    saveBtn.disabled = true;
    saveBtn.textContent = "⏳ Salvando...";
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `transcricao_tiktok_${ts}.txt`;
    chrome.runtime.sendMessage({ action: "saveTranscription", text, filename }, (res) => {
      if (res?.status === "ok") saveBtn.textContent = "✅ Salvo!";
      else { saveBtn.textContent = "❌ Erro"; saveBtn.disabled = false; }
      setTimeout(() => { saveBtn.innerHTML = "💾 Salvar"; saveBtn.disabled = false; }, 3000);
    });
  });

  const close = () => overlay.remove();
  modal.querySelector("#sf-tt-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
}

// ─── Process tiles (profile grid) ──────────────────────────────────────────────

function findProfileTiles() {
  return document.querySelectorAll('[data-e2e="user-post-item-list"] > div, [data-e2e="user-post-item"]');
}

function processTile(tile) {
  if (tile.dataset.sfProcessed) return;
  const link = tile.querySelector('a[href*="/video/"]');
  if (!link) return;
  const videoId = extractCodeFromHref(link.href);
  const userMatch = link.href.match(/tiktok\.com\/@([^/]+)\//);
  const userName = userMatch ? userMatch[1] : "";
  if (!videoId) return;

  tile.dataset.sfProcessed = "true";
  tile.dataset.sfCode = videoId;
  tile.dataset.sfUserName = userName;

  if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
  injectButtons(tile, userName, videoId);
}

function processAll() {
  findProfileTiles().forEach((tile) => {
    if (!tile.dataset.sfProcessed) processTile(tile);
  });
}

let debounceTimer = null;
const observer = new MutationObserver((mutations) => {
  if (!mutations.some((m) => m.addedNodes.length > 0)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processAll, 300);
});
observer.observe(document.body, { childList: true, subtree: true });

console.log("[FeedFilter] tiktok.js carregado ✓");
processAll();

// ─── Filters — sort the profile grid ───────────────────────────────────────────

function findGridSection() {
  const list = document.querySelector('[data-e2e="user-post-item-list"]');
  return list || null;
}

// TikTok also virtualizes its grid — see the comment on instagram.js's
// collectTile for why this actively scrolls instead of waiting passively.
function collectTile(videoId, retries = 16, interval = 120) {
  return new Promise((resolve) => {
    let scrollDir = 1;
    const tryFind = (left) => {
      const anchor = document.querySelector(`a[href*="/video/${videoId}"]`);
      if (anchor) {
        let tile = anchor;
        const parent = anchor.closest('[data-e2e="user-post-item-list"]');
        if (parent) {
          while (tile.parentElement && tile.parentElement !== parent) tile = tile.parentElement;
        }
        tile.scrollIntoView({ behavior: "auto", block: "center" });
        const userMatch = anchor.href.match(/tiktok\.com\/@([^/]+)\//);
        resolve({ element: tile.outerHTML, userName: userMatch ? userMatch[1] : "" });
        return;
      }
      if (left > 0) {
        window.scrollBy(0, scrollDir * window.innerHeight * 3);
        if (left % 4 === 0) scrollDir *= -1;
        setTimeout(() => tryFind(left - 1), interval);
      } else {
        resolve(null);
      }
    };
    tryFind(retries);
  });
}

function renderSortedGrid(items, sortLabel, initialSortBy) {
  document.getElementById("ff-tt-sorted-grid")?.remove();
  document.getElementById("ff-tt-sort-banner")?.remove();

  const gridSection = findGridSection();
  if (!gridSection) {
    showToast("❌ Grid não encontrado. Tente recarregar a página.");
    return;
  }
  if (items.length === 0) {
    showToast("❌ Nenhum tile capturado. Verifique o console para detalhes.");
    return;
  }

  gridSection.style.display = "none";

  const newGrid = document.createElement("div");
  newGrid.id = "ff-tt-sorted-grid";
  newGrid.className = gridSection.className;
  newGrid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:8px;position:relative;";
  gridSection.after(newGrid);

  const allItems = items; // untouched full set — Filters always re-derives from this
  let visibleItems = items;

  renderTileRows(newGrid, visibleItems);

  const resetFn = () => {
    document.getElementById("ff-tt-sorted-grid")?.remove();
    document.getElementById("ff-tt-sort-banner")?.remove();
    gridSection.style.display = "";
  };
  const resortFn = (newSortBy) => {
    resortItems(visibleItems, newSortBy);
    renderTileRows(newGrid, visibleItems);
  };
  const filterFn = (filtered) => {
    visibleItems = filtered;
    renderTileRows(newGrid, visibleItems);
    injectResultPanel(newGrid, visibleItems, sortLabel, resetFn, "video",
      { sortBy: initialSortBy, onResort: resortFn, menu: SORT_MENU_TT }, filterOptsFor());
  };
  const filterOptsFor = () => ({ allItems, metrics: FILTER_METRICS_TT, onFilter: filterFn });

  injectResultPanel(newGrid, visibleItems, sortLabel, resetFn, "video",
    { sortBy: initialSortBy, onResort: resortFn, menu: SORT_MENU_TT }, filterOptsFor());

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTileRows(gridEl, items) {
  gridEl.innerHTML = "";
  for (const item of items) {
    if (!item.element) continue;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = item.element;
    const tile = wrapper.firstElementChild;
    if (!tile) continue;
    item.url = `https://www.tiktok.com/@${item.userName}/video/${item.code}`;
    if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
    tile.dataset.ffTileCode = item.code;
    injectButtons(tile, item.userName, item.code);
    injectOutlierBadge(tile, item.outlierScore);
    gridEl.appendChild(tile);
  }
}

const SORT_SCORE_FNS_TT = {
  views:    (c) => (c.views    || 0),
  likes:    (c) => (c.likes    || 0),
  comments: (c) => (c.comments || 0),
  shares:   (c) => (c.shares   || 0),
  saves:    (c) => (c.saves    || 0),
  newest:   (c) => (c.taken_at || 0),
  oldest:   (c) => -(c.taken_at || 0),
  outlier:  (c) => (c.outlierScore ?? 0),
};

function resortItems(items, sortBy) {
  const scoreOf = SORT_SCORE_FNS_TT[sortBy];
  if (scoreOf) items.sort((a, b) => scoreOf(b) - scoreOf(a));
}

const SORT_MENU_TT = [
  ["views",    "▶ Views"],
  ["likes",    "♡ Likes"],
  ["outlier",  "⚡ Outlier score"],
  ["comments", "💬 Comments"],
  ["shares",   "↗ Shares"],
  ["saves",    "🔖 Saves"],
  ["newest",   "🕐 Mais recentes"],
  ["oldest",   "🕐 Oldest"],
];

const FILTER_METRICS_TT = [["views", "Views"], ["likes", "Likes"], ["outlierScore", "Outlier score"]];

// ─── Result panel — Download all / Copy / Select / Sort by / Filters (mirrors Sort Feed's post-sort bar) ─
// `filterOpts` (optional): { allItems, metrics, onFilter(filteredItems) }
function injectResultPanel(gridEl, items, sortLabel, resetFn, mediaKind, resortOpts = null, filterOpts = null) {
  document.getElementById("ff-tt-sort-banner")?.remove();

  let selectMode = false;
  let sortDropdownOpen = false;
  const selected = new Set();
  let currentSortBy = resortOpts?.sortBy;
  const sortMenu = resortOpts?.menu || SORT_MENU_TT;

  const banner = document.createElement("div");
  banner.id = "ff-tt-sort-banner";
  banner.style.cssText = `
    display:flex; flex-direction:column; gap:10px;
    padding:14px 20px; margin-bottom:4px;
    background:#0a0a0f; border:1px solid #2a2a3e; border-radius:10px;
    color:#e8e8f0; font-size:13px; font-family:sans-serif;
  `;

  function actionBtn(label, id) {
    return `<button id="${id}" style="
      background:#1e1e2e;color:#e8e8f0;border:1px solid #2a2a3e;
      border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;
      display:flex;align-items:center;gap:6px;transition:border-color .15s;
    ">${label}</button>`;
  }

  function currentSortItemLabel() {
    return sortMenu.find(([v]) => v === currentSortBy)?.[1] || sortLabel;
  }

  function render() {
    const count = selectMode ? selected.size : items.length;
    banner.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span>✅ <strong>${items.length}</strong> ${mediaKind === "video" ? "vídeos" : "posts"} — <em>${sortLabel}</em></span>
        <div style="display:flex;gap:6px;position:relative;">
          ${(!selectMode && filterOpts) ? actionBtn("≡ Filters", "ff-tt-panel-filters") : ""}
          ${selectMode ? "" : actionBtn("⬇ Download all", "ff-tt-panel-dlall")}
          ${selectMode ? "" : actionBtn("📋 Copy", "ff-tt-panel-copy")}
          ${(!selectMode && resortOpts) ? actionBtn(`↕ Sort by: ${currentSortItemLabel()}`, "ff-tt-panel-sortby") : ""}
          ${actionBtn(selectMode ? `☑ ${count} selecionados` : "☐ Select", "ff-tt-panel-select")}
          ${selectMode ? actionBtn("⬇ Baixar selecionados", "ff-tt-panel-dlsel") : ""}
          ${actionBtn("Resetar", "ff-tt-panel-reset")}
          <div id="ff-tt-panel-sortby-menu" style="
            display:none; position:absolute; top:calc(100% + 6px); right:0; z-index:10;
            background:#111118; border:1px solid #2a2a3e; border-radius:8px;
            padding:6px; min-width:180px; box-shadow:0 12px 32px rgba(0,0,0,0.5);
          "></div>
        </div>
      </div>
    `;

    banner.querySelector("#ff-tt-panel-reset")?.addEventListener("click", resetFn);

    banner.querySelector("#ff-tt-panel-filters")?.addEventListener("click", () => {
      FeedFilterFiltersModal.openFiltersModal({
        allItems: filterOpts.allItems,
        metrics: filterOpts.metrics,
        onApply: (filtered) => filterOpts.onFilter(filtered),
      });
    });

    banner.querySelector("#ff-tt-panel-dlall")?.addEventListener("click", () => {
      batchDownloadItems(items);
    });

    banner.querySelector("#ff-tt-panel-copy")?.addEventListener("click", () => {
      const tsv = items.map((i) => `${i.userName}\t${i.url}\t${i.likes ?? ""}\t${i.views ?? ""}`).join("\n");
      navigator.clipboard.writeText(tsv).then(() => showToast("✅ Copiado para a área de transferência"));
    });

    const sortByBtn = banner.querySelector("#ff-tt-panel-sortby");
    const sortByMenu = banner.querySelector("#ff-tt-panel-sortby-menu");
    if (sortByBtn && sortByMenu) {
      sortByMenu.innerHTML = sortMenu.map(([value, label]) => `
        <div data-sort-value="${value}" style="
          padding:8px 10px; border-radius:6px; cursor:pointer; font-size:12px;
          ${value === currentSortBy ? "background:rgba(124,106,247,0.18); color:#7c6af7;" : "color:#e8e8f0;"}
        ">${label}</div>
      `).join("");
      sortByMenu.style.display = sortDropdownOpen ? "block" : "none";

      sortByBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sortDropdownOpen = !sortDropdownOpen;
        sortByMenu.style.display = sortDropdownOpen ? "block" : "none";
      });

      sortByMenu.querySelectorAll("[data-sort-value]").forEach((row) => {
        row.addEventListener("mouseenter", () => { row.style.background = "rgba(124,106,247,0.12)"; });
        row.addEventListener("mouseleave", () => {
          row.style.background = row.dataset.sortValue === currentSortBy ? "rgba(124,106,247,0.18)" : "";
        });
        row.addEventListener("click", (e) => {
          e.stopPropagation();
          currentSortBy = row.dataset.sortValue;
          sortDropdownOpen = false;
          resortOpts.onResort(currentSortBy);
          render();
        });
      });
    }

    banner.querySelector("#ff-tt-panel-select")?.addEventListener("click", () => {
      if (selectMode) return;
      selectMode = true;
      selected.clear();
      gridEl.querySelectorAll("[data-ff-select-code]").forEach((cb) => cb.remove());
      gridEl.querySelectorAll("[data-ff-tile-code]").forEach((tile) => {
        addSelectCheckbox(tile, tile.dataset.ffTileCode, selected, render);
      });
      render();
    });

    banner.querySelector("#ff-tt-panel-dlsel")?.addEventListener("click", () => {
      const chosen = items.filter((i) => selected.has(i.code));
      if (chosen.length === 0) { showToast("Nenhum item selecionado."); return; }
      batchDownloadItems(chosen);
    });
  }

  render();
  gridEl.before(banner);

  document.addEventListener("click", () => {
    if (!sortDropdownOpen) return;
    sortDropdownOpen = false;
    const menu = banner.querySelector("#ff-tt-panel-sortby-menu");
    if (menu) menu.style.display = "none";
  });
}

function addSelectCheckbox(tile, code, selectedSet, onChange) {
  if (tile.querySelector(".sf-select-circle")) return;
  const circle = document.createElement("div");
  circle.className = "sf-select-circle";
  circle.dataset.ffSelectCode = code;
  circle.style.cssText = `
    position:absolute; top:8px; left:8px; z-index:9998;
    width:22px; height:22px; border-radius:50%;
    background:rgba(10,10,15,0.85); border:2px solid #7c6af7;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:12px;
  `;
  circle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (selectedSet.has(code)) {
      selectedSet.delete(code);
      circle.style.background = "rgba(10,10,15,0.85)";
      circle.textContent = "";
    } else {
      selectedSet.add(code);
      circle.style.background = "#7c6af7";
      circle.textContent = "✓";
    }
    onChange();
  });
  if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
  tile.appendChild(circle);
}

async function batchDownloadItems(items) {
  let done = 0, failed = 0;
  for (const item of items) {
    showToast(`⬇ Baixando ${done + failed + 1}/${items.length}...`, 60000);
    try {
      await downloadTikTokMedia(item.userName, item.code);
      done++;
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  showToast(failed === 0 ? `✅ ${done} arquivos baixados.` : `✅ ${done} baixados, ❌ ${failed} falharam.`);
}

async function applyFilters(config) {
  const { quantity, sortBy, dateRange } = config;

  let collected = [];
  let lastCount = 0;
  let stuckCycles = 0;

  resetProgressBannerStop();
  showProgressBanner(`0 vídeos encontrados — não role a tela`, {
    icon: "⏳", percent: 0,
    onStop: () => showProgressBanner("Parando...", { icon: "⏳", stoppable: false }),
  });

  const inRange = (c) => !dateRange || ((c.taken_at || 0) >= dateRange.fromMs && (c.taken_at || 0) <= dateRange.toMs);

  while (!progressBannerStopRequested) {
    // apiVideoData is the source of truth — resync every cycle rather than
    // only adding brand-new ids, same fix as instagram.js's collection loop.
    for (const [id, data] of Object.entries(apiVideoData)) {
      const idx = collected.findIndex((c) => c.code === id);
      if (idx === -1) collected.push({ code: id, ...data });
      else collected[idx] = { code: id, ...data };
    }

    const filtered = collected.filter(inRange);
    showProgressBanner(`${filtered.length} de ${quantity} vídeos — não role a tela`, {
      icon: "⏳", percent: Math.min(100, (filtered.length / quantity) * 100),
      onStop: () => showProgressBanner("Parando...", { icon: "⏳", stoppable: false }),
    });
    if (filtered.length >= quantity) break;

    const progressCount = dateRange ? collected.length : filtered.length;
    if (progressCount === lastCount) {
      stuckCycles++;
      if (stuckCycles >= 4) break;
    } else {
      stuckCycles = 0;
    }
    lastCount = progressCount;

    if (dateRange && collected.length > 0) {
      const oldestSeenMs = Math.min(...collected.map((c) => c.taken_at || 0).filter(Boolean));
      if (oldestSeenMs && oldestSeenMs < dateRange.fromMs) break;
    }

    window.scrollBy(0, window.innerHeight * 2);
    await new Promise((r) => setTimeout(r, 1500));
  }

  let toRender = collected.filter(inRange);

  // TikTok is views-only for outlier scoring (no post/reel split like IG).
  if (sortBy === "outlier") {
    toRender = FeedFilterOutlier.scoreItemsByOutlier(toRender, "views");
  }

  resortItems(toRender, sortBy);

  toRender = toRender.slice(0, quantity);

  showProgressBanner(`Organizando 0/${toRender.length} — não role a tela`, { icon: "🧩", percent: 0, stoppable: false });
  window.scrollTo({ top: 0, behavior: "instant" });
  await new Promise((r) => setTimeout(r, 600));

  const withHTML = [];
  for (let i = 0; i < toRender.length; i++) {
    const item = toRender[i];
    showProgressBanner(`Organizando ${i}/${toRender.length} — não role a tela`, {
      icon: "🧩", percent: (i / toRender.length) * 100, stoppable: false,
    });
    const result = await collectTile(item.code);
    withHTML.push({ ...item, ...(result || { element: null, userName: item.userName }) });
  }

  hideProgressBanner();

  const sortLabel = {
    views: "mais views", likes: "mais curtidas", comments: "mais comentários",
    shares: "mais compartilhamentos", saves: "mais salvos",
    newest: "mais recentes", oldest: "mais antigos", outlier: "outliers (fora da curva)",
  }[sortBy] || sortBy;

  const finalItems = withHTML.filter((i) => i.element);
  showToast(`✅ ${finalItems.length} vídeos ordenados por ${sortLabel}`, 3500);
  renderSortedGrid(finalItems, sortLabel, sortBy);

  const batchList = finalItems.map((i) => ({
    code: i.code,
    userName: i.userName,
    views: i.views, likes: i.likes,
    url: `https://www.tiktok.com/@${i.userName}/video/${i.code}`,
  }));
  chrome.storage.local.set({ ffTikTokBatchList: batchList });
}

async function batchDownload(codes) {
  const list = await chrome.storage.local.get("ffTikTokBatchList").then(d => d.ffTikTokBatchList || []);
  const items = codes ? list.filter(i => codes.includes(i.code)) : list;
  await batchDownloadItems(items);
}

function resetGrid() {
  document.getElementById("ff-tt-sorted-grid")?.remove();
  document.getElementById("ff-tt-sort-banner")?.remove();
  const gridSection = findGridSection();
  if (gridSection) gridSection.style.display = "";
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "applyFilters")  applyFilters(message.config);
  if (message.action === "batchDownload") batchDownload(message.codes);
  if (message.action === "resetGrid")     resetGrid();
});
