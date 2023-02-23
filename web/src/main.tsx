import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "uno.css";
import { fetchJSON } from "./util/fetchJSON";
import { cols, connection, TABLE_NAME } from "./util/db";

if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js");
}

window.pushLocations = async function (locations) {
  console.log(locations);
  await connection.insert({
    into: TABLE_NAME,
    values: (
      JSON.parse(locations) as Record<typeof cols[number], unknown>[]
    ).map((l) => ({ ...l, createdAt: l.time, synced: 0 })),
  });
  const registration = await navigator.serviceWorker.ready;
  try {
    await registration.sync.register("sync-locations");
  } catch {
    console.log("Background Sync could not be registered!");
  }
};

navigator.getBattery().then((battery) => {
  battery.addEventListener("chargingchange", async () => {
    if (!battery.charging) {
      return;
    }
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
    const res = await (
      await fetch(
        "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values_append?insertDataOption=INSERT_ROWS",
        {
          method: "post",
          body: JSON.stringify({
            valueRange: {
              range: "db8dfc",
              values: ls.map((l: any) => cols.map((col) => l[col])),
            },
          }),
        }
      )
    ).json();
    if (res.code === 0) {
      await connection.update({
        in: TABLE_NAME,
        set: {
          synced: 1,
        },
        where: {
          synced: 0,
        },
      });
    }
  });
});
// fetchJSON(
//   "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values/db8dfc"
// );

// window.pushLocations("[[1,2,3,4,5]]");
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
