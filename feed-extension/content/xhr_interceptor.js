(function () {
  function normalizeProfilePost(n) {
    if (!n?.code) return null;
    return {
      code:      n.code,
      pk:        n.pk ?? null,
      likes:     n.like_count                 ?? 0,
      views:     n.play_count ?? n.view_count  ?? 0,
      comments:  n.comment_count               ?? 0,
      mediaType: n.media_type                  ?? 1,
      taken_at:  n.taken_at                    ?? 0,
    };
  }

  // Saved posts / a specific collection — flat REST shape, not GraphQL edges.
  // `items[].media` instead of `edges[].node`; view count lives on
  // `play_count` for reels rather than `view_count`.
  function parseSavedResponse(json) {
    const items = json?.items || [];
    const posts = [];
    for (const it of items) {
      const media = it?.media;
      if (!media?.code) continue;
      posts.push({
        code:      media.code,
        pk:        media.pk ?? null,
        likes:     media.like_count                    ?? 0,
        views:     media.play_count ?? media.view_count ?? 0,
        comments:  media.comment_count                  ?? 0,
        mediaType: media.media_type                     ?? 1,
        taken_at:  media.taken_at                       ?? 0,
      });
    }
    return posts;
  }

  // Explore/Search results — GraphQL SERP shape: edges → node.items[] (only
  // nodes typed XDTTopSerpMediaGridUnit / items typed XDTMediaDict are media).
  function parseSearchResponse(json) {
    const serp = json?.data?.xdt_fbsearch__top_serp_graphql;
    const edges = serp?.edges || [];
    const posts = [];
    for (const edge of edges) {
      if (edge?.node?.__typename !== "XDTTopSerpMediaGridUnit") continue;
      for (const item of edge.node.items || []) {
        if (item?.__typename !== "XDTMediaDict") continue;
        const p = normalizeProfilePost(item);
        if (p) posts.push(p);
      }
    }
    return posts;
  }

  function parseGraphqlResponse(json) {
    const posts = [];

    const postEdges =
      json?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges || [];
    for (const edge of postEdges) {
      const p = normalizeProfilePost(edge?.node);
      if (p) posts.push(p);
    }

    const reelEdges =
      json?.data?.xdt_api__v1__clips__user__connection_v2?.edges || [];
    for (const edge of reelEdges) {
      const n = edge?.node?.media ?? edge?.node;
      if (!n?.code) continue;
      posts.push({
        code:      n.code,
        pk:        n.pk ?? null,
        likes:     n.like_count                 ?? 0,
        views:     n.play_count ?? n.view_count  ?? 0,
        comments:  n.comment_count               ?? 0,
        // This edge is the Reels tab's own endpoint — every item here IS
        // a reel regardless of what media_type the node reports.
        mediaType: 2,
        taken_at:  n.taken_at                    ?? 0,
      });
    }

    posts.push(...parseSearchResponse(json));

    return posts;
  }

  function isSavedUrl(url) {
    return (
      url.includes("/api/v1/feed/saved/posts/") ||
      /\/api\/v1\/feed\/collection\/\d+\/posts\//.test(url)
    );
  }

  function handleResponseText(url, text) {
    try {
      const json = JSON.parse(text);
      let posts = [];
      if (isSavedUrl(url)) {
        posts = parseSavedResponse(json);
      } else if (url.includes("/graphql/query") || url.includes("/api/graphql")) {
        posts = parseGraphqlResponse(json);
      }
      if (posts.length > 0) {
        window.postMessage({ ff_api_posts: posts }, "*");
      }
    } catch (_) {}
  }

  // XHR hook — profile GraphQL calls (Posts/Reels tabs).
  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._ffUrl = url;
    return _open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      const url = this._ffUrl || "";
      if (!url.includes("/graphql/query") && !isSavedUrl(url)) return;
      if (this.responseType && this.responseType !== "text") return;
      handleResponseText(url, this.responseText);
    });
    return _send.apply(this, arguments);
  };

  // fetch hook — Saved (REST) and newer IG code paths (Search sometimes uses
  // fetch against /api/graphql instead of XHR against /graphql/query).
  const _fetch = window.fetch;
  window.fetch = function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0]?.url || "");
    const isTarget = isSavedUrl(url) || url.includes("/api/graphql");
    const promise = _fetch.apply(this, args);
    if (!isTarget) return promise;

    promise.then((res) => {
      try {
        res.clone().text().then((text) => handleResponseText(url, text)).catch(() => {});
      } catch (_) {}
    }).catch(() => {});

    return promise;
  };
})();
