import React from "react";
import { HashRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./Components/App";

const root = createRoot(document.querySelector("#root"));

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
