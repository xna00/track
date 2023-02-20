// @ts-check
/// <reference no-default-lib="false"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

const CACHE_AMP = "CACHE_AMP";

(() => {
  // This is a little messy, but necessary to force type assertion
  // Same issue as in TS -> https://github.com/microsoft/TypeScript/issues/14877
  // prettier-ignore
  const self = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

  const fetchAndCache = async (/** @type {Request} */ request) => {
    const cache = await caches.open(CACHE_AMP);
    const res = await cache.match(request);
    if (res) {
      return res;
    } else {
      const res = await fetch(request);
      await cache.put(request, res.clone());
      return res;
    }
  };
  self.addEventListener("fetch", async (event) => {
    const { request } = event;
    if (
      /vdata.*\.amap\.com/.test(request.url) ||
      request.url.includes("webapi.amap.com/maps")
    ) {
      event.respondWith(fetchAndCache(request));
    }
  });

  self.addEventListener("install", () => {
    self.skipWaiting();
  });
})();
