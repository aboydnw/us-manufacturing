import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/public-sans";
import "./styles.css";

if (import.meta.env.DEV) {
  import("./devFeedback")
    .then((module) => module.mountDevFeedback())
    .catch((error: unknown) =>
      console.warn("[devFeedback] recorder unavailable", error),
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
