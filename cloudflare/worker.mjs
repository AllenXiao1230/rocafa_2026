const originHost = "rocafa-origin.studioxuan.qzz.io";

export default {
  fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const upstream = new URL(request.url);
    upstream.protocol = "https:";
    upstream.host = originHost;
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("cookie");
    headers.delete("authorization");

    return fetch(upstream, {
      method: request.method,
      headers,
      redirect: "manual",
    });
  },
};
