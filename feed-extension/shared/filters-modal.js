// Filters modal — "Performance range" slider with a density curve, mirrors
// Sort Feed's post-sort Filters dialog. Filters already-captured items
// client-side (no new network calls): pick a metric, drag min/max, optionally
// narrow by date, and the grid re-renders with only the matching items.
//
// Shared between instagram.js and tiktok.js via window.FeedFilterFiltersModal.

function ffBuildHistogramPath(values, bucketCount = 24) {
  if (values.length === 0) return { path: "", min: 0, max: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { path: "", min, max };

  const buckets = new Array(bucketCount).fill(0);
  const span = max - min;
  for (const v of values) {
    let idx = Math.floor(((v - min) / span) * bucketCount);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx]++;
  }
  const peak = Math.max(...buckets) || 1;

  // Smooth the bar heights slightly (simple 3-point moving average) so the
  // curve reads like a density estimate rather than a jagged bar chart.
  const smoothed = buckets.map((_, i) => {
    const prev = buckets[i - 1] ?? buckets[i];
    const next = buckets[i + 1] ?? buckets[i];
    return (prev + buckets[i] * 2 + next) / 4;
  });
  const smoothPeak = Math.max(...smoothed) || 1;

  const w = 280, h = 48;
  const stepX = w / bucketCount;
  const points = smoothed.map((v, i) => {
    const x = i * stepX + stepX / 2;
    const y = h - (v / smoothPeak) * h;
    return [x, y];
  });

  let path = `M0,${h} L${points[0][0]},${points[0][1]} `;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    path += `Q${px + stepX / 2},${py} ${cx},${cy} `;
  }
  path += `L${w},${h} Z`;

  return { path, min, max, w, h };
}

// items: array of {taken_at, [metricKey]: number, ...}. Returns items whose
// metric AND date fall within the ranges (both optional).
function ffApplyRangeFilter(items, metricKey, min, max, dateRange) {
  return items.filter((it) => {
    const val = it[metricKey] ?? 0;
    if (val < min || val > max) return false;
    if (dateRange) {
      const ms = (it.taken_at || 0) * (it.taken_at > 1e12 ? 1 : 1000);
      if (ms < dateRange.fromMs || ms > dateRange.toMs) return false;
    }
    return true;
  });
}

// Opens the modal. `metrics`: array of [key, label] the user can pick as the
// range's basis (e.g. ["views","Views"], ["likes","Likes"], ["outlierScore","Outlier score"]).
// `onApply(filteredItems)` is called when the user confirms.
function openFiltersModal({ allItems, metrics, onApply }) {
  document.getElementById("ff-filters-overlay")?.remove();

  let activeMetric = metrics[0][0];
  let minVal, maxVal;
  let datoMode = "all"; // "all" | "last" | "between"
  let lastN = 0, lastUnit = "days";
  let betweenFrom = null, betweenTo = null;

  const overlay = document.createElement("div");
  overlay.id = "ff-filters-overlay";
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(3px);
    z-index:999999; display:flex; align-items:center; justify-content:center;
    font-family:sans-serif;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:#0a0a0f; border:1px solid #2a2a3a; border-radius:14px;
    width:380px; max-width:92vw; max-height:85vh; overflow-y:auto;
    box-shadow:0 24px 64px rgba(0,0,0,0.6); color:#e8e8f0;
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function valuesFor(metric) {
    return allItems.map((it) => it[metric] ?? 0).filter((v) => Number.isFinite(v));
  }

  function render() {
    const values = valuesFor(activeMetric);
    const hist = ffBuildHistogramPath(values);
    if (minVal == null) { minVal = hist.min; maxVal = hist.max; }

    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #2a2a3a;">
        <span style="font-weight:600;font-size:15px;">Filters</span>
        <button id="ff-filters-close" style="background:none;border:none;color:#666680;font-size:20px;cursor:pointer;">×</button>
      </div>
      <div style="padding:20px;">
        <div style="font-size:11px;color:#666680;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Performance range</div>
        <div style="display:flex;gap:6px;margin-bottom:14px;">
          ${metrics.map(([key, label]) => `
            <button data-metric="${key}" style="
              flex:1; padding:6px 8px; border-radius:6px; font-size:12px; cursor:pointer;
              background:${key === activeMetric ? "rgba(124,106,247,0.18)" : "#111118"};
              border:1px solid ${key === activeMetric ? "#7c6af7" : "#2a2a3a"};
              color:${key === activeMetric ? "#7c6af7" : "#e8e8f0"};
            ">${label}</button>
          `).join("")}
        </div>

        <svg width="100%" height="48" viewBox="0 0 280 48" preserveAspectRatio="none" style="display:block;margin-bottom:6px;">
          <path d="${hist.path}" fill="#7c6af7" opacity="0.35"></path>
        </svg>
        <input type="range" id="ff-filters-min" min="${hist.min}" max="${hist.max}" value="${minVal}" style="width:100%;accent-color:#7c6af7;">
        <input type="range" id="ff-filters-max" min="${hist.min}" max="${hist.max}" value="${maxVal}" style="width:100%;accent-color:#7c6af7;margin-top:-6px;">

        <div style="display:flex;gap:10px;margin:10px 0 18px;">
          <div style="flex:1;">
            <div style="font-size:10px;color:#666680;margin-bottom:4px;">Min</div>
            <input type="number" id="ff-filters-min-num" value="${Math.round(minVal)}" style="width:100%;background:#111118;border:1px solid #2a2a3a;border-radius:6px;color:#e8e8f0;padding:7px 8px;font-size:12px;">
          </div>
          <div style="flex:1;">
            <div style="font-size:10px;color:#666680;margin-bottom:4px;">Max</div>
            <input type="number" id="ff-filters-max-num" value="${Math.round(maxVal)}" style="width:100%;background:#111118;border:1px solid #2a2a3a;border-radius:6px;color:#e8e8f0;padding:7px 8px;font-size:12px;">
          </div>
        </div>

        <div style="font-size:11px;color:#666680;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Posted</div>
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          <button data-date-mode="all" style="flex:1;padding:6px 8px;border-radius:6px;font-size:12px;cursor:pointer;
            background:${datoMode === "all" ? "rgba(124,106,247,0.18)" : "#111118"};
            border:1px solid ${datoMode === "all" ? "#7c6af7" : "#2a2a3a"};
            color:${datoMode === "all" ? "#7c6af7" : "#e8e8f0"};">Qualquer data</button>
          <button data-date-mode="last" style="flex:1;padding:6px 8px;border-radius:6px;font-size:12px;cursor:pointer;
            background:${datoMode === "last" ? "rgba(124,106,247,0.18)" : "#111118"};
            border:1px solid ${datoMode === "last" ? "#7c6af7" : "#2a2a3a"};
            color:${datoMode === "last" ? "#7c6af7" : "#e8e8f0"};">In the last</button>
          <button data-date-mode="between" style="flex:1;padding:6px 8px;border-radius:6px;font-size:12px;cursor:pointer;
            background:${datoMode === "between" ? "rgba(124,106,247,0.18)" : "#111118"};
            border:1px solid ${datoMode === "between" ? "#7c6af7" : "#2a2a3a"};
            color:${datoMode === "between" ? "#7c6af7" : "#e8e8f0"};">Between</button>
        </div>

        ${datoMode === "last" ? `
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="number" id="ff-filters-last-n" value="${lastN || ""}" min="0" placeholder="0" style="flex:1;background:#111118;border:1px solid #2a2a3a;border-radius:6px;color:#e8e8f0;padding:7px 8px;font-size:12px;">
            <select id="ff-filters-last-unit" style="flex:1;background:#111118;border:1px solid #2a2a3a;border-radius:6px;color:#e8e8f0;padding:7px 8px;font-size:12px;">
              <option value="days"   ${lastUnit === "days"   ? "selected" : ""}>Days</option>
              <option value="weeks"  ${lastUnit === "weeks"  ? "selected" : ""}>Weeks</option>
              <option value="months" ${lastUnit === "months" ? "selected" : ""}>Months</option>
            </select>
          </div>
        ` : ""}
        ${datoMode === "between" ? `
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="date" id="ff-filters-from" value="${betweenFrom || ""}" style="flex:1;background:#111118;border:1px solid #2a2a3a;border-radius:6px;color:#e8e8f0;padding:7px 8px;font-size:12px;">
            <input type="date" id="ff-filters-to" value="${betweenTo || ""}" style="flex:1;background:#111118;border:1px solid #2a2a3a;border-radius:6px;color:#e8e8f0;padding:7px 8px;font-size:12px;">
          </div>
        ` : ""}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid #2a2a3a;">
        <button id="ff-filters-clear" style="background:none;border:none;color:#666680;font-size:12px;cursor:pointer;text-decoration:underline;">Clear all</button>
        <button id="ff-filters-apply" style="background:#7c6af7;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;">Show results</button>
      </div>
    `;

    modal.querySelector("#ff-filters-close").addEventListener("click", () => overlay.remove());

    modal.querySelectorAll("[data-metric]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeMetric = btn.dataset.metric;
        minVal = null; maxVal = null;
        render();
      });
    });

    modal.querySelectorAll("[data-date-mode]").forEach((btn) => {
      btn.addEventListener("click", () => { datoMode = btn.dataset.dateMode; render(); });
    });

    const minRange = modal.querySelector("#ff-filters-min");
    const maxRange = modal.querySelector("#ff-filters-max");
    const minNum = modal.querySelector("#ff-filters-min-num");
    const maxNum = modal.querySelector("#ff-filters-max-num");

    minRange.addEventListener("input", () => {
      minVal = Math.min(Number(minRange.value), maxVal);
      minNum.value = Math.round(minVal);
    });
    maxRange.addEventListener("input", () => {
      maxVal = Math.max(Number(maxRange.value), minVal);
      maxNum.value = Math.round(maxVal);
    });
    minNum.addEventListener("change", () => {
      minVal = Math.min(Number(minNum.value) || hist.min, maxVal);
      minRange.value = minVal;
    });
    maxNum.addEventListener("change", () => {
      maxVal = Math.max(Number(maxNum.value) || hist.max, minVal);
      maxRange.value = maxVal;
    });

    modal.querySelector("#ff-filters-last-n")?.addEventListener("change", (e) => { lastN = Number(e.target.value) || 0; });
    modal.querySelector("#ff-filters-last-unit")?.addEventListener("change", (e) => { lastUnit = e.target.value; });
    modal.querySelector("#ff-filters-from")?.addEventListener("change", (e) => { betweenFrom = e.target.value; });
    modal.querySelector("#ff-filters-to")?.addEventListener("change", (e) => { betweenTo = e.target.value; });

    modal.querySelector("#ff-filters-clear").addEventListener("click", () => {
      minVal = hist.min; maxVal = hist.max; datoMode = "all";
      render();
    });

    modal.querySelector("#ff-filters-apply").addEventListener("click", () => {
      let dateRange = null;
      if (datoMode === "last" && lastN > 0) {
        const unitMs = { days: 86400000, weeks: 7 * 86400000, months: 30 * 86400000 }[lastUnit];
        dateRange = { fromMs: Date.now() - lastN * unitMs, toMs: Date.now() };
      } else if (datoMode === "between" && (betweenFrom || betweenTo)) {
        dateRange = {
          fromMs: betweenFrom ? new Date(betweenFrom + "T00:00:00").getTime() : 0,
          toMs:   betweenTo   ? new Date(betweenTo   + "T23:59:59").getTime() : Date.now(),
        };
      }
      const filtered = ffApplyRangeFilter(allItems, activeMetric, minVal, maxVal, dateRange);
      overlay.remove();
      onApply(filtered);
    });
  }

  render();
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

window.FeedFilterFiltersModal = { openFiltersModal };
