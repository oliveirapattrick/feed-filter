(function () {
  if (window.__ffFetchHooked) return;
  window.__ffFetchHooked = true;

  const _fetch = window.fetch;

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : (input?.url || "");
    const isTarget = String(url).includes("/api/post/item_list");

    const res = await _fetch.apply(this, arguments);
    if (!isTarget) return res;

    try {
      const clone = res.clone();
      const text = await clone.text();
      if (!text.trim().startsWith("{")) return res;

      const data = JSON.parse(text);
      const rawItems = data?.itemList ?? data?.item_list ?? data?.aweme_list;
      if (!Array.isArray(rawItems) || rawItems.length === 0) return res;

      const items = rawItems.map((n) => ({
        id:        n?.id || "",
        userName:  n?.author?.uniqueId || "",
        views:     n?.stats?.playCount    ?? 0,
        likes:     n?.stats?.diggCount    ?? 0,
        comments:  n?.stats?.commentCount ?? 0,
        shares:    n?.stats?.shareCount   ?? 0,
        saves:     n?.stats?.collectCount ?? 0,
        taken_at:  n?.createTime ? n.createTime * 1000 : 0,
      })).filter((i) => i.id);

      if (items.length > 0) {
        window.postMessage({ ff_tt_items: items }, "*");
      }
    } catch (_) {}

    return res;
  };
})();
