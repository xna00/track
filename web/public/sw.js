// @ts-check
/// <reference no-default-lib="false"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />
/// <reference types="./types" />

importScripts("https://cdn.jsdelivr.net/npm/jsstore@4.5.1/dist/jsstore.min.js");
importScripts(
  "https://cdn.jsdelivr.net/npm/jsstore@4.5.1/dist/jsstore.worker.min.js"
);

const CACHE_AMP = "CACHE_AMP";

const DB_NAME = "track";
const TABLE_NAME = "location";

(() => {
  // This is a little messy, but necessary to force type assertion
  // Same issue as in TS -> https://github.com/microsoft/TypeScript/issues/14877
  // prettier-ignore
  const self = /** @type {ServiceWorkerGlobalScope & { JsStore: import('jsstore') }} */ (/** @type {unknown} */ (globalThis.self));

  const fetchAndCache = async (/** @type {Request} */ request) => {
    const cache = await caches.open(CACHE_AMP);
    const res = await cache.match(request);
    if (res) {
      return res;
    } else {
      const res = await fetch(request);
      if (res.ok) {
        await cache.put(request, res.clone());
      }
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

  const connection = new self.JsStore.Connection();
  (async () => {
    await connection.initDb({
      name: DB_NAME,
      tables: [
        {
          name: TABLE_NAME,
          columns: {
            latitude: { dataType: "number" },
            longitude: { dataType: "number" },
            altitude: { dataType: "number" },
            speed: { dataType: "number" },
            accuracy: { dataType: "number" },
            verticalAccuracy: { dataType: "number" },
            speedAccuracy: { dataType: "number" },
            synced: { dataType: "boolean" },
            createdAt: { dataType: "string" },
          },
        },
      ],
    });
  })();

  const pushLocations = async () => {
    const cols = [
      "latitude",
      "longitude",
      "altitude",
      "speed",
      "accuracy",
      "verticalAccuracy",
      "speedAccuracy",
      "time",
    ];
    const ls = await connection.select({
      from: TABLE_NAME,
      where: {
        synced: 0,
      },
    });
    await fetch(
      "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values_append?insertDataOption=INSERT_ROWS",
      {
        method: "post",
        body: JSON.stringify({
          valueRange: {
            range: "db8dfc",
            values: ls.map((l) => cols.map((col) => l[col])),
          },
        }),
      }
    );
    await connection.update({
      in: TABLE_NAME,
      set: {
        synced: 1,
      },
      where: {
        synced: 0,
      },
    });
  };
  self.addEventListener("sync", (event) => {
    console.log(event);
    if (event.tag === "sync-locations") {
      event.waitUntil(pushLocations());
    }
  });
})();
