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

  .sf-progress-banner {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-16px);
    background: #111118;
    color: #e8e8f0;
    border: 1px solid rgba(124,106,247,0.4);
    border-radius: 12px;
    padding: 12px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 320px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: all;
  }
  .sf-progress-banner.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .sf-progress-banner-icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  .sf-progress-banner-body { flex: 1; min-width: 0; }
  .sf-progress-banner-msg {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sf-progress-banner-track {
    margin-top: 6px;
    height: 4px;
    border-radius: 2px;
    background: rgba(124,106,247,0.2);
    overflow: hidden;
  }
  .sf-progress-banner-fill {
    height: 100%;
    background: #7c6af7;
    border-radius: 2px;
    width: 0%;
    transition: width 0.25s ease;
  }
  .sf-progress-banner-stop {
    flex-shrink: 0;
    width: 26px; height: 26px;
    border-radius: 6px;
    background: rgba(255,107,107,0.15);
    border: 1px solid rgba(255,107,107,0.5);
    color: #ff6b6b;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    transition: background 0.15s;
  }
  .sf-progress-banner-stop:hover { background: rgba(255,107,107,0.3); }

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
  // Long messages (e.g. login-required explanations) need more time to read.
  // ~14 chars/sec reading speed, floor at the caller's requested duration.
  const minDuration = Math.max(duration, msg.length * 70);
  duration = minDuration;

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

// ─── Progress banner — "não role" card with a stop button ────────────────
// Unlike showToast (auto-dismissing, fire-and-forget), this stays pinned
// while a sort/collection is running so the user knows not to touch the
// page, and lets them bail out early via the stop button.

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

// ─── Client-side media download (mirrors Sort Feed's approach) ────────────────
// Instagram now requires an authenticated session to fetch most media. Rather
// than asking the local app to authenticate as a separate process (which
// needs cookies exported to disk), we do what Sort Feed does: call
// Instagram's own private API from inside the already-logged-in tab, using
// `credentials: "include"` so the browser attaches the session cookies
// automatically. No cookies.txt, no browser cookie extraction needed.

const IG_APP_ID = "936619743392459";

async function fetchMediaInfo(mediaId, signal) {
  const res = await fetch(`https://www.instagram.com/api/v1/media/${mediaId}/info/`, {
    method: "GET",
    credentials: "include",
    signal,
    headers: {
      "x-ig-app-id": IG_APP_ID,
      "x-ig-www-claim": window._sharedData?.config?.csrf_token || "",
    },
  });
  if (!res.ok) throw new Error(`Instagram API respondeu ${res.status}`);
  return res.json();
}

async function fetchBlob(url, signal) {
  const res = await fetch(url, { signal });
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

function safeName(name) {
  return (name || "feedfilter").replace(/[^a-zA-Z0-9_-]/g, "") || "feedfilter";
}

// Downloads a single Instagram post/reel/carousel entirely client-side.
// Returns a result shaped like the backend's {status, files, file} so
// existing onDownloadResult handlers keep working unmodified.
async function downloadInstagramMedia(mediaId, userName, code) {
  const data = await fetchMediaInfo(mediaId);
  const item = data.items?.[0];
  if (!item) throw new Error("Instagram não retornou dados desse post.");

  const user = safeName(userName);
  const postCode = code || item.code || mediaId;

  if (item.carousel_media?.length) {
    const files = [];
    for (let i = 0; i < item.carousel_media.length; i++) {
      const media = item.carousel_media[i];
      const isVideo = !!media.video_versions;
      const srcUrl = isVideo
        ? media.video_versions[0].url
        : media.image_versions2.candidates[0].url;
      const ext = isVideo ? "mp4" : "jpg";
      const filename = `${user}_${postCode}_${i + 1}.${ext}`;
      const blob = await fetchBlob(srcUrl);
      triggerBlobDownload(blob, filename);
      files.push(filename);
    }
    return { status: "ok", files, file: files[0] };
  }

  const isVideo = !!item.video_versions;
  const srcUrl = isVideo
    ? item.video_versions[0].url
    : item.image_versions2.candidates[0].url;
  const ext = isVideo ? "mp4" : "jpg";
  const filename = `${user}_${postCode}.${ext}`;
  const blob = await fetchBlob(srcUrl, undefined);
  triggerBlobDownload(blob, filename);
  return { status: "ok", files: [filename], file: filename };
}

const LOCAL_APP_URL = "http://localhost:5123";

// Transcribes a reel/video by fetching it client-side (same session-based
// approach as downloadInstagramMedia) and uploading the blob to the local
// app's Whisper backend — sidesteps yt-dlp/cookies entirely for Instagram.
async function transcribeInstagramMedia(mediaId, code) {
  const data = await fetchMediaInfo(mediaId);
  const item = data.items?.[0];
  if (!item) throw new Error("Instagram não retornou dados desse post.");
  if (item.carousel_media?.length) throw new Error("Carrosséis não têm áudio para transcrever.");
  if (!item.video_versions) throw new Error("Esse post não é um vídeo.");

  const postCode = code || item.code || mediaId;
  const blob = await fetchBlob(item.video_versions[0].url);

  const form = new FormData();
  form.append("file", blob, `${postCode}.mp4`);

  const res = await fetch(`${LOCAL_APP_URL}/transcribe-blob`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`App local respondeu ${res.status}`);
  return res.json();
}

// ─── Outlier badge ──────────────────────────────────────────────────────────

function injectOutlierBadge(tile, score) {
  if (!score || score < 2) return; // Sort Feed's threshold: only badge 2x+ standouts
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

  dlBtn.addEventListener("click", async (e) => {
    stopAll(e);
    dlBtn.disabled = true;
    dlBtn.classList.add("sf-loading");

    // Preferred path: download client-side using Instagram's own API with the
    // tab's logged-in session — no cookies.txt, no local app required. Only
    // possible when we captured this post's numeric media id from the XHR feed.
    const code = extractCodeFromUrl(url);
    const api = code ? apiPostData[code] : null;
    if (api?.pk) {
      try {
        const res = await downloadInstagramMedia(api.pk, undefined, code);
        onDownloadResult(res);
      } catch (err) {
        onDownloadResult({ status: "error", message: err.message || "Falha ao baixar" });
      }
      return;
    }

    // Fallback: media id unknown yet (post not seen by the XHR interceptor) —
    // use the local app (yt-dlp) instead.
    if (url && url.includes("/reel/")) {
      chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
      return;
    }

    const domUrls = collectVisibleMedia(article);
    const hasVideo = !!findMediaScope(article).querySelector("video");

    if (domUrls.length > 1) {
      dlBtn.classList.remove("sf-loading");
      dlBtn.disabled = false;
      showToast("🖼️ Carrossel: abra o post em tela cheia e clique em ⬇ novamente para baixar todos os slides.");
      return;
    }

    if (hasVideo) {
      chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
      return;
    }

    if (domUrls.length === 1) {
      chrome.runtime.sendMessage({ action: "downloadCarousel", urls: domUrls }, onDownloadResult);
      return;
    }

    chrome.runtime.sendMessage({ action: "download", url }, onDownloadResult);
  });

  function onTranscribeResult(res) {
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
  }

  txBtn.addEventListener("click", async (e) => {
    stopAll(e);
    txBtn.disabled = true;
    txBtn.classList.add("sf-loading");
    showProgress();

    const code = extractCodeFromUrl(url);
    const api = code ? apiPostData[code] : null;
    if (api?.pk) {
      try {
        const res = await transcribeInstagramMedia(api.pk, code);
        onTranscribeResult(res);
      } catch (err) {
        onTranscribeResult({ status: "error", message: err.message || "Falha ao transcrever" });
      }
      return;
    }

    chrome.runtime.sendMessage({ action: "transcribe", url }, onTranscribeResult);
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

  dlBtn.addEventListener("click", async (e) => {
    stopAll(e);
    dlBtn.disabled = true;
    dlBtn.classList.add("sf-loading");

    const code = extractCodeFromUrl(url);
    const api = code ? apiPostData[code] : null;
    if (api?.pk) {
      try {
        const res = await downloadInstagramMedia(api.pk, undefined, code);
        onDownloadResult(res);
      } catch (err) {
        onDownloadResult({ status: "error", message: err.message || "Falha ao baixar" });
      }
      return;
    }

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

  function onTranscribeResult(res) {
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
  }

  txBtn.addEventListener("click", async (e) => {
    stopAll(e);
    txBtn.disabled = true;
    txBtn.classList.add("sf-loading");
    showProgress();

    const code = extractCodeFromUrl(url);
    const api = code ? apiPostData[code] : null;
    if (api?.pk) {
      try {
        const res = await transcribeInstagramMedia(api.pk, code);
        onTranscribeResult(res);
      } catch (err) {
        onTranscribeResult({ status: "error", message: err.message || "Falha ao transcrever" });
      }
      return;
    }

    chrome.runtime.sendMessage({ action: "transcribe", url }, onTranscribeResult);
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
//
// Instagram virtualizes the grid: tiles far from the viewport get torn down
// from the DOM to save memory, even after having been visited during
// collection. Since the sorted result can put a "buried" post first, this
// can't just wait passively for it to reappear — it has to actively scroll
// to nudge Instagram's own lazy-render/infinite-scroll into re-mounting it.
// Without that push, each miss burned its full retry budget doing nothing,
// which is what made "Organizando" crawl for large result sets.
function collectTile(code, retries = 16, interval = 120) {
  return new Promise((resolve) => {
    let scrollDir = 1;
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
      if (left > 0) {
        // Nudge the page every attempt so Instagram's virtualization has a
        // reason to mount more tiles, alternating direction so we don't just
        // scroll straight off the end of the feed chasing a post that's
        // actually further up.
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

// Sort-by options shown in the result panel's dropdown, keyed like SORT_SCORE_FNS_IG.
const SORT_MENU_IG = [
  ["views",    "▶ Views"],
  ["likes",    "♡ Likes"],
  ["outlier",  "⚡ Outlier score"],
  ["comments", "💬 Comments"],
  ["newest",   "🕐 Mais recentes"],
  ["oldest",   "🕐 Oldest"],
];

// Metrics offered in the Filters modal's "Performance range" picker.
const FILTER_METRICS_IG = [["views", "Views"], ["likes", "Likes"], ["outlierScore", "Outlier score"]];

// ─── Result panel — Download all / Copy / Select / Sort by / Filters (mirrors Sort Feed's post-sort bar) ─
// `mediaKind` is "post" (Instagram) — passed through so the label reads
// naturally ("posts" vs "reels" vs "vídeos") without hardcoding per platform.
// `resortOpts` (optional): { sortBy, onResort(newSortBy), menu } enables the
// in-panel "Sort by" dropdown that re-ranks already-captured items instantly.
// `filterOpts` (optional): { allItems, metrics, onFilter(filteredItems) }
// enables the "Filters" button (performance range + date modal).
function injectResultPanel(gridEl, items, sortLabel, resetFn, mediaKind, resortOpts = null, filterOpts = null) {
  document.getElementById("ff-sort-banner")?.remove();

  let selectMode = false;
  let sortDropdownOpen = false;
  const selected = new Set();
  let currentSortBy = resortOpts?.sortBy;
  const sortMenu = resortOpts?.menu || SORT_MENU_IG;

  const banner = document.createElement("div");
  banner.id = "ff-sort-banner";
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
          ${(!selectMode && filterOpts) ? actionBtn("≡ Filters", "ff-panel-filters") : ""}
          ${selectMode ? "" : actionBtn("⬇ Download all", "ff-panel-dlall")}
          ${selectMode ? "" : actionBtn("📋 Copy", "ff-panel-copy")}
          ${(!selectMode && resortOpts) ? actionBtn(`↕ Sort by: ${currentSortItemLabel()}`, "ff-panel-sortby") : ""}
          ${actionBtn(selectMode ? `☑ ${count} selecionados` : "☐ Select", "ff-panel-select")}
          ${selectMode ? actionBtn("⬇ Baixar selecionados", "ff-panel-dlsel") : ""}
          ${actionBtn("Resetar", "ff-panel-reset")}
          <div id="ff-panel-sortby-menu" style="
            display:none; position:absolute; top:calc(100% + 6px); right:0; z-index:10;
            background:#111118; border:1px solid #2a2a3e; border-radius:8px;
            padding:6px; min-width:180px; box-shadow:0 12px 32px rgba(0,0,0,0.5);
          "></div>
        </div>
      </div>
    `;

    banner.querySelector("#ff-panel-reset")?.addEventListener("click", resetFn);

    banner.querySelector("#ff-panel-filters")?.addEventListener("click", () => {
      FeedFilterFiltersModal.openFiltersModal({
        allItems: filterOpts.allItems,
        metrics: filterOpts.metrics,
        onApply: (filtered) => filterOpts.onFilter(filtered),
      });
    });

    banner.querySelector("#ff-panel-dlall")?.addEventListener("click", () => {
      batchDownloadItems(items);
    });

    banner.querySelector("#ff-panel-copy")?.addEventListener("click", () => {
      const tsv = items.map((i) => `${i.userName}\t${i.url}\t${i.likes ?? ""}\t${i.views ?? ""}`).join("\n");
      navigator.clipboard.writeText(tsv).then(() => showToast("✅ Copiado para a área de transferência"));
    });

    const sortByBtn = banner.querySelector("#ff-panel-sortby");
    const sortByMenu = banner.querySelector("#ff-panel-sortby-menu");
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

    banner.querySelector("#ff-panel-select")?.addEventListener("click", () => {
      if (selectMode) {
        // Clicking the counter while in select mode just refreshes; actual
        // exit happens via Resetar or after a batch action completes.
        return;
      }
      selectMode = true;
      selected.clear();
      gridEl.querySelectorAll("[data-ff-select-code]").forEach((cb) => cb.remove());
      gridEl.querySelectorAll("[data-ff-tile-code]").forEach((tile) => {
        addSelectCheckbox(tile, tile.dataset.ffTileCode, selected, render);
      });
      render();
    });

    banner.querySelector("#ff-panel-dlsel")?.addEventListener("click", () => {
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
    const menu = banner.querySelector("#ff-panel-sortby-menu");
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

// Downloads a batch of {code, pk, url, mediaType, userName} items using the
// same client-side path as the single-item download button.
async function batchDownloadItems(items) {
  let done = 0, failed = 0;
  for (const item of items) {
    showToast(`⬇ Baixando ${done + failed + 1}/${items.length}...`, 60000);
    try {
      if (item.pk) {
        await downloadInstagramMedia(item.pk, item.userName, item.code);
      } else {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ action: "download", url: item.url }, (res) => {
            if (!res || res.status === "error") reject(new Error(res?.message || "erro"));
            else resolve();
          });
        });
      }
      done++;
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  showToast(failed === 0 ? `✅ ${done} arquivos baixados.` : `✅ ${done} baixados, ❌ ${failed} falharam.`);
}

// Renders sorted items exactly like Sort Feed's rn() function:
// hides original grid, creates #ff-sorted-grid div with same className,
// injects rows of 4 tiles using the captured outerHTML.
function renderSortedGrid(items, sortLabel, initialSortBy) {
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

  const allItems = items; // untouched full set — Filters always re-derives from this
  let visibleItems = items;

  renderTileRows(newGrid, visibleItems);

  const resetFn = () => {
    document.getElementById("ff-sorted-grid")?.remove();
    document.getElementById("ff-sort-banner")?.remove();
    gridSection.style.display = "";
  };
  const resortFn = (newSortBy) => {
    resortItems(visibleItems, newSortBy);
    renderTileRows(newGrid, visibleItems);
  };
  const filterFn = (filtered) => {
    visibleItems = filtered;
    renderTileRows(newGrid, visibleItems);
    injectResultPanel(newGrid, visibleItems, sortLabel, resetFn, "post",
      { sortBy: initialSortBy, onResort: resortFn }, filterOptsFor());
  };
  const filterOptsFor = () => ({ allItems, metrics: FILTER_METRICS_IG, onFilter: filterFn });

  injectResultPanel(newGrid, visibleItems, sortLabel, resetFn, "post",
    { sortBy: initialSortBy, onResort: resortFn }, filterOptsFor());

  // Scroll to top like Sort Feed does
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Instagram profile grid uses rows of 3 tiles (not 4 like Sort Feed uses for reels)
function renderTileRows(gridEl, items) {
  gridEl.innerHTML = "";
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
      item.url = url; // used by the result panel's Download all / Copy / Select
      if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
      tile.dataset.ffTileCode = item.code;
      injectButtons(tile, url);
      injectOutlierBadge(tile, item.outlierScore);

      row.appendChild(tile);
    }

    // Pad row with spacers if < ROW_SIZE (Sort Feed pattern)
    while (row.children.length < ROW_SIZE) {
      const spacer = document.createElement("div");
      spacer.className = SPACER_CLASS;
      row.appendChild(spacer);
    }

    gridEl.appendChild(row);
  }
}

// Re-sorts already-captured items in place — no new network/scroll needed,
// used by the result panel's "Sort by" dropdown to re-rank instantly.
const SORT_SCORE_FNS_IG = {
  likes:    (c) =>  (c.likes    || 0),
  views:    (c) =>  (c.views    || 0),
  comments: (c) =>  (c.comments || 0),
  newest:   (c) =>  (c.taken_at || 0),
  oldest:   (c) => -(c.taken_at || 0),
  outlier:  (c) =>  (c.outlierScore ?? 0),
};

function resortItems(items, sortBy) {
  const scoreOf = SORT_SCORE_FNS_IG[sortBy];
  if (scoreOf) items.sort((a, b) => scoreOf(b) - scoreOf(a));
}

// Instagram only fires the reels XHR (clips__user__connection_v2) while the
// profile's "Reels" tab is open — the "Posts" tab never requests reel data,
// even for accounts that have reels. Detect which tab is active so we can
// warn the user instead of silently collecting zero reels.
function activeProfileTabLabel() {
  const tabs = document.querySelectorAll('[role="tablist"] [role="tab"]');
  for (const tab of tabs) {
    if (tab.getAttribute("aria-selected") === "true") {
      return (tab.textContent || "").trim().toLowerCase();
    }
  }
  return null;
}

// Which Instagram surface is the current page — determines which API the
// XHR/fetch interceptor is listening to, and which filters make sense.
//   profile: /<username>/ (Posts/Reels tabs)
//   saved:   /<username>/saved/ or /<username>/saved/<collection>/
//   search:  /explore/search/
function detectSurface() {
  const path = window.location.pathname;
  if (path.includes("/saved")) return "saved";
  if (path.startsWith("/explore/search")) return "search";
  return "profile";
}

// Main collection + sort loop — mirrors sort_item_posts / sort_not_all_reels
async function applyFilters(config) {
  const { quantity, contentType, sortBy, dateRange } = config;
  const surface = detectSurface();

  if (surface === "profile" && contentType === "reels") {
    const activeTab = activeProfileTabLabel();
    if (activeTab && !activeTab.includes("reel")) {
      showToast("⚠️ Abra a aba \"Reels\" do perfil antes de filtrar por Reels — o Instagram só carrega esses dados nessa aba.", 6000);
      return;
    }
  }

  // Instagram's search API doesn't return view counts at all.
  if (surface === "search" && sortBy === "views") {
    showToast("⚠️ A busca do Instagram não informa views — escolha outra métrica de ordenação.", 5000);
    return;
  }

  let collected = []; // { code, likes, views, comments, mediaType, taken_at }
  let lastCount = 0;
  let stuckCycles = 0;

  resetProgressBannerStop();
  showProgressBanner(`0 posts encontrados — não role a tela`, {
    icon: "⏳", percent: 0,
    onStop: () => showProgressBanner("Parando...", { icon: "⏳", stoppable: false }),
  });

  // Phase 1: scroll and collect metadata from XHR
  while (!progressBannerStopRequested) {
    // apiPostData is the source of truth (full, accurate metrics from the
    // API response). It can arrive either before or after an article's DOM
    // node is processed, so re-sync it into `collected` every cycle instead
    // of only adding brand-new codes — otherwise a post whose DOM snapshot
    // was taken before its API data arrived stays stuck at zeroed metrics
    // (dataset.sfViews etc. are written once in processArticle and never
    // refreshed), which corrupts the sort.
    for (const [code, data] of Object.entries(apiPostData)) {
      const idx = collected.findIndex((c) => c.code === code);
      if (idx === -1) collected.push({ code, ...data });
      else collected[idx] = { code, ...data };
    }

    // Also pull from already-processed articles in DOM — only as a fallback
    // for posts apiPostData hasn't seen at all yet (e.g. XHR still pending).
    document.querySelectorAll("[data-sf-processed]").forEach((el) => {
      const code = extractCodeFromUrl(el.dataset.sfUrl || "");
      if (!code || apiPostData[code] || collected.some((c) => c.code === code)) return;
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
      if (contentType !== "all" && (c.mediaType === 2 ? "reels" : "posts") !== contentType) return false;
      if (dateRange) {
        const ms = (c.taken_at || 0) * 1000;
        if (ms < dateRange.fromMs || ms > dateRange.toMs) return false;
      }
      return true;
    });

    showProgressBanner(`${filtered.length} de ${quantity} posts — não role a tela`, {
      icon: "⏳", percent: Math.min(100, (filtered.length / quantity) * 100),
      onStop: () => showProgressBanner("Parando...", { icon: "⏳", stoppable: false }),
    });
    if (filtered.length >= quantity) break;

    // With a date range, older posts fall outside the window and stop
    // counting toward `filtered` even though `collected` keeps growing — so
    // use the raw collected count (not filtered) to detect "stuck" scrolling,
    // otherwise a long run of out-of-range posts looks like the feed ended.
    const progressCount = dateRange ? collected.length : filtered.length;
    if (progressCount === lastCount) {
      stuckCycles++;
      if (stuckCycles >= 4) break;
    } else {
      stuckCycles = 0;
    }
    lastCount = progressCount;

    // Oldest-first collection with a date range: once we're scrolling past
    // posts older than the window's lower bound, nothing further down the
    // feed can match (Instagram profiles are reverse-chronological) — stop.
    if (dateRange && collected.length > 0) {
      const oldestSeenMs = Math.min(...collected.map((c) => (c.taken_at || 0) * 1000).filter(Boolean));
      if (oldestSeenMs && oldestSeenMs < dateRange.fromMs) break;
    }

    window.scrollBy(0, window.innerHeight * 2);
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("[FeedFilter] apiPostData keys:", Object.keys(apiPostData).length, Object.keys(apiPostData).slice(0,3));
  console.log("[FeedFilter] collected total:", collected.length, "sample:", collected.slice(0,2));

  // Phase 2: filter + sort metadata
  // Sort BEFORE slicing — otherwise the top-N by scroll order would be
  // truncated before ranking, and posts with the highest views/likes further
  // down the feed would never make it into the result.
  let toRender = collected.filter((c) => {
    if (contentType !== "all" && (c.mediaType === 2 ? "reels" : "posts") !== contentType) return false;
    if (dateRange) {
      const ms = (c.taken_at || 0) * 1000;
      if (ms < dateRange.fromMs || ms > dateRange.toMs) return false;
    }
    return true;
  });

  // Outlier score: reels score on views, posts score on likes — same metric
  // split Sort Feed uses, since the two content types aren't comparable.
  if (sortBy === "outlier") {
    const reelsScored = FeedFilterOutlier.scoreItemsByOutlier(
      toRender.filter((c) => c.mediaType === 2), "views");
    const postsScored = FeedFilterOutlier.scoreItemsByOutlier(
      toRender.filter((c) => c.mediaType !== 2), "likes");
    toRender = [...reelsScored, ...postsScored];
  }

  resortItems(toRender, sortBy);

  toRender = toRender.slice(0, quantity);

  showProgressBanner(`Organizando 0/${toRender.length} — não role a tela`, { icon: "🧩", percent: 0, stoppable: false });

  // Phase 3: capture outerHTML for each tile (mirrors find_element_instagram_again_posts)
  // First scroll back to top so tiles are in DOM order
  window.scrollTo({ top: 0, behavior: "instant" });
  await new Promise((r) => setTimeout(r, 600));

  const withHTML = [];
  for (let i = 0; i < toRender.length; i++) {
    const item = toRender[i];
    showProgressBanner(`Organizando ${i}/${toRender.length} — não role a tela`, {
      icon: "🧩", percent: (i / toRender.length) * 100, stoppable: false,
    });
    const result = await collectTile(item.code);
    console.log(`[FeedFilter] tile ${item.code}:`, result ? `OK (${result.element?.length} chars)` : "NOT FOUND");
    withHTML.push({ ...item, ...(result || { element: null, userName: "" }) });
  }
  console.log("[FeedFilter] withHTML:", withHTML.length, "com elemento:", withHTML.filter(i => i.element).length);

  hideProgressBanner();

  // Phase 4: render sorted grid (mirrors rn() in Sort Feed content.js)
  const sortLabel = {
    likes: "mais curtidas", views: "mais views", comments: "mais comentários",
    newest: "mais recentes", oldest: "mais antigos", outlier: "outliers (fora da curva)",
  }[sortBy] || sortBy;

  const finalItems = withHTML.filter((i) => i.element);
  showToast(`✅ ${finalItems.length} posts ordenados por ${sortLabel}`, 3500);
  renderSortedGrid(finalItems, sortLabel, sortBy);

  // Persist batch list so popup can show it in "Baixar em Lote" tab
  const batchList = finalItems.map((i) => ({
    code:      i.code,
    pk:        i.pk ?? null,
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
  const items = codes ? list.filter(i => codes.includes(i.code)) : list;
  await batchDownloadItems(items);
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
