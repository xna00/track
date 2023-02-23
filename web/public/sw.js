// @ts-check
/// <reference no-default-lib="false"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />
/// <reference types="./types" />

const CACHE_AMP = "CACHE_AMP";

(() => {
  // This is a little messy, but necessary to force type assertion
  // Same issue as in TS -> https://github.com/microsoft/TypeScript/issues/14877
  // prettier-ignore
  const self = /** @type {ServiceWorkerGlobalScope & { JsStore: import('jsstore') }} */ (/** @type {unknown} */ (globalThis.self));

  const fetchAndCache = async (/** @type {Request} */ request) => {
    const res = await fetch(request);
    if (res.ok || res.status === 0) {
      const cache = await caches.open(CACHE_AMP);
      await cache.put(request, res.clone());
    }
    return res;
  };
  const useCacheOrFetch = async (/** @type {Request} */ request) => {
    const cache = await caches.open(CACHE_AMP);
    const res = await cache.match(request);
    const url = new URL(request.url);
    if (!res) {
      return fetchAndCache(request);
    } else if (url.origin === self.origin && url.pathname === "/") {
      fetchAndCache(request);
      return res;
    } else {
      return res;
    }
  };
  self.addEventListener("fetch", async (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (url.pathname === "/v3/log/init") {
      event.respondWith(new Response());
      return;
    }
    if (
      !(url.origin === self.origin && url.pathname.startsWith("/api/")) &&
      !url.hostname.includes("localhost")
    ) {
      event.respondWith(useCacheOrFetch(request));
    }
  });

  self.addEventListener("install", () => {
    self.skipWaiting();
  });
})();
