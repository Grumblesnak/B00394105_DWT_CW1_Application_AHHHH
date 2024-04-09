// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// const DATA = [
//   { id: "todo-0", name: "Paris", completed: true },
//   { id: "todo-1", name: "Berlin", completed: false },
//   { id: "todo-2", name: "London", completed: false },
// ];

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered!: Scope: ", registration.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
  });
}

const DATA = JSON.parse(localStorage.getItem("tasks")) || [];

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App locations={DATA} />);
