(function () {
  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._ffUrl = url;
    return _open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      try {
        const url = this._ffUrl || "";
        if (!url.includes("/graphql/query")) return;
        if (this.responseType && this.responseType !== "text") return;
        const json = JSON.parse(this.responseText);

        const posts = [];

        const postEdges =
          json?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges || [];
        for (const edge of postEdges) {
          const n = edge?.node;
          if (!n?.code) continue;
          posts.push({
            code:      n.code,
            likes:     n.like_count    ?? 0,
            views:     n.view_count    ?? 0,
            comments:  n.comment_count ?? 0,
            mediaType: n.media_type    ?? 1,
            taken_at:  n.taken_at      ?? 0,
          });
        }

        const reelEdges =
          json?.data?.xdt_api__v1__clips__user__connection_v2?.edges || [];
        for (const edge of reelEdges) {
          const n = edge?.node?.media ?? edge?.node;
          if (!n?.code) continue;
          posts.push({
            code:      n.code,
            likes:     n.like_count                  ?? 0,
            views:     n.play_count ?? n.view_count  ?? 0,
            comments:  n.comment_count               ?? 0,
            mediaType: n.media_type                  ?? 2,
            taken_at:  n.taken_at                    ?? 0,
          });
        }

        if (posts.length > 0) {
          window.postMessage({ ff_api_posts: posts }, "*");
        }
      } catch (_) {}
    });
    return _send.apply(this, arguments);
  };
})();
