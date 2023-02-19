import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "uno.css";

if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js");
}

const fetchJSON = async (
  input: RequestInfo | URL,
  init?: Omit<RequestInit, "body"> & { body?: any }
) => {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init?.headers,
    },
    body: init?.body ? JSON.stringify(init.body) : init?.body,
  });
  return await res.json();
};
window.pushLocations = async function (locations) {
  console.log(locations);
  // fetchJSON(
  //   "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values_append?insertDataOption=INSERT_ROWS",
  //   {
  //     method: "post",
  //     body: {
  //       valueRange: {
  //         range: "db8dfc",
  //         values: JSON.parse(locations),
  //       },
  //     },
  //   }
  // );
};

fetchJSON(
  "/api/proxylark/https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/shtcnSrIMt5ZL0YEoLP7ea27zqf/values/db8dfc"
);

// window.pushLocations("[[1,2,3,4,5]]");
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
