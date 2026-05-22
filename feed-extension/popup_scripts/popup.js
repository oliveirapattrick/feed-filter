const statusDot     = document.getElementById("statusDot");
const applyBtn      = document.getElementById("applyBtn");
const contentTypeEl = document.getElementById("contentType");
const sortByEl      = document.getElementById("sortBy");
const quantityEl    = document.getElementById("quantity");

// ─── App status ───────────────────────────────────────────────────────────────
chrome.runtime.sendMessage({ action: "checkStatus" }, (res) => {
  const online = res && res.running;
  statusDot.className = "status-dot " + (online ? "online" : "offline");
});

// ─── Load saved settings ──────────────────────────────────────────────────────
chrome.storage.local.get(["contentType", "sortBy", "quantity"], (data) => {
  if (data.contentType) contentTypeEl.value = data.contentType;
  if (data.sortBy)      sortByEl.value      = data.sortBy;
  if (data.quantity) {
    // Match select option by value
    const val = String(data.quantity);
    const opt = quantityEl.querySelector(`option[value="${val}"]`);
    if (opt) quantityEl.value = val;
  }
});

// ─── Apply filter ─────────────────────────────────────────────────────────────
applyBtn.addEventListener("click", () => {
  const config = {
    contentType: contentTypeEl.value,
    sortBy:      sortByEl.value,
    quantity:    parseInt(quantityEl.value, 10) || 50,
  };

  chrome.storage.local.set(config);
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

function loadBatchList() {
  chrome.storage.local.get("ffBatchList", (data) => {
    const list    = data.ffBatchList || [];
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
    countEl.textContent     = `${list.length} posts filtrados`;

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

      const icon  = item.mediaType === 2 ? "▶" : "🖼";
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

// Load on popup open
loadBatchList();

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
  chrome.storage.local.remove("ffBatchList", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "resetGrid" });
      }
    });
    window.close();
  });
});
