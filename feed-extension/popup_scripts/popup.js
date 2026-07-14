const statusDot      = document.getElementById("statusDot");
const applyBtn       = document.getElementById("applyBtn");
const contentTypeRow = document.getElementById("contentTypeRow");
const contentTypeEl  = document.getElementById("contentType");
const sortByEl       = document.getElementById("sortBy");
const quantityEl     = document.getElementById("quantity");
const quantityCustomEl = document.getElementById("quantityCustom");
const datePresetEl     = document.getElementById("datePreset");
const dateCustomRowEl  = document.getElementById("dateCustomRow");
const dateFromEl       = document.getElementById("dateFrom");
const dateToEl         = document.getElementById("dateTo");

quantityEl.addEventListener("change", () => {
  quantityCustomEl.style.display = quantityEl.value === "custom" ? "" : "none";
});

datePresetEl.addEventListener("change", () => {
  dateCustomRowEl.style.display = datePresetEl.value === "custom" ? "flex" : "none";
});

function resolveQuantity() {
  if (quantityEl.value === "custom") {
    const n = parseInt(quantityCustomEl.value, 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, 10000) : 50;
  }
  return parseInt(quantityEl.value, 10) || 50;
}

// Returns null (no date filter) or { fromMs, toMs }.
function resolveDateRange() {
  const preset = datePresetEl.value;
  if (preset === "all") return null;

  if (preset === "custom") {
    const fromMs = dateFromEl.value ? new Date(dateFromEl.value + "T00:00:00").getTime() : null;
    const toMs   = dateToEl.value   ? new Date(dateToEl.value   + "T23:59:59").getTime() : null;
    if (!fromMs && !toMs) return null;
    return { fromMs: fromMs || 0, toMs: toMs || Date.now() };
  }

  const days = parseInt(preset, 10);
  if (!Number.isFinite(days)) return null;
  return { fromMs: Date.now() - days * 86400000, toMs: Date.now() };
}

const SORT_OPTIONS = {
  instagram: [
    ["likes", "Mais curtidas"], ["views", "Mais views"], ["comments", "Mais comentários"],
    ["newest", "Mais recentes"], ["oldest", "Mais antigos"],
    ["outlier", "⚡ Outlier (fora da curva)"],
  ],
  tiktok: [
    ["views", "Mais views"], ["likes", "Mais curtidas"], ["comments", "Mais comentários"],
    ["shares", "Mais compartilhados"], ["saves", "Mais salvos"],
    ["newest", "Mais recentes"], ["oldest", "Mais antigos"],
    ["outlier", "⚡ Outlier (fora da curva)"],
  ],
};

let currentPlatform = "instagram";

function detectPlatform(url) {
  if (!url) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  return "instagram";
}

function applyPlatformUI(platform) {
  currentPlatform = platform;
  contentTypeRow.style.display = platform === "tiktok" ? "none" : "";

  const opts = SORT_OPTIONS[platform] || SORT_OPTIONS.instagram;
  const previousValue = sortByEl.value;
  sortByEl.innerHTML = opts.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  if (opts.some(([value]) => value === previousValue)) sortByEl.value = previousValue;
}

// ─── App status ───────────────────────────────────────────────────────────────
chrome.runtime.sendMessage({ action: "checkStatus" }, (res) => {
  const online = res && res.running;
  statusDot.className = "status-dot " + (online ? "online" : "offline");
});

// ─── Detect platform + load saved settings ─────────────────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  applyPlatformUI(detectPlatform(tabs[0]?.url));

  chrome.storage.local.get(["contentType", "sortBy", "quantity"], (data) => {
    if (data.contentType) contentTypeEl.value = data.contentType;
    if (data.sortBy && [...sortByEl.options].some(o => o.value === data.sortBy)) {
      sortByEl.value = data.sortBy;
    }
    if (data.quantity) {
      const val = String(data.quantity);
      const opt = quantityEl.querySelector(`option[value="${val}"]`);
      if (opt) {
        quantityEl.value = val;
      } else {
        quantityEl.value = "custom";
        quantityCustomEl.value = val;
        quantityCustomEl.style.display = "";
      }
    }
  });

  loadBatchList();
});

// ─── Apply filter ─────────────────────────────────────────────────────────────
applyBtn.addEventListener("click", () => {
  const config = {
    contentType: contentTypeEl.value,
    sortBy:      sortByEl.value,
    quantity:    resolveQuantity(),
    dateRange:   resolveDateRange(),
  };

  chrome.storage.local.set({ contentType: config.contentType, sortBy: config.sortBy, quantity: config.quantity });
  applyBtn.disabled = true;
  applyBtn.textContent = "Aplicando...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "applyFilters", config }, () => {
        window.close();
      });
    } else {
      window.close();
    }
  });
});

// ─── Batch section — load automatically on open ───────────────────────────────

function batchListKey() {
  return currentPlatform === "tiktok" ? "ffTikTokBatchList" : "ffBatchList";
}

function loadBatchList() {
  chrome.storage.local.get(batchListKey(), (data) => {
    const list      = data[batchListKey()] || [];
    const emptyEl   = document.getElementById("batch-empty");
    const contentEl = document.getElementById("batch-content");
    const listEl    = document.getElementById("batch-list");
    const countEl   = document.getElementById("batch-count");

    if (list.length === 0) {
      emptyEl.style.display   = "";
      contentEl.style.display = "none";
      return;
    }

    emptyEl.style.display   = "none";
    contentEl.style.display = "flex";
    countEl.textContent     = `${list.length} ${currentPlatform === "tiktok" ? "vídeos" : "posts"} filtrados`;

    listEl.innerHTML = "";
    list.forEach((item) => {
      const row = document.createElement("label");
      row.style.cssText = "display:flex;align-items:center;gap:8px;font-size:12px;color:#ccc;cursor:pointer;padding:2px 0;";

      const cb = document.createElement("input");
      cb.type    = "checkbox";
      cb.checked = true;
      cb.dataset.code  = item.code;
      cb.style.cursor  = "pointer";
      cb.style.accentColor = "#7c6af7";

      const icon  = currentPlatform === "tiktok" ? "▶" : (item.mediaType === 2 ? "▶" : "🖼");
      const label = document.createElement("span");
      label.textContent    = `${icon} ${item.userName} — ${item.code}`;
      label.style.overflow     = "hidden";
      label.style.textOverflow = "ellipsis";
      label.style.whiteSpace   = "nowrap";

      row.appendChild(cb);
      row.appendChild(label);
      listEl.appendChild(row);
    });
  });
}

// ─── Select all toggle ────────────────────────────────────────────────────────
document.getElementById("batch-select-all").addEventListener("change", (e) => {
  document.querySelectorAll("#batch-list input[type=checkbox]").forEach((cb) => {
    cb.checked = e.target.checked;
  });
});

// ─── Batch download ───────────────────────────────────────────────────────────
function getSelectedCodes() {
  return Array.from(document.querySelectorAll("#batch-list input[type=checkbox]:checked"))
    .map((cb) => cb.dataset.code);
}

function sendBatchAction(action) {
  const codes = getSelectedCodes();
  if (codes.length === 0) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action, codes });
      window.close();
    }
  });
}

document.getElementById("batchDownloadBtn").addEventListener("click", () => {
  sendBatchAction("batchDownload");
});

// ─── Clear filtered list ──────────────────────────────────────────────────────
document.getElementById("clearListBtn").addEventListener("click", () => {
  chrome.storage.local.remove(batchListKey(), () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "resetGrid" });
      }
    });
    window.close();
  });
});
