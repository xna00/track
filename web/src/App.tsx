import AMapLoader from "@amap/amap-jsapi-loader";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { assert } from "./util/assert";
import { connection, TABLE_NAME } from "./util/db";
import mapTools, { LngLatObj } from "./util/mapTools";
import {
  Route,
  Router,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import Home from "./components/Home";
import Config from "./components/Config";

window._AMapSecurityConfig = {
  securityJsCode: "1e352fde6c61dba536474a88c7993c80",
};

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter([
        { path: "/", element: <Home /> },
        { path: "/config", element: <Config /> },
      ])}
    />
  );
}

export default App;
