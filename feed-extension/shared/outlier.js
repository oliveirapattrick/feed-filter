// Outlier Score — "how many times above normal did this post perform?"
// Simplified, fully client-side port of Sort Feed's outlier engine: no
// server-side baseline cache, no background pool-mode scrolling — it scores
// whatever was already collected during a normal sort. Good enough to badge
// standout posts without the extra scroll/infra cost of the original.
//
// score = post's metric ÷ median metric of "qualifying" posts:
//   - not younger than 72h (metrics haven't matured yet)
//   - within the time window (auto-widens 90 → 180 → 365 days if too few)
//   - capped to the most recent 100 qualifying posts
// Needs at least 20 qualifying posts, else returns status "insufficient".

const FF_OUTLIER_MIN_AGE_MS = 72 * 60 * 60 * 1000;
const FF_OUTLIER_FLOOR = 20;
const FF_OUTLIER_CAP = 100;
const FF_OUTLIER_WINDOWS_DAYS = [90, 180, 365];

function ffOutlierQualifying(items, metricKey, windowDays) {
  const now = Date.now();
  const maxAgeMs = windowDays * 24 * 60 * 60 * 1000;
  return items.filter((it) => {
    const metricVal = it[metricKey];
    const dateMs = (it.taken_at || 0) * (it.taken_at > 1e12 ? 1 : 1000); // accept ms or s
    if (metricVal == null || !Number.isFinite(dateMs) || dateMs === 0) return false;
    const age = now - dateMs;
    return age >= FF_OUTLIER_MIN_AGE_MS && age <= maxAgeMs;
  });
}

function median(nums) {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// items: array of objects with at least { taken_at, [metricKey] }.
// metricKey: which field to score on ("views" for reels/TikTok, "likes" for IG posts).
// Returns { status: "ok", baseline } | { status: "insufficient" }.
function computeOutlierBaseline(items, metricKey) {
  for (const windowDays of FF_OUTLIER_WINDOWS_DAYS) {
    const qualifying = ffOutlierQualifying(items, metricKey, windowDays);
    if (qualifying.length >= FF_OUTLIER_FLOOR) {
      const capped = qualifying
        .sort((a, b) => (b.taken_at || 0) - (a.taken_at || 0))
        .slice(0, FF_OUTLIER_CAP);
      const baseline = median(capped.map((it) => it[metricKey]));
      return { status: "ok", baseline, windowDays, qualifyingCount: capped.length };
    }
  }
  return { status: "insufficient" };
}

// Mutates nothing — returns a new array with `outlierScore` attached to each
// item (null when baseline is insufficient or the item has no metric value).
function scoreItemsByOutlier(items, metricKey) {
  const { status, baseline } = computeOutlierBaseline(items, metricKey);
  if (status !== "ok" || !baseline) {
    return items.map((it) => ({ ...it, outlierScore: null }));
  }
  return items.map((it) => {
    const val = it[metricKey];
    const score = val != null ? val / baseline : null;
    return { ...it, outlierScore: score };
  });
}

window.FeedFilterOutlier = { computeOutlierBaseline, scoreItemsByOutlier, median };
