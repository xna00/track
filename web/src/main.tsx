import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "uno.css";
import { fetchJSON } from "./util/fetchJSON";
import {
  cols,
  connection,
  Position,
  positionToRow,
  TABLE_NAME,
} from "./util/db";

if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js");
}

window.pushLocations = async function (locations) {
  console.log(locations);
  await connection.insert({
    into: TABLE_NAME,
    values: (JSON.parse(locations) as Omit<Position, "synced">[]).map((l) => ({
      ...l,
      synced: 0,
    })),
  });
};

navigator.getBattery().then((battery) => {
  battery.addEventListener("chargingchange", async () => {
    if (!battery.charging) {
      return;
    }
    const ls = (await connection.select({
      from: TABLE_NAME,
      where: {
        synced: 0,
      },
    })) as Position[];
    if (!ls.length) {
      console.log("nothing to push");
      return;
    }
    const res = await (
      await fetch(
        "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values_append?insertDataOption=INSERT_ROWS",
        {
          method: "post",
          body: JSON.stringify({
            valueRange: {
              range: "db8dfc",
              values: ls.map((p) => positionToRow(p)),
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
